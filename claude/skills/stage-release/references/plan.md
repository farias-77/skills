# The release plan — what he reads before the goal

The plan is the whole stage written down before it runs. Its test:
a reader who knows the repos can predict every command the session
will type and every check it will read, and finds nothing in it that
needs the user after the goal. What needs him is the pre-flight, and
the pre-flight ends before the goal.

## Where it comes from

| Section | Source |
|---|---|
| What ships | `03-execution/audit.md` Close (the shas, alpha at them, the residue he accepted) · `waves.md` (the waves and their stories) · `origin` re-read |
| Pre-flight | the design's `rollout.md`: every step marked `(gate: needs the user)`; `02-plan/team.md` pre-flight items still open; anything in "Stays with the user" with a placeholder in the code |
| The train | `rollout.md` deploy order and cutover steps; fallback producer-first; the repo's `CLAUDE.md` flag that says whether merge is deploy (Lane B) |
| Versions | the last tag per repo and the conventional commits since (the scribe confirms at step 3) |
| Rollback | `rollout.md` "the way back" per step; the data changes the design's `data-model.md` lists as expand → migrate → contract |
| The watch | the audit Close's residue with owner `stage 5`: each with the hour the design gives it (the first scheduled run, the first alarm evaluation, the first day of prod) |
| Where it stops | the third red on a step; a rollback `rollback.md` marks not safe for data; anything else the session would have to ask |

## The pre-flight

One line per thing only he can do, in the shape the plan template
gives: what · why the session cannot · **done** (date) or
**delegated**: how the session does it in his place (the file with
the value, the CLI it may use, the account it may act in). A
delegated line names where the value lives (an SSM parameter, a
file outside the repos), never the value. The session does the
delegated lines itself at the step where the rollout needs them,
and never asks about them again.

A pre-flight line that is neither done nor delegated at the goal is
done then, in the same message, or the goal is not complete: say so
in one line and end the turn.

## The train table

```
| # | Repo | Lane | Run | Check (read-only) | If red |
|---|---|---|---|---|---|
| 1 | labs-api-ingestion | A | git checkout v1.0.0 && npm run deploy:prod -- data service | describe-table runs ACTIVE, PITR, scheduler DISABLED, 4 lambdas nodejs22 arm64 | rollback/labs-api-ingestion.md §way back |
```

Run and check are copied from `rollout.md`, never paraphrased; a
check the rollout writes as a sentence is turned into the command
that reads it and the value expected. Steps of one repo stay
together; a Lane B repo's step is "merge PR #n, tag the merge sha,
check the live site".

## Versions and rollback

A row per repo: the last tag on `main` (`none` when there is none),
the bump the commits imply, the version expected. The scribe's
result may differ (a commit that did not parse, a breaking footer
missed); the difference is a trace line and a note in the report,
never a question. The rollback per repo is a pointer to the file the
session will write before the tags, with the one line that matters
now: safe for data, or not, and why.

## The watch

A row per deferred proof: what the audit deferred · the hour it can
be read (absolute, UTC, from the design's schedule) · what it expects
· how it is read (the command). A proof more than 48 h from the
expected end of the train is listed with "pendency with an owner"
in the last column: the stage will not wait for it.

## Where the session stops

Explicit, so that he knows before the goal: the third red on one
step (the train is stopped at that repo, prod rolled back and
verified, the message names the step and the evidence); a rollback
that is not code-only (a contracted field, a migrated shape) — the
plan says so here, from `rollback.md`, and the session stops before
that deploy rather than after a red; a pre-flight line that turns out
to be missing at the step. Nothing else stops the train.

## The gate

Print the plan as tables in the reply (what ships · pre-flight · the
train · versions · watch · stops), name the file, end the turn. His
reply in prose is the ruling: apply the changes to the file, print
the changed sections, end the turn again. **The goal** is his line
that says to conduct it; record it verbatim in `trace.md` with the
hour, and in `release.json` as `goal`. Then nothing waits for him.
