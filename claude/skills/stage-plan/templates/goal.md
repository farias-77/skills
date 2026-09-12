# Goal — <workstream> — lane `<repo>` — <wNN>

<!--
  Written by a plan-writer from waves.md, the design and recon/<repo>.md.
  This file is the whole brief one worker session receives for its lane
  up to this wave: a session with zero conversation context, this repo,
  the design folder and this file. It points at the design; it never
  re-decides it and never copies what a pointer serves. The worker
  builds row by row, in order, deploys alpha, runs every `run`, checks
  every `expect`, opens the PR, writes the row's report, and tells the
  master.

  Must-haves: every row of this lane and wave with `run`/`expect` (or
  `see`/`where`); the design pointers per row; touches and read-by per
  row; the branch and PR mechanics; what the worker owes the wave;
  "Out of this goal"; "The worker decides"; "Pre-flight" (what the user
  handed over, and where it is); "Questions" empty (a question left
  here is a plan defect).
-->

## What this goal delivers

<the lane's rows up to this wave, in one paragraph: what exists in this repo's alpha when the last row closes; which wave accepts it and what the master will walk>

## Before you start

- Read: `<designs-root>/<workstream>/01-design/` (the design; `notes.md` is the law), `02-plan/recon/<repo>.md` (what exists today), the consuming project's `CLAUDE.md`, this repo's `CLAUDE.md` and `docs/`.
- Branches: one branch per row, `feat/<workstream>/<N.k>-<slug>`, cut from `feat/<workstream>` of this repo (cut from `main` at the first row); PR of each row into `feat/<workstream>`, merged when its proof is green; the merge is what deploys. No wave branch. `main` is stage 5's.
- Alpha is the top of `feat/<workstream>`, always; never deploy a row branch. While the master walks a wave on this stack, or this repo's whole suite runs, no deploy lands here: keep coding and merging, hold the deploy. The master tags the top (`wNN`) at every wave it walks.
- Environment: alpha only. Prod does not exist here.
- Shares the alpha stack with: <lane, or none>. Rule: never deploy while that lane's suite runs on it, never run a smoke while it deploys.
- Deploy: `<command from recon>` · smoke of one folder: `<command>` · whole suite: `<command>` (<N> cases, about <t>)

## The rows, in order

### N.1 — <the slice in one sentence>

- **Builds:** <tables, routes, screens, jobs, in concrete names; the values the design fixes>
- **Design:** `architecture.md` §<flow> · `contracts.md` §<section> · `data-model.md` §<entity> · `ui.md` §<screen> · `acceptance.md` cases `<name>` · `<name>`
- **Stories:** `<SLUG>-S-001` AC-1 · AC-2 · AC-8
- **Run:** `<the command, as typed in this repo>`
- **Expect:** `<what it prints: "0 failed" of N cases; the bad-path cases named>`
- **After:** — | N.k (consumes `<route>` / `<table>`; the proof calls it)
- **Seeds:** <when the row proves on frozen data: which fixture, in which shape, from which design section>
- **Touches:** `smoke/<folder>/` · table `<name>` · screen `<name>`
- **Read by:** <lane N.k (through what)> — <or nothing>
- **Out:** <what looks like this row's and is N.k's>

### N.2 — <a front row>

- **Builds:** …
- **See:** `<screen>` at `localhost:5173` against the alpha API, both themes, 390 px
- **Where:** `ui.md` §<screen> (artboard `ui/<Screen>.dc.html`); screenshot to `03-execution/<wave>/proof/<N.k>.png`
- **Run:** `npm test && npm run build` · **Expect:** `<N> passed`, build green
- …

Parallel: N.2 ∥ N.3 (different surfaces: <which>)

## What this lane owes the wave

- When the last row of this goal is merged and deployed: the whole suite of this repo, `<command>`, in the background, no deploy on this stack until it ends; then the line "`<repo>` ready for <wNN>" to the master, with the suite's summary line.
- The master's walk at <wNN> runs these steps against this repo: <the steps of the wave's walk that touch this lane, copied from waves.md>.
- The first row that deploys runs its folder alone before anything is stacked on it.

## Out of this goal

<what is a later wave's (→ wNN) and what is direction (an extension point named in the design), one line each>

## The worker decides

<one line each: a choice left open with its bound, copied from the design's latitude sections where they apply to these rows, plus what the plan leaves open on purpose>

## Pre-flight

<what the user handed over for these rows and where it lives (a parameter name, a gitignored file, an account); "nothing" when nothing was needed. A row whose item is missing is parked, never worked around>

## Questions

<empty when the goal is done>
