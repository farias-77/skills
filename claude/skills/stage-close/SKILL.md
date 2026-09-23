---
name: stage-close
description: Conducts stage 6 (Close) — the retro of one workstream, with nothing changed in the pipeline. The session (Opus 5.5, medium) harvests the whole record through one close-harvester (Sonnet 5, high) per source (the reviews and rulings of the document stages, the execution's board and runs, the release's trace, the notes), writes the workstream in numbers and the precision of every reviewer, cleans what the workstream left behind, and writes the retro — what worked, what went wrong, and what could change in the pipeline, each idea with its evidence and the file it would touch; the user reads it and adds his view, recorded verbatim; nothing is decided, no issue is opened, no pipeline file is edited. The retro is saved in a fixed shape (retro.md + retro.json) so the weekly-retro skill can gather every workstream of the week. Use when a workstream's .state.md says stage close, or to resume a close in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, Bash
---

# Stage 6: Close

The workstream is in production. This stage looks back at how it got
there and writes down what the pipeline could learn from it. It is a
**retro, not a change**: nothing in the pipeline repo is edited, no
issue is opened, no idea is decided here. Once a week the user runs
`weekly-retro` over every workstream closed that week and decides
there what changes in the pipeline; one friction seen in three
workstreams weighs more than one seen once, and only a week's view
shows it.

The session is **Opus 5.5 at medium effort**. It does not read the
record whole: the harvesters do, one per source, and bring back the
numbers and every friction with its evidence. The session writes the
retro from what they brought and talks it through with the user.

## The pattern

```
0. Open      .state.md says close and the release is closed
1. Harvest   close-harvest workflow: one close-harvester (Sonnet 5, high) per source, in parallel
             → 05-close/harvest/<source>.json: numbers, precision per reviewer, every friction with evidence
2. Numbers   the workstream in numbers and the precision per stage and reviewer
3. Sweep     worktrees, branches and stacks the workstream left behind; the state closed
4. Retro     what worked · what went wrong · ideas for the pipeline, each with evidence and the
             file it would touch → 05-close/retro.md and blueprint/close/retro.json
5. Talk      the user reads it (the Close tab) and adds his view; his words go in verbatim as
             his notes; nothing is ruled
6. Close     the build, .state.md → closed, the commit of the workstream folder
```

The user is in the room only at step 5. There are no questions to
rule: he reads, comments if he wants, and says it is closed.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the session | Opus 5.5, medium | the numbers, the sweep, the retro, the talk |
| `close-harvester` × 1 per source | Sonnet 5, high | reads one source of the record; returns numbers, precision and frictions with `file:line` and the quote; decides nothing |

## Preconditions

`.state.md` says `stage: close`; `blueprint/release/release.json` has
`closed` set. Missing: halt, back to stage 5.

```
designs-root/<workstream>/05-close/
├── harvest/<source>.json   # each harvester's answer, verbatim
├── retro.md                # the retro, for reading
└── trace.md                # one line per step, `date -u`
blueprint/close/retro.json  # the same retro, in the fixed shape weekly-retro reads
```

## Step 1 — harvest

By [references/harvest.md](references/harvest.md): run
`${CLAUDE_SKILL_DIR}/../../workflows/close-harvest.js` by `scriptPath`
with the workstream, the language, the number keys and the four
sources (documents, execution, release, notes) with their paths. Save
each answer as it came to `05-close/harvest/<source>.json` before
anything is summed.

## Step 2 — the numbers

Sum what the harvesters counted into the keys of
`${CLAUDE_SKILL_DIR}/../../blueprint/schema/close.md`: the days, the
stories and entries, the rounds per stage, the findings, the parked,
the staging runs and reds, the fixes, rollbacks and hotfixes, the
watch, the rulings. And the precision per stage and reviewer: found ·
sustained · deferred · latitude · dismissed. A number the record does
not carry is `null`, never estimated. There is no comparison with the
previous workstream here; the weekly retro compares.

## Step 3 — sweep

What the workstream left behind, so the next one starts clean: the
entry worktrees and their branches merged or abandoned, a local stack
still up, a feature branch already in `main`, a stale lock. Remove
what is safely removable (merged branches, dead worktrees, stopped
stacks) and list the rest for the user with the command that removes
it. Never delete a branch that is not merged, never touch `main` or
the staging branch.

## Step 4 — the retro

By [references/retro.md](references/retro.md), from the harvest and
the numbers:

- **What worked** — what the record shows went smoothly and should be
  kept, each with its evidence.
- **What went wrong** — every friction worth a line: what happened,
  where (`file:line`), the quote, what it cost (a round, a stop, a red,
  a day, a question the user had to answer).
- **Ideas for the pipeline** — what could change so it does not
  happen again: the stage, the pipeline file it would touch (a skill,
  an agent, a workflow, a template), the change in one or two
  sentences, why, and the frictions that support it. An idea that
  belongs to the project's doctrine or to the venture, not to the
  pipeline, is marked so.

Write `05-close/retro.md` from [templates/retro.md](templates/retro.md)
and `blueprint/close/retro.json` in the shape the schema fixes; build
and publish the blueprint.

## Step 5 — the talk

Tell the user the retro is ready, with the Close tab's link and the
three things that matter most. He reads, and anything he says about it
goes into `retro.md` and `retro.json` as his notes, verbatim, with the
idea or friction it refers to when he names one. Nothing is ruled and
nothing is asked through the question tool: his notes are the input
the weekly retro gives the most weight to. When he says it is closed,
it is.

## Step 6 — close

Rebuild the blueprint, `.state.md` → `stage: closed`, and commit the
workstream folder (push only with his explicit approval). Suggest
`/clear`.

## How to write

Say what you mean. Literal sentences, concrete values, the user's
words verbatim. An idea names the file it would touch and the evidence
behind it; an idea with no evidence is not written.

## Resuming

Everything is in files. Read `.state.md`, `05-close/trace.md`,
`05-close/harvest/`, `retro.md`. Continue from the first step with no
trace line.

## Boundaries

No edit to the pipeline repo, no issue opened, no idea decided: the
weekly retro does that. No edit to product code. The sweep never
deletes unmerged work.
