# The close blueprint — `blueprint/close/retro.json`

Stage 6 writes one file, by the session: `retro.json`, the retro of the
workstream in its fixed short format (stage-close
`references/retro.md`). The Close tab renders it; the weekly retro
reads the same file across every workstream of a week. The build
requires a closed release (`blueprint/release/release.json` with
`closed` set) and refuses with the field named: a number key missing
or not a number (or `null`), more than three went well, got stuck or
ideas, an idea without the stuck item behind it, an id that names
nothing, a user note attached to an id that does not exist, a key of
the retired retro (`worked`, `wrong`, `lenses`, `sweep`), **a text over
its word cap**.

The numbers per stage are not in `retro.json`: the build reads
`05-close/metrics.json` (stage-close `references/metrics.md`, summed
from every stage's `telemetry.json`) and shows it in the Close tab
after the totals: one row per stage (wall-clock, his hours, agent
hours, tokens, rounds, cost) with the totals, the lead time, the
revert and change failure rates. It refuses a value there that is
neither a number nor `null`, naming the field.

## The voice

Short sentences, one idea each; the user's words verbatim. The reader
wants to know, in five minutes, how the workstream went, where the
time went, and what he already said about it.

## `retro.json`

```json
{
  "workstream": "2026-10-01-bakery-orders",
  "closed": null,
  "report": { "inOneSentence": "…", "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ] },
  "numbers": {
    "wallClockH": 41.5, "hisH": 3.2, "agentH": 60.1, "tokensM": 80.5, "costUSD": null,
    "entries": 5, "rounds": 9, "found": 31, "sustained": 18,
    "previous": { "workstream": "2026-09-20-bakery-menu", "wallClockH": 55.0, "hisH": 4.1, "agentH": 72.4, "tokensM": 96.0, "costUSD": null,
      "entries": 6, "rounds": 14, "found": 52, "sustained": 21 }
  },
  "wentWell": [ { "what": "every entry merged on its first review pass", "evidence": "03-execution/board.md: 5/5 passes 1" } ],
  "gotStuck": [
    { "id": "S-1", "stage": "execute", "what": "the gate's journeys timed out under load", "timeWent": "E-03, two load waits",
      "hours": 3.5, "where": "03-execution/entries/E-03/run-1.json:212", "quote": "…" }
  ],
  "ideas": [
    { "id": "I-1", "stage": "execute", "target": "claude/skills/stage-execute/SKILL.md",
      "change": "start the journeys' stack once per wave instead of once per entry", "why": "gives back the load waits", "evidence": ["S-1"] }
  ],
  "userNotes": [ { "on": "I-1", "words": "…" } ]
}
```

- `numbers`: every key above present; `null` when the record does not
  carry it, never estimated. `previous` is the last workstream closed
  before this one, with the same keys and its `workstream`; `null`
  when this is the first.
- `wentWell`: at most three; `gotStuck`: at most three, ranked by the
  time they cost; `ideas`: at most three.
- `gotStuck[].id` is `S-<n>`; `stage` is `discovery`, `design`,
  `plan`, `execute`, `release` or `close`; `timeWent` says where the
  time went (the step); `hours` a number or `null`.
- `ideas[].id` is `I-<n>`; `stage` as above or `house`; `target` the
  file it would touch, or `null`; `evidence` names existing `S-` ids.
- `userNotes[].on` is an existing `I-`/`S-` id or `general`.
- `closed` is set when the user said it is closed.

Word caps: `wentWell[].what` 25 · `gotStuck[].what` 25 · `timeWent`
15 · `change` 35 · `why` 20 · `inOneSentence` 35 · `threeThings[].p`
35. Ids, paths, quotes, numbers and `words` are not capped.
