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

## R3 · The tier ladder

The cells name roles; the project's doctrine and golden paths name the
concrete primitive that fills each one (which database, which queue,
which worker, which alarm set, which test floor).

| Part | Lean | Balanced | Hardened |
|---|---|---|---|
| Data | the tables the ACs read; a constraint per invariant | + an index per measured access | + history, soft delete, views |
| Contracts | the routes the screens call; changes only add | + paging and allowlisted filters on growing lists | + idempotency keys everywhere, versions |
| Compute | inside the request, ≤ 3 tries in ~5 s, visible failure | the existing queue + worker, one step per message | + outbox, sweeper, generations |
| Integrations | timeout, one retry layer | + an idempotency key, or reconcile first | + a dedicated identity, an account per environment |
| Security | the floor (D7) | + one cap per abusable endpoint | + caps per identity, abuse alarms |
| Ops | the doctrine alarms the change touches | + one state alarm per new main-path failure | + dashboards, anomaly alarms |
| Tests | the doctrine's test floor (the AC test first) | + journeys for the named failure states | + matrices, load |

## R4 · `sizing.md` and the evolution path

```
# Sizing — <workstream>
Appetite: 6 h · Pick: 5.5 h · Run cost: +US$ 1/month · No-gos: …
## The design          one diagram + one paragraph
## Per part            | Part | Tier | R V C | Why (requirement) |
## One-way doors       door — decided — the user's call: yes/no
## Evolution path      | Part | Now | Signal | Next step | Cost |
```

### The evolution path

Rules:
- The signal carries a number, and something already watches it: an
  alarm, the weekly read, or a runbook query.
- The next step is configuration or code that only adds.
- If moving later would rewrite data, the part is a one-way door.
  Decide it now.

Example rows:

| Part | Now | Signal | Next | Cost |
|---|---|---|---|---|
| Name search | `LIKE`, no index | list p95 > 300 ms or > 10k rows (inference) | trigram index migration | 1 h |
| Publishing | after commit, retry, alarm | a lost event costs money | outbox + sweep | ~1 day |
| Database | smallest managed instance | downtime costs money | the high-availability flag | config |

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
