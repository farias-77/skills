# Governance: changing the pipeline with data, without fattening it

1. The pipeline changes by common sense and numbers, not by rules of
   restraint.
2. A rule lives in one file; the others point to it.
3. Governance sized for one person editing prompts: no semver, no
   changelog, no weekly branch, no median before there are fronts for
   it.

## The loop

```
every stage ──► nothing to record by hand: transcripts, commits and run-*.json hold it
close ──► telemetry.mjs ──► metrics.json ──► the front's retro, closed on its own
weekly ──► retros + rulings of the closed fronts ──► the board
he rules ──► apply · park · drop ──► fast-forward on the pipeline repo's main
```

## The three files that teach

| File | Holds |
|---|---|
| `dreaming-notes.md` | frictions noted on the spot by every stage, his `[user]` notes verbatim, and `[taste]` patterns in his rulings |
| `rulings.md` | every ruling, one line |
| `05-close/retro.md` (`close.md` on the short route) | the front's retro, with his notes and the harvest |

## Who decides

| Change | Example | Who | How |
|---|---|---|---|
| fixing something broken | a script that crashes, a stale reference | the agent | applies it; listed on the board for veto |
| a fix that unblocks a front now | a workflow bug that parks entries | the front's session | another worktree, the smallest change, the repo's tests, fast-forward; a line in `dreaming-notes.md`; ratified at the weekly. **Never** the guard, `authorize.sh`, the hooks or the settings: those wait for his explicit ok |
| behavior | a step, an agent, a model, a rule | **him** | at the weekly |
| the project's standards | tests, architecture | **him** | a PR to the project |
| the principles | — | **him** | a conversation of its own |

## A proposal

A lesson becomes a proposal only past four filters; a "no" drops it
with its code: **F1** will it still matter in six months? · **F2** does
it change a future decision? · **F3** would no mechanism already catch
it? · **F4** is it not written already? (written and still missed: the
problem is execution, not the text). A class counts once seen twice.

- **What changes in practice**, one plain sentence.
- **The evidence:** the fronts that hit it, a quote, the minutes or the
  cost it took.
- **The edit:** the file and the exact change.
- **The level**, the strongest that holds the lesson: architecture (the
  wrong thing cannot be written) → a type → a lint or CI check whose
  error names the fix → a test → text, last (nothing fails when an
  agent skips a sentence). Why not one level up, in one line. A new
  check proves it fails on a real past commit; once it lands, the text
  it replaces goes.
- **The number it should move:** time, cost or his touches. The next
  boards show whether it did.

Prefer removing to adding. A proposal that adds a step names what it
removes, or why nothing can go.

## The numbers

| Number | Definition |
|---|---|
| time per front | from `/lets-cook` to the close, with the agents' active time beside it |
| cost per front | tokens per model × list price: an estimate, marked as one |
| his touches | `/goal`s, answers and messages from him (from `metrics.json`); the retro names apart the ones that unblocked a stop |

No target before measuring: the first fronts are the baseline. A
median per route only after 10 fronts on it.

## Fixed items on the board

| Item | When |
|---|---|
| the dependency PR: patch and minor, through the whole gate (a major is his call) | the first weekly of each month |
| security alerts from the dependency scanner (alerts only, no automatic PRs) | every week, when there are any |
| the agents' bot token: days until it expires (also an email alarm at 14 days) | every week |
| the restore drill: restore the production backup into staging and note the time (a backup never restored does not count) | once a quarter, when due |
| the week's incidents (`incident` issues) | every week, when there are any |

## Versions and rollback

1. The live install is the pipeline repo's `main` (the skills are
   linked from it). Changes are made in another worktree and land by
   fast-forward, so no front ever reads a half-edited file.
2. Each stage runs on whatever `main` was when it opened;
   `metrics.json` records the sha (`pipelineSha`).
3. Rolling the pipeline back is resetting the live `main` to the
   previous sha, on his word.
