#!/usr/bin/env bash
# local-ci.sh — runs the project's whole gate locally, in a clean worktree
# at one commit, and signs that commit off on GitHub so `main` accepts it.
#
#   scripts/local-ci.sh [--post] [--context NAME] [REF]     (REF defaults to HEAD)
#
# What it does:
#   1. resolves REF to a sha and checks it out detached in a fresh worktree
#      (uncommitted changes in your tree never reach the gate);
#   2. if --post: posts a `pending` status on the sha;
#   3. runs $GATE_CMD there (the doctrine's gate: lint, tests, builds,
#      structure check, journeys), logging to $LOCAL_CI_DIR/<sha>.log;
#   4. if --post: posts `success` or `failure` on the sha through the commit
#      status API:  gh api repos/:owner/:repo/statuses/<sha>
#   5. exits with the gate's code.
# A tree that already passed the same gate command (same
# `git rev-parse <sha>^{tree}`) is not run again: its record in
# $LOCAL_CI_DIR/passed/ is reused and re-posted.
#
# Environment:
#   GATE_CMD       the gate command, run from the worktree root (default: make ci)
#   LOCAL_CI_DIR   logs and records (default: ~/.cache/local-ci/<repo name>)
#   SIGNOFF_CONTEXT  the status context (default: local-ci); --context overrides
#
# Two contexts: the execute queue posts `local-ci/affected` on each merge
# (--context local-ci/affected, with the affected gate as GATE_CMD); the
# whole gate at the end of the stage posts `local-ci`. `main` requires
# `local-ci` only, so no intermediate head satisfies it.
#
# ---------------------------------------------------------------------------
# BRANCH PROTECTION — the note that makes the signoff count
#
# The status is only a claim until `main` requires it. Require the context
# on the branch (a classic protection rule shown; a ruleset works the same):
#
#   gh api -X PUT repos/:owner/:repo/branches/main/protection --input - <<'JSON'
#   {"required_status_checks": {"strict": true, "contexts": ["local-ci"]},
#    "enforce_admins": true, "required_pull_request_reviews": null,
#    "restrictions": null}
#   JSON
#
# That PUT replaces the whole protection of the branch: read the current one
# first (gh api repos/:owner/:repo/branches/main/protection) and merge.
#
# Who can post the status decides how strong it is. Anyone with write access
# can post a `success` on any sha. The strongest setup: run this script on one
# host (the merge queue), post with a GitHub App's installation token that no
# agent shell can read, and pin the required check to that app
# ("checks": [{"context": "local-ci", "app_id": <id>}]). The settings template
# denies `gh api *statuses*` to the agents, so the only way they sign off is
# through this script, which runs the gate first.
#
# Hosted CI keeps the deploy and a cheap trust check (lint, generated code
# unchanged); the full gate stops running there.
# ---------------------------------------------------------------------------
set -euo pipefail

post=0
context=${SIGNOFF_CONTEXT:-local-ci}
ref=HEAD
while [ $# -gt 0 ]; do
  case "$1" in
    --post) post=1; shift ;;
    --context) context=$2; shift 2 ;;
    -h|--help) sed -n '2,20p' "$0"; exit 0 ;;
    *) ref=$1; shift ;;
  esac
done

repo_root=$(git rev-parse --show-toplevel)
sha=$(git rev-parse --verify "$ref^{commit}")
tree=$(git rev-parse "$sha^{tree}")
gate=${GATE_CMD:-make ci}
dir=${LOCAL_CI_DIR:-$HOME/.cache/local-ci/$(basename "$repo_root")}
mkdir -p "$dir/passed"
log=$dir/$sha.log
record=$dir/passed/$tree-$(printf '%s' "$gate" | sha1sum | cut -c1-8)

status() { # state description
  [ "$post" -eq 1 ] || return 0
  gh api "repos/:owner/:repo/statuses/$sha" \
    -f state="$1" -f context="$context" -f description="$2" >/dev/null
}

if [ "$post" -eq 1 ] && [ -z "$(git branch -r --contains "$sha" 2>/dev/null)" ]; then
  echo "local-ci: $sha is not on any remote branch; push it first, or the status has nowhere to land" >&2
  exit 2
fi

if [ -f "$record" ]; then
  echo "local-ci: tree ${tree:0:12} already passed ($(cat "$record"))"
  status success "$gate · tree ${tree:0:12} · cached"
  exit 0
fi

wt=$(mktemp -d "${TMPDIR:-/tmp}/local-ci.XXXXXX")
cleanup() { git -C "$repo_root" worktree remove --force "$wt" >/dev/null 2>&1 || rm -rf "$wt"; git -C "$repo_root" worktree prune; }
trap cleanup EXIT
git -C "$repo_root" worktree add --quiet --detach "$wt" "$sha"

status pending "$gate · running"
echo "local-ci: $gate at ${sha:0:12} (log: $log)"
start=$(date +%s)
set +e
(cd "$wt" && bash -c "$gate") >"$log" 2>&1
rc=$?
set -e
secs=$(( $(date +%s) - start ))

if [ "$rc" -eq 0 ]; then
  printf 'sha=%s secs=%s host=%s at=%s\n' "$sha" "$secs" "$(hostname)" "$(date -u +%FT%TZ)" >"$record"
  status success "$gate · ${secs}s · tree ${tree:0:12}"
  echo "local-ci: PASS in ${secs}s"
else
  status failure "$gate · exit $rc · ${secs}s"
  echo "local-ci: FAIL (exit $rc) in ${secs}s; last lines:" >&2
  tail -n 30 "$log" >&2
fi
exit "$rc"
