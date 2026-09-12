# A fix in this stage — row `R.n`

The session writes no code. A regression this stage finds is built
the way stage 4 builds everything: one row, one branch, one
`exec-builder` (Opus 5, high), five `exec-lens-*` (Sonnet 5, high)
that never wrote the code, two rounds at most, the session judging by
[stage-execute/references/judging.md](../../stage-execute/references/judging.md)
with the same never-dismissed classes (a test expectation changed, a
credential, a stateful deletion, a contract departure). What differs
from a stage-4 row is where the branch comes from, where the PR goes,
and what happens after the merge.

| | Before the train (a red confirmation, step 2) | In the train (a red step, step 5) | At the watch (a hotfix, step 6) |
|---|---|---|---|
| **Branch** | `fix/<workstream>/R.<n>-<slug>` from `origin/main` | same | `hotfix/<slug>` from `origin/main` (the git standard) |
| **PR into** | `main` | `main` | `main` |
| **After the merge** | step 2 again | patch tag on the merge sha, Release, `deploy:prod` of the affected stack only, the step's checks again | patch tag, Release, `deploy:prod` of the affected stack only, the rollout's checks of that stack |
| **Budget** | two cycles on one step; the third red stops | same | same |

## The loop

1. **The row file:** `04-release/rows/R.<n>.md` from
   [templates/row.md](../templates/row.md). Its `### R.<n>` section is
   the brief: what was seen (the step, the output, the file under
   `proof/`), what was read in the code or the logs, the smallest
   change the session sees, what must not change, the proof after the
   fix (the step's own check). The session proposes the smallest
   change; it does not write it.
2. **Build and round 1:** [`exec-row`](../../../workflows/exec-row.js)
   by `scriptPath`, `mode: 'build'`, `goalPath` = the row file, `row`
   = `R.<n>`, `base` = `main`, `proofDir` = `04-release/proof`,
   `rowFile` = the row file, `lenses: all`, the design folder, the
   recon, the standards, the trailer. Save the return as
   `reviews/R.<n>/r1.json`; judge; write `r1.md` from the stage-4
   round template.
3. **Fix and round 2:** `mode: 'fix'` with `since` and the sustained
   findings as `fixes`; the lenses read the delta. No round 3: a
   one-line residue the session verifies on disk is applied by the
   builder once more without a lens; everything else rides as a PR
   note and a line in the report. A test-expectation change always
   goes through a lens.
4. **PR, CI, merge:** into `main`, body from the row template, CI in
   the background, rebase merge, state re-read. Red CI: the builder
   fixes (first red); a second red is a new brief (the session
   rewrites the `### R.<n>` section, same model and effort); the
   third stops.
5. **After the merge:** the column above. A hotfix deploys **only the
   stack the regression lives in** (the rollout names the stacks per
   step; the deploy command takes them by name); the other stacks are
   not touched by a hotfix.
6. **The row file complete** (branch, PR, rounds, the deploy, the
   check after, attempts), `release.json` updated, the trace line.

## What a fix never does

Changes what a story delivers or a contract the design froze (that
is a stop: the demand reopens); deletes stored data; writes to prod
to prove itself; skips a lens because the change is small; rolls
back by force push or by rewriting a tag; deploys a branch (prod
deploys from a tag, always).
