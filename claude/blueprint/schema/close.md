# The close blueprint — `blueprint/close/retro.json`

Stage 6 writes one file, by the session: `retro.json`, the retro of the
workstream in a fixed shape. The Close tab renders it; the weekly retro
reads the same file across every workstream of a week. The build
requires a closed release (`blueprint/release/release.json` with
`closed` set) and refuses with the field named: a number key missing
or not a number (or `null`), an idea without evidence, an evidence id
that names no friction, a user note attached to an id that does not
exist, a closed retro with a sweep line open, **a text over its word
cap**.

## The voice

Short sentences, one idea each; the user's words verbatim. The reader
wants to know, in five minutes, how the workstream went, what repeats
enough to change, and what he already said about it.

## `retro.json`

```json
{
  "workstream": "2026-10-01-bakery-orders",
  "closed": null,
  "report": { "inOneSentence": "…", "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ] },
  "numbers": {
    "days": 6, "stories": 5, "entries": 5, "amendments": 1,
    "roundsDiscovery": 2, "roundsDesign": 1, "roundsPlan": 2, "roundsExecute": 11,
    "found": 142, "sustained": 61, "deferred": 12, "latitude": 9, "dismissed": 60,
    "parked": 1, "stagingRuns": 2, "stagingReds": 1, "fixes": 1, "rollbacks": 0, "hotfixes": 0,
    "watchRead": 1, "watchOwned": 1, "rulings": 38, "tokensM": null
  },
  "lenses": [ { "stage": "execute", "lens": "exec-lens-workaround", "found": 7, "sustained": 6, "deferred": 0, "latitude": 0, "dismissed": 1 } ],
  "worked": [ { "what": "the foundation removed every merge conflict between entries", "evidence": "board.md: 0 conflicts in 5 rebases" } ],
  "wrong": [
    { "id": "W-1", "stage": "execute", "what": "the visual lens compared screenshots taken before the data loaded",
      "where": "03-execution/entries/E-03/run.json:212", "quote": "…", "cost": "one round on two entries" }
  ],
  "ideas": [
    { "id": "I-1", "stage": "execute", "lands": "pipeline", "target": "claude/agents/builder-frontend.md",
      "change": "journeys wait for the data to render before the screenshot", "why": "a wasted round per screen", "evidence": ["W-1"] }
  ],
  "userNotes": [ { "on": "I-1", "words": "…" } ],
  "sweep": [ { "what": "5 entry worktrees removed", "done": true } ]
}
```

- `numbers`: every key above present; `null` when the record does not
  carry it, never estimated.
- `lenses[].stage` is `discovery`, `design`, `plan`, `execute` or
  `release`.
- `wrong[].id` is `W-<n>`; `ideas[].id` is `I-<n>`; `ideas[].lands` is
  `pipeline`, `doctrine`, `venture` or `incident`; a `pipeline` idea has
  a `target`; `evidence` names existing `W-` ids.
- `userNotes[].on` is an existing `I-`/`W-` id or `general`.
- `closed` is set when the user said it is closed; then every sweep
  line is `done` or says what is left for him.

Word caps: `what` 25 · `cost` 15 · `change` 35 · `why` 20 ·
`inOneSentence` 35 · `threeThings[].p` 35. Ids, paths, quotes, numbers
and `words` are not capped.
