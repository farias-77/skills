# Brief — <workstream> — <E-nn | F> — <name>

<!--
  Written by a plan-writer from plan.md, the design and the recon. This
  file is the whole brief one builder receives: zero conversation
  context, the codebase, the design folder and this file. It points at
  the design; it never re-decides it and never copies what a pointer
  serves. The builder works in its own worktree and stack, builds back
  and front, runs every `run`, checks every `expect`, looks at every
  screenshot, and hands the entry back for review and merge.

  Must-haves: what it builds on each side with the design pointers;
  the proof as run/expect (and see/where for screens); what it seeds
  and with which factory; what it touches; "Out of this brief"; "The
  builder decides"; "Pre-flight"; "Questions" empty (a question left
  here is a plan defect).
-->

## What this entry delivers

<one paragraph: what a person can do when it merges, and why it waits for nothing (or for which entry's behavior)>

## Before you start

- Read: `<designs-root>/<workstream>/01-design/` (the design; `notes.md` is the law), the recon of the areas below, the consuming project's `CLAUDE.md` and its engineering doctrine.
- Starts from: the top of `feat/<workstream>` with the foundation merged<, and E-nn merged>.
- Never edit a shared file (migrations, `openapi.yaml`, generated code, the module registry): a change there is a foundation amendment; stop and report it.

## Builds

**Stories:** `<SLUG>-S-001` AC-1 · AC-2 · …

**Back** — <use case, rules, route implementation, jobs, in concrete names>
- Design: `architecture.md` §<flow> · `contracts.md` §<route> · `data-model.md` §<entity>

**Front** — <screen, states, actions> (or "none")
- Design: `ui.md` §<screen> (artboard `ui/<Screen>.dc.html`)

## Proof

| Step | Run / See | Expect / Where |
|---|---|---|
| 1 | run `<make target or spec>` | `<the cases named, the bad paths among them>` |
| 2 | see `<journey spec>` screenshots, both themes, 390 px | where `ui.md` §<screen> |
| 3 | run `make verify` | exit 0 |

**Seeds:** <factory calls the tests use, in the shape of which design section; "none">
**Touches:** <module files, screen folder, spec files>

## Out of this brief

<what looks like this entry's and is another's (→ E-nn), and what is direction, one line each>

## The builder decides

<one line each: a choice left open with its bound, from the design's latitude sections where they apply>

## Pre-flight

<what the user handed over for this entry and where it lives; "nothing">

## Questions

<empty when the brief is done>
