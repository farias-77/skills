# The design documents — shared rules

Four documents, written in parallel by four `design-writer (Sonnet
5.5, high)` at D5, each from a template in [../templates/](../templates/)
that carries its own must-haves as comments:

| Document | Holds | Read by |
|---|---|---|
| `solution.md` | the parts, the screens, the flows, the decisions, the security posture, the disagreements and how they were settled, the evolution path | stage 3 (the cut, the briefs), stage 4 (the builders) |
| `data-and-contracts.md` | the tables and migrations; one Contract per entry-sized feature: route, request and response JSON, errors | stage 3 copies each Contract into a brief; stage 4 builds front and back against it in parallel |
| `tests.md` | per AC, cited by id, the layer that proves it | stage 3 (the acceptance lines), stage 4 (one test per line) |
| `operations.md` | migration and rollout, flags, alarms, rollback, run cost | stage 5 (the release plan and the watch) |

The other files of `01-design/`:

| Template | File | Written by |
|---|---|---|
| `proposal.md` | the one solution, the names, the disagreements, the evolution path, the critic's cuts, the changes per round | `architect (Opus 5.5, high)` |
| `notes.md` | what exists today, his words, the debate, the answers to the writers | the conductor |
| `reviews.md` | the review's rulings and their proof | the conductor |
| `research-target.md` | `research/<topic>.md`, only when a premise needed research | the `design-research` workflow |
| — | `blueprint/design/<doc>.json`: the document's report layer, in the shapes and word caps of `claude/blueprint/schema/design.md` | each writer, with its document |

These files are machine input: the plan and the builders consume them;
the user reads the blueprint. Write to be consumed, not admired.

## Rules that cross every document

**The budget.** About 40 KB per document, 160 KB for the four.
`scripts/review-prep.mjs` warns over it. A document over budget almost
always copies what another source holds: an AC's text (cite the id),
a table of another document (point to it), a flow written twice.

**The proposal is the source.** Every decision and every name comes
from the closed `proposal.md`. A writer builds what it says and
nothing above it: a mechanism it does not have is a question, never an
addition; a mechanism it has is never dropped. A name it does not list
is a question; the architect adds it there first.

**One owner per fact.** The data and the wire live in
`data-and-contracts.md`; the shape of the system in `solution.md`; the
proof of each AC in `tests.md`; how it ships and is watched in
`operations.md`. Another document points to the owner ("the shape is
in `data-and-contracts.md` §Contract — send an invite"), never copies.
An AC's text lives only in `stories.md`: documents cite its id.

**The requirement trace.** Every line that adds a mechanism (a table,
column, index, route, job, flag, cap, retry, alarm, test) ends with
`(req: …)`:

| Form | Means |
|---|---|
| `J1.s2.1` | an acceptance criterion, by its id in `stories.md` (`frame:<token>.<n>` for a state no journey visits) |
| `J1.s2` | a journey step, when no single criterion carries the need |
| `rule:<id>` | a business rule of the stories' Rules table |
| `doctrine:<file>#<anchor>` | a line of the project's engineering doctrine |
| `floor:D<n>` | an item of the floor (the right-sizing pack, §3 D) |
| `door:<name>` | a one-way door the proposal names |
| `ruling:<date>#<n>` | a line of `rulings.md` |

**The decision block.** Every choice that could have gone another way,
inline where it applies:

```markdown
> **Decision — <short title>** `(decided in your place)`   <- flag only when it was the user's class
> Context: <the question that had to be answered>
> Options: A) <option — its cost> · B) <option — its cost>
> Chosen: <letter> — <why, one or two sentences; the tradeoff said out loud>
```

**Nothing to change is written.** A section with nothing for this
demand says "None." and why in one line.

**No workaround, no temporary step.** Nothing is a special case, a
copy of existing logic or a step meant to be removed later, unless the
user asked for it; then the document quotes his words and names when
it goes away.

**Facts have a source.** A claim about the codebase cites
`recon/<topic>.md` or `path:line`; a claim about an external tool
cites `research/<topic>.md`. No source, no claim.

**The implementer decides.** Every document ends with
`## The implementer decides`, then `## References`. The section holds
the choices left to the builder, each with the bound the design sets
("the retry count on the provider call, within the call's 5 s
budget"). The design fixes what changes the **shape** of the system;
the builder decides what changes only the **execution** inside it.

The hard classes never sit in that section:

- where each piece runs, who calls whom, what happens when the other
  side fails;
- the key, the format and the retention of every stored field;
- the shape of every contract, success and every error;
- who can do what, and where secrets and personal data live;
- which alarms exist and whom each one wakes;
- what the proposal relaxed, and its evolution path.
