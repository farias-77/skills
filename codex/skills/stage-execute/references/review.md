# The review

Five lenses, one per way a story fails. All five run every round, in
parallel, in fresh context, on the same diff. Their job is to find
problems; yours is to decide which ones are real. A lens reports at
the maximum bar; the round closes on your ruling, not on its word.

| Lens | Answers |
|---|---|
| `exec-lens-fidelity` | Does the diff deliver the row, all of it and nothing beyond it? |
| `exec-lens-code` | Is this code the house would sign: the code standard whole, DRY, KISS, nothing speculative? |
| `exec-lens-proof` | Do the tests and smoke cases prove the row's behavior on every path: success, 4xx, 5xx, timeout? |
| `exec-lens-security` | Can this be exploited? A finding only with the attack written down. |
| `exec-lens-operations` | Will this be readable and fast in production: logs, error envelope, timeouts, idempotency, queries? |

Each lens gets the diff command, the row's section of the goal, the
paths to the design and the standards, and, in round 2, round 1's
findings with your rulings. Each returns findings with severity
(`blocker`, `fix`, `detail`), the quoted lines, the gap and the fix, or
a clean pass with the list of what it verified. A clean pass without
that list is invalid: send the lens again once, then record it as
unread.

## Ruling

Per finding, one of three:

- **sustained**: real, and it bites: the row builds wrong, cannot be
  proved, or ships a hole. The builder fixes it.
- **deferred**: right observation below that bar, worth one edit at
  its simplest form. The builder applies it with the sustained ones.
- **dismissed**: preference wearing severity, rigor the row did not
  ask for, a detail the code already handles, a mechanism nothing
  forces, or plain wrong. It dies with the reason.

Three tests, in order: is it true (the quoted lines say that); does it
bite (name what breaks or cannot be proved); is it already decided
(`decisions.md`, the goal's "The worker decides", the standards). A
finding whose fix adds a mechanism must name what forces it: an AC, a
decision, a standard rule. Without that, dismiss it as overengineering.

Everything sustained or deferred in round 1 goes to the builder.
Round 2 reads the delta at full strength. What round 2 sustains rides
as a note on the PR and in the report; the story proceeds. Never a
third round: the note is the residue, and the user reads it at the
end. When in doubt between sustained and dismissed on a security or
data finding, sustain.

Write every finding and ruling to `reviews/<N.k>/round-N.md` from the
template, before sending anything to the builder. The PR body carries
only the numbers per round; the file carries the detail.

## Improvements and departures

The builder and the lenses may see a better way than the goal or the
standard names. Two rules:

- An improvement inside the standard, one that removes duplication,
  deletes code or aligns with a rule, is applied and listed in
  `report.md` under "Improvements applied", one line: what, where,
  why.
- A departure from the standard, or a mechanism beyond the goal, is
  applied only when you judge it better for the system as it is, and
  listed under "Departures", with the rule or goal line it leaves and
  why. The user audits both lists at the end; a departure he keeps
  becomes a standard change at the close stage.

An improvement that flattens a layer, skips the repo structure or
reorganizes files outside the story's scope is not an improvement:
organization is part of the standard.

## Counting

The PR body and the report carry, per round: findings per lens,
sustained, deferred, dismissed. The report's review section totals
them per story. A lens that returned nothing valid twice counts as
unread and is named.
