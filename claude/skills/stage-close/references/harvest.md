# The harvest — step 1 of stage 6

The demand's record is long: three review audits with their precision
tables, the rulings of every stage, the execution traces and reports
of every lane, the audit, the release trace with its rows and its
watch, the notes and the taste notes, and the previous workstream's
ledger. The session does not read it whole. One close-harvester
(Sonnet 5, high) per source reads it and returns what the close
needs, structured: the numbers, the precision per lens, every
friction with its evidence. The session judges what they brought.

## The five sources

| Source key | Paths passed | What comes back |
|---|---|---|
| `documents` | `00-discovery/reviews.md`, `01-design/reviews.md`, `02-plan/reviews.md`, `rulings.md` | rounds per stage; findings found · sustained · deferred · dismissed per stage and per lens; the user's rulings counted, and the patterns in them (a lens he keeps dismissing, a class he keeps overruling, a card chosen against the recommendation); every friction the audits record (what blocked a round, what it cost to clear) |
| `execution` | `03-execution/<wNN>/trace.md` and `report.md` per wave, `03-execution/audit.md`, `03-execution/parked.md` when present | rows, fix rows, review rounds and findings per lens, fix passes, suite runs, stops, departures kept and reverted, choices where the documents were silent, audit items and their rulings; every friction the traces and reports note |
| `release` | `04-release/plan.md`, `trace.md`, `rows/`, `proof/` (names only), `blueprint/release/release.json` | confirmation outcome per repo, train steps green and red, fix rows and hotfixes, watch rows read and owned, stops; every friction the trace notes |
| `notes` | `dreaming-notes.md`, `taste-notes.md` | every note as a friction, the `[user]` ones marked; every taste note as an entry of its own, marked `taste` |
| `previous` | `<previous workstream>/05-close/dreaming/ledger.md` | only the entries whose ruling was `park`, each with its original id, suggestion and destination, marked `parked` |

A source with no file (a workstream that skipped a stage, no previous
ledger) is passed with an empty path list and comes back empty; the
trace says so.

## What a friction is

Anything the record says cost time, tokens, a round, a stop, a
surprise, a workaround, a decision taken against the document, a
thing the user asked to change — wherever it was recorded. The
harvester does not filter for importance: every candidate comes back
with where it was seen (`file:line`), the quote that carries it, the
stage it bit, and, as raw material for the session, the class it
would guess and the destination file in the pipeline repo if it knows
one. The harvester proposes; the session classes.

## The workflow

[`close-harvest.js`](../../../workflows/close-harvest.js): `parallel`
over the five sources, `agentType: 'close-harvester'`, a structured
answer each, one re-dispatch on an invalid answer; a source that
failed twice comes back `{ key, failed: true }` and the session reads
it itself, saying so in the trace. The args carry paths, never text.
Each answer is saved verbatim to `05-close/harvest/<key>.json` before
anything is summed.

## The numbers

The session sums what the harvesters counted into the keys
`schema/close.md` fixes (`days`, `waves`, `rows`, `fixRows`, the
rounds per stage, the findings per stage and in total, `fixPasses`,
`suiteRuns`, `stops`, `departuresKept`, `departuresReverted`,
`silentChoices`, `auditItems`, `auditFixRows`, `releaseFixRows`,
`hotfixes`, `watchRead`, `watchOwned`, `rulings`, `issues`) and reads
the previous workstream's `close.json` for the same keys. Tokens are
recorded only where a trace recorded them; otherwise `null`, and the
table says "not measured". A number is never estimated to fill a
cell.
