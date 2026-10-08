#!/usr/bin/env bash
# authorize.sh: the user's authorization for one front to reach main and
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
#
# The line dies at its tag (the guard marks it used) or in 3 days
# (AUTHORIZE_DAYS overrides). Each run drops the lines that have expired.
# The file: $GUARD_ALLOW_FILE, default irreversible.allow next to this script.
set -euo pipefail

usage() { sed -n '7,12p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2; }
[ $# -eq 3 ] || usage
route=$1 who=$2 target=$3
file=${GUARD_ALLOW_FILE:-$(cd "$(dirname "$0")" && pwd)/irreversible.allow}
days=${AUTHORIZE_DAYS:-3}

case "$route" in
  release) [[ $target == ?*@??????* ]] || { echo "release needs <branch>@<sha> (the head he said ok to)" >&2; exit 2; }
           slug=$who extra='tag=1' ;;
  short|hotfix) [[ $target != *@* ]] || { echo "$route names the branch only" >&2; exit 2; }
           slug=$who extra='tag=1' ;;
  legacy)  slug=$(printf '%s' "$target" | tr '/' '-') extra="tag=0 repo=$who" ;;
  *) usage ;;
esac
[[ $slug =~ ^[A-Za-z0-9._/-]+$ ]] || { echo "the slug has characters the guard will not read: $slug" >&2; exit 2; }

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
printf 'auth %s %s merge=%s %s until=%s\n' "$route" "$slug" "$target" "$extra" "$until" >>"$tmp"
mv "$tmp" "$file"
echo "authorized: $route $slug merge=$target $extra until $until"
