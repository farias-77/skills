# The delivery metrics — step 2 of stage 6

The pipeline measures itself. Every stage records its wall-clock time,
his minutes, the agents with their model and effort, the tokens, the
rounds, the findings by class and the cost as it runs, in one file of
one shape: `<stage-folder>/telemetry.json`
([claude/docs/telemetry.md](../../../docs/telemetry.md)). The close sums
them with a script into one file, `05-close/metrics.json`, and the
weekly retro reads that file across the week's workstreams to see the
trend.

```
node "${CLAUDE_SKILL_DIR}/scripts/telemetry-sum.mjs" <workstream> --out 05-close/harvest/telemetry.json
```

It returns `stages[]`, `totals`, `findingsByClass`, the stages with no
file (`missing`) and every gap a stage declared; it refuses a file that
is not in the shared shape, naming the file and the field (the session
fixes the file from the stage's record, or the stage counts as
missing). A workstream older than the convention (a `## Metrics`
block in `.state.md`, a `telemetry.md`) goes through the `telemetry`
harvester instead, with those paths.

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
    {"stage": "discovery", "wallClockH": 3.1, "hisH": 1.6, "agentH": 4.2, "tokensM": 9.8, "rounds": 1, "costUSD": null, "source": "00-discovery/telemetry.json"},
    {"stage": "design", "wallClockH": 2.0, "hisH": 0.3, "agentH": 7.5, "tokensM": 21.0, "rounds": 2, "costUSD": null, "source": "01-design/telemetry.json"}
  ],
  "totals": {"hisH": 2.4, "agentH": 31.0, "tokensM": 80.5, "costUSD": null},
  "findingsByClass": [{"stage": "design", "class": "correctness", "found": 9, "sustained": 6}],
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
| `findingsByClass[]` | per stage and class (as the stage names its classes): found, sustained | `telemetry-sum.mjs`; the documents and execution harvesters for a stage whose file lacks them |
| `revertRate` | reverts over the commits the workstream merged into `main` | the release-scribes' records |
| `changeFailureRate` | production deploys of this workstream that needed a rollback or a hotfix, over its production deploys | `release.json` (rollbacks, hotfixes, deploys) |
| `structure` | before → after, the five numbers of step 2 | `05-close/structure/` |

A value the record does not carry is `null` with no `source`; never
estimated, never filled from memory. A stage in `missing` is a `W-`
friction (the stage did not measure itself) with its stage; each
declared gap is a line under it. The close's own row is added at step
6, once `05-close/telemetry.json` is closed, and the totals are summed
again.

The retro shows these in one table under "In numbers"; the weekly
compares them across workstreams and weeks.
