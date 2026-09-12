---
name: stage-close
description: Conducts stage 6 (Closure & Dreaming) — writes the workstream's closure record, sweeps the repos and GitHub so the house is ready for the next demand, and prepares the dreaming board: every friction collected across the six stages presented with evidence and a suggested edit grounded in the house standards; the user rules each entry in session, and only ruled lessons become revertible learn() commits. Runs in Claude Code with a Fable session. Use when a workstream's .state.md says stage close, or to resume a closure in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Artifact, AskUserQuestion, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *), Bash(rm *)
---

# Stage 6: Closure & Dreaming

The demand is live. This stage does two things nothing else does: it
**archives the workstream as a complete record** and leaves the repos
ready for the next demand, and it **makes the pipeline better than it
was when the demand started**: the frictions every stage noted on the
spot become edits to the skills themselves. There is no waiting
period before closing: if production hurts later, the demand is
reopened as a fix, it does not hold the close.
The closure and the sweep run autonomously; **the dreaming does
not**: the pipeline is the user's product, and editing it is an
architecture decision — those are made with him, in session. The
stage prepares everything so that session is short; it decides
nothing alone.

## The pattern

```
1. Closure    05-close/closure.md: what shipped, what did not, pendencies with owners,
              the numbers against the previous workstream.
2. Sweep      GitHub and the repos: wave and workstream branches gone, PRs closed,
              alpha reseeded, the blueprint final at the same URL.
3. Dreaming   the board from every stage's record; the user rules every entry;
              one learn() commit per applied lesson.
4. Done       .state.md → closed; the pipeline commits presented for push.
```

## Preconditions

`.state.md` says `stage: close` and `chair: fable`; `04-release/trace.md`
shows the prod train completed and verified and the watch read (or
its pendencies given an owner); `blueprint/release/release.json` has
its close. Missing ⇒ halt, back to stage 5.

```
<workstream>/
├── .state.md                  # stage: close · chair: fable → closed
└── 05-close/
    ├── closure.md             # the final record — what shipped, what didn't, who owns what's left
    └── dreaming/
        └── ledger.md          # the board: every note with evidence + suggestion, closed with the user's ruling
```

Plus: the pipeline repo's own commits (the dreaming's applied
lessons, one per change, revertible) and the repos swept.

## 1 — Closure

Write `05-close/closure.md` from
[templates/closure.md](templates/closure.md): what shipped (versions,
the waves and their stories), what was deliberately left out and why,
the pendencies with named owners, and the numbers that tell the
demand's story (from `03-execution/audit.md`, the wave reports and the
release trace: stories, review rounds, findings per lens and what
survived, fix passes, suite runs, stops, departures, choices where
the documents were silent, the audit's reversals, tokens per wave),
set against the previous workstream's `closure.md` when one exists,
so faster-or-slower is measured, not felt.

## 2 — Sweep

GitHub and the repos, per repo: every wave PR and the workstream PR
merged (re-read) or explicitly re-homed; the story, wave and
workstream branches deleted (their content lives on `main` and in the
tags); no open PR left from this demand; the local clones on `main`
with no stray worktree. Alpha: at `main`, the smoke fixtures reseeded
so the next demand starts on a clean stage. The blueprint gets its
final touch: shipped, dated, republished at the same URL. A repo left
in any other state is a pendency with an owner in `closure.md`, never
a silence.

## 3 — Dreaming — a working session, not an autonomous pass

The input is the demand's full record, not one file. Read, in order:
the workstream's `dreaming-notes.md` (fed on the spot by every stage,
every failure, every stop, every surprise, including stage 4's
trace and report entries, and the **`[user]` entries** the user
dictated along the way, per the house rule); every stage's review
audit (`00-discovery/reviews.md`, `01-design/reviews.md`,
`02-plan/reviews.md`) — what blocked a round and what it cost to
clear; **the user's rulings** — the workstream's `rulings.md` (every
ruling he gave, at every stage, with his reason), the precision tables
per lens in the review audits and the execution tab: a lens whose
findings he repeatedly dismisses is miscalibrated, a judge he
repeatedly overrules is miscalibrated — both are candidates for the
board; **the workstream's `taste-notes.md`** — every design card he
chose against the recommendation and every ruling he gave for a reason
that will hold again, noted raw by the stages: each note is an entry
on the board in its own right, and this session decides with him what
it becomes (a standard line, a skill rule, a judge or author prompt)
or whether it is dropped — nothing in it is a rule before that; and
**the audit** (`03-execution/audit.md`: every departure he kept is
a standard candidate, every reversal is a lesson for the builder or a
lens, every choice where the documents were silent is a plan or design
gap); and the execution and release traces
(`03-execution/<wNN>/trace.md` and `report.md` per wave,
`04-release/trace.md`): the stops, the rounds, what dragged. A
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
   candidates, ranked by what each would have saved this demand, then
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

## 4 — Done

`.state.md` → `stage: closed`, with one line saying what is live where
and what is pending with whom. Commit the workstream folder. Present
the pipeline repo's `learn(` commits and the workstream commits for
push; push only with the user's explicit approval. Say plainly that
the workstream is done and the repos are ready for the next demand.

## Gates

| Gate | Rule |
|---|---|
| No waiting | the close does not wait on production; what hurts later reopens the demand as a fix |
| Every note on the board | the ledger covers 100% of the input — dreaming-notes (the `[user]` entries leading), `taste-notes.md`, `rulings.md`, the review audits and their precision tables, the audit, the traces — each with evidence and a suggestion |
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

No new features, no fixes: what production surfaces after the close
reopens the demand through stage 4, it does not run here. The
dreaming edits process, never product. This is the last
stage: what it does not close, it re-homes with a named owner — a
workstream never ends with unowned loose ends.
