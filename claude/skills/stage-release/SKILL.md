---
name: stage-release
description: Conducts stage 5 (Release) — takes the audited workstream branch to production end to end on one goal from the user. The session (Fable 5.1, high) writes the release plan (what ships, the pre-flight only he can do, the train step by step with the command and the read-only check of each, the versions, the rollback per repo, the proofs the audit deferred to prod with their hour, where it stops); he reads it, gives the goal, and leaves. Then the session integrates feat/<workstream> into main producer-first, confirms from main (the whole suite only when the tree or the alpha diff changed), derives the versions with one release-scribe (Sonnet 5, high) per repo, tags, deploys one repo at a time under the rollout's checks, executes the documented rollback on a red step and builds the fix as a row R.n in this session (exec-builder Opus 5 high, five lenses Sonnet 5 high, through exec-row), watches the deferred proofs at their hour, runs a hotfix the same way while the workstream is not closed, and calls him once at the end with everything in prod. Use when a workstream's .state.md says stage release, to resume a release in progress, or with `hotfix <repo>` for a regression found in prod.
disable-model-invocation: false
argument-hint: "<workstream-slug> [hotfix <repo>]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Bash
---

# Stage 5: Release

Stage 4 left every repo's `feat/<workstream>` audited, deployed in
alpha at a named sha, with the residue the user accepted and the
proofs he deferred to production written under the audit's Close.
This stage puts it in the air and reports once: `main` receives the
branch, a version that means something is cut, production is reached
one repo at a time with a documented way back, the proofs the audit
deferred are read at their hour, and the user gets one message with
everything running.

**One gate, at the entry.** The session writes the release plan; the
user reads it, changes what he wants in prose, and gives the goal
("conduct it end to end"). From then on nothing waits for him: the
session integrates, confirms, versions, tags, deploys, verifies,
fixes and watches on its own, and calls him at the end. It stops
before the end only where the plan said it would: the third red on
one step, or a rollback the plan marked as not safe for data.

| Word | What it is here |
|---|---|
| **the plan** | `04-release/plan.md`: everything the session will do, in order, with the command and the read-only check of each step; what only the user can do is the **pre-flight**, done before the goal |
| **the train** | the prod steps in the rollout's order, one repo at a time; a red step stops it, the documented rollback runs, the fix is built, the step runs again |
| **row `R.n`** | a fix built in this session through the stage-4 row loop: before the train (a red confirmation) or after it (a hotfix); never code written by this session |
| **the watch** | the proofs the audit deferred to prod, each with an hour; the stage does not close before every one is read |

The session conducts directly. The train is sequential by nature, so
one session, no workers; the agents it dispatches are the scribes
(one per repo, Sonnet 5, high) and, for a fix, the stage-4 row
workflow (one exec-builder Opus 5 high, five exec-lens Sonnet 5 high
that never wrote the code). Every reply that dispatches or waits on
an agent carries a status table (agent · task · state), the state
read from the harness. Say in one line what you are about to do; end
no turn on a plan or a promise; when a wait is external (CI, a
deploy, a proof's hour) end the turn on the wakeup that resumes it.

## The pattern

```
0. Plan       preconditions → the blueprint built → 04-release/plan.md written → he reads, adjusts, gives the goal
1. Integrate  one PR feat/<ws> → main per repo, the rollout's order; Lane A merges now, Lane B (merge = deploy) waits for the train
2. Confirm    per repo from main: tree identical to the audited head and alpha diff empty → the audit's green stands;
              otherwise alpha from main and the whole suite · red → row R.n → confirm again · third red stops
3. Version    release-version workflow: one release-scribe per repo → semver and notes; creates nothing
4. Tags       rollback/<repo>.md written · tags on the integrated shas · GitHub Releases with the notes
5. Train      per repo in order: checkout the tag → deploy:prod → the rollout's read-only checks → next
              Lane B: merge the prepared PR (= deploy) → tag the merge sha → checks
              red → the documented rollback, executed and verified → row R.n → the step again
6. Watch      every deferred proof at its hour (a wakeup) → read → traced · a regression → hotfix row R.n
7. Close      release.json → build → .state.md → close · chair: fable → commit → one PushNotification
```

## Preconditions

`.state.md` says `stage: release · chair: fable`; `03-execution/audit.md`
has its Close section with the sha of each repo's `feat/<workstream>`
and alpha at it; every proof the audit deferred to production is a
line under "Residue, with owners" with `stage 5` as owner. Re-read
the heads on the origin: a branch not at the audit's sha halts the
stage back to stage 4 with the two shas named.

```
<workstream>/
├── .state.md                     # stage: release · chair: fable → close
├── blueprint/release/release.json
└── 04-release/
    ├── plan.md                   # what he reads before the goal: steps, pre-flight, versions, rollback, watch, stops
    ├── trace.md                  # every step as it ran, one line each, date -u
    ├── rollback/<repo>.md        # written before any tag
    ├── notes/<repo>.md           # the release notes the GitHub Release received
    ├── proof/                    # the output of every check and every deferred proof
    ├── rows/R.<n>.md             # the fixes and hotfixes, the stage-4 row record
    └── reviews/R.<n>/            # their review rounds
```

Plus, outside the folder: the demand on `main` in every repo, a
semver tag and a GitHub Release per repo, production running it,
verified read-only.

## Step 0 — the plan, and the one gate

[references/plan.md](references/plan.md). Build the blueprint first
(`node claude/blueprint/build.mjs <workstream>`) so the Execution tab
he approved is the one on the page. Then write `04-release/plan.md`
from [templates/plan.md](templates/plan.md): what ships (repos, shas,
waves, the residue he accepted at the audit); the **pre-flight**, one
line per thing only he can do (a password at a vendor, a subscription
to confirm, a parameter whose value only he has), each marked done or
delegated with what the session needs to do it; the train as a table
(step · repo · command · read-only check · rollback if red), the
order from the design's `rollout.md`, fallback producer-first (APIs →
agents → fronts); the versions expected per repo; the deferred proofs
with their hour and what each expects; and **where the session
stops**: the third red on one step, and any rollback `rollback.md`
would mark as not safe for data.

Print the plan's summary as a table and end the turn. He reads the
file, changes what he wants in prose (apply, re-print, end the turn),
and gives the goal in his words. **His goal is the only approval the
stage takes**: it covers the integration, the tags, every `deploy:prod`,
every rollback and every fix the plan describes. A pre-flight line
still open at the goal is done by him then, or delegated then; the
session never asks for it again. A step that needs him after the goal
is a plan failure: the session treats it as a red (a stop after three
attempts), never as a question.

## Steps 1–5 — the train

[references/train.md](references/train.md). In short: one PR per repo
into `main` in the rollout's order, CI awaited in the background,
rebase merge, the state re-read as `MERGED`; the confirmation from
`main` under P-17 (the whole suite only when the tree or the alpha
diff changed, the trace saying which); one scribe per repo through
[`release-version`](../../workflows/release-version.js); the
rollback per repo written before any tag; tags on the integrated
shas and the Releases; then one repo at a time, `deploy:prod` from
the tag, the rollout's checks read-only, the output to `proof/`. A
red step stops the train at that repo: the documented rollback runs
and is verified, the fix is built as row `R.n`
([references/fix.md](references/fix.md)), the step runs again. A
consumer never goes up ahead of a producer that did not make it.

## Step 6 — the watch

[references/watch.md](references/watch.md). Every proof the audit
deferred to production is a step with an hour: the session schedules
the wakeup, reads the proof when it arrives, saves the output to
`proof/`, writes the trace line. A proof further than 48 h from the
train's end is not waited for: it becomes a pendency with an owner in
the report. A regression seen here (a proof red, an alarm, a
verification that no longer holds) is a **hotfix**: row `R.n` from
`origin/main` on a `hotfix/<slug>` branch, the same row loop, a patch
tag on the integrated sha, `deploy:prod` of the affected stack only,
the rollout's checks, a trace line. `/stage-release <slug> hotfix
<repo>` enters here directly while `.state.md` is not `closed`; after
the close a regression is a new demand.

## Step 7 — the close

`blueprint/release/release.json` ([schema](../../blueprint/schema/release.md)):
the plain layer (one sentence, three things, what needs his eye), what
shipped, the pre-flight, the integration and the confirmation per
repo, the versions with their URLs, the rollback per repo, the train
as it printed, the fixes, the watch, the close. Build; refuse means a
field is missing, never a text to soften. `.state.md` → `stage: close
· chair: fable`. Commit the workstream folder (push only with his
explicit approval). Then **one `PushNotification`** and the report
from [templates/report.md](templates/report.md): what is in prod at
which version, the train in numbers, what was fixed on the way, what
was read at the watch, what stays with an owner, the blueprint URL.
Suggest `/clear` before stage 6.

## Rules

| Rule | What it means |
|---|---|
| One gate | the goal on the plan is the only approval; no prod-go, no step-by-step confirmation, no question after it |
| Pre-flight before the goal | what only he can do is done or delegated before the goal; a step that needs him later is a red, never a question |
| Stop-the-train | a red step or a conflict stops at that repo; the documented rollback runs first; a consumer never passes a producer |
| Confirmation (P-17) | the whole suite reruns only when the tree or the alpha diff changed; lint, build and unit tests always after a rebase (P-12); the trace says which |
| Fix budget | two fix cycles on one step; the third red stops and calls him with prod verified in the rolled-back state |
| Tag never retroactive | tags on the integrated sha before the deploy; prod deploys from the tag; Lane B tags the merge sha |
| Rollback before any tag | no tag without `rollback/<repo>.md`; a rollback the file marks not safe for data is a stop, listed in the plan |
| Prod stays clean | every prod check is read-only: the rollout's checks, never the suite, never test data or accounts |
| The watch closes the stage (P-4) | a deferred proof is a step with an hour; not read means not closed; beyond 48 h it is a pendency with an owner |
| Hotfix is a row (P-9) | same loop, same reviewers, patch tag, the affected stack only; in this session while not closed |
| External waits | CI, a deploy and a proof's hour are wakeups (a background `gh pr checks --watch`, a scheduled wakeup); never a poll, never a turn held open |
| No code in this chair | the session never edits product code; a fix is exec-builder's, read by the lenses; a one-line change it verifies on disk after round 2 is the only exception |
| Zero silent death | every step is a trace line with `date -u`; a resumed session continues from the first line missing |

## Files

- **Permanent:** everything under `04-release/`, `blueprint/release/`,
  `.state.md`; the tags and Releases on GitHub.
- **Nothing is deleted at the close.** The trace and the rows are what
  the dreaming reads next to the ledger.

## Resuming

Read `.state.md`, `04-release/plan.md` and `trace.md`; then GitHub and
the cloud, never memory: which PRs are `MERGED` (re-read), which tags
exist, which stacks are at which version (the rollout's checks say
how). Continue from the first plan step without a trace line. A
scheduled wakeup that did not fire is scheduled again from the plan's
hour. The goal, once given, stands: a resumed session does not ask
for it again.

## Boundaries

No new features, no code in this chair, no change to what a story
delivers. The design and plan fences hold. A regression the fix
budget cannot close is a stop with the evidence, never a workaround
in prod. Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is the close stage's.
