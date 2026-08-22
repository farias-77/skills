---
name: stage-execute
description: Conducts stage 4 (Execute) of the pipeline — takes the bootstrapped plan to feature branches fully implemented, reviewed and proven in the staging environment. The session dispatches one repo conductor per repo (git of the repo — DAG, worktrees, one impl-issue brief per issue, merges) and one environment conductor for the wave (deploy, smoke, the all-or-nothing e2e round), launches every workflow the conductors brief (subagents cannot launch workflows), routes every result back, and closes with the Execution tab and the checkpoint. Use after the plan is bootstrapped, or to resume an execution in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Workflow, Artifact, AskUserQuestion, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *), Bash(rm *)
---

# Stage 4: Execute

The plan stops being issues and becomes a proven feature branch per
repo: every issue implemented test-first, reviewed by four lenses,
independently verified, CI-green, approved by the final reviewer,
merged — and the whole wave deployed to staging, smoke-checked, and
taken through the all-or-nothing e2e round until clean. **Main is not
touched here** (integration is the next stage), and **prod does not
exist here** (release is later still, behind a human gate).

The session is the **hub**: it dispatches the conductors, routes every
message between them, archives what needs archiving, and talks to the
user. It never implements, never reviews, never merges, never deploys
— the conductors and workflows do, and the quality gates are
physically un-skippable inside `impl-issue.js` and `e2e-round.js`.
**It is also the only one that can launch a workflow** — the runtime
reserves the Workflow tool for the session — so the conductors work
in turns: a turn ends with what to launch, you launch it, and you
bring the result back to the same conductor.

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
        ├── trace.md                # the SESSION's log: dispatches, routing, halts,
        │                           #   the environment phase — cross-repo events only
        ├── <repo>/
        │   └── trace.md            # that repo's lane log — written by ITS conductor
        │                           #   (single writer per folder, like everything here)
        └── e2e/
            └── scenarios.md        # the wave's scenarios — cross-repo by nature,
                                    #   authored by the environment conductor
```

Repos are developed independently, and the tree says so: each repo
conductor owns its own folder and writes only there; what is
cross-repo — the session's routing, the environment phase, the
scenarios — lives at the root.

Plus, outside the workstream folder: **one proven feature branch per
repo** (every issue merged, e2e clean against the staging deploy of
those branches) — the deliverable the next stage integrates.

## 1 — Dispatch the repo conductors

One `Agent` call per repo, all in the same message:
**`exec-conductor-repo`** (Opus). Each dispatch hands its conductor —
inputs only, the method lives in its definition: the workstream folder
path, the wave, its repo (path + GitHub name), the feature branch name
(`feature/<workstream>-wNN`), and your address for reports. The
conductor derives everything else from GitHub — which is also what
makes re-dispatching a dead conductor safe: it re-derives and
continues, never duplicates. Its first turn returns its **briefs**:
the `impl-issue` args for each ready issue, up to WIP 3.

**WIP is 3 per conductor**; the machine is protected by the guard in
the npm scripts, not by admission control here.

## 2 — Route, record, decide

You are the hub between conductors — they never talk to each other.
Every cross-repo event lands in `03-execution/trace.md`; each repo
conductor logs its own lane in `03-execution/<repo>/trace.md` (zero
silent death: an outcome that is in no trace did not happen).

- **Briefs → workflows:** every brief a conductor returns becomes one
  `Workflow({scriptPath: workflows/impl-issue.js, args: brief})` — all
  of a turn's briefs in the same message, one trace line per launch.
  Pass the brief through untouched; you do not read issue bodies.
- **Results → the same conductor:** a workflow's completion
  notification carries its return object. Send it to that repo's
  conductor verbatim with `SendMessage` — the same agent, alive for
  the whole wave — one message per result. Its reply is the next
  turn: merges done, halts, the next briefs. A conductor that died
  gets a fresh `Agent` dispatch with the original inputs; it
  re-derives and continues.
- **Batch reports** → trace + a consolidated update to the user, one
  per completed batch — never per issue.
- **Typed halts** from a workflow (issue conflict, lens stagnation,
  verification failed, CI/review exhausted) → the lane is blocked, the
  line continues; you decide: amend and re-dispatch, or escalate.
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
  relayed to every affected conductor.
- **Fix issues** (from smoke or the round): archiving is ONE step —
  `gh issue create` from the draft AND the Linear association together
  — then route the number to the right repo conductor.
- Waiting is event-driven: workflow completions and conductor returns
  re-invoke you. Use
  ScheduleWakeup only as a long fallback heartbeat in case a conductor
  goes silent — then re-derive from GitHub before acting.

## 3 — The environment phase

When every repo conductor reports done, dispatch
**`exec-conductor-alpha`** (Opus) — one per wave: the workstream path,
the wave, the repos with their FBs and deploy order (from the design's
rollout doc), the scenarios path, your address. It conducts deploy
(producer-first, inheritance pre-check) → smoke → scenarios, and its
turn ends with **the round to launch** — the `e2e-round` args. You
launch `Workflow({scriptPath: workflows/e2e-round.js, args})` and send
the result back to it verbatim, same agent.

The loop on `dirty`: you archive the issue drafts (one step, GitHub +
Linear), route them to the repo conductors, and on fixes-merged nudge
the environment conductor — it redeploys ONLY the affected repos,
re-smokes, and returns the round again; you launch the ENTIRE round
again. **Round cap: 3** — 
exhausted is a wave halt, yours to escalate.

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
stays in the PRs and `reviews.md`.

## 5 — Checkpoint and closing

Present: the blueprint URL, the per-repo table (issues merged / halts
/ the FB), the rounds table, the smoke output, the count of decisions
taken in the user's place, and any `pending` items. Approval is
explicit. On approval: dismiss the conductors, `.state.md` →
`stage: release`, commit the workstream folder — **push only with
the user's explicit approval** — and suggest `/clear` before the next
stage. On "approved with fixes": the fixes run through the same
machinery (issue → conductor → round if behavior changed), then a new
checkpoint. Moving the Linear Project forward is the next stage's job
when it opens.

## Gates

| Gate | Criterion | On failure |
|---|---|---|
| Issue ready | all blockers merged on the FB (derived from GitHub) | stays queued |
| WIP cap | 3 per repo conductor | dispatch waits |
| The engine | `impl-issue.js` only returns ready-to-merge with lenses + verification + CI + final review green | typed halt (lane) |
| Workflows from the session | every `impl-issue` / `e2e-round` run is launched by the session from a conductor's brief — subagents cannot launch workflows | a conductor that tries has no tool; re-brief |
| Every fix through the lenses | CI-red and review fixes re-enter the lens round — no commit reaches the PR unreviewed | enforced by the workflow |
| Merge counted | only after re-reading the PR state MERGED | conductor re-checks |
| Producer-first | issue order, deploy order | re-sequence |
| Smoke before the round | runner green on every deployed repo | fix issue directly, no round spent |
| Round all-or-nothing | 100% of cases, 100% of scopes, same round | dirty → fix loop |
| Round cap | 3 per wave | wave halt → user |
| Zero silent death | every outcome is a trace line | absence = halt |
| No main, no prod | FBs only; staging only | out of scope by construction |

## Lifecycle

- **Permanent:** `03-execution/trace.md`, the per-repo
  `<repo>/trace.md` files, and `e2e/scenarios.md` — plus everything on
  GitHub (issues, PRs, review comments), which is the source of
  record.
- **Working:** worktrees (removed per issue), conductor scratch —
  gone at close.

## Boundaries

No integration to main (next stage). No prod, no release, no tags
(later still). The design and plan fences hold: a hole becomes an
amendment through the declared-decision path, never a silent patch.
Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is stage 7's job.
