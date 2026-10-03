# Plan — <workstream> — from A to B

<!--
  Written by THE CONDUCTOR (Opus 5.5, high), whole, at the end of P2,
  from the same decisions as 02-plan/plan.graph.json. The two never
  disagree: every change to one is made to the other in the same pass,
  and scripts/plan-graph.mjs runs after it. The writers never edit this
  file. Stage 4 fills Status and writes Amendments.

  The words (pack-parallel-plan-local-ci):
  - F — the foundation, the thin serial head: migrations, the contract
    and its generated code, the registry and wiring, config and the test
    env, the cross-slice seams (interface + fake + contract suite), the
    factories, one exemplar per new kind of code. At most one L of
    hand-written code. Nothing behavioural. It owns every shared file.
  - F-x<n> — a foundation lane: foundation work no slice waits for
    (deploy skeleton, docs fragments, extra fake modes), built beside
    the slices.
  - E-<nn> — a slice: one story (or 2–3 that only prove together), built
    vertically, back and front and tests, by one builder in one context.
  - E-int — the integration node: the journeys that cross three or more
    slices, size S, merges last. At most one.
  - an edge — only real behaviour: a journey drives another node's UI
    (class ui), or a check reads another node's real side effect (class
    side-effect). Data is a factory; an interface is a fake. Neither is
    an edge.
  - a wave — the nodes at one depth after F. A reading aid: stage 4
    starts each node the moment its edges are ready, never by wave.

  Nobody was asked. Every choice below is the conductor's, recorded
  under "Decided in his place" for his veto.
-->

## From A to B

**A (today):** <one paragraph from recon/: what each area has, and what the other fronts are changing right now>
**B (the design):** <one paragraph from sizing.md: what exists when the last node merges>

## The graph

```mermaid
<scripts/plan-graph.mjs --mermaid output: F → the wave-1 nodes; edges labelled with their class; the critical path drawn thick>
```

| Nodes | Waves | Width | Depth (target ≤ 2) | Critical path | Parallelism |
|---|---|---|---|---|---|
| <n> (F <n> · lanes <n> · slices <n> · E-int <0/1>) | <n> | <widest wave> | <n> | <F → E-nn → E-int> · weight <n> | ×<total ÷ critical> |

**Start order** (critical path first, then by bottom level): <E-03, E-01, …>

### Waves

| Wave | Nodes | Starts when |
|---|---|---|
| 0 | F | play |
| 1 | <F-x1 · E-01 · E-02 · E-03 · E-04> | F is merged |
| 2 | <E-int> | <E-03 and E-04 are ready (stacked)> |

## The foundation — `F`

| Kind | What |
|---|---|
| migration | <tables and columns, expansion only, with enums, indexes and grants — `data-model.md` §…> |
| contract | <every route with every input and output field, one file per path, `<make gen>`; handlers answer "not implemented" and no test asserts it> |
| wiring | <modules registered, config loaded, every secret faked in the test env> |
| seam | <interface · fake · contract suite, one per need classified "interface"> |
| factory | <one per entity, unique keys on every call; `actors.New(t, role)`> |
| exemplar | <the first instance of each kind the recon marks "none", without behaviour> |

**Size:** <S | M | L> (≤ L of hand-written code; what did not fit went to <F-x<n> / the first slice that needs it>)
**Frozen after F:** <the shared globs from plan.graph.json>
**Proof:** `<make gen>` + `git diff --exit-code` · `uses-check` compiles · contract suites green on the fakes · migrations from empty · the gate green on the empty implementation · no test pins a stub
**Brief:** `02-plan/briefs/F.md`

## The nodes

| Id | Kind | Name | Stories · ACs | Builds (back · front) | Size | After (class · need) | Wave | Critical |
|---|---|---|---|---|---|---|---|---|
| F-x1 | lane | <Deploy skeleton> | — | <…> · — | S | — | 1 | |
| E-01 | slice | <Place an order> | <S-001> · <J01.s1.1, J01.s2.1> | <use case, route> · <screen> | M | — | 1 | |
| E-int | integration | <Order to e-mail> | <S-003, S-004> · <J03.s3.1> | — · <journey> | S | <E-03 (ui · clicks Mark ready) · E-04 (side-effect · reads the e-mail), stacked> | 2 | ✓ |

## How each need was resolved

<!-- P2's classification: every need that crosses a slice boundary, and
     what stood in for it. This is why the graph is this wide. -->

| Need | Of | Class | Resolved by |
|---|---|---|---|
| <a customer in the database> | <E-03> | data | `factory.Customer` in F — no edge |
| <the store of orders> | <E-03, E-04> | interface | `orders.Store` + `fake.Store` + `RunStoreContract` in F — no edge |
| <the "Mark ready" button> | <the J03 walk> | ui | edge E-int → E-03, stacked |
| <the order-to-e-mail walk> | <J03> | e2e across 3 slices | E-int |

## Ownership

<!-- Every file has one owner. Shared files belong only to F. Extends are
     append-only; a file two nodes extend is a hot file made cold or
     declared append-safe here. -->

| Path | Owner | Extended by |
|---|---|---|
| `<api/openapi/**>` · `<db/migrations/**>` · `<internal/gen/**>` · `<registry>` | F (frozen) | — |
| `<internal/orders/place/**>` | E-01 | — |
| `<web/src/tokens.css>` (existing, append-safe) | — | <E-01, E-03> |

**Hot files made cold:** <the contract split one file per path; the feature map as per-node fragments the queue assembles; "none">

## Other fronts

<!-- From recon/fronts.md: what other running workstreams touch that
     this plan touches too, and what the plan did about it. -->

| Front | Touches | Overlap with this plan | What the plan did |
|---|---|---|---|
| <workstream slug> | <paths> | <path> | <moved the touch into F; a merge of the base first; none> |

## Gate commands

<!-- Fixed once, from the recon's Commands, in the project contract's
     roles. Every brief copies them verbatim; stage 4 hands them to every
     builder. -->

1. `<the fast check>`
2. `<the affected tests, base=feat/<workstream>>`
3. `<the structure check>`

The whole gate (`<make -k verify>`) runs once, at the end of stage 4, on the top of `feat/<workstream>`.

**Concurrency at stage 4:** the graph is cut for width, not for the machine. Stage 4 runs as many nodes as the widest wave (<n>) up to the capacity it measures where it runs (`recon/machine.md` when measured: <n>).

## Pre-flight

`02-plan/preflight.md` — <n> items, every one with its `!` command. Nodes that wait on an item: <F (the provider key), E-04 (…)>; "none".

## Decided in his place

<!-- Every choice the conductor made that he could have made: a fork in
     the cut, an open rule of doctrine or test, a writer's question, a
     finding owned by the user. Listed for his veto; the same lines are
     in rulings.md marked `ruled: conductor`. -->

> **Decision — <title>**
> Context: <the cut in question>
> Options: A) <option — its cost> · B) <option — its cost>
> Picked: <letter> — <why, one line>

## Status

<!-- stage 4 fills: date · node · sha · proof line -->

## Amendments

<!-- dated: what changed, why, who ruled; plan.graph.json changed in the
     same pass and plan-graph.mjs green after it. -->
