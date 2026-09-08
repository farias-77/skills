---
name: stage-release
description: Conducts stage 5 (Release) — takes the audited workstream branch to production: one integration PR per repo into main in producer-first order, alpha redeployed from main and the whole suite green, semver derived from the conventional commits, the prod-go gate with a written rollback per repo, the supervised cutover step by step with read-only verification, the Release tab published. Two explicit human gates: the entry and prod-go. Runs in Claude Code with a Fable session. Use when a workstream's .state.md says stage release, or to resume a release in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Artifact, AskUserQuestion, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *), Bash(npm *), Bash(rm *)
---

# Stage 5: Release

Stage 4 built the demand into the workstream branch `feat/<workstream>`
of every repo, proved it in alpha and audited it with the user. This
stage puts it in the air: `main` receives the branch, a version that
means something is cut, and production is reached step by step with a
documented way back. **This is the only stage where production
exists**, so nothing here moves on inferred approval: the stage opens
on an explicit go, and prod opens on a second one.

The session conducts directly. The work is sequential and human-gated
by nature, so no workflow runs here; one mechanical agent,
`release-scribe`, does the version and notes grind, and the session
merges, deploys and verifies, step by confirmed step. Code is never
written in this chair: a regression found here goes back to the
Codex chair as a fix, through the same story cycle as everything else.

## Two modes

**Session mode** (the two gates and the cutover). The user is in the
room; every gate is his explicit go through the question tool, and
every cutover step waits for his confirmation before the next. Never
run ahead of him here.

**Autonomous mode** (the integration, the confirmation, the scribe,
the report). The user is waiting. Merge, deploy alpha, run the suite,
dispatch the scribe, write the trace and the tab, without asking
permission for any of it. Say in one line what you are about to do,
and close with a recap that stands on its own.

## The pattern

```
1. Entry gate    what ships, the audit's close, the open residue; his explicit go.
2. Integrate     one PR per repo feat/<workstream> → main, producer-first; fronts
                 whose hosting auto-builds prod are prepared, merged in the train.
3. Confirm       alpha redeployed from main, the whole suite green; two fix cycles.
4. Version       release-scribe derives the semver and drafts the notes; creates nothing.
5. Prod-go gate  the train order, the versions, the rollback per repo written; his go
                 creates the tags and the GitHub Releases.
6. Cutover       one repo at a time, he confirms every step; read-only verification.
7. Report        the Release tab, .state.md → close, /clear.
```

## Preconditions

`.state.md` says `stage: release` and `chair: fable`;
`03-execution/audit.md` has its Close section written (the audit
ended with nothing left to send back); every repo's `feat/<workstream>`
is at the sha the audit's branch check names, alpha at that sha.
Missing ⇒ halt, back to stage 4.

```
<workstream>/
├── .state.md                  # stage: release · chair: fable
├── blueprint.html             # this stage fills BLUEPRINT.release
└── 04-release/
    ├── trace.md               # every train step and verification, one line each
    └── rollback/<repo>.md     # the documented way back, per repo, written BEFORE prod-go
```

Plus, outside the folder: the demand on `main` in every repo, a semver
tag and a GitHub Release per repo, and production running it, verified.

## Step 1 — the entry gate

Republish the blueprint at its URL first: the Codex chair wrote the
execution and audit entries and served the file locally, but cannot
publish. Then present what is about to ship: the repos and their
`feat/<workstream>` shas, the waves as `waves.md` lists them, the audit's Close section
(what he kept as a departure, the residue he accepted), and anything
in "Stays with the user" that has a placeholder in the code and no
real value yet. Get the explicit go through the question tool. A
front whose hosting auto-builds prod from `main` makes merge and
deploy the same act, so even the integration sits behind this gate.

## Step 2 — integrate, two lanes

The order comes from the design's `rollout.md`; fallback
producer-first (APIs → agents → fronts). Repos split by the flag the
venture declares in each front's `CLAUDE.md`:

- **Lane A, merge ≠ deploy** (backends, agents): open the PR
  `feat/<workstream>` → `main` (body: the waves, the wave PRs, the
  audit and the blueprint URL) → CI green → rebase merge → **re-read
  the state as `MERGED`** (the git standard's git.6). If `main` moved
  since the branch was cut, rebase the branch onto `main` first,
  conflicts by intention (git.7), CI again, then merge.
- **Lane B, merge is deploy** (fronts with prod auto-build): the PR
  is **prepared** here, opened and CI green, and merged only in the
  train (step 6), after its producers are live.

**Stop-the-train:** a red CI or a conflict stops the whole train at
that repo; a consumer never integrates ahead of a producer that did
not make it. CI waits are external waits: ScheduleWakeup and
re-check, never a background watch.

## Step 3 — confirm from main

With Lane A integrated: redeploy alpha **from `main`**, the
inheritance pre-check first (`diff:alpha` or what the repo names,
every deletion read; a stateful deletion this integration does not
explain is another workstream's inheritance: stop that repo and
escalate, never deploy over it). Then the **whole smoke suite per
repo**. This kills the one new risk integration creates: the branch
proved it, the rebase changed it.

A red suite becomes a fix: `.state.md` → `stage: release · phase:
fix · chair: codex`, the fix described in `04-release/trace.md` as a
row in the goal's format (repo, what, ready when), and the user opens
the Codex chair with `$stage-execute <workstream-slug>`; it builds the
fix on a branch from `main`, proves it in alpha, opens the PR to
`main`, and this stage merges it and confirms again. **Two fix
cycles are the budget:** a third red confirmation halts the stage to
the user with the evidence.

## Step 4 — version

Dispatch `release-scribe` (Sonnet) with the repos and their
integrated `main` shas. Per repo it derives the semver bump from the
conventional commits since the last tag (`BREAKING CHANGE` or `!` ⇒
major · `feat` ⇒ minor · otherwise patch; no tag yet ⇒ `v1.0.0`) and
drafts the notes grouped by type. It proposes; it creates nothing.

## Step 5 — the prod-go gate

One table, everything on it: the train order · the proposed version
per repo · **the rollback plan per repo**, written now from
[templates/rollback.md](templates/rollback.md) into
`04-release/rollback/<repo>.md` (the previous tag, the exact way back,
the data considerations, how to verify the way back worked) · any
residue the audit accepted that touches production. Documented, not
rehearsed. **His explicit go releases the train**, and only then are
the tags created on the integrated shas (**a tag is what goes up,
never retroactive: prod deploys from the tag**) and the GitHub
Releases published with the scribe's notes.

## Step 6 — the cutover

One repo at a time, in order, **the user present, every step
confirmed before the next**:

- **Lane A:** checkout the tag → `deploy:prod` under the repo's guard
  → verify the step before moving on, with the checks the design's
  `rollout.md` wrote (health, the version live, the key read-only
  flow).
- **Lane B:** merge the prepared PR (that is the deploy) → verify the
  live site: routes served, the version stamped.
- A failed verification **stops the train**: the step's rollback is
  the documented one, executed and verified; the failure goes to the
  Codex chair as a fix. The train never limps past a red step.

**Prod stays clean.** Every prod verification is read-only: the
rollout's checks, never the smoke suite; nothing here writes test
data, test accounts or any residue into production. A check that
would need to write to prove itself is an alpha check, already paid
in step 3.

Every step lands in `04-release/trace.md`: the command, the
verification, the confirmation.

## Step 7 — the report

Fill `BLUEPRINT.release` (workstream-level, like the plan; the shape
is in the shell's comment: `intro` · `timeline` with `tone` marking
the reds · `versions` · `smoke` · `rollback` with `rollbackNote` ·
`decisions` · `pending`) and republish at the same URL. Same altitude
as every tab: the timeline tells the story, the exact commands live
in `trace.md`. Then `.state.md` → `stage: close · chair: fable`,
commit the workstream folder (push only with the user's explicit
approval), suggest `/clear`.

## Gates

| Gate | Rule |
|---|---|
| Two human gates | entry and prod-go are separate explicit goes; nothing moves on inferred approval |
| Stop-the-train | red or conflict stops the whole train at that repo; consumers never pass producers |
| Lane B sequencing | an auto-build front merges only with its producers already live in prod |
| Pre-prod confirmation | the train opens only on the whole suite green over alpha-from-main |
| Fix budget | two fix cycles in step 3, each built by the Codex chair; the third red halts to the user |
| Prod stays clean | prod verification is read-only; no suite, no test data, no residue |
| Tag never retroactive | tags on the integrated sha, after prod-go; prod deploys from the tag |
| Rollback before prod | no `deploy:prod` without that repo's plan in `04-release/rollback/` |
| Supervised steps | verification confirmed between repos; a red step means stop and rollback |
| External waits | ScheduleWakeup and re-check, always; never a background watch |
| Zero silent death | every train step is a trace line |

## Files

- **Permanent:** everything under `04-release/`, `blueprint.html`,
  `.state.md`; the tags and Releases on GitHub.
- **Working:** the scribe's drafts before the gate, gone at close.

## Resuming

Read `.state.md`, then `04-release/trace.md` and GitHub: which PRs
are merged (re-read, never assumed), which tags exist, which repos
are live at which version. Continue from the first step whose trace
line is missing. `phase: fix` means the Codex chair is working: stop
and say so. Never from memory.

## Boundaries

No new features, no code in this chair. The design and plan fences
hold. Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is the close stage's.
