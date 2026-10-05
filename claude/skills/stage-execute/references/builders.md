# The builders' role

For `builder-backend (Opus 5.5, medium)` and `builder-frontend (Opus 5.5,
medium)`. How to build in this codebase lives in the product's own
standards and golden paths (its `CLAUDE.md` names them); this file is
the role: what you deliver, how you prove it, what comes after you.

## Where you sit

```
you (back ∥ front) ──► exec-gate: the entry gate once ──► reviewer ∥ QAs ──► one fix pass at most ──► the merge queue
```

You do not run the whole suite and you do not review yourself: the gate
and the readers after you do. You own the code and its proofs.

## The testing rule

Test what a user or an attacker would notice. Each behaviour has **one
primary proof, at the cheapest layer that really proves it.**

| Layer | Proves | Not for |
|---|---|---|
| unit, server | a rule, a limit, a scope, a transition | SQL, HTTP |
| unit, front | pure logic: a format, a displayed calculation, a language, a theme | what needs a screen |
| integration (API in process, a real database) | SQL, permission, scope, idempotency, concurrency | what the user sees |
| journey (browser) | one flow: action → result → reload → still there | the limits of a rule |
| intercepted state | only what the API cannot produce on demand (a 500, a 429) | what the API produces |

- **One proof, not three.** The limit in a unit test, the wiring in one
  journey per flow. A matrix (language, theme, role, tier) is rows of
  one table at the cheapest layer; in the browser only when the AC is
  about that dimension.
- **A proof fails if the AC breaks.** Assert state and effect, never
  markup or an internal call. An expected value is a literal, never the
  code's own formula. Would it pass if every function it imports
  returned `undefined`? Then rewrite it or delete it: no new test beats
  a bad one. See a new proof red for the right reason before green.
- **Deterministic.** Time, ids and randomness injected; no sleep; a wait
  has a deadline and an observable condition; each test creates its own
  data.
- **The database is never mocked.**
- **The floor, always, where the rule exists:** a permission or scope
  rule has an API test (another unit's actor is refused, nothing
  written); authentication before the body; a security fix comes with
  the test that reproduces it, red before, green after; "only once"
  (two concurrent requests, a repeated confirmation) has a test through
  the real stack. The project tags these as its floor.
- **Look before you add.** A test that already owns the behaviour is
  extended, not duplicated.
- **Never:** a screenshot or a recorded red for the record, mutation
  scaffolding, fuzz outside a public decoder, a test that pins a stub,
  copy pinned unless the AC is about the copy, an assert loosened to
  fit the code.

The gate measures coverage by function: every new or changed function
runs in some test. That is a floor, not a target.

## Try it once

When the change has an endpoint or a screen: bring the worktree's stack
up (the project's stack command), do the AC once as its actor, look at
what comes back, and write it in `tried`, one line ("`POST /orders` as
leader → 201, listed as pending"). One try, not a test run. Bring the
stack down if you brought it up.

## While you build

- Subtract before you add: what the change lets you delete goes first.
- A new value threaded through three or more layers asks for a direct
  path.
- Three similar pieces beat a premature abstraction.
- The urge to comment is a rename, an extraction or a type; a
  constraint you would explain becomes a test.
- The same edit in many files is a script, committed with the change.

## What blocks after you

The reviewer blocks only on the six classes in `review.md`, in this
folder. Build so none applies.

## What you return

The exec-entry workflow's schema: your head, the commits, the fast
check, one proof per AC, `tried`, the files, what you changed outside
the brief's Owns and why, what you decided where the brief was silent,
and only the questions that need the user in person.
