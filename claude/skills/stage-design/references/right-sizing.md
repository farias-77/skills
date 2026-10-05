# Right-sizing a design

Read by `architect (Opus 5.5, high)`, `overengineering-guard (Opus 5.5,
medium)` and the conductor (Opus 5.5, high) before a proposal is
written, cut or ruled. Cited by section number (§3 C4, §4 R2); keep
the numbers when editing.

## 1 · The bar: the basics done well

The simplest design that meets every acceptance criterion (AC) and the
whole floor (§3 D), built from the primitives the project already
runs. Every mechanism names what forces it. What a bigger design would
add is written as the evolution path, never built now. The failure this
prevents: an hour of feature turning into a day of hardening on top of
hardening.

Precedence: his words and rulings, then the project's standards, then
this file. The standards fix the primitives already running, the alarm
set, the test floor and how the system grows; where this file gives a
default, the standards win.

## 2 · Principles

1. **Bound the work first.** Write the no-gos from the stories' Out
   lines before designing.
2. **Every mechanism names its requirement:** an AC, a floor item, a
   standards rule, a one-way door, or his words. A mechanism built for
   a guessed need pays build, delay and carry costs.
3. **Each part starts at its basic version** and gets more only when
   §4 R2 forces it. Prefer growth by configuration over growth by
   redesign.
4. **Care goes to one-way doors only:** the data's shape, a public
   contract, identity, money, deletion, a message sent, third-party
   state.
5. **A primitive you already run** (a row, the existing worker, the
   scheduler) before a new service, vendor or library.
6. **Size reliability to the user.** When a human can redo the action,
   the human is the retry.
7. **One retry layer per path; one dedup point per effect.** Three
   layers of four attempts make 64 calls.
8. **An error logs one line the existing alarm catches.** A new alarm
   only for a main-path failure that has an action someone takes.
9. **A flag only with more than one audience.** A change everyone gets
   at once has no flag.
10. **Every "not now" is a version on the evolution path:** the signal
    with its number, who watches it, what to add, the cost.
11. **Simple is not basic.** The floor and the review never shrink.

## 3 · The checklist

Pass/fail on the proposal or a document.

**A · The proposal**

- A1. One solution, not options. It meets every AC and the floor; one
  that fails an AC is broken, not basic.
- A2. Every part and mechanism names its requirement.
- A3. The one-way doors are named and decided now.
- A4. A disagreement with his idea names a concrete reason (an AC, a
  floor item, a cost, a door, a standard), never taste.

**B · The evolution path (v1 → v2 → v3)**

- B1. v1 is what gets built. Each later version has the signal that
  triggers it (with a number), what already watches that signal (an
  alarm, a query, the weekly read), what it adds, and the cost.
- B2. The step to the next version is configuration or code that only
  adds. If moving later would rewrite data, it is a one-way door:
  decide it now.

**C · Overengineering flags.** Each is a defect unless the line cites
its requirement.

- C1. A mechanism with no named requirement. Test every noun: table,
  column, index, route, topic, job, sweeper, cap, flag, knob, alarm,
  panel.
- C2. A retry on top of a retry (a loop in a consumer the broker
  already retries; a client retry over a server retry).
- C3. Two dedup or idempotency points for one effect.
- C4. An alarm for a hypothetical case, an alarm with no action, an
  alarm per data event.
- C5. Two detection paths for one failure mode.
- C6. A new component (service, queue, vendor, library, table,
  identity) where an existing primitive works.
- C7. A queue, worker or state machine where a human is in the loop
  and the work fits in the request.
- C8. A column, table or index with no reader or no measured access.
- C9. The same fact stored in two places.
- C10. Configurability nobody asked for: a knob, a flag with one
  audience, an interface with one implementation, a helper with one
  call site.
- C11. More than one anti-abuse cap on an endpoint with no traffic yet.
- C12. A control against trusted internal actors with no incident
  behind it.
- C13. A new account, identity or environment for a risk that does not
  exist yet.
- C14. Scale work for a limit months away that configuration carries.
- C15. A test that proves nothing new (the same assertions under the
  second theme).
- C16. A dashboard panel nobody decides anything from.
- C17. A control for a risk he already accepted (`rulings.md`).

**D · The floor.** Never traded for speed; the project's standards may
add to it.

- D1. An external effect whose outcome can be unknown carries an
  idempotency key, or is reconciled before it repeats.
- D2. Every at-least-once consumer is idempotent by event id or
  natural key.
- D3. Every critical invariant has a database constraint.
- D4. An effect with no human in the loop survives a restart.
- D5. No failure ends silently: the basic version shows a failed state
  and logs a line that the existing alarm catches.
- D6. No transaction stays open across a network call.
- D7. No personal data in logs or payloads; secrets in the secret
  manager; authorization in the use case.
- D8. Nothing deletes or deactivates on incomplete data.
- D9. Data that cannot be rebuilt later is kept now (the raw source,
  the record of an acceptance).
- D10. Schema changes expand → backfill → contract; contracts only
  grow.

**E · Cutting without looping**

- E1. A cut **blocks** only with a concrete quote of what serves no AC
  and no real risk: built for something nobody asked for.
- E2. "Could be simpler" is never a blocker and never starts another
  round. It is a note at most; the design that works stands.
- E3. "Nothing to cut" is a complete answer.
- E4. A fix that adds a mechanism passes list C first.

## 4 · Recipes

### R1 · The procedure

1. **Bound the work.** Read the lock and the recon; write the no-gos.
   If the stories do not fit, say so; never widen scope quietly.
2. **Trace each AC** on the server: `entry → use case → writes →
   effects`. Circle every effect that leaves the process: those are
   the doors and the retries.
3. **Write the basic version** with the primitives already running.
   For each circled effect ask "what if it half-succeeds?" and patch
   with the smallest fix, or declare the case out of bounds and say who
   notices it.
4. **Give care where R2 forces it**, nowhere else.
5. **Write the versions** (B1, B2).
6. **Cut.** The guard runs list C; the architect applies or rebuts
   each cut with the requirement the mechanism serves.

### R2 · Where care goes

Score each part where the basic version could fail.

| | R: risk if the basic version fails | V: how hard to add more later |
|---|---|---|
| 1 | cosmetic; the user retries; fixed at once | a config change, or code that only adds |
| 2 | a user is blocked or files a ticket; fixed by hand within a day | a migration with backfill, or code across modules |
| 3 | data lost or wrong, money, personal data, a silent failure, legal | one-way: data that cannot be rebuilt, a contract in use, third-party state, a message sent |

Need = R × V: ≤ 3 → the basic version · 4 → the basic version plus a
version on the path · 6 or 9 → the cheapest care that closes the
failure or the door, now · a tie → the basic version.

### R3 · Default values

- Synchronous call with a human in the loop: up to 3 attempts in about
  5 s, then a visible failed state and a log line.
- Push consumer: the broker's backoff and dead-letter carry the
  retries; the handler returns non-2xx and never loops.
- Batch job: the runner's task retries carry it; the run is idempotent.
- Caps: one per abusable endpoint, the value in config.

### R4 · An evolution path

| Version | What it is | Signal to move (number) | Who watches | Cost |
|---|---|---|---|---|
| v1 | read on demand, no index | — | — | built now |
| v2 | an index on `status` | list p95 > 300 ms or > 10k rows | the existing latency alarm | 1 h |
| v3 | a push when there are many items | "managers miss notices" reported twice in a month | the weekly read | ~1 day |

## 5 · Examples

| Proposed | Right-sized |
|---|---|
| Four caps on an e-mail code endpoint at zero volume | fix the copy; one cap |
| Dedup in the webhook and again in the worker | one dedup, in the worker |
| A trigram index for a few hundred rows | a plain `LIKE` on a normalized name; the index is v2 |
| A queue in front of an e-mail a human can resend | a synchronous send with 3 tries |
| A cron to expire rows | expiry computed on read |
| An audit table no AC reads | nothing; a log line |

**Not overengineering** (each has its requirement): a queue and worker
for a slow external setup with no human in the loop; a sweeper that
turns stuck states into visible failures; raw snapshots kept so data
can be rebuilt; a history he asked for.
