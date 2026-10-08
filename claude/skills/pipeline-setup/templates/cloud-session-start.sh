#!/usr/bin/env bash
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$PWD}"

git fetch --quiet origin '<default-branch>' || true

: '<dependency-install>'

: '<stack-up>' > "${TMPDIR:-/tmp}/cloud-stack.log" 2>&1 || {
  tail -n 40 "${TMPDIR:-/tmp}/cloud-stack.log" >&2
  exit 1
}
echo "cloud stack up: $(: '<stack-env-summary>')"
