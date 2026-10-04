# The numbers — step 1 of stage 6

The pipeline measures itself. Every stage records its wall-clock time,
his minutes, the agents with their model and effort, the tokens, the
rounds, the findings by class and the cost as it runs, in one file of
one shape: `<stage-folder>/telemetry.json`
([claude/docs/telemetry.md](../../../docs/telemetry.md)). The close sums
them with a script into one file, `05-close/metrics.json`; the retro's
numbers come from it, and the weekly retro reads it across the week's
workstreams to see the trend.

```
node "${CLAUDE_SKILL_DIR}/scripts/telemetry-sum.mjs" <workstream> --out 05-close/telemetry-sum.json
```

It returns `stages[]`, `totals`, `findingsByClass`, `slowest` (the ten
longest steps of the workstream: stage, step, minutes), the stages
with no file (`missing`) and every gap a stage declared; it refuses a
file that is not in the shared shape, naming the file and the field
(the session fixes the file from the stage's record, or the stage
counts as missing). The session copies them into `metrics.json` with
the keys below. A workstream older than the convention has no
numbers per stage: they are `null`, and the retro says so.

The blueprint's build reads `metrics.json` and shows it in the Close
tab ("The numbers per stage").

## `metrics.json`

```json
{
  "workstream": "2026-10-01-example",
  "closedAt": "2026-10-09",
  "leadTimeDays": 6.4,
  "stages": [
    {"stage": "discovery", "wallClockH": 3.1, "hisH": 1.6, "agentH": 4.2, "tokensM": 9.8, "rounds": 1, "costUSD": null, "source": "00-discovery/telemetry.json"},
    {"stage": "design", "wallClockH": 2.0, "hisH": 0.3, "agentH": 7.5, "tokensM": 21.0, "rounds": 2, "costUSD": null, "source": "01-design/telemetry.json"}
  ],
  "totals": {"hisH": 2.4, "agentH": 31.0, "tokensM": 80.5, "costUSD": null},
  "findingsByClass": [{"stage": "design", "class": "correctness", "found": 9, "sustained": 6}],
  "slowest": [{"stage": "execute", "step": "E-03", "minutes": 212}],
  "revertRate": {"value": 0.03, "reverts": 1, "commits": 34, "source": "04-release/notes/api.json"},
  "changeFailureRate": {"value": 0.0, "failed": 0, "deploys": 2, "source": "blueprint/release/release.json"},
  "structure": {"duplication": [3.1, 3.0], "complexity": [11.2, 11.4], "boundaryViolations": [0, 0], "gateRuntimeS": [212, 230], "reverts": 1}
}
```

| Key | What | From |
|---|---|---|
| `leadTimeDays` | the workstream's first commit to its production deploy | `git log --reverse --format=%aI <merge-base>..feat/<ws> \| head -1` and the production time in `release.json` |
| `stages[]` | per stage: wall-clock hours, his hours, agent hours, tokens (millions), rounds, cost in USD, and the file it came from | `telemetry-sum.mjs` |
| `totals` | the sums of `stages[]`, `null` when any stage is `null` for that key | `telemetry-sum.mjs` |
| `findingsByClass[]` | per stage and class (as the stage names its classes): found, sustained | `telemetry-sum.mjs` |
| `slowest[]` | the ten longest steps: stage, step, minutes | `telemetry-sum.mjs`; where the time went |
| `revertRate` | reverts over the commits the workstream merged into `main` | the release-scribes' records |
| `changeFailureRate` | production deploys of this workstream that needed a rollback or a hotfix, over its production deploys | `release.json` (rollbacks, hotfixes, deploys) |
| `structure` | before → after, the five numbers of step 2 | `05-close/structure/` |

A value the record does not carry is `null` with no `source`; never
estimated, never filled from memory. A stage in `missing` did not
measure itself: its row is `null`, and the retro says so. The close's own row is added at step
6, once `05-close/telemetry.json` is closed, and the totals are summed
again.

## The structure of main

Before → after, from step 1's structure check. The threshold is the
doctrine's when it names one, otherwise:

| Measure | Past the threshold when |
|---|---|
| Boundary violations | more after than before |
| Duplication, complexity | 10% worse, or past the doctrine's ceiling |
| Gate runtime | 20% slower |
| Reverts | two or more |

A measure past it is one of the places the workstream got stuck, with
its numbers and the files the check names; the weekly retro lists it
as a refactor the project builds as its next demand.

The retro shows these in one table under "Numbers", beside the
previous workstream's totals; the weekly compares them across
workstreams and weeks.
