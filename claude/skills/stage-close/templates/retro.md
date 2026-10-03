# Retro — <workstream>

<!--
  Written by the SESSION at stage 6 from the harvest. The same content
  goes to blueprint/close/retro.json in the fixed shape the weekly
  retro reads. Nothing here is a decision.
-->

**In one sentence:** <what this workstream delivered and how it went>

## In numbers

| Days | Stories | Entries | Amendments | Rounds (disc · design · plan · exec) | Found → sustained | Parked | Staging reds | Fixes | Rollbacks | Hotfixes |
|---|---|---|---|---|---|---|---|---|---|---|
| | | | | | | | | | | |

## Delivery metrics

| Lead time | His hours | Agent hours | Tokens (M) | Revert rate | Change failure rate |
|---|---|---|---|---|---|
| <days> | <h> | <h> | <M> | <n/m> | <n/m> |

| Stage | Wall-clock (h) | His (h) | Agents (h) | Tokens (M) | Rounds | Findings by class (found → sustained) |
|---|---|---|---|---|---|---|

(`metrics.json`; `null` where the stage did not record it)

## Structure of main

| Measure | Before (`<merge-base sha>`) | After (`<release merge sha>`) | Past the threshold |
|---|---|---|---|
| Duplication | | | no \| **yes → W-n** |
| Complexity | | | |
| Boundary violations | | | |
| Gate runtime | | | |
| Reverts | — | <n> | |

<the files the check names when a measure worsened> | not measured: the project has no structure check (→ I-n, doctrine)

## Precision per reviewer

| Stage | Reviewer | Found | Sustained | Deferred | Latitude | Dismissed |
|---|---|---|---|---|---|---|

## What worked

- <what> — <evidence>

## What went wrong

### W-1 · <title>

- **Stage:** <stage> · **Where:** `<file:line>`
- **Quote:** "<verbatim>"
- **Cost:** <a round, a stop, a red, a day, a question>

## Ideas for the pipeline

### I-1 · <title>

- **Stage:** <stage> · **Lands:** pipeline | doctrine | venture · **Target:** `<pipeline file>`
- **Change:** <one or two sentences>
- **Why:** <the cost it removes>
- **Evidence:** W-1, W-3

## The user's notes

- "<his words, verbatim>" — on <I-n | W-n | general>

## Launch package

- Film: `05-close/launch/launch.mp4` · <m:ss> · <MB> MB · vertical <MB> MB | not made: <why>
- Features in the film: <n> · cut: <feature — why>
- Known flaws: <what> | none

## Sweep

- <what was cleaned> | <what is left, and the command that removes it>
