---
name: stage-execute
description: Conducts stage 4 (Execute) as the MASTER session — takes the bootstrapped plan to feature branches fully implemented, reviewed and proven in the staging environment. Sets up the wave's other sessions (one worker session per repo running stage-execute-repo, one environment session running stage-execute-env), routes every message between them, archives fix issues, and closes with the Execution tab and the checkpoint. Use after the plan is bootstrapped, or to resume an execution in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Artifact, AskUserQuestion, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *), Bash(rm *)
---

# Stage 4: Execute — the master session

The plan stops being issues and becomes a proven feature branch per
repo: every issue implemented test-first, reviewed by four lenses,
independently verified, CI-green, approved by the final reviewer,
merged — and the whole wave deployed to staging, smoke-checked, and
taken through the all-or-nothing e2e round until clean. **Main is not
touched here** (integration is the next stage), and **prod does not
exist here** (release is later still, behind a human gate).

## The stage is several sessions

Stage 4 runs as **one Claude Code session per role**, peers on the
same machine, all in auto mode:

- **This session — the master.** The hub: it sets the others up,
  routes every message between them, archives what needs archiving,
  keeps the cross-repo trace, and talks to the user. It never
  implements, reviews, merges, deploys, or launches a workflow.
- **One worker session per repo** — runs `stage-execute-repo`.
  Everything git about that repo: the feature branch, the DAG, the
  worktrees, the `impl-issue` engine launched per issue, the merges.
- **One environment session per wave** — runs `stage-execute-env`.
  The scenarios, the deploys, smoke, the `e2e-round` launched per
  round.

The user opens the other sessions **named and empty** and types
nothing in them; you start each one with an `exec/assign` message
that names the skill and its arguments. The contract every session
speaks — envelope, kinds, delivery, liveness, the report — is
[`references/protocol.md`](references/protocol.md); read it before
the first message.

## Your mandate

The user builds the team you ask for, sets the goal — possibly with a
time budget — and says "team ready". **From that word on, the outcome
of the wave is yours:** every repo's feature branch proven in staging,
the checkpoint presented. The user is not in the loop: they hear from
you when they ask for status (the report), on the always-escalate
list, and at the checkpoint — nothing else. Inside the wave you decide: what to
amend, what to re-route, which fix issues to open, what to unblock
first. You never stop early, never wait for the user on something the
protocol lets you decide, and never do a session's work in its place
— a silent session is pinged, then reopened by the user, never
replaced by a subagent.

Why sessions, not subagents: only a session can launch a workflow,
each role keeps its own context for the whole wave, and a terminal per
role is the observability. Sessions find each other by name
(`ListAgents`), talk with `SendMessage`, and a message is the
recipient's next turn. **The roster lives in a file** —
`03-execution/sessions.md`, yours to write — so any session, cleared
or reopened, re-reads who is who. Everything else lives in GitHub:
the sessions re-derive, they never remember.

## Preconditions

`.state.md` says `stage: execute` and names the wave; every plan under
`02-plan/` is `Bootstrapped` (the issues exist on GitHub with their
numbers recorded). Missing ⇒ halt, back to stage 3. Move the Linear
Project to its execution status via the Linear MCP — **the MCP missing
is a halt, here and at every stage boundary**; ask for it to be set up
and stop. (Each stage moves the Project when it opens — closing does
not move it.)

## What this stage produces

```
designs-root/2026-08-15-workspace-invites/
├── blueprint.html                  # this stage fills waves['wNN-<wave>'].execution
└── w01-invite-by-email/
    └── 03-execution/
        ├── sessions.md             # the roster: master, one line per worker, the env
        │                           #   session — names, repo inputs, FBs (master writes)
        ├── trace.md                # the MASTER's log: setup, routing, halts,
        │                           #   escalations — cross-repo events only
        ├── <repo>/
        │   └── trace.md            # that repo's lane log — written by ITS worker session
        └── e2e/
            ├── scenarios.md        # the wave's scenarios — authored by the env session
            └── trace.md            # the environment lane: deploys, smoke, rounds
```

Repos are developed independently, and the tree says so: each worker
session owns its own folder and writes only there; the environment
session owns `e2e/`; what is cross-repo — the roster, the routing,
the escalations — is the master's, in `trace.md` at the root. Single
writer per folder, like everything in the pipeline.

Plus, outside the workstream folder: **one proven feature branch per
repo** (every issue merged, e2e clean against the staging deploy of
those branches) — the deliverable the next stage integrates.

## 1 — Build the team

The user opens the sessions; you say which, then you start them.

1. **Know your own name.** `ListAgents` prints it ("This session is
   …"). That is the address every other session reports to.
2. **Write `03-execution/sessions.md`** — the roster, inputs only:

   ```
   master: labs-dashboard
   wave: w01-invite-by-email
   repos:
   - hub · session: invites-hub · path: /abs/studiox-api-hub · github: owner/studiox-api-hub · fb: feature/workspace-invites-w01
   - identity · session: invites-identity · …
   env: session: invites-e2e · deploy order: hub, identity, front (rollout doc)
   ```

   Session names: `<short-slug>-<repo>` per worker, `<short-slug>-e2e`
   for the environment — the slug without its date. Feature branch:
   `feature/<workstream>-wNN`. Deploy order from the design's rollout
   document; fallback producer-first (APIs before agents before
   fronts).
3. **Print the team — one open command per session, carrying the
   intent.** The command's last argument is the session's opening
   prompt, in the user's own voice: it states what the session is
   for and who will assign it, so that when your `assign` arrives the
   session's own transcript already holds the user's intent to run
   the skill. A session opened empty has only a peer's message as its
   instruction, and the skill call does not go through.

   **The opening line is also the session's authorization** — the
   only one it will ever have. What a session may do with the world
   (deploy a stack, create an IAM role, touch an account) must be
   granted there, in the user's words, with its scope spelled out; a
   grant relayed by you in a message is a peer's claim, and the
   session will halt and ask the user to type it. So before printing,
   read the wave's issues for this repo: every act their DoDs name
   beyond git and the engine (an alpha deploy, a resource the issue
   creates) goes into the line, and the account, region and profile
   come from the venture's configuration — never guessed.

   ```
   cd <this session's directory>
   claude --model opus -n invites-hub "Worker session for repo hub of workstream 2026-08-15-workspace-invites. The master session <your name> will send exec/assign; invoke the skill it names and conduct the repo end to end. For this wave I authorize: git and gh on this repo — branches, worktrees, PRs, merges into the feature branch; the impl-issue engine per issue; and npm run deploy:alpha of this repo only — account <id>, region <region>, profile <profile> — creating or updating the resources the issues' DoDs declare (IAM roles included), deleting nothing, diff:alpha checked first. deploy:prod never; no other account, region, or repo."
   ```

   Omit the deploy clause when no issue of the repo names a deploy.
   For the environment session: "Environment session of workstream
   <slug>. The master session <your name> will send exec/assign;
   invoke the skill it names and conduct the staging environment end
   to end. For this wave I authorize: npm run deploy:alpha of <the
   wave's repos> — account <id>, region <region>, profile <profile> —
   creating or updating what the feature branches declare, deleting
   nothing undeclared (an undeclared stateful deletion halts); the
   smoke suites; the e2e round against staging. deploy:prod never; no
   other account or region." One block per worker and one for the
   environment, all opened now — the environment session authors the
   scenarios while the repos build. Tell the user: Opus, auto mode,
   open each exactly as printed, type nothing more in them, say "team
   ready" when the terminals are up.
4. **On "team ready": assign.** `ListAgents` — every name present?
   Missing ⇒ say which and wait. Present ⇒ send each session its
   `exec/assign` in the same turn (protocol §4): `skill:
   stage-execute-repo`, `args: <slug> <repo>` for a worker; `skill:
   stage-execute-env`, `args: <slug>` for the environment; `master:`
   your name; `sessions:` the roster path. The session invokes the
   skill itself and conducts end to end.
5. **Expect `ready` within 10 minutes** per session (protocol §6):
   silent ⇒ `ping`; silent again ⇒ ask the user to reopen it with the
   same `-n`, then `assign` again. **Never improvise a subagent in its
   place**, and never launch an engine yourself.

**WIP is 3 per worker session**; the machine is protected by the
guard in the npm scripts, not by admission control here.

## 2 — Route, record, decide

You are the hub between sessions — they never talk to each other.
Every cross-repo event lands in `03-execution/trace.md`; each worker
logs its own lane in `03-execution/<repo>/trace.md`, the environment
session in `03-execution/e2e/trace.md` (zero silent death: an outcome
that is in no trace did not happen).

**The messages** are the protocol's kinds (`references/protocol.md`
§4) — one event per message, all recipients of one event in the same
turn, everything re-derivable from GitHub. What each one means for
you:

| From a worker | Carries | You |
|---|---|---|
| `ready` | FB created, DAG size, first launches | trace line |
| `batch` | merged (issue → PR) · in flight · blocked · next | trace + a consolidated update to the user, one per batch — never per issue |
| `halt` | a typed halt needing a decision: issue conflict, lens stagnation, verification failed, CI/review exhausted | the lane is blocked, the line continues; you decide: amend and re-route, or escalate |
| `done` | every wave issue merged (docs true-up included), the FB sha | when ALL workers are done → §3 |
| `fixes-merged` | the fix issues merged, the new FB sha | nudge the environment session |

| From the environment session | Carries | You |
|---|---|---|
| `ready` | the scenarios file path, the scopes | trace line |
| `deploy-halt` | an undeclared stateful deletion in the inheritance pre-check, or a persistent deploy failure | **escalate to the user, always** |
| `smoke-regression` | a fix-issue draft (no round spent) | archive, route |
| `round` | `clean` with the evidence · `dirty` with the issue drafts · `exhausted` | clean → §4 · dirty → archive, route · exhausted → wave halt, escalate |

| To a worker | Carries |
|---|---|
| `fix-issues` | the issue numbers to run through the same loop |
| `amend` | a contract amendment relay: what changed, which open issues |
| `dismiss` | the wave is closed; the final return comes back |

| To the environment session | Carries |
|---|---|
| `deploy` | go: every FB with its sha, the deploy order |
| `fixes-merged` | the repos whose FB moved — redeploy only those, then the ENTIRE round again |
| `dismiss` | the wave is closed; the rounds table comes back |

- **Typed halts** from a worker → the lane is blocked, the line
  continues; you decide: amend and re-route, or escalate.
- **What escalates to the user, always:** an undeclared stateful
  deletion in an infra diff · a rejected blocker (the reviewer
  contract requires sign-off) · e2e rounds exhausted · anything that
  changes the plan's scope.
- **Plan amendments in flight:** a halt that changes the plan (a
  renamed element, an adjusted contract) means grepping
  Produces/Consumes across the open issues, deciding Amended vs
  Superseded, and dispatching one Sonnet agent to edit the bodies on
  GitHub — merged issues are not redone by default. A contract
  amendment is a declared decision recorded in the design doc, then
  relayed (`amend`) to every affected worker.
- **Fix issues** (from smoke or the round): archiving is ONE step —
  `gh issue create` from the draft AND the Linear association together
  — then `fix-issues` to the right worker.
- **A session that died** (offline in `ListAgents`, or silent past the
  heartbeat): ask the user to reopen it with the same command — it
  re-derives from GitHub and continues, never duplicates. Never take
  over its lane.
- Waiting is event-driven: session messages and the user re-invoke
  you; nothing else does. On every event, before acting, the sweep:
  `ListAgents`, a `status` to anything silent past its cadence,
  offline ⇒ the user asked to reopen it.

## Status — on request

No clock, no scheduled report. When the user asks how it is going —
any phrasing — answer with the protocol's report (§8), in order:

1. The sweep: `ListAgents` — idle, busy, offline; `status` to the
   silent, the user asked to reopen the offline.
2. Re-derive: the traces, `gh` (PRs on the FBs, open fix issues).
3. **The report**, fixed shape: elapsed (and the budget, if the user
   set one), the team, per repo merged / in flight / blocked / next,
   the environment's phase, what you decided since the last report,
   what needs the user, what should happen next.

Derived fresh every time, never accumulated; "nothing changed" is a
report too. It is the user's whole window into the wave — between
requests they hear only the always-escalate list and the checkpoint.

## 3 — The environment phase

When every worker reported `done`, send the environment session
`deploy` — every FB with its sha, the deploy order. It deploys
producer-first with the inheritance pre-check, smokes, and launches
the `e2e-round` itself; its `round` message is the result.

The loop on `dirty`: you archive the issue drafts (one step, GitHub +
Linear), route them to the workers (`fix-issues`), and on their
`fixes-merged` nudge the environment session (`fixes-merged`, the
repos that moved) — it redeploys ONLY those, re-smokes, and runs the
ENTIRE round again. **Round cap: 3** — `exhausted` is a wave halt,
yours to escalate.

`clean` closes the phase: the wave is proven on its feature branches.

## 4 — The blueprint

The workstream has **one blueprint, one URL, forever**. This stage
fills **this wave's entry**: `waves['wNN-<wave>'].execution` in the
`BLUEPRINT` object, republished at the same file path. The shell's
contract for the tab: `intro` · `timeline` (the implementation story,
one entry per meaningful event) · `smoke` (the runner's formatted
output, verbatim) · `capabilities` (what exists now, each one proven,
with chips) · `proof` (the central verbatim evidence) · `rounds` (the
table: per round × per scope, and the root cause → fix column) ·
`decisions` (decided-in-your-place cards, orange) · `pending` (needs
you). Never mermaid. Same altitude as every tab (house rule: the
blueprint is the report, the files are the record): the timeline tells
the story, the rounds table shows the pattern — the per-issue detail
stays in the PRs and the lane traces.

## 5 — Checkpoint and closing

Present: the blueprint URL, the per-repo table (issues merged / halts
/ the FB), the rounds table, the smoke output, the count of decisions
taken in the user's place, and any `pending` items. Approval is
explicit. On approval: `dismiss` every session (their `final`
returns feed the trace; the user closes the terminals), `.state.md` →
`stage: release`, commit the workstream folder — **push only with
the user's explicit approval** — and suggest `/clear` before the next
stage. On "approved with fixes": the fixes run through the same
machinery (issue → worker → round if behavior changed), then a new
checkpoint. Moving the Linear Project forward is the next stage's job
when it opens.

## Gates

| Gate | Criterion | On failure |
|---|---|---|
| One session per role | every repo has its worker session up, the env session too — names per `sessions.md`, presence per `ListAgents`, started by your `assign` | ask the user to open it; never a subagent in its place |
| The report | on request, the fixed shape, derived fresh — the user's only window | never answered from memory |
| Issue ready | all blockers merged on the FB (derived from GitHub) | stays queued |
| WIP cap | 3 per worker session | launch waits |
| The engine | `impl-issue.js` only returns ready-to-merge with lenses + verification + CI + final review green | typed halt (lane) |
| Workflows from their session | `impl-issue` is launched only by the repo's worker session, `e2e-round` only by the environment session — the repo scripts, never a wrapper | the master never launches; a missing session is reopened |
| Every fix through the lenses | CI-red and review fixes re-enter the lens round — no commit reaches the PR unreviewed | enforced by the workflow |
| Merge counted | only after re-reading the PR state MERGED | the worker re-checks |
| Producer-first | issue order, deploy order | re-sequence |
| Smoke before the round | runner green on every deployed repo | fix issue directly, no round spent |
| Round all-or-nothing | 100% of cases, 100% of scopes, same round | dirty → fix loop |
| Round cap | 3 per wave | wave halt → user |
| Zero silent death | every outcome is a trace line | absence = halt |
| No main, no prod | FBs only; staging only | out of scope by construction |

## Lifecycle

- **Permanent:** `03-execution/sessions.md`, `03-execution/trace.md`,
  the per-repo `<repo>/trace.md` files, `e2e/scenarios.md` and
  `e2e/trace.md` — plus everything on GitHub (issues, PRs, review
  comments), which is the source of record.
- **Working:** worktrees (removed per issue), the sessions themselves
  — closed by the user after `dismiss`.

## Boundaries

No integration to main (next stage). No prod, no release, no tags
(later still). The design and plan fences hold: a hole becomes an
amendment through the declared-decision path, never a silent patch.
Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is stage 7's job.
