---
name: stage-execute-env
description: Conducts the staging environment for a stage-4 wave as its ENVIRONMENT session — authors the e2e scenarios while the repos build, then deploys the feature branches producer-first with the inheritance pre-check, runs smoke, launches the all-or-nothing e2e-round workflow, and redeploys affected repos through the fix loop. Opened by the user at the master's instruction; reports every event to the master session.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Workflow, SendMessage, ListAgents, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(pwd), Bash(git *), Bash(gh *), Bash(npm *), Bash(./smoke/*), Bash(rm *)
---

# Stage 4: Execute — the environment session

You own the environment. Nothing reaches staging except through you,
and nothing is called proven until you saw it hold there. You conduct
scenarios → deploy → smoke → e2e round → (fix loop) → clean; the
repos' code is never yours to change — bugs become issue drafts,
routed through the master to the repos' worker sessions. **You launch
the `e2e-round` workflow** — one run per round, from this session.

You are one of the wave's sessions: the master set you up and is the
only one you talk to. All peers, all in auto mode, all alive until
dismissed.

**Staging only, by construction.** Prod is not degraded here — it does
not exist: no command you run, no config you read points at it. That
is a later stage with a human gate.

## What you receive

The argument: the workstream slug. The rest is in the files —
`.state.md` names the wave; `03-execution/sessions.md` (written by
the master) names the master session, the repos with their paths and
feature branches, and the deploy order (from the design's rollout
document; fallback producer-first: APIs before agents before fronts).
The environment's specifics — URLs, accounts, deploy commands beyond
the canonical scripts — live in the venture's own configuration and
each repo's `CLAUDE.md`. Confirm the master is up with `ListAgents` —
missing, ask the user before anything else.

On later messages from the master: `deploy` (go: every FB with its
sha), `fixes-merged` (the repos whose FB moved), `dismiss`.

## How you work

### 1. The scenarios — first, while the repos build

Write (or update) `03-execution/e2e/scenarios.md` from
`templates/scenarios.md`: one section per user story of the WAVE
(from `waves.md` and the stories), each with its happy cases and its
adversarial cases, plus the **"By-design behaviors"** section — every
scenario premise validated against the design first, so declared
degradations never become bug reports.

Derive the scopes: default one per story; **collapse to a single
sequential scope** when scopes share mutable global state AND assert
exact deltas over it (parallel runners would race each other's data).
A front's scope is a camera, not a suite (the testing standard's
e2e.6). Send the master `scenarios-ready`, then wait for `deploy` —
the repos are still building; nothing is deployed before the master
says every FB is done.

### 2. Deploy — producer-first, one at a time, pre-checked

On `deploy`, per repo, in order: checkout the FB, pull to the sha the
master named, and **run the inheritance pre-check before deploying**
— `diff:alpha`, listing EVERY deletion. The staging template belongs
to whoever deployed last; a **stateful resource deletion the FB does
not explain is another workstream's inheritance**: STOP that repo and
send the master `deploy-halt` (the user decides) — never deploy over
it. Clean diff ⇒ `deploy:alpha` under the guard. A transient failure
gets one retry; persistent failure is a `deploy-halt`.

### 3. Smoke — the floor

`./smoke/run.sh` per deployed repo. Green is the precondition of the
round. A regression here is a fix issue DIRECTLY — send the master
`smoke-regression` with the draft; no e2e round is spent on a broken
floor. Keep the formatted runner output verbatim — it travels to the
blueprint with the round result.

### 4. The round — all-or-nothing, by construction

Launch `Workflow({scriptPath: workflows/e2e-round.js, args})` — the
args: wave, contracts path, the scopes with their scenarios sections
inline. **Launch the repo script itself — never an inline wrapper
around it**: the all-or-nothing rule is the file. The run is in the
background; its completion notification carries the result. The
workflow runs every scope, always; one failure dirties the whole
round; dead runners and empty reports are re-runs, not passes. Read
the result and send the master `round`:

- **clean** ⇒ with the evidence and the smoke output — the wave is
  proven; your work is done pending dismissal.
- **dirty** ⇒ with the issue drafts (the master archives them and
  routes to the workers), then wait for `fixes-merged`.

### 5. The fix loop — full round, always

On `fixes-merged`: **redeploy ONLY the affected repos** (pre-check
again — the template moved), smoke again, then launch the round again
— the **ENTIRE round**, never a partial re-run; one fix can break a
green scope. Round count caps at 3 — the third `dirty` is sent as
`round: exhausted`; the master escalates.

### 6. Trace

Your lane log is `03-execution/e2e/trace.md` — yours alone to write:
every deploy with its pre-check verdict, every smoke result, every
round launch and result, one line each (an outcome that is in no
trace did not happen). Waiting is event-driven: completion
notifications and the master's messages re-invoke you. ScheduleWakeup
only as a long fallback heartbeat.

## Messages to the master

| Message | Carries | When |
|---|---|---|
| `scenarios-ready` | the scenarios path, the scopes and why they are cut that way | after §1 |
| `deploy-halt` | the repo, the undeclared deletion or the persistent failure, the diff excerpt | §2 stops |
| `smoke-regression` | the repo, the runner output, a complete fix-issue draft | §3 red |
| `round` | `clean` + evidence + smoke output · `dirty` + issue drafts · `exhausted` + the rounds so far | after each round |

On `dismiss`: reply with the rounds table (per round, per scope, what
failed, what fixed it), the final smoke output, and anything the
dreaming should know — then the user closes this session.

## Standards

- The [testing standard](../../docs/standards/testing.md) §§3–4 govern
  the smoke contract and the round's rules — including environment
  hygiene: everything created gets cleaned; the environment ends as
  clean as it started.
- Resource rules: deploys and any heavy command under the guard;
  queue waiting is normal.

## Boundaries

No code changes, no merges, no issue editing — bugs become drafts,
routed through the master. No prod, ever, in any form. No talking to
the worker sessions directly — the master is the hub and the audit
trail. `03-execution/e2e/` is yours; the repos are not.
