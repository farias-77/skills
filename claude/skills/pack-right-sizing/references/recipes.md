# Right-sizing: recipes

Longer patterns behind [../SKILL.md](../SKILL.md).

## R5 · Default values

- **Synchronous call, human in the loop:** up to 3 attempts in about
  5 s, then a visible failed state and a log line that alarms.
- **Push consumer:** the broker's backoff and dead-letter carry the
  retries; the handler returns non-2xx and never loops.
- **Batch job:** the runner's task retries carry it; the run is
  idempotent and is not wrapped in a loop.
- **Alarms:** on a state, each with an action and a runbook, plus the
  budget alert.
- **Caps:** one per abusable endpoint, with the value in config.

## R4 · The evolution path

The proposal's "What changes if it grows" and `solution.md`'s copy of
it: one row per thing the design relaxed.

Rules:
- The signal carries a number, and something already watches it: an
  alarm, the weekly read, or a runbook query.
- The next step is configuration or code that only adds.
- If moving later would rewrite data, the part is a one-way door.
  Decide it now.

Example rows:

| Relaxed now | Signal | Add | Cost |
|---|---|---|---|
| Name search: `LIKE`, no index | list p95 > 300 ms or > 10k rows (inference) | trigram index migration | 1 h |
| Publishing: after commit, retry, alarm | a lost event costs money | outbox + sweep | ~1 day |
| Database: smallest managed instance | downtime costs money | the high-availability flag | config |

## One platform's retry defaults (example: Google Cloud)

These are the defaults behind "the broker's backoff carries it" on one
platform. Check the equivalent defaults on whatever platform the
project runs.

- **Pub/Sub push subscription:** exponential backoff (default 10–600 s)
  and dead-letter after 5 attempts (the default; range 5–100). The
  handler returns non-2xx and never loops.
- **Cloud Run job:** tasks retry 3 times by default (range 0–10). The
  run is idempotent and is not wrapped in a loop.
- **Cloud Scheduler:** its own retry config; a job behind it carries no
  loop of its own.
