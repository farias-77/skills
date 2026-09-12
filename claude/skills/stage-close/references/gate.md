# The stop — step 4 of stage 6

The only place the stage waits for the user. He arrives to a built
page, not to a list of questions: the Close tab, with the closure's
numbers, the sweep's open lines and the board with a default ruling
on every entry.

## What the session prints when it stops

A table, one row per board section: entries · defaults to `issue` ·
`join` · `discard` · `park` · questions waiting; then the sweep lines
still `delegated` or `open`; then the blueprint URL. One line: "read
the Close tab; send what you veto or change; say apply". End the
turn.

## How he rules

| He says | The session does |
|---|---|
| "P-3 differently: …" | the entry's suggestion becomes his words; the ruling stays `issue` |
| "discard X-5" / "rescue X-5" | the ruling changes; a rescued discard gets a class and a destination from the session, shown in the list |
| "park U-2" | the ruling is `park`; it returns on the next workstream's board |
| "join P-4 to #12" | the ruling is `join #12` |
| a sweep line: "done" | the session re-reads the origin before marking it |
| "apply" | every entry without a change keeps its default; the rulings are written; step 5 begins |

Every adjustment is noted in a visible list (entry · was · now) and
nothing is applied until "apply". The list is re-printed after each
message. An adjustment after "apply" is a new ruling: recorded, and
its issue created or edited the same way.

## The three questions

Asked through the question tool, in the house shape (the context in
the question, the answers as the options, the session's pick first
and marked, four to a call), one question per decision:

| Kind | Why it is a question and not a default | The options |
|---|---|---|
| A recurrence: `closed #n` and the rule is still in the text | the rule did not hold; opening the same issue again would hide that | strengthen the rule (a new issue naming #n and what it lacked) · the rule is fine, the instance is not (discard) · park |
| A taste note | it is his taste; the session does not decide what his taste becomes | a standard line (issue on the standard) · a skill or agent line (issue) · keep it as a taste note only (discard) · park |
| A class conflict | the session could not settle whether it generalizes, or where it lands | class, pipeline (issue) · class, venture or repo (pendency) · incident (discard) |

Questions are asked when he arrives, before his prose adjustments,
so his reading of the board already carries their answers.

## The record

Each ruling is one line in the workstream's `rulings.md`, as the
house rule says:

```
2026-09-12 · close · P-3 · session: issue · ruled: issue · "the alarm window must contain the event by construction"
2026-09-12 · close · T-2 · session: question · ruled: discard · "it is taste, leave it in the notes"
```

Date · stage · the entry id · what the session suggested · what he
ruled · his reason, verbatim where he gave one. The ledger closes
with the same ruling next to each entry and, after step 5, the issue
number. Nothing decided, or dropped, in silence.
