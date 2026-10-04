# Stage telemetry

Every stage measures itself the same way, in one file in its own
folder, so the close can add the stages up without reading six
formats:

| Stage | File |
|---|---|
| discovery | `00-discovery/telemetry.json` |
| design | `01-design/telemetry.json` |
| plan | `02-plan/telemetry.json` |
| execute | `03-execution/telemetry.json` |
| release | `04-release/telemetry.json` |
| close | `05-close/telemetry.json` |

The session that conducts the stage owns the file. It creates it at the
stage's open with `openedAt` and the session's model, adds a step row
as each step ends, and fills the totals at the stage's close, before
the close commit. Agents never write it; their numbers come from what
the harness returns for each agent or workflow run (tokens and
duration, where the result carries them).

## The shape

```json
{
  "stage": "design",
  "workstream": "2026-10-01-example",
  "openedAt": "2026-10-01T09:02:00Z",
  "closedAt": "2026-10-01T12:40:00Z",
  "session": {"model": "Opus 5.5", "effort": "high"},
  "steps": [
    {"step": "D0", "startedAt": "2026-10-01T09:02:00Z", "endedAt": "2026-10-01T09:20:00Z", "wallClockMin": 18, "hisMin": 0},
    {"step": "D4", "startedAt": "2026-10-01T10:05:00Z", "endedAt": "2026-10-01T10:31:00Z", "wallClockMin": 26, "hisMin": 22}
  ],
  "wallClockMin": 218,
  "hisMin": 31,
  "agents": [
    {"agent": "design-writer", "model": "Sonnet 5.5", "effort": "high", "runs": 4, "hours": 1.2, "tokens": 2100000},
    {"agent": "design-reviewer", "model": "Opus 5.5", "effort": "medium", "runs": 1, "hours": 0.3, "tokens": 600000}
  ],
  "tokens": {"session": 2400000, "agents": 9800000, "total": 12200000},
  "rounds": 2,
  "findingsByClass": [
    {"class": "correctness", "found": 9, "sustained": 6},
    {"class": "coverage", "found": 4, "sustained": 4}
  ],
  "cost": {"usd": null, "source": null},
  "gaps": ["the session's own tokens: the harness did not report them"]
}
```

| Field | What | Rule |
|---|---|---|
| `stage`, `workstream` | the stage's name as `.state.md` writes it; the slug | required |
| `openedAt`, `closedAt` | ISO 8601 UTC (`date -u +%FT%TZ`) | `closedAt` null while the stage runs |
| `session` | the conducting session's model and effort | the ones it actually ran on, not the ones the skill asks for |
| `steps[]` | one row per step of the stage's pattern (discovery D0–D7, design D0–D6, P0–P6, the release's steps, the close's steps; execute: one row per entry, with `step` the entry id) | `wallClockMin` from the two timestamps; `hisMin` the minutes the stage waited on him or talked with him in that step |
| `wallClockMin`, `hisMin` | the stage's totals | `wallClockMin` from `openedAt` to `closedAt`; `hisMin` the sum of the steps' |
| `agents[]` | one row per agent name, with its model and effort as the frontmatter fixes them | `runs`, and `hours` and `tokens` summed from the harness's results |
| `tokens` | the session's, the agents', the total | the session's from the harness when it reports them, else null |
| `rounds` | the review rounds run (execute: the sum over entries) | 0 when the stage has no review |
| `findingsByClass[]` | per class, in the stage's own class names: found, sustained | from the stage's review returns (`byClass` where the workflow gives it) |
| `cost` | `usd` and where it came from (`harness`: the session's cost line or the results' cost) | null when the harness reports none; never estimated from a price table |
| `gaps[]` | what the stage could not measure, one line each | empty when nothing is missing |

A stage may add one object named after itself (`"discovery": {…}`)
for the counts only it has; the close reads the shared fields and
carries that object as it is.

A value the stage cannot measure is `null` and a line in `gaps`; never
estimated, never filled from memory. A stage without the file is a
friction the close records ("the stage did not measure itself").

## Who reads it

`stage-close` sums the six files into `05-close/metrics.json`
(`references/metrics.md`): the close-harvester of the `telemetry`
source reads them and returns one row per stage with its `file:line`.
The weekly retro compares `metrics.json` across workstreams. The
stage's own report quotes it for the message's telemetry line.
