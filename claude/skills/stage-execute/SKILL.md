---
name: stage-execute
description: Conducts stage 4 (Execute) — turns an approved plan into merged, reviewed code on the feature branch with nobody in the loop until the end. One session (Opus 5.5, high) receives one goal, "build the whole plan", and orchestrates without writing code: the foundation first, then every entry whose edges are merged or ready, critical path first, in parallel up to the measured cap, each through the exec-entry workflow — builder-backend ∥ builder-frontend (Opus 5.5, high) in their own worktrees, each checking its own work before it returns; the mechanical gate (exec-gate Sonnet 5.5 medium: the fast check and the affected tests per round, before ready and at the merge queue; the whole gate once, at the end of the stage); a panel of lenses (Opus 5.5 medium; fidelity and visual Sonnet 5.5 high) and QA (Opus 5.5, high) that never wrote the code, seated by the surface the diff touches; a judge (Opus 5.5, medium) that rules on its own under the goal; fixes back ∥ front and a verification of the delta with a QA replay (Sonnet 5.5, medium), two rounds at most. The session merges what comes back ready through a serial queue (rebase, the affected gate, merge), runs foundation amendments, builds the deferred rulings in parallel finishing slices, reads the whole branch once for maintainability, parks what is the user's, and calls him once, when everything is merged and green, for the audit. Use when a workstream's .state.md says stage execute, or to resume an execution in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, PushNotification, Bash
---

# Stage 4: Execute

An approved plan comes in: the foundation, the entries, their edges,
the cap, a brief per entry. Merged code comes out on `feat/<workstream>`:
every entry built, gated, reviewed and judged, the whole gate green on
the top of the branch, and an audit of what was decided in the user's
place. Alpha and production are stage 5's.

**No code enters without review.** Every commit that reaches an entry
branch passes the mechanical gate and a panel that never wrote it,
judged by an agent that did not write it either: the entry's build,
every fix, every conflict resolution, every foundation amendment. The
session never merges anything that did not come back `ready` from the
exec-entry workflow.

The session is the orchestrator, **Opus 5.5 at high effort**. It does
not write product code and does not review it: it prepares the
worktrees, starts the pipelines, merges, amends the plan, and keeps the
record. The user gave one goal and left; the session calls him once,
at the end.

## The pipeline of one entry

```
exec-entry (one workflow run per entry, in its own worktree and stack)
  build   builder-backend ∥ builder-frontend (Opus 5.5, high), each in its side worktree;
          each ends on the doctrine's fast check + affected tests and its self-check
  gate    exec-gate (Sonnet 5.5, medium): merge the sides, stack up, the fast check + the
          affected tests (the whole gate when the doctrine names no affected tests)
          red → the failing sides fix, back ∥ front → gate again (3 tries, then parked)
  panel   round 1, whole — in parallel, every reviewer with the rulings of the entry's
          earlier rounds and runs; seated by the surface the gate read from the diff's
          paths (api: the server's product code · screen · runtime: infra, deploy, config):
            fidelity · workaround · proof (one per side) · security — always
            · operations (api or runtime) · visual (screen)
            · craft (the foundation's first reading only)
              — Opus 5.5, medium; fidelity and visual Sonnet 5.5, high
            + qa-backend (api) · qa-frontend (screen) · qa-abuse (api or screen),
              each with its checklist and a coverage line per category — Opus 5.5, high
          a diff of tests, tooling, build files or docs only seats no QA
          lean panel: the same without operations
  judge   exec-judge (Opus 5.5, medium) rules every finding and every QA unsettled
          observation; autonomous under the goal: what the documents leave silent it decides
          and lists in `decided`; sustained · deferred · latitude · dismissed ·
          session (a recurrence, a shared file) · user (the bar, money, outside the repo,
          irreversible, the security posture)
  fix     builder-backend ∥ builder-frontend apply what was sustained (in series only where
          the judge marked one `after` the other) → gate → the delta → judge
  delta   a verification, not a new review: did each fix land, did it break what it
          touched, and only what the ruler never defers beyond that;
          fidelity · workaround · proof of the sides the fixes touched, always;
          security when a fix touches scope, a log, a credential, a person's data or
          evidence; visual when a fix changes a screen; operations (full panel) when it had
          a finding sustained the round before; exec-qa-replay (Sonnet 5.5, medium) replays the QA's saved
          scripts + each fix's case for the sides the fixes touched whose QA ran; never
          craft, never an exploring QA
          … until nothing is sustained, a question is someone's (parked, needs-session),
          or two panel rounds pass with something still sustained (parked)
  ready   the fast check and the affected tests against the base, keep-going (the whole
          gate runs once, at the end of the stage); then the record: the evidence of the head
          written, swept for tokens and redacted, the feature map's pointers checked — a red
          there is fixed and reviewed as a delta round → ready
```

The ruler the judge applies is [references/judging.md](references/judging.md).

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the session | Opus 5.5, high | worktrees, pipelines, the machine's load, the merge queue, amendments, the finishing slices, the record, the audit |
| `builder-backend` | Opus 5.5, high | the server side of one entry, in the doctrine's stack, tests first; checks its own work before it returns |
| `builder-frontend` | Opus 5.5, high | the screen side of one entry, in the doctrine's stack, journeys first; checks its own work before it returns |
| `exec-gate` | Sonnet 5.5, medium | merges, rebases, runs the fast check + affected tests per round, before ready and at the queue, and the whole gate once at the end of the stage, attributes every red to a side, reads the surface the diff touches, writes and sweeps the evidence of the head |
| `exec-lens-{workaround, proof, security, operations}` | Opus 5.5, medium | angles over the diff; proof one per side; operations not in a lean panel |
| `exec-lens-{fidelity, visual}` | Sonnet 5.5, high | the diff against the brief and its contracts; the screenshots against the artboards, only with a front |
| `exec-lens-craft` | Opus 5.5, medium | the foundation's first read, and the maintainability read of the whole branch once per stage |
| `exec-qa-backend` · `exec-qa-frontend` | Opus 5.5, high | use the running stack and try to break it, by the adversarial checklist, with the coverage reported; seated when the diff touches the server's product code or a screen |
| `exec-qa-abuse` | Opus 5.5, high | black box over the API and the screens of every entry whose diff touches either, abuse only: another actor's ids, tokens, injection, rate, a person's data in logs and e-mails, races on the check |
| `exec-qa-replay` | Sonnet 5.5, medium | in a delta round, replays the scripts the QA saved plus the fix's case |
| `exec-judge` | Opus 5.5, medium | rules every finding of a round, the QA's unsettled observations included; decides the documents' silence on its own under the goal |

## Preconditions

`.state.md` says `stage: execute`; `02-plan/plan.md` is approved with a
brief per entry in `02-plan/briefs/`; the pre-flight is handed. The
consuming project's `CLAUDE.md` names the codebase root and its
engineering doctrine. Missing: halt, back to stage 3.

```
designs-root/<workstream>/
├── .state.md                  # stage: execute
├── 02-plan/plan.md            # the Status column and the Amendments are this stage's to fill
└── 03-execution/
    ├── board.md               # one line per entry: state, sha, rounds, the run id — the session's file
    ├── parked.md              # what waits for the user, with the evidence
    ├── deferred.md            # every deferred ruling, by entry, with its state — the finishing slices' list
    ├── amendments/F.<n>.md    # the brief of each foundation amendment
    ├── entries/<id>/          # per entry: run-<n>.json (each run's return, never overwritten), gate output, screenshots, the QA's scripts
    ├── explain.md             # at the end: what was built, for the intern
    └── audit.md               # at the end: what was decided in the user's place
```

## Step 0 — open

If the session is not on **Opus 5.5 at high effort**, ask the user to
switch (`/model`) and wait. Then read `plan.md`, every brief, the
recon, and the engineering doctrine's documents for local development and
delivery (the pipeline's `docs/project-contract.md` names the roles).
Ask the user for the goal only if he did not give it: "build the whole
plan; call me when everything is merged and green." From then on he is
not asked anything until the audit.

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
worktrees and run exec-entry for `F` (below). When it returns `ready`,
it goes through the merge queue. Nothing else starts until it is
merged, with one exception: when the foundation's run comes back
without `ready` after its gate went green (parked on a question or on
the round cap), the root entries (no `after`) start on the
foundation's branch at that green head while the foundation goes on,
and rebase on `feat/<workstream>` once it merges.

## Step 2 — the fan-out

Every time something merges or comes back `ready`, start every entry
whose `after` entries are merged or `ready`, the critical path first,
up to the cap and under the load. An entry whose one unmerged `after`
entry is `ready` is **stacked**: it starts on that entry's branch and
rebases on `feat/<workstream>` in the queue. With two or more `after`
entries still unmerged, it waits until at most one is left. If the
entry under a stacked one parks at the queue, the stacked one waits
for it. For each:

1. **Worktrees.** From the top of `feat/<workstream>` (or of the
   branch it stacks on): the entry worktree on
   `story/<workstream>/<id>`, and one side worktree per side the
   brief's paths touch (`story/<workstream>/<id>-back`, `…-front`),
   all under the codebase's `.worktrees/`. **The sides come from the
   brief's paths** — its Builds and Touches, mapped to the doctrine's
   server-side and screen-side folders — never from memory: a brief
   that touches one file of a side has that side.
2. **The panel's size.** As the pre-flight decided it in `plan.md`
   when it did; otherwise `panel: 'full'` for the foundation and for an
   entry that opens a new area of the product (a new page, a new
   module); `panel: 'lean'` (no operations lens) for a slice on top of
   what exists (a route or two and their dialogs or commands), and for
   every amendment.
3. **Run** the workflow by `scriptPath`, in the background:
   `${CLAUDE_SKILL_DIR}/../../workflows/exec-entry.js` with `mode:
   'build'`, the entry id, the brief, the design, recon and doctrine
   folders, `rulings.md`, the ruler
   (`${CLAUDE_SKILL_DIR}/references/judging.md`), `agentsDir:
   ${CLAUDE_SKILL_DIR}/../../agents` (the lenses' definitions the
   builders' self-check reads), the evidence folder
   `03-execution/entries/<id>/`, the worktrees and branches, the base
   (`feat/<workstream>`, or the branch it stacks on), `autonomous:
   true` (the user gave the goal and left: the judge rules the
   documents' silence itself and lists it in `decided` for the audit),
   `priorRuns` (the paths of the entry's earlier `run-<n>.json`, so no
   reviewer reports again what was ruled), and the commit trailer.
   Every later run of the entry (`resume`, `rebase`) gets the same
   arguments, with `priorRuns` grown by one.
4. **Record** the run id and `building` in `board.md`.

The session does not wait on a run and does not poll: the workflow's
completion wakes it. Every reply while runs are in flight carries the
board as a table (entry · state · round · run), read from the harness.

## Step 3 — what comes back

Save the return as `entries/<id>/run-<n>.json`, one file per run,
never overwritten. Append its `deferred` rulings to `deferred.md`
(entry · round · side · fix · state `open`); a line with side `none`
is an open record item (evidence, a feature-map pointer) that the
gate could not close. Its `decided` goes to the audit. Then act on
`status`:

- **`ready`** → the merge queue, after the coherence pass when it is
  due (below).
- **`needs-amendment`** → step 5; the entry waits for it and restarts
  from its branch.
- **`needs-session`** → the questions with `to: 'session'` (a
  recurrence, a fix that needs a shared file), each with the judge's
  recommended option, are the session's (below); no question goes to
  the user.
- **`parked`** → the questions with `to: 'user'` (the bar, money,
  outside the repo, irreversible, the security posture), the gate that
  stayed red, or the findings still sustained after two rounds: one
  line in `parked.md` with the evidence; the entries that depend on it
  wait; everything else goes on. Questions with `to: 'session'` in the
  same return are answered by the session now, so the user's answer is
  the only thing the entry waits for.

Once every question of the run is answered in `rulings.md`, or for the
round cap, the entry continues with exec-entry `mode: 'resume'`
(`resume: { rulingsFile, round, head, after }`: the parked run's saved
return, its last round, its head, and `after` — the side whose rulings
land first — when that round's rulings marked one `after` the other):
the builders apply its sustained rulings and the panel reads only the
delta — never a new build and a whole review for an entry that was
already reviewed.

**The session's answers.** A question with `to: 'session'` is ruled by
the judge's ruler, `judging.md`: what the ruler never defers the
session does not defer either. The answer uses only behavior already
merged on `feat/<workstream>`: before writing it, check the plan's
edges; an answer that leans on an entry not merged is not an answer.
It goes to `rulings.md` (`ruled: session`). The resume applies only
what is `sustained` in its rulings file, so an answer that asks for a
fix goes into that file as a sustained ruling of its side (a copy of
the run's return with the answer written in). A fix that needs a
shared file goes through step 5 first, then the entry resumes.

**The coherence pass.** When an entry comes back `ready` after more
than one run, or a rule changed while it was in flight (a ruling in
`rulings.md`, a line of the doctrine), one reader goes over its whole
diff before the queue: `exec-lens-fidelity` (Sonnet 5.5, high) with the
rulings that changed, looking for what the old rule left behind
(never in a generated file); `exec-judge` (Opus 5.5, medium) rules its
findings by the same ruler. Sustained → exec-entry `mode: 'resume'`
with the judge's return as its rulings file; nothing sustained → the
queue.

## Step 4 — the merge queue

One entry at a time: the critical path first, then in the order they
came back. An amendment that changes a convention the entries in
flight follow (a test convention, a shared helper's behavior) waits
while the critical entry in flight is `ready` or in its last round,
and merges after it; an amendment the critical entry asked for goes
to the front.

1. If `feat/<workstream>` moved since the entry was cut, run exec-entry
   with `mode: 'rebase'`. A clean rebase is verified by the fast check and
   the affected tests against the moved base;
   a conflict is resolved by the builders and reviewed by the panel
   like any other code. Anything but `ready` is parked.
2. **The merge needs a green gate.** The return's `gate` is the fast
   check and the affected tests against the base on the head, in
   keep-going mode (every step runs past a failure): the last gate
   before `ready`, or the rebase's. The whole gate is not run per entry:
   it runs once, at the end (Step 7), as its number grows with the
   suites. Every
   `gate.checks[].green` is true; the session reads every check, never
   only the first red; a red check, known or not, sends the entry back
   through exec-entry.
3. Merge the entry branch into `feat/<workstream>` with a merge commit,
   push, remove the entry's worktrees.
4. The entry's line in `plan.md`'s Status: date · entry · sha · the
   proof line. `board.md` to `merged`. Start what it unblocked, and
   the finishing slice it opened (step 6).

## Step 5 — foundation amendments

An entry that returns `needs-amendment` names the shared file it
needs changed (a migration, the contract, the generated code, the
module registry). The session writes `amendments/F.<n>.md`: what
changes, why, the design section it follows, and the proof; a change
the design does not already decide is parked for the user instead.
The amendment runs through exec-entry as entry `F.<n>`, alone in the
queue (in the queue's order above), merges, and is recorded under
"Amendments" in `plan.md`. The entries in flight pick it up at their
rebase. A deferred ruling whose fix touches a shared file becomes an
amendment the same way, at its triage (step 6), never an edit inside a
finishing slice.

## Step 6 — the finishing slices

Every deferred ruling is this execution's, and it is built in this
execution: nothing is left as backlog for another workstream. The
finishing entry is cut into slices, each a fix entry `X.<n>`, and started early, never run
as one tail at the end:

1. **Triage** as each entry merges: its open lines in `deferred.md`
   that touch a shared file go to step 5 as an amendment; the rest go
   to a slice by module and side (one slice per module of the back, one
   for the front), each line marked with its slice. A line
   with side `none` (an open record item) goes to its module's slice
   as a record item for the slice's gate, never to a builder.
2. **Start** a slice when the cap and the load free a place and no
   entry of the critical path is waiting for one: the session writes
   its brief from its lines (each with its entry, its round and its
   fix), and runs it through exec-entry from the top of
   `feat/<workstream>`, over entries already merged only, like any
   other code; it merges through the queue.
3. **Close** each line in `deferred.md`: `done` with the slice and its
   sha, or `skipped` with the reason (the code moved and the ruling no
   longer applies, the fix is already there). A slice's own deferred
   rulings go to the audit, not to another slice.

When the last entry merges, the lines still open become the last
slices; the stage does not end with a line `open`.

## Step 7 — the end

When every entry and every finishing slice is merged or parked:

0. **The maintainability read**, once per stage, before the audit:
   `exec-lens-craft` (Opus 5.5, medium), which built none of it, reads
   the whole diff of `feat/<workstream>` against `main` and reports
   what a developer new to the codebase would find strange and what is
   built beyond what the design asks for. `exec-judge` (Opus 5.5,
   medium) rules its findings by the same ruler; the sustained ones
   become one correction entry `X.<n>`, brief written by the session,
   run through exec-entry and merged like any other.
1. The whole gate, once, on the top of `feat/<workstream>`: exec-gate
   runs the whole gate command (the only whole run of the stage), and the visual lens reads every screenshot
   of the run together, for the coherence of the screens as one
   product. A red here is a fix entry: brief written by the session,
   run through exec-entry, merged.
2. `explain.md` from [templates/explain.md](templates/explain.md): what
   was built, for the intern.
3. `audit.md` by [references/audit.md](references/audit.md): the
   numbers, the parked, the decisions the judge and the session took
   in the user's place, the choices the builders made where the
   documents were silent, the latitude the judge granted, the
   precision per lens, and the QA's numbers.
4. `blueprint/execution/execution.json` (schema:
   `${CLAUDE_SKILL_DIR}/../../blueprint/schema/execution.md`, "Graph
   plans"): the entries with their state and numbers, the amendments,
   the precision per reviewer, the plain report and the audit items
   with `ruling: null`. Build with
   `node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>`
   and publish.
5. **PushNotification** to the user: everything merged and green, the
   audit waiting.

## Step 8 — the audit

The user reads the audit and the blueprint, and rules the parked items
and anything he wants changed. Each ruling is written next to its item
in `audit.md`, in `execution.json` and in `rulings.md`. A change becomes
a fix entry (`X.<n>`) through exec-entry, like any other code. When he approves: `.state.md` to
`stage: release`, the close commit of the workstream folder, and
suggest `/clear` before stage 5.

## How to write

Say what you mean. Literal sentences, concrete values. Every reply
while pipelines run carries the board. A status table is read from the
harness, never assumed. Every agent named carries its model and effort.

## Resuming

Everything is in files. Read `.state.md`, `board.md`, `parked.md`,
`deferred.md`, `plan.md`'s Status and Amendments, and
`entries/*/run-*.json`. An entry
`building` with no live run restarts from its branch: its worktrees
exist, and the workflow's build reads what is on disk. Never from
memory of a previous session.

## Boundaries

The session writes no product code and reviews none. No deploy: alpha
and production are stage 5's. No merge of anything that did not come
back `ready`. No re-decision of the design or the plan: what cannot be
built as planned is an amendment the design already decides, or it is
parked for the user. Frictions worth learning from go to the
workstream's `dreaming-notes.md` on the spot.
