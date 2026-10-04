# Brief — <workstream> — <F | E-<nn> | E-int> — <name>

<!--
  Written by `plan-writer (Sonnet 5.5, high)` from the node's line in
  plan.graph.json, plan.md and the design. This file is the whole
  instruction one `builder (Opus 5.5, medium)` receives at stage 4, or
  two (back and front in parallel) when it carries a Contract. The
  builder has the codebase, the design folder, the golden paths and
  this file, and nobody to ask. It writes one test per AC; the gate runs
  them; `reviewer (Opus 5.5, high)` checks each AC is met.

  scripts/plan-graph.mjs --briefs reads the sections Acceptance,
  Contract, Uses from the foundation, Provides, Owns and Extends: the
  FIRST COLUMN (a table) or the first `code` (a bullet) must equal the
  node in plan.graph.json, item for item, in backticks. Keep these
  headings as written. A node with both sides in the graph must carry
  a Contract.

  These comments are instructions to you: none of them reaches the
  brief.
-->

**Kind:** <foundation | slice | integration> · **Wave:** <1 | 2> · **Critical path:** <yes | no>
**After:** <— | E-nn (ui: the journey clicks <the button E-nn builds>) · stacked>
**Builders:** <one | two, back and front, against the Contract>

## What this delivers

<one or two sentences: what a person or a caller can do when this merges>

## Builds

**Back** — <use case, rules, routes, jobs, in the design's names> (or "none") · `solution.md` §<part>
**Front** — <screen, its states, its actions> (or "none") · frames `00-discovery/prototype/frames/<screen>.<state>.png`

## Acceptance

<!-- Every AC id the node carries, with the criterion copied verbatim
     from stories.md and the layer tests.md names for it. The builder
     writes one test per row; done = these tests and the gate green. -->

| AC | The criterion (stories.md) | Proved by (tests.md) | Test |
|---|---|---|---|
| `<J1.s2.1>` | <GIVEN … WHEN … THEN …, verbatim> | <journey · API · unit> | `<e2e/journeys/j1-place-order.spec.ts>` |

## Contract

<!-- Only when the node has a back and a front side. Copied from
     data-and-contracts.md, never invented: every route the two sides
     share, the request and response JSON with every field, every error
     with its status and code. Both builders build against it. -->

| Route | Request | Response | Errors |
|---|---|---|---|
| `<POST /orders>` | `<{ "day": "2026-10-05", "items": [{ "sku": "baguette", "qty": 2 }] }>` | `<201 { "id": "ord_1", "status": "placed" }>` | `<422 day_in_past · 401 no token>` |

## Uses from the foundation

<!-- Every name this node reads across its boundary, copied from F's
     provides in plan.graph.json; the Producer column starts with the
     graph's producer id. -->

| Name | Kind | Producer |
|---|---|---|
| `<POST /orders>` | contract | F |
| `<factory.Order>` | factory | F |

## Owns

<!-- Every path this node creates or edits, as in plan.graph.json. -->

- `<internal/orders/place/**>` — <the use case, its route, its tests>
- `<web/src/pages/orders/new/**>` — <the screen>

## Extends

<!-- Append-only additions to a file the foundation created, or to an
     append-safe file; "fills `<stub>`" when it fills a stub F left.
     "none" when empty. -->

none

## Done

1. Every row of Acceptance has its test, and it passes.
2. The gate, the plan's commands verbatim: `<the fast check>` · `<the affected tests, base=feat/<workstream>>`

## Questions

<empty when the brief is done>

<!-- ================= F only: in place of "Uses from the foundation" and "Acceptance" =================

## Provides

Every name F creates, exactly as the nodes will import or call it, as
plan.graph.json lists it.

| Name | Kind | Path |
|---|---|---|
| `<POST /orders>` | contract, one file per path, bundled by `<make gen>` | `<api/openapi/paths/orders.yaml>` |
| `<orders.Store>` | seam: interface · fake `<fake.Store>` · contract suite `<RunStoreContract>` | `<internal/orders/port.go>` |
| `<factory.Order>` | factory: a fresh record, unique keys on every call | `<internal/testkit/factory/order.go>` |

## Proof

- `<make gen>` then `git diff --exit-code`: every file the generators write is F's and current.
- Every contract suite is green against its fake. Migrations apply from empty.
- The gate is green on the empty implementation. No test asserts "not implemented" on an operation an entry builds.
- **The self-test.** A helper F provides that nothing calls until later entries merge fails a linter that flags unused code. `<path of the self-test>` calls each such helper once; `<E-nn>` removes it when the callers exist.
-->
