#!/usr/bin/env bash
# structure-check.sh — the structure check role of the pipeline's bar.
#
#   structure-check.sh [--json] [--allow-deps a,b] <repo> <baseRef> <headRef>   # the gate
#   structure-check.sh --calibrate <repo> <ref> [--write]                       # thresholds from p95/p99
#   structure-check.sh --summary <repo> <ref>                                   # whole-tree numbers
#   structure-check.sh --compare <repo> <refA> <refB>                           # side by side, with delta
#
# Checks only what `git diff base head` adds, read from a detached worktree of
# head that is removed on exit. Exit 0 = no violation, 1 = a violation,
# 2 = usage or tool error. Config: structure-check.json beside this script
# (or $STRUCTURE_CONFIG). A dependency the user ruled on passes with
# --allow-deps name (or ALLOW_DEPS=name).
#
# Tools, pinned, found on PATH or installed once into $STRUCTURE_TOOLS
# (default ~/.cache/structure-check): lizard (pip) for most languages,
# jscpd (npm) for duplication, typescript (npm) for the TS/JS parser that
# measures functions where lizard loses their boundaries (TSX).
# LIZARD=, JSCPD=, TS_LIB= override each one.
set -euo pipefail
here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
LIZARD_VERSION=1.24.0
JSCPD_VERSION=5.4.0
TYPESCRIPT_VERSION=5.9.3
tools=${STRUCTURE_TOOLS:-$HOME/.cache/structure-check}

find_tools() {
  if [ -z "${LIZARD:-}" ]; then
    if [ -x "$tools/venv/bin/lizard" ]; then LIZARD=$tools/venv/bin/lizard
    elif command -v lizard >/dev/null 2>&1; then LIZARD=$(command -v lizard)
    else
      echo "installing lizard $LIZARD_VERSION into $tools/venv" >&2
      mkdir -p "$tools" && python3 -m venv "$tools/venv" >&2 &&
        "$tools/venv/bin/pip" install -q "lizard==$LIZARD_VERSION" >&2 || { echo "error: cannot install lizard" >&2; return 1; }
      LIZARD=$tools/venv/bin/lizard
    fi
  fi
  if [ -z "${JSCPD:-}" ] || [ -z "${TS_LIB:-}" ]; then
    mkdir -p "$tools/node"
    if [ ! -x "$tools/node/node_modules/.bin/jscpd" ] || [ ! -d "$tools/node/node_modules/typescript" ]; then
      echo "installing jscpd $JSCPD_VERSION and typescript $TYPESCRIPT_VERSION into $tools/node" >&2
      (cd "$tools/node" && { [ -f package.json ] || npm init -y >/dev/null; } &&
        npm install --silent "jscpd@$JSCPD_VERSION" "typescript@$TYPESCRIPT_VERSION" >&2) || { echo "error: cannot install jscpd/typescript" >&2; return 1; }
    fi
    JSCPD=${JSCPD:-$tools/node/node_modules/.bin/jscpd}
    TS_LIB=${TS_LIB:-$tools/node/node_modules/typescript}
  fi
  export LIZARD JSCPD TS_LIB
}

usage() { sed -n '4,7p' "$0" | sed 's/^# //' >&2; exit 2; }
py=(nice -n "${STRUCTURE_NICE:-10}" python3 "$here/structure_check.py")
case "${1:-}" in
  --calibrate) shift; [ $# -ge 2 ] || usage; find_tools || exit 2; exec "${py[@]}" calibrate "$@" ;;
  --summary)   shift; [ $# -eq 2 ] || usage; find_tools || exit 2; exec "${py[@]}" summary "$@" ;;
  --compare)   shift; [ $# -eq 3 ] || usage; find_tools || exit 2; exec "${py[@]}" compare "$@" ;;
  ""|-h|--help) usage ;;
esac
args=()
while [ $# -gt 0 ]; do
  case "$1" in
    --json) args+=(--json); shift ;;
    --allow-deps) [ $# -ge 2 ] || usage; args+=(--allow-deps "$2"); shift 2 ;;
    *) break ;;
  esac
done
[ $# -eq 3 ] || usage
find_tools || exit 2
exec "${py[@]}" check "$1" "$2" "$3" "${args[@]}"
