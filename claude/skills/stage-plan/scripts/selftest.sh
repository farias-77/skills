#!/usr/bin/env bash
# selftest.sh — runs plan-graph.mjs on the fixtures and checks each verdict.
#   valid.json                        → holds (exit 0)
#   cycle.json                        → fails: E-03 and E-int wait for each other
#   orphan-ac.json                    → fails: J02.s1.2 is carried by no node
#   double-owner.json                 → fails: E-01 and E-03 both own web/src/pages/orders/new/**
#   briefs.json --briefs briefs       → holds: a "## Provides, in detail" heading is not read as Provides
#   briefs.json --briefs briefs-stale → fails: a Uses row names a stale producer, and an HTML comment
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
bad=0
check() { # fixture expected-exit expected-codes [briefs-dir]
  out="$(node "$here/plan-graph.mjs" "$here/fixtures/$1.json" ${4:+--briefs "$here/fixtures/$4"})"; rc=$?
  echo "=== $1${4:+ --briefs $4} (exit $rc)"; echo "$out"
  local miss=""
  for code in $3; do grep -q "FAIL $code" <<<"$out" || miss="$miss $code"; done
  if [[ $rc -ne $2 ]] || [[ -n "$miss" ]]; then
    echo "SELFTEST FAILED: $1 expected exit $2${3:+ and FAIL $3}${miss:+ (missing:$miss)}"; bad=1
  fi
}
check valid 0 ""
check cycle 1 cycle
check orphan-ac 1 orphan-ac
check double-owner 1 owner
check briefs 0 "" briefs
check briefs 1 "brief comment" briefs-stale
[[ $bad -eq 0 ]] && echo "selftest: all six verdicts as expected"
exit $bad
