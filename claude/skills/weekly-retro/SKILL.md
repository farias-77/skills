---
name: weekly-retro
description: The weekly review of the whole factory, and the only place the pipeline and the project's standards change. Once a week it reads every workstream that moved that week - closed or in flight - with the numbers the stages record on their own, writes one board, asks him one question per proposal (apply, park, drop), lands what he approved in the pipeline, and hands the approved standards changes to the standards skill as one pull request per project. Use at the end of each week, or when he asks to review the pipeline's lessons.
argument-hint: "[ISO week, e.g. 2026-W41; default: the week that just ended]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Skill, Bash
---

# The weekly retro

Every workstream records its own numbers and closes with a retro that
changes nothing. Once a week this session reads them together, with the
workstreams still in flight, and turns what repeats into changes, with
him ruling each one. A friction seen once may be chance; seen in three
workstreams, it is the pipeline. A rule the reviewers keep enforcing by
hand is a check the project should have.

## The bar

The week is done when every line holds:

1. Every workstream that moved this week is on the board, with its
   numbers from `metrics.json` and, when in flight, where it stands.
2. Every proposal has its evidence, its exact edit, the number it
   should move, and his ruling.
3. What he approved for the pipeline is landed and verified; what he
   approved for a project's standards is one pull request there.
4. Last week's changes sit beside this week's numbers.

## The flow

```
/weekly-retro [week] → 0 the week · the workstreams that moved · last week's board
  → 1 read: telemetry on each · retros and rulings (you) · the rest by scout
  → 2 the board → 3 rule ◄ him (four questions per call)
  → 4 apply: the pipeline in a worktree · the standards through the standards skill
  → 5 land with his word
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| every step | you (Opus 5.5, high) | `_retros/<YYYY>-W<ww>.md` |
| numbers | `telemetry.mjs` on each workstream | `metrics.json`, with its `signals` |
| facts | `scout` (Haiku 5.5, high) | a quote from a notes file, an earlier board |
| standards | the `standards` skill, update mode | one pull request per project |

## What you read

| File | When |
|---|---|
| [references/governance.md](references/governance.md) | before step 2: who decides what, the shape of a proposal, the numbers, versions and rollback |
| each workstream's `retro.md` (or `close.md`) and `rulings.md` | whole, at step 1: you rule on them |
| `<kit>/skills/standards/references/book.md` | before you rank a standards proposal |

## Files

```
<designs-root>/_retros/<YYYY>-W<ww>.md     the board (template: templates/board.md)
<designs-root>/<slug>/metrics.json         refreshed by telemetry.mjs for every workstream that moved
```

## 0 · Open

The week is ISO (`YYYY-Www`), Monday to Sunday: the one given, or the
one that just ended. A workstream **moved** this week when a commit in
its folder falls inside it; it is **closed** when its `.state.md` says
`closed` and its retro's "Closed:" date is inside the week. Short
routes and hotfixes count. Read last week's board for its landed shas
and its parked list. Nothing moved and nothing is due: say so in one
line and stop.

## 1 · Read

- **Numbers by script.** `node <kit>/scripts/telemetry.mjs <slug> --ws
  <workstream>` for every workstream that moved; then `jq` over the
  `metrics.json` files: totals, the per-stage rows, and `signals`.
- **You read**, whole: each closed workstream's retro and `rulings.md`.
- **In flight:** each one's `.state.md` (stage and step), the days since
  its stage opened, and what waits on him (`_coordination.md`, its
  board or trace).
- **By scout:** a quote you need from a `dreaming-notes.md`, the
  earlier boards' dropped and parked lists.
- **Live fixes:** `git log` of the pipeline repo's `main` since last
  week's board. Every commit not landed at a weekly is a live fix to
  ratify.
- **Incidents:** the week's `incident` issues of each project.

## 2 · The board

Write `_retros/<YYYY>-W<ww>.md` from
[templates/board.md](templates/board.md):

1. **The week in numbers**: one row per closed workstream (route,
   clock, cost estimate, his touches, wait on him). Raw numbers; a
   median per route only after 10 workstreams on it.
2. **In flight**: one row per open workstream: stage, days in it, what
   waits and on whom.
3. **The signals**, across the workstreams: entries merged on their
   first pass, A.n and X.n rounds per workstream, the parked reasons,
   the share of rulings taken in his place, the dismissed share per
   review lens, the standards rules cited most and never.
4. **Last week's changes** beside the numbers they should have moved.
5. **Proposals for the pipeline**, ranked: his `[user]` notes first,
   then how many workstreams saw it, then the time it cost. Each in the
   shape governance.md sets.
6. **For the standards**, per project: the retros' "For the standards"
   rows merged, the map drifts, and **rule → check** candidates (a rule
   cited three or more times this week, with the check that would catch
   it: a lint rule, a structure check, a test helper, a generator).
7. **Live fixes to ratify**, the **fixed items** that are due
   (governance.md), and what he **dropped before**.

## 3 · Rule

Through the question tool, four per call, in rank order: one question
per proposal, pipeline and standards alike (**apply**, your pick when
two or more workstreams saw it or he noted it · **park**, it returns
next week · **drop**), one per live fix (**keep** · **revert**), and one
per rule → check candidate (**make it a demand** · **park** ·
**drop**). Each question carries the plain sentence, the evidence in
one line and the edit. An edit he changes in "Other" is the one
applied. His answers go into the board with his words.

## 4 · Apply

**The pipeline**, in a separate worktree of the pipeline repo, never in
the live checkout the sessions read: the approved edit and nothing
around it; the pipeline stays generic (no company, product or private
name); `node --check` on a workflow or script, `bash -n` on a shell
file, then `bash tests/run.sh`; show him the diff.

**The standards**: load the `standards` skill in update mode with the
project and the approved rows. It opens one pull request in that
project, which he (or its code owner) merges.

**A rule → check he made a demand**: write its one-paragraph demand
into the board and give him the `/lets-cook` line on his clipboard.

## 5 · Land

With his word: one commit per pipeline proposal (what changed, why,
the workstreams that taught it), then fast-forward the live `main`; a
workstream in flight picks it up at its next stage. Push only on his
word. Write the shas and the pull request links into the board and
close it.

This skill changes the pipeline and, through the `standards` skill,
opens pull requests to the projects; it touches no product code and no
workstream's folder but the board, and lands nothing he did not
approve.
