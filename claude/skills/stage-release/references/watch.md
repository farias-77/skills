# The watch — the proofs the audit deferred, and the hotfix

The audit lists what it could not prove before production and sent to
production: the first scheduled run, an alarm's first evaluation
against real data, a cost line after a day. In an earlier run one of
them stayed implicit and the user found out by a false alarm in his
inbox. Here every one is a step with
an hour, and the stage does not close before it is read.

## The list

From the audit's residue deferred to production, plus every check the
design's rollout writes for "after the first <run/day/evaluation>". Each becomes a row in the plan's watch table
and a step in `release.json` `watch[]`: what · the hour it can be
read (absolute, UTC, from the design's schedule; the earliest hour
at which the evidence exists, not a round number) · what it expects ·
the command that reads it.

## The wait

A proof's hour is an external wait: schedule the wakeup for that
hour and end the turn. Never a loop that checks early; never a turn
held open. The wakeup fires, the session runs the command, saves the
output to `04-release/proof/watch-<n>.txt`, compares with what was
expected, writes the trace line, updates `release.json`, and either
schedules the next hour or, when this was the last, closes the stage
(SKILL.md step 7). A wakeup that did not fire (the session was
resumed later) is read as soon as the session is back: the evidence
is still there.

**48 h.** A proof whose hour is more than 48 h after production
is not waited for. It is listed in the report and in `release.json`
as a pendency with an owner (the venture's operations, the next
demand), and the close stage carries it. The plan said so before the
goal.

## Green and red

Green: the trace line, the row in `release.json` with `got` and
`ok: true`, the file. Red: the regression is real or the expectation
was wrong. The session reads before deciding — the alarm's history,
the run's log, the metric with the exact expression — and writes what
it found in the trace. A wrong expectation (the alarm fired on a
window alignment the design did not foresee, the metric fills the
open window) is a hotfix when the code is wrong and a note when only
the proof was; the note names the design section that has to change,
for the dreaming.

## The hotfix

A regression seen at the watch, or reported by the user while the
workstream is not closed: the hotfix of SKILL.md — the fix as entry
`R.<n>` through exec-entry from `main`, the ask, production, `main`
merged back into staging. The proof that failed is read again at its
next hour when the fix changed what it measures.

## The end

When every watch row is read (or listed as a pendency) and no hotfix
is open: `release.json` `close` written (the date, every artifact's
version and sha in production, the stops, the residue with owners), the
build, `.state.md` → `stage: close`, the commit, the one
`PushNotification`, the report. The user returns to this session
or opens the next stage; nothing here runs until he does.
