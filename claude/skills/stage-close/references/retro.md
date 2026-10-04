# The retro — step 4 of stage 6

The retro is short and its format is fixed, so every workstream's
reads the same and the weekly retro can lay them side by side. It is
written for two readers: the user now, and the weekly retro later,
which reads every workstream closed that week. It is a record in the
workstream (`05-close/retro.md`, and `blueprint/close/retro.json` for
the Close tab); nothing is opened anywhere.

```
Numbers        time and cost per stage · entries · rounds · findings · beside the previous workstream
Went well ×3   the three things that went smoothest, each with its evidence
Got stuck ×3   the three places that cost the most, each with where the time went
Ideas ≤3       what could change so a stuck item does not come back
His notes      his words, verbatim, when he comments
```

## Numbers

From `05-close/metrics.json` (step 1), never from a reading: per
stage, the wall-clock hours, his hours, the agent hours, the tokens,
the cost, the rounds and the findings (found → sustained); the
entries from `execution.json`; the totals. Beside the totals, the
previous workstream's, when one exists. A stage that did not measure
itself is `null` in its row, and one of the places it got stuck when
nothing costlier fills the three.

## Went well ×3

The three things the record shows went smoothest and should not be
lost when the pipeline changes: a stage that closed in one round, an
entry that merged on its first pass, a mechanism that caught a real
defect. Each with its evidence (`file:line` or a number). Three, fewer
only when the record has fewer.

## Got stuck ×3

The three places that cost the most, ranked by the time they cost.
Each: what happened, the stage it bit, **where the time went** (the
step and the hours, from the slowest steps or the harvest's minutes),
and the evidence (`file:line` and the quote). His `[user]` notes about
a place it got stuck always enter, in his words, even when another
cost more. The rest of the frictions stay in `harvest.json`; the
weekly reads them there.

## Ideas, at most 3

What could change so a stuck item does not come back. Each: the stage
(or `house`), the file it would touch (a skill, an agent, a workflow,
a template, the project's doctrine), the change in one or two
sentences, why (the time it gives back), and the stuck item behind it.
An idea is a proposal, not a decision, and it stays in the workstream:
no issue is opened. A stuck item with no idea (a one-off) stays
without one.

## His notes

When he reads the retro and comments, his words go in verbatim, each
attached to the idea or stuck item it refers to when he names one,
otherwise as a note of its own. They are the input the weekly retro
weighs most.
