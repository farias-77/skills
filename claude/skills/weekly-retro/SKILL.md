---
name: weekly-retro
description: Runs the weekly retro of the pipeline over the workstreams closed in the chosen week. One weekly-reader (Opus 5.5, medium) reads each closed workstream's record (05-close/retro.md, metrics.json and each stage's telemetry, rulings.md, dreaming-notes.md, taste-notes.md) and returns what went wrong in each and the patterns across them, each with a proposed change to the pipeline. The session (Opus 5.5, medium) writes the week's board and asks the user to rule each proposal (apply, park, drop); it applies the approved ones to the pipeline repo, verifies them, and commits with his word. No issue is opened anywhere. The only place where the pipeline changes. Use once a week, or when the user asks to review the pipeline's lessons.
disable-model-invocation: false
argument-hint: "[week, e.g. 2026-W40; defaults to the week that just ended]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Artifact, Bash
---

# The weekly retro

Every workstream closes with a retro that changes nothing (stage 6):
its numbers, three things that went well, three where it got stuck,
at most three ideas, all kept in the workstream. Once a week this
skill reads the workstreams closed that week together and turns what
repeats into changes to the pipeline, with the user ruling each one.
A friction seen once may be chance; seen in three workstreams it is
the pipeline.

The session is **Opus 5.5 at medium effort**. It does not read the
records itself: the reader does, and the session writes the board,
asks, and edits.

## The pattern

```
0 Open     the week (argument, or the one that just ended) · the workstreams closed in it
1 Read     weekly-reader (Opus 5.5, medium) over every closed workstream's record
           → per workstream what went wrong · the patterns across · a proposal each
2 Board    _retros/<YYYY>-W<ww>.md: the week in numbers, the patterns ranked, each with its edit
3 Rule     apply · park · drop, one question per proposal, four per call
4 Apply    each approved edit into the pipeline repo, verified, shown as a diff
5 Commit   with his word, one commit per proposal; the record closed with the shas
```

## Step 0 — open

The consuming project's `CLAUDE.md` names the designs root. The week
is ISO (`YYYY-Www`), Monday to Sunday, the one given or the one that
just ended. A workstream belongs to the week when its
`blueprint/close/retro.json` has `closed` inside it. A workstream
closed without a retro is listed and skipped. The weekly records live
in the designs root under `_retros/`; the pipeline repo is the one
this skill is installed from (`${CLAUDE_SKILL_DIR}/../../..`).

## Step 1 — read

Dispatch one `weekly-reader (Opus 5.5, medium)` with the week, the
pipeline repo's path, the earlier weekly records under `_retros/` (for
what he parked and dropped), and per workstream the paths of its
record:

| Path | What it holds |
|---|---|
| `05-close/retro.md` | the numbers, went well, got stuck, the ideas, his notes |
| `05-close/metrics.json` and each stage's `telemetry.json` | time and cost per stage, the slowest steps, the structure of main before and after |
| `rulings.md` | his rulings and the ones taken in his place |
| `dreaming-notes.md` | the frictions noted on the spot, his `[user]` notes |
| `taste-notes.md` | the patterns in his rulings |

It returns what went wrong in each workstream and the patterns across
them, each pattern with its evidence and a proposed edit. A group
parked at an earlier weekly comes back here with whatever this week
adds.

## Step 2 — the board

Write `_retros/<YYYY>-W<ww>.md`:

- **The week in numbers**: one row per workstream (time, his hours,
  cost, entries, rounds, findings), and the week against the earlier
  weekly records.
- **The patterns, ranked** (his notes first, then how many workstreams
  saw it, then the time it cost). Each opens with one plain sentence of
  what would change in practice, then the evidence (the workstreams and
  a quote), his notes verbatim, the **edit proposed** (the file and the
  exact change) and what it would cost. A pattern he cannot picture
  from its first sentence is dropped on the spot.
- **Not for the pipeline**: a pattern that belongs to the project's
  doctrine, listed for him to take there. A structure-of-main measure
  past its threshold is listed here as a refactor the project builds
  as its next demand.
- **Dropped before**: a proposal he dropped at an earlier weekly is
  listed with the week and his words, not asked again; he may pull one
  back by naming it.

Publish it as an artifact and give him the link.

## Step 3 — rule

Through the question tool, one question per proposal, four per call,
in rank order: the plain sentence, the evidence in one line, the edit.
The answers: **apply** (recommended when two or more workstreams saw
it, or he noted it), **park** (it returns next week) and **drop**. He
may change an edit in "Other"; the changed edit is the one applied.
Each ruling goes into the weekly record with his words.

## Step 4 — apply

For each approved proposal, edit the target file in the pipeline
repo: the change proposed, nothing around it. Keep the pipeline
generic: no company, stack or product in its files. After each edit,
verify what can be verified (`node --check` on a workflow, the
dry-runs in `scripts/`, the blueprint build on a fixture when the
blueprint changed, `node scripts/check-models.mjs` when an agent
changed) and show the diff.

## Step 5 — commit

The pipeline repo is shared: commit only with his word, one commit per
proposal, the message saying what changed and why, with the
workstreams that taught it. Push only when he says so. No issue is
opened anywhere: the weekly record is the index. The record gets the
shas and is closed. Then the week's report: follow
claude/docs/stage-report.md (video, slides; the board is its page).

## Boundaries

This skill changes the pipeline and nothing else: no product code, no
project doctrine, no workstream folder but the weekly record. Never an
edit he did not approve.
