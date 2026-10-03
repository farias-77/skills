# The harvest — step 1 of stage 6

The workstream's record is long: the review audits of three stages,
the rulings, every entry's run in the execution, the audit, the
release's trace and record, the notes. The session does not read it
whole. One close-harvester (Sonnet 5.5, medium) per source reads it and
returns what the retro needs, structured: the numbers, the precision
per reviewer, every friction with its evidence.

## The five sources

| Source key | Paths passed | What comes back |
|---|---|---|
| `documents` | `00-discovery/reviews.md`, `01-design/reviews.md`, `02-plan/reviews.md`, `rulings.md` | rounds per stage; findings per stage and reviewer; the user's rulings and the patterns in them (a lens he keeps dismissing, a class he keeps overruling, a card chosen against the recommendation); every friction the audits record |
| `execution` | `03-execution/board.md`, `parked.md`, `audit.md`, every `entries/*/run-*.json` listed by path (never the `entries/` folder), `blueprint/execution/execution.json` | entries, amendments, rounds per entry, findings and precision per reviewer, parked entries and why, the choices where the documents were silent, the audit's items and rulings; every friction the runs and the board show |
| `release` | `04-release/plan.md`, `trace.md`, every `04-release/entries/*/run-*.json` listed by path, `blueprint/release/release.json` | staging runs and reds, fixes, rollbacks, hotfixes, watch read and owned; every friction the trace notes |
| `notes` | `dreaming-notes.md`, `taste-notes.md` | every note as a friction, the `[user]` ones marked; every taste note marked `taste` |
| `telemetry` | `.state.md`, `01-design/telemetry.md`, the plan's and the execution's telemetry where the stages wrote it, `04-release/trace.md` | per stage: wall-clock, his hours, agent hours, tokens, rounds, findings by class, each with its line ([metrics.md](metrics.md)); a stage that recorded nothing is a friction |

A source with no file comes back empty; the trace says so.

**Paths, never folders.** The session lists the run files itself
(`ls`) and passes each one. A folder is never passed: an entry's
folder also holds its evidence (screenshots, videos, test output),
about 1,700 files in the last workstream, which carry no friction the
run file does not already record. The harvester reads what it is
given and nothing more.

## What a friction is

Anything the record says cost time, tokens, a round, a stop, a red, a
surprise, a workaround, a decision taken against the document, a thing
the user asked to change — wherever it was recorded. The harvester
does not filter for importance: every candidate comes back with where
it was seen (`file:line`), the quote, the stage it bit, and, as a
hint, where an idea from it would land and the pipeline file it would
touch.

## The workflow

`close-harvest.js`: `parallel` over the five sources, one structured
answer each, one re-dispatch on an invalid answer; a source that
failed twice comes back `{ key, failed: true }` and the session reads
it itself, saying so in the trace. The args carry paths, never text.
Each answer is saved verbatim to `05-close/harvest/<key>.json` before
anything is summed.
