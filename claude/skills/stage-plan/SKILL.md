---
name: stage-plan
description: Conducts stage 3 (Plan) autonomously, with no question to the user — takes the locked discovery and the sized design and draws the fastest build from what exists today to what the design says exists, cut for the widest parallel run. The conductor (Opus 5.5, high) dispatches plan-scout (Sonnet 5.5, low) per repo and area plus one over the other running fronts; lays a thin contract-first foundation F (migrations, the contract, the wiring, one seam per cross-slice interface with its fake and contract suite, the factories, one exemplar per new kind) with foundation lanes beside the slices; classifies every need so that data becomes a factory and an interface becomes a fake, keeps an edge only where a journey drives another slice's UI or a check reads its real side effect, moves the journeys that cross slices into one integration node, holds the depth after F to two, and gives every file one owner (shared files only to F); writes plan.graph.json and checks it with scripts/plan-graph.mjs (cycle, orphan AC, double owner, depth, width, critical path). plan-writer (Opus 5.5, medium) writes F's brief first, then every other brief in parallel (acceptance tied to AC ids, golden paths, uses from F, extends, owned files, size, gate). An automatic review (round 1 whole, round 2 delta: three plan-reviewer lenses and a referee, Sonnet 5.5, high; two plan-blind-reader per brief, Sonnet 5.5, low) is ruled entirely by the conductor. Closes with the pre-flight (what only the user can hand over, each item with a ready ! command) and the stage report (video of the lanes and the critical path, slides, blueprint). Use after a design is approved, or to resume a plan in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Skill, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git status *), Bash(git diff *), Bash(git add *), Bash(git commit *), Bash(node *), Bash(cp *), Bash(sha256sum *)
---

# Stage 3: Plan

The design comes in, sized and locked. A plan comes out: **from A to
B, as fast as possible, as wide as the work allows.** A is what exists
in the codebase today and what the other fronts are changing. B is
what the design says exists at the end. The plan re-decides nothing of
the design. It says what is laid down first, what is built at the same
time, what waits for what and why, who owns each file, and how each
piece is proved by a command.

> The user's direction for this stage: plan as intelligently as
> possible, because a plan that later needs back-and-forth and
> amendments is very costly; go from the starting point to the end
> point as fast as possible, as parallel as possible, so the most
> agents can run at once. The machine's limit is the only limit, and
> machine capacity is not the plan's concern: slicing is. No input
> from him: the stage receives the demand, reads the design, sends as
> many recon agents as it needs, looks at the current state and at the
> other running fronts, and draws a clear plan to the goal.

So this stage **asks nothing**. Every choice is the conductor's,
recorded where he will read it ("Decided in his place" in `plan.md`,
`ruled: conductor` in `rulings.md`), and shown to him at the end for a
veto. What only he can do in person (a key, an account, DNS, a quota)
is gathered into one pre-flight that stage 4 opens with.

The method is the pack **`pack-parallel-plan-local-ci`**; the conductor
loads it with the Skill tool at the open, together with
**`pack-right-sizing`** (a node is sized like a design part: does it
need to exist, and at what size). Its rules are not repeated here; this
file says when each one runs. Two names differ from the pack's, so that
stage 4's ids stay unambiguous: the pack's **F0** is the node `F`
here, and the pack's **X-int** is the node `E-int` (`X.<n>` is stage
4's fix entry). The graph is cut as wide as the needs allow, whatever
the machine.

## The words

| Word | What it is | At stage 4 |
|---|---|---|
| **F** — the foundation | the thin serial head: what two nodes would both write. Migrations (expansion only), the contract with its generated code (one file per path), the registry and wiring, config and the test env, **one seam per cross-slice interface** (the interface, an in-memory fake, a contract suite), the factories, one exemplar per new kind of code. At most one L of hand-written code; nothing behavioural. It owns every shared file | built alone, first; every other node starts the moment it merges |
| **F-x\<n\>** — a foundation lane | foundation work that no node waits for: the deploy skeleton, docs fragments, extra fake modes, harness extras | built beside the slices, in wave 1 |
| **E-\<nn\>** — a slice | one story (or two or three that only prove together), vertical: back, front, tests, by one builder in one context, within the size cap | the verifier writes its checks, one builder builds it, one merge |
| **E-int** — the integration node | the journeys that cross three or more slices, size S, merging last. At most one | starts when its edges are `ready` (stacked) |
| **edge** | node B waits for node A **only** when a journey of B drives A's UI (class `ui`) or a check of B reads A's real side effect (class `side-effect`). Data is a factory; an interface is a fake. Neither is an edge | B starts on A's branch the moment A is `ready` (stacked), never waiting for the merge. **B stacks on one parent only**: with two or more edges, B starts when all but one have merged, on the last one's branch |
| **wave** | the nodes at one depth after F. Wave 1 is everything with no edge. The target is **depth ≤ 2** | a reading aid: nodes start by their edges, critical path first |
| **owner** | every file has exactly one owner node; shared files belong only to F; other nodes add to files outside their own only by **Extends** (append-only). One Extends replaces instead: the node that **fills** a stub F left (a handler answering "not implemented", an empty slot component) extends that file, alone, and its brief says "fills" | the merge queue refuses a path outside Owns ∪ Extends |

After F merges, only the doctrine's shared files are frozen (the
migrations, the contract, the generated code, the registry). Every
other file F created is extended by addition, as a brief's "Extends"
declares. A change to a frozen file at stage 4 is a foundation
amendment; the plan exists to make that rare.

## What stage 4 does with the plan

The plan is cut for stage 4's rules, so they are here, read at the
open, not discovered at the close. The source is
`${CLAUDE_SKILL_DIR}/../stage-execute/SKILL.md` (§The ids, §Step 1,
§Step 2, the merge queue); P0's `execute` scout quotes it, and where
it and this table disagree, stage 4 wins: correct this run's plan to
it and note the drift in `dreaming-notes.md`.

| Stage 4 | What it means for the cut |
|---|---|
| F is built and merged alone; nothing else starts before it merges | F is the whole serial head: its weight is on every path |
| a node starts when every `after` node is merged or `ready`; with **one** unmerged parent `ready` it stacks on that branch; with **two or more** unmerged it waits until one is left | a node with k parents starts after k − 1 merges, not after k readies: an extra parent costs a merge on the path |
| `graph.json`'s `startOrder` first, up to the measured cap | the critical path starts first; the width is not throttled by the plan |
| the path guard: the diff against `owns` ∪ `extends`, literal paths and `dir/**` globs | `owns` lists every path the node writes, exactly |
| the verifier writes every acceptance check first, red on the node's base, read-only after | each line is red on that base for the right reason; a clause asserting the absence of an element another node builds passes vacuously there, so it moves to that node or is named as proved by the whole gate |
| the per-node gate is the plan's three gate commands; the whole gate (coverage floors included) runs once at the end | F's stubs are green at the node gate; a coverage floor is met by the filled stubs at the end, not by F |
| a change to a frozen file is a foundation amendment `F.<n>`, built alone in the queue | every name a node needs from a frozen file is in F before stage 4 |

## The pattern

```
P0 recon     plan-scout (Sonnet 5.5, low) × each repo and area, + 1 over the other fronts,
             + scout (Sonnet 5.5, low) over stage 4's contract, all at once
             → 02-plan/recon/<area>.md · recon/fronts.md · recon/execute.md
             (+ the machine scout in the background when stage 4 needs a measured cap)
P1 F         the thin foundation, contract-first: shared files, seams, factories, exemplars;
             what nobody waits for → F-x lanes
P2 graph     units → needs → classify → size → levels → widen → accept
             → 02-plan/plan.graph.json + plan.md; scripts/plan-graph.mjs green
             (no cycle · every AC carried once · one owner per file · depth ≤ 2 · critical path)
P3 briefs    3a plan-writer (Opus 5.5, medium) for F, names first → F.md "Provides", "Seams",
                "Exemplars", every name fixed; then F's writer finishes F.md while
             3b plan-writer × every other node, all at once, against F.md's names
             → the checker again with --briefs: the briefs equal the graph
P4 review    plan-review workflow: round 1 whole, round 2 delta, automatic;
             propagation by scripts (the checker's producers, propagation-check.mjs);
             three plan-reviewer lenses (Sonnet 5.5, high) + per brief two plan-blind-reader
             (Sonnet 5.5, low) and the referee plan-reviewer-ambiguity (Sonnet 5.5, high);
             the conductor rules every finding
P5 pre-flight 02-plan/preflight.md: what only he can hand over, each with a ready ! command
P6 report    blueprint JSON → build → video (the lanes, the critical path) → slides → blueprint;
             state → execute; /clear
```

He is not interrupted at any step. The report at P6 is where he reads
the plan; a veto he sends then is applied as an amendment (Step P6).

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor (the session) | Opus 5.5, high | the foundation, the graph, plan.graph.json and plan.md, the writers' answers, every ruling, the pre-flight, the close |
| `plan-scout` × each repo and area, + `fronts`, (+ `machine`) | Sonnet 5.5, low | facts with `path:line`: what exists, the commands, the gate rules that bite a plan, the seams, the golden paths, the hot files; the other fronts and their overlap; the measured stack capacity |
| `scout` × 1 (`execute`) | Sonnet 5.5, low | quotes stage 4's start rule, path guard and gates from `stage-execute/SKILL.md` |
| `plan-writer` × 1 for F, then × every other node | Opus 5.5, medium | one brief each and its blueprint JSON; asks, never decides |
| `plan-reviewer-order` | Sonnet 5.5, high | the graph as it will run: edges true, width maximal, F thin and sufficient, ownership, hot files |
| `plan-reviewer-coverage` | Sonnet 5.5, high | every AC and case carried exactly once; every design part in a node; nothing built that nothing forces |
| `plan-reviewer-verifiability` | Sonnet 5.5, high | every acceptance line becomes one check on the local stack; golden paths exist; sizes within the cap |
| `plan-blind-reader` × 2 per brief | Sonnet 5.5, low | builds and checks one brief alone, from that file only |
| `plan-reviewer-ambiguity` × 1 per brief | Sonnet 5.5, high | compares the two blind builds key by key |
| `video-scribe` · `slides-scribe` | Sonnet 5.5, high · Sonnet 5.5, high | the stage report |

## Preconditions

`.state.md` says `stage: plan`. `00-discovery/` has the locked mock,
`journeys/*.yaml` and `stories.md` with AC ids `<journey>.<step>.<n>`.
`01-design/` has `sizing.md` (the final design, the tier per part, the
evolution path) and the documents, with `acceptance.md` mapping every
journey step to a test case. `blueprint/design/` has the design JSON.
Missing any of these: halt, back to the stage that owns it.

```
<designs-root>/<workstream>/
├── .state.md                  # stage: plan
├── blueprint/plan/            # plan.json · plan-report.json · plan-review.json (you); briefs/<id>.json (writers)
├── rulings.md · taste-notes.md · dreaming-notes.md
├── 00-discovery/ · 01-design/ # read, never edited (a design defect is an amendment request in notes.md)
└── 02-plan/
    ├── recon/                 # <area>.md, fronts.md, machine.md — the scouts'
    ├── plan.graph.json        # the graph in machine form — yours; the checker's input
    ├── graph.json · graph.mmd # the checker's last output: waves, width, critical path; the drawing
    ├── plan.md                # the graph for reading — yours
    ├── briefs/<id>.md         # F.md, F-x<n>.md, E-<nn>.md, E-int.md — the writers'
    ├── preflight.md           # yours
    ├── reviews/round-N.json   # each round's return, as it came
    ├── reviews.md             # the round audit — yours
    └── telemetry.json         # the stage's measures, shared shape (claude/docs/telemetry.md) — yours
```

## Step 0 — open

If the session is not on **Opus 5.5 at high effort**, say so in one
line and continue only after the switch (`/model`); that is a setting,
not a question about the plan. Create `02-plan/telemetry.json` with
`openedAt` and the session's model, in the shape every stage shares
([claude/docs/telemetry.md](../../docs/telemetry.md)), and add a step
row as each of P0–P6 ends. Load `pack-parallel-plan-local-ci` and
`pack-right-sizing` with the Skill tool. Read `sizing.md` and the
areas `code.md` names, enough to name P0's scouts, and dispatch P0.
**While the scouts run**, read the rest: the design documents
(`architecture.md`, `contracts.md`, `data-model.md`, `ui.md`,
`acceptance.md` above all), `stories.md`, the journeys, and the
consuming project's `CLAUDE.md`. You will rule on all of it. Not the
codebase: the scouts read it.

**The host.** When `Workflow` refuses a `scriptPath` that resolves
outside the working directories (a symlinked `.claude/workflows/`),
copy `plan-review.js` into `<workstream>/_run/`, check that both
`sha256sum`s match, and run the copy. `_run/` is not committed.

## P0 — recon

One `Agent` dispatch of **`plan-scout`** per repo and per area the
design touches (`code.md` and `architecture.md` name them: each backend
module, each frontend app, each pipeline, the infra), **all in one
message**, each with the area's path, the codebase root, the design
folder, the template ([templates/recon.md](templates/recon.md)) and
the language, and the design's recon of the same area
(`01-design/recon/<area>.md`) when it exists, so the scout reads what
changed since. A scout whose area has a generator runs it once in a
scratch worktree at the base and lists every path it writes (F owns
them all, P1). More areas is cheaper than a scout that reads two. A
question of your own goes after the template's sections, never
instead of them. In the
same message, one `plan-scout` with the area **`fronts`**: the
designs root's `_coordination.md`, every running workstream's
`.state.md`, every branch not merged into the base (with or without a
workstream folder) and the shared files each changed (migration
numbers above all), and their overlap with this design. One `scout`
(Sonnet 5.5, low) with the question **`execute`**: quote, from
`${CLAUDE_SKILL_DIR}/../stage-execute/SKILL.md`, when a node starts
(one parent, several parents, stacking), the path guard, the per-node
and the whole gate, and what a foundation amendment is; save its
answer as `recon/execute.md` and compare it with "What stage 4 does
with the plan". When stage 4 runs on a machine whose
capacity it has not measured, one more with the area **`machine`**, in
the background; its number is stage 4's throttle and never shapes the
graph.

**The base** is the head of the codebase's base branch at P0, with its
sha in each recon file; a coordination file naming an older base is
quoted in `fronts.md`, not followed. When they return, read every
file. This is A. A recon file that does not follow the template goes
back to its scout once. Note in `dreaming-notes.md` any area a scout
could not read.

## P1 — the thin foundation, contract first

F holds only what two nodes would both write, in this order (the
pack's "F0, in order"):

1. **Migrations**, expansion only, with enums, indexes and grants: every
   new or changed table and column of `data-model.md`.
2. **The contract**: every route or operation of `contracts.md`, with
   every input and output field, one file per path, then the
   generator. Handlers answer "not implemented"; no test asserts it.
   **F owns every file the generators write**, not only their inputs:
   the recon's "What the generators write" lists them, from a run in
   a scratch worktree. A generated file outside F's Owns turns F's own
   proof ("the generator leaves no diff") into an amendment to F.
3. **Wiring**: the new modules registered, config loaded, every secret
   faked in the test env.
4. **Seams**: for each need that P2 classifies `interface`, the
   interface, an in-memory fake, and a contract suite that the fake
   passes in F and the real implementation must pass in its slice.
5. **Factories**: one per entity, fresh records with unique keys on
   every call; test actors per role (`actors.New(t, role)` or the
   doctrine's equivalent). Each test creates what it spends.
6. **Exemplars**: where the recon's golden paths say "none" for a kind
   the design adds, the first instance in the doctrine's full shape
   (layers, file split, wiring, test layout) with no behaviour.
7. **`uses-check`**: a generated file that imports every name every
   brief uses; it must compile on F's branch.
8. **Proof**: the generator leaves no diff, `uses-check` compiles, the
   contract suites pass on the fakes, migrations apply from empty, every
   query F writes into frozen generated code runs once against the
   migrated database (a defect there is a foundation amendment later),
   the gate is green on the empty implementation.

**F stays thin.** Its hand-written part is at most one L. What no node
needs on its first commit leaves F: the deploy skeleton, docs, extra
fake modes and harness extras go to a lane `F-x<n>`, or to the first
slice that needs them. A piece whose every reader already waits for
one node (a test harness only wave-2 nodes read, all behind one wave-1
node) goes to that node, not F. If the irreducible part (1–5) is still over L,
split it once, serially: `F` (migrations, contract, generated code,
wiring) and `F-b` (seams, factories, exemplars), both foundation, and
say why under "Decided in his place".

**The other fronts.** A shared file a running front is changing goes
into F, never into a slice, so the merge with that front happens once.
A behaviour this design needs from a front that has not merged is
classified like any need (P2): behind an interface with a fake, never
an edge on another workstream.

## P2 — the graph

The pack's core recipe "From a design to a graph of maximal width",
run whole, in order. Write as you go into
`02-plan/plan.graph.json` ([template](templates/plan.graph.json)).

1. **Units.** One slice per story. Group two or three only when they
   share a screen or a flow and none can prove alone. A slice is
   vertical: never "the backend of X", "the types", "the adapters".
   One exception: when the journeys reach data only through the API
   (no database access in the e2e world), the routes that seed it are
   a hub every journey needs; they may be one server slice in wave 1,
   proved by the routes' own contract cases, said under "Decided in
   his place".
2. **Needs.** Per unit: what it needs from outside itself (a name, a
   record, a behaviour) and what it provides. Then one pass over every
   AC: what it drives **and every element it asserts on** (a count, a
   badge, a line in the shell, a row another screen shows), against
   the element's builder in `ui.md` and `architecture.md`. An assertion
   on another unit's element is a need like a drive. A hub found here
   costs a line; found by a writer at P3, an apply round.
3. **Classify every need**, and resolve it:

   | The need | Class | Resolved by | Edge? |
   |---|---|---|---|
   | a file two units would write (migration, contract, registry, config) | `shared` | F | no |
   | a record (a customer, an order) | `data` | a factory in F | no |
   | a behaviour behind an interface (an adapter, a domain service, another slice's store) | `interface` | the interface + fake + contract suite in F | no |
   | another unit's UI that a journey drives or asserts on (a button, a badge it builds) | `ui` | an edge, **stacked**; or the AC moves to the unit that builds it, or to the one that merges last | only if the AC stays |
   | another unit's real side effect a check reads | `side-effect` | an edge, stacked; or the check moves to E-int | only if the check stays |
   | a walk across three or more units | `e2e` | E-int, size S, after them | E-int's own |

   Record each in the node's `needs`. An edge that is not `ui` or
   `side-effect` does not exist.
4. **Size** each node S · M · L against the cap (L = one screen with
   its states and one server flow, about 2,500 changed lines with
   tests). The pack's 8 ACs assume one AC per journey step; the checker
   scales that guide by the discovery's grain (ACs per journey step or
   frame state) and warns above it: a warned node is sized by its
   screens, flows and lines, and split only when those say over L.
   Split any L on the critical path into thinner vertical slices; a
   part they share goes to F. A node's `name` is at most 8 words, the
   same in the graph, `plan.md`, its brief and the blueprint.
5. **Ownership.** For every node, `owns`: every path it creates or
   edits, literal paths or `dir/**`. No two nodes overlap. Shared files
   only in F. An addition to a file another node created, or to an
   existing append-safe file, is `extends`. A file two nodes would both
   edit is made cold: one file per thing plus a generated aggregate
   (the contract per path, the feature map per node, migrations each
   with its own timestamp when the doctrine allows), or the piece moves
   into F. The recon's hot files are the list to check. A file
   several nodes extend on lines that never meet (one row per node in
   a feature map, one slot per stub) goes under the graph's
   `appendSafe`, with why; the checker stops warning on it.
6. **Levels and the critical path.** Run the checker:

   ```
   node "${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs" 02-plan/plan.graph.json \
        --json 02-plan/graph.json --mermaid 02-plan/graph.mmd
   ```

   It prints the waves, the width, the depth, the critical path with
   its weight, the parallelism (total weight ÷ critical) and the start
   order, and fails on a cycle, an orphan or doubled AC, a file with two
   owners, a shared file outside F, a use with no producer, an edge
   that is not real behaviour, a depth over 2, a size over the cap, a
   name over 8 words, an HTML comment in a plan file.
7. **Widen.** For each edge on the critical path: can a fake or a
   factory stand in (step 3 again)? Can the journey move to the node
   that merges last? Can the edge be stacked? For each L on the
   critical path: can it split so one half needs only F (its server
   half behind the generated contract, its screen behind intercepted
   responses)? Count a node's parents too: with k of them it starts
   after k − 1 merges. Recompute. Stop when the
   depth is ≤ 2, the checker is green, and no edge on the critical
   path survives the question. The critical path is at most F + 2 × L.
8. **Write `plan.md`** from [templates/plan.md](templates/plan.md),
   whole, in one pass, from the same decisions: the drawing, the waves,
   the node table, how each need was resolved, the ownership map, the
   other fronts, the gate commands (from the recon, in the project
   contract's roles), and every choice under "Decided in his place".

Rules that hold inside the graph, because each one closed a class of
the amendments that cost earlier runs hours:

- **Names before writers.** F's writer goes first and lists every name;
  everyone else copies. (About a third of past foundation amendments
  were a name missing from a frozen file.)
- **Freeze only the shared files.** Everything else is extended by
  addition. (Half were additions to non-frozen files.)
- **A test creates the data it spends.** No journey mutates a
  pre-seeded record.
- **No test pins a stub.** Nothing asserts "not implemented" on an
  operation a slice builds.
- **Every use has one producer**, F or an ancestor.
- **Each route's deadlines sum below the write timeout**, with a margin;
  F carries the table.
- **The ruler is closed before stage 4.** Every open rule the nodes
  lean on and the doctrine leaves open (themes and widths the screen
  proofs run at, a test convention, a pattern the design assumes) is
  decided here, by you: the doctrine's default where it has one,
  otherwise the simplest that the design's acceptance already implies.
  Each goes under "Decided in his place". A rule changed mid-execution
  is re-work on every node in flight.

## P3 — briefs

**3a — F's names first.** One `Agent` dispatch of **`plan-writer`**
for `F`, write mode, **part `names`**, with: the workstream path,
`plan.md`, `plan.graph.json`, the recon, the design folder, the
discovery folder, the brief template
([templates/brief.md](templates/brief.md)), the blueprint schema
(`${CLAUDE_SKILL_DIR}/../../blueprint/schema/plan.md`), the project's
`CLAUDE.md` and the language. It writes the header, "Provides",
"Seams" and "Exemplars" of `briefs/F.md` and returns its questions.
Answer them; wait until those sections have no open mark. If F
splits, F-b's names run right after F's, the same way.

**3b — everything else, at once, while F finishes.** In one message:
F's writer resumed (`SendMessage`) with **part `rest`** (the other
sections of F.md, "The F proof" among them, and `F.json`), and one
`Agent` dispatch of **`plan-writer`** per lane, slice and E-int, with
the same inputs plus `F.md`. A name F's rest adds or changes is an
`F gap` like any other (below). Each writes its brief and its JSON:
the acceptance lines, one per AC id it carries and per contract case
of `acceptance.md` it owns; the golden paths; "Uses from the
foundation" copied verbatim from F.md; Owns and Extends exactly as the
graph has them; the size; the Gate (the plan's commands verbatim, then
its focused commands).

**Answering.** A writer decides nothing; its questions come back in
one batch. Answer each from the design, the recon and the graph: the
simplest option that keeps the graph as it is. A **`F gap`** (a name a
node needs that F.md lacks) is added to F by F's writer in one apply
batch, to `plan.graph.json` (`provides` and the user's `uses`) by you,
and recorded `ruled: conductor`. An answer that changes a node or an
edge is a graph change: make it in `plan.graph.json` and `plan.md`
first, run the checker, then send the writers what moved. Send each
writer its answers in one message, with final values only: a message
that corrects itself mid-sentence is rewritten before it leaves (the
writers are literal). Every answer goes to `rulings.md`.

**Gate to P4.** Run the checker with the briefs:

```
node "${CLAUDE_SKILL_DIR}/scripts/plan-graph.mjs" 02-plan/plan.graph.json \
     --briefs 02-plan/briefs --json 02-plan/graph.json --mermaid 02-plan/graph.mmd
```

Every brief's Owns, Extends, Uses, Provides and Acceptance must equal
its node in the graph, every Producer in its Uses must be the graph's
producer, and no plan file carries an HTML comment. A mismatch goes
back to its writer (or is a graph fix of yours) before the review
starts. Then check each brief by
its sections: "Questions" empty, every acceptance line with its
observation and its read-back, every kind with a golden path.

## P4 — review

Run the `plan-review` workflow by `scriptPath` (never by name):
`${CLAUDE_SKILL_DIR}/../../workflows/plan-review.js` (or its copy in
`_run/`, see the host), with `planDir`,
`designDir`, `discoveryDir`, `reconDir`, `root` (the codebase path),
`graphPath` (`02-plan/plan.graph.json`), `graphReport`
(`02-plan/graph.json`), `round: 1`, `language`, and `briefs`: one
`{id, path}` per brief file. While the v9 agents are not installed in
the running Claude Code, pass `inlineAgents: true` and `agentsDir` and
`skillsDir` (`${CLAUDE_SKILL_DIR}/..`): each agent then reads its
definition and its packs from disk.

| Lens | Question |
|---|---|
| `plan-reviewer-order` (Sonnet 5.5, high) | the graph as it will run: every edge's class is true (no fake or factory could stand in); every real need has its edge; F is thin (each item serves two nodes or is shared) and sufficient (each node's Uses against F.md's Provides, by the walk (a)–(e)); ownership matches what each node's acceptance makes it write; hot files are cold; no F test pins a stub; the other fronts' overlaps are handled |
| `plan-reviewer-coverage` (Sonnet 5.5, high) | every AC id and every acceptance case carried by exactly one acceptance line; every design part, resource and alarm in a node; every new kind with an exemplar; nothing built that nothing forces |
| `plan-reviewer-verifiability` (Sonnet 5.5, high) | every acceptance line becomes one check on the local stack (actor, action, observation and frame, side effect read back, bad paths); seeds from factories; golden paths exist; each node within the cap; the gate commands exist |
| 2 × `plan-blind-reader` (Sonnet 5.5, low) → `plan-reviewer-ambiguity` (Sonnet 5.5, high), per brief | would two builders build the same node from this brief alone, and would two verifiers check the same thing? |

Save the return as it came in `02-plan/reviews/round-N.json` and write
`reviews.md` ([template](templates/reviews.md)) from it in one `Write`.
A round with `valid: false` is not a round: fix the cause, run again.

**Rule** every finding by [references/judging.md](references/judging.md):
merge by fix, then sustained / deferred / dismissed, and the owner of
each sustained one: `writer`, `conductor` (a graph change: made by
you in `plan.graph.json` and `plan.md`, the checker green after it,
dated under "Amendments", listed for veto) or `builder`. Write the
rulings to `reviews.md` before anything moves.

**Propagation, before the batch leaves.** Run
`node ${CLAUDE_SKILL_DIR}/../stage-design/scripts/propagation-check.mjs <workstream> --stage plan <term> …`
with every **old** name, path, value or key a fix changes (F's above
all) and every name, path, AC id or case name a ruling **moved to
another node**: a moved thing is referred to by its old owner in
lines no fix touches, and that residue was most of a past round 2.
Every hit the fix makes wrong goes to its writer in the same batch,
with the line to change. **Producers first:** when a fix changes what
a node provides (F's names, a moved helper's shape), that writer's
apply goes alone; the consumers' batch leaves when it returns, with
the producer's final lines pasted, so nobody copies a shape that is
about to change. Otherwise one apply batch per writer, in one
message; a fix without pasted final lines is not done. When the batch
returns: the propagation check again with the same terms (a hit stays
only as a negation or where it names the new owner) and the checker
with `--briefs`, which also holds every Uses row's Producer to the
graph.

**Round 2** runs at once, over the delta: `round: 2`, `changed`
(`briefs`: every brief whose text changed, for the lenses; `reread`:
only those whose Builds or Acceptance a fix changed, and any new
brief, for the blind readers: a change in Uses, Owns or a pointer is
the checker's and the lenses'), `fixes` (what was applied), `lenses`
(only those with a finding sustained in round 1). Rule and apply the same
way. **Then the review stops.** What is still sustained is applied by
the writers with proof by line, verified on disk by you, and written
as residue in `reviews.md`; it is not chased into a third round.

## P5 — the pre-flight

Write `02-plan/preflight.md` from
[templates/preflight.md](templates/preflight.md): everything a node
needs that only he can provide in person — a key or secret only he can
mint, an account, DNS, a quota or billing limit, a third-party
approval, a text only he can write. Each item: why (the node it
unblocks), **a ready `!` command** he pastes in the Claude Code prompt
(values he types are read with `read -s`, never written in the file),
or the exact console path when no command exists; a `!` check that
proves it without printing the secret; and the nodes it blocks. Then
one line that runs every check. What only the release needs is the
release's pre-flight, not this one. Decisions are never pre-flight
items: they were taken at P2 and sit under "Decided in his place".

Every brief's "Pre-flight" names its items; a node with a missing item
is marked in `plan.md`, so stage 4 parks it and builds everything else.
Then the checker with `--briefs` once more: the plan files are final.

## P6 — the report and the close

1. **Blueprint JSON** under `blueprint/plan/`, by the schema
   (`${CLAUDE_SKILL_DIR}/../../blueprint/schema/plan.md`):
   - `plan.json` from `plan.md` and `graph.json`: F is `foundation`;
     every other node is an entry with its graph `name`, `kind`, `wave`, `critical`
     and `owns`; `after` = the graph's edge objects (`{id, class,
     stacked}`); `stories` = the stories it carries (`[]` for a lane);
     `proof` from its acceptance, one `{run, expect}` or `{see, where}`
     per line; `width`, `depth` and `criticalPath` (F and F-b included)
     as the checker printed them, and `concurrency` = `width`;
     `decisions` = "Decided in his place" (`when: "plan"`);
     `preflight` = `preflight.md`'s items.
   - `plan-review.json` from `reviews.md` and `rulings.md`: every
     `conductor` ruling under `conductorRulings`.
   - `plan-report.json`: the plain layer. `graphPlain` says the width,
     the depth and the critical path in one breath; `needsYourEye`
     carries the decisions taken in his place that change what gets
     built, and the pre-flight count.
2. **Build**: `node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs"
   <workstream>`. It refuses with the field named; fix and rebuild.
3. **The stage report**: follow `claude/docs/stage-report.md` (video,
   slides, blueprint). The focus paragraph you pass to both scribes:

   > *Plan — the lanes and the critical path.* From A to B in one
   > picture. F first, and why it is thin. Then the build as parallel
   > lanes: one `flow` scene with F, wave 1 (its nodes, or "wave 1 ·
   > n slices" when more than four), wave 2 and E-int, the critical
   > path's nodes and edges in tone `hot` and every other edge
   > labelled with the behaviour it consumes. The numbers: nodes,
   > width, depth, critical-path weight against the total, the
   > parallelism. How each kind of node proves itself. What the
   > pre-flight needs from him, by count. The decisions taken in his
   > place, stamped. Source: `02-plan/plan.md`, `02-plan/graph.json`.

4. **The message**: the three links, as the stage report prescribes,
   then the graph as a flow in a code block with the critical path
   marked, the wave table, the decisions taken in his place (one line
   each), the residue, the pre-flight (item · blocks · `!` command),
   and the stage's telemetry in one line, from `02-plan/telemetry.json`
   (wall-clock, agents, rounds, findings by class, tokens, cost).
5. **Close**: `telemetry.json` closed (`closedAt`, the totals);
   `.state.md` to `stage: execute`; the close commit of the
   workstream folder (push only on his explicit word); suggest `/clear`
   before stage 4.

**A veto after the report.** If he answers with a change, apply it as
an amendment: `plan.graph.json` and `plan.md` first, the checker
green, the writers' apply batches, propagation, the checker with
`--briefs`, rebuild and republish; the video and slides only when the
change alters what they show. His words go to `rulings.md`. A pattern
in what he vetoes goes to `taste-notes.md`.

## How to write, in every file

Say what you mean: literal sentences, concrete values, one idea per
sentence. A template's `<!-- -->` blocks are instructions to its
author; none reaches an output file (the checker refuses one). An
edge names the behaviour it consumes and its class. An
acceptance line names what is observed and the side effect read back.
In the terminal: a table for parallel things, a flow in a code block
for a sequence, short topics for lists. While agents run, every reply
carries a status table (agent · task · state), read from the harness.
Never end a turn on a plan or a promise: do the work.

## Files

- **Permanent:** everything in `02-plan/`, `blueprint/plan/`,
  `blueprint.html`, `report/plan/`, `rulings.md`, `taste-notes.md`,
  `.state.md`.
- **Nothing is deleted at the close.** `recon/` is the A the retro
  compares against what stage 4 found.

## During execution

Stage 4 reads `plan.md`, `plan.graph.json` (the start order, the
owners), the briefs and `preflight.md`. When a node changes while being
built, stage 4 edits `plan.graph.json`, `plan.md` and the brief in
place, runs the checker, and writes the amendment, dated, under
"Amendments". A change to a frozen file is a foundation amendment; an
addition to any other file is the node's own work. Nothing comes back
to this stage.

## Resuming

Everything is in files. Read `.state.md`, then the first missing output
decides the step: no `recon/` → P0; no `plan.graph.json` or a red
checker → P2; no "Provides" in `briefs/F.md` → 3a (the other writers
wait for it); F.md without "The F proof", briefs missing or a red
`--briefs` check → 3b; no `reviews/round-1.json`
→ P4; no `preflight.md` → P5; no `blueprint/plan/plan-report.json` →
P6. A writer that died is redispatched with the list of what is on
disk; it never rewrites a finished file. Never from memory of a
previous session.

## Boundaries

No code, no tests, no branches, no deploy (stage 4). No re-decision of
the design: a node that cannot be built as designed is a dated
amendment request in `notes.md`, the node marked blocked in `plan.md`,
and a line in `dreaming-notes.md`; never a workaround in a brief. The
discovery's lock does not reopen: every AC lands in exactly one node.
Frictions go to `dreaming-notes.md` on the spot; judging them is the
close's job.
