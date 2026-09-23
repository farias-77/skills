---
name: stage-execute
description: Conducts stage 4 (Execute) — turns an approved plan into merged, reviewed code on the feature branch with nobody in the loop until the end. One session (Opus 5.5, high) receives one goal, "build the whole plan", and orchestrates without writing code: the foundation first, then every entry whose edges are merged, in parallel up to the plan's cap, each through the exec-entry workflow — builder-backend ∥ builder-frontend (Opus 5.5, high) in their own worktrees, the mechanical gate (the project's gate command, exec-gate Sonnet 5 high), a panel of seven lenses and two QA (Opus 5.5, medium) that never wrote the code, a judge (Opus 5.5, medium), fixes and a review of the delta, three rounds at most. The session merges what comes back ready through a serial queue (rebase, gate, merge), runs foundation amendments, parks what is the user's, and calls him once, when everything is merged and green, for the audit. Use when a workstream's .state.md says stage execute, or to resume an execution in progress.
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
  build   builder-backend ∥ builder-frontend (Opus 5.5, high), each in its side worktree
  gate    exec-gate (Sonnet 5, high): merge the sides, stack up, the gate command
          red → the failing side fixes → gate again (3 tries, then parked)
  panel   fidelity · workaround · craft · proof · security · operations · visual (front only)
          + qa-backend · qa-frontend (per side)            — all Opus 5.5, medium, in parallel
  judge   exec-judge (Opus 5.5, medium): sustained · deferred · latitude · dismissed · user
  fix     the builders apply what was sustained → gate → the panel reads only the delta → judge
          … until nothing is sustained (ready), a question is the user's (parked),
          or three panel rounds pass with something still sustained (parked)
```

The ruler the judge applies is [references/judging.md](references/judging.md).

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the session | Opus 5.5, high | worktrees, pipelines, the merge queue, amendments, the record, the audit |
| `builder-backend` | Opus 5.5, high | the server side of one entry, in the doctrine's stack, tests first |
| `builder-frontend` | Opus 5.5, high | the screen side of one entry, in the doctrine's stack, journeys first |
| `exec-gate` | Sonnet 5, high | merges, rebases, runs the gate command, attributes every red to a side |
| `exec-lens-{fidelity, workaround, craft, proof, security, operations, visual}` | Opus 5.5, medium | seven angles over the diff; visual only with a front |
| `exec-qa-backend` · `exec-qa-frontend` | Opus 5.5, medium | use the running stack and try to break it |
| `exec-judge` | Opus 5.5, medium | rules every finding of a round |

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
    ├── amendments/F.<n>.md    # the brief of each foundation amendment
    ├── entries/<id>/          # per entry: run.json (the workflow's return), gate output, screenshots
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
the concurrency cap from `plan.md`; `03-execution/board.md` with every
entry `waiting`, the foundation first.

## Step 1 — the foundation

The foundation is an entry like the others, built alone. Prepare its
worktrees and run exec-entry for `F` (below). When it returns `ready`,
it goes through the merge queue. Nothing else starts until it is
merged.

## Step 2 — the fan-out

Every time something merges, start every entry whose `after` entries
are merged, up to the cap. For each:

1. **Worktrees.** From the top of `feat/<workstream>`: the entry
   worktree on `story/<workstream>/<id>`, and one side worktree per
   side the brief builds (`story/<workstream>/<id>-back`,
   `…-front`), all under the codebase's `.worktrees/`.
2. **Run** the workflow by `scriptPath`, in the background:
   `${CLAUDE_SKILL_DIR}/../../workflows/exec-entry.js` with `mode:
   'build'`, the entry id, the brief, the design, recon and doctrine
   folders, `rulings.md`, the ruler
   (`${CLAUDE_SKILL_DIR}/references/judging.md`), the evidence folder
   `03-execution/entries/<id>/`, the worktrees and branches, the base
   `feat/<workstream>`, and the commit trailer.
3. **Record** the run id and `building` in `board.md`.

The session does not wait on a run and does not poll: the workflow's
completion wakes it. Every reply while runs are in flight carries the
board as a table (entry · state · round · run), read from the harness.

## Step 3 — what comes back

Save the return as `entries/<id>/run.json`, then act on `status`:

- **`ready`** → the merge queue.
- **`needs-amendment`** → step 5; the entry waits for it and restarts
  from its branch.
- **`parked`** → one line in `parked.md` with the evidence (the
  question the judge raised with its options, the gate that stayed
  red, the findings still sustained after three rounds); the entries
  that depend on it wait; everything else goes on.

## Step 4 — the merge queue

One entry at a time, in the order they came back:

1. If `feat/<workstream>` moved since the entry was cut, run exec-entry
   with `mode: 'rebase'`. A clean rebase is verified by the gate; a
   conflict is resolved by the builders and reviewed by the panel like
   any other code. Anything but `ready` is parked.
2. Merge the entry branch into `feat/<workstream>` with a merge commit,
   push, remove the entry's worktrees.
3. The entry's line in `plan.md`'s Status: date · entry · sha · the
   proof line. `board.md` to `merged`. Start what it unblocked.

## Step 5 — foundation amendments

An entry that returns `needs-amendment` names the shared file it
needs changed (a migration, the contract, the generated code, the
module registry). The session writes `amendments/F.<n>.md`: what
changes, why, the design section it follows, and the proof; a change
the design does not already decide is parked for the user instead.
The amendment runs through exec-entry as entry `F.<n>`, alone in the
queue, merges, and is recorded under "Amendments" in `plan.md`. The
entries in flight pick it up at their rebase.

## Step 6 — the end

When every entry is merged or parked:

1. The gate on the top of `feat/<workstream>`: exec-gate runs the gate
   command once more, whole, and the visual lens reads every screenshot
   of the run together, for the coherence of the screens as one
   product. A red here is a fix entry: brief written by the session,
   run through exec-entry, merged.
2. `explain.md` from [templates/explain.md](templates/explain.md): what
   was built, for the intern.
3. `audit.md` by [references/audit.md](references/audit.md): the
   numbers, the parked, the choices the builders made where the
   documents were silent, the latitude the judge granted, the
   precision per lens.
4. `blueprint/execution/execution.json` (schema:
   `${CLAUDE_SKILL_DIR}/../../blueprint/schema/execution.md`, "Graph
   plans"): the entries with their state and numbers, the amendments,
   the precision per reviewer, the plain report and the audit items
   with `ruling: null`. Build with
   `node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>`
   and publish.
5. **PushNotification** to the user: everything merged and green, the
   audit waiting.

## Step 7 — the audit

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
`plan.md`'s Status and Amendments, and `entries/*/run.json`. An entry
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
