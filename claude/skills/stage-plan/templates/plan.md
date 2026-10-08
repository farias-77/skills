# Plan · <workstream>

<!--
  Written by planner (Opus 5.5, high), whole, from the same decisions as
  plan.graph.json; the two never disagree, and plan-graph.mjs runs after
  every change. Stage 4 fills Status. These comments never reach the file.
-->

## From A to B

**A (today):** <from recon/: what exists, and what the other workstreams are changing>
**B (the design):** <from solution.md: what exists when the last entry merges>

## The graph

```mermaid
<plan-graph.mjs --mermaid output>
```

| Nodes | Width | Depth | Critical path |
|---|---|---|---|
| <C + n entries + E-int> | <n> | <n> | <C → E-nn → E-int> |

**Start order** (critical path first): <E-03, E-01, …>

## The contract commit

| Item | What | Used by |
|---|---|---|
| spec | <routes> | <all> |
| table | <name, additive> | <E-01, E-03> |
| stubs | <operations> | <the entry that fills each> |
| factory | <name> | <E-01, E-02> |

## The entries

| Id | Name | ACs | Sides | After (class · need) |
|---|---|---|---|---|
| E-01 | <name> | <n> | back · front | — |
| E-int | <name> | <n> | front | <E-01 (ui · the journey submits its form)> |

## Ownership

| Path | Owner | Extended by |
|---|---|---|
| `<spec, generated code>` | C | — |
| `<backend/internal/orders/app/place_order.go>` | E-01 | — |

## Other workstreams

| Workstream (session) | Touches | Agreed |
|---|---|---|
| <slug (session name)> | <path> | <additive: a new target at the end · or: E-04 waits for its merge> |

## Gate commands

1. `<the fast check>`
2. `<the affected tests, base=feat/<workstream>>`

The whole gate (`local-ci`) runs on the top of `feat/<workstream>` at the end of stage 4.

## Decided in his place

> **<title>** · <the question> · picked <the choice> · <why, one line> · veto: <what changes if he vetoes>

## Status

Stage 4 fills this: date · entry · sha · fix passes · minutes.

## Amendments

One dated line per change after the review: what changed, why, the checker's line.
