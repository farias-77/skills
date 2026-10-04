---
name: pack-right-sizing
description: Right-sizing a design at the "basics done well" bar; read it before writing or cutting a design proposal, writing its evolution path, or reviewing whether a mechanism needs to exist at all.
user-invocable: false
---

# Pack: right-sizing a design

## 1 · When this pack applies

Read it before you write or judge a design: the proposal, its cuts,
its evolution path, or a review asking "does this need to exist?".
Readers: `architect (Opus 5.5, high)`, `overengineering-critic (Opus
5.5, medium)` and the design conductor `(Opus 5.5, high)`; at stage 3,
`planner (Opus 5.5, high)` and `plan-reviewer (Opus 5.5, medium)` size
a node the same way; at stage 4, `builder (Opus 5.5, medium)` holds
list C.

**The bar is "basics done well":** the simplest design that meets
every acceptance criterion and the whole floor (list D), built from
the primitives the project already runs. Every mechanism names what
forces it. What a bigger design would add is relaxed, and written as
an evolution path. The failure this pack prevents: a feature that
should take an hour turning into a day of hardening on top of
hardening.

Precedence: the user's words and rulings, then the project's doctrine
and golden paths, then this pack. The doctrine decides the primitives
already running (the database, the worker, the scheduler, the queue),
the alarm set, the test floor, which deferrals it has already named
(an outbox, high availability) and how the system grows; where this
pack gives a default, the doctrine's choice wins.

## 2 · Principles

1. **Bound the work before designing.** Write the no-gos first, from
   the stories' Out lines. *Why:* "Appetites start with a number and
   end with a design" (Shape Up).
2. **Every mechanism names its requirement:** a story AC, a doctrine
   rule, a measured signal or a one-way door. *Why:* a mechanism built
   for a guessed need pays build, delay and carry costs (Fowler,
   YAGNI).
3. **Each part starts at the basic version** and gets more only when
   its score forces it (§5 R2). *Why:* "find the simplest solution possible, and only increase
   complexity when needed" (Anthropic). Prefer growth by changing
   configuration over changing the design.
4. **Spend care only on one-way doors.** Data shape, public contract,
   identity, third-party state, money, deletion and a message sent.
   *Why:* Type 1 process on Type 2 decisions brings "slowness,
   unthoughtful risk aversion" (Bezos).
5. **Use a primitive you already run** (a database row, the existing
   worker, the scheduler) before a new service, vendor or library; ask
   why not a few dozen lines of your own before a dependency. *Why:* a
   company gets about three innovation tokens (McKinley).
6. **Size reliability to the user.** If a human can redo the action,
   the human is the retry. *Why:* "100% is probably never the right
   reliability target" (SRE).
7. **Retry in one layer per path; dedup in one place per effect.**
   *Why:* retries multiply; three layers of 4 attempts make 64 calls
   (SRE).
8. **Alarm only on a main-path failure that has an action.** *Why:*
   "Every page should be actionable" (SRE). An alarm for a
   hypothetical case is noise.
9. **Write every "not now" as an evolution path:** the signal with its
   number, the next step and the cost. *Why:* a deferral becomes a
   decision someone can trigger.
10. **Simple does not mean basic.** The floor (list D) and the review
    never shrink. *Why:* trimming review by guessed risk level
    undervalues the task that turns out to matter.

## 3 · The checklist

Every item is pass/fail on the proposal or a design document.

**A · The proposal (architect)**

- A1. One solution, not options. It meets every AC and the whole floor
  (list D); a proposal that fails an AC is not basic, it is broken.
- A2. Every part and every mechanism names its requirement: an AC, a
  floor item, a doctrine rule, a one-way door, the user's words.
- A3. The one-way doors are named and decided now: data shape, public
  contract, identity, third-party state, money, deletion, a message
  sent.
- A4. A disagreement with the user's idea names a concrete reason (an
  AC, a floor item, a cost, a door, the doctrine), never taste.

**B · The evolution path**

- B1. Everything relaxed has a row: the signal with its number, what
  already watches it, what to add, the cost.
- B2. The next step is configuration or code that only adds. If moving
  later would rewrite data, it is a one-way door: decide it now.

**C · Overengineering flags.** Each one is a defect unless the line
cites its requirement.

- C1. A mechanism with no named requirement. Test every mechanism noun:
  table, column, index, route, topic, job, sweeper, cap, flag, knob,
  alarm, panel.
- C2. A retry on top of a retry: a loop in a push consumer that the
  broker already retries, a loop around a job task the runner already
  retries, a loop behind a scheduler retry, a client retry over a
  server retry.
- C3. Two dedup or idempotency points for one effect.
- C4. An alarm for a hypothetical case (a compromise, abuse at zero
  volume), an alarm with no action or runbook, or an alarm per data
  event.
- C5. Two detection paths for the same failure mode.
- C6. A new component (service, queue, vendor, library, table,
  identity) where an existing primitive works.
- C7. A queue, worker or state machine where a human is in the loop and
  the work fits in the request.
- C8. A column, table or index with no reader or no measured access
  pattern.
- C9. The same fact stored in two places.
- C10. Configurability nobody asked for: a knob, a flag, an interface
  with one implementation, a helper with one call site.
- C11. More than one anti-abuse cap on an endpoint that has no traffic
  yet.
- C12. A control against trusted internal actors with no incident
  behind it.
- C13. A new account, identity or environment split for a risk that
  exists only in alpha.
- C14. Scale work for a limit months away, when configuration would
  carry it.
- C15. A test that proves nothing new, such as rerunning the same
  assertions under the second theme, or a "webview" test that only
  swaps the user agent.
- C16. A dashboard panel that nobody decides anything from.
- C17. A control for a risk the user already accepted in an earlier
  workstream (check its `rulings.md`).

**D · The floor.** Never traded for speed; the architect meets it and the reviewer checks it.

- D1. An external effect whose outcome can be unknown carries an
  idempotency key or is reconciled before it repeats.
- D2. Every at-least-once consumer is idempotent by event id or natural
  key.
- D3. Every critical invariant has a DB constraint.
- D4. An effect with no human in the loop survives a restart: a queue
  plus a dead-letter alarm.
- D5. No failure ends silently. Even the basic version shows a failed
  state and logs a line that alarms.
- D6. No transaction stays open across a network call.
- D7. No PII in logs or payloads. Secrets live in the secret manager.
  Each piece has its own service identity. Authorization runs in the
  use case.
- D8. Nothing deletes or deactivates on incomplete data.
- D9. Data that cannot be rebuilt later is kept now: the raw source,
  the record of an acceptance.
- D10. Schema changes go expand → backfill → contract, and contracts
  only grow.

**E · Review hygiene**

- E1. A lens reports against the requirement and the floor, and is
  never told to "be conservative", because that makes it under-report.
  The conductor keeps a finding only if it names the failure, who sees
  it, how likely it is and the requirement. Anything else is optional.
- E2. "Nothing to cut" or "nothing missing" is a complete answer.
- E3. A fix that adds a mechanism must pass list C first.

## 4 · Anti-patterns

**Hardening on hardening.** Typical proposals and what they should
have been:

| Proposed | Right-sized |
|---|---|
| A signup draft that resumes in any browser, with two links per lead and a sweeper | "start again", one link per lead, a linear signup |
| Four caps on an e-mail code endpoint at zero volume, then a later "notice + restart cap" | fix the copy |
| Dedup in the webhook and again in the worker | one dedup, in the worker |
| A trigram index for a few hundred rows | a plain `LIKE` on a normalized name, the index as an evolution path |
| A dashboard panel per route | only the panels that decide something; the rest are log queries |
| A dedicated admin account; a separate vendor account for alpha | the operator's own account; one vendor account |
| Alarms on a delete and on webhook signatures | alarm only for failures that actually happen |
| A queue in front of an e-mail a human can resend | a synchronous send with 3 tries |
| A sync every quarter hour and a tasks table | an hourly sync and the name stored on the record |

**What feeds it.** Review rounds that close at a high finding count
and sustain nearly everything: a sustained "gap" tends to come back as
a new mechanism. "A reviewer prompted to find gaps will usually report
some, even when the work is sound … Chasing every finding leads to
over-engineering" (Claude Code docs).

**Generic slop (inference):** an outbox on day one; a circuit breaker
around one low-volume vendor; flags for a change with one audience; API
versioning on an internal console; a generic repository or DI
container; a cache before any slow read was measured; generations where
a status column and one guard would do.

**Not overengineering** (each has its requirement):
- a queue and worker for a slow external setup whose vendor
  fails, with no human in the loop;
- a sweeper that turns stuck states into visible failures;
- a window of raw snapshots kept so the database can be rebuilt;
- a timeline the user asked for.

## 5 · Core recipes

### R1 · The procedure

1. **Bound the work.** Read the lock and the recon. Write the no-gos.
   If the stories do not fit, say so to the conductor. Never widen
   scope quietly.
2. **Trace each AC.** For the server, one line per AC:
   `entry → use case → writes → effects`. Circle every effect that
   leaves the process; those are the doors and the retries.
3. **Write the basic version.** Use the primitives already running.
   For each circled effect ask "what if it half-succeeds?", then patch
   with the smallest fix, or declare the case out of bounds and say who
   notices it.
4. **Give care where the score forces it** (R2), and nowhere else.
5. **Write what was relaxed** as the evolution path (B1, B2).
6. **Cut.** `overengineering-critic (Opus 5.5, medium)` runs list C; the architect applies
   or rebuts each cut with the requirement the mechanism serves.

### R2 · Where care goes

The scale is our own construction (inference), built on Bezos, SRE and
YAGNI. Score each part where the basic version could fail.

| | R: risk if the basic version fails | V: how hard to add more later |
|---|---|---|
| 1 | cosmetic; the user retries; fixed at once | a config change, or code that only adds |
| 2 | a user is blocked or files a ticket; fixed by hand within a day | a migration with backfill, or code across modules |
| 3 | data lost or wrong, money, PII, a silent failure, legal | one-way: data that can't be rebuilt, a contract in use, third-party state, a message sent |

With need = R × V:
- need ≤ 3 → the basic version.
- need 4 → the basic version plus an evolution-path row.
- need 6 or 9 → the cheapest care that closes the failure or the door,
  now.
- A tie → the basic version.

The other recipes are in [references/recipes.md](references/recipes.md):
**R4** the evolution path, **R5** the default retry, alarm and cap
values, and one platform's retry defaults. **§6**, the mechanical
checks with the `req:` trace convention, is
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md). Agents cite this pack
by these numbers (§3 C1, §5 R2); keep them when editing.
