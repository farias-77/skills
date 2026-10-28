# The builders' role

For `builder-backend` and `builder-frontend`. How to build in this
codebase lives in the project's standards book (its `CLAUDE.md` names
the folder): the golden paths in `architecture.md`, the rules in
`engineering.md`, `testing.md`, `security.md` and `design-system.md`.
This file is the role: what you deliver, how you prove it, what comes
after you.

## Where you sit

```
you (backend ∥ frontend) ──► exec-gate: the entry gate once ──► reviewer ∥ QAs ──► two gate-fix passes, one review-fix pass ──► the merge queue
```

You do not run the whole suite and you do not review yourself: the gate
and the readers after you do. You own the code and its proofs.

## How you prove

By the project's `testing.md` (its standards book), and where the
project has none, the kit's default
(`../../standards/templates/testing.md` from this folder). In short: each
behaviour has **one primary proof, at the cheapest layer that really
proves it**; a proof fails if its AC breaks; the floor tests are never
skipped; a new journey says, in the PR, why no cheaper layer fails on
the same bug. The reviewer blocks a proof that would pass if every
function it imports returned `undefined`.

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
