---
name: stage-release
description: Conducts stage 5 (Release) of the pipeline — takes the proven feature branches to production, safely. Two human gates (entry and prod-go), the two-lane integration train (fronts whose hosting auto-builds prod merge only after their producers are live), the alpha-from-main confirmation, semver derived from conventional commits with tags that are never retroactive, the supervised step-by-step cutover with a documented rollback per repo, and the wave's Release Report published in the blueprint. Use after the wave's execution is approved, or to resume a release in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Artifact, AskUserQuestion, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *), Bash(npm *), Bash(rm *)
---

# Stage 5: Release

Stage 4 built it and proved it works, internally. This stage puts it
in the air, safely: integration into `main`, a version that means
something, and a supervised path to production with a documented way
back. **This is the only stage where production exists** — and
because of that, nothing here moves on inferred approval: the stage
opens on an explicit go, and prod opens on a second one.

The session conducts directly — the work is sequential and
human-gated by nature; a workflow's guarantee (order without
supervision) is the opposite of what this stage needs. One mechanical
agent (`release-scribe`) does the version/notes grind; the session
merges, deploys, and verifies, step by confirmed step.

## Preconditions

`.state.md` says `stage: release` and names the wave; the wave's
Execution tab is published (the proof this stage stands on). Missing ⇒
halt, back to stage 4. Move the Linear Project to its release status
via the Linear MCP — **the MCP missing is a halt, here and at every
stage boundary**. (Each stage moves the Project when it opens —
closing does not move it.)

**The entry gate:** present what is about to ship — the repos, the
FBs, the highlights of the blueprint's Execution Report tab (its
`pending` items are this gate's open questions) — and get the
explicit go.
Structural reason: a front whose hosting auto-builds prod from `main`
makes "merge" and "deploy" the same act, so even integration sits
behind the gate.

## What this stage produces

```
designs-root/2026-08-15-workspace-invites/
├── blueprint.html                  # this stage fills waves['wNN-<wave>'].release
└── w01-invite-by-email/
    └── 04-release/
        ├── trace.md               # the release log — every train step and verification
        └── rollback/
            └── <repo>.md          # the documented way back, per repo — written BEFORE prod-go
```

Plus, outside the workstream folder: the wave on `main` in every
repo, a semver tag and GitHub Release per repo, and **production
running the wave** — verified step by step.

## 1 — The integration train, two lanes

The order comes from the design's `rollout.md` (fallback
producer-first: APIs → agents → fronts). Repos split by one flag the
venture declares in each front's `CLAUDE.md`:

- **Lane A — merge ≠ deploy** (backends, agents): open the PR
  `feature/<workstream>-wNN` → `main` (body: the wave, its issues,
  the blueprint URL — its Execution Report tab is the proof this PR
  stands on) → CI green → rebase merge → **re-read
  the state as MERGED**. If `main` moved since the FB was cut, rebase
  the FB onto `main` first — conflicts by intention (the git
  standard), CI again — then merge.
- **Lane B — merge IS deploy** (fronts with prod auto-build): the
  integration PR is **prepared** here — opened, CI green — but merged
  only in the prod train (§5), after its producers are live. The
  merge is that repo's deploy step, and it waits its turn.

**Stop-the-train:** a red CI or a conflict stops the whole train at
that repo — a consumer never integrates ahead of a producer that
didn't make it. CI waits are external waits: ScheduleWakeup +
re-check, never a background watch.

## 2 — Pre-prod confirmation

With Lane A integrated: redeploy the staging environment **from
`main`** — the inheritance pre-check first, same rule as stage 4:
`diff:alpha`, listing EVERY deletion; a stateful resource deletion
this integration does not explain is another workstream's inheritance
— STOP that repo and escalate, never deploy over it. Then the **full
smoke suite per repo**. This kills the one new risk integration
creates — "the FB proved it, the rebase changed it". A smoke
regression here becomes a fix issue cut from `main`, through the same
engine with the same launch as stage 4: a worktree from `main`, the
brief carrying the issue body, the tier and `decisions.md` path,
`Workflow({scriptPath: workflows/impl-issue.js, args})` — and the
confirmation re-runs. **Two fix cycles are the budget:** a third red
confirmation halts the stage to the user with the evidence —
integration surfaced something stage 4 did not see, and that is a
conversation, not a loop. Green opens the road to prod.

## 3 — Version: the release-scribe proposes

Dispatch **`release-scribe`** (Sonnet) with the repos and their
integrated `main` shas. Per repo it derives the semver bump from the
conventional commits since the last tag — `BREAKING CHANGE`/`!` ⇒
major · `feat` ⇒ minor · otherwise patch; no tag yet ⇒ `v1.0.0` —
and drafts the release notes grouped by type. **It proposes; it
creates nothing.** Its table feeds the next gate.

## 4 — Prod-go: the second gate

One table, everything on it: the train order · the proposed version
per repo · **the rollback plan per repo** — written NOW, from
[templates/rollback.md](templates/rollback.md), into
`04-release/rollback/<repo>.md` (the previous tag, the exact way
back, the data considerations — the plan's expand→migrate→contract
chains are what make rolling back safe — and how to verify the way
back worked) · any open risks the blueprint's Execution Report tab
named in `pending` or its decision cards. Documented,
not rehearsed. **The explicit go releases the train** — and only then
are the tags created on the integrated shas (**a tag is what goes up,
never retroactive: prod deploys FROM the tag**) and the GitHub
Releases published with the scribe's notes.

## 5 — The prod train: supervised cutover

One repo at a time, in order — **the user present, every step
confirmed before the next**:

- **Lane A**: checkout the tag → `deploy:prod` under the guard →
  **verify the step** before moving on — the checks come from the
  design's `rollout.md` (stage 2 wrote the cutover gates; this stage
  executes them): health, the version live, the key read-only flow.
- **Lane B**: merge the prepared PR (that IS the deploy) → verify the
  live site — routes served, the version stamped.
- A failed verification **stops the train**: the step's rollback is
  the documented one, executed and verified; the failure becomes an
  issue. The train never limps forward past a red step.

**Prod stays clean.** Every prod verification is read-only — the
rollout's checks, never the smoke suite: smoke runs on staging only
(§2), and nothing in this train writes test data, test accounts, or
any other residue into production. A check that would need to write
to prove itself is a staging check, already paid in §2.

Every step lands in `04-release/trace.md` — the command, the
verification, the confirmation.

## 6 — Closing

The rollout's post-deploy checklist verified → Linear: the wave's
issues to done → the feature branches deleted (their content lives on
`main` and in the tags) → **the Release Report**: fill this wave's
`waves['wNN-<wave>'].release` in the `BLUEPRINT` object and republish
at the same file path. The shell's contract for the tab: `intro` ·
`timeline` (the release story, one entry per meaningful event —
integration, confirmation, the gates, every cutover step with its
verification; `tone` marks the reds) · `versions` (rows: `repo`,
`from`, `to`, `why` — the scribe's table as shipped) · `smoke` (the
§2 confirmation output, verbatim) · `rollback` (rows: `repo`, `back`,
`data` — one line each; the files in `04-release/rollback/` stay the
authority, and `rollbackNote` says so) · `decisions` · `pending`.
Same altitude as every tab: the timeline tells the story, the exact
commands live in `trace.md`. The Overview's wave map is marked
shipped — same URL as always → `.state.md` → `stage: close`, commit
the workstream folder — **push only with the user's explicit
approval** — and suggest `/clear` before stage 6.

## Gates

| Gate | Rule |
|---|---|
| Human entry | nothing moves without the explicit go — entry and prod-go are separate gates |
| Stop-the-train | red or conflict stops the whole train at that repo; consumers never pass producers |
| Lane B sequencing | an auto-build front merges only with its producers already live in prod |
| Pre-prod smoke | the prod train opens only on green smoke over alpha-from-main |
| Confirmation budget | two fix cycles in §2; the third red halts to the user |
| Prod stays clean | prod verification is read-only — no smoke suite, no test data, no residue in production |
| Tag never retroactive | tags on the integrated sha, after prod-go; prod deploys from the tag |
| Rollback before prod | no deploy:prod without that repo's documented plan in `04-release/rollback/` |
| Supervised steps | verification confirmed between repos; a red step means stop + documented rollback |
| External waits | ScheduleWakeup + re-check, always — never a background watch |
| Zero silent death | every train step is a trace line |

## Lifecycle

- **Permanent:** everything under `04-release/` — the trace and the
  rollback plans — plus the tags and Releases on GitHub.
- **Working:** the scribe's drafts before the gate — gone at close.

## Boundaries

No new features, no fixes beyond what the confirmation smoke demands
— this stage ships what stage 4 proved, nothing else. The design and
plan fences hold. Frictions worth learning from go to the
workstream's `dreaming-notes.md` on the spot; judging them is the
closing stage's job.
