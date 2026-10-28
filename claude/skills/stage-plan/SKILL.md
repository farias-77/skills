---
name: stage-plan
description: Stage 3 of the pipeline, under one /goal, asking him nothing. Plans how to get from the repo as it is today to the closed design as fast as a team with no size limit would, in the order a senior team would build it - a thin contract commit, whole behaviours in parallel, an edge only where nothing can be faked - writes one brief per node, checks the pre-flight, reviews once, and closes with what it decided in his place. Use when a workstream's .state.md says stage plan, or to resume a plan by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Workflow, Artifact, Bash
---

# Stage 3 · Plan

Plan is the sprint planning of a team with no size limit. From A (the
repo today, and what the other workstreams are changing) to B (the
closed design), it decides what is built first, what runs at once and
the few things that must wait, the way a senior team would: every
piece is a whole behaviour someone can see work, run in parallel where
the seam is real, never split only to gain width. It re-decides nothing
of the design and asks him nothing; he sees the report and may veto
what was decided in his place.

## The bar

The stage is done when every line holds:

1. Every AC is carried by exactly one node; no entry has more than 12.
2. After a thin contract commit (C, about 30 minutes), every entry
   starts at once, except where nothing can be faked; each edge names
   its need.
3. Every entry is a whole behaviour, in the order a senior team would
   build it, and follows the golden path its kind of code has in the
   project's standards.
4. Every brief is buildable without asking, and two blind readers
   understand the same thing.
5. The pre-flight holds only what he must do in person.
6. One review round is ruled and applied; `plan-graph.mjs --briefs` is
   green; the report's Explainer is published.

## The flow

```
/stage-plan <slug> → opening: P0 scouts (background) + the /goal
  P0 recon → P1 cut → checker green
  → P2 briefs ∥ pre-flight → checker --briefs
  → P3 one review round → you rule → fixes → checker
  → P4 coordination ∥ report → /clear, /stage-execute <slug>
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| P0 recon | `scout` (Haiku 5.5, high) × N, background | `recon/<topic>.md` |
| P1 cut | `planner` (Opus 5.5, high) + `plan-graph.mjs` | `plan.graph.json`, `plan.md`, `graph.json`, `graph.mmd` |
| P2 briefs | `plan-writer` (Sonnet 5.5, high) × node, at once; you write the pre-flight | `briefs/<id>.md`, `preflight.md` |
| P3 review | `plan-review-workflow.js`: `plan-reviewer` (Opus 5.5, medium) ∥ per brief `blind-reader` (Haiku 5.5, high) × 2 → `blind-judge` (Sonnet 5.5, medium); you rule (Opus 5.5, medium) | `reviews/round-1.json`, `reviews.md` |
| P4 close | you; the Explainer from the template; video and slides only when he asks | `_coordination.md`, the Plan tab of the workstream's link |

## What you read

| File | When |
|---|---|
| [references/cut.md](references/cut.md) | at the opening: how a cut is judged |
| [references/contract-commit.md](references/contract-commit.md) | at P1, before you rule C |
| [references/coordination.md](references/coordination.md) | when the recon or the checker finds an overlap |
| `<kit>/references/judging.md` | at P3: the plan section, the scale and the owners |
| `plan.md`, `graph.json`, the briefs | whole: you rule on them |

## Files

```
<designs-root>/<slug>/
├── .state.md            stage: plan, step, kit, planner id, writer ids, report url
├── rulings.md · dreaming-notes.md
├── 00-discovery/        stories.md (the AC ids), the locked mock (read only)
├── 01-design/           solution.md and the five documents (read only)
└── 02-plan/
    ├── recon/           <topic>.md, one per scout
    ├── plan.graph.json  the planner's; the checker's input
    ├── graph.json · graph.mmd   the checker's output: waves, critical path, start order, reviewBriefs
    ├── plan.md          the planner's (template: templates/plan.md)
    ├── briefs/<id>.md   the writers' (template: templates/brief.md)
    ├── preflight.md     yours (template: templates/preflight.md)
    ├── reviews/round-1.json
    └── reviews.md       your rulings (template: templates/reviews.md)
```

`plan-graph.mjs` is `node <kit>/skills/stage-plan/scripts/plan-graph.mjs`:

```
node <plan-graph.mjs> 02-plan/plan.graph.json --stories 00-discovery/stories.md \
     [--briefs 02-plan/briefs] --json 02-plan/graph.json --mermaid 02-plan/graph.mmd
```

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..` is the kit; write
   it in `.state.md` as `kit:`. **Preconditions:** `.state.md` says
   `stage: plan`, and `01-design/` has `solution.md` closed and the five
   documents. Missing: stop, and name the stage that owns it.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open: the
   pulls, who else is working.
3. **P0 starts now**, in the background.
4. **The goal.** One message with the command to paste, in his
   language:

```
/goal Plan <slug> with the stage-plan skill, asking me nothing.
Done when: plan-graph.mjs --briefs is green; one plan-review round is ruled and
applied; _coordination.md has this workstream's line; the Plan tab of the
workstream's link has its explainer and the tabs I picked; the last message lists
what was decided in my place and the next command.
```

## P0 · Recon

One `scout` per question, all in one message. Each answer opens with
`<repo>@<branch> <sha>`, quotes `path:line`, and is saved as it came to
`02-plan/recon/<topic>.md`:

- **The standards** (the folder the project's `CLAUDE.md` names): the
  golden path of each kind of code the design adds, the gate commands,
  the shared files and how migrations are named.
- **Per area the design touches:** what exists of what the design names
  (routes, tables, screens, factories), and the hot files
  (`git log --since=60.days --name-only --format= -- <area>`).
- **The generators:** each command and every path it writes.
- **The other workstreams:** `_coordination.md`, their `.state.md`,
  every unmerged branch's changed files, shared files first.

A kind of code with no golden path is a line in the recon: C builds the
first one. A scout that misses its question goes back once.

## P1 · The cut

Dispatch `planner` with: the workstream path, the design and discovery
folders, `recon/`, the templates (`plan.graph.json`, `plan.md`), the
references folder, `plan-graph.mjs`, the project's `CLAUDE.md`, the
language. Keep its id in `.state.md`. It writes both files and returns
with the checker green.

Rule the cut by [references/cut.md](references/cut.md): a false edge, a
fat C, a layer posing as an entry, a split that only buys width, an
entry near the cap on the critical path go back to the planner by
`SendMessage` until they hold.

**An overlap with another workstream** (the recon, or the checker's
`workstream` warning): message that session now, by
[references/coordination.md](references/coordination.md). Its answer,
or the conservative rule after 15 minutes of silence, goes to the
planner as a fix.

## P2 · Briefs and pre-flight

In one message, one `plan-writer` per node, write mode: the node id,
`plan.graph.json`, `plan.md`, the design folder, `stories.md`, the
standards' path, [templates/brief.md](templates/brief.md), the
language. Keep each id in `.state.md`.

**While they write**, write `02-plan/preflight.md` from
[templates/preflight.md](templates/preflight.md). Run every check that
does not need him yourself: the gate commands on `main`, the stack
coming up, `gh` acting as the bot identity, the signoff command ready
(`<signoff command> --help` answers), the cloud environment. Only what
he must do in person stays as an item, with a ready `!` command, a `!`
check, and what it blocks.

**The writers' questions** come back together. Answer each from the
design: the option that keeps the lock and the graph, reversible, at
the lowest cost. A question that changes the cut goes to the planner
first. Each writer gets its answers in one message. A choice that
changes what he will see goes under "Decided in his place" in
`plan.md` and in `rulings.md` (`ruled: conductor`).

Then the checker with `--briefs`, until green.

## P3 · The review, one round

Run `<kit>/workflows/plan-review-workflow.js` by `scriptPath` with
`args`: `planDir`, `designDir`, `storiesPath`, `root` (the codebase),
`referencesDir` (`<kit>/skills/stage-plan/references`), `language`,
`briefs` (`graph.json`'s `reviewBriefs`), and `inlineAgents: true` with
`agentsDir: <kit>/agents`. Save `.result` as
`02-plan/reviews/round-1.json`. A round marked invalid is fixed at its
cause and run again.

| Part | Asks |
|---|---|
| `plan-reviewer` | is each entry buildable without asking? is every edge real? is C thin and enough? are the other workstreams agreed? |
| Double-blind (per brief: `blind-reader` × 2, then `blind-judge`) | do two builders who see only the brief understand the same thing? |

Rule every finding in `reviews.md` before any fix leaves, by the plan
section of `<kit>/references/judging.md`:

| Finding about | Owner | What happens |
|---|---|---|
| the cut (a false edge, a fat C, a layer, the cap) | `planner` | `SendMessage`, apply mode, checker green |
| a brief's text (a divergence, a value the design fixes) | that brief's `plan-writer` | applies |
| a detail the design left open that changes nothing built | the builder | one line in the brief's "The builder decides" |
| a gap the design should have decided | you, in his place | the conservative option; `ruled: conductor`; listed for veto |

Send the fixes in one message (the planner's first; then the writers',
with what the planner moved), the files staged (`git add`) first.
Verify each fix by `git diff -- <file>` against its finding, opening
the file only when they disagree; run the checker with `--briefs` once
more and record each verdict in `reviews.md`.

## P4 · The report and the close

In parallel:

1. **Coordination.** This workstream's line in `_coordination.md`:
   stage `execute`, branch `feat/<slug>`, this session's name, the
   shared files it will touch and what was agreed.
2. **The report**, as `<kit>/../docs/stage-report.md` describes. The
   Explainer is filled from the template with `plan.graph.json`: the
   graph, clickable, each node with its ACs, files and parents. Ask the
   close's question (also make: Video · Deck, none is a valid answer)
   and dispatch what he picks: `video-builder` (Sonnet 5.5, high) the
   graph assembling, C first, the entries in parallel, the critical
   path; `slides-builder` (Sonnet 5.5, medium) the entries, the edges
   and why, the agreements, what was decided in his place, the
   pre-flight. Run `gitleaks dir <workstream>` (a finding stops the
   publish) and publish labelled "plan closed".
3. **Cleanup.** Any scratch this stage made.

Then `.state.md` → `stage: execute`, commit the workstream folder, and
one message: the link · the graph as a flow in a code block, the
critical path marked · decided in your place (one line each, the veto
it allows) · the pre-flight (item · what it blocks, or "nothing") · the
next play:

```
/clear
/stage-execute <slug>
```

A pre-flight item never stops this stage: it waits for stage 4.

## Resuming

`/stage-plan <slug>`: the opening's steps 1–2, then `.state.md`. The
first missing output decides the step: no `recon/` → P0; no green
`plan.graph.json` → P1; a missing brief or a red `--briefs` → P2; no
`reviews/round-1.json` → P3; `reviews.md` without its verdicts → the
end of P3; no report → P4. A fresh planner or writer reads its file
first and never rewrites a finished one.

No code and no branches here, and nothing of the design re-decided: a
node that cannot be built as designed is a dated amendment request in
`01-design/notes.md` and the node marked blocked in `plan.md`.
