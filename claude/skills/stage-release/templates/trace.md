# Trace — <workstream> — release

<!--
  Written by the SESSION, one line per step as it ends, `date -u`,
  never estimated. A resumed session continues from the first plan
  step without a line here. The line carries the summary and the file
  under proof/, never the whole output.
-->

- <YYYY-MM-DD HH:MM UTC> · preconditions · audit approved · `feat/<workstream>` @ `<sha>` · pre-flight: <n> done, <n> delegated
- <date> · plan · `04-release/plan.md` written: <n> staging steps, <n> production steps, <n> watch rows
- <date> · staging · PR #<n> merged · CI run <id> · suite <passed>/<failed> · `proof/staging-<n>.txt`
- <date> · red · staging · <the failing case> · cause: code | environment · entry R.<n> opened | traced
- <date> · entry R.<n> · rounds <n> · merged `<sha>` · `entries/R.<n>/run.json`
- <date> · versions · `<artifact>` `vX.Y.Z` → **vX.Y.Z** (<bump>, <n> commits, <n> outside the convention)
- <date> · ask · release PR #<n> · "vai?" · answer: "<his words>"
- <date> · production · merged `<sha>` · CI run <id> · checks <n>/<n> · verified: <read-only call → value> · `proof/prod-<n>.txt`
- <date> · rollback · CI rolled back to `<version>` · verified: <read-only call → value>
- <date> · tags · `<artifact>` `vX.Y.Z` @ `<sha>` · release <url>
- <date> · watch <n> · scheduled for <YYYY-MM-DD HH:MM UTC> | read · <got> ✅|❌ · `proof/watch-<n>.txt`
- <date> · hotfix · seen: <what, where> · entry R.<n> · …
- <date> · **stage 5 closed** · in production: <artifact> vX.Y.Z … · pendencies: <n> with owners · PushNotification sent
