#!/usr/bin/env bash
# local-ci.sh — the whole gate on our own compute, and the only writer of the `local-ci` commit status.
#
#   local-ci.sh [--repo <dir>] [--ref <ref>] [--gate "<command>"] [--context <name>] [--dry-run] [--record <dir>]
#   local-ci.sh --post-from <branch> [--repo <dir>] [--ref <ref>] [--gate "<command>"] [--context <name>] [--dry-run]
#
# Runs the project's whole gate once, in a fresh worktree detached at <ref>, and posts
# <context> = success on that sha under the bot identity, only when the gate exits 0.
# A red gate posts nothing. A tree already verified green is not run again.
# --record writes <dir>/local-ci.json (sha, gate, rc, secs, host) and the log beside it:
#   a cloud session VM runs the gate with --dry-run --record and pushes <dir> to a branch.
# --post-from runs no gate: it reads local-ci.json at the tip of origin/<branch> and posts
#   only when the record names this sha, this gate and rc 0. A VM cannot post as the bot:
#   the cloud's GitHub proxy signs every call as the account connected to claude.ai.
#
# Env: LOCAL_CI_GATE (default "make verify") · LOCAL_CI_DOWN (default "make down", best effort)
#      LOCAL_CI_TOKEN_FILE (default ~/.config/local-ci/token: the bot's fine-grained token)
#      LOCAL_CI_STATE (default ~/.local/state/local-ci: logs and verified trees)
# Exit: 0 green and posted (or --dry-run) · 1 gate red, or a record that does not hold · 2 bad call · 3 green, not posted
set -uo pipefail

repo=. ref=HEAD context=local-ci dry=0 record_dir= post_from=
gate=${LOCAL_CI_GATE:-make verify}
down=${LOCAL_CI_DOWN:-make down}
token_file=${LOCAL_CI_TOKEN_FILE:-$HOME/.config/local-ci/token}
state=${LOCAL_CI_STATE:-$HOME/.local/state/local-ci}

die() { echo "local-ci: $*" >&2; exit 2; }
while [ $# -gt 0 ]; do
  case $1 in
    --repo) repo=$2; shift 2 ;;
    --ref) ref=$2; shift 2 ;;
    --gate) gate=$2; shift 2 ;;
    --context) context=$2; shift 2 ;;
    --dry-run) dry=1; shift ;;
    --record) record_dir=$2; shift 2 ;;
    --post-from) post_from=$2; shift 2 ;;
    -h|--help) sed -n '2,21p' "$0"; exit 0 ;;
    *) die "unknown argument $1" ;;
  esac
done

case $record_dir in ''|/*) ;; *) record_dir=$PWD/$record_dir ;; esac
[ -z "$record_dir$post_from" ] || command -v jq >/dev/null || die "--record and --post-from need jq"
cd "$repo" 2>/dev/null || die "no repo at $repo"
sha=$(git rev-parse --verify --quiet "$ref^{commit}") || die "no commit at $ref"
tree=$(git rev-parse "$sha^{tree}")
# GitHub refuses a status on a sha it does not have.
[ -n "$(git branch -r --contains "$sha" 2>/dev/null)" ] || die "$sha is on no remote branch: push it first"

mkdir -p "$state/logs" "$state/passed"
log="$state/logs/$sha.log"
record="$state/passed/$tree"

post() {
  local desc="$1"
  if [ "$dry" = 1 ]; then echo "local-ci: dry run, would post $context=success on $sha ($desc)"; return 0; fi
  [ -s "$token_file" ] || { echo "local-ci: green, but no bot token at $token_file: not posted"; return 3; }
  GH_TOKEN=$(cat "$token_file") timeout 20 gh api "repos/{owner}/{repo}/statuses/$sha" \
    -f state=success -f context="$context" -f description="$desc" >/dev/null \
    || { echo "local-ci: green, but the status post failed: not posted"; return 3; }
  echo "local-ci: $context=success posted on $sha"
}

if [ -n "$post_from" ]; then
  git fetch --quiet origin "+refs/heads/$post_from:refs/remotes/origin/$post_from" 2>/dev/null || die "no branch $post_from on origin"
  result=$(git show "refs/remotes/origin/$post_from:local-ci.json" 2>/dev/null) || die "$post_from has no local-ci.json at its tip"
  verdict=$(jq -r --arg sha "$sha" --arg gate "$gate" '
    if .sha != $sha then "it is for \(.sha), not \($sha)"
    elif .gate != $gate then "it ran \(.gate), not \($gate)"
    elif .rc != 0 then "the gate exited \(.rc)"
    else "green" end' <<<"$result")
  [ "$verdict" = green ] || { echo "local-ci: the record on $post_from does not hold: $verdict; nothing posted"; exit 1; }
  post "$gate · $(jq -r .secs <<<"$result")s on $(jq -r .host <<<"$result") · record $post_from@$(git rev-parse --short=8 "refs/remotes/origin/$post_from")"
  exit $?
fi

write_record() { # rc secs log
  [ -n "$record_dir" ] || return 0
  mkdir -p "$record_dir"
  jq -nc --arg sha "$sha" --arg gate "$gate" --argjson rc "$1" --argjson secs "$2" --arg host "$(hostname)" \
    '{sha: $sha, gate: $gate, rc: $rc, secs: $secs, host: $host}' >"$record_dir/local-ci.json"
  [ ! -f "$3" ] || cp "$3" "$record_dir/gate.log"
  echo "local-ci: recorded in $record_dir/local-ci.json"
}

if [ -f "$record" ]; then
  echo "local-ci: tree ${tree:0:12} already verified green ($(cut -d' ' -f1-3 "$record"))"
  write_record 0 0 ""
  post "$gate · tree ${tree:0:12} (verified before)"; exit $?
fi

wt=$(mktemp -d "${TMPDIR:-/tmp}/local-ci-XXXXXX")
cleanup() { (cd "$wt" 2>/dev/null && $down >/dev/null 2>&1); git worktree remove --force "$wt" >/dev/null 2>&1; rm -rf "$wt"; }
trap cleanup EXIT
git worktree add --quiet --detach "$wt" "$sha" || die "cannot create a worktree at $sha"

echo "local-ci: $gate on $sha in $wt (log: $log)"
start=$SECONDS
(cd "$wt" && bash -c "$gate") >"$log" 2>&1
rc=$?
secs=$((SECONDS - start))

write_record "$rc" "$secs" "$log"
if [ $rc -ne 0 ]; then
  echo "local-ci: RED (exit $rc, ${secs}s); nothing posted. Last lines of $log:"
  tail -n 40 "$log" | sed 's/^/  /'
  exit 1
fi

printf 'sha=%s rc=0 secs=%s gate=%q host=%s log=%s\n' "$sha" "$secs" "$gate" "$(hostname)" "$(sha256sum "$log" | cut -c1-16)" >"$record"
echo "local-ci: green in ${secs}s"
post "$gate · ${secs}s · tree ${tree:0:12}"
exit $?
