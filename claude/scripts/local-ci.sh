#!/usr/bin/env bash
# local-ci.sh — the whole gate on our own compute, and the only writer of the `local-ci` commit status.
#
#   local-ci.sh [--repo <dir>] [--ref <ref>] [--gate "<command>"] [--context <name>] [--dry-run]
#
# Runs the project's whole gate once, in a fresh worktree detached at <ref>, and posts
# <context> = success on that sha under the bot identity, only when the gate exits 0.
# A red gate posts nothing. A tree already verified green is not run again.
#
# Env: LOCAL_CI_GATE (default "make verify") · LOCAL_CI_DOWN (default "make down", best effort)
#      LOCAL_CI_TOKEN_FILE (default ~/.config/local-ci/token: the bot's fine-grained token)
#      LOCAL_CI_STATE (default ~/.local/state/local-ci: logs and verified trees)
# Exit: 0 green and posted (or --dry-run) · 1 gate red · 2 bad call · 3 green, not posted
set -uo pipefail

repo=. ref=HEAD context=local-ci dry=0
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
    -h|--help) sed -n '2,15p' "$0"; exit 0 ;;
    *) die "unknown argument $1" ;;
  esac
done

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

if [ -f "$record" ]; then
  echo "local-ci: tree ${tree:0:12} already verified green ($(cut -d' ' -f1-3 "$record"))"
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

if [ $rc -ne 0 ]; then
  echo "local-ci: RED (exit $rc, ${secs}s); nothing posted. Last lines of $log:"
  tail -n 40 "$log" | sed 's/^/  /'
  exit 1
fi

printf 'sha=%s rc=0 secs=%s gate=%q host=%s log=%s\n' "$sha" "$secs" "$gate" "$(hostname)" "$(sha256sum "$log" | cut -c1-16)" >"$record"
echo "local-ci: green in ${secs}s"
post "$gate · ${secs}s · tree ${tree:0:12}"
exit $?
