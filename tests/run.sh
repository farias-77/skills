#!/usr/bin/env bash
# run.sh — every check of the kit, in one command. Run it before each push to the kit.
# Each check runs offline in seconds: nothing reaches GitHub, Notion or a model.
set -uo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
bad=0
check() { # name, command...
  local name=$1; shift
  if out=$("$@" 2>&1); then printf 'ok    %s\n' "$name"
  else printf 'FAIL  %s\n' "$name"; printf '%s\n' "$out" | tail -n 20 | sed 's/^/      /'; bad=1; fi
}
check 'local-ci: --record, --post-from, refusals' bash "$root/tests/local-ci-dry-run.sh"
check 'cleanup.sh' bash "$root/claude/scripts/tests/cleanup.test.sh"
check 'plan graph validator' bash "$root/claude/skills/stage-plan/scripts/selftest.sh"
check 'discovery-review workflow' node "$root/tests/discovery-review-dry-run.mjs"
check 'plan-review workflow' node "$root/tests/plan-review-dry-run.mjs"
check 'exec-entry workflow' node "$root/tests/exec-entry-dry-run.mjs"
for f in "$root"/claude/skills/*/scripts/*.sh "$root"/claude/scripts/*.sh; do bash -n "$f" || { echo "FAIL  syntax: $f"; bad=1; }; done
[ $bad -eq 0 ] && echo 'kit: all checks pass' || echo 'kit: FAILED'
exit $bad
