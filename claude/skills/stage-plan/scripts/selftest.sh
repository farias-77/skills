#!/usr/bin/env bash
# Runs plan-graph.mjs on the fixtures and checks each verdict.
set -uo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
bad=0

expect() { # fixture exit "fail codes" "warn codes" [briefs-dir]
  local out rc miss=""
  out="$(node "$here/plan-graph.mjs" "$here/fixtures/$1.json" ${5:+--briefs "$here/fixtures/$5"})"; rc=$?
  for code in $3; do grep -q "FAIL $code" <<<"$out" || miss="$miss FAIL:$code"; done
  for code in $4; do grep -q "WARN $code" <<<"$out" || miss="$miss WARN:$code"; done
  if [[ $rc -ne $2 || -n "$miss" ]]; then
    echo "FAIL  $1${5:+ --briefs $5}: exit $rc, expected $2${miss:+, missing$miss}"; echo "$out" | sed 's/^/      /'; bad=1
  else
    echo "ok    $1${5:+ --briefs $5} (exit $rc${3:+; FAIL $3}${4:+; WARN $4})"
  fi
}

expect valid        0 ""          "cap workstream"
expect cycle        1 "cycle"     ""
expect orphan-ac    1 "orphan-ac" ""
expect double-owner 1 "owner"     ""
expect over-cap     1 "cap"       ""
expect shared       1 "shared"    ""
expect data-edge    1 "edge"      ""
expect valid        0 ""          ""             briefs
expect valid        1 "brief contract comment" "" briefs-stale

for f in valid:0 orphan-ac:1; do
  out="$(node "$here/plan-graph.mjs" "$here/fixtures/${f%:*}.json" --stories "$here/fixtures/stories.md")"; rc=$?
  if [[ $rc -ne ${f#*:} ]] || { [[ $rc -eq 1 ]] && ! grep -q 'FAIL stories' <<<"$out"; }; then
    echo "FAIL  ${f%:*} --stories: exit $rc, expected ${f#*:}"; bad=1
  else
    echo "ok    ${f%:*} --stories (exit $rc)"
  fi
done

json="$(node "$here/plan-graph.mjs" "$here/fixtures/valid.json" --briefs "$here/fixtures/briefs" --json /dev/stdout --quiet)"
if grep -q '"contract"' <<<"$json" && grep -q '"provides"' <<<"$json" && grep -q '"criticalPath"' <<<"$json"; then
  echo "ok    --json carries reviewBriefs (E-01 with contract, C with provides) and the critical path"
else
  echo "FAIL  --json lacks reviewBriefs or the critical path"; bad=1
fi

[[ $bad -eq 0 ]] && echo "selftest: every verdict as expected" || echo "selftest: FAILED"
exit $bad
