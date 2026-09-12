# The audit — how stage 4 closes with the user

The user was not in the room. The audit is where he reads what was
decided in his place and rules it. It runs in the master session,
after the PushNotification, with every worker session still open.

## Before he arrives: `audit.md` consolidated

From the row files, the wave reports, the PR bodies, `parked.md`,
`fixes/` and the traces — **before asking anything**. The template is
[templates/audit.md](../templates/audit.md). The order is the order
he reads:

1. **The demand in numbers.** One table: waves, rows, PRs, rounds,
   findings (f · s · d · x), fix rows, suites, stops, walks red then
   green. The branch state: each repo's `feat/<workstream>` sha, the
   tags, alpha at the last tag.
2. **Parked.** Every line of `parked.md`, first: these are the rows
   that did not close, and the reason is his.
3. **D — departures from the standard.** Every departure the row
   files record (the rule left, the reason given), grouped by rule
   when several rows left the same one.
4. **C — choices where the documents were silent.** Every choice the
   builders listed and the lenses did not contest, grouped by what
   they touch; the ones that changed what a consumer receives first.
5. **N — notes still open.** Every `note` that rode a PR, deduplicated.
6. **S — stops and how they ended.** Every second and third red,
   every harness death, every red walk step and its fix, one line
   each with the file.
7. **Improvements applied inside the standard.** The list, no
   question.

Each D / C / N item carries: where (row, PR, file:line), what the
standard or the design says (quoted), what was built, what the code
shows now (the master reads it, not the report), the recommendation
(keep / fix / revert) and why in one sentence.

Then the blueprint: `audit.json` with every item and `ruling: null`,
the build, publish. He reads the Execution tab first if he wants;
the questions do not wait for that.

## The questions

Through the question tool, in the house shape, **four items per
call**, in the order above (parked first, then D, C, N, S). The
question text carries the item whole: where, the standard's sentence,
what was built, what the code shows, the recommendation and its
reason. The answers are the rulings, the recommendation first and
marked as the conductor's: **keep** (it stays as built, recorded as
a ruling), **fix** (built as an audit row), **revert** (the change
undone as an audit row). Items that resolve by the same choice are
one question. He may write in "Other"; his words are the ruling.

Every answer is appended to `rulings.md` as it comes:
`<date> · execute audit · <item id> · judge: <recommendation> · ruled:
<his answer> · "<his words>"`. A pattern (a class he keeps fixing, a
departure he keeps keeping) goes to `taste-notes.md` on the spot, as
the pattern.

## The fixes

Every `fix` and `revert` becomes a row `A.<n>` in the lane that owns
the file: `03-execution/fixes/A-<n>.md` from the fix template (what
he ruled, his words, the row it changes, the smallest change), one
line to that worker: `fix A.<n> · lane <repo> · 03-execution/fixes/
A-<n>.md`. The worker builds it through the row loop (branch
`feat/<workstream>/A.<n>-<slug>` from the top, builder, five lenses,
PR, merge, proof), and reports `row A.<n> merged`. When every audit
row is merged: the walk steps the fixes touch again, and the whole
suite of each repo that changed, in the background. **Two fix passes
at most:** a second pass only for what the first pass's walk found;
what a second pass leaves is written under Close as residue with its
owner, never chased into a third.

## Close

The Close section of `audit.md`: the date; the sha of each repo's
`feat/<workstream>` after the last audit row, with the last tag;
alpha at those shas, said with the deploy output; the whole suites'
last results; the residue with owners; the parked items he chose to
leave, each with what it waits for. Then `audit.json` complete (every
item with its ruling and words; the fixes with status; the close
block), `exec-report.json` refreshed, the build, publish; `.state.md`
to `stage: release · chair: fable` with the shas; the close commit
of the designs repo (push only with his explicit approval); tell the
workers `stage closed` in one line (they end). Suggest `/clear`
before stage 5.

## What the audit never does

Reopens a ruling already in `rulings.md`. Builds a fix outside the
row loop or without a lens. Merges into `main`. Runs a third fix
pass. Asks two questions for one decision.
