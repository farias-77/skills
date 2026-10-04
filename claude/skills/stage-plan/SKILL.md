---
name: stage-plan
description: Conducts stage 3 (Plan) with no user in the loop — takes the locked discovery and the design (solution.md, data-and-contracts.md with a Contract per feature, tests.md, operations.md) and cuts the most parallel build graph that infinite compute allows, from what exists today to what the design says exists. The conductor (Opus 5.5, high) sends scout (Sonnet 5.5, low) × N in parallel over the current system (what exists, the generators and what they write, the hot files) and the other running fronts (their branches, the files they touch, what they will merge); planner (Opus 5.5, high) cuts the graph (plan.graph.json and plan.md: a thin foundation, every entry one whole behaviour in parallel, an edge only where nothing can be faked, front and back in parallel on the design's Contract, hot files made cold, one integration entry at the end, merge points with the other fronts); the checker plan-graph.mjs holds it; plan-writer (Sonnet 5.5, high) writes one brief per entry, all at once; one round of review — plan-reviewer (Opus 5.5, medium) and one plan-blind-reader (Sonnet 5.5, low) per brief, filtered — ruled by the conductor alone, who applies the fixes and verifies them by reading. Closes with the prerequisites only he can hand over, a short video of the graph and the start order, slides and the blueprint; stage 4 waits for his play. Use after a design is closed, or to resume a plan in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Skill, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git status *), Bash(git diff *), Bash(git add *), Bash(git commit *), Bash(git hash-object *), Bash(node *), Bash(cp *), Bash(sha256sum *)
---

# Stage 3: Plan

The design comes in, closed. A plan comes out: **from A to B, as
parallel as the work allows.** A is what exists today and what the
other fronts are changing. B is what the design says exists at the end.
The plan re-decides nothing of the design. It says what the foundation
lays down, which entries are built at once, the few that wait and why,
who owns each file, and how each entry is proved done.

**Compute is infinite.** Machine capacity never shapes the graph: stage
4 throttles to its machine. The only limit on width is what truly
cannot be faked.

**No user in the loop.** The conductor rules everything alone and
records each choice ("Decided in his place" in `plan.md`, `ruled:
conductor` in `rulings.md`). What only he can do in person (a key, an
account, an access) is gathered into one prerequisites list. Stage 4
waits for his play.

The method is the pack **`pack-parallel-plan-local-ci`**; load it with
the Skill tool at the open.

## What stage 4 reads

The plan feeds this, and nothing more:

| Stage 4 reads | From |
|---|---|
| the start order, the edges, the owners | `plan.graph.json` and the checker's `graph.json` |
| one brief per node: its ACs by id, Owns and Extends, what the foundation provides, how done is proved | `briefs/<id>.md` |
| two builders, back and front in parallel, when the brief has a **Contract** (route, request, response, errors) | the brief's Contract, copied from `data-and-contracts.md` |
| the gate commands | `plan.md` |
| what only he can hand over | `preflight.md` |

## The cut

- **An entry is one whole behaviour**: a group of ACs a person or a
  caller sees work, data to screen. Never a layer.
- **An edge only where nothing can be faked.** Data is a factory; an
  interface is a fake with its contract suite. An edge stays only when
  a journey drives another entry's screen, or a check reads its real
  side effect, and the AC cannot move to the integration entry.
- **Front ∥ back inside an entry** when the design gives its Contract.
- **A thin foundation `F`**: only what two or more entries need, plus
  every file the generators write.
- **Hot files made cold**: one file per route; registries as fragments.
- **One integration entry `E-int` at the end**, only for the journeys
  that cross entries.
- **The other fronts**: a file a running front changes goes into F,
  with the merge point and order named.

The typical shape:

```
F ──► E-01 ∥ E-02 ∥ E-03 ∥ … ∥ E-nn ──► E-int
```

## The pattern

```
P0 recon     scout (Sonnet 5.5, low) × N, all at once → 02-plan/recon/<topic>.md
P1 cut       planner (Opus 5.5, high) → plan.graph.json + plan.md; plan-graph.mjs green
P2 briefs    plan-writer (Sonnet 5.5, high) × every node, all at once → briefs/<id>.md + JSON
             ∥ you write preflight.md; then plan-graph.mjs --briefs green
P3 review    plan-review, one round: plan-reviewer (Opus 5.5, medium)
             ∥ plan-blind-reader (Sonnet 5.5, low) × each brief, filtered
             → you rule, the owners apply, you verify by reading
P4 close     blueprint JSON → build → video (the graph, the start order) → slides
             → the checker pinned → stage: execute → /clear
```

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor (this session) | Opus 5.5, high | dispatches, rules every finding and every question, writes `preflight.md`, the review audit and the blueprint JSON, closes |
| `scout` × N | Sonnet 5.5, low | one question each about the current system or the other fronts; quotes with `path:line` |
| `planner` | Opus 5.5, high | cuts the graph: `plan.graph.json` and `plan.md`, the checker green; applies the cut's fixes |
| `plan-graph.mjs` | a script | every AC owned once, no file owned by two entries, acyclic, depth and width reported, a Contract on every brief with two sides |
| `plan-writer` × each node | Sonnet 5.5, high | one brief and its blueprint JSON; asks, never decides; applies its brief's fixes |
| `plan-reviewer` | Opus 5.5, medium | each entry buildable without asking, every edge real, the foundation thin, the fronts coordinated |
| `plan-blind-reader` × each brief | Sonnet 5.5, low | reads one brief alone; reports a key only `undecidable` or `contradicts`, with a quote |
| `video-scribe` · `slides-scribe` | Sonnet 5.5, high | the stage report |

## Preconditions

`.state.md` says `stage: plan`. `00-discovery/` has `stories.md` with
its AC ids and `journeys/`. `01-design/` has `solution.md`,
`data-and-contracts.md`, `tests.md`, `operations.md` and `notes.md`.
Missing any: halt, back to the stage that owns it.

```
<designs-root>/<workstream>/
├── .state.md                  # stage: plan
├── blueprint/plan/            # plan.json · plan-report.json · plan-review.json (yours); briefs/<id>.json (the writers')
├── rulings.md · dreaming-notes.md
├── 00-discovery/ · 01-design/ # read, never edited (a design defect is an amendment request in notes.md)
└── 02-plan/
    ├── recon/<topic>.md       # the scouts' answers, saved by you
    ├── plan.graph.json        # the planner's; the checker's input
    ├── graph.json · graph.mmd # the checker's output: waves, width, depth, critical path, start order; the drawing
    ├── plan.md                # the planner's
    ├── briefs/<id>.md         # the writers'
    ├── preflight.md           # yours
    ├── reviews/round-1.json   # the review's return, as it came
    ├── reviews.md             # yours
    └── telemetry.json         # yours (claude/docs/telemetry.md)
```

## Step 0 — open

If the session is not on **Opus 5.5 at high effort**, ask for the
switch (`/model`); a non-interactive run continues on its model and
writes one line in `dreaming-notes.md`. Create `02-plan/telemetry.json`
with `openedAt` and the session's model
([claude/docs/telemetry.md](../../docs/telemetry.md)) and add a step
row as each of P0–P4 ends. Load `pack-parallel-plan-local-ci`. Read
`solution.md` enough to name the areas the design touches, and
dispatch P0. You read the codebase never: the scouts do.

**The host.** When `Workflow` refuses a `scriptPath` outside the
working directories, copy `plan-review.js` into `<workstream>/_run/`,
check both `sha256sum`s match, and run the copy (not committed).

## P0 — recon

One **`scout (Sonnet 5.5, low)`** per question, **all in one message**.
Each answer opens with `<repo>@<branch> <sha>` (the base's head) and
quotes with `path:line`. Save each answer as it came to
`02-plan/recon/<topic>.md`.

- **Per area the design touches** (each backend module, each frontend
  app, the infra): what exists today of what the design names (routes,
  tables, screens, factories, seams with their fakes); the gate
  commands and the gate rules that bite a foundation (a linter that
  rejects unused code, a coverage floor); the golden path for each kind
  of code the design adds; the hot files (the files `git log
  --since=60.days --name-only --format= -- <area>` lists most often).
- **The generators**: every generator command, and every path each one
  writes (its configured output paths, and the files carrying a
  generated-code header). F owns them all.
- **The other fronts**: every running workstream's `.state.md` and the
  designs root's `_coordination.md`; every branch not merged into the
  base (`git branch -a --no-merged <base>`), the files each changed
  (`git diff --stat <base>...<branch>`), the shared ones first (the
  next migration number above all), and when each says it will merge.

A scout whose answer misses its question goes back once. An area no
scout could read is one line in `dreaming-notes.md`.

## P1 — the cut

One **`planner (Opus 5.5, high)`** with the workstream path, the
design folder, `stories.md` and `journeys/`, `recon/`, the templates
([plan.graph.json](templates/plan.graph.json),
[plan.md](templates/plan.md)), the checker's path
(`${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs`), the project's
`CLAUDE.md` and the language. It writes both files and runs the
checker until green:

```
node "${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs" 02-plan/plan.graph.json \
     --json 02-plan/graph.json --mermaid 02-plan/graph.mmd
```

When it returns, read `plan.md` and `graph.json` and rule on the cut by
the pack and "The cut" above: a false edge, a fat foundation, a layer
posing as an entry, a front's file outside F goes back to the planner
(`SendMessage`, apply mode) until it holds. Each ruling goes to
`rulings.md`.

## P2 — the briefs and the prerequisites

In one message, one **`plan-writer (Sonnet 5.5, high)`** per node of
the graph, write mode, with the workstream path, its node id,
`plan.graph.json`, `plan.md`, the design folder, `stories.md`, the
brief template ([templates/brief.md](templates/brief.md)), the
blueprint schema (`${CLAUDE_SKILL_DIR}/../../blueprint/schema/plan.md`)
and the language. F's brief names the self-test that keeps its
not-yet-called helpers in use, and the entry that removes it.

**While they write**, write `02-plan/preflight.md` from
[templates/preflight.md](templates/preflight.md): only what needs him
in person (a key or secret only he can mint, an account, an access, a
quota), from `operations.md` and the recon; each item with why, a ready
`!` command (values read with `read -s`, never written), a `!` check,
and the nodes it blocks. "Nothing" is a complete pre-flight.

**Answering.** The writers' questions come back in one batch. Answer
each from the design and the graph, the simplest option that keeps the
graph as it is; a question that changes the cut goes to the planner
first. Send each writer its answers in one message, final values only.
Every answer goes to `rulings.md`.

Then the checker with the briefs, until green:

```
node "${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs" 02-plan/plan.graph.json \
     --briefs 02-plan/briefs --json 02-plan/graph.json --mermaid 02-plan/graph.mmd
```

## P3 — review, one round

Run the `plan-review` workflow by `scriptPath`:
`${CLAUDE_SKILL_DIR}/../../workflows/plan-review.js` (or its copy in
`_run/`), with `planDir`, `designDir`, `discoveryDir`, `root` (the
codebase), `language`, and `briefs` = `graph.json`'s `reviewBriefs`
(each brief's path and the keys its blind reader judges). While the
agents are not installed in the running Claude Code, pass
`inlineAgents: true`, `agentsDir` and `skillsDir`.

Save the `.result` as `02-plan/reviews/round-1.json`. A result with
`valid: false` is not a round: fix the cause, run it again.

**Rule** every finding by [references/judging.md](references/judging.md)
and write `reviews.md` ([template](templates/reviews.md)) before any fix
leaves. Then send the fixes, in one message: the cut's to the planner
(`SendMessage`, apply mode; the checker green after), then the briefs'
to their writers (with what the planner moved). **Verify by reading**:
open each changed line the owners pasted, run the checker with
`--briefs` once more, and write what you read in `reviews.md`. There is
no second round.

## P4 — the close

1. **Blueprint JSON** under `blueprint/plan/`, by the schema
   (`${CLAUDE_SKILL_DIR}/../../blueprint/schema/plan.md`): `plan.json`
   from `plan.md` and `graph.json` (F is `foundation`; every other node
   an entry with its `after`, `wave`, `critical`, `owns` and `proof`;
   `width`, `depth`, `criticalPath`; `concurrency` = `width`;
   `decisions` = "Decided in his place"; `preflight`);
   `plan-review.json` from `reviews.md`; `plan-report.json`, the plain
   layer: `graphPlain` says the width, the depth and the start order in
   one breath; `needsYourEye` carries the decisions that change what
   gets built and the prerequisites count.
2. **Build**: `node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs"
   <workstream>`. It refuses with the field named; fix and rebuild.
3. **The stage report**, by `claude/docs/stage-report.md`: video
   (60–90 s), slides, blueprint. The focus paragraph for both scribes:

   > *Plan — the graph and the start order.* From A to B in one
   > picture: the graph as a `flow` scene (F, the entries side by side,
   > E-int), the critical path in tone `hot`, each edge labelled with
   > the behaviour it consumes. Why the foundation is thin. The start
   > order, critical path first. The numbers: entries, width, depth,
   > critical-path weight against the total. The entries with two
   > builders. The prerequisites he hands over, by count. The decisions
   > taken in his place. Source: `02-plan/plan.md`, `02-plan/graph.json`.

4. **Close.** Pin the checker whose green closed the plan:
   `git hash-object "${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs"` into
   `plan.graph.json`'s `checker` (`{ "path":
   "claude/skills/stage-plan/scripts/plan-graph.mjs", "blob": "<sha>"
   }`), so stage 4 never re-judges the plan with a newer one.
   `telemetry.json` closed (`closedAt`, the totals). `.state.md` to
   `stage: execute`. The close commit of the workstream folder (push
   only on his word).
5. **The message**: the three links; the graph as a flow in a code
   block with the critical path marked; the start order; the decisions
   taken in his place, one line each; the prerequisites (item · blocks
   · `!` command); the telemetry in one line. Then: stage 4 starts on
   his play, after `/clear`.

A change he asks for after the report is an amendment: the planner
changes the graph, the checker green and pinned again, the writers
apply, rebuild and republish. His words go to `rulings.md`.

## How to write

Literal sentences, concrete values, one idea per sentence. A template's
`<!-- -->` comments never reach an output (the checker refuses one). In
the terminal: a table for parallel things, a flow in a code block for a
sequence, short topics for lists. While agents run, every reply
carries a status table (agent · task · state). Never end a turn on a
plan or a promise: do the work.

## Resuming

Everything is in files. Read `.state.md`; the first missing output
decides the step: no `recon/` → P0; no `plan.graph.json` or a red
checker → P1; a brief missing or a red `--briefs` check → P2 (an
existing brief is never rewritten); no `reviews/round-1.json` → P3;
`reviews.md` without "Applied and verified" → the end of P3; no
`blueprint/plan/plan-report.json` or no `checker` blob → P4. Never from
memory of a previous session.

## Boundaries

No code, no tests, no branches (stage 4). No re-decision of the design:
a node that cannot be built as designed is a dated amendment request in
`01-design/notes.md`, the node marked blocked in `plan.md`, and a line
in `dreaming-notes.md`. Every AC lands in exactly one node. Frictions
go to `dreaming-notes.md` on the spot.
