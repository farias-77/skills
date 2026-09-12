# Trace — <workstream> — release

<!--
  Written by the SESSION, one line per step as it ends, `date -u`,
  never estimated. Permanent. A resumed session continues from the
  first plan step without a line here. The line carries the command's
  summary and the file under proof/, never the whole output.
-->

- <YYYY-MM-DD HH:MM UTC> · preconditions · `.state.md` release; audit Close shas re-read on origin: `<repo>` `<sha>` …; `main` <n> commits ahead per repo; alpha at the shas
- <date> · blueprint · built, <tabs>
- <date> · plan · `04-release/plan.md` written: <n> train steps, <n> pre-flight lines, <n> watch rows; printed, waiting for the goal
- <date> · goal · "<his words verbatim>" · pre-flight: <n> done, <n> delegated
- <date> · integrate · `<repo>` PR #<n> opened (Lane A|B) · rebased onto main: yes (<n> commits, lint/build/tests green) | no
- <date> · integrate · `<repo>` CI green · rebase merge · state MERGED · main `<sha>`
- <date> · confirm · `<repo>` tree identical to `<audited sha>`, alpha diff empty → the suite of <date> stands (P-17) | alpha from main deployed, suite <p>/<f>/<s> · `proof/suite-<repo>.txt`
- <date> · version · `<repo>` last tag `vX.Y.Z` → **vX.Y.Z** (<bump>, <n> commits, <n> unparsed) · `notes/<repo>.md` · expected `vX.Y.Z`: same | differs (<why>)
- <date> · rollback · `rollback/<repo>.md` written · safe for data: yes | no (stop)
- <date> · tags · `<repo>` `vX.Y.Z` @ `<sha>` · Release <url>
- <date> · train <n> · `<repo>` · `<run>` ✅|❌ · <check → got> · `proof/train-<n>.txt`
- <date> · red · train <n> · rollback executed (`<command>`) · verified: <check → got> · row R.<n> opened
- <date> · row R.<n> · PR #<n> · r1 <f>·<s>·<d>·<x> · r2 <f>·<s>·<d>·<x> · merged `<sha>` · tag `vX.Y.Z+1` · deploy `<stack>` ✅ · `04-release/rows/R.<n>.md`
- <date> · train closed · in prod: `<repo>` vX.Y.Z @ `<sha>` · …
- <date> · watch <n> · scheduled for <YYYY-MM-DD HH:MM UTC>
- <date> · watch <n> · read · <got> ✅|❌ · `proof/watch-<n>.txt`
- <date> · hotfix · seen: <what, where> · row R.<n> (`hotfix/<slug>`) · …
- <date> · **stage 5 closed** · in prod: <repo> vX.Y.Z … · pendencies: <n> with owners · PushNotification sent
