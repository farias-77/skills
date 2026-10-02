---
name: weekly-retro
description: Runs the weekly retro of the pipeline — gathers the retro of every workstream closed in the week (blueprint/close/retro.json), groups the ideas that repeat across workstreams, sums the precision of every reviewer over the week, measures the structure of main (duplication, complexity, boundary violations, test runtime, revert rate) against its trend and, past a threshold, proposes a refactor slice, and brings the user a board of proposed changes to the pipeline, the ones seen most and the ones he commented first; he decides each group (apply, park, drop); the session applies the approved ones to the pipeline repo, verifies them, and commits with his word. The only place where the pipeline changes. Runs in Claude Code with an Opus 5.5 session at medium effort. Use once a week, or when the user asks to review the pipeline's lessons.
disable-model-invocation: false
argument-hint: "[week, e.g. 2026-W40; defaults to the week that just ended]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Artifact, Bash
---

# The weekly retro

Every workstream closes with a retro that changes nothing (stage 6).
Once a week, this skill reads all of them together and turns what
repeats into changes to the pipeline, with the user deciding each one.
A friction seen once may be chance; seen in three workstreams it is
the pipeline. That is why the change happens here and not at each
close.

The session is **Opus 5.5 at medium effort**: it groups ideas across
workstreams, judges when two ideas are the same, and edits the
pipeline.

## The pattern

```
0. Open      the week (argument, or the one that just ended) · the designs roots the project names
1. Gather    every workstream whose retro.json has `closed` inside the week, plus the ideas the
             previous weekly records parked
   Measure   the structure of main: the project's structure check, the test runtime, the revert rate
             → the trend over the last four weeks → past a threshold, a refactor-slice group
2. Group     ideas that propose the same change merge into one group, with every workstream and
             friction behind it; the precision of every reviewer summed over the week; a group he
             already dropped is listed, not asked
3. Board     the week's record, written and published: the groups ranked, each with a proposed edit
4. Decide    the user rules each group: apply · park · drop (the question tool, four per call)
5. Apply     each approved group edited into the pipeline repo, verified, shown as a diff
6. Commit    with his word, one commit per group; the record closed with the shas → the week's report
```

## Step 0 — open

The consuming project's `CLAUDE.md` names where its workstreams live
(the designs root). The week is ISO (`YYYY-Www`), Monday to Sunday,
the one given or the one that just ended. The pipeline repo is the
one this skill is installed from (`${CLAUDE_SKILL_DIR}/../../..`); the
weekly records live in the designs root, under `_retros/`.

## Step 1 — gather

Every `blueprint/close/retro.json` under the designs root whose
`closed` falls inside the week; and every group the earlier weekly
records under `_retros/` ruled `park`, which come back this week. The
retros are small and structured: the session reads them itself. A
workstream closed without a retro is listed and skipped.

## Step 1b — the structure of main

The user's fear is code that works today and becomes a time bomb:
nobody can extend it, and every change gets slower. Each close
records what its workstream did to `main`; this step watches the
trend, so a slow drift no single workstream would show is still seen.
For every repo a workstream of the week merged into:

- **Measure** `main` at the week's last commit with the project's
  structure check (the role `docs/project-contract.md` names; the
  doctrine names its command) in a throwaway worktree, and compare it
  with the previous week's output by the project's comparison
  command. Save both under `_retros/<YYYY>-W<ww>-structure/`.
- **Five numbers**: duplication, complexity, boundary violations
  (from the structure check); the test runtime (the median duration
  of the gate's CI runs on `main` in the week); the revert rate
  (reverts over the commits merged into `main` in the week, from
  `git log`).
- **The trend**: this week against the median of the last four weekly
  records (fewer weeks: what exists; the first week is the baseline).
- **The threshold**, the doctrine's when it names one, otherwise:

| Measure | Past the threshold when |
|---|---|
| Boundary violations | more than last week |
| Duplication, complexity | 10% worse than the four-week median, or past the doctrine's ceiling |
| Test runtime | 20% slower than the four-week median |
| Revert rate | above 5% of the week's commits on `main`, or two reverts |

A measure past its threshold makes a **refactor slice** group, ranked
first on the board: what crossed, the numbers and the trend, the
files the structure check names, the golden path each should converge
to, and the acceptance — the measure back under the threshold with
every existing acceptance check unchanged and green. It is not a
pipeline edit: on **apply** the session writes its brief to
`<designs root>/_refactor/<YYYY>-W<ww>.md`, and it is the next demand
the project builds, through stage 4 like any entry. A project with no
structure check: the trend table says "not measured" and the board
lists a doctrine group to add one.

## Step 2 — group

- **Ideas.** Two ideas are one group when they would make the same
  change to the same target, even if worded differently; one
  friction behind two ideas links them too. Each group carries every
  workstream, idea id, friction id and user note behind it.
- **Where it lands.** `pipeline` groups are candidates for this
  session. `doctrine` groups are listed for the user to take to the
  project's doctrine; `venture` and `incident` groups are listed and
  nothing more.
- **Already ruled.** A group that proposes what he dropped at an
  earlier weekly (same change, same target, even worded otherwise) is
  not asked again: it goes to "dropped before" on the board with the
  week, his words and the new evidence, and he may pull one back by
  naming it.
- **Precision.** Sum found · sustained · deferred · latitude ·
  dismissed per stage and reviewer over the week. A reviewer under
  20% sustained over at least ten findings is its own group
  ("calibrate or remove"), with its numbers.
- **Rank.** A refactor slice first, then the user's own notes, then
  by how many workstreams saw it, then by cost.

## Step 3 — the board

Write `_retros/<YYYY>-W<ww>.md`: the week in one table (each
workstream with its numbers), the structure of main (the five numbers
per repo, this week against the four-week median, past the threshold
or not), the precision table, the groups in rank order, and "dropped
before". Each pipeline group opens with one plain sentence of what
would change in practice for him and for the stage it touches, before
any file or term: a group he cannot picture is dropped on the spot,
whatever it was worth. Then: what repeats, the evidence (the
workstreams and the quotes), the user's notes verbatim, the **edit
proposed** (the file and the exact change, short enough to judge),
and what it would cost (a longer prompt, one more agent, a slower
stage). Publish it as an artifact and give him the link: he reads it
on one screen and answers on the other.

## Step 4 — decide

Through the question tool, one question per group, four per call, in
rank order: the group in the question (the plain sentence first,
then what repeats, the evidence in one line, the edit), and the answers **apply** (recommended when two
or more workstreams saw it, or he noted it), **park** (it returns
next week with whatever the week adds) and **drop**. He may change an
edit in "Other"; the changed edit is the one applied. Each ruling goes
into the weekly record with his words.

## Step 5 — apply

For each approved group, edit the target file in the pipeline repo:
the change the group proposed, nothing around it. Keep the pipeline
generic: no company, stack or product in the pipeline's files; a
change that only makes sense for one project belongs to that
project's doctrine, and the session says so instead of applying it.
After each edit, verify what can be verified: `node --check` on a
workflow, the blueprint build on a fixture when the blueprint
changed, the references between skills and agents still resolving.
Show the diff of every group.

## Step 6 — commit

The pipeline repo is shared: commit only with his word. One commit
per group, the message saying what changed and why, with the
workstreams that taught it. Push only when he says so. The weekly
record gets the shas and is closed. Then the week's report: follow
claude/docs/stage-report.md (video, slides; the board is its page).

## Boundaries

This skill changes the pipeline and nothing else: no product code,
no project doctrine (a doctrine group is handed to the user), no
workstream folder but the weekly record and an approved refactor
slice's brief under `_refactor/`. The structure check runs in a
throwaway worktree, removed after, and never on a branch it moves.
Never an edit the user did not approve.
