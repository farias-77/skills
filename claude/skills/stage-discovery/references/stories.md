# Stories and acceptance criteria

The source of truth for how the stories are written. The
`discovery-story-writer` reads it before it writes, the review panel before it
judges, and the conductor before it rules. The stories come from
`notes.md`. Nothing in them is new: what the writer had to fill in is
listed under Assumptions, where he can reject it.

A story file is a behavior contract, not a plan. The test for every
line: if the implementation could change without anyone outside
noticing, the line does not belong here.

## The files

| File | Holds |
|---|---|
| `stories.md` | vocabulary, the rules, one block per story, the assumptions, the technical questions for the design, Open |
| `not-building.md` | every capability left out, with its reason |

Templates: [templates/stories.md](../templates/stories.md),
[templates/not-building.md](../templates/not-building.md). The
headings, the id formats and the criterion's shape are what
`discovery.mjs check` reads; keep them as the template has them.

## One criterion per rule

**One acceptance criterion per rule or behavior he decided. Never one
per step, per state or per string.** Every criterion becomes a test
downstream, so the count is the cost: one too many is paid on every
run, one missing is a hole.

A behavior is something the product does when someone acts: it
writes, sends, refuses, keeps, or must not do something. A string
that carries a rule (a refusal, an e-mail's content) is a THEN line
of that rule's criterion. A screen's states, its layout and its other
copy belong to the mock. A small feature has a few criteria per
story; past ten in one story, two of them check the same thing.

## A story

One story per job: the journeys that share an actor and a job. The
happy journey is the main flow; each other journey is an extension at
the step where it branches. Each block carries its actor and job, its
journeys, the flow, its criteria, its error-path table, what is In,
and the not-building ids that touch it.

**Each story stands alone.** A reader who gets one block, the
vocabulary and the rules it cites must be able to say what to build
and how to judge it. So a block cites only its own criterion ids, and
names another story's criterion in words ("the limit criterion of
S-001").

## A criterion

```
- **`J2.s2.1`** [INV-1] GIVEN Marina Okafor's workspace has sent 10 invites today, 2 of them cancelled
  WHEN she sends an invite to joao.lima@example.com
  THEN the form shows "You reached today's 10 invites. The count resets at midnight." (seen: screen)
  AND no invite row exists for joao.lima@example.com (seen: row read back)
  AND no e-mail reaches joao.lima@example.com (seen: inbox)
```

| Part | Rule |
|---|---|
| id | `J<journey>.s<step>.<n>`: the step of the notes' journey where the behavior first shows. Assigned once; never renumbered, never reused. After his approval the ids are frozen and every later stage cites them |
| `[ ]` | the rule ids it checks, from the Rules table, or its own story id when no numbered rule covers the behavior. A rule id sits in exactly one criterion |
| GIVEN | the state before the event, with named fixtures. A state, never a list of clicks |
| WHEN | exactly one event, said as what the person or the clock does |
| THEN, AND | one outcome per line, each ending with where it is seen: `(seen: screen)`, `row read back`, `inbox`, `response`, `event`, `log`, `alarm` or `file` |
| values | literal and real: a name, a number with its unit, a date and hour, the exact words on screen. They come from the notes' examples. "Quickly", "correctly", "properly" judge nothing |
| must not | what must not happen is a line of its own ("no e-mail reaches…", "the count stays 10") |
| boundary | a rule with a number gets its one criterion at the boundary: the 11th refused, the 10th kept |

Fixture names and e-mails are invented, on reserved domains
(`example.com`). A real person's name is personal data and never
appears.

**The expected value is never computed by you.** It is what he said,
or what a system of record holds. When the notes do not say what
should happen in a case, that is a line under Open, not a criterion
with a plausible outcome.

## The four error paths

Every story has the table: **limit** (a boundary or invalid input),
**dependency failure**, **permission**, **repeat** (a double submit,
two tabs, a retry). Each row lands on one of:

- a step and the criterion that proves it (the refusal, and what is
  not written);
- a not-building id, when he left that path out;
- `n/a: <why>`, when the path cannot happen here (a read-only list
  has no repeat).

A row with none of these is a line under Open.

## not-building.md

One line per capability left out, in one of two kinds:

```
- **NB-1** — Inviting many people at once — not building: one at a time covers the team sizes he named
- **NB-4** — Resending a pending invite — later: he wants to see how often invites expire first
```

The reason is his, quoted or close to it, or yours when he accepted
it. The predictable next requests of a feature (for invites: resend,
revoke, bulk) are each built or listed here. A story names the ids
that touch it.

## Assumptions, For the design, Open

- **Assumptions** (`A-1`…): everything written that he neither said
  nor accepted, each with its source and its cost if wrong (`cheap`
  or `costly`). The stories state it as fact so the text reads as
  one; this list lets him reject it. It is shown at the gate as
  "decided for you".
- **For the design** (`T-1`…): questions whose answer is a mechanism
  (a lock, a retry policy, how long a row is kept). Never asked to
  him; stage 2 opens on them.
- **Open**: what could not be settled from the notes. Empty before
  the gate.

## Work with no screen

When no screen changes, the stories carry the same criteria, and the
conductor shows him three to five cases instead of a mock: the data
before, the action, the data after, each with real values and the ids
it proves. For a migration or a refactor, the existing behavior is
the oracle and one criterion says so: the same input gives the same
output as today.

## The mechanical proof

```
node <discovery.mjs> check <workstream>
```

It proves that every rule has exactly one criterion, every criterion
has one GIVEN, one WHEN, one THEN and a `(seen: …)` on every outcome,
every id resolves (journeys, steps, rules, not-building, the tour's
`proves`), each error-path table has its four rows, the rules match
the notes', and no frozen id is gone. `--gate` also requires Open
empty and, with a screen, the lock. It must pass before the review
and again before the gate.
