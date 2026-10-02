---
name: stage-execute
description: Conducts stage 4 (Execute) — turns an approved plan into merged, reviewed code on the feature branch with nobody in the loop until the end. One session (Opus 5.5, high) receives one goal, "build the whole plan", and orchestrates without writing code: the foundation first, then every entry whose edges are merged or ready, critical path first, in parallel up to the measured cap, each through the exec-entry workflow — the verifier (Sonnet 5.5, high) writes the entry's acceptance checks first, red on the base and read-only from then on; one builder (Opus 5.5, medium) builds back and front in the entry worktree along the golden paths until the gate commands are green; the gate (exec-gate, Sonnet 5.5, low); then, in parallel, the verifier proving on the running stack (evidence, PII canary, failure modes) and the reviewers that never wrote the code — reviewer (Sonnet 5.5, high), structure-reviewer (Opus 5.5, medium), security on every diff and operations on every server diff (Opus 5.5, medium); a mechanical triage with no judge (a finding blocks with a repro or a written rule); one fix at high effort and a delta check. The session merges what comes back ready through a serial queue (the base merged in, the affected gate, merge), runs foundation amendments, builds the deferred register in one batch slice per side group at the end, reads the whole branch once for maintainability, renders a video per entry, closes with the stage report (video, slides, blueprint), parks what is the user's, and calls him once, when everything is merged and green, for the audit. Use when a workstream's .state.md says stage execute, or to resume an execution in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, PushNotification, Bash
---

# Stage 4: Execute

An approved plan comes in: the foundation, the entries, their edges,
the cap, a brief per entry. Merged code comes out on `feat/<workstream>`:
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

The session is the orchestrator, **Opus 5.5 at high effort**. It does
not write product code and does not review it: it prepares the
worktrees, starts the pipelines, merges, amends the plan, and keeps the
record. The user gave one goal and left; the session calls him once,
at the end.

## The pipeline of one entry

```
exec-entry (one workflow run per entry, in its own worktree and stack)
  accept   verifier (Sonnet 5.5, high), author mode: the brief's acceptance and proof lines
           as Playwright journeys (screens) and Go integration tests (server), in the
           doctrine's test layout; red on the base for the right reason; committed.
           From here on the acceptance files are read-only for the builder
  build    builder (Opus 5.5, medium), one writer for back and front, in the entry worktree:
           the golden paths followed, existing helpers reused, functions and files small;
           does not end its turn until the gate commands are green
  gate     exec-gate (Sonnet 5.5, low): acceptance untouched, the gate commands (fast check,
           affected tests, structure check), the surface (api · screen · runtime), stack up
           red → the builder again (3 tries) → parked: gate-red
  check    in parallel, on the same head:
             verifier, prove mode — the acceptance checks on the running stack; screenshots,
               video, side effects read back, the PII canary; the failure-mode block when
               the server changed; PASS · FAIL · INCONCLUSIVE (= FAIL)
             reviewer (Sonnet 5.5, high) — correctness and fidelity to the brief and design
             structure-reviewer (Opus 5.5, medium) — golden paths, boundaries, duplication,
               abstraction, names, size, dead code, tests of behaviour
             exec-lens-security (Opus 5.5, medium) — every diff
             exec-lens-operations (Opus 5.5, medium) — the server's product code or the runtime
  triage   mechanical, no judge: blocks = severity ≠ detail AND (repro or rule), or the
           verifier did not PASS · deferred = the rest but details · learn log = details
  fix      the same builder at effort high, once, every blocking item → the gate
  delta    the verifier again + only the reviewers that blocked, over their own items;
           still blocking → parked: round-cap   (maxRounds 2 = the check and one delta)
  ready    the gate commands keep-going against the base, then the record: the evidence
           of the head written, swept for tokens and redacted, the feature map's pointers
           checked (the whole gate runs once, at the end of the stage)
```

The triage rule is [references/judging.md](references/judging.md).

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the session | Opus 5.5, high | worktrees, pipelines, the machine's load, the merge queue, amendments, the batch slices, the record, the videos, the audit |
| `verifier` | Sonnet 5.5, high | writes the acceptance checks first (author); proves them on the running stack with evidence, the PII canary and the failure-mode block (prove) |
| `builder` | Opus 5.5, medium; high on the fix | the single writer of an entry, back and front, along the golden paths, until the gate commands are green |
| `exec-gate` | Sonnet 5.5, low | acceptance untouched, the gate commands, the surface, the stack, the base merged in at an update, the whole gate once at the end, the record |
| `reviewer` | Sonnet 5.5, high | correctness and fidelity to the brief and the design |
| `structure-reviewer` | Opus 5.5, medium | the maintainability gate of every entry and batch slice |
| `exec-lens-security` | Opus 5.5, medium | every diff |
| `exec-lens-operations` | Opus 5.5, medium | every diff with the server's product code or the runtime |
| `exec-lens-craft` | Opus 5.5, medium | the maintainability read of the whole branch, once per stage |
| `video-scribe` | Sonnet 5.5, medium | a short video of what the agents did, per entry and once for the stage |

## Preconditions

`.state.md` says `stage: execute`; `02-plan/plan.md` is approved with a
brief per entry in `02-plan/briefs/`; the pre-flight is handed. The
consuming project's `CLAUDE.md` names the codebase root, its
engineering doctrine, its **golden paths** file (the exemplary modules
new code must look like) and the **gate commands** (the fast check, the
affected tests against a base, the structure check). A missing golden
paths file or structure check is a pre-flight item: halt, and ask the
user for it once, before the foundation. Missing plan: halt, back to
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

## Step 0 — open

If the session is not on **Opus 5.5 at high effort**, ask the user to
switch (`/model`) and wait. Then read `plan.md`, every brief, the
recon, the golden paths file, and the engineering doctrine's documents
for local development and delivery (the pipeline's
`docs/project-contract.md` names the roles). Ask the user for the goal
only if he did not give it: "build the whole plan; call me when
everything is merged and green." From then on he is not asked anything
until the audit: the builder decides his classes conservatively and
lists them for his veto, and the session unblocks every park that is
not his in person (Step 3).

Prepare the codebase: `feat/<workstream>` cut from `main` and pushed;
the concurrency cap and the critical path from `plan.md` (the cap is
the one measured in `02-plan/recon/machine.md`, with its load);
`03-execution/board.md` with every entry `waiting`, the foundation
first.

**The machine is the session's.** Agents never wait on each other and
never coordinate the machine among themselves. The session holds the
cap by the measured load: before it starts a run, it reads the load
average (`cat /proc/loadavg`); above the median load `machine.md`
measured at the cap, the start waits for the next run to finish.

**The cap does not grow to go faster.** Past the measured cap every run
gets slower and the stage does not: at five runs on a cap measured at
one, the landings' runs took 88 minutes at the median against 35 at
the ingestion's measured cap, the gate 13 minutes against 4.5, and the
agents spent 15 hours waiting on the load. When the user asks for more
in flight, the session shows him this and the measurement and keeps
the cap; a higher cap comes only from a new measurement (the plan's
`machine` scout run again with this workstream's suites) that holds it.

## Step 1 — the foundation

The foundation is an entry like the others, built alone. Prepare its
worktree and run exec-entry for `F` (below). When it returns `ready`,
it goes through the merge queue. Nothing else starts until it is
merged, with one exception: when the foundation's run comes back
without `ready` after its gate went green (parked on a question or on
the round cap), the root entries (no `after`) start on the
foundation's branch at that green head while the foundation goes on,
and take `feat/<workstream>` in by a merge once it merges.

## Step 2 — the fan-out

Every time something merges or comes back `ready`, start every entry
whose `after` entries are merged or `ready`, the critical path first,
up to the cap and under the load. An entry whose one unmerged `after`
entry is `ready` is **stacked**: it starts on that entry's branch and
takes `feat/<workstream>` in by a merge in the queue. With two or more `after`
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
   `agentsDir: ${CLAUDE_SKILL_DIR}/../../agents`, the evidence folder
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

The session does not wait on a run and does not poll: the workflow's
completion wakes it. Every reply while runs are in flight carries the
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
  `video-scribe (Sonnet 5.5, medium)` with the run return
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
goes over its whole diff before the queue: `reviewer (Sonnet 5.5,
high)` with the rules that changed, looking for what the old rule left
behind (never in a generated file). Its findings go through the same
triage: blocking → exec-entry `mode: 'resume'` with them as the fixes
file; nothing blocking → the queue.

## Step 4 — the merge queue

One entry at a time: the critical path first, then in the order they
came back. An amendment that changes a convention the entries in
flight follow (a test convention, a shared helper's behaviour, a
golden path) waits while the critical entry in flight is `ready` or in
its delta, and merges after it; an amendment the critical entry asked
for goes to the front.

1. If `feat/<workstream>` moved since the entry was cut, run exec-entry
   with `mode: 'update'`: the base merged into the entry branch,
   never a rebase (the entry branch is made of merges; a rebase replays
   commits already resolved). A clean merge is verified by the gate
   commands keep-going against the moved base; a conflict is resolved
   by the builder and checked like any other code. Anything but
   `ready` is parked.
2. **The merge needs a green gate.** The return's `gate` is the gate
   commands against the base on the head, in keep-going mode (every
   step runs past a failure): the last gate before `ready`, or the
   update's. The whole gate is not run per entry: it runs once, at the
   end (Step 7), as its number grows with the suites. Every
   `gate.checks[].green` is true; the session reads every check, never
   only the first red; a red check, known or not, sends the entry back
   through exec-entry.
3. Merge the entry branch into `feat/<workstream>` with a merge commit,
   push, remove the entry's worktree.
4. The entry's line in `plan.md`'s Status: date · entry · sha · the
   proof line (the verifier's verdict and its evidence folder).
   `board.md` to `merged`. Start what it unblocked, and triage its
   deferred lines (step 6).

## Step 5 — foundation amendments

An entry that returns `needs-amendment` names the shared file it
needs changed (a migration, the contract, the generated code, the
module registry), or the acceptance check it believes contradicts the
brief or the design. The session writes `amendments/F.<n>.md`: what
changes, why, the design section it follows, and the proof; a change
the design does not already decide is parked for the user instead.
A shared-file amendment runs through exec-entry as entry `F.<n>`, alone
in the queue (in the queue's order above), merges, and is recorded
under "Amendments" in `plan.md`; the entries in flight pick it up at
their update. An acceptance amendment is the entry's own: it restarts
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
   (Opus 5.5, medium)` check it; it opens no new review. It merges
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
1. The whole gate, once, on the top of `feat/<workstream>`: exec-gate
   runs the whole gate command (the only whole run of the stage); then
   the verifier, in prove mode, runs every acceptance check of the
   stage on that top, with video. A red here is a fix entry: brief
   written by the session, run through exec-entry, merged.
2. `explain.md` from [templates/explain.md](templates/explain.md): what
   was built, for the intern.
3. `audit.md` by [references/audit.md](references/audit.md): the
   numbers, the parked, the decisions the builder and the session took
   in the user's place, the choices the builder made where the
   documents were silent, the precision per reviewer, the verifier's
   verdicts, and the learn log's size.
4. **The stage's video**: `video-scribe (Sonnet 5.5, medium)` once
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
7. **PushNotification** to the user: everything merged and green, the
   audit waiting.

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
`entries/*/run-*.json`. An entry `building` with no live run restarts
from its branch with the `acceptance` of its last run: its worktree
exists, and the builder reads what is on disk. Never from memory of a
previous session.

## Boundaries

The session writes no product code and reviews none. No deploy: alpha
and production are stage 5's. No merge of anything that did not come
back `ready`. No edit to an acceptance file outside the verifier's
author mode. No re-decision of the design or the plan: what cannot be
built as planned is an amendment the design already decides, or it is
parked for the user. Frictions worth learning from go to the
workstream's `dreaming-notes.md` on the spot.
