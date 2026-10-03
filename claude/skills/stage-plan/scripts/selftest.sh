#!/usr/bin/env bash
# selftest.sh — runs plan-graph.mjs on the four fixtures and checks each verdict.
#   valid.json         → holds (exit 0)
#   cycle.json         → fails: E-03 and E-int wait for each other
#   orphan-ac.json     → fails: J02.s1.2 is carried by no node
#   double-owner.json  → fails: E-01 and E-03 both own web/src/pages/orders/new/**
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
bad=0
check() { # fixture expected-exit expected-code
  out="$(node "$here/plan-graph.mjs" "$here/fixtures/$1.json")"; rc=$?
  echo "=== $1 (exit $rc)"; echo "$out"
  if [[ $rc -ne $2 ]] || { [[ -n "$3" ]] && ! grep -q "FAIL $3" <<<"$out"; }; then
    echo "SELFTEST FAILED: $1 expected exit $2${3:+ and a FAIL $3}"; bad=1
  fi
}
check valid 0 ""
check cycle 1 cycle
check orphan-ac 1 orphan-ac
check double-owner 1 owner
[[ $bad -eq 0 ]] && echo "selftest: all four verdicts as expected"
exit $bad
