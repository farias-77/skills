# Trace — <workstream> — release

<!--
  Written by the SESSION, one line per step as it ends, `date -u`,
  never estimated. A resumed session continues from the first plan
  step without a line here. The line carries the summary and the file
  under proof/, never the whole output.
-->

- <YYYY-MM-DD HH:MM UTC> · open · audit approved · `feat/<workstream>` @ `<sha>` · guard self-test <n>/<n> · allow rules: ok | under ask: <commands> · signoff required: yes | no
- <date> · plan · `04-release/plan.md`: <n> steps, rollout <progressive | straight>, <n> triggers, <n> migrations (<n> expand), <n> toggles, <n> watch rows
- <date> · pre-flight sent · <n> lines in one message (<n> classifier-reserved, <n> verbatim guard lines, the play line) · PushNotification
- <date> · **play** · "<his words, verbatim>" · allow file read back: `merge-from <sha>` · `rulings.md` written
- <date> · production diff · `<command>` · <n> add · <n> change · <n> destroy (stateful: none) · `proof/diff.txt`
- <date> · main · PR #<n> · signoff `<context>` on `<head>` · merged `<merge sha>` (--match-head-commit)
- <date> · versions · `<artifact>` `vX.Y.Z` → **vX.Y.Z** (<bump>, <n> commits, <n> reverts, <n> outside the convention) · `notes/<artifact>.json`
- <date> · staging · run <id> · serves `<sha>` · migrations at `<version>` · `proof/staging-<n>.txt`
- <date> · verifier · staging @ `<sha>` · <n>/<n> entries PASS · <entry>: FAIL | INCONCLUSIVE <check> · `proof/verify/`
- <date> · red · <step> · <the failing case> · cause: code | environment · entry R.<n> opened | traced | parked
- <date> · entry R.<n> · rounds <n> · merged into main `<sha>` · `entries/R.<n>/run-*.json`
- <date> · rollback target · revision `<rev>` · job image `<digest>` · front release `<id>`
- <date> · candidate · `<rev>` at 0% tag `rc-<short>` · digest ok · smoke <n>/<n> · read-only journeys PASS · `proof/candidate.txt`
- <date> · shift · <n>% → `<rev>` · bake <n> min · new <5xx %> / p95 <ms> (<n> req) vs previous <5xx %> / p95 <ms> · verdict: hold | no signal | trigger · `proof/bake-<n>.txt`
- <date> · promoted · `<rev>` at 100% · image `<digest>` · jobs on the release image · split cleared
- <date> · **rollback** · trigger: <which, value> · traffic → `<previous rev>` · verified: <read-only call → value>
- <date> · alarms · <n> read · OK <n> · no datapoints <n> · not evaluated yet <n> · firing <n> · `proof/alarms.txt`
- <date> · tags · `<artifact>` `vX.Y.Z` @ `<sha>` · release <url>
- <date> · watch <n> · scheduled for <YYYY-MM-DD HH:MM UTC> | read · <got> ✅|❌ · `proof/watch-<n>.txt`
- <date> · stop · <the stop-list item> · asked · answer: "<his words>"
- <date> · hotfix · seen: <what, where> · entry R.<n> · …
- <date> · **numbers** · wall-clock <h> (play → done) · his time <min> (pre-flight + answers) · staging runs <n> · reds <n> · R.<n> fixes <n> · rollbacks <n> · verifier runs <n> · reverts <n>/<n> commits · tokens <M | not recorded>
- <date> · **stage 5 done** · in production: <artifact> vX.Y.Z … · watch waiting: <n> | none · pendencies: <n> with owners · PushNotification sent
