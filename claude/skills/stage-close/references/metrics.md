# The delivery metrics — step 2 of stage 6

The pipeline measures itself. Every stage records its wall-clock time,
his hours, the agent hours, the tokens, the rounds and the findings by
class as it runs (discovery in `.state.md`'s `## Metrics` block, design
in `01-design/telemetry.md`, plan and execute in their telemetry and
board, release in its trace). The close gathers them into one file,
`05-close/metrics.json`, and the weekly retro reads that file across the
week's workstreams to see the trend.

The retro's `numbers` (blueprint schema) stay as they are; these
metrics live beside them, in their own file, because the blueprint's
build accepts only its own keys.

## `metrics.json`

```json
{
  "workstream": "2026-10-01-example",
  "closedAt": "2026-10-09",
  "leadTimeDays": 6.4,
  "stages": [
    {"stage": "discovery", "wallClockH": 3.1, "hisH": 1.6, "agentH": 4.2, "tokensM": 9.8, "rounds": 1, "source": ".state.md:41-52"},
    {"stage": "design", "wallClockH": 2.0, "hisH": 0.3, "agentH": 7.5, "tokensM": 21.0, "rounds": 2, "source": "01-design/telemetry.md:12"}
  ],
  "totals": {"hisH": 2.4, "agentH": 31.0, "tokensM": 80.5},
  "findingsByClass": [{"stage": "design", "class": "correctness", "found": 9, "sustained": 6}],
  "revertRate": {"value": 0.03, "reverts": 1, "commits": 34, "source": "04-release/notes/api.json"},
  "changeFailureRate": {"value": 0.0, "failed": 0, "deploys": 2, "source": "blueprint/release/release.json"},
  "structure": {"duplication": [3.1, 3.0], "complexity": [11.2, 11.4], "boundaryViolations": [0, 0], "gateRuntimeS": [212, 230], "reverts": 1}
}
```

| Key | What | From |
|---|---|---|
| `leadTimeDays` | the workstream's first commit to its production deploy | `git log --reverse --format=%aI <merge-base>..feat/<ws> \| head -1` and the production time in `release.json` |
| `stages[]` | per stage: wall-clock hours, his hours, agent hours, tokens (millions), rounds, and the line it came from | the telemetry harvester |
| `totals` | the sums of `stages[]`, `null` when any stage is `null` for that key | the session |
| `findingsByClass[]` | per stage and class (as the stage names its classes): found, sustained | the documents and execution harvesters |
| `revertRate` | reverts over the commits the workstream merged into `main` | the release-scribes' records |
| `changeFailureRate` | production deploys of this workstream that needed a rollback or a hotfix, over its production deploys | `release.json` (rollbacks, hotfixes, deploys) |
| `structure` | before → after, the five numbers of step 2 | `05-close/structure/` |

A value the record does not carry is `null` with no `source`; never
estimated, never filled from memory. A stage that recorded nothing is
a `W-` friction (the stage did not measure itself) with its stage.

The retro shows these in one table under "In numbers"; the weekly
compares them across workstreams and weeks.
