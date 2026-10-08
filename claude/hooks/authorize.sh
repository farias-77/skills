#!/usr/bin/env bash
# authorize.sh: the user's authorization for one workstream to reach main and
# production. Only the user runs it, as a `!` command in the session (the
# guard denies it to agents). It writes one `auth` line into the guard's
# allow file; guard-irreversible.sh reads it.
#
#   authorize.sh release <slug> <branch>@<sha>   merge <branch> at a head that is or
#                                                descends from <sha>, its fix/<slug>/*
#                                                branches, and one v* tag
#   authorize.sh short   <slug> <branch>         merge <branch>, and one v* tag
#   authorize.sh hotfix  <slug> <branch>         merge <branch> and a revert/* PR, one v* tag
#   authorize.sh legacy  <repo> <branch>         merge <branch> into <repo>'s main; no tag
#   authorize.sh tag     <slug> <ref>@<sha>      no merge: one v* tag on exactly <sha>
#                                                (full, or a prefix of 7+ resolved in
#                                                the repo it runs in)
#
# The line dies at its tag (the guard marks it used) or in 3 days
# (AUTHORIZE_DAYS overrides). Each run drops the lines that have expired.
# The file: $GUARD_ALLOW_FILE, default irreversible.allow in this script's
# own directory (symlinks followed), the one the guard beside it reads.
set -euo pipefail

usage() { sed -n '7,15p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2; }
die() { echo "$1" >&2; exit 2; }
script_dir() {
  local f=$1 d
  while [ -L "$f" ]; do
    d=$(cd -P "$(dirname "$f")" && pwd)
    f=$(readlink "$f"); case "$f" in /*) ;; *) f=$d/$f ;; esac
  done
  cd -P "$(dirname "$f")" && pwd
}
[ $# -eq 3 ] || usage
route=$1 who=$2 target=$3
file=${GUARD_ALLOW_FILE:-$(script_dir "$0")/irreversible.allow}
days=${AUTHORIZE_DAYS:-3}

slug=$who
case "$route" in
  release) [[ $target == ?*@??????* ]] || die "release needs <branch>@<sha> (the head he said ok to)"
           fields="merge=$target tag=1" ;;
  short|hotfix) [[ $target != *@* ]] || die "$route names the branch only"
           fields="merge=$target tag=1" ;;
  legacy)  slug=$(printf '%s' "$target" | tr '/' '-') fields="merge=$target tag=0 repo=$who" ;;
  tag)     [[ $target =~ ^([^@[:space:]]+)@([0-9a-fA-F]{7,40})$ ]] || die "tag needs <ref>@<sha> (the commit the tag points at, 7+ hex)"
           ref=${BASH_REMATCH[1]} sha=$(printf '%s' "${BASH_REMATCH[2]}" | tr 'A-F' 'a-f')
           full=$(git rev-parse -q --verify "$sha^{commit}" 2>/dev/null) || full=''
           if [ -z "$full" ]; then
             [ ${#sha} -eq 40 ] || die "$sha is not a commit of the repo this runs in; give the full 40-character sha, or run it from the repo"
             full=$sha
           fi
           fields="ref=$ref merged=$full tag=1" ;;
  *) usage ;;
esac
[[ $slug =~ ^[A-Za-z0-9._/-]+$ ]] || die "the slug has characters the guard will not read: $slug"

until=$(date -u -d "+$days days" +%Y-%m-%dT%H:%MZ)
now=$(date -u +%s)
touch "$file"
tmp=$(mktemp "$file.XXXXXX")
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in
    auth\ *)
      u=$(printf '%s' "$line" | sed -nE 's/.*until=([^ ]+).*/\1/p')
      t=$(date -u -d "$u" +%s 2>/dev/null || echo 0)
      [ "$t" -gt "$now" ] || continue ;;
  esac
  printf '%s\n' "$line"
done <"$file" >"$tmp"
printf 'auth %s %s %s until=%s\n' "$route" "$slug" "$fields" "$until" >>"$tmp"
mv "$tmp" "$file"
echo "authorized: $route $slug $fields until $until (in $file)"
