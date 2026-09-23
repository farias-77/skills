# The design documents — shared rules

Everything the ten design writers write under the workstream's `01-design/`
starts from a template in [../templates/](../templates/), one per
document, each carrying its own must-haves as comments:

| Template | Document |
|---|---|
| `research-target.md` | `research/<target>.md`, one per deep-research workflow |
| `architecture.md` | components with where each runs, flows in the fixed format, extension points |
| `data-model.md` | entities, access patterns, growth |
| `contracts.md` | the frozen bridge: endpoints, events, evolution |
| `ui.md` | patterns today, screens, states, the artboard index |
| `security.md` | the fixed 13-class sweep |
| `infra.md` | resources with configs, IAM, cost at three scales |
| `observability.md` | alarms with the four fields |
| `rollout.md` | deploy order, cutover, rollback |
| `code.md` | the file-tree preview per repo, a guide, never a build contract |
| `acceptance.md` | the executable acceptance spec, frozen with `contracts.md`; stage 4 turns each case into a test in the layer the doctrine assigns |
| `notes.md` | the design session's record, the CONDUCTOR's file; the writers transcribe it and never edit it |
| `reviews.md` | the round audit with the rulings, the conductor's file |
| `blueprint/design/<doc>.json` | the document's report layer, written by its writer with the document, in the shapes and word caps of `claude/blueprint/schema/design.md` |

The design covers the whole demand: every story in `user-stories.md`. The wave cut is stage 3's. These files are machine
input: reviewers and planning consume them; the user reads the
blueprint. Write to be consumed, not admired: no presentation prose,
no navigation trails, no headers repeating content.

## Rules that cross every document

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
bound the design sets ("retries on the Cognito calls, within the
call's 10 s budget"). The section holds the items the user left
open at the session (the Latitude list of that document's section in
`notes.md`) plus what the writer's transcription left open on
purpose, one concrete line each. Reviewers do not report an item
listed there unless it belongs to a hard class.

The rule behind the split: the design fixes what changes the
**shape** of the system; the implementer decides what changes only
the **execution** inside that shape, and the design says the bound.

| Document | The design fixes (never left open) | The implementer decides |
|---|---|---|
| architecture | the components and where each runs; who calls whom; every flow as steps with what is read, written and returned; what happens when the other side fails; the mechanisms that guard a rule (lock, idempotency, cutoff); the extension points | the internal order of steps that does not change the result; retry and backoff values within the stated bound; helpers and the code organization of a flow |
| data-model | entities, keys, indexes, the format of every field, retention, the access pattern of every screen | secondary attribute names; internal pagination; an extra index that only optimizes without changing the model |
| contracts | routes, auth, whole request and response, every error with code and envelope, idempotency, pagination | field order; validation messages that are not business rules |
| ui | the screens, the states of each, what is reused from the product | spacing, microcopy, animation, component order that does not change a state |
| security | the 13 classes answered (covered how, risk accepted why, n/a why) | the library used for each mitigation, as long as it does what the class asks |
| infra | resources, every config that encodes a rule or a cost (timeout, memory, PITR, region), IAM by the verb, cost at three scales | resource names within the convention; tags; stack organization |
| observability | which alarms exist, what each catches, whom it wakes, the threshold and its argument | log format beyond the required fields; dashboard metrics without an alarm |
| rollout | deploy order, gates, rollback per step | the exact script of each step, as long as it meets its "confirmed when" |
| code | where the layout departs from the doctrine's structure | everything else in the layout: the doctrine is the rule, `code.md` a guide |
| acceptance | the case list and what each one proves | request bodies, fixtures, execution order |

The hard classes, the left column condensed, never sit in the
section, whatever the user said at the session:

- where each piece runs, who calls whom, what happens when the other
  side fails;
- the key, the format and the retention of every stored entity;
- the shape of every contract, success and every error;
- every class of the security sweep;
- which alarms exist and whom each one wakes;
- the cost envelope.

**The flow format.** Every flow in `architecture.md` is a `### `
heading, a trigger line, numbered steps (one action each, the owning
component named, the concrete values said) and a failure table with
one row per way the flow fails. The review workflow splits the Flows
section at the headings and keys the steps and rows by position; two
blind readers build from each flow and a referee compares the builds.
A step that leaves room produces two builds and a finding.

**Ten writers, one system.** Each document is written by its own
writer from the same notes and research, in parallel; none reads the
others. So every document names the thing the way the notes name it,
takes every value from the notes or the research (never from memory),
and says where the exact form lives when it is another document's
("the whole shape is in `contracts.md`"). The consistency lens reads
the ten together and reports every drift.

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
