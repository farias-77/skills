# The six documents

Read by every `design-writer (Sonnet 5.5, high)`, by the
`architect (Opus 5.5, high)` when it writes `solution.md`, by the four
lenses, and by the conductor. The documents are machine input: stage 3
cuts them into entries without asking, stage 4 builds from them. Write
to be consumed, not admired.

## What each one carries

| # | Document | Carries | Never carries | Written by |
|---|---|---|---|---|
| 1 | `solution.md` | the closed proposal, expanded: the parts, the flows step by step, the names, the versions (v1 → v2 → v3), the decisions and where the architect disagreed with him | columns, JSON, test cases | `architect` |
| 2 | `data-and-contracts.md` | tables and expand-only migrations; one **Contract** per feature (see `contracts.md`); events, when there are any | why the design is shaped so (that is `solution.md`) | `design-writer` |
| 3 | `tests.md` | each AC by id → the layer that proves it and what the proof asserts; one walk per journey, one test step per AC; the floor tests the demand touches | the AC's text (cited by id only); status codes or JSON fields as the proof | `design-writer` |
| 4 | `operations.md` | migration and rollout order, flags (usually "None."), the alarms that would wake someone, rollback per step, and the **Resources** table | dashboards nobody decides from | `design-writer` |
| 5 | `security-and-access.md` | who can do what and where it is checked, another user's or scope's data, secrets, personal data (what is stored, who sees it, how long), the floor cases this demand touches | generic security advice | `design-writer` |
| 6 | `screens.md` | each screen of the locked mock mapped onto the real frontend: the route, the component it extends, the states it reaches, the mock frames it follows, the data it shows (the contract that serves it), what the mock fakes | copy rewritten (the mock's copy is the copy) | `design-writer` |

**A document with nothing to carry** (a landing section with no table,
no resource, no new access rule) is one line written by the conductor,
`None: <why>`, with no writer and no lens on it.

## The Resources table (in `operations.md`)

| Resource | New or changed | Identity and role | Env vars | Secrets |
|---|---|---|---|---|
| `<a bucket, a topic, a job, a service>` | new | `<the service identity, the role>` | `<NAME>` | `<secret name in the secret manager>` |

Every cloud resource, identity, env var and secret the demand adds or
changes has a row and an owner. "None." when there are none.

## Rules that cross every document

**The proposal is the source.** Every decision and every name comes
from the closed `proposal.md` and its names table. A writer builds what
it says and nothing above it: a mechanism it does not have is a
question, never an addition; a mechanism it has is never dropped.

**One owner per fact.** The data and the wire live in
`data-and-contracts.md`; the shape in `solution.md`; the proof in
`tests.md`; shipping and watching in `operations.md`; access in
`security-and-access.md`; the screens in `screens.md`. Another document
points to the owner, never copies. An AC's text lives only in
`stories.md`.

**The requirement trace.** Every line that adds a mechanism (a table,
column, index, route, job, flag, cap, retry, alarm, test) ends with
`(req: …)`:

| Form | Means |
|---|---|
| `J1.s2.1` | an AC by its id (`frame:<token>.<n>` for a debug-only frame) |
| `rule:<id>` | a business rule of the stories' Rules table |
| `std:<id>` | a rule of the project's standards |
| `floor:D<n>` | the floor (`right-sizing.md` §3 D) |
| `door:<name>` | a one-way door the proposal names |
| `ruling:<date>#<n>` | a line of `rulings.md` |

**Decisions inline.** Every choice that could have gone another way:

```markdown
> **Decision — <short title>** `(decided in your place)`   <- only when it was his class
> Context: <the question>
> Options: A) <option — its cost> · B) <option — its cost>
> Chosen: <letter> — <why; the tradeoff said out loud>
```

**Questions, never guesses.** A choice the sources do not take is a
question back to the conductor (the choice, the options with their
cost, the writer's pick) and an `(open: Q-n)` mark where the answer
lands. `review-prep.mjs` fails on any mark left.

**Facts have a source.** A claim about the code cites
`recon/<topic>.md` or `path:line`; a claim about an outside service
cites the page the architect fetched.

**No workaround, no temporary step**, unless he asked for one: then
the document quotes him and says when it goes away.

**Size.** About 25 KB per document; `review-prep.mjs` warns above it.
A document over it is copying: an AC's text, another document's table,
a flow written twice.

**The implementer decides.** Every written document ends with
`## The implementer decides`, then `## References`. It holds what is
left to the builder, each with the bound the design sets ("the retry
count on the provider call, within its 5 s budget"). Never there: where
a piece runs and what happens when the other side fails; a stored
field's key, format and retention; a contract's shape; who can do
what; which alarms exist; what was relaxed. Names of code (a component,
a helper) are the implementer's; names of the domain are the
proposal's.
