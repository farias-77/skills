---
name: stage-execute
description: Conducts stage 4 (Execute) — turns an approved plan into merged, reviewed code on the feature branch, from one "play" to one call. Step 0 shows the plan's pre-flight once, waits until every item is handed over, and gives the user the /goal text to paste; from then on nobody asks him anything. One session (Opus 5.5, high) orchestrates without writing code: the foundation first, then every node of plan.graph.json whose edges are merged or ready, in the graph's start order (critical path first), in parallel up to the cap, each through the exec-entry workflow — the verifier (Opus 5.5, medium) writes the entry's acceptance checks first, red on the base and read-only from then on; one builder (Opus 5.5, medium; high on every fix) builds the smallest change that passes them, back and front, with the knowledge packs of its surface, along the golden paths, until the gate commands are green; the gate (exec-gate, Sonnet 5.5, medium); then, in parallel, the verifier proving on the running stack (evidence, PII canary, failure modes) followed on screen diffs by ux-reviewer (Opus 5.5, medium) against the locked mock's frames, and the reviewers that never wrote the code — reviewer, structure-reviewer (both Opus 5.5, medium; structure blocks any mechanism nobody named), exec-lens-security (Opus 5.5, high) on every diff, exec-lens-operations (Opus 5.5, medium) on server diffs; a mechanical triage with no judge (a finding blocks with a repro or a written rule); one fix and a delta check. The session is the local CI: its serial queue merges the base into each ready entry, tests the merged tree with the affected gate, merges, and signs the merged head off with a commit status; the whole gate runs once at the end in a fresh worktree and signs off the top that main accepts. It runs foundation amendments, builds the deferred register in one batch slice per side group, reads the whole branch once for maintainability, renders a video per entry, closes with the stage report (video, slides, blueprint), and calls the user once, when everything is merged, green, verified and reported. Use when a workstream's .state.md says stage execute, or to resume an execution in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, PushNotification, Bash
---

# Stage 4: Execute

An approved plan comes in: the build graph (`plan.graph.json`: the
foundation, the lanes, the slices, the integration node, their edges
and the files each owns), a brief per node. Merged code comes out on `feat/<workstream>`:
every entry with its acceptance checks written before its code, built,
gated, proved on the running stack and reviewed, the whole gate green
on the top of the branch, and an audit of what was decided in the
user's place. Alpha and production are stage 5's.

**No code enters without review.** Every commit that reaches an entry
branch passes the gate commands and a verifier and reviewers that never
wrote it: the entry's build, every fix, every conflict resolution,
every foundation amendment, every batch slice. The session never merges
anything that did not come back `ready` from the exec-entry workflow.

**Maintainability is a gate, not an afterthought.** The builder follows
the project's golden paths; the structure check is one of the gate
commands; `structure-reviewer (Opus 5.5, medium)` reads every entry and
every batch slice, and its findings block like any other; the whole
branch is read once more for maintainability before the audit.

**Right size, inside the code too.** The builder builds the smallest
change that passes the acceptance and adds no mechanism the brief or
the design does not name; `structure-reviewer (Opus 5.5, medium)`
blocks one that nobody named (`pack-right-sizing`, list C). Overengineering is what turns two
hours into two hundred, so it is a defect here, not a style.

**The screens are the ones he approved.** On every diff with screen
code, `ux-reviewer (Opus 5.5, medium)` compares the verifier's
screenshots and video with the locked mock's frames from discovery; a
drift with the frame to show for it blocks.

**The queue is the CI.** Nothing reaches `feat/<workstream>` that was
not tested, on this machine, as the tree it becomes; the session signs
each merged head off and the whole gate signs off the top once. Hosted
CI keeps the deploy and is not on the merge path.

The session is the orchestrator, **Opus 5.5 at high effort**. It does
not write product code and does not review it: it prepares the
worktrees, starts the pipelines, runs the merge queue and its signoff,
amends the plan, and keeps the record. The user hands over the
pre-flight, pastes one goal and leaves; the session calls him once, at
the end, when everything is merged, green, verified and reported.

## The pipeline of one entry

```
exec-entry (one workflow run per entry, in its own worktree and stack)
  accept   verifier (Opus 5.5, medium), author mode: the brief's acceptance and proof lines,
           following the discovery journeys, as browser journeys (screens) and integration
           tests (server), in the doctrine's test layout; red on the base for the right
           reason; committed. From here on the acceptance files are read-only for the builder
  build    builder (Opus 5.5, medium), one writer for back and front, in the entry worktree:
           the smallest change that passes the acceptance, no mechanism the brief does not
           name; the packs of its surface; the golden paths followed, helpers reused; does
           not end its turn until the gate commands are green
  gate     exec-gate (Sonnet 5.5, medium): acceptance untouched, the gate commands (fast
           check, affected tests, structure check), the surface (api · screen · runtime),
           stack up; red → the builder at high (3 tries) → parked: gate-red
  check    on the same head:
             verifier, prove mode — the acceptance checks on the running stack; a screenshot
               of every state named by its frame, video, side effects read back, the PII
               canary; the failure-mode block when the server changed; PASS · FAIL ·
               INCONCLUSIVE (= FAIL)
               → ux-reviewer (Opus 5.5, medium), when the screen changed — that evidence
                 against the locked mock's frames; hierarchy, states, focus, motion, widths, copy
           ∥ reviewer (Opus 5.5, medium) — correctness and fidelity to the brief and design
           ∥ structure-reviewer (Opus 5.5, medium) — mechanisms nobody named, golden paths,
               boundaries, duplication, abstraction, names, size, dead code, tests of behaviour
           ∥ exec-lens-security (Opus 5.5, high) — every diff
           ∥ exec-lens-operations (Opus 5.5, medium) — the server's product code or the runtime
  triage   mechanical, no judge: blocks = severity ≠ detail AND (repro or rule), or the
           verifier did not PASS · deferred = the rest but details · learn log = details
  fix      the same builder at effort high, once, every blocking item → the gate
  delta    the verifier again + only the reviewers that blocked, over their own items;
           still blocking → parked: round-cap   (maxRounds 2 = the check and one delta)
  ready    the gate commands keep-going against the base, then the record: the evidence
           of the head written, swept for tokens and redacted, the feature map's pointers
           checked. Ready is not merged: the queue (Step 4) tests the merged tree and signs off
```

The triage rule is [references/judging.md](references/judging.md).

## The team

| Agent | Model, effort | Packs | Does |
|---|---|---|---|
| the session | Opus 5.5, high | `pack-parallel-plan-local-ci` (its `SKILL.md` read once, before the first merge) | pre-flight, the goal, worktrees, pipelines, the machine's load, the merge queue and its signoff, amendments, batch slices, the record, the videos, the audit |
| `verifier` | Opus 5.5, medium | — | writes the acceptance checks first (author); proves them on the running stack with evidence, the PII canary and the failure-mode block (prove) |
| `builder` | Opus 5.5, medium; high on every fix | go-backend, react-frontend, design-taste, motion-3d, ops — the ones its surface needs | the single writer of an entry, back and front, the smallest change, until the gate commands are green |
| `exec-gate` | Sonnet 5.5, medium | — | acceptance untouched, the gate commands, the surface, the stack, the base merged in at a conflict, the record |
| `reviewer` | Opus 5.5, medium | go-backend, react-frontend | correctness and fidelity to the brief and the design |
| `structure-reviewer` | Opus 5.5, medium | right-sizing, go-backend, react-frontend | the maintainability gate of every entry and batch slice; blocks a mechanism nobody named |
| `ux-reviewer` | Opus 5.5, medium | design-taste, motion-3d, react-frontend | every diff with screen code, after the verifier: the real screens against the locked mock's frames |
| `exec-lens-security` | Opus 5.5, high | — | every diff |
| `exec-lens-operations` | Opus 5.5, medium | ops | every diff with the server's product code or the runtime |
| `exec-lens-craft` | Opus 5.5, medium | — | the maintainability read of the whole branch, once per stage |
| `video-scribe` | Sonnet 5.5, high | — | a short video of what the agents did, per entry and once for the stage |

Registered agents preload their packs through `skills:` in their
frontmatter; the workflow also names each pack's `SKILL.md` in the
prompt when it gets `packsDir`, which is how inline agents read them.
The builder builds at medium because on work that must merge without
edits Opus 5.5 scores best at medium and adds out-of-scope edits above
it; every fix runs at high (`pack-model-selection`).

## Preconditions

`.state.md` says `stage: execute`; `02-plan/plan.md` is approved with
its gate commands; `02-plan/plan.graph.json` is the build graph the
plan's checker passed, and `02-plan/graph.json` its last output (the
waves, the width, the critical path, the `startOrder`); a brief per
node in `02-plan/briefs/` (the acceptance lines, the golden paths, the
names used from the foundation, Owns and Extends);
`02-plan/preflight.md` lists what the user must hand over; discovery's locked mock is in
`00-discovery/prototype/frames/` with its `00-discovery/journeys/*.yaml`.
The consuming project's `CLAUDE.md` names the codebase root, its
engineering doctrine, its **golden paths** file (the exemplary modules
new code must look like), the **gate commands** (the fast check, the
affected tests against a base, the structure check), the **whole
gate**, and the **signoff** command (the project contract's local-CI
signoff: it runs a gate command on one commit in a fresh worktree and
posts the commit status on that sha; the pipeline-setup skill has a
template). A missing golden paths file, structure check or signoff
command joins the pre-flight (Step 0). Missing plan: halt, back to
stage 3.

```
designs-root/<workstream>/
├── .state.md                  # stage: execute
├── 02-plan/plan.md            # the Status column and the Amendments are this stage's to fill
└── 03-execution/
    ├── board.md               # one line per entry: state, sha, rounds, the run id — the session's file
    ├── parked.md              # what waits for the user, with the evidence
    ├── deferred.md            # every deferred finding, by entry, with its state — the batch slices' list
    ├── learn-log.md           # every detail, by entry and reviewer — the retro's, never built here
    ├── amendments/F.<n>.md    # the brief of each foundation amendment
    ├── entries/<id>/          # per entry: run-<n>.json (each run's return, never overwritten),
    │                          #   fixes-<n>.json (a resume's items), verify/ (videos, screenshots), video/
    ├── explain.md             # at the end: what was built, for the intern
    └── audit.md               # at the end: what was decided in the user's place
```

**The ids.** The plan's nodes and this stage's own entries keep apart:

| Id | What | When it starts |
|---|---|---|
| `F` | the foundation, from the plan | first, alone |
| `F-b` | the foundation's second half, only when the plan split it | after `F` merges, alone; every other node waits for it too |
| `F-x<n>` | a foundation lane nobody waits for (deploy skeleton, harness extras) | with wave 1, once the foundation merged |
| `E-<nn>` | a slice | by its edges, in the start order |
| `E-int` | the integration node: journeys across three or more slices | when its edges are `ready` (stacked); merges last |
| `F.<n>` | a foundation amendment, this stage's | alone in the queue (Step 5) |
| `X.<n>` | a batch slice or a fix entry, this stage's | at the end (Steps 6 and 7) |

## Step 0 — pre-flight, then play

If the session is not on **Opus 5.5 at high effort**, ask the user to
switch (`/model`) and wait. Read `plan.md`, `plan.graph.json`,
`graph.json`, `preflight.md`, the
pipeline's `docs/project-contract.md` (it names the roles) and the
project's `CLAUDE.md`; every brief, the recon and the doctrine are read
by the agents that use them, never by the session to look something up.

**1. The pre-flight, once.** Show `02-plan/preflight.md` whole, as one
table: item · why · the ready `!` command to paste (its **Do**) · what
it blocks · status. Add to it what the session checks itself before
the foundation: the golden paths file, the structure check, the whole
gate and the signoff command named in `CLAUDE.md`; `gh auth status`
able to post a commit status on the repository; the stack-up command
of the doctrine bringing a stack up on `main`; the session's
permission mode (auto mode, or a project allow list that covers the
gate, the stack, the merges and the signoff), so no turn stops on a
prompt. Then wait. As he hands each item over, run its **Check**
command (it proves the item without printing a secret) and mark it;
ask nothing else. When every item is checked, go on. An item he says
he cannot give now is the only exception: the nodes it **Blocks** are
parked `user` from the start, with the item as the reason, and
everything else goes on.

**2. Play.** Give him the goal to paste, filled in, in one code block:

```
/goal Build the whole plan of <workstream> with the stage-execute skill,
from the foundation to the stage report, without asking me anything.
Done means, each shown in this conversation: board.md has every entry
and batch slice merged into feat/<workstream>, or parked only for what
needs me in person, with its evidence; the whole gate ran once on the
top of feat/<workstream> in a fresh worktree and exited 0, and the
signoff posted local-ci = success on that sha (paste its line); the
maintainability read is done and its blocking findings are merged;
audit.md is written; the stage report (video, slides, blueprint) is
published (paste the links). Decide what is mine conservatively and
list it in the audit for my veto. Then notify me.
```

`/goal` keeps the session working turn after turn until a separate
evaluator reads, in the conversation, that the condition holds; a
running workflow defers the evaluation until it returns. From his
paste until the end, he is not asked anything: the builder decides his
classes conservatively and lists them for his veto, and the session
unblocks every park that is not his in person (Step 3).

**3. Prepare the codebase.** `feat/<workstream>` cut from `main` and
pushed; the critical path and the start order from `graph.json`; the
cap: the one measured in `02-plan/recon/machine.md` with its load when
that file exists (the plan runs the machine scout only when asked), or
else the plan's widest wave, held by the load below;
`03-execution/board.md` with every node `waiting`, the foundation
first.

**The machine is the session's.** Agents never wait on each other and
never coordinate the machine among themselves. The session holds the
cap by the load: before it starts a run, it reads the load average
(`cat /proc/loadavg`); above the median load `machine.md` measured at
the cap (without `machine.md`: above the core count, `nproc`), the
start waits for the next run to finish.

**The cap does not grow to go faster.** Past the measured cap every run
gets slower and the stage does not: in one measured run, five runs on
a cap measured at one took the median run from 35 to 88 minutes, the
gate from 4.5 to 13, and the agents spent hours waiting on the load. A
higher cap comes only from a measurement (the plan's `machine` scout,
run with this workstream's suites) that holds it. Width
past the local cap comes from cloud sessions (Step 2), never from
crowding this machine.

## Step 1 — the foundation

The foundation is an entry like the others, built alone. Prepare its
worktree and run exec-entry for `F` (below). When it returns `ready`,
it goes through the merge queue. When the plan split it, `F-b` runs
the same way right after `F` merges, alone. Nothing else starts until
the foundation is merged, with one exception: when the foundation's run comes back
without `ready` after its gate went green (parked on a question or on
the round cap), the root entries (no `after`) start on the
foundation's branch at that green head while the foundation goes on,
and take `feat/<workstream>` in by a merge once it merges.

## Step 2 — the fan-out

Every time something merges or comes back `ready`, start every node
of `plan.graph.json` whose `after` nodes are merged or `ready`, in
`graph.json`'s `startOrder` (the critical path first), up to the cap
and under the load. The lanes `F-x<n>` start with wave 1: nothing waits
for them, so they only take width. `E-int` starts when its edges are
`ready` and merges last. A node whose one unmerged `after` node is
`ready` is **stacked** (the graph marks the edge `stacked: true`): it
starts on that node's branch and takes `feat/<workstream>` in by a
merge in the queue. With two or more `after`
entries still unmerged, it waits until at most one is left. If the
entry under a stacked one parks at the queue, the stacked one waits
for it. For each:

1. **The worktree.** From the top of `feat/<workstream>` (or of the
   branch it stacks on): one entry worktree on
   `story/<workstream>/<id>`, under the codebase's `.worktrees/`. One
   writer, one tree: there are no side worktrees.
2. **Run** the workflow by `scriptPath`, in the background:
   `${CLAUDE_SKILL_DIR}/../../workflows/exec-entry.js` with `mode:
   'build'`, the entry id, the brief, the design, recon and doctrine
   folders, `goldenPathsPath`, `gateCommands` (the project's fast
   check, its affected tests against the entry's base, its structure
   check — in that order), `rulings.md`, the triage rule
   (`judgingPath: ${CLAUDE_SKILL_DIR}/references/judging.md`),
   `agentsDir: ${CLAUDE_SKILL_DIR}/../../agents`, `packsDir:
   ${CLAUDE_SKILL_DIR}/..` (the packs' `SKILL.md` files, named in each
   agent's prompt), `discoveryDir` (the workstream's `00-discovery/`:
   the locked mock's frames and journeys), the evidence folder
   `03-execution/entries/<id>/`, the worktree and branch, the base
   (`feat/<workstream>`, or the branch it stacks on), `priorRuns` (the
   paths of the entry's earlier `run-<n>.json`, so no reviewer reports
   again what was raised), and the commit trailer. While the v9 agents
   are not installed in the running Claude Code, pass `inlineAgents:
   true`: each agent then reads its definition from `agentsDir`. Every
   later run of the entry (`resume`, `update`) gets the same arguments,
   with `priorRuns` grown by one and `acceptance` (the `commit` and
   `files` of the run that authored them), so the checks are never
   written twice.
3. **Record** the run id and `building` in `board.md`.

**Past the local cap.** When the ready set is wider than the measured
cap and the project provides a cloud runner (the project contract's
role for it), the entries past the cap may run in cloud sessions, one
entry per session, by [references/cloud.md](references/cloud.md):
pushed first, the same brief and arguments, the code back on the
entry branch and the evidence on an evidence branch, and the same
queue, merged-tree test and signoff as any other. Without a
runner the cap holds and the rest waits.

**Stop hooks are not the gate.** A project may hold the builder's turn
open with a Stop hook while its fast check is red. Claude Code
overrides a Stop or SubagentStop hook after **8** consecutive blocks
by default (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`; 0 turns the cap off), so
a hook can end silent on a red. The workflow never relies on it: after
every builder return it runs the gate and reads its result.

The session does not wait on a run and does not poll: the workflow's
completion wakes it (a cloud entry is watched by one background shell
loop, never by model turns). Every reply while runs are in flight carries the
board as a table (entry · state · round · run), read from the harness.

## Step 3 — what comes back

Save the return as `entries/<id>/run-<n>.json`, one file per run,
never overwritten. Append its `deferred` to `deferred.md` (entry ·
round · reviewer · the finding's `says` and `fix` · state `open`); a
line of kind `record` is an open record item (evidence, a feature-map
pointer) that the gate could not close. Append its `learnLog` to
`learn-log.md`. Its `decided` and `choices` go to the audit. Then act
on `status`:

- **`ready`** → the merge queue, after the coherence pass when it is
  due (below); and, in the background, **the entry's video**:
  `video-scribe (Sonnet 5.5, high)` with the run return
  (`run-<n>.json`) and the evidence folder (`entries/<id>/`), writing
  under `entries/<id>/video/` (its definition is
  `${CLAUDE_SKILL_DIR}/../../agents/video-scribe.md`; it renders with
  `${CLAUDE_SKILL_DIR}/../../video/`). The queue never waits on it.
- **`needs-amendment`** → step 5; the entry waits for it and restarts
  from its branch with its `acceptance`. When the amendment changes an
  acceptance check (the builder found one that contradicts the brief
  or the design, and the design decides it), the restart passes
  `acceptanceRevision` (the amendment's path): the verifier revises
  only the checks it names. A change the design does not decide is
  parked for the user.
- **`interrupted`** → an agent returned nothing: the API, the network
  or the quota failed. Not a park. Relaunch the same run with
  `resumeFromRunId` (what finished returns from the cache); if it fails
  again at once, wait — until the reset time the limit message names,
  or 30 minutes for the network — and relaunch. Never relaunched as a
  new build.
- **`parked`**, by its `reason`, one line in `parked.md` with the
  evidence; the entries that depend on it wait; everything else goes
  on. The session unblocks it itself; only `user` waits for him.
  - **`user`** — a question only he can answer in person (a credential,
    an account, an action outside the repo only he can take; the
    builder decides the rest conservatively). It waits for him.
  - **`gate-red`** — the gate stayed red after the builder's tries.
    The session reads every failure and its `cause` and diagnoses:
    **environment** (a timeout under load, a download or the network)
    → wait until the load is under the threshold and resume with an
    empty fixes file, so the gate runs again; **the foundation** (a
    defect the entry inherits) → an amendment (step 5), then resume;
    **the code** → resume with each failure as an item, the diagnosis
    written in its fix. One unblocking per entry; red again after it →
    parked for the audit with both diagnoses.
  - **`round-cap`** — items still blocking after the fix and its delta.
    One automatic resume with them. If it caps again, the session
    writes the smallest fix of what is left, by the triage rule, for
    one last resume. If that last resume caps too, the entry stays out
    of the feature branch and goes to the audit with its evidence; the
    stage goes on.

**Resume.** Once his answer is in `rulings.md`, or for a gate-red or
a round cap, the entry continues with exec-entry `mode: 'resume'`
(`resume: { fixesFile, head, reviewers }`): the session writes
`entries/<id>/fixes-<n>.json` — `{ "fixes": [ { id, reviewer, fix,
repro, rule } ] }`, the still-blocking items of the parked run, his
answer, or the gate diagnosis — the parked head, and the reviewers
whose items it carries. The builder applies them at high effort, the
gate runs, and one delta checks them: the verifier and the reviewers
named (reviewer and structure-reviewer when the items are the
session's). Never a new build and a whole review for an entry that
was already reviewed.

**The session's answers.** Answers use only behaviour already merged
on `feat/<workstream>`: before writing one, check the plan's edges; an
answer that leans on an entry not merged is not an answer. It goes to
`rulings.md` (`ruled: session`). A fix that needs a shared file goes
through step 5 first, then the entry resumes.

**The coherence pass.** When an entry comes back `ready` after more
than one run, or a rule changed while it was in flight (a ruling in
`rulings.md`, a line of the doctrine or the golden paths), one reader
goes over its whole diff before the queue: `reviewer (Opus 5.5,
medium)` with the rules that changed, looking for what the old rule left
behind (never in a generated file). Its findings go through the same
triage: blocking → exec-entry `mode: 'resume'` with them as the fixes
file; nothing blocking → the queue.

## Step 4 — the merge queue is the local CI

The session is the **queue host**: the only process that merges into
`feat/<workstream>` and the only one that runs the project's
**signoff** command. Signoff runs one gate command on one commit in a
fresh worktree (only what is committed and pushed counts), keeps a
record per tree and command, and posts the result as a commit status
on that sha:

```
gh api repos/:owner/:repo/statuses/<sha> -f state=success -f context=local-ci
```

No agent posts a status, and an agent's green is evidence, not a
signoff. Hosted CI (GitHub Actions or another) is not on the merge
path: it keeps the deploy and whatever cheap trust check the project
wants (stage 5).

```
for each ready entry, one at a time
  1 base in        feat moved? merge it into the entry branch (never a rebase); a conflict → exec-entry 'update'
  2 merged tree    path guard (Owns ∪ Extends), then signoff, the affected gate, on the entry head —
                   the tree the merge will make; red → resume
  3 merge          git merge --no-ff into feat/<workstream>, push
  4 sign off       signoff, the same gate, on the new feat head — same tree, its record reused, status posted
  5 record         plan.md Status, board.md merged, start what it unblocked, triage its deferred lines
once, at the end (Step 7)
  whole gate       signoff, the whole gate, on the top of feat — the status main requires
```

One entry at a time: the critical path first, then in the order they
came back. An amendment that changes a convention the entries in
flight follow (a test convention, a shared helper's behaviour, a
golden path) waits while the critical entry in flight is `ready` or in
its delta, and merges after it; an amendment the critical entry asked
for goes to the front.

1. **The base in.** If `feat/<workstream>` moved since the entry was
   cut, merge it into the entry branch in the entry worktree (`git
   merge --no-ff feat/<workstream>`) and push: a merge, never a rebase
   (the entry branch is made of merges; a rebase replays commits
   already resolved). A clean merge adds no authored code. A conflict:
   `git merge --abort`, then exec-entry `mode: 'update'`: the builder
   resolves it and the resolution is checked like any other code;
   anything but `ready` is parked.
2. **The merged-tree test.** Signoff with the affected gate (the gate
   commands against `feat/<workstream>`) on the entry's head, with the
   per-merge context (`local-ci/affected`, or the one the project
   names): that head holds the base, so its tree is the tree the merge
   will produce. A merge git calls clean can still break the build or
   a test; this run is what catches it. Before it, the path guard:
   `git diff --name-only feat/<workstream>...<entry branch>` against
   the node's `owns` and `extends` in `plan.graph.json` (literal paths
   and `dir/**` globs; the brief carries the same lists, and the plan's
   checker keeps them equal); an entry of this stage (`F.<n>`, `X.<n>`)
   is held to the paths its own brief names. A path outside them goes
   back as a resume item (move it, or an amendment when it is a shared file),
   so two entries in flight never write the same file. Read every check, never only
   the first red. Red → exec-entry `mode: 'resume'` with one item per
   failure (the check, the log's path and its failing lines), then
   this step again. The entry's own ready gate does not replace this
   run: it ran before the base moved, inside an agent's tree.
3. **Merge** the entry branch into `feat/<workstream>` with a merge
   commit, push, remove the entry's worktree.
4. **Sign off** the merged head: signoff with the same gate and
   context on the new top of `feat/<workstream>`. Its tree is the one
   step 2 passed, so the record is reused and only the status is
   posted.
5. **Record.** The entry's line in `plan.md`'s Status: date · entry ·
   sha · the proof line (the verifier's verdict and its evidence
   folder) · the signoff's line. `board.md` to `merged`. Start what it
   unblocked, and triage its deferred lines (step 6).

The whole gate is not run per entry: its time grows with the suites,
and the affected gate on the merged tree is what each merge needs. It
runs once, at the end (Step 7), and only that run posts the context
`main` requires (`local-ci`).

## Step 5 — foundation amendments

An entry that returns `needs-amendment` names the shared file it
needs changed (a migration, the contract, the generated code, the
module registry), or the acceptance check it believes contradicts the
brief or the design. The session writes `amendments/F.<n>.md`: what
changes, why, the design section it follows, and the proof; a change
the design does not already decide is parked for the user instead.
A shared-file amendment runs through exec-entry as entry `F.<n>`, alone
in the queue (in the queue's order above), merges, and is recorded
under "Amendments" in `plan.md` (and in `plan.graph.json` when it
changes what a node owns, the plan's checker green after it); the
entries in flight pick it up at their update. An acceptance amendment is the entry's own: it restarts
with `acceptanceRevision`. A deferred line whose fix touches a shared
file becomes an amendment the same way, at its triage (step 6), never
an edit inside a batch slice.

## Step 6 — the deferred batch

Every deferred finding is this execution's, and it is built in this
execution: nothing is left as backlog for another workstream. The
learn log is not built here; it is the retro's.

1. **Triage** as each entry merges: its open lines in `deferred.md`
   that touch a shared file go to step 5 as an amendment; the rest are
   marked with their side group (the server side's folders or the
   screen side's, as the doctrine names them; a line touching both
   goes to the server group). A line of kind `record` goes to its
   group as a record item for the slice's gate, never to the builder.
2. **Build at the end**, when every entry is merged or parked: **one
   batch slice per side group**, `X.<n>`, from the top of
   `feat/<workstream>`. The session writes its brief and its lines
   file (each line with its entry, its round and its fix) and runs it
   through exec-entry `mode: 'batch'` with `batchPath` and the
   `acceptance` files of the entries its lines touch. The builder
   applies the lines; the gate, the verifier and `structure-reviewer
   (Opus 5.5, medium)` check it, and `ux-reviewer (Opus 5.5, medium)`
   when it changes screen code; it opens no new review. It merges
   through the queue.
3. **Close** each line in `deferred.md`: `done` with the slice and its
   sha, or `skipped` with the reason (the code moved and the finding
   no longer applies, the fix is already there). A batch slice's own
   deferred lines go to the audit, not to another slice.

## Step 7 — the end

When every entry and every batch slice is merged or parked:

0. **The maintainability read**, once per stage, before the audit:
   `exec-lens-craft` (Opus 5.5, medium), which built none of it, reads
   the whole diff of `feat/<workstream>` against `main` with the golden
   paths and reports what a developer new to the codebase would find
   strange and what is built beyond what the design asks for. Its
   findings go through the same triage: the blocking ones become one
   correction entry `X.<n>`, brief written by the session, run through
   exec-entry and merged like any other; the rest go to the audit and
   the learn log.
1. **The whole gate, once**, on the top of `feat/<workstream>`:
   signoff with the whole gate command and the context `main` requires
   (`local-ci`), in a fresh worktree with its own stack. It runs every
   acceptance check of the stage with the rest of the suites; it is
   the only whole run of the stage. Green: the status is posted on
   that sha, and stage 5 merges into `main` behind it. Red: one fix
   entry, its brief written by the session with the log's path and
   its failing lines, run through exec-entry, merged through the
   queue; then the whole gate again on the new top.
2. `explain.md` from [templates/explain.md](templates/explain.md): what
   was built, for the intern.
3. `audit.md` by [references/audit.md](references/audit.md): the
   numbers, the parked, the decisions the builder and the session took
   in the user's place, the choices the builder made where the
   documents were silent, the precision per reviewer, the verifier's
   verdicts, and the learn log's size.
4. **The stage's video**: `video-scribe (Sonnet 5.5, high)` once
   more, with every `run-*.json` and the evidence folders of the
   stage, for the whole of it.
5. `blueprint/execution/execution.json` (schema:
   `${CLAUDE_SKILL_DIR}/../../blueprint/schema/execution.md`, "Graph
   plans"): the entries with their state and numbers, the amendments,
   the precision per reviewer (`found`; `sustained` = blocking;
   `deferred`; `dismissed` = to the learn log; `latitude` and `user`
   0), the plain report and the audit items with `ruling: null`.
6. **The stage report**: follow
   `${CLAUDE_SKILL_DIR}/../../docs/stage-report.md` (video, slides,
   blueprint) — the blueprint built with
   `node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>`
   and published.
7. **PushNotification** to the user: everything merged, green,
   verified and signed off, the stage report's links and the audit
   waiting. This is the first time he is called since the pre-flight.

## Step 8 — the audit

The user reads the audit and the stage report, and rules the parked
items and anything he wants changed. Each ruling is written next to
its item in `audit.md`, in `execution.json` and in `rulings.md`. A
change becomes a fix entry (`X.<n>`) through exec-entry, like any
other code. When he approves: `.state.md` to `stage: release`, the
close commit of the workstream folder, and suggest `/clear` before
stage 5.

## How to write

Say what you mean. Literal sentences, concrete values. Every reply
while pipelines run carries the board. A status table is read from the
harness, never assumed. Every agent named carries its model and effort.

## Resuming

Everything is in files. Read `.state.md`, `board.md`, `parked.md`,
`deferred.md`, `plan.md`'s Status and Amendments, and
`entries/*/run-*.json`. A goal set with `/goal` is restored when the
session is resumed. An entry `building` with no live run restarts
from its branch with the `acceptance` of its last run: its worktree
exists, and the builder reads what is on disk. Never from memory of a
previous session.

## Boundaries

The session writes no product code and reviews none. No deploy: alpha
and production are stage 5's. No merge of anything that did not come
back `ready` and pass the merged-tree test. No commit status posted by
anything but the signoff command, run by the session. No edit to an acceptance file outside the verifier's
author mode. No re-decision of the design or the plan: what cannot be
built as planned is an amendment the design already decides, or it is
parked for the user. Frictions worth learning from go to the
workstream's `dreaming-notes.md` on the spot.
