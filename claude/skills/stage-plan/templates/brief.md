# Brief — <workstream> — <F | F-x<n> | E-<nn> | E-int> — <name>

<!--
  Written by `plan-writer (Opus 5.5, medium)` from plan.md, the node's
  line in plan.graph.json, the design, the discovery's journeys and
  stories, the recon and, for every node but F, the foundation's brief
  F.md (written first, so every name used from it is fixed).

  This file is the whole instruction one `builder (Opus 5.5, medium)`
  receives at stage 4 (two, back and front in parallel, when the brief
  carries a Contract). It has no conversation, only the codebase, the
  design folder, the golden paths and this file. The builder writes one
  test per Acceptance line beside the code; the gate runs them with the
  Gate commands, and `reviewer (Opus 5.5, high)` checks each AC is met.

  The sections Owns, Extends, Uses from the foundation, Provides and
  Acceptance are read by scripts/plan-graph.mjs --briefs: their FIRST
  COLUMN (a table) or their first `code` (a bullet) must equal the
  node's lists in plan.graph.json, item for item. Write each item in
  backticks, exactly as the graph has it. The checker finds a section
  by its whole heading: keep these five headings as written here, and
  give any extra section a heading of its own. The Producer column of
  Uses starts with the graph's producer id.

  These comments are instructions to you: none of them reaches the
  brief.

  Must-haves: every Acceptance line carries an AC id from stories.md (or
  a contract case name from acceptance.md) and names what is observed
  and the side effect read back · a golden path for every kind of code
  added · Uses copied verbatim from F.md "Provides", each with its
  producer · Owns and Extends · Size within the cap · the Gate commands
  · "Questions" empty (a question left here is a plan defect).

  Kinds: F carries "Provides", "Seams", "Exemplars" and "The F proof"
  instead of "Uses from the foundation"; its Acceptance is its proof. A
  lane (F-x<n>) carries no AC; its Acceptance is its proof. E-int
  carries the journeys that cross slices, and nothing else.
-->

**Kind:** <foundation | lane | slice | integration> · **Size:** <S | M | L> · **Wave:** <1 | 2> · **Critical path:** <yes | no>
**After:** <— | E-nn (class ui: the journey clicks <the button E-nn builds>) · stacked>
**Starts from:** the top of `feat/<workstream>` with F merged<; or E-nn's branch the moment E-nn is `ready` (stacked); with several edges, the last unmerged one's branch once all the others have merged>

## What this delivers

<one paragraph: what a person or a caller can do when this merges, and why it waits for nothing — or for which node's behaviour>

## Before you start

- Read: `01-design/` (`sizing.md` first: the final design and the tier of each part; `notes.md` is the law), the sections named below, the recon of the areas below, the consuming project's `CLAUDE.md`, its engineering doctrine and its golden paths.
- Frozen: the doctrine's shared files (`<the shared globs from plan.graph.json>`). Change one only when the node cannot be built without it, minimally, and list it in `outsideOwns`.
- Write inside **Owns**, plus the additions under **Extends**. A file outside both is changed only when needed, and listed in `outsideOwns`.
- Feature map: rows `<ids>` of `<the feature map's path>`<; or "none: E-nn owns these rows">.

## Builds

**Stories:** `<S-001>` · **Journey steps:** `<J01.s1>` · `<J01.s2>`

**Back** — <use case, rules, route implementation, jobs, in the concrete names the design fixes> (or "none")
- Design: `architecture.md` §<flow> · `contracts.md` §<route> · `data-model.md` §<entity> · tier <lean | balanced | hardened> per `sizing.md`

**Front** — <screen, its states, its actions> (or "none")
- Design: `ui.md` §<screen> · frames `00-discovery/prototype/frames/<screen>.<state>.png`

## Acceptance

<!-- One line per AC id the node carries (stories.md, `<journey>.<step>.<n>`),
     plus one per contract case of acceptance.md it owns. The builder
     turns each line into ONE test. A line names:
     - the actor (a role the stack seeds, or a caller) and what they do, with values;
     - what they observe (the screen state and its frame, the status and body, the exit code);
     - the side effect read back from the store, the fake inbox, the log, the event, or "none";
       an effect that must NOT happen is written ("no second e-mail");
     - the check it becomes: the journey spec or the integration test, the case name from acceptance.md.
     Each route and each permission has a bad path. A screen line names
     both themes and 390 px. A line that needs a deployed environment or a
     person is a question, never a softer sentence. Each line is red on
     this node's base for the right reason: a clause asserting that an
     element another node builds is absent passes there vacuously; name
     it as proved by the whole gate, or it is a question. -->

| AC | Step | Actor does | Observes | Side effect read back | Check |
|---|---|---|---|---|---|
| `<J01.s2.1>` | `<J01.s2>` | <the customer actor picks 2 baguettes for tomorrow and confirms> | <"Order received" with the order number · frame `orders-new.success`> | <one `orders` row, status `placed`, two items> | journey `<e2e/journeys/j01-place-order.spec.ts>` · case `<j-01-2>` |
| `<J01.s2.2>` | `<J01.s2>` | <the same order for yesterday> (bad path) | <422 `day_in_past`, the field marked> | <no row written> | integration `<internal/orders/place/place_test.go>` · case `<create-order-invalid>` |
| `<create-order-no-auth>` | — | <no token> | <the doctrine's 401> | none | integration · case `<create-order-no-auth>` |

**Seeds:** <the factory calls the checks use (`factory.Order(t, …)`), each test creating what it spends; never a pre-seeded record>

## Contract

<!-- Only when the node has both a Back and a Front side; omit the
     section otherwise. With it, stage 4 runs two builders in parallel,
     one per side, each against this section; without it, one builder
     does both. Copy from contracts.md, never invent: every route the
     two sides share, the request and response JSON with every field and
     type, and every error case with its status and code. -->

| Route | Request | Response | Errors |
|---|---|---|---|
| `<POST /orders>` | `<{ "day": "2026-10-05", "items": [{ "sku": "baguette", "qty": 2 }] }>` | `<201 { "id": "ord_…", "status": "placed" }>` | `<422 day_in_past · 401 no token · 403 another bakery>` |

## Golden paths

| Kind | Follow | From |
|---|---|---|
| <route · use case · job · screen · form · integration test · journey> | `<path of the exemplary module>` | recon `<area>.md` · F exemplar |

## Uses from the foundation

<!-- Every name this node reads across its boundary, copied verbatim
     from F.md "Provides" (or from the brief of the node behind an edge).
     The walk, name by name: (a) every field the screen shows and every
     input the route reads is in the contract; (b) every read the response
     is assembled from is exposed; (c) every config key and secret is in
     the config and the test env; (d) every journey that spends state
     creates its own actor or record; (e) the route's deadlines sum below
     the write timeout. A name F.md lacks is a question ("F gap: …"),
     never an invented name. -->

| Name | Kind | Producer |
|---|---|---|
| `<POST /orders>` | contract (fields `<…>`; inputs `<header X-…>`) | F |
| `<orders.Store>` | seam — real here, fake `<fake.Store>` elsewhere; contract suite `<RunStoreContract>` | F |
| `<factory.Order>` | factory | F |
| `<ORDERS_CUTOFF_HOUR>` | config (loader and test env) | F |

The behaviour consumed behind an edge is not a row here: it is the
**After** line at the top, with its class and its need.

## Owns

<!-- Every path this node creates or edits, as in plan.graph.json. One
     owner per file. Shared files are never here (except in F). -->

- `<internal/orders/place/**>` — <the use case, its handler, its tests>
- `<web/src/pages/orders/new/**>` — <the screen and its states>
- `<e2e/journeys/j01-place-order.spec.ts>` — <the journey>

## Extends

<!-- Append-only additions to a file F or an ancestor created, or to an
     existing append-safe file: a token, an optional prop, a fake's mode,
     an enum value beside its siblings. Never a frozen file, never a
     rename or a removal. The one replacement: filling a stub F left for
     this node ("fills `<the stub>`"). "none" when empty. -->

- `<web/src/tokens.css>` — <adds `--color-ready`>

## Size

<S · M · L> — <the ACs carried, the screens and server flows, an estimate of the changed lines with tests>. The cap is L: one screen with its states and one server flow, about ≤ 2,500 changed lines with tests.

## Gate

<!-- The plan's gate commands copied VERBATIM from plan.md §Gate
     commands (a finding on how they are spelled is dismissed with that
     line quoted), then this node's focused commands: the suites the
     affected run will pick, named so the builder's loop runs them. -->

1. `<the fast check>`
2. `<the affected tests, base=feat/<workstream>>`
3. `<the structure check>`

Focused: `<go test ./internal/orders/place/...>` · `<npx playwright test e2e/journeys/j01-place-order.spec.ts>`

## Out of this brief

<what looks like this node's work but belongs to another (→ E-nn), and what is direction; one line each>

## The builder decides

<one line each: a choice left open with its bound, from the design's "The implementer decides" and the plan's rulings>

## Pre-flight

<the preflight.md items this node needs and where each lives once handed; "nothing">

## Questions

<empty when the brief is done>

<!-- ================= F only, in place of "Uses from the foundation" =================

## Provides

Every name F creates, exactly as the nodes will import or call it.
The writers copy from this table; a name missing here is a gap.

| Name | Kind | Path | Design |
|---|---|---|---|
| `<POST /orders>` | contract → `<CreateOrderRequest>` (fields …; inputs …), one file per path, bundled by `<make gen>` | `<api/openapi/paths/orders.yaml>` | `contracts.md` §… |
| `<orders>` | table (`<columns>`, enum `<status>` = `<values>`, grants) | `<db/migrations/…>` | `data-model.md` §… |
| `<orders.Store>` | seam: interface | `<internal/orders/port.go>` | `architecture.md` §… |
| `<fake.Store>` | seam: in-memory fake, passes the contract suite | `<internal/orders/fake/store.go>` | |
| `<factory.Order>` | factory: fresh record, unique keys on every call | `<internal/testkit/factory/order.go>` | |
| `<actors.Customer>` | test actor: `actors.New(t, role)` | | |
| `<ORDERS_CUTOFF_HOUR>` | config in the loader and the test env | | |

## Seams

One row per cross-node interface: the interface, its fake, and the
contract suite that runs against the fake here and against the real
implementation in the producing slice (Fowler's ContractTest).

| Interface | Fake | Contract suite | Real one built by |
|---|---|---|---|
| `<orders.Store>` | `<fake.Store>` | `<RunStoreContract(t, newImpl)>` | `<E-01>` |

## Exemplars

The first instance of each kind the recon marks "none", in the
doctrine's full shape (layers, file split, wiring, test layout) and
with no business behaviour. Each node of that kind follows it.

| Kind | Path | Shape taken from |
|---|---|---|
| <module · page · job> | `<path>` | the doctrine §… |

## The F proof

- `<make gen>` then `git diff --exit-code`: the generated code is current.
- `uses-check`: a generated file that imports every name of every brief's "Uses"; it compiles on F's branch before any node starts.
- Every contract suite is green against its fake.
- Migrations apply from empty.
- The gate is green on the empty implementation. **No test pins a stub**:
  nothing asserts "not implemented", 501 or `ErrNotImplemented` on an
  operation a slice builds.
-->
