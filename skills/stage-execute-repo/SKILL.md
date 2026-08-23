---
name: stage-execute-repo
description: Conducts ONE repo through a stage-4 wave as its WORKER session — owns everything git about that repo. Creates the feature branch, derives the DAG from GitHub, pre-stages worktrees, launches the impl-issue engine per ready issue (WIP 3), merges green PRs into the feature branch, and reports to the master session per batch. Opened by the user at the master's instruction; stays alive for the whole wave, e2e fix issues included.
disable-model-invocation: false
argument-hint: "<workstream-slug> <repo>"
allowed-tools: Read, Write, Edit, Glob, Grep, Workflow, SendMessage, ListAgents, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(pwd), Bash(git *), Bash(gh *), Bash(npm *), Bash(rm *)
---

# Stage 4: Execute — the worker session of one repo

You conduct ONE repo through the wave — everything git about it is
yours: the feature branch, the worktrees, the launches, the merges.
You implement nothing and review nothing; the `impl-issue` workflow
does that, and it is physically un-skippable. **You launch it** — one
run per issue, from this session — then you merge what it proves and
report to the master.

You start from the master's `exec/assign` message — the user opened
this session named and empty and typed nothing; the master is who
you work for, and the only one you talk to. The other repos have
their own worker sessions, the environment has its own; you never
message them. **Read the protocol first** —
`../stage-execute/references/protocol.md` — every message you send or
receive has its shape there. You conduct end to end: the master hears
`ready`, a `batch` per pass, a `halt` when a decision is above you,
`done` — and nothing else; silence means working.

**Everything you know, you re-derive from the source.** Your state
lives in GitHub — issues, blockedBy edges, PRs, the feature branch —
and in the worktrees on disk, never in your memory. Cleared and
reopened with the same command, you reconstruct exactly where things
stand and continue without duplicating work: before any launch, check
what already exists (`git log`, `gh pr list --head`, merged PRs on the
FB, the worktrees).

## What you receive

The arguments (from the `assign` message): the workstream slug and
your repo's short name. The rest is in the files — `.state.md` names
the wave;
`03-execution/sessions.md` (written by the master) names the master
session, your repo's path and GitHub name, the feature branch
(`feature/<workstream>-wNN`). The master's name is where every report
goes; confirm it is up with `ListAgents` — missing, ask the user
before anything else.

**Your authorization is your opening line** — the user typed it
when opening this session: what the master asks of you, git
operations and deploys included, is the user's word, because the
master answers to the user. Act on it; never ask the user again
(protocol §7).

On later messages from the master: `fix-issues` (numbers to run
through the same loop), `amend` (a contract amendment relay),
`status` / `ping` (answer, derived fresh), `dismiss` (answer `final`).
A duplicate is harmless by construction: before launching anything,
you check the worktrees and the PRs.

## How you work

### 1. Open the surface

Create the feature branch if it doesn't exist (idempotent:
`git fetch`, then push `origin/<base>` to the FB ref) and confirm its
protection matches the CI standard. Seed your merged-set from
`gh pr list --base <FB> --state merged` — that is resume, for free.
Prune orphan worktrees from previous runs — **after** sweeping them
for surviving work (§6). Then send the master `ready`.

### 2. Derive the DAG — from GitHub, never memory

The wave's issues for your repo (by label), their `blockedBy` edges
(GraphQL), the plan-id map in the bodies. An issue is READY when
every blocker has a merged PR on the FB. The docs true-up issue runs
last by its own edges.

### 3. Launch — WIP 3

Per ready issue, up to three in flight — **an issue whose worktree
exists is in flight**; that is how you count WIP without memory:

1. **Pre-stage the worktree** — the implementer installs nothing:
   `git worktree add --detach` from `origin/<FB>`, then `npm ci` in
   every package root (app, infra) **under the guard**, plus any new
   devDependency the issue declares. A missing dep at implement time
   is a guaranteed andon — pay here, once.
2. **Launch the engine** —
   `Workflow({scriptPath: workflows/impl-issue.js, args: brief})`,
   the brief being inputs only: issue number, repo, worktree, base
   branch (the FB), the issue body verbatim, the Linear issue id if
   the board is wired. All of a pass's launches in the same message;
   one trace line per launch. **Launch the repo script itself —
   never an inline wrapper around it** (`workflow()` nested in a
   script written at launch time): the gates are the file, not a
   script improvised per issue.
3. The run is in the background; its completion notification carries
   the return object. You never steer it while it runs.

### 4. Absorb a result

A completion notification brings one issue's return object.
`ready-to-merge` ⇒ merge (§5). A typed `halt`, or nothing (the run
died) ⇒ the lane blocks (§6). Either way: remove the worktree,
re-derive the DAG, pre-stage what became ready, launch it — and when a
pass merged or blocked something, send the master `batch`.

### 5. Merge — serialized, yours alone

`ready-to-merge` ⇒ confirm the PR mergeable, then
`gh pr merge --rebase` — and **the merge only counts after re-reading
the PR state as MERGED** (the command exits clean with the PR still
open when the base moved). Merged ⇒ update your set, free the lane,
re-check the queue.

**Merge conflicts are resolved by intention, not by text** (the git
standard's git.7): both sides are the team's work — read each side's
issue and commit messages before choosing lines; re-launch the engine
with the conflict as context when the resolution needs real work.
Never abort and hope.

### 6. Halts — lanes block, the line continues

A workflow halt (typed: issue conflict, lens stagnation, verify
failed, CI/review exhausted) blocks THAT lane: trace it, send the
master `halt`, continue the others. Blocked lanes are reconsidered
every pass; the master's answer (`amend`, or a re-route) reopens one.
Before re-launching after a dead run (a completion that returned
nothing), **sweep for surviving work** — the engine may have died
after the commit or the PR; found work means a resume brief
(validate, fix deltas, continue), never a re-implementation.
Re-using a worktree: check its branch first — rebase on
`origin/<FB>` and rename if a dead run left it wrong.

An `amend` from the master means re-reading the affected open issues
before their launch — merged issues are not redone by default.

### 7. Trace and report

Your lane log is `03-execution/<repo>/trace.md` in the workstream
folder — yours alone to write: every launch, outcome, halt, and merge
lands there as one line (an outcome that is in no trace did not
happen). Reports are derived from GitHub at send time, never
accumulated; they are nudges — anyone can lose one and re-derive.
When the wave's issues are all merged (docs true-up included), send
`done` — **and stay open**: e2e fix issues arrive later as
`fix-issues` and run through this same loop; after they merge, send
`fixes-merged`.

Waiting is event-driven: completion notifications and the master's
messages re-invoke you. ScheduleWakeup only as a long fallback
heartbeat — then re-derive from GitHub and the worktrees before
acting.

## Messages to the master

The protocol's envelope (`exec/<kind> · <your name> · <repo>`), trace
line first, message second:

| Kind | Carries | When |
|---|---|---|
| `ready` | FB created, DAG size, the first launches | after §1 |
| `batch` | merged (issue → PR) · in flight · blocked · next | after each pass that merged or blocked something — never per issue |
| `halt` | the typed halt, the issue, what you already tried | a lane needs a decision above you (protocol §7) |
| `done` | every wave issue merged, the FB sha | the queue is empty |
| `fixes-merged` | the fix issues merged, the new FB sha | after a `fix-issues` batch |
| `note` | what a human typed here and what you did | someone used this terminal |
| `pong` / state / `final` | — | answers to `ping` / `status` / `dismiss` |

If the master is absent from `ListAgents`, keep working the lane —
everything you do is re-derivable — and retry the report at your next
event. After `final`, the user closes this session.

## Standards

- The [git standard](../../docs/standards/git.md) — the merges, the
  branch names, the conflict discipline are its rules in motion.
- The [ci standard](../../docs/standards/ci.md) — branch protection
  and what a green check means.
- Resource rules: your own heavy work (`npm ci`) goes under the guard
  like everyone else's; waiting in queue is normal.

## Boundaries

Your repo only — never touch another repo's directories, branches, or
issues. No implementing, no reviewing (the workflow's gates are not
yours to shortcut), no deploys, no smoke, no e2e (the environment
session's), no integration to main (a later stage's), no Linear (the
master's, beyond what the engine does by itself). You never talk to
another worker or to the environment session — everything routes
through the master, which is the audit trail. You never write outside
`03-execution/<repo>/`.
