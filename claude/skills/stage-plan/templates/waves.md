# Waves — <workstream> — from A to B

<!--
  Written by the CONDUCTOR, whole, once the user approved the cut
  wave by wave. The writers never edit it; the master of stage 4
  fills the Status column as rows close and writes the amendments.

  Three words: a ROW is one story inside one repo, with its own proof
  (a command and what it prints, or a screen and its artboard). A
  LANE is the rows of one repo in order; an edge between two rows
  exists only when one row's proof needs the other running in alpha;
  a contract the design froze is not an edge. A WAVE is an acceptance
  gate, not a phase: the rows that must be merged, the walk the
  master runs in alpha, the suites green before; lanes never stop
  for a wave. Nothing is accepted for the demand until its wave is
  green.

  Decision blocks (house format) where the user chose between two
  cuts; the conductor's recommendation kept beside the choice.
-->

## From A to B

**A (today):** <one paragraph from recon/: what each repo has, what is in alpha>
**B (the design):** <one paragraph: what exists in alpha when the last wave is green>

## The frozen contracts

<!-- the reason a lane never waits for another: what one lane writes and another reads, with the design section that fixes the shape -->

| Contract | Fixed in | Written by | Read by |
|---|---|---|---|
| `recordings` item with `source.*` | `data-model.md` §recordings | ingestion 1.4 | tracking 2.1 · front 2.4 (via the API) |

## Alpha, and what may deploy to it

- Alpha is the top of `feat/<workstream>` of each repo, always. A row is built on its own branch and never deployed from there; its PR merges when its proof is green, and the merge deploys.
- At a wave, the master tags that top (`wNN`) in every repo the wave requires, then walks. While a walk or a whole suite runs on a stack, no deploy lands on it; coding and merging go on.
- A red walk is fixed by a row on top of the lane, never by a rollback.
- Stacks shared by two lanes: <front reads the tracking alpha> — the same rule, held by the master's schedule.

## The lanes

### Lane `<repo>` — worker `<session name>`

| # | Story | Work | Proof | After | Wave |
|---|---|---|---|---|---|
| 1.1 | S-001 | <the slice: tables, routes, screens, in one sentence with the concrete names> | run `<command>` → expect `<output, with the count>` | — | w01 |
| 1.2 | S-002 | | see `<screen>` against the alpha API, both themes, 390 px → where `ui.md` §<screen> | 1.1 (consumes `<route>`; the proof calls it) | w01 |

Parallel inside the lane: 1.2 ∥ 1.3 (different surfaces: <which>)
Touches / read by: 1.1 touches `smoke/users/`, table `users`; read by tracking 2.1 (via the frozen item shape)
Shares an alpha stack with: <lane, or none> — <the rule: never a smoke and a deploy at the same time on that stack>
Pre-flight (needed from the user before this lane starts): <item · which row · or none>

### Lane `<repo>` — worker `<session name>`

...

## The waves

### w01 — <name>

**Accepts when:** <one sentence: what a person can do in alpha at this gate>
**Requires merged and deployed:** ingestion 1.0–1.5 · tracking 2.1
**Affected folders:** `smoke/status/` · `smoke/accounts/` (what the rows touch, plus what reads it)
**Suites green before:** ingestion whole (34 cases) · tracking whole (233 cases, about an hour, in the worker's background)

| Step | Run | Expect |
|---|---|---|
| 1 | `<command the master types>` | `<what it prints>` |
| 2 | see `<screen>` | screenshot to `03-execution/w01/proof/` · matches `ui.md` §<screen> |

**The master decides alone here:** <a count, a pointer, the order of two independent rows, an amendment to notes.md that changes what no story delivers>
**Parks for the user:** <a change to what a story delivers, a contract, the security posture, a stateful deletion the goal does not explain, a pre-flight item missing>
**Shadow suite:** yes — the whole suite of every repo runs after this gate closes; red blocks the next gate, never a lane

> **Decision — <title>**
> Context: <the cut in question>
> Options: A) <one wave — its cost> · B) <two waves — its cost>
> Recommended: <letter>
> Chosen: <letter> — <why, the user's words>

### w02 — <name>

...

## Status

<!-- stage 4 fills: one line per row as it closes: date · row · PR · proof line -->

## Amendments

<!-- A row or a wave that changes while being built: date, what changed,
     why, in the user's words where he gave them. The rows above are
     edited in place; the amendment is the trail. -->
