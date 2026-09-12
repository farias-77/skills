# Row R.<n> — <workstream> — `<repo>` — fix | hotfix

<!--
  Written by the SESSION: opened when a confirmation, a train step or
  a watch proof goes red (or the user reports a regression), and
  completed line by line as the row loop advances. The `### R.<n>`
  section is the brief exec-row hands to the builder (goalPath = this
  file, row = R.<n>). Permanent. Timestamps from `date -u`.
-->

- **Row:** R.<n> · kind: fix (before the train) | fix (train step <s>) | hotfix (watch <n> | reported by the user)
- **Opened:** <YYYY-MM-DD HH:MM UTC>
- **Branch:** `fix/<workstream>/R.<n>-<slug>` | `hotfix/<slug>` from `origin/main` @ `<sha>`
- **Builder:** exec-builder (Opus 5, high) · attempts: 1 | 2 (brief rewritten: <why>) | 3 (stopped)
- **Rollback before the fix:** none (before the train) | executed `<command>` at <date>, verified: <check → got>

### R.<n>

**What was seen.** `<the step's run or the watch's command>` → expected <expect> → got **<the output line>** · `04-release/proof/<file>`.

**Read in the code / logs.** <file:line, the log line, the alarm history, the metric with its expression — what the session saw before proposing>

**The smallest change.** <one paragraph: what to change, where, what must not change; a test expectation that changes says why here>

**Proof after the fix.** `<the same run or command>` → <expected>. Tests first; lint, build and tests green on the branch; synth for both stages when there is infra.

**Paths.** repo `<abs path>` · design `01-design/` · recon `02-plan/recon/<repo>.md` · standards `<abs path>` · trailer as given.

## Rounds

| Round | Lenses | Findings | Sustained | Deferred | Dismissed | File |
|---|---|---|---|---|---|---|
| 1 | 5 | | | | | `reviews/R.<n>/r1.md` |
| 2 | 5 \| 3 | | | | | `reviews/R.<n>/r2.md` |

## PR

- **PR:** #<n> · <url> · into `main`
- **CI:** green at `<sha>` (<date>) · red attempts: <n>
- **Merged:** <date> · `<merge sha>` (rebase, state re-read)

## After the merge

- **Before the train:** confirmation of `<repo>` again → <result, trace line>
- **In the train / hotfix:** tag `vX.Y.Z` @ `<merge sha>` · Release <url> · `deploy:prod -- <stack>` ✅ (<date>) · checks: <check → got> · `04-release/proof/<file>`
- **The proof that failed, read again:** <date> · <got> ✅ | not applicable

## Notes that ride

- <finding id · lens · one line>

## Closed

<YYYY-MM-DD HH:MM UTC> · trace line written · `release.json` updated

---

## PR body

```
fix | hotfix R.<n> · <workstream> · <what was seen, one line>

Rounds: r1 <f>·<s>·<d>·<x> (5 lenses) · r2 <f>·<s>·<d>·<x> (<5|3> lenses)
Proof after: <run> → <got> (04-release/proof/<file>)
Notes: <one line each>

<attribution trailer>
```
