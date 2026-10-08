# The workstream's retro

A short record for the weekly retro. It changes nothing in the
pipeline: an idea here is only an idea until he rules on it at the
weekly.

## The format (`templates/retro.md`)

```
05-close/retro.md
├── Numbers       time · cost · his touches, per stage (from metrics.json; null stays null)
├── Went well     ≤ 5
├── Got stuck     ≤ 5   each with the time it cost; slowness counts
├── Ideas         ≤ 5   each with the number it should move (time, cost or touches)
└── His notes     [user] lines, verbatim, appended later
```

## Where it comes from

| Source | What it gives |
|---|---|
| `metrics.json` (`telemetry.mjs`) | the numbers; the stage that took longest; the wait on him |
| the harvest of `scout (Haiku 5.5, medium)` | each friction with `path:line`, the quote, the time it cost |
| `dreaming-notes.md` | frictions noted on the spot; his `[user]` notes; `[taste]` patterns in his rulings |
| `rulings.md` | what he ruled, and where he ruled against the recommendation |

## How to choose

1. **His `[user]` notes weigh first.** Each one he wrote becomes a
   "Got stuck" or an "Idea", in his words.
2. **Time is an error.** A step that took long, a wait on a render, a
   rate-limit pause, a red that cost a round: each is a "Got stuck"
   with its minutes. What would have made the workstream faster is an idea.
3. **Numbers, never memory.** A number not in `metrics.json` is not in
   the retro. A `null` is written as "not measured" with the gap.
4. **At most 5 per section.** Pick what would change a decision at the
   weekly; group what is one idea.
5. **Unmerged work kept for later** (the cleanup's `kept` lines): one
   "Got stuck" line saying where it is.
