# The harvest — step 2 of stage 6

The numbers do not need a reader: they come from each stage's
`telemetry.json` by `telemetry-sum.mjs` (step 1). What does need one
is the frictions: what the stages and the user wrote down as it
happened. One `close-harvester (Sonnet 5.5, medium)` reads them and
returns each one with its evidence; the session does not read them
whole.

## What it reads

| Paths passed | Why |
|---|---|
| `dreaming-notes.md` | every friction a stage noted on the spot, and his `[user]` notes, which weigh first |
| `taste-notes.md` | the patterns in his rulings, as the stages saw them |
| `rulings.md` | his rulings and the conductors' in his place: a ruling he overturned, a class he keeps dismissing |
| `00-discovery/reviews.md`, `01-design/reviews.md`, `02-plan/reviews.md` | what each review cost and found |
| `03-execution/board.md`, `parked.md`, `audit.md` | the slow entries, the parked ones and why |
| `04-release/trace.md` | the reds, the fix, the rollbacks |
| the slowest steps | the `slowest` list of `05-close/metrics.json`, given as text |

A file that does not exist is skipped; the answer lists it under
`unread`. **Files, never folders**: an entry's evidence folder
(screenshots, videos, test output) is never passed.

## What a friction is

Anything the record says cost time, a round, a stop, a red, a
surprise, a workaround, a decision taken against the document, a thing
the user asked to change. The harvester does not filter for
importance: every one comes back with the stage it bit, where it was
seen (`file:line`), the quote, and the time it cost when the record
says (the step and the minutes, from the slowest steps or the line
itself). It also returns what went smoothly, with its evidence, so the
session has the "went well" without reading the record.

## The dispatch

One Agent call, `subagent_type: close-harvester` (or the definition's
path, inline, when the agent is not installed), the paths and the
slowest steps in the prompt, the workstream's language. An answer that
is not in the agent's response contract is dispatched once more; a
second failure and the session reads `dreaming-notes.md` itself and
says so in the trace. The answer is saved verbatim to
`05-close/harvest.json` before the retro is written.
