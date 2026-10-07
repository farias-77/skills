---
name: weekly-retro
description: The weekly retro, the only place where the pipeline changes. Once a week the session (Opus 5.5, high) reads the retro and the rulings of every front closed that week, writes the week's board (raw numbers per front and route, last week's changes beside them, proposals each with its evidence and exact edit, the live fixes to ratify, the fixed items), asks the user one question per proposal (apply, park, drop), applies what he approved in a separate worktree of the pipeline repo, verifies it, and lands it by fast-forward with his word. No video, no slides. Use once a week, or when the user asks to review the pipeline's lessons.
argument-hint: "[ISO week, e.g. 2026-W41; default: the week that just ended]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Bash
---

# The weekly retro

Every front closes with a retro that changes nothing. Once a week this
session reads them together and turns what repeats into changes to the
pipeline, with him ruling each one. A friction seen once may be
chance; seen in three fronts, it is the pipeline.

## The flow

```
0 open    the week · the fronts closed in it · last week's board
1 read    retro.md + rulings.md of each front (you) · numbers by jq · the rest by scout
2 board   _retros/<YYYY>-W<ww>.md: numbers · last week's changes · proposals · live fixes · fixed items
3 rule    one question per proposal and per live fix, four per call
4 apply   a separate worktree · the exact edit · verified · diff shown
5 land    with his word: one commit per proposal · fast-forward the live main · the board closed
```

Read [references/governance.md](references/governance.md) before step
2: who decides what, how a proposal is shaped, how the pipeline is
versioned and rolled back.

## Step 0 · Open

The week is ISO (`YYYY-Www`), Monday to Sunday: the one given, or the
one that just ended. A front belongs to it when its `.state.md` says
`closed` and the "Closed:" date of its `05-close/retro.md` falls inside
the week. Short routes and hotfixes count (their record is `close.md`,
with the same line). The boards live in
`<designs-root>/_retros/`; the pipeline repo is the one this skill is
installed from.

No front closed: the board holds only the live fixes and the fixed
items that are due. Nothing due either: say so in one line and stop.

## Step 1 · Read

- **You read**, whole: each front's `05-close/retro.md` (or `close.md`)
  and `rulings.md`. They are short, and they are what you rule on.
- **Numbers by `jq`**, never by reading: from each front's
  `metrics.json`, the totals (calendar and clock minutes, cost, his
  touches, waits on him) and the per-stage rows.
- **The rest by `scout (Haiku 5.5, medium)`**: a quote you need from a
  front's `dreaming-notes.md`, a line of a board, the earlier boards'
  "dropped" and "parked" lists.
- **Live fixes:** `git log` of the pipeline repo's `main` since last
  week's board (its sha is in the board). Every commit not applied at a
  weekly is a live fix to ratify.
- **Incidents:** the week's `incident` issues of the project
  (`gh issue list --label incident`).

## Step 2 · The board

Write `_retros/<YYYY>-W<ww>.md` from `templates/board.md`:

1. **The week in numbers.** One row per front: route, clock, cost
   (estimate), his touches. Raw numbers; a median per route only
   after 10 fronts on that route.
2. **Last week's changes**, beside the numbers, so he sees their
   effect.
3. **Proposals**, ranked: his `[user]` notes first, then how many
   fronts saw it, then the time it cost. Each opens with one plain
   sentence of what changes in practice, then the evidence (the fronts,
   a quote), the exact edit (the file and the change) and what it
   costs. A proposal he could not picture from its first sentence is
   dropped on the spot.
4. **Live fixes to ratify**: each commit, its dreaming line, keep or
   revert.
5. **Not for the pipeline**: what belongs to the project's standards
   (a PR there, his), listed for him.
6. **Fixed items** that are due (governance.md).
7. **Dropped before**: his earlier "drop", with the week; never asked
   again unless he names it.

## Step 3 · Rule

Through the question tool, four per call, in rank order: one question
per proposal (apply, recommended when two or more fronts saw it or he
noted it · park, it returns next week · drop) and one per live fix
(keep · revert). The question carries the plain sentence, the evidence
in one line and the edit. He may change an edit in "Other"; the
changed edit is the one applied. His answers go into the board with
his words.

## Step 4 · Apply

In a separate worktree of the pipeline repo, never in the live
checkout the sessions read:

1. The approved edit, nothing around it. The pipeline stays generic:
   no company, product or private name in its files.
2. Verify what can be verified: `node --check` on a workflow or script,
   `bash -n` on a shell file, `bash claude/hooks/tests/guard-irreversible.test.sh`
   when the guard changed, the dry-runs under `scripts/`, the model
   check when an agent changed.
3. Show him the diff.

## Step 5 · Land

With his word: one commit per proposal (what changed, why, the fronts
that taught it), then fast-forward the live `main`. A front in flight
picks the change up at its next stage. Push only on his word. Write
the shas into the board and close it.

## Boundaries

This skill changes the pipeline and nothing else: no product code, no
project standard, no front's folder but the board. The one exception is
a lint or test check opened as a PR to the project for his approval,
as governance.md allows. Never an edit he did not approve.
