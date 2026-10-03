#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: local-ci.sh [--post] [--context NAME] [REF]" >&2
  echo "  runs GATE_CMD (default: make ci) in a clean worktree at REF (default: HEAD)" >&2
  echo "  --post      signs REF off through the commit status API under NAME (default: local-ci)" >&2
  echo "  SELECT_CMD  prints the affected selection against LOCAL_CI_BASE (default: origin/main);" >&2
  echo "              an empty selection on a non-empty diff runs FULL_GATE_CMD (default: make ci) instead" >&2
  echo "  STACK_DOWN_CMD  run in the worktree on exit, before it is removed (default: make stack-down)" >&2
  echo "  LOCAL_CI_DIR    logs and passed records (default: ~/.cache/local-ci/<repo>-<hash of its git common dir>)" >&2
  exit "${1:-2}"
}

post=0
context=${SIGNOFF_CONTEXT:-local-ci}
ref=HEAD
while [ $# -gt 0 ]; do
  case "$1" in
    --post) post=1; shift ;;
    --context) [ $# -ge 2 ] || usage; context=$2; shift 2 ;;
    -h|--help) usage 0 ;;
    -*) usage ;;
    *) ref=$1; shift ;;
  esac
done

repo_root=$(git rev-parse --show-toplevel)
common=$(git rev-parse --path-format=absolute --git-common-dir)
sha=$(git rev-parse --verify "$ref^{commit}")
tree=$(git rev-parse "$sha^{tree}")
gate=${GATE_CMD:-make ci}
full_gate=${FULL_GATE_CMD:-make ci}
stack_down=${STACK_DOWN_CMD-make stack-down}
base=${LOCAL_CI_BASE:-origin/main}
name=$(basename "${common%/.git}")
dir=${LOCAL_CI_DIR:-$HOME/.cache/local-ci/${name%.git}-$(printf '%s' "$common" | sha1sum | cut -c1-8)}
mkdir -p "$dir/passed"
log=$dir/$sha.log

status() {
  [ "$post" -eq 1 ] || return 0
  gh api "repos/:owner/:repo/statuses/$sha" \
    -f state="$1" -f context="$context" -f description="$2" >/dev/null
}

if [ "$post" -eq 1 ] && [ -z "$(git branch -r --contains "$sha" 2>/dev/null)" ]; then
  echo "local-ci: $sha is not on any remote branch; push it first, or the status has nowhere to land" >&2
  exit 2
fi

wt=$(mktemp -d "${TMPDIR:-/tmp}/local-ci.XXXXXX")
ran=0
cleanup() {
  if [ "$ran" -eq 1 ] && [ -n "$stack_down" ]; then
    (cd "$wt" && bash -c "$stack_down") >>"$log" 2>&1 || echo "local-ci: '$stack_down' failed in $wt; check for a leftover stack" >&2
  fi
  git -C "$repo_root" worktree remove --force "$wt" >/dev/null 2>&1 || rm -rf "$wt"
  git -C "$repo_root" worktree prune
}
trap cleanup EXIT
git -C "$repo_root" worktree add --quiet --detach "$wt" "$sha"

note=""
if [ -n "${SELECT_CMD:-}" ]; then
  selection=$(cd "$wt" && LOCAL_CI_BASE=$base bash -c "$SELECT_CMD") || { echo "local-ci: SELECT_CMD failed" >&2; exit 2; }
  if [ -z "$(printf '%s' "$selection" | tr -d '[:space:]')" ] && ! git -C "$repo_root" diff --quiet "$base" "$sha" --; then
    echo "local-ci: the affected selection is empty on a non-empty diff against $base; running the whole gate"
    gate=$full_gate
    note=" · empty selection, whole gate"
  fi
fi
record=$dir/passed/$tree-$(printf '%s' "$gate" | sha1sum | cut -c1-8)

if [ -f "$record" ]; then
  echo "local-ci: tree ${tree:0:12} already passed '$gate' ($(cat "$record"))"
  status success "$gate · tree ${tree:0:12} · cached$note"
  exit 0
fi

status pending "$gate · running$note"
echo "local-ci: $gate at ${sha:0:12} (log: $log)"
start=$(date +%s)
ran=1
set +e
(cd "$wt" && bash -c "$gate") >"$log" 2>&1
rc=$?
set -e
secs=$(( $(date +%s) - start ))

if [ "$rc" -eq 0 ]; then
  printf 'sha=%s secs=%s host=%s at=%s\n' "$sha" "$secs" "$(hostname)" "$(date -u +%FT%TZ)" >"$record"
  status success "$gate · ${secs}s · tree ${tree:0:12}$note"
  echo "local-ci: PASS in ${secs}s"
else
  status failure "$gate · exit $rc · ${secs}s$note"
  echo "local-ci: FAIL (exit $rc) in ${secs}s; last lines:" >&2
  tail -n 30 "$log" >&2
fi
exit "$rc"
