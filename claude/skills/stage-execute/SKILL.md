---
name: stage-execute
description: Stage 4 of the pipeline, under one /goal. The session is the tech lead - it builds the whole plan from the contract commit to his hands-on, every ready entry at once through the exec-entry workflow (builders, the gate, a reviewer and the QAs who try to break it, one fix pass), in its own cloud session when the project has one; it runs the merge queue, settles conflicts, brings the app up for him, builds his adjustments, and ends with the whole gate green on feat/<slug>. Use when a workstream's .state.md says stage execute, or to resume one by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Workflow, AskUserQuestion, Artifact, PushNotification, Monitor, Bash
---

# Stage 4 · Execute

Execute builds what the plan cut, the way the design says, by the
project's standards: every entry built, reviewed by someone who did not
write it, tried and attacked by QA, merged into `feat/<slug>`, then
used by him until he says ok, then proved once more by the whole gate.
The session is the **tech lead**: it writes no product code and reviews
none; it runs the team and owns everything that goes wrong in between,
by [references/tech-lead.md](references/tech-lead.md).

## The bar

The stage is done when every line holds:

1. Every entry of the plan is merged into `feat/<slug>`, or stopped with
   its reason and evidence and already decided by him.
2. Nothing entered `feat` without a green entry gate and a reader who
   did not write it; every AC has a proof that fails if the AC breaks.
3. He used the app on the top of `feat` and said ok.
4. The whole gate is green on the final head (`local-ci` posted) and the
   PR `feat/<slug> → main` is ready.
5. No question reached him that was not his.
6. The report's Explainer is published.

## The flow

```
/stage-execute <slug> → opening: the pre-flight items + the /goal
  1 prepare → 2 C → 3 every ready entry at once
     exec-entry: builders → gate → reviewer ∥ QAs → triage → one fix pass → delta
  → 4 the queue: base in → restamp → affected gate → merge (one at a time)
  → 5 PR draft → his hands-on ◄ him (A.n rounds) → "ok"
  → 6 the whole gate once on the final head (red → X.n → again)
  → 7 report ∥ cleanup → /clear, /stage-release <slug>
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| tech lead | you (Opus 5.5, medium) | `board.md`, the queue, the PR, the release plan |
| build | `builder-backend` ∥ `builder-frontend` (Opus 5.5, medium) | the entry's code and one proof per AC |
| gate | `exec-gate` (Haiku 5.5, medium) | the entry gate once, each red tagged code or machine |
| review | `reviewer` (Opus 5.5, high) | every diff, by the six classes and the security checklist |
| QA | `qa-frontend` · `qa-backend` (Opus 5.5, medium), by the surface the diff touches | the ACs walked by hand, then the break-it lists |
| facts | `scout` (Haiku 5.5, high) | what the session needs to know, quoted |
| report | the Explainer from the template; video and slides only when he asks | the Execute tab |

## What you read

| File | When |
|---|---|
| [references/tech-lead.md](references/tech-lead.md) | at the opening: what you do when anything comes back |
| [references/queue.md](references/queue.md) | before the first merge |
| [references/cloud.md](references/cloud.md) | at the opening, when the project has a cloud environment |
| `<kit>/references/judging.md` | when you rule a finding or a parked entry |

The agents read their own: the builders
[references/builders.md](references/builders.md), the reviewer
[references/review.md](references/review.md), the QAs
[references/qa.md](references/qa.md), and all of them the project's
standards book (`<kit>/skills/standards/references/book.md` says which
file holds what).

## Files

```
<designs-root>/<slug>/
├── .state.md                stage: execute, step, kit, report url
├── 02-plan/                 plan.graph.json · graph.json (start order) · plan.md (you fill Status) · briefs/ · preflight.md
└── 03-execution/
    ├── board.md             one row per entry (template: templates/board.md)
    ├── entries/<id>/        run-<n>.json · beats.jsonl · notes.md · fixes-<n>.json · the QAs' evidence
    └── adjust/<A.n|X.n>.md  the briefs of his adjustments and of the fixes (template: templates/brief-adjust.md)
```

The project's `CLAUDE.md` names the commands (the fast check, the
entry gate, the whole gate, the stack, `make restamp`, the signoff
command), the worktrees root, the gate paths, the standards folder and
whether a cloud environment exists (`<kit>/../docs/project-contract.md`).

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..` is the kit; write
   it in `.state.md` as `kit:`. **Preconditions:** `.state.md` says
   `stage: execute`; `02-plan/` has a green graph and every brief.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open: the
   pulls, who else is working.
3. **The pre-flight.** List only the items he must run himself (from
   `preflight.md`), each with its `!` command. An item still missing
   parks only the entries it blocks.
4. **The goal**, in the same message:

```
/goal Build the whole plan of <slug> with the stage-execute skill, from the contract
commit to my hands-on, asking me only what is mine.
Done when: board.md has every entry merged into feat/<slug>, or stopped with its
reason and evidence and already decided by me; I used the app and said ok through the
question tool; local-ci is green on the head of the PR feat/<slug> → main and the PR is
ready; the release plan is written; the Execute tab is published. Never merge into main.
```

## 1 · Prepare

- `feat/<slug>` from `main`, or `main` merged into it if it exists;
  pushed.
- `board.md` from the template, every node `waiting`, the start order
  from `graph.json`.
- Keep the machine awake while anything is in flight:
  `systemd-inhibit --what=sleep:idle --why="<slug> execute" sleep infinity`
  in the background.

## 2 · The contract commit

C runs alone, through exec-entry with `kind: 'contract'`: one builder,
the gate, the reviewer once (only security blocks), no QA. Its proof:
the fast check green with the stubs, the generator with no diff, the
migrations from empty. It never parks: any stop is resumed until it
merges.

## 3 · The entries

Every time something merges or returns, start **every** node whose
parents are in `feat`, in start order. No cap: a rate limit is waited
out. For each:

1. **The branch** `story/<slug>/<id>` from the top of `feat`, in a
   worktree under the worktrees root (`<root>/<slug>/<id>`), pushed when
   it runs in the cloud.
2. **Run** `<kit>/workflows/exec-entry-workflow.js` by `scriptPath`, in
   the background, or in a cloud session by
   [references/cloud.md](references/cloud.md). The args:

   | Arg | Value |
   |---|---|
   | `mode` · `entry` · `kind` | `build` · the id · `contract` for C, else `entry` |
   | `briefPath` · `sides` | the brief · the node's `sides` |
   | `designDir` · `storiesPath` · `mockDir` | the design, the stories, the locked mock frames (none when no screen changed) |
   | `projectDocs` · `standardsDir` · `packsDir` | the project's `CLAUDE.md` · its standards folder · `<kit>/skills/standards/references/stacks` |
   | `referencesDir` | `${CLAUDE_SKILL_DIR}/references` |
   | `fastCheck` · `gateCommands` · `gatePaths` | from `plan.md` and the project's `CLAUDE.md` |
   | `worktree` · `branch` · `base` | the entry's worktree, its branch, `feat/<slug>` |
   | `evidenceDir` · `priorRuns` · `trailer` | `03-execution/entries/<id>/`, earlier `run-*.json`, the commit trailer |
   | `heartbeat` | `bash ${CLAUDE_SKILL_DIR}/scripts/heartbeat.sh <evidenceDir>` (in the cloud, as `cloud.md` says) |
   | `loadThreshold` | local runs only, `nproc` |
   | `inlineAgents` · `agentsDir` | `true` · `<kit>/agents` |
   | `qa` | omitted (the surface decides), or `'backend'` · `'none'` to force it |
   | `resume` | mode `resume` only: `{head, check: 'whole' \| 'delta', fixesFile, items}` |

3. **Record** on the board: `building`, where, the run.

You do not poll: a local run's end wakes you; cloud runs wake you
through the watcher. Every reply while runs are in flight carries the
board as a table.

## 4 · What comes back, and the queue

Save the return as `entries/<id>/run-<n>.json`; its notes to
`notes.md` (they go in the merge body, never open work); its `decided`
and `outsideOwns` to the board's log. Then act by
[references/tech-lead.md](references/tech-lead.md):

| Status | Next |
|---|---|
| `ready` | the merge queue |
| `interrupted` | `resumeFromRunId` after the reset |
| `parked` (`round-cap`, `gate-red`, `machine`, `inconclusive`, `user`) · `blocked` | the playbook's row for it |

The queue, by [references/queue.md](references/queue.md): one at a
time, the critical path first; base in (a merge, never a rebase),
restamp, the affected gate, merge `--no-ff`, the worktree and stack
removed at once, then start what unblocked. A `main` that moved is
merged into `feat` between two merges.

## 5 · His hands-on

1. **What waits for him first.** Entries parked on something only he
   can decide go in one question per decision. What he says to fix
   becomes an `X.n`.
2. **The PR.** With the queue empty: `feat/<slug> → main` as a draft
   (queue.md).
3. **The app.** In a fresh worktree on the top of `feat`, the stack up
   and the seed loaded. A PushNotification and the same in the
   conversation: the URLs, the test actors, what merged, what stayed out
   and why. Mark the PR ready. If he is busy in another conversation,
   the environment stays up and the notice goes once.
4. **His adjustments.** One answer = one round `A.n`: one brief
   (`templates/brief-adjust.md`) with every adjustment of that answer,
   each with one AC, run with exec-entry `fix` (the reviewer always;
   `qa: 'backend'` when it touches auth, permissions or personal data;
   else `qa: 'none'`). Then the queue, one push, the environment up
   again on the new top.
5. **Meanwhile** write the release plan (`04-release/plan.md`, from the
   release stage's template) from `operations.md`.
6. **The ok.** One question: **"Ok, close it"** · **"I have
   adjustments"**. When the diff touches a gate path, it carries the PR
   link and "approve it on GitHub with your ok". His ok is one line in
   `rulings.md`.

## 6 · The whole gate, once

On his ok, the project's signoff command runs the whole gate on the
final head, in the background (queue.md); with a cloud environment, in
a signoff session with `--record`, posted here with `--post-from`
(cloud.md). It posts `local-ci` only on green. A red is an `X.n` by
queue.md, then the whole gate once more. An `X.n` that changes
something he already used asks "still ok?". The report starts
meanwhile; the stage ends on the green.

## 7 · The report and the close

In parallel:

1. **The report**, as `<kit>/../docs/stage-report.md` describes. The
   Explainer is filled from the template with the runs and the beats:
   the board replayed on a timeline, what ran when, where the time
   went. Ask the close's question (also make: Video · Deck) and
   dispatch what he picks: `video-builder` (Sonnet 5.5, high) what was
   built, the real screens captured from his hands-on environment;
   `slides-builder` (Sonnet 5.5, medium) per entry ACs → proofs, the
   findings, the A.n, what stayed out and why. `gitleaks dir
   <workstream>`, then publish labelled "execute closed".
2. **Telemetry**: `node <kit>/scripts/telemetry.mjs <slug> --stage
   execute --ws <workstream> --out -`.
3. **Cleanup**: every entry worktree and its stack down, the hands-on
   environment down after the video's capture, local and remote
   `story/<slug>/*` and `evidence/<slug>/*` (their evidence is already
   copied), the `systemd-inhibit` process.

Then `.state.md` → `stage: release`, this workstream's line in
`_coordination.md`, commit the workstream folder, and one message: the
link · the board in one table · decided in your place · the next play:

```
/clear
/stage-release <slug>
```

## Resuming

`/stage-execute <slug>`: the opening's steps 1–2, then `.state.md`,
`board.md`, `plan.md` Status and the `run-*.json`. An entry `building`
locally with no live run resumes from its branch (`mode: 'resume'`,
`resume: {head, check: 'whole'}`). A cloud entry: read its evidence
branch first, then restart the watcher.

What stays with you: no product code, no review, no merge into `main`,
no status posted except by the signoff command. Nothing merges that did
not come back `ready` and pass the queue's affected gate. A node that
cannot be built as designed parks with the quote, and he decides.
