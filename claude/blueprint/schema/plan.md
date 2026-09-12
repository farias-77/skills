# The plan blueprint — what each writer and the conductor leave in JSON

Stage 3 writes under `<workstream>/blueprint/plan/`: the conductor
writes `sequence.json` (the cut: from A to B, the frozen contracts,
the lanes with their rows, the waves with their walks, the cut's
cards, the team, the pre-flight), `plan-report.json` (the plain layer
the tab opens with) and `plan-review.json` (the rounds and the
rulings); each `plan-writer` (Sonnet 5, high) writes
`goals/<repo>-<wNN>.json` in the same pass as its goal.
`node claude/blueprint/build.mjs <workstream>` validates them, embeds
the goal `.md` files whole, and assembles the Plan tab. The build
refuses with the field named: a row with no proof, a wave requiring
a row that does not exist, a lane × wave with rows and no goal JSON
or no goal file, a duplicate row number, **a text over its word
cap**. Text fields accept two inline marks: `` `code` `` and
`**bold**`. No HTML. Everything in the workstream's language.

## The voice: technical, and an intern reads it to the end

Same rules as the design ([schema/design.md](design.md)): short
sentences, one idea each; the real name of a thing once, then what it
does; a number only when it changes what the reader would decide;
lists curated, never complete; the text invites reading. The Plan
tab's reader wants to know, in ten minutes: where we start, where we
land, what each session builds, where the master stops to accept,
and what is his to hand over before he leaves.

## Word caps (the build refuses a field over its cap)

| Field | Cap | Field | Cap |
|---|---|---|---|
| `fromA` / `toB` | 60 | `contracts[].name` | 10 |
| `rows[].what` | 18 | `rows[].touches` / `.readBy` | 14 |
| `lanes[].sharesWith` | 20 | `lanes[].preflight[]` | 16 |
| `waves[].accepts` | 25 | `waves[].suites[].note` | 12 |
| `waves[].masterDecides` / `.parks` | 30 | `team[].owns` | 20 |
| `preflight[].item` | 16 | decisions `question` | 16 |
| decisions `chosen` | 30 | decisions `why` | 25 |
| decisions `options[].label` | 18 | decisions `options[].cost` | 14 |
| goal `intro` | 45 | goal `rows[].builds` | 25 |
| goal `rows[].proof` | 25 | goal `worthALook[]` | 20 |
| goal `workerDecides[]` | 18 | report `inOneSentence` | 35 |
| report `threeThings[].p` / `needsYourEye[].p` | 35 | report `lanesPlain` / `wavesPlain` / `teamPlain` | 45 |
| report `reviewPlain` | 45 | review `decisions[].plain` | 25 |
| review `title` | 12 | review `ruling` | 25 |
| review `why` | 30 | review `rounds[].changed` | 20 |

`run`, `expect`, `see`, `where`, `first` and every id, number, name,
path and command are not capped: they are copied exactly.

## `sequence.json` (the conductor)

```json
{
  "fromA": "Today the ingestion repo does not exist; the tracking API and the panel are in alpha and prod with the war-room data.",
  "toB": "Every night the pipeline reads the Minute panel, writes the recordings and the panel shows where each number came from.",
  "contracts": [
    { "name": "`recordings` item", "fixedIn": "data-model.md §recordings", "writtenBy": "ingestion 1.4", "readBy": "tracking 2.1 · front 2.4" }
  ],
  "lanes": [
    { "repo": "labs-api-ingestion", "session": "minute-ingestion-ingestion",
      "sharesWith": null, "preflight": ["the Minute password, in SSM (1.0)"],
      "rows": [
        { "num": "1.0", "story": "S-001", "what": "capture the real panel responses with curl", "wave": "w01",
          "proof": { "run": "ls smoke/fixtures/panel/*.json | wc -l", "expect": "5" },
          "after": null, "par": null, "touches": "`smoke/fixtures/panel/`", "readBy": "1.2 (the stub serves these)" },
        { "num": "1.2", "story": "S-002", "what": "the alpha stub serves the captured responses", "wave": "w01",
          "proof": { "run": "bash smoke/run.sh stub", "expect": "`0 failed` of 6 cases" },
          "after": "1.1", "par": null, "touches": "`smoke/stub/`", "readBy": "1.3" },
        { "num": "2.4", "story": "S-006", "what": "the Person screen shows the quality cards", "wave": "w02",
          "proof": { "see": "`localhost:5173/pessoas/<id>` against the alpha API, both themes, 390 px", "where": "ui.md §Person · `ui/Person.dc.html`" },
          "after": "2.1", "par": "2.3", "touches": "`PersonLevel.tsx`", "readBy": null }
      ] }
  ],
  "waves": [
    { "n": "w01", "name": "the pipeline runs",
      "accepts": "The tech team starts a run by hand and it ends Succeeded with the orphans in the tables.",
      "requires": ["1.0", "1.1", "1.2", "1.3", "1.4", "1.5", "1.6", "1.7"],
      "folders": ["smoke/stub/", "smoke/run/", "smoke/status/"],
      "suites": [{ "repo": "labs-api-ingestion", "cases": 34, "note": "minutes" }],
      "walk": [
        { "run": "aws stepfunctions start-execution --state-machine-arn … --input '{}'", "expect": "status `SUCCEEDED` within 10 min" },
        { "see": "the panel still opens", "where": "screenshot to `03-execution/w01/proof/`" }
      ],
      "masterDecides": "counts, pointers, the order of two independent rows",
      "parks": "a change to what a story delivers; a contract; a stateful deletion the goal does not explain",
      "shadow": true }
  ],
  "decisions": [
    { "id": "P-cut-1", "doc": "cut", "when": "session", "question": "One wave or two?",
      "options": [ { "label": "A) one wave, three lanes in parallel", "cost": "first look later" }, { "label": "B) two waves", "cost": "the front waits for the pipeline" } ],
      "recommended": "A", "pick": "B", "chosen": "B) two waves — look at the pipeline alone first", "why": "\"quero ver a pipeline rodando antes\"", "againstRecommendation": true }
  ],
  "team": [
    { "session": "master", "name": "minute-ingestion-master", "model": "Fable 5.1, high", "folder": "~/clonex/labs", "owns": "the waves: accepts, routes fixes, the walk", "first": "/stage-execute 2026-09-08-minute-ingestion" },
    { "session": "worker", "name": "minute-ingestion-ingestion", "model": "Opus 5, high", "folder": "~/clonex/labs", "owns": "lane labs-api-ingestion", "first": "/stage-execute 2026-09-08-minute-ingestion worker labs-api-ingestion" }
  ],
  "preflight": [ { "item": "the Minute password in SSM `/labs/ingestion/minute/password`", "row": "1.0", "status": "handed" } ]
}
```

- A row's `proof` is `{run, expect}` or `{see, where}`; nothing else.
  `after` is a row number or `null`; `par` a row number or `null`.
- `waves[].requires` lists row numbers that exist in some lane;
  `folders` is the affected folders; `suites` names each repo's
  whole suite with its size; `walk` steps are `{run, expect}` or
  `{see, where}`; `shadow` says whether the whole suites run after
  the gate closes.
- `decisions` uses the design's card shape; `doc` is `"cut"` for the
  session's cards or a wave id (`"w01"`) for a card about one wave.
- `preflight[].status` is `handed` or `missing`; a missing item names
  the row it blocks, and stage 4 parks that row.

## `goals/<repo>-<wNN>.json` (the writer)

```json
{
  "goal": "labs-api-tracking/w02", "repo": "labs-api-tracking", "wave": "w02",
  "file": "02-plan/goals/labs-api-tracking/w02.md",
  "intro": "Two rows: the accounts route learns where each account came from, and a new admin route lists the orphans. Both prove on seeded items; the real pipeline is walked at w02.",
  "rows": [
    { "num": "2.1", "builds": "the recording schema with the new optional fields; the production model excludes removed recordings", "proof": "`bash smoke/run.sh accounts` prints `0 failed` of 15, the 403 among them" }
  ],
  "worthALook": ["the orphans route caps at 200 and says `truncated`"],
  "workerDecides": ["the helper's home for the two bounded queries"]
}
```

The build embeds `file` whole behind a click and refuses a goal
whose file is missing.

## `plan-report.json` (the conductor)

```json
{
  "inOneSentence": "Three sessions build three repos at once; two gates, the second is the demand.",
  "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ],
  "needsYourEye": [ { "t": "…", "p": "…" } ],
  "lanesPlain": "…", "wavesPlain": "…", "teamPlain": "…", "reviewPlain": "…"
}
```

## `plan-review.json` (the conductor)

The design review's shape: `opened`, `approved`, `rounds[] {n, findings,
toAuthor, toUser, deferred, dismissed, unread[], changed}`,
`decisions[] {round, id, title, plain, ruling, words}` (the user's),
`conductorRulings[] {id, title, ruling}` (ruled in his place, listed
for veto), `dismissed[] {id, lens, title, why}`, `residue[] {title,
why}`. Every `decisions[]` entry has a `plain` sentence.
