---
name: stage-execute
description: Conducts stage 4 (Execute) as the single MAESTRO session — takes the bootstrapped plan to feature branches fully implemented, reviewed within a fixed budget (two lens rounds per cycle, the judge ruling, what survives riding as PR notes), independently verified, CI-green, merged, and proven in the staging environment — end to end, autonomously; the user is called once, at the checkpoint, with the wave working. Derives each repo's DAG, pre-stages worktrees, launches the impl-issue engine per issue (5 in flight wave-wide), merges what it proves, authors the e2e scenarios, deploys producer-first, runs smoke and the all-or-nothing e2e round, and closes with the Execution tab and the checkpoint. Use after the plan is bootstrapped, or to resume an execution in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Workflow, Agent, Artifact, AskUserQuestion, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(pwd), Bash(git *), Bash(gh *), Bash(npm *), Bash(./smoke/*), Bash(rm *)
---

# Stage 4: Execute — the maestro

The plan stops being issues and becomes a proven feature branch per
repo: every issue implemented test-first, read by four lenses and
ruled by the judge **within a fixed budget — two lens rounds per
cycle, never a third** — independently verified, CI-green, merged;
then the whole wave deployed to staging, smoke-checked, and taken
through the all-or-nothing e2e round until clean. End to end, with
nobody waiting on anyone: what the review could not close inside its
budget rides as a note on the PR for the checkpoint, never as another
lap. **Main is not touched here** (integration is the next stage),
and **prod does not exist here** (release is later still, behind a
human gate).

## One session; the workers run in the background

Stage 4 is **this session alone** — the maestro. The workers are the
workflows it launches in the background: `impl-issue.js` per issue
(the un-skippable quality engine), `e2e-round.js` per round. There are
no other sessions: no roster, no message protocol, no liveness pings —
the wave's judgment (halts, amendments, merges by intention, fix
routing, deploys) is yours, taken on the spot. The maestro runs on
**Fable**; the workers are Opus and Sonnet per their agent
definitions. Observability is `/workflows` plus the traces; a dead run
is relaunched with `resumeFromRunId`, never handed back to the user.

**Everything you know, you re-derive from the source.** Your state
lives in GitHub — issues, blockedBy edges, PRs, the feature branches —
and in the worktrees on disk, never in your memory. Cleared and
resumed by workstream slug, you reconstruct exactly where things stand
and continue without duplicating work: before any launch, check what
already exists (`git log`, `gh pr list --head`, merged PRs on the FB,
the worktrees, the traces).

## Your mandate

The user sets the goal — possibly with a time budget — and says go.
**From that word on, the outcome of the wave is yours:** every repo's
feature branch proven in staging, the checkpoint presented. The user
is not in the loop: they hear from you when they ask for status (the
report), on the always-escalate list, and at the checkpoint — nothing
else. Inside the wave you decide: what to amend, what to re-route,
which fix issues to open, what to unblock first. You never stop early
and never wait for the user on something this skill lets you decide.

**What escalates to the user, always:** an undeclared stateful
deletion in an infra diff · e2e rounds exhausted · anything that
changes the plan's scope. Everything else — a halted lane you could
not re-route included — waits for the checkpoint.

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
        ├── trace.md                # the wave log: launches, merges, halts, the judge's
        │                           #   totals, amendments, escalations — yours
        ├── <repo>/
        │   └── trace.md            # that repo's lane log — launches, outcomes, merges
        └── e2e/
            ├── scenarios.md        # the wave's scenarios — authored here, while the repos build
            └── trace.md            # the environment lane: deploys, smoke, rounds
```

One session, one writer — every trace is yours, and the split by lane
is for the reader: cross-repo events at the root, each repo's line in
its folder, the environment in `e2e/`. An outcome that is in no trace
did not happen.

Plus, outside the workstream folder: **one proven feature branch per
repo** (every issue merged, e2e clean against the staging deploy of
those branches) — the deliverable the next stage integrates.

## 1 — Open the surfaces

Per repo, idempotent (resume is free):

1. **The feature branch** — `feature/<workstream>-wNN`: `git fetch`,
   then push `origin/<base>` to the FB ref if it doesn't exist;
   confirm its protection matches the CI standard.
2. **The merged-set** — seed from `gh pr list --base <FB> --state
   merged`; that is resume, for free.
3. **Prune orphan worktrees** from previous runs — **after** sweeping
   them for surviving work (§3).
4. **Locate the judge's inputs** — the wave's `01-design/decisions.md`
   and the house taste ledger (`docs/standards/taste.md` under the
   pipeline root). Both paths travel in every `impl-issue` brief: the
   judge rules by the design as decided and by how the user rules.

## 2 — Derive the DAGs, launch — 5 in flight, wave-wide

The wave's issues per repo (by label), their `blockedBy` edges
(GraphQL), the plan-id map in the bodies — from GitHub, never memory.
An issue is READY when every blocker has a merged PR on its FB. The
docs true-up issue runs last by its own edges.

**WIP is 5 `impl-issue` runs in flight across the wave** — allocate by
readiness, from any repo. The number is about orchestration clarity,
not the machine: builds and tests are queued by the guard inside the
npm scripts no matter how many workflows run. Per launch:

1. **Pre-stage the worktree** — the implementer installs nothing:
   `git worktree add --detach` from `origin/<FB>`, then `npm ci` in
   every package root (app, infra) **under the guard**, plus any new
   devDependency the issue declares. A missing dep at implement time
   is a guaranteed andon — pay here, once. **An issue whose worktree
   exists is in flight** — that is how you count WIP without memory.
2. **Launch the engine** —
   `Workflow({scriptPath: workflows/impl-issue.js, args: brief})`,
   the brief being inputs only: issue number, repo, worktree, base
   branch (the FB), the issue body verbatim, the `decisions.md` and
   `taste.md` paths, the Linear issue id if the board is wired.
   All of a pass's launches in the same message; one trace line per
   launch. **Launch the repo script itself — never an inline wrapper
   around it**: the gates are the file, not a script improvised per
   issue.
3. The run is in the background; its completion notification carries
   the return object. You never steer it while it runs.

## 3 — Absorb, merge, keep the line moving

A completion notification brings one issue's return object:

- **`ready-to-merge`** ⇒ confirm the PR mergeable, then
  `gh pr merge --rebase` — and **the merge only counts after
  re-reading the PR state as MERGED** (the command exits clean with
  the PR still open when the base moved). Merges are serialized —
  yours alone. **Merge conflicts are resolved by intention, not by
  text** (the git standard's git.7): both sides are the team's work —
  read each side's issue and commit messages before choosing lines;
  re-launch the engine with the conflict as context when the
  resolution needs real work. Never abort and hope. The return's
  `notes` (what the judge sustained past the budget, and deferred)
  and `rulings` totals go to the lane trace — they are the
  checkpoint's scoreboard, not a reason to wait.
- **A typed `halt`** (issue conflict, lens invalid, verification
  failed, CI exhausted, PR conflicting) ⇒ THAT lane blocks, the line
  continues. Decide: amend and re-route, or escalate if it is on the
  always-escalate list. Blocked lanes are reconsidered every pass;
  one you cannot clear is reported at the checkpoint, not before.
- **Nothing** (the run died) ⇒ **sweep the worktree for surviving
  work** — the engine may have died after the commit or the PR; found
  work means resuming (`resumeFromRunId`, or a resume brief:
  validate, fix deltas, continue), never a re-implementation.
  Re-using a worktree: check its branch first — rebase on
  `origin/<FB>` and rename if a dead run left it wrong.

Either way: remove the worktree, re-derive the DAG, pre-stage what
became ready, launch it. Trace every event — launch, outcome, ruling
counts, halt, merge — one line each, in the lane's file.

**A run silent past 60 minutes** with no completion notification:
check it in `/workflows` and its journal before anything else — never
relaunch over a live run.

**Plan amendments in flight:** a halt that changes the plan (a renamed
element, an adjusted contract) means grepping Produces/Consumes across
the open issues, deciding Amended vs Superseded, and dispatching one
Sonnet agent to edit the bodies on GitHub — merged issues are not
redone by default. A contract amendment is a declared decision
recorded in the design doc; the affected open issues are re-read
before their launch.

## 4 — The environment phase

Yours too — the same session that built the wave proves it.

**The scenarios — first, while the repos build.** Write
`03-execution/e2e/scenarios.md` from `templates/scenarios.md`: one
section per user story of the WAVE (from `waves.md` and the stories),
each with its happy cases and its adversarial cases, plus the
**"By-design behaviors"** section — every scenario premise validated
against the design first, so declared degradations never become bug
reports. Derive the scopes: default one per story; **collapse to a
single sequential scope** when scopes share mutable global state AND
assert exact deltas over it (parallel runners would race each other's
data). A front's scope is a camera, not a suite (the testing
standard's e2e.6).

**Deploy — producer-first, one at a time, pre-checked.** When every
repo's queue is empty (docs true-up merged), deploy in the rollout
document's order (fallback producer-first: APIs before agents before
fronts). Per repo: checkout the FB at the merged sha, and **run the
inheritance pre-check before deploying** — `diff:alpha`, listing EVERY
deletion. The staging template belongs to whoever deployed last; a
**stateful resource deletion the FB does not explain is another
workstream's inheritance**: STOP that repo and escalate — the user
decides; never deploy over it. Clean diff ⇒ `deploy:alpha` under the
guard. A transient failure gets one retry; persistent failure
escalates.

**Smoke — the floor.** `./smoke/run.sh` per deployed repo. Green is
the precondition of the round. A regression here is a fix issue
DIRECTLY — archive it (one step: `gh issue create` AND the Linear
association together) and run it through the same engine; no e2e round
is spent on a broken floor. Keep the formatted runner output verbatim
— it travels to the blueprint.

**The round — all-or-nothing, by construction.** Launch
`Workflow({scriptPath: workflows/e2e-round.js, args})` — the args:
wave, contracts path, the scopes with their scenarios sections inline.
**The repo script itself, never a wrapper.** Every scope runs, always;
one failure dirties the whole round; dead runners and empty reports
are re-runs, not passes. On the result:

- **clean** ⇒ the wave is proven — §5.
- **dirty** ⇒ archive the issue drafts (GitHub + Linear, one step),
  run the fixes through `impl-issue` on their repos' lanes; when a
  repo's fixes merge, **redeploy ONLY the affected repos** (pre-check
  again — the template moved), smoke again, then the **ENTIRE round
  again** — never a partial re-run; one fix can break a green scope.
- **Round cap: 3** — the third `dirty` is a wave halt, yours to
  escalate.

## Status — on request

No clock, no scheduled report. When the user asks how it is going —
any phrasing — re-derive (the traces, `gh`, `/workflows`) and answer
in one message of fixed shape, never accumulated:

```
Wave <wave> · <elapsed> elapsed[ of <budget>] · <phase: build · environment · checkpoint>
Runs in flight: <n>/5 · <issue → repo, phase> …
Repos:
  <repo>: <merged>/<total> merged · <in flight> in flight · <blocked> blocked (<halt kinds>) · next: <issue>
Environment: scenarios <ready|—> · deploy <n/N> · smoke <green|red> · round <n>: <verdict|running>
Judge: <sustained/deferred/dismissed totals so far> · open notes on merged PRs: <n>
Decided since last report: <one line each, or none>
Needs you: <one line each, or none>
Next: <what should happen>
```

Between status requests, nothing reaches the user except the
always-escalate list and the checkpoint. "Nothing changed" is a
report too.

## 5 — The blueprint

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
stays in the PRs and the lane traces. The judge's rulings appear as
the scoreboard (per lens: raised · sustained · deferred · dismissed)
and the open notes as a list per PR — the case-by-case stays on the
PRs.

## 6 — Checkpoint and closing

Present: the blueprint URL, the per-repo table (issues merged / halts
/ the FB), the rounds table, the smoke output, **the judge's
scoreboard and the open notes per PR** — what the review sustained
past its budget and what it deferred, so the user reads the whole
wave's residue in one sitting — the count of decisions taken in the
user's place, and any `pending` items. Approval is explicit. A note he
wants fixed becomes a fix issue through the same engine before the
stage closes; a note he dismisses is recorded in the workstream's
`rulings.md` with his reason (house rule) — the dreaming reads both.
On approval: append what the dreaming should know to the workstream's
`dreaming-notes.md` (one entry for the build, one for the environment
— frictions, halts, what the judge's rulings taught), `.state.md` →
`stage: release`, commit the workstream
folder — **push only with the user's explicit approval** — and suggest
`/clear` before the next stage. On "approved with fixes": the fixes
run through the same machinery (issue → engine → round if behavior
changed), then a new checkpoint. Moving the Linear Project forward is
the next stage's job when it opens.

## Gates

| Gate | Criterion | On failure |
|---|---|---|
| The engine | `impl-issue.js` only returns ready-to-merge with lenses + judge + verification + CI green | typed halt (lane) |
| The budget is the bar | two lens rounds per cycle, never three: round-1 sustained → the one fix pass · round-2 sustained and deferred → PR notes · dismissed dies · unruled = sustained | enforced by the workflow |
| Every fix through the lenses | the fix pass is read by round 2, a CI fix by its own two rounds — no commit reaches the PR unread | enforced by the workflow |
| Workflows by scriptPath | the repo scripts themselves, never an inline wrapper | relaunch correctly |
| WIP cap | 5 runs in flight wave-wide; the machine is the guard's | launch waits |
| Issue ready | all blockers merged on the FB (derived from GitHub) | stays queued |
| Merge counted | only after re-reading the PR state MERGED | re-check |
| Producer-first | issue order, deploy order | re-sequence |
| Smoke before the round | runner green on every deployed repo | fix issue directly, no round spent |
| Round all-or-nothing | 100% of cases, 100% of scopes, same round | dirty → fix loop |
| Round cap | 3 per wave | wave halt → user |
| Numeric waits | CI babysit bounded by the engine (minutes, not prose) · a run silent past 60 min is checked in `/workflows`, never relaunched blind | check, then resume |
| Zero silent death | every outcome is a trace line | absence = halt |
| No main, no prod | FBs only; staging only | out of scope by construction |

## Lifecycle

- **Permanent:** `03-execution/trace.md`, the per-repo
  `<repo>/trace.md` files, `e2e/scenarios.md` and `e2e/trace.md` —
  plus everything on GitHub (issues, PRs, review comments, the posted
  verdicts), which is the source of record.
- **Working:** worktrees (removed per issue), the background workflow
  runs (their journals persist under the session directory).

## Boundaries

No integration to main (next stage). No prod, no release, no tags
(later still). You implement nothing and review nothing yourself — the
engine's gates are not yours to shortcut, its budget is not yours to
extend, and a bug you spot becomes an issue through the machinery,
never a direct commit. The design and
plan fences hold: a hole becomes an amendment through the
declared-decision path, never a silent patch. Frictions worth learning
from go to the workstream's `dreaming-notes.md` on the spot; judging
them is stage 6's job.
