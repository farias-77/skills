# The design documents — shared rules

Everything the ten design writers write under the workstream's `01-design/`
starts from a template in [../templates/](../templates/), one per
document, each carrying its own must-haves as comments:

| Template | Document |
|---|---|
| `research-target.md` | `research/<target>.md`, one per deep-research workflow |
| `breadboard.md` | `tiers/breadboard.md`: what must happen, no mechanism chosen; the architect's, in breadboard mode |
| `tier.md` | `tiers/{lean,balanced,hardened}.md`: every part at one tier, with hours, run cost and risks; one architect each |
| `sizing.md` | `sizing.md`: the one-page final design, the pick per part, the evolution path; the sizing judge's |
| `doc-header.md` | the `## Size and evolution` block every document below opens with |
| `architecture.md` | components with where each runs, flows in the fixed format, extension points |
| `data-model.md` | entities, access patterns, growth |
| `contracts.md` | the frozen bridge: endpoints, events, evolution |
| `ui.md` | how the locked mock becomes the app: every screen and frame mapped to routes, components, tokens and contract fields; what the mock fakes |
| `security.md` | the fixed 13-class sweep |
| `infra.md` | resources with configs, IAM, cost at three scales |
| `observability.md` | alarms with the four fields |
| `rollout.md` | deploy order, cutover, rollback |
| `code.md` | the file-tree preview per repo, a guide, never a build contract |
| `acceptance.md` | the executable acceptance spec: every journey step a case, plus the contract cases; frozen with `contracts.md`; stage 4 turns each case into a test in the layer the doctrine assigns |
| `notes.md` | the CONDUCTOR's record: the frame, what exists today, the user's call, the answers; the writers transcribe it and never edit it |
| `reviews.md` | the round audit with the rulings, the conductor's file |
| `blueprint/design/<doc>.json` | the document's report layer, written by its writer with the document, in the shapes and word caps of `claude/blueprint/schema/design.md` |

The design covers the whole demand: the lock (the mock, its journeys,
every story in `stories.md`). The cut into slices is stage 3's. These files are machine
input: reviewers and planning consume them; the user reads the
blueprint. Write to be consumed, not admired: no presentation prose,
no navigation trails, no headers repeating content.

## Rules that cross every document

**Build the pick.** `sizing.md` says, per part, which tier is built.
Each document builds its parts at that tier, from that tier's file,
and nothing above it. A mechanism the pick does not have is a writer's
question, never an addition; a mechanism the pick has is never
dropped.

**The header block.** Every document opens, right under its title,
with `## Size and evolution` ([template](../templates/doc-header.md)):
the rows of `sizing.md` for the parts it carries, copied, and their
evolution-path rows. The sizing lens compares it with `sizing.md` row
by row.

**The requirement trace.** Every line that adds a mechanism (a table,
column, index, route, topic, queue, job, sweeper, cap, flag, knob,
retry, alarm, panel, test case) ends with `(req: …)`, naming what
forces it. The forms:

| Form | Means |
|---|---|
| `J1.s2.1` | an acceptance criterion: its id is the locked journey step and its number (`<journey>.<step>.<n>`), as `stories.md` writes it; `frame:<token>.<n>` for a state no journey visits |
| `J1.s2` | a journey step of `journeys/*.yaml`, when no single criterion carries the need |
| `rule:<id>` | a business rule of the stories' Rules table (`rule:INV-1`) |
| `doctrine:<file>#<anchor>` | a line of the project's engineering doctrine |
| `floor:D<n>` | an item of the floor (the right-sizing pack, §3 D) |
| `door:<name>` | a one-way door named in `sizing.md` |
| `signal:<part>` | the evolution-path row of that part in `sizing.md` (its signal and watcher), by the part as `sizing.md` names it (`signal:compute.feed`); never an alias |
| `ruling:<date>#<n>` | a line of `rulings.md` |

Several are separated by commas: `(req: J1.s2.1, floor:D2)`. A
mechanism line without one is a finding of the sizing lens; the sweep
is `rg -n -i '\b(table|column|index|topic|job|sweeper|alarm|cap|flag|retry)\b' 01-design/*.md | rg -v 'req:'`,
and its hits are read, not counted.

**The decision block.** Every choice that could have gone another way,
declared inline exactly where it applies (this is what the blueprint
renders as a card in that tab's context). Fixed, greppable format:

```markdown
> **Decision — <short title>** `(decided in your place)`   <- flag only when it was the user's call
> Context: <the question that had to be answered>
> Options: A) <option — its cost> · B) <option — its cost>
> Chosen: <letter> — <why, one or two sentences; the tradeoff said out loud>
```

**Every document is written, even when nothing changes.** The design
thinks every subject. When the demand changes nothing in a document's
subject, the document still exists and says so: a `## Nothing changes`
section with the reason tied to the demand ("no alarm: the new route
is synchronous and its errors fall under the existing 5xx alarm") and
what was checked to reach it. The lens of that subject checks the
reason against the flows; a reason the flows contradict is a finding.

**No workaround, no temporary step.** Nothing in a design document is
a flag, a special case, a copy of existing logic or a step meant to be
removed later, unless the user asked for the temporary explicitly; then
the document quotes his words and names when it goes away.

**Every gate cites its source.** A threshold, a coverage bar or a
test layer written in `acceptance.md` (or anywhere) cites the line of
the doctrine or the repo that sustains it. A gate with no source is
invented.

**The implementer decides.** Every document ends with `## The
implementer decides`, before `## References`. "Latitude" is the word
for what goes there: a choice left to whoever builds it, with the
bound the design sets ("the retry count on the provider call, within
the call's 5 s budget"). The section holds what the picked tier's file
leaves open and what the writer's transcription left open on purpose,
one concrete line each. Reviewers do not report an item
listed there unless it belongs to a hard class.

The rule behind the split: the design fixes what changes the
**shape** of the system; the implementer decides what changes only
the **execution** inside that shape, and the design says the bound.

| Document | The design fixes (never left open) | The implementer decides |
|---|---|---|
| architecture | the components and where each runs; who calls whom; every flow as steps with what is read, written and returned; what happens when the other side fails; the mechanisms that guard a rule (lock, idempotency, cutoff); the extension points | the internal order of steps that does not change the result; retry and backoff values within the stated bound; helpers and the code organization of a flow |
| data-model | entities, keys, indexes, the format of every field, retention, the access pattern of every screen | secondary attribute names; internal pagination; an extra index that only optimizes without changing the model |
| contracts | routes, auth, whole request and response, every error with code and envelope, idempotency, pagination | field order; validation messages that are not business rules |
| ui | every screen and state of the mock mapped, the copy verbatim, the data each piece shows, what is reused from the product, what the mock fakes | the internal composition of a component, as long as it draws what the frame shows |
| security | the 13 classes answered (covered how, risk accepted why, n/a why) | the library used for each mitigation, as long as it does what the class asks |
| infra | resources, every config that encodes a rule or a cost (timeout, memory, PITR, region), IAM by the verb, cost at three scales | resource names within the convention; tags; stack organization |
| observability | which alarms exist, what each catches, whom it wakes, the threshold and its argument | log format beyond the required fields; dashboard metrics without an alarm |
| rollout | deploy order, gates, rollback per step | the exact script of each step, as long as it meets its "confirmed when" |
| code | where the layout departs from the doctrine's structure; the names of the code the other documents copy (files, components, exported functions, test files) | everything else in the layout: the doctrine is the rule, `code.md` a guide |
| acceptance | the case list and what each one proves | request bodies, fixtures, execution order |

The hard classes, the left column condensed, never sit in the
section, whatever anyone said before:

- where each piece runs, who calls whom, what happens when the other
  side fails;
- the key, the format and the retention of every stored entity;
- the shape of every contract, success and every error;
- every class of the security sweep;
- which alarms exist and whom each one wakes;
- the cost envelope;
- the tier of every part, and its evolution path.

**The flow format.** Every flow in `architecture.md` is a `### `
heading, a trigger line, numbered steps (one action each, the owning
component named, the concrete values said) and a failure table with
one row per way the flow fails. The review workflow splits the Flows
section at the headings and keys the steps and rows by position; two
blind readers build from each flow and a referee compares the builds.
A step that leaves room produces two builds and a finding.

**Ten writers, one system.** Each document is written by its own
writer from the same sources (`sizing.md`, the tier files, the notes,
the research), in two waves: `data-model`, `contracts` and `code` fix
the names, the other seven copy them. `data-model` and `contracts` own
the names of the data and the wire; `code` owns the names of the code:
files, modules, components, exported functions, the test files. A test
case is named only in `acceptance.md`: another document says what the
case proves and points there, and never coins a case name. An
acceptance criterion's text lives only in `stories.md`: `acceptance.md`
cites it by id (`J1.s2.1`) and never copies its GIVEN / WHEN / THEN;
the case row carries only what the test adds to it (the layer, the
setup the criterion leaves open, the frame, the row read back, the
cleanup). So every
document names the thing the way its owner names it, takes every value
from the sources (never from memory), and says where the exact form
lives when it is another document's ("the whole shape is in
`contracts.md`"). The consistency lens reads the ten together and
reports every drift.

**Infra is proved the doctrine's way.** An acceptance case proves an
alarm expression, a schedule, a permission or a resource config the way
the doctrine's testing standard says infra is proved, and no other way.

**The reference rule.** Every claim about an external tool or an
existing internal service points at its research file:
`...expires links after 7 days ([provider limits](research/media-provider.md))`.
No research file, no claim.

**The epistemic label.** `fact` / `inference` / `heuristic`, assigned
in research and never promoted on the way into a design document.

**The references section.** Every design document ends with
`## References`: the sources it leaned on, one per line: research
files, external URLs, internal code paths. Inline references stay
where the claim is; this section is the roll-up that lets anyone audit
a document's grounding at a glance. The blueprint mirrors it: each
design tab's data carries its `references` list, rendered at the
bottom of the tab.
