# The design documents — shared rules

Everything the design-author writes under `wNN-<wave>/01-design/` starts
from a template in [../templates/](../templates/) — one per document,
each carrying its own must-haves as comments:

| Template | Document |
|---|---|
| `research-target.md` | `research/<target>.md` — one per deep-research workflow |
| `architecture.md` | flows, components, diagrams |
| `data-model.md` | entities, access patterns, growth |
| `contracts.md` | the frozen bridge: endpoints, events, evolution |
| `ui.md` | patterns today, screens, states, the artboard index |
| `security.md` | the fixed 13-class sweep |
| `infra.md` | resources with configs, IAM, cost at three scales |
| `observability.md` | alarms with the four fields |
| `rollout.md` | deploy order, cutover, rollback |
| `code.md` | the file-tree preview per repo — a guide, never a build contract |
| `acceptance.md` | the executable acceptance spec, frozen with `contracts.md` — the exec transcribes it into each repo's `smoke/` |
| `decisions.md` | the design session's record — the whole design in decisions, the CONDUCTOR's file; the author transcribes it and never edits it |
| `reviews.md` | the round audit with the user's rulings — the conductor's file, not the author's |

These files are machine input — reviewers and planning consume them; the
user reads the blueprint. Write to be consumed, not admired: no
presentation prose, no navigation trails, no headers repeating content.

## Rules that cross every document

**The decision block** — every choice that could have gone another way,
declared inline exactly where it applies (this is what the blueprint
renders as a card in that tab's context). Fixed, greppable format:

```markdown
> **Decision — <short title>** `(decided in your place)`   <- flag only when it was the user's call
> Context: <the question that had to be answered>
> Options: A) <option — its cost> · B) <option — its cost>
> Chosen: <letter> — <why, one or two sentences; the tradeoff said out loud>
```

**The reference rule** — every claim about an external tool or an
existing internal service points at its research file:
`...expires links after 7 days ([provider limits](research/media-provider.md))`.
No research file, no claim.

**The epistemic label** — `fact` / `inference` / `heuristic`, assigned in
research and never promoted on the way into a design document.

**The references section** — **every design document ends with
`## References`**: the sources it leaned on, one per line — research
files, external URLs, internal code paths. Inline references stay where
the claim is; this section is the roll-up that lets anyone audit a
document's grounding at a glance. The blueprint mirrors it: each design
tab's data carries its `references` list, rendered at the bottom of the
tab.
