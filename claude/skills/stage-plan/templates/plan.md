# Plan — <workstream> — from A to B

<!--
  Written by `planner (Opus 5.5, high)`, whole, from the same decisions
  as 02-plan/plan.graph.json. The two never disagree: a change to one is
  made to the other in the same pass, and scripts/plan-graph.mjs runs
  after it. Stage 4 fills Status and writes Amendments.

  The words: F — the foundation, only what two entries need plus every
  file the generators write. E-<nn> — an entry, one whole behaviour,
  data to screen. E-int — the journeys that cross entries, last. An
  edge — only where nothing can be faked.

  Nobody was asked. Every choice is under "Decided in his place".

  These comments are instructions to you: none of them reaches plan.md.
-->

## From A to B

**A (today):** <one paragraph from recon/: what exists, and what the other fronts are changing>
**B (the design):** <one paragraph from solution.md: what exists when the last node merges>

## The graph

```mermaid
<scripts/plan-graph.mjs --mermaid output>
```

| Nodes | Width | Depth | Critical path | Parallelism |
|---|---|---|---|---|
| <n> (F · <n> entries · E-int <0/1>) | <widest wave> | <n> | <F → E-nn → E-int> · weight <n> | ×<total ÷ critical> |

**Start order** (stage 4 starts in this order, critical path first): <E-03, E-01, …>

## The foundation — `F`

| Kind | What | Needed by |
|---|---|---|
| migration | <tables and columns, expansion only — `data-and-contracts.md` §…> | <E-01, E-03> |
| contract | <every route, one file per path, `<make gen>`> | <all> |
| generated | <every file the generators write, from the recon> | — |
| seam | <interface · fake · contract suite> | <E-03, E-04> |
| factory | <one per entity; test actors> | <all> |

**Frozen after F:** <the shared globs>

## The entries

| Id | Name | ACs | Builders | After (class · need) | Critical |
|---|---|---|---|---|---|
| E-01 | <Place an order> | <J1.s1.1, J1.s2.1> | two (Contract) | — | |
| E-int | <Order to e-mail> | <J3.s3.1> | one | <E-03 (ui · clicks Mark ready), stacked> | ✓ |

## How each need was resolved

| Need | Of | Resolved by |
|---|---|---|
| <a customer> | <E-03> | `factory.Customer` in F — no edge |
| <the store of orders> | <E-03, E-04> | `orders.Store` + fake + contract suite in F — no edge |
| <the "Mark ready" button> | <the J3 walk> | edge E-int → E-03, stacked |

## Ownership

| Path | Owner | Extended by |
|---|---|---|
| `<api/openapi/**>` · `<db/migrations/**>` · `<internal/gen/**>` | F (frozen) | — |
| `<internal/orders/place/**>` | E-01 | — |

**Hot files made cold:** <the contract split one file per path; the registry as per-entry fragments; "none">

## Other fronts

| Front | Touches | Overlap | Merge point and order |
|---|---|---|---|
| <workstream slug> | <paths> | <path> | <its branch merges into the base before F; F takes the next migration number> |

## Gate commands

1. `<the fast check>`
2. `<the affected tests, base=feat/<workstream>, at the primary width plus the width-tagged specs, evidence off>`

The whole gate (`<make -k verify>`: every width, visual, the full server
suites, evidence on) runs once, at the end of stage 4.

## Pre-flight

`02-plan/preflight.md` — <n> items. Nodes that wait on an item: <E-04>; "none".

## Decided in his place

> **<title>** — <the question> · picked <the choice> · <why, one line>

## Status

Stage 4 fills this, one line per merged node.

## Amendments

One dated line per change: what changed, why, and the checker's line after it.
