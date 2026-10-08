---
name: stage-execute
description: Conducts stage 4 (Execute) as the tech lead, under one /goal - builds the whole plan from the contract commit to the user's hands-on. Every ready entry runs through the exec-entry workflow (builder-backend ∥ builder-frontend → exec-gate → reviewer ∥ the QAs the surface calls for → one fix pass → the delta), in its own cloud session when the project has one; the session orchestrates the graph, the merge queue and the migration order, settles overlaps and conflicts, coordinates with other workstreams by message, runs the whole gate as local CI (the local-ci status), opens the PR to main, brings the app up for his hands-on, builds his adjustments as A.n rounds, and closes on his ok with its report (Video, Deck, Explainer). Use when a workstream's .state.md says stage execute, or to resume one in progress.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, PushNotification, Monitor, Bash
---

# Stage 4 · Execute

A closed plan comes in: the graph, a brief per node, the pre-flight. A
finished `feat/<slug>` comes out, with the PR to `main` ready, local CI
green on its head, and his "ok" after using the app.

The session is the **tech lead** (Opus 5.5, high). It writes no product
code and reviews none. It runs the team and owns everything that goes
wrong in between: [references/tech-lead.md](references/tech-lead.md) is
its playbook.

## The bar

1. From the goal to his hands-on, no question that is not his.
2. Nothing enters `feat/<slug>` without a green gate and a reader who
   did not write it.
3. No entry parks in silence: the tech lead resolves it; only what is
   his waits for him.
4. The entry gate stays under 5 minutes; the whole gate runs once, as
   local CI on the final head of `feat`, after his ok.
5. It closes on his "ok".

## The flow

```
open ──► prepare (feat, board, keep the machine awake) ──► C ──► every ready entry at once
           exec-entry: builders → gate → reviewer ∥ QAs → triage → one fix → delta
     ──► the queue: base in → restamp → affected gate → merge → worktree and stack gone
     ──► PR draft ──► his hands-on (A.n rounds) ──► "ok" ──► local-ci once on the final head (red → X.n → again)
     ──► report ∥ cleanup ──► the message: the link + /clear + /stage-release <slug>
```

## The team

| Who | Model, effort | Does |
|---|---|---|
| the session, the tech lead | Opus 5.5, high | the graph, the runs, the queue, the migrations, overlaps and conflicts, local CI, the PR, his hands-on, the report |
| `builder-backend` | Opus 5.5, medium | the entry's server side, its proofs, one try on the stack |
| `builder-frontend` | Opus 5.5, medium | the entry's screens, with taste, its proofs, one try on the stack |
| `exec-gate` | Sonnet 5.5, low | the entry gate once; each red code or machine; a test outside the diff run again once |
| `reviewer` | Opus 5.5, high | every diff: the six classes and the security checklist |
| `qa-frontend` | Opus 5.5, medium | uses the screens and tries to break them, when screen behaviour changed |
| `qa-backend` | Opus 5.5, medium | calls the API as client and attacker, when API, data or permissions changed |
| `scout` | Haiku 5.5, medium | finds and quotes what the session needs to know |
| `video-builder` | Sonnet 5.5, high | the report's Video |
| `slides-builder` | Sonnet 5.5, medium | the report's Deck |

The builders read [builders.md](references/builders.md) with
[backend.md](references/backend.md) or
[frontend.md](references/frontend.md); the reviewer reads
[review.md](references/review.md); the QAs read [qa.md](references/qa.md).

## Inputs and outputs

```
<designs-root>/<slug>/
├── .state.md                   stage: execute
├── 00-discovery/ · 01-design/  read by the agents
├── 02-plan/                    plan.graph.json · graph.json (start order) · plan.md (Status is filled here) · briefs/ · preflight.md
└── 03-execution/
    ├── board.md                one row per entry (templates/board.md)
    ├── entries/<id>/           run-<n>.json · beats.jsonl · notes.md · fixes-<n>.json · the QAs' evidence
    └── adjust/<A.n|X.n>.md     the briefs of his adjustments and of the fixes
```

The product's `CLAUDE.md` names: the fast check, the entry gate
(`make check`, `make test-affected base=…`), the whole gate (`make
verify`), the stack up and down, `make restamp`, the worktrees root,
the code-owner paths, the signoff command, and whether a cloud
environment exists (the bar, `docs/project-contract.md`).

## Open

1. **The house rules.** Read the file that
   `realpath ${CLAUDE_SKILL_DIR}/../../../CLAUDE.md` prints and run its
   Open: the canary (in the product repo).
2. The pre-flight was checked at plan. List only the items he must run
   himself (from `preflight.md`), each with its `!` command. An item
   still missing parks only the entries it blocks.
3. Hand him the goal, filled in, in the same message:

```
/goal Build the whole plan of <slug> with the stage-execute skill, from the contract
commit to my hands-on, asking me only what is mine.
Done when: board.md has every entry merged into feat/<slug>, or stopped with its
reason and evidence and already decided by me; local-ci is green on the head of the
PR feat/<slug> → main and the PR is ready; the app was up for my hands-on and I said
ok through the question tool; the release plan is written; the execute report is
published. Never merge into main. Never loosen this done to call it met; stop early only
when truly stuck (two fixes on one premise failed at the same gate), with why in board.md.
```

## 1 · Prepare

- `feat/<slug>` from `main`, or merge `main` into it if it exists;
  pushed.
- `board.md` from the template, every node `waiting`, the start order
  from `graph.json`.
- Keep the machine awake while anything is in flight:
  `systemd-inhibit --what=sleep:idle --why="<slug> execute" sleep infinity`
  in the background.
- Read `_coordination.md` (by scout): the other workstreams in execute and
  their session names.

## 2 · The contract commit

C runs alone, through exec-entry with `kind: 'contract'`: one builder,
the gate, the reviewer once (only security blocks), no QA. Its proof:
the fast check green with the stubs, the generator with no diff, the
migrations from empty. It never parks: any stop is resumed until it
merges.

## 3 · The entries

Every time something merges or returns, start **every** node whose
parents are in `feat`, in start order. No cap: a rate limit is waited
out (tech-lead.md). For each:

1. **The branch** `story/<slug>/<id>` from the top of `feat`, in a
   worktree under the product's worktrees root
   (`<root>/<slug>/<id>`), pushed when it runs in the cloud.
2. **Run** exec-entry by `scriptPath`
   (`${CLAUDE_SKILL_DIR}/../../workflows/exec-entry-workflow.js`), in
   the background, or in a cloud session by
   [references/cloud.md](references/cloud.md). The args:

   | Arg | Value |
   |---|---|
   | `mode` · `entry` · `kind` | `build` · the id · `contract` for C, else `entry` |
   | `briefPath` · `sides` | the brief · the node's `sides` |
   | `designDir` · `storiesPath` · `mockDir` | the design, the stories, the locked mock frames |
   | `projectDocs` · `referencesDir` | the product's `CLAUDE.md` · `${CLAUDE_SKILL_DIR}/references` |
   | `fastCheck` · `gateCommands` · `gatePaths` | from `plan.md` and the product's `CLAUDE.md` (gate paths = the code-owner paths) |
   | `worktree` · `branch` · `base` | the entry's worktree, its branch, `feat/<slug>` |
   | `evidenceDir` · `priorRuns` · `trailer` | `03-execution/entries/<id>/`, earlier `run-*.json`, the commit trailer |
   | `heartbeat` | always: `bash ${CLAUDE_SKILL_DIR}/scripts/heartbeat.sh <evidenceDir>` (in the cloud, `HEARTBEAT_PUSH=1` and its copy under `input/pipeline/`, `cloud.md`) |
   | `loadThreshold` | local runs only, `nproc` |
   | `inlineAgents` · `agentsDir` | while the agents are not installed |
   | `qa` | omitted (the surface decides), or `'backend'` · `'none'` to force it |
   | `resume` | mode `resume` only: `{head, check: 'whole' \| 'delta', fixesFile, items}`; `check` is read only inside it |

3. **Record** on the board: `building`, where, the run.

The session does not poll: a local run's end wakes it; cloud runs wake
it through the watcher. Every reply while runs are in flight carries the
board as a table.

## 4 · What comes back

Save the return as `entries/<id>/run-<n>.json`; its notes to
`notes.md` (they go in the merge body, never open work); its `decided`
and `outsideOwns` to the board's log. Then act by
[tech-lead.md](references/tech-lead.md):

| Status | Next |
|---|---|
| `ready` | the merge queue |
| `interrupted` | `resumeFromRunId` after the reset |
| `parked` (`round-cap`, `gate-red`, `machine`, `inconclusive`, `user`) · `blocked` | the playbook's row for it |

## 5 · The merge queue

By [references/queue.md](references/queue.md): one at a time, the
critical path first; base in (merge, never rebase), restamp, the affected gate,
merge `--no-ff`, the worktree and stack removed at once, then start what
unblocked. Between two merges, a `main` that moved (another workstream, a
hotfix) is merged into `feat`.

## 6 · The end: PR, local CI, his hands-on

1. **What waits for him first.** Entries parked on something only he
   can decide go in one question per decision. What he says to fix
   becomes an `X.n` now.
2. **The PR.** With the queue empty: the PR `feat/<slug> → main` as a
   draft (queue.md). Until his ok, every push is checked by the
   affected gate only; the whole gate waits for the end.
3. **His hands-on.** In a fresh worktree on the top of `feat`, the
   stack up and the seed loaded. A PushNotification and the same in the
   conversation: the URLs, the test actors, what merged, what stayed out
   and why. Mark the PR ready. If he is busy in another conversation,
   the environment stays up and the notice goes once.
4. **His adjustments** come back as one answer. One answer = one round
   `A.n`: one brief (`templates/brief-adjust.md`) with every adjustment
   of that answer, each with one AC, run with exec-entry `fix` (the
   reviewer always; `qa: 'backend'` when it touches auth, permissions or
   personal data; else `qa: 'none'`). Then the queue (the affected gate), one push, the
   environment up again on the new top.
5. **Local CI red** → `X.n` by queue.md. An `X.n` that changes something
   he already used asks "still ok?"; the others do not call him.
6. **Meanwhile** the tech lead writes the release plan
   (`04-release/plan.md`, by the release stage's template) from
   `operations.md`.
7. **The ok.** One question, through the question tool: **"Ok, close
   it"** · **"I have adjustments"**. When the diff touches a code-owner
   path, it carries the PR link and "approve it on GitHub with your ok"
   (an approval is dismissed by every push, so it comes after the last
   round). It also carries the release authorization line he runs
   (`! .claude/hooks/authorize.sh release <slug> feat/<slug>@<sha>`);
   the release's `/goal` comes from `/stage-release` itself.

His "ok" closes the hands-on: one line in `rulings.md`. Then the
project's signoff command runs the whole gate once on the final head,
in the background (queue.md; `claude/scripts/local-ci.sh` when the
project names none); it posts `local-ci` on that sha only on green. A
red is an `X.n` by queue.md, then the whole gate once more. The close
starts meanwhile; the stage ends on its green.

## 7 · Close

All at once:

1. **The report**, by `claude/docs/stage-report.md`, finished before the
   stage closes: the Video by `video-builder (Sonnet 5.5, high)` (what
   was built, the real screens captured from his hands-on environment),
   the Deck by `slides-builder (Sonnet 5.5, medium)` (per entry: ACs →
   proofs, findings, the A.n, what stayed out and why), the Explainer by
   template (the board replayed on a timeline from `run-*.json` and
   `beats.jsonl`). Published on the workstream's link.
2. **Telemetry**: `node claude/scripts/telemetry.mjs <slug> --stage
   execute --ws <designs-root>/<slug> --out -` reads the transcripts and
   the runs. Nothing by hand.
3. **Cleanup**: every entry worktree and its stack down (`make down`
   removes the images too), the hands-on environment down after the
   video's capture, local `story/<slug>/*` branches, remote
   `story/<slug>/*` and `evidence/<slug>/*` (their evidence is already
   copied), the `systemd-inhibit` process.

Then `.state.md` to `stage: release`, this workstream's line in
`_coordination.md`, the close commit of the workstream folder, and the
message: the report link, the board in one table, what was decided in
his place, and `/clear` then `/stage-release <slug>`.

## Running alone

What is his, and so stops the goal before its "done": a decision of
product, scope, an AC, a new recurring cost, something irreversible,
his hands-on.

## Resuming

Everything is in files: `.state.md`, `board.md`, `plan.md` Status, the
`run-*.json`. An entry `building` locally with no live run resumes
from its branch (`mode: 'resume'`, `resume: {head, check: 'whole'}`). A cloud entry:
read its evidence branch first, then restart the watcher.

## Boundaries

No product code and no review by the session. No merge into `main`.
Nothing merges that did not come back `ready` and pass the queue's
affected gate. No status posted except by the signoff command. No
re-decision of the design or the plan: a node that cannot be built as
designed parks with the quote, and he decides. Notes are read, never
built.
