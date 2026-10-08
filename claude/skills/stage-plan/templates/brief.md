# <C | E-nn | E-int> · <name>

<!--
  Written by plan-writer (Sonnet 5.5, high) from the node in plan.graph.json,
  plan.md and the design. It is the whole instruction the entry's builders
  get at stage 4: builder-backend (Opus 5.5, medium) for the back side,
  builder-frontend (Opus 5.5, medium) for the front, in parallel when the
  node has both sides. They have this file, the design, the codebase and
  nobody to ask.

  plan-graph.mjs --briefs compares these sections with the node, item by
  item: Acceptance, Contract, Uses, Provides, Owns, Extends. The item is
  the FIRST COLUMN of a table row, or the first `code` of a bullet, in
  backticks. Keep the headings as written.

  These comments are instructions to you; none reaches the brief.
-->

**Kind:** <contract | entry | integration> · **Sides:** <back · front | back | front> · **After:** <— | E-nn (ui: the journey submits the form E-nn builds)>

## What this delivers

<one or two sentences: what a person or a caller can do when this merges>

## Builds

- **Back:** <use case, rules, routes, in the design's names, or "none"> · `solution.md` §<part>
- **Front:** <screen, its states, its actions, or "none"> · `screens.md` §<screen> · mock frames <names>

## Acceptance

| AC | The criterion (stories, verbatim) | Proved at (tests.md) |
|---|---|---|
| `<J1.s2.1>` | <GIVEN … WHEN … THEN …> | <unit · integration · journey> |

## Contract

<!-- Only when the node has both sides. Copied from data-and-contracts.md,
     never invented: every route both sides share, the request and response
     with every field (required, optional, nullable), every error with its
     status and code. -->

| Route | Request | Response | Errors |
|---|---|---|---|
| `<POST /orders>` | `<{ "day": "2026-10-05", "items": [{ "sku": "bread", "qty": 2 }] }>` | `<201 { "id": "ord_1", "status": "placed" }>` | `<422 day_in_past · 401 no session>` |

## Uses

<!-- The node's `uses`, each with its producer from the graph. -->

| Name | Producer |
|---|---|
| `<POST /orders>` | C |

## Owns

<!-- The node's `owns`, exactly. -->

- `<backend/internal/orders/app/place_order.go>` · <the use case>

## Extends

<!-- The node's `extends`, exactly, each with what is added; "none" when empty. -->

- `<backend/internal/orders/http/stubs.go>` · <fills the `PlaceOrder` stub>

## Done

1. Every AC above has a proof that fails if the AC breaks, at the layer named.
2. The entry gate is green: `<make check>` · `<make test-affected base=feat/<slug>>`.

## The builder decides

<!-- Details the design did not fix and that do not change what is built:
     one line each. "nothing" when empty. -->

- <the empty-state copy, within screens.md's tone>

<!-- ================= C only: in place of Acceptance and Uses =================

## Provides

| Name | Path |
|---|---|
| `<POST /orders>` | `<backend/api/openapi.yaml>` (stub answers 501, no test asserts it) |
| `<factory.Order>` | `<backend/tests/factory/order.go>` |

## Proof

- `<make gen>` leaves no diff.
- The migrations apply from an empty database.
- `<make check>` is green with every stub in place.
-->
