# The watch: proofs with their own hour

Most of what the audit sent to production is read before the report:
the smoke, the bake and the alarms' first evaluation (step 6). What
remains are the proofs whose evidence does not exist until a later
hour: the first scheduled run, the first real data, a cost line after
a day. Each one is a step with an hour. The stage is not `closed`
until every one is read or owned. In an earlier run one stayed
implicit, and the user found out from a false alarm in his inbox.

## The list

The rows come from the audit's residue deferred to production, plus
every check the design's rollout writes for "after the first
<run/day>". Each becomes a row in the plan's watch table and in
`release.json` `watch[]`:

- what;
- the hour it can be read: absolute, UTC, from the design's schedule.
  It is the earliest hour the evidence exists, not a round number;
- what it expects;
- the command that reads it.

## What is not a row

An alarm's first evaluation is not a row. Step 6 reads it once after
the bake and writes it as read. From then on the alarm watches on its
own and notifies whoever it notifies. Twice in a row a user cancelled
a scheduled hour that waited on an alarm: off-peak it reads "no
datapoints", and at peak it shows nothing the alarm would not send by
itself.

## The wait

A proof's hour is an external wait. Schedule the wakeup for that hour
and end the turn. Never loop to check early, and never hold a turn
open. When the wakeup fires, the session:

1. runs the command;
2. saves the output to `04-release/proof/watch-<n>.txt`;
3. compares it with what was expected;
4. writes the trace line;
5. updates `release.json` and rebuilds the blueprint;
6. schedules the next hour, or, when this was the last row, moves
   `.state.md` to `stage: close`.

The stage report was already sent at step 8. A watch row changes the
blueprint, not the video or the slides. A wakeup that did not fire
(the session was resumed later) is read as soon as the session is
back, because the evidence is still there.

**48 h.** A proof whose hour is more than 48 h after production is
not waited for. It goes into the report and `release.json` as a
pendency with an owner (the project's operations, the next demand),
and the close carries it.

## Green and red

**Green:** the trace line, the row with `got` and `ok: true`, the
file.

**Red:** either the regression is real or the expectation was wrong.
The session reads before deciding: the alarm's history, the run's
log, the metric with its exact query. Then it writes what it found in
the trace.

- **The code is wrong:** that is a hotfix, and because the session
  started it, it asks him first (a new artifact).
- **Only the expectation was wrong:** that is a note in
  `dreaming-notes.md` naming the design section that has to change.

The failed proof is read again at its next hour when the fix changed
what it measures.
