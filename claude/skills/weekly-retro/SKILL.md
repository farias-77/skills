---
name: weekly-retro
description: Runs the weekly retro of the pipeline — gathers the retro of every workstream closed in the week (blueprint/close/retro.json), groups the ideas that repeat across workstreams, sums the precision of every reviewer over the week, and brings the user a board of proposed changes to the pipeline, the ones seen most and the ones he commented first; he decides each group (apply, park, drop); the session applies the approved ones to the pipeline repo, verifies them, and commits with his word. The only place where the pipeline changes. Runs in Claude Code with an Opus 5.5 session at medium effort. Use once a week, or when the user asks to review the pipeline's lessons.
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
2. Group     ideas that propose the same change merge into one group, with every workstream and
             friction behind it; the precision of every reviewer summed over the week
3. Board     the week's record, written and published: the groups ranked, each with a proposed edit
4. Decide    the user rules each group: apply · park · drop (the question tool, four per call)
5. Apply     each approved group edited into the pipeline repo, verified, shown as a diff
6. Commit    with his word, one commit per group; the record closed with the shas
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

## Step 2 — group

- **Ideas.** Two ideas are one group when they would make the same
  change to the same target, even if worded differently; one
  friction behind two ideas links them too. Each group carries every
  workstream, idea id, friction id and user note behind it.
- **Where it lands.** `pipeline` groups are candidates for this
  session. `doctrine` groups are listed for the user to take to the
  project's doctrine; `venture` and `incident` groups are listed and
  nothing more.
- **Precision.** Sum found · sustained · deferred · latitude ·
  dismissed per stage and reviewer over the week. A reviewer under
  20% sustained over at least ten findings is its own group
  ("calibrate or remove"), with its numbers.
- **Rank.** The user's own notes first, then by how many workstreams
  saw it, then by cost.

## Step 3 — the board

Write `_retros/<YYYY>-W<ww>.md`: the week in one table (each
workstream with its numbers), the precision table, and the groups in
rank order. Each pipeline group has: what repeats, the evidence (the
workstreams and the quotes), the user's notes verbatim, the **edit
proposed** (the file and the exact change, short enough to judge),
and what it would cost (a longer prompt, one more agent, a slower
stage). Publish it as an artifact and give him the link: he reads it
on one screen and answers on the other.

## Step 4 — decide

Through the question tool, one question per group, four per call, in
rank order: the group in the question (what repeats, the evidence in
one line, the edit), and the answers **apply** (recommended when two
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
record gets the shas and is closed.

## Boundaries

This skill changes the pipeline and nothing else: no product code,
no project doctrine (a doctrine group is handed to the user), no
workstream folder but the weekly record. Never an edit the user did
not approve.
