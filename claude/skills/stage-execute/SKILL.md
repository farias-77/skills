---
name: stage-execute
description: Conducts stage 4 (Execute) — turns an approved plan into merged code on the feature branch, from one "play" to one call. Step 0 shows the plan's pre-flight once, waits until every item is handed over, and gives the user the /goal text to paste; from then on nobody asks him anything. One session (Opus 5.5, high) orchestrates without writing code: the foundation first, then every node of plan.graph.json whose edges are merged or ready, in the graph's start order, in parallel up to the cap, each through the exec-entry workflow — builder (Opus 5.5, medium) writes the code and the tests for the entry's ACs, running only the fast checks (two builders, back and front in parallel, when the brief carries a Contract); exec-gate (Sonnet 5.5, low) runs the gate once, the only place the suites run; then, in parallel, reviewer (Opus 5.5, high) with a closed scope, qa-frontend (Opus 5.5, medium) on screens and qa-backend (Opus 5.5, medium) on the API and data; a mechanical triage (blocking only on an AC not met, a reproduced bug, a security hole or a written rule broken; the rest are notes on the PR); at most one fix pass and a delta by the agents that blocked, then ready or parked. Done = the plan's ACs met and the gate green. The session is the local CI: its serial queue merges the base into each ready entry, tests the merged tree, merges, and signs off; the whole gate runs once at the end. It closes with the stage report, where the user checks the screens against the locked mock once, and calls him once, when everything is merged, green and reported. Use when a workstream's .state.md says stage execute, or to resume an execution in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, PushNotification, Bash
---

# Stage 4: Execute

An approved plan comes in: the build graph (`plan.graph.json`: the
foundation, the lanes, the slices, the integration node, their edges
and the files each owns) and a brief per node. Merged code comes out
on `feat/<workstream>`.

**Done means the plan's ACs are met and the gate is green. Nothing
else blocks.** Each entry gets two builder passes at most (the build
and one fix) and a target of 30 to 60 minutes. It never loops: past
its budget it parks and the session reports it.

**No code enters without review.** Every commit that reaches an entry
branch passes the gate and agents that never wrote it. The session
never merges anything that did not come back `ready` from the
exec-entry workflow.

**The queue is the CI.** Nothing reaches `feat/<workstream>` that was
not tested, on this machine, as the tree it becomes; the session signs
each merged head off and the whole gate signs off the top once.

The session is the orchestrator, **Opus 5.5 at high effort**. It does
not write product code and does not review it. The user hands over the
pre-flight, pastes one goal and leaves; the session calls him once, at
the end.

## The pipeline of one entry

```
            ┌─ builder (back) ──┐   two builders in parallel only when the brief carries a Contract
entry ──────┤                   ├─► gate ─┬─► reviewer                  ─┐
            └─ builder (front) ─┘         ├─► qa-frontend (if screens)   ├─► at most 1 fix pass ─► ready ─► the queue
                                          └─► qa-backend  (if API/data)  ─┘
```

| Step | Who | What |
|---|---|---|
| build | `builder (Opus 5.5, medium)` | the code and one test per AC; only the fast checks (types, lint, unit tests) while it builds; a file outside Owns is allowed and listed (`outsideOwns`) |
| gate | `exec-gate (Sonnet 5.5, low)` | the gate commands once (the check and the affected journeys); each failure `code` or `machine`; a machine red runs again after a load wait (2×), then parks `machine`; a code red takes the fix pass; green brings the stack up for the QAs |
| check | `reviewer (Opus 5.5, high)` ∥ `qa-frontend (Opus 5.5, medium)` ∥ `qa-backend (Opus 5.5, medium)` | the reviewer always; qa-frontend when the screen changed; qa-backend when the API or the data changed |
| triage | the workflow, in code | blocking = marked blocking, basis `ac` · `bug` · `security` · `rule`, and a proof. The rest are notes |
| fix | `builder (Opus 5.5, medium)` | one pass over every blocking item, then the gate, then the delta: only the agents that blocked re-check their own items. Still blocking → parked `round-cap` |

The blocking rule is [references/judging.md](references/judging.md).
Every agent stamps its start and end; the run returns `steps`, one
line per agent with its minutes, and the session keeps them.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the session | Opus 5.5, high | pre-flight, the goal, worktrees, runs, the machine's load, the merge queue and its signoff, the record, the stage report |
| `builder` | Opus 5.5, medium | the code and the tests of an entry, back and front or one side against the Contract; the fix pass |
| `exec-gate` | Sonnet 5.5, low | the gate commands once, code or machine, the surface, the stack |
| `reviewer` | Opus 5.5, high | the ACs implemented, bugs and races, the security checklist, operations, a written rule broken |
| `qa-frontend` | Opus 5.5, medium | the screens used like a person: the ACs' journeys, the states, mobile width |
| `qa-backend` | Opus 5.5, medium | the API called like a client, the data read back, and "try to break it" |
| `video-scribe` | Sonnet 5.5, high | a short video of what the agents did, per entry and once for the stage |

## Preconditions

`.state.md` says `stage: execute`; `02-plan/plan.md` is approved with
its gate commands; `02-plan/plan.graph.json` is the build graph the
plan's checker passed, and `02-plan/graph.json` its last output (the
`startOrder`, the critical path); a brief per node in
`02-plan/briefs/`; `02-plan/preflight.md`; discovery's locked mock in
`00-discovery/prototype/frames/`. The consuming project's `CLAUDE.md`
(or, in a two-root layout, the session root's `CLAUDE.md` and the
doctrine's contract table) names the codebase root, its doctrine, its
**golden paths**, its **fast checks**, its **gate commands** (the check
and the affected tests against a base), its **whole gate** and its
**signoff** command (the project contract's local-CI signoff). A
missing role joins the pre-flight. Missing plan: halt, back to stage 3.

```
designs-root/<workstream>/
├── .state.md                  # stage: execute
├── 02-plan/plan.md            # the Status column is this stage's to fill
└── 03-execution/
    ├── board.md               # one line per entry: state, sha, passes, minutes, the run id
    ├── parked.md              # what did not merge, with the evidence
    ├── entries/<id>/          # run-<n>.json (never overwritten), notes.md, the QAs' screenshots, video/
    ├── explain.md             # at the end: what was built, for the intern
    └── audit.md               # at the end: what was decided in the user's place
```

**The ids.**

| Id | What | When it starts |
|---|---|---|
| `F` | the foundation, from the plan | first, alone |
| `F-b` | the foundation's second half, only when the plan split it | after `F` merges, alone |
| `F-x<n>` | a foundation lane nobody waits for | with wave 1, once the foundation merged |
| `E-<nn>` | a slice | by its edges, in the start order |
| `E-int` | the integration node | when its edges are `ready` (stacked); merges last |
| `X.<n>` | a fix entry of this stage: the whole gate red at the end, or a "fix" he rules at the audit | at the end |

## Step 0 — pre-flight, then play

If the session is not on **Opus 5.5 at high effort**, ask the user to
switch (`/model`) and wait. Read `plan.md`, `plan.graph.json`,
`graph.json`, `preflight.md`, the pipeline's `docs/project-contract.md`
and the project's `CLAUDE.md`; the briefs, the recon and the doctrine
are read by the agents that use them.

**1. The pre-flight, once.** Show `02-plan/preflight.md` whole, as one
table: item · why · the ready `!` command to paste · what it blocks ·
status. Add what the session checks itself: the golden paths file, the
gate commands, the whole gate and the signoff command named; `gh auth
status` able to post a commit status; the stack-up command bringing a
stack up on `main`; the permission mode (auto mode, or an allow list
that covers the gate, the stack, the merges and the signoff). Then
wait. As he hands each item over, run its **Check** command and mark
it. An item he cannot give now parks the nodes it **Blocks** as `user`
from the start; everything else goes on.

**2. Play.** Give him the goal to paste, filled in, in one code block:

```
/goal Build the whole plan of <workstream> with the stage-execute skill,
from the foundation to the stage report, without asking me anything.
Done means, each shown in this conversation: board.md has every entry
merged into feat/<workstream>, or parked with its reason and evidence;
the whole gate ran once on the top of feat/<workstream> in a fresh
worktree and exited 0, and the signoff posted local-ci = success on
that sha (paste its line); audit.md is written; the stage report is
published with the screens beside the locked mock for my check (paste
the links). Decide what is mine conservatively and list it in the
audit for my veto. Then notify me.
```

**3. Prepare the codebase.** `feat/<workstream>` cut from `main` and
pushed; the start order from `graph.json`; the cap: the one measured
in `02-plan/recon/machine.md`, or else the plan's widest wave, held by
the load below; `board.md` with every node `waiting`.

**The machine is the session's.** Before it starts a run, the session
reads `cat /proc/loadavg`; above the threshold (the median load
`machine.md` measured at the cap, else `nproc`), the start waits for
the next run to finish. On a machine other work shares, the session
reads the load once before its first run, writes it on the board as
the outside load, and holds the cap at the threshold plus that load.
One run always goes: with none of its own running, the next one starts
whatever the load. The cap does not grow to go faster: past the
measured cap every run gets slower and the stage does not.

## Step 1 — the foundation

The foundation is an entry like the others, built alone. Run
exec-entry for `F` (Step 2's arguments). When it returns `ready`, it
goes through the merge queue. `F-b`, when the plan split it, runs the
same way right after `F` merges. Nothing else starts until the
foundation is merged.

## Step 2 — the fan-out

Every time something merges or comes back `ready`, start every node
whose `after` nodes are merged or `ready`, in `startOrder`, up to the
cap and under the load. A node whose one unmerged `after` node is
`ready` is **stacked**: it starts on that node's branch and takes
`feat/<workstream>` in by a merge in the queue. With two or more
`after` entries unmerged, it waits until at most one is left. For each:

1. **The worktree.** From the top of `feat/<workstream>` (or of the
   branch it stacks on): one worktree on `story/<workstream>/<id>`,
   under the codebase's `.worktrees/`.
2. **Run** the workflow by `scriptPath`, in the background:
   `${CLAUDE_SKILL_DIR}/../../workflows/exec-entry.js` with `mode:
   'build'`, the entry id, the brief, `contract: true` when the brief
   has a **Contract** section (two builders; without it, one), the
   design, discovery, recon and doctrine folders, `goldenPathsPath`,
   `fastChecks`, `gateCommands` (the check and the affected tests
   against the entry's base), `rulings.md`, `agentsDir:
   ${CLAUDE_SKILL_DIR}/../../agents`, `packsDir: ${CLAUDE_SKILL_DIR}/..`,
   the evidence folder `03-execution/entries/<id>/`, the worktree, the
   branch, the base, `priorRuns`, `loadThreshold`, and the commit
   trailer. While the agents are not installed in the running Claude
   Code, pass `inlineAgents: true`.
3. **Record** the run id and `building` in `board.md`.

Past the local cap, when the project provides a cloud runner, the
entries past the cap may run in cloud sessions, one per session, by
[references/cloud.md](references/cloud.md); what comes back goes
through the same queue. Without a runner the cap holds.

The session does not poll: the workflow's completion wakes it. Every
reply while runs are in flight carries the board as a table (entry ·
state · pass · minutes · run).

## Step 3 — what comes back

Save the return as `entries/<id>/run-<n>.json`. Write its `notes` to
`entries/<id>/notes.md` (agent · where · what · the fix it suggests);
they go into the merge commit's body and never open work. Its
`decided`, `choices` and `outsideOwns` go to the audit; its `steps` to
the board (the entry's minutes, and the slowest step). Then act on
`status`:

- **`ready`** → the merge queue (Step 4); in the background, the
  entry's video: `video-scribe (Sonnet 5.5, high)` with the run return
  and the evidence folder, writing under `entries/<id>/video/`. The
  queue never waits on it.
- **`interrupted`** → an agent returned nothing (the API, the network,
  the quota). Relaunch the same run with `resumeFromRunId`; if it fails
  again at once, wait until the reset the limit message names (or 30
  minutes) and relaunch. Never a new build.
- **`blocked`** → the builder found a true impossibility. A missing
  secret or account: parked `user`, one line in `parked.md`. A
  contradiction in the plan: the session decides it by the design,
  conservatively, writes `rulings.md` (`ruled: session`) and
  `entries/<id>/fixes-<n>.json` (`{ "fixes": [ { id, fix } ] }`), and
  resumes once (`mode: 'resume'`, `resume: { head, passesUsed,
  fixesFile, check: 'whole' }`).
- **`parked`**, by its `reason`, one line in `parked.md` with the
  evidence; the entries that depend on it wait; everything else goes
  on.
  - **`user`** — a question only he can answer in person. It waits for
    him; his answer becomes a fixes file and one resume.
  - **`machine`** — red only for the machine after two load waits. Wait
    until the load is under the threshold, then resume with `check`
    `'whole'` when the run parked before its check, or `'delta'` with
    the parked run's blocking items (`resume.items`) when it parked
    after the fix.
  - **`gate-red`** and **`round-cap`** — the budget is spent. The
    session does not resume them: the entry stays out of the feature
    branch, goes to the audit with its blocking items and evidence,
    and the stage goes on. He rules it at the audit.

## Step 4 — the merge queue is the local CI

The session is the **queue host**: the only process that merges into
`feat/<workstream>` and the only one that runs the project's
**signoff** command (one gate command on one commit in a fresh
worktree, its result posted as a commit status on that sha:
`gh api repos/:owner/:repo/statuses/<sha> -f state=success -f
context=local-ci`). No agent posts a status. Hosted CI is not on the
merge path.

```
for each ready entry, one at a time (the critical path first, then in the order they came back)
  1 base in        feat moved? merge it into the entry branch (never a rebase); a conflict → exec-entry 'update'
  2 merged tree    the paths outside Owns ∪ Extends listed; signoff, the affected gate, on the entry head; red → parked gate-red
  3 merge          git merge --no-ff into feat/<workstream>, the notes in the body, push; the entry's stack down, its worktree removed
  4 sign off       signoff, the same gate, on the new feat head — same tree, its record reused, status posted
  5 record         plan.md Status, board.md merged, start what it unblocked
once, at the end (Step 5)
  whole gate       signoff, the whole gate, on the top of feat — the status main requires
```

1. **The base in.** If `feat/<workstream>` moved since the entry was
   cut, merge it into the entry branch (`git merge --no-ff
   feat/<workstream>`) and push. A conflict: `git merge --abort`, then
   exec-entry `mode: 'update'`; anything but `ready` is parked.
2. **The merged-tree test.** `git diff --name-only
   feat/<workstream>...<entry branch>` against the node's `owns` and
   `extends`: each path outside them is listed in the merge body and
   the audit, with the run's `outsideOwns` reason or "unlisted". It
   does not block: the reviewer read the whole diff. Then signoff with
   the affected gate on the entry's head, with the per-merge context
   (`local-ci/affected`, or the one the project names): that head holds
   the base, so its tree is the tree the merge will make. Red → the
   entry is parked `gate-red` with the log's path and failing lines.
3. **Merge** with a merge commit whose body carries the entry's notes,
   push, bring the entry's stack down (the doctrine's stack-down
   command) and remove its worktree.
4. **Sign off** the merged head: same gate and context on the new top
   of `feat/<workstream>`; the record is reused, the status posted.
5. **Record.** `plan.md` Status: date · entry · sha · passes · minutes
   · the signoff's line. `board.md` to `merged`. Start what it
   unblocked.

## Step 5 — the end

When every entry is merged or parked:

1. **The whole gate, once**, on the top of `feat/<workstream>`:
   signoff with the whole gate and the context `main` requires
   (`local-ci`), in a fresh worktree with its own stack, the journeys
   keeping their screenshots. Green: the status is posted. Red: one fix
   entry `X.<n>`, its brief written by the session with the log's path
   and its failing lines, run through exec-entry, merged through the
   queue; then the whole gate again.
2. `explain.md` from [templates/explain.md](templates/explain.md).
3. `audit.md` by [references/audit.md](references/audit.md).
4. **The stage's video**: `video-scribe (Sonnet 5.5, high)` once more,
   with every `run-*.json`.
5. `blueprint/execution/execution.json` (schema:
   `${CLAUDE_SKILL_DIR}/../../blueprint/schema/execution.md`).
6. **The stage report**: follow
   `${CLAUDE_SKILL_DIR}/../../docs/stage-report.md` (video, slides,
   blueprint), with one more section, **the screens against the locked
   mock**: for every frame in `00-discovery/prototype/frames/`, the
   real screen in the same state (the whole gate's journey screenshot,
   or one the session takes on the top of the branch) beside it. This
   is the only visual check of the stage, and it is his: no agent
   compares the screens with the mock.
7. **PushNotification** to him: what merged, what parked, the report's
   links, and the audit and the screens waiting. The first call since
   the pre-flight.

## Step 6 — the audit

He reads the audit and the stage report, rules the parked entries and
anything he wants changed, and names any screen that drifts from the
mock. Each ruling goes next to its item in `audit.md`, in
`execution.json` and in `rulings.md`. A "fix" becomes one fix entry
`X.<n>` through exec-entry, like any other code. When he approves:
`.state.md` to `stage: release`, the close commit of the workstream
folder, and suggest `/clear` before stage 5.

## Resuming

Everything is in files. Read `.state.md`, `board.md`, `parked.md`,
`plan.md`'s Status and `entries/*/run-*.json`. An entry `building` with
no live run restarts from its branch with `mode: 'resume'`, `check:
'whole'`: its worktree exists and the builder reads what is on disk.

## Boundaries

The session writes no product code and reviews none. No deploy. No
merge of anything that did not come back `ready` and pass the
merged-tree test. No commit status posted by anything but the signoff
command, run by the session. No re-decision of the design or the plan.
No work opened from a note: notes are read, not built. Frictions worth
learning from go to the workstream's `dreaming-notes.md` on the spot.
Every agent named carries its model and effort.
