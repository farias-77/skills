---
name: stage-plan
description: Conducts stage 3 (Plan) on its own, under one /goal - cuts the closed design into a build graph stage 4 runs as wide as it can (a thin contract commit C, entries that are each one whole behaviour of at most 12 ACs, front and back in parallel on the Contract, an edge only where nothing can be faked, E-int last), writes one brief per entry, checks the pre-flight, runs one review round (plan-reviewer ∥ two blind readers and a judge per brief), rules every finding itself, coordinates with the other fronts by message, and closes with its report (Video, Deck, Explainer) and the next command. Asks the user nothing. Use when a workstream's .state.md says stage plan, or to resume a plan in progress.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Artifact, Bash
---

# Stage 3 · Plan

The closed design comes in. A plan comes out: what C lays down, which
entries run at once, the few that wait and why, who owns each file, and
a brief per node that a builder builds without asking. The plan
re-decides nothing of the design. It is operational: the user does not
review it; he watches its report at the end and may veto what was
decided in his place.

## The bar

1. Every AC is carried by exactly one node; no entry has more than 12.
2. After a thin C (~30 min), every entry starts at once, except where
   nothing can be faked.
3. Every brief is buildable without asking, and two blind readers
   understand the same thing.
4. Zero questions to him. About 1 h to 1 h 30.

## The flow

```
open ──► P0 recon ──► P1 cut ──► P2 briefs ∥ pre-flight ──► checker --briefs
     ──► P3 plan-review-workflow → rule → fixes → checker ──► P4 coordination ∥ report ∥ cleanup
     ──► the message: the link + /clear + /stage-execute <slug>
```

| Step | Who | Produces |
|---|---|---|
| P0 recon | `scout (Sonnet 5.5, low)` × N, all at once | `02-plan/recon/<topic>.md` |
| P1 cut | `planner (Opus 5.5, high)` + `plan-graph.mjs` | `plan.graph.json`, `plan.md` |
| P2 briefs | `plan-writer (Sonnet 5.5, high)` × node, all at once; the session writes `preflight.md` | `briefs/<id>.md`, `preflight.md` |
| P3 review | `plan-review-workflow.js`: `plan-reviewer (Opus 5.5, medium)` ∥ per brief `blind-reader (Sonnet 5.5, low)` × 2 → `blind-judge (Sonnet 5.5, medium)` | `reviews/round-1.json`, `reviews.md` |
| P4 close | the session; `video-builder (Sonnet 5.5, high)` ∥ `slides-builder (Sonnet 5.5, medium)`; the Explainer by template | the report, `_coordination.md`, the message |

The session is the conductor: Opus 5.5, high. It dispatches, rules,
writes `preflight.md` and `reviews.md`, and never reads to look
something up: a scout does (house rule).

## Inputs and outputs

```
<designs-root>/<slug>/
├── .state.md                 stage: plan
├── rulings.md · dreaming-notes.md
├── 00-discovery/             stories.md (the AC ids), the locked mock
├── 01-design/                solution.md · data-and-contracts.md · tests.md · operations.md
│                             · security-and-access.md · screens.md (read, never edited)
└── 02-plan/
    ├── recon/<topic>.md      the scouts' answers, as they came
    ├── plan.graph.json       the planner's; plan-graph.mjs's input
    ├── graph.json · graph.mmd   the checker's output: waves, critical path, start order, reviewBriefs
    ├── plan.md               the planner's
    ├── briefs/<id>.md        the writers'
    ├── preflight.md          the session's
    ├── reviews/round-1.json  the workflow's return
    └── reviews.md            the session's rulings
```

Missing a design document: stop, and say which stage owns it.

## Open

1. **The house rules.** Read the file that
   `realpath ${CLAUDE_SKILL_DIR}/../../../CLAUDE.md` prints and run its
   Open: the canary (in the product
   repo).
2. Read `.state.md`: it says `stage: plan` (else stop, the stage it
   names owns the front); dispatch P0 in the background.
3. Hand him the goal, filled in, in one code block:

```
/goal Plan <slug> with the stage-plan skill, asking me nothing.
Done when: plan-graph.mjs --briefs is green; one plan-review round is ruled and
applied; the other fronts are coordinated and _coordination.md has this front's
line; the plan's report (Video, Deck, Explainer) is published on the front's link;
the last message lists what was decided in my place and the next command.
```

## P0 · Recon

One `scout (Sonnet 5.5, low)` per question, all in one message. Each
answer opens with `<repo>@<branch> <sha>` and quotes `path:line`. Save
each as it came to `02-plan/recon/<topic>.md`.

- **Per area the design touches:** what exists of what the design
  names (routes, tables, screens, factories); the golden path for each
  kind of code it adds; the gate commands; the hot files
  (`git log --since=60.days --name-only --format= -- <area>`).
- **The generators:** each command and every path it writes.
- **The other fronts:** `_coordination.md` (each front's stage, branch
  and session name), their `.state.md`, every unmerged branch's changed
  files, shared files first (migrations, the spec, build files).

A scout that misses its question goes back once.

## P1 · The cut

One `planner (Opus 5.5, high)` with: the workstream path, the design
and discovery folders, `recon/`, the templates
(`${CLAUDE_SKILL_DIR}/templates/plan.graph.json`, `plan.md`), the
references (`${CLAUDE_SKILL_DIR}/references/`), the checker
(`${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs`), the project's
`CLAUDE.md` and the language. It writes both files and runs the
checker green:

```
node "${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs" <designs-root>/<slug>/02-plan/plan.graph.json \
     --stories <designs-root>/<slug>/00-discovery/stories.md \
     --json <designs-root>/<slug>/02-plan/graph.json --mermaid <designs-root>/<slug>/02-plan/graph.mmd
```

Then rule the cut against [references/cut.md](references/cut.md): a
false edge, a fat C, a layer posing as an entry, an entry near the cap
on the critical path go back to the planner (`SendMessage`, apply mode)
until they hold.

**Overlap with another front** (the recon or the checker's `front`
warning): message that front's session now, by
[references/coordination.md](references/coordination.md). Its answer,
or the conservative rule after 15 minutes of silence, goes to the
planner as a fix.

## P2 · Briefs and pre-flight

In one message, one `plan-writer (Sonnet 5.5, high)` per node, write
mode, with: the node id, `plan.graph.json`, `plan.md`, the design
folder, `stories.md`, the template (`${CLAUDE_SKILL_DIR}/templates/brief.md`)
and the language.

**While they write**, write `02-plan/preflight.md` from
[templates/preflight.md](templates/preflight.md). Run every check that
does not need him yourself: the gate commands on `main`, the stack
coming up, `gh` acting as the bot identity, the signoff command ready
(it exists and `<the signoff command> --help` answers, or
`claude/scripts/local-ci.sh --help` when the project names none; the
whole gate runs once, at the end), the cloud
environment, the canary. Only what he must do in person stays as an
item, with a ready `!` command, a `!` check, and what it blocks.

**The writers' questions** come back together. Answer each from the
design: the option that keeps the lock and the graph, reversible, at
the lowest cost. A question that changes the cut goes to the planner
first. Send each writer its answers in one message. A choice that
changes what he will see goes under "Decided in his place" in
`plan.md` and in `rulings.md` (`ruled: conductor`).

Then the checker with the briefs, until green:

```
node "${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs" <designs-root>/<slug>/02-plan/plan.graph.json \
     --stories <designs-root>/<slug>/00-discovery/stories.md --briefs <designs-root>/<slug>/02-plan/briefs \
     --json <designs-root>/<slug>/02-plan/graph.json --mermaid <designs-root>/<slug>/02-plan/graph.mmd
```

## P3 · Review, one round

Run `plan-review-workflow.js` by `scriptPath`
(`${CLAUDE_SKILL_DIR}/../../workflows/plan-review-workflow.js`) with:
`planDir`, `designDir`, `storiesPath`, `root` (the codebase),
`referencesDir` (`${CLAUDE_SKILL_DIR}/references`), `language`, and
`briefs` = `graph.json`'s `reviewBriefs`. While the agents are not
installed, add `inlineAgents: true` and `agentsDir`. If the Workflow
tool refuses a path outside the working directories, copy the file into
`<slug>/_run/` and run the copy.

Save `.result` as `02-plan/reviews/round-1.json`. `valid: false` is not
a round: fix the cause, run it again.

**Rule** every finding by the plan section of
`claude/references/judging.md`, and write `reviews.md` before any fix
leaves:

| Finding about | Owner | What happens |
|---|---|---|
| the cut (a false edge, a fat C, a layer, the cap) | `planner` | `SendMessage`, apply mode, checker green |
| a brief's text (a divergence, a missing value the design fixes) | that brief's `plan-writer` | applies |
| a detail the design left open that does not change what is built | the builder | one line in the brief's "The builder decides" |
| a gap the design should have decided | the session, in his place | the conservative option; `ruled: conductor`; listed for veto |

Then send the fixes, in one message (the planner's first; then the
writers', with what the planner moved), the files staged (`git add`)
first. Verify each fix by `git diff -- <file>` against the finding,
opening the file only when they disagree; run the checker with
`--briefs` once more, and record each verdict in `reviews.md`. There is no second round.

## P4 · Close

All three run at once:

1. **Coordination.** This front's line in `_coordination.md`: stage
   `execute`, branch `feat/<slug>`, this session's name, the shared
   files it will touch and what was agreed.
2. **The report**, by `docs/stage-report.md`, finished before
   the stage closes: the Video by `video-builder (Sonnet 5.5, high)`
   (the graph assembling: C, the entries in parallel, the critical
   path), the Deck by `slides-builder (Sonnet 5.5, medium)` (entries,
   edges and why, the agreements with other fronts, what was decided in
   his place, the pre-flight), the Explainer by template from
   `plan.graph.json` (the clickable graph). Published on the front's
   link.
3. **Cleanup.** The `_run/` copies and any scratch this stage made.

Then `.state.md` to `stage: execute`, the close commit of the
workstream folder, and the message:

| Part | Content |
|---|---|
| the link | the front's report |
| the graph | a flow in a code block, the critical path marked |
| decided in his place | one line each, the veto it allows |
| pre-flight | what he runs (item · blocks), or "nothing" |
| next | `/clear` then `/stage-execute <slug>` |

## Running alone

A pre-flight item never stops this stage: it waits for stage 4.

## Resuming

Everything is in files; the first missing output decides the step: no
`recon/` → P0; no green `plan.graph.json` → P1; a missing brief or a red
`--briefs` → P2; no `reviews/round-1.json` → P3; `reviews.md` without
"Applied and verified" → the end of P3; no report → P4.

## Boundaries

No code, no branches, no re-decision of the design: a node that cannot
be built as designed is a dated amendment request in `01-design/notes.md`
and the node marked blocked in `plan.md`. Frictions go to
`dreaming-notes.md` as they happen. Every agent named carries its model
and effort.
