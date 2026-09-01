---
name: stage-close
description: Conducts stage 6 (Closure & Dreaming) of the pipeline — verifies the shipped wave's quiet window, writes the closure record, sweeps the boards, and prepares the dreaming board — every collected friction presented with evidence and a suggested edit grounded in the house standards; the user rules each entry in session, and only ruled lessons become revertible learn() commits. Then the next wave opens (or the workstream closes). Use after the release closes, or to resume a closure in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Artifact, AskUserQuestion, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *), Bash(rm *)
---

# Stage 6: Closure & Dreaming

The wave is live. This stage does two things nothing else does: it
**archives the wave as a complete record**, and it **makes the
pipeline better than it was when the wave started** — the frictions
every stage noted on the spot become edits to the skills themselves.
The closure and the sweep run autonomously; **the dreaming does
not**: the pipeline is the user's product, and editing it is an
architecture decision — those are made with him, in session. The
stage prepares everything so that session is short; it decides
nothing alone.

## Preconditions

`.state.md` says `stage: close` and names the wave; the release trace
shows the prod train completed. Missing ⇒ halt, back to stage 5. The
Linear Project moves to its closing status via the Linear MCP — **the
MCP missing is a halt**. (Each stage moves the Project when it opens.)

## What this stage produces

```
designs-root/2026-08-15-workspace-invites/
└── w01-invite-by-email/
    └── 05-close/
        ├── closure.md             # the wave's final record — what shipped, what didn't, who owns what's left
        └── dreaming/
            └── ledger.md          # the board: every note with evidence + suggestion, closed with the user's ruling
```

Plus: the pipeline repo's own commits (the dreaming's applied
lessons, one per change, revertible), the boards swept, and the next
wave opened — or the workstream Done.

## 1 — The quiet window

Prod has been live since the release; before closing, verify it is
**quietly** live: the alarms silent over the window the rollout
defined, no error-rate drift, nothing in the release's `pending`
still burning. Noise here is not this stage's to fix — it is a fix
issue routed back through the machinery; the closure waits.

## 2 — Closure

Write `05-close/closure.md` from
[templates/closure.md](templates/closure.md): what shipped (versions,
the wave's stories), what was deliberately left out and why, the
pendencies with named owners, and the numbers that tell the wave's
story (issues, rounds, halts) — set against the previous wave's
`closure.md` when one exists, so faster-or-slower is measured, not
felt. Sweep the boards: every issue of the
wave closed or explicitly re-homed, the Linear Project to its final
state for this wave. The blueprint gets the wave's final touch —
shipped, dated, same URL forever.

## 3 — Dreaming — a working session, not an autonomous pass

The input is the wave's full trace, not one file. Read, in order:
the workstream's `dreaming-notes.md` (fed on the spot by every stage
— every failure, every halt, every surprise — including the stage-4
maestro's build and environment entries, and the **`[user]` entries**
the user dictated mid-wave, per the house rule); every stage's review
audit (`00-discovery/reviews.md`, `01-design/reviews.md`,
`02-plan/reviews.md`) — what blocked a round and what it cost to
clear; **the user's rulings** — the workstream's `rulings.md` (every
ruling he gave, at every stage, with his reason), the precision tables
per lens in the review audits and the execution tab: a lens whose
findings he repeatedly dismisses is miscalibrated, a suggestion he
repeatedly overrules is a taste entry the ledger is missing — both are
candidates for the board; and the execution and release traces
(`03-execution/trace.md`, the per-repo and `e2e` lane traces,
`04-release/trace.md`) — the halts, the rounds, what dragged. A
friction counts wherever it was recorded. The pass:

1. **The board.** Every note becomes an entry in
   `05-close/dreaming/ledger.md`: what happened, where it bit, the
   evidence — and the session's **suggestion**: the class it sees (or
   "incident — suggest discard", one line of why), the destination,
   and where it can, the concrete edit it would make, grounded in the
   house standards — a line in a standard, a rule in an author or
   reviewer prompt, a step in a skill, a change in the implementation
   machinery. The suggestion ruler is still **class, not incident**:
   a lesson must generalize — "this will bite again, anywhere this
   pattern appears" — and the destination triage still routes before
   writing: **pipeline-class** → this repo's skills, agents,
   workflows, or standards; **venture-class** → the venture's own
   `CLAUDE.md`/docs, never the public pipeline; **repo-class** → that
   product repo's `docs/`. No note is skipped.
2. **Recurrence check — before proposing.** Every applied pipeline
   lesson is a `learn(<stage>): <class>` commit (step 4), so the git
   history is the index of what the pipeline has learned. For each
   pipeline-class candidate, dispatch a subagent (general-purpose; a
   cheaper model is fine) with the candidate class and the suggested
   diff, to search `git log --grep='^learn('` (default window: the
   whole history) and answer in three lines: does a `learn(` commit
   already cover this class — hash, what it changed, whether that
   rule still stands in the current text. The answer rides along as
   evidence in the entry: found and still standing ⇒ **the rule did
   not hold** — the entry is presented as a recurrence, with both
   hashes; that is a conversation, never a silent re-edit. Venture-
   and repo-class candidates run the same check against their own
   repo's history. "Same class" is a semantic judgment — that is why
   a subagent, not a grep.
3. **The session — the user rules.** Present the board, organized
   for ruling: the `[user]` entries first — he wrote them knowing
   what he wants; confirm the edit and move on — then the session's
   candidates, ranked by what each would have saved this wave, then
   the suggested discards, one line each, rescuable. The user rules
   every entry: **edit as suggested** · **edit differently** (his
   words become the diff) · **discard** · **park**. Nothing is
   edited, and nothing is dropped, without his ruling — a discard is
   a ruling too.
4. **Apply what he ruled.** One `learn(<stage>): <class>` commit per
   change, revertible, the ledger entry and his ruling in the commit
   message — the `learn(` type is what keeps the history searchable
   as the lessons' index. The editing obeys the house: surgical
   diffs, the standards' own rules applied to editing the standards,
   and **push only with the user's explicit approval** — the commits
   wait locally with everything else.
5. **The record.** The ledger closes with every ruling written next
   to its entry — what was edited (and its commit), what was
   discarded and why, what was parked. Nothing learned, or dropped,
   in silence.

## 4 — The wave loop

Read `waves.md`:

- **A next wave exists** ⇒ `.state.md` → `stage: design · wave: wNN+1`
  — its design starts from the README seed the cut created; commit the
  workstream folder and suggest `/clear`: the session continues into
  stage 2 of the new wave, with the shipped wave as living context in
  the repos' docs.
- **That was the last wave** ⇒ the workstream is **Done**: the Linear
  Project closed, the folder committed, the blueprint final. Say so
  plainly — done is done.

## Gates

| Gate | Rule |
|---|---|
| Quiet window | closure only over a verified-quiet prod; noise routes back as a fix issue |
| Every note on the board | the ledger covers 100% of the input — dreaming-notes (the `[user]` entries leading), `rulings.md`, the review audits and their precision tables, the traces — each with evidence and a suggestion |
| Recurrence check | no pipeline candidate reaches the board without the subagent sweep of the `learn(` history; a repeated class is presented as recurrence with both hashes, never silently re-edited |
| Class, not incident | the ruler for the session's suggestions — what does not generalize is suggested as a discard; the user can overrule |
| Destination triage | venture- and repo-class lessons never land in the public pipeline repo |
| The user rules | no edit, no discard, no park without his ruling — the dreaming decides nothing alone |
| One commit per lesson | every applied edit is an independently revertible `learn(...)` commit, the ruling in its message |
| The record | the ledger closes with every ruling written next to its entry — nothing learned, or dropped, in silence |

## Lifecycle

- **Permanent:** everything under `05-close/`, and the workstream's
  `dreaming-notes.md` (consumed, kept — with the review audits and
  the traces, the ledger's source).
- **Working:** nothing — this stage's scratch is its output.

## Boundaries

No new features, no fixes beyond routing what the quiet window
surfaces. The dreaming edits process, never product. This is the last
stage: what it does not close, it re-homes with a named owner — a
workstream never ends with unowned loose ends.
