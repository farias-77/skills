# Brief — <workstream> — <E-nn | F> — <name>

<!--
  Written by a plan-writer from plan.md, the design, the recon and,
  for an entry, the foundation's brief F.md (written first, so every
  name an entry uses from it is fixed). This file is the whole brief
  that one builder (Opus 5.5, medium) receives: it has no conversation
  context, only the codebase, the design folder, the golden paths and
  this file. Before any code, a verifier (Sonnet 5.5, high) writes one
  check for each Acceptance line and runs it red against the base.
  The builder then builds back and front until those checks and the
  plan's gate commands are green.

  Must-haves:
  - Acceptance: every line can be checked on the local stack and names
    what can be observed and the side effect read back.
  - Golden paths: one exemplar for each kind of code the entry adds.
  - Uses from the foundation: the names copied verbatim from F.md
    "Provides".
  - Extends.
  - Size, within the cap.
  - "Out of this brief", "The builder decides" and "Pre-flight".
  - "Questions" empty: a question left here is a plan defect.

  The gate commands are NOT repeated here: plan.md fixes them once
  for every entry.

  For F: "Provides" replaces "Uses from the foundation"; "Exemplars"
  lists the first instance of each new kind that F creates.
-->

## What this entry delivers

<one paragraph: what a person or a caller can do when it merges, and why it waits for nothing (or for which entry's behavior)>

## Before you start

- Read: `<designs-root>/<workstream>/01-design/` (the design; `notes.md` is the law), the recon of the areas below, the consuming project's `CLAUDE.md`, its engineering doctrine and its golden paths.
- Starts from: the top of `feat/<workstream>` with the foundation merged<, and E-nn merged — or E-nn's branch when it is ready and not yet merged (stacked)>.
- Frozen files: the doctrine's shared files (migrations, the API contract, the generated code, the module registry). Never edit them. A change there is a foundation amendment: stop and report it.
- Feature map: this entry updates `<the feature map's path>`, rows `<ids>`<; or "none: E-nn owns these rows">.

## Builds

**Stories:** `<SLUG>-S-001` AC-1 · AC-2 · …

**Back** — <use case, rules, route implementation, jobs, in concrete names>
- Design: `architecture.md` §<flow> · `contracts.md` §<route> · `data-model.md` §<entity>

**Front** — <screen, states, actions> (or "none")
- Design: `ui.md` §<screen> (artboard `ui/<Screen>.dc.html`)

## Acceptance

<!-- One line per story AC and per acceptance case the entry carries.
     The verifier turns each line into one check. Rules for a line:
     - the actor (a role from the stack's actors, or a caller);
     - what they do;
     - what they observe (the screen state, the status and body, the
       exit code);
     - the side effect read back (the row, the mail in the fake inbox,
       the log line, the event), or "none";
     - one bad path at least for each route and each permission.
     "Works" is not an acceptance line. A line that needs a deployed
     environment or a person is a question. -->

| # | Carries | Actor does | Observes | Side effect read back | Check |
|---|---|---|---|---|---|
| A-1 | S-001 AC-1 · `<case>` | <actor> <action, with the values> | <what they see or receive> | <the row / mail / log line, or none> | journey `<spec path>` · integration `<test path>` |
| A-2 | `<case>` (bad path) | | | | |
| A-3 | `ui.md` §<screen> | <actor> opens <route> at 390 px and 1440 px, both themes | the states the artboard draws | none | journey `<spec path>`, screenshots → artboard `ui/<Screen>.dc.html` |

**Seeds:** <factory calls the checks use, in the shape of which design section; "none">

**Proof beyond the acceptance:** <a command this entry needs that the gate commands do not run, with its expected output (a migration from empty, a generator, a lint); usually "none">

## Golden paths

<!-- For each kind of code this entry adds, the exemplary module it
     must look like. Copy the path from the recon's "Golden paths"; for
     a kind that is new to the codebase, use the exemplar that F
     creates. -->

| Kind | Follow | From |
|---|---|---|
| <route · use case · job · screen · form · integration test · journey> | `<path of the exemplary module>` | recon `<area>.md` · F |

## Uses from the foundation

<!-- Every name this entry reads from the frozen files and the
     foundation's harness, copied verbatim from F.md "Provides". If
     the entry needs something that F does not provide, ask in
     "Questions"; never leave it for stage 4 to find. Categories:
     (a) every field the screen shows and every input the route reads
     (header, parameter, body field) are in the contract; (b) every
     read the route assembles its response from is exposed by a module
     of F; (c) every config value and secret is in F's config and in
     the test environment; (d) each journey that spends or changes
     state has its own target (actor or record) per project and per
     width, reset on every environment up; (e) the route's time
     budget, with this entry's terms, stays under the server's write
     timeout. Also the tables, columns, enum values and grants it
     writes with. -->

| Kind | Name (verbatim from F.md) | Producer |
|---|---|---|
| contract | `<METHOD /path>` · field `<x>` · header `<y>` | F |
| table | `<table>.<column>` · enum `<type>` = `<values>` · grant `<role>` | F |
| module read | `<module>.<Read>` | F |
| config | `<KEY>` (config and test env) | F |
| test target | `<actor or record>` per project and width | F |
| behavior | <the behavior consumed> | E-nn (edge) |

## Extends

<!-- Files that F or another entry created which this entry adds to
     and does not change: a token, an optional prop, a fake mode, a
     domain value, a helper beside its siblings. Additions only. Never
     a frozen file. A rename or a change of meaning is a question. -->

<path — what is added, one line each; "none">

## Size

<S · M · L> — <the story ACs, the screens and server flows, an estimate of the changed lines with tests>. The cap is L: one screen with its states and one server flow, ≤ 8 story ACs, about ≤ 2,500 changed lines with tests.

**Touches:** <module files, screen folder, test files>

## Out of this brief

<what looks like this entry's work but belongs to another entry (→ E-nn), and what is direction; one line each>

## The builder decides

<one line each: a choice left open with its bound, from the design's latitude sections where they apply>

## Pre-flight

<what the user handed over for this entry and where it lives; "nothing">

## Questions

<empty when the brief is done>

<!-- F only, in place of "Uses from the foundation" and "Extends":

## Provides

Every name F creates, exactly as the entries will import or call it.
The entries copy from this table, so a name missing here is a gap.

| Kind | Name | Path | Design |
|---|---|---|---|
| contract | `<METHOD /path>` → `<GeneratedType>` (fields …; inputs …) | | `contracts.md` §… |
| table | `<table>` (`<columns>`), enum `<type>` = `<values>`, grants `<role>: <columns>` | | `data-model.md` §… |
| module | `<module>` registered; reads `<Read>(…)` | | `architecture.md` §… |
| config | `<KEY>` in the config and in the test env | | |
| factory · fake · test target | `<factory.X>` · `<fake>` modes … · `<actor per project and width>` | | |
| shared | `<component / token / helper>` | | `ui.md` §… |

## Exemplars

The first instance of each kind that is new to the codebase, built in
the full shape the doctrine prescribes (layers, file split, wiring,
test layout) and with no business behavior. Each entry of that kind
follows it.

| Kind | Path | Shape taken from |
|---|---|---|
| <module · page · job> | `<path>` | the doctrine §… |

No test in F pins a stub: no assertion of "not implemented" (501,
`ErrNotImplemented`) on an operation that an entry builds.
-->
