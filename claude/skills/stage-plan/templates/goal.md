# Goal — <workstream> — wNN-<slug>

<!--
  Written by the plan-author from waves.md and the design. This file
  is the whole brief the execution chair receives for the wave: a
  session with zero conversation context, the repos, and the design
  folder. It points at the design; it never re-decides it and never
  copies what a pointer serves. The reader implements row by row, in
  order, deploys alpha, proves every "ready when", and opens the PR.

  Must-haves: every row of the wave with its ready-when made
  commandable; the design pointers per row; the branch and PR
  mechanics; the proof the wave owes as a whole; "Out of this wave";
  "The worker decides"; "Questions" empty (a question left here is a
  plan defect).
-->

## What this wave delivers

<the wave's Delivers paragraph from waves.md, then: what a person can do in alpha at the end, as the wave's ready-when>

## Before you start

- Read: `<designs-root>/<workstream>/01-design/` (the design; `notes.md` is the law), the consuming project's `CLAUDE.md`, each repo's `CLAUDE.md` and `docs/`.
- Branches: `feat/wNN-<repo>` from `feat/<workstream>` (the workstream branch, cut from `main` at the first wave, carrying every wave merged so far); one branch per row from it; PR of each row into the wave branch; the wave's PR into `feat/<workstream>` at the end, merged after the wave's proof. `main` is stage 5's.
- Environment: alpha only. Prod does not exist here.
- Deploy order across repos: <repo → repo, why>.

## The rows, in order

### N.1 — `<repo>` — <the slice in one sentence>

- **Builds:** <tables, routes, screens, jobs, in concrete names; the values the design fixes>
- **Design:** `architecture.md` §<flow> · `contracts.md` §<section> · `data-model.md` §<entity> · `ui.md` §<screen> · `acceptance.md` cases `<name>` · `<name>`
- **Stories:** `<SLUG>-S-001` AC-1 · AC-2 · AC-8
- **Ready when:** <the command or the observation: `smoke/<folder>` green (N cases, the bad paths included) · `<screen>` rendered against the alpha API in both themes and at 390 px · `aws …` shows the resource>
- **Depends on:** — | N.k (what it consumes: `<route>`, `<table>`, `<exported surface>`)
- **Out:** <what looks like this row's and is N.k's>

### N.2 — ...

Parallel: N.2 ∥ N.3 (they touch different surfaces; N.3 does not read what N.2 writes)

## The wave's proof

- The whole smoke suite of every repo green against alpha, run once at the end, after the last row's merge into the wave branch.
- <the end-to-end walk a person does in alpha: log in as X, do Y, see Z>
- Evidence in the PR: the suite's summary line per repo, the screens rendered, the resources listed.

## Out of this wave

<what is a later wave's (→ wNN) and what is direction (an extension point named in the design), one line each>

## The worker decides

<one line each: a choice left open with its bound, copied from the design's latitude sections where they apply to this wave, plus what the plan leaves open on purpose>

## Stays with the user

<what the user owes and does not block the wave: texts, credentials, third-party contracts; what the wave does in their absence (a placeholder marked as such, never shipped to prod)>

## Questions

<empty when the goal is done>
