#!/usr/bin/env bash
set -euo pipefail
here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
manifests=("$here/requirements.txt" "$here/package.json")
[ -f "$here/package-lock.json" ] && manifests+=("$here/package-lock.json")
tools=${STRUCTURE_TOOLS:-$HOME/.cache/structure-check}/$(cat "${manifests[@]}" | sha1sum | cut -c1-12)

usage() {
  echo "usage: structure-check.sh [--json] [--allow-deps a,b] <repo> <baseRef> <headRef>   the gate: exit 1 on a violation" >&2
  echo "       structure-check.sh --calibrate <repo> <ref> [--write]                       thresholds from the code's p95/p99" >&2
  echo "       structure-check.sh --summary <repo> <ref>                                   the whole tree's numbers (JSON)" >&2
  echo "       structure-check.sh --compare <repo> <refA> <refB>                           two refs side by side" >&2
  echo "       structure-check.sh --measure <repo> <ref> <path>...                         paths present at ref and under p95" >&2
  echo "tools: installed from requirements.txt and package.json beside this script into $tools" >&2
  echo "       (LIZARD, JSCPD, TS_LIB override each one; STRUCTURE_TOOLS moves the cache)" >&2
  exit 2
}

find_tools() {
  if [ -z "${LIZARD:-}" ]; then
    if [ ! -x "$tools/venv/bin/lizard" ]; then
      echo "structure-check: installing requirements.txt into $tools/venv" >&2
      mkdir -p "$tools" && python3 -m venv "$tools/venv" >&2 &&
        "$tools/venv/bin/pip" install -q -r "$here/requirements.txt" >&2 || { echo "structure-check: cannot install requirements.txt" >&2; return 1; }
    fi
    LIZARD=$tools/venv/bin/lizard
  fi
  if [ -z "${JSCPD:-}" ] || [ -z "${TS_LIB:-}" ]; then
    if [ ! -x "$tools/node/node_modules/.bin/jscpd" ] || [ ! -d "$tools/node/node_modules/typescript" ]; then
      echo "structure-check: installing package.json into $tools/node" >&2
      mkdir -p "$tools/node" && cp "$here/package.json" "$tools/node/" || return 1
      if [ -f "$here/package-lock.json" ]; then
        cp "$here/package-lock.json" "$tools/node/" && (cd "$tools/node" && npm ci --silent >&2)
      else
        (cd "$tools/node" && npm install --silent --no-package-lock >&2)
      fi || { echo "structure-check: cannot install package.json" >&2; return 1; }
    fi
    JSCPD=${JSCPD:-$tools/node/node_modules/.bin/jscpd}
    TS_LIB=${TS_LIB:-$tools/node/node_modules/typescript}
  fi
  export LIZARD JSCPD TS_LIB
}

py=(nice -n "${STRUCTURE_NICE:-10}" python3 "$here/structure_check.py")
case "${1:-}" in
  --calibrate) shift; [ $# -ge 2 ] || usage; find_tools || exit 2; exec "${py[@]}" calibrate "$@" ;;
  --summary)   shift; [ $# -eq 2 ] || usage; find_tools || exit 2; exec "${py[@]}" summary "$@" ;;
  --compare)   shift; [ $# -eq 3 ] || usage; find_tools || exit 2; exec "${py[@]}" compare "$@" ;;
  --measure)   shift; [ $# -ge 3 ] || usage; find_tools || exit 2; exec "${py[@]}" measure "$@" ;;
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
exec "${py[@]}" check "$1" "$2" "$3" ${args[@]+"${args[@]}"}
