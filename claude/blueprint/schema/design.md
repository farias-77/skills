# The design blueprint — what each writer leaves in JSON

Stage 2 writes one JSON per document under `<workstream>/blueprint/design/`
(the same name as the document), by that document's `design-writer`
(Sonnet 5.5, high), in the same pass as the document; the conductor
writes `decisions.json`, `design-report.json` and `design-review.json`
at the close, and `sizing.json` from `01-design/sizing.md` when the
design was sized. `node claude/blueprint/build.mjs <workstream>` validates
them, embeds the `.md` documents and the artboards whole, and assembles
the Design tab. The build refuses with the field named: a missing key,
a figure absent where one is required, a story or a screen that does
not exist, a bill line with the wrong number of scales, a duplicate
decision id, **a text over its word cap**. Text fields accept
two inline marks: `` `code` `` and `**bold**`. No HTML. Everything in
the workstream's language (`workstream.json` names it).

## The voice: technical, and an intern reads it to the end

The reader is a capable, technical person who joined the team last
month: they know what a Lambda, a table and an alarm are, but they
have never seen this system and have little experience. Rules:

- Short sentences, one idea each. Familiar words; the real name of a
  thing once (`recordings`, `sync-stale`), then what it does.
- Every mechanism in three lines: **what happens** · **when it goes
  wrong** · **worth a look** (the last one is where a reviewer would
  poke). Never a fourth.
- An analogy when it makes the mechanism click ("the pointer is a
  bookmark: it only moves after the page is written"), never in place
  of the fact.
- A number only when it changes what the reader would decide
  (a retention, a ceiling, a timeout that encodes a rule). Everything
  else stays in the `.md`, and the text says the file is the authority.
- No code, no JSON, no IAM statements, no request bodies: those are
  behind the click, in the document.
- Lists are curated, never complete: the entities that explain the
  model, the alarms that wake someone, the resources that explain the
  bill. Group what is one idea.
- Nothing dense: a reader who reads only the intro and the tables has
  the shape of the thing.
- **The text invites reading.** One idea per sentence; no chains of
  semicolons; when a sentence carries a list of details (stacks, TTLs,
  memory sizes, parameter names), keep the one or two that decide
  something and drop the rest: the `.md` has them. A wall of text is
  what makes a reader stop.

## Word caps (the build refuses a field over its cap)

| Field | Cap | Field | Cap |
|---|---|---|---|
| `intro` | 45 | `worthALook[]` | 20 |
| `latitude[]` | 18 | `flows[].happens` | 60 |
| `flows[].goesWrong` | 45 | `flows[].look` | 20 |
| `mechanisms[].rule` / `.ifFails` | 18 | `components[].does` | 14 |
| `extensions[].when` / `.what` / `.unchanged` | 14 | `entities[].holds` | 14 |
| `access[].need` / `.how` | 18 | `growth` | 40 |
| `endpoints[].returns` | 20 | `endpoints[].errors` | 14 |
| `screens[].whatsNew` | 40 | `reused` | 40 |
| `sweep[].how` | 20 | `abuse[].stops` / `.look` | 20 |
| `resources[].why` | 14 | `resources[].rule` | 20 |
| `bill.fixed[].obs` / `bill.variable[].obs` | 12 | `bill.plain` | 40 |
| `wayIn` | 30 | `alarms[].firesWhen` | 20 |
| `alarms[].doWhat` | 30 | `watched` | 40 |
| `order[].what` | 16 | `order[].gate` | 14 |
| `wayBack` | 45 | `firstRun` | 30 |
| `repos[].changes` | 40 | `repos[].unchanged` | 14 |
| `seams` | 35 | `groups[].proves` | 25 |
| `convention` | 35 | decisions `question` | 16 |
| decisions `chosen` | 30 | decisions `why` | 25 |
| decisions `options[].label` | 18 | decisions `options[].cost` | 14 |
| report `inOneSentence` | 35 | report `threeThings[].p` / `needsYourEye[].p` | 35 |
| report `costPlain` | 35 | report `latitudePlain` | 25 |
| report `reviewPlain` | 45 | review `decisions[].plain` | 25 |
| review `title` | 12 | review `ruling` | 25 |
| review `why` | 30 | review `rounds[].changed` | 20 |
| sizing `plain` | 45 | sizing `noGos[]` | 14 |
| sizing `parts[].<tier>.what` | 12 | sizing `picks[].why` | 25 |
| sizing `doors[].door` | 12 | sizing `doors[].decided` / `.why` | 18 |
| sizing `evolution[].now` / `.next` | 12 | sizing `evolution[].signal` | 14 |
| sizing `evolution[].watchedBy` | 8 | | |

## Common fields (every document JSON)

```json
{
  "doc": "architecture",
  "intro": "two or three sentences: what this document fixes, in plain words",
  "worthALook": [ "one line each, at most three: what a reviewer should poke here" ],
  "latitude": [ "one line each: what the implementer decides, as the document lists it" ]
}
```

## architecture.json

```json
{
  "figure": { "mermaid": "flowchart LR …", "caption": "what the picture shows, one or two sentences" },
  "components": [ { "name": "extract", "runsWhere": "Lambda, one per organization", "does": "one line" } ],
  "flows": [ { "id": "extract", "name": "Extract per organization", "stories": ["S-004"],
               "happens": "3–5 sentences: the flow from trigger to end",
               "goesWrong": "2–4 sentences: the failure rows that matter and what the system does",
               "look": "one sentence: where to poke" } ],
  "mechanisms": [ { "name": "the lock", "rule": "what rule it guards", "ifFails": "what happens when it does not hold" } ],
  "extensions": [ { "when": "the trigger", "what": "what changes", "unchanged": "what does not" } ]
}
```
The figure is ONE picture: the blocks, where each runs, the arrows with a label (`writes`, `reads`, `starts`). Mermaid `flowchart`; keep node ids ASCII, labels in quotes.

## data-model.json

```json
{
  "figure": { "mermaid": "erDiagram …", "caption": "…" },
  "entities": [ { "name": "recordings", "key": "person + when#session", "holds": "one line", "retention": "one line or —" } ],
  "access": [ { "need": "what a screen or a job needs", "how": "the read that serves it, in words" } ],
  "growth": "two sentences: what grows, and when it forces a change"
}
```

## contracts.json

```json
{
  "endpoints": [ { "kind": "route | event | table", "name": "GET /imports/status", "caller": "who", "returns": "one line", "errors": "the classes, in words" } ],
  "shapes": "one sentence naming where the exact shapes live"
}
```

## ui.json

```json
{
  "screens": [ { "name": "Production · person", "file": "ui/Main.dc.html", "stories": ["S-001"], "whatsNew": "2–3 sentences", "states": ["empty", "loading", "error", "no permission"] } ],
  "reused": "one or two sentences: what the product already has that this feature reuses",
  "figure": { "mermaid": "optional", "caption": "…" }
}
```
`file` names an artboard under `01-design/ui/`; the build embeds it.

## security.json

```json
{
  "sweep": [ { "cls": "the class name", "verdict": "covered | accepted | n/a", "how": "one line: the mechanism, or why the risk is accepted" } ],
  "abuse": [ { "path": "the abuse path", "stops": "what stops it", "look": "one line" } ]
}
```

## infra.json

```json
{
  "resources": [ { "name": "Runs table", "id": "<app>-import-runs-{stage}", "why": "one line", "rule": "the config that encodes a rule or a cost, or —" } ],
  "bill": { "scales": ["today", "5×", "20×"], "envelope": [5, 12, 30], "unit": "US$/month",
            "fixed": [ { "name": "…", "obs": "one line", "v": [0.8, 0.8, 0.8] } ],
            "variable": [ { "name": "…", "obs": "one line", "v": [1.2, 4.1, 12.0] } ],
            "totals": [3.9, 8.2, 24.0], "plain": "two sentences: what drives the bill, and where it crosses the envelope" },
  "wayIn": "one or two sentences: how it reaches prod (profiles, names, regions)"
}
```
Every `v` has exactly as many numbers as `scales`. No "total" per line.
`name` is the plain kind of the thing ("Runs table", "The five functions"); `id` is the real resource name, shown small under it.

## observability.json

```json
{
  "alarms": [ { "name": "sync-stale", "firesWhen": "one line", "wakes": "who", "doWhat": "one or two lines: the first thing the runbook says", "wakesSomeone": true } ],
  "watched": "two sentences: what the dashboard shows and who looks at it",
  "figure": { "mermaid": "optional", "caption": "…" }
}
```

## rollout.json

```json
{
  "order": [ { "step": 1, "what": "one line", "gate": "what must be true before the next step, or —" } ],
  "wayBack": "two or three sentences: how to undo, and what cannot be undone",
  "firstRun": "one or two sentences, when the design names a first-run ritual"
}
```

## code.json

```json
{
  "repos": [ { "repo": "api-imports", "isNew": true, "changes": "2–3 sentences", "unchanged": "one line", "tree": "optional: the layout only where it departs from the house structure, as a code block string" } ],
  "seams": "one or two sentences: the interfaces that let a piece be swapped, and why each exists"
}
```

## acceptance.json

```json
{
  "groups": [ { "group": "imports · runs", "count": 14, "proves": "one or two sentences", "how": "smoke | vitest | synth | manual" } ],
  "convention": "one or two sentences: how a case is run and what green means"
}
```

## Files the conductor writes

### decisions.json — one entry per card, from `notes.md` and `rulings.md`

```json
[ { "id": "D-1", "doc": "architecture", "when": "session | author | round 1 | round 2 | approval | plan | execution",
    "question": "the fork, one line", "chosen": "the option taken, one line", "why": "one line",
    "options": [ { "label": "A) …", "cost": "one line" } ], "recommended": "A", "pick": "B", "againstRecommendation": false } ]
```
`pick` is the letter of the option chosen (null when the pick is none of the listed options: the tab then shows `chosen` as its own box). The tab renders each card inside the section of its `doc`; `macro` cards sit in the opening section.

### design-report.json — the plain layer the tab opens with

```json
{
  "inOneSentence": "what we are building",
  "figure": { "mermaid": "the whole thing in one picture", "caption": "…" },
  "threeThings": [ { "t": "a short claim", "p": "two sentences" }, {…}, {…} ],
  "needsYourEye": [ { "t": "short title", "p": "two sentences: the decision taken in the user's place, the tradeoff, or the number that encodes a rule" } ],
  "costPlain": "two sentences: what it costs today and at scale, against the envelope",
  "latitudePlain": "one sentence: how much was left to the implementer and where the list is",
  "reviewPlain": "three sentences: rounds, findings, what was the user's, what died"
}
```

### sizing.json — the size, from `sizing.md` (optional)

The Design tab opens a **Size** section from it, right after "What we
are building": the three tiers side by side, the pick per part, the
one-way doors and the evolution path. A design without it still
builds; the section is then absent.

```json
{
  "plain": "one or two sentences: what gets built, end to end, and why it is this size",
  "appetite": { "hours": 40, "pick": 34, "runCost": 6.5, "unit": "US$/month", "status": "final" },
  "noGos": [ "one line each, as sizing.md lists them" ],
  "tiers": [ { "tier": "lean", "hours": 26, "cost": 3.0 }, { "tier": "balanced", "hours": 34, "cost": 6.5 }, { "tier": "hardened", "hours": 61, "cost": 22.0 } ],
  "parts": [
    { "part": "data", "lean": { "what": "one table, no index", "hours": 3, "cost": 0.5 },
      "balanced": { "what": "one table, a status index", "hours": 4, "cost": 0.6 },
      "hardened": { "what": "two tables and an audit trail", "hours": 9, "cost": 1.4 } },
    { "part": "compute", "lean": { "what": "inline in the request", "hours": 4, "cost": 0 },
      "balanced": { "what": "e-mail through a queue, imports inline", "hours": 7, "cost": 1.2 },
      "hardened": { "what": "every job queued, a dead-letter sweeper", "hours": 14, "cost": 4.0 } }
  ],
  "picks": [
    { "part": "data", "tier": "lean", "rvc": [2, 1, 2], "why": "a lost row is re-imported by hand within a day", "req": "S-002/AC-1" },
    { "part": "compute.invite-email", "tier": "balanced", "rvc": [3, 3, 1], "why": "need 6 → balanced; a sent e-mail cannot be unsent", "req": "door:message-sent" },
    { "part": "compute.csv-import", "tier": "lean", "rvc": [1, 1, 2], "why": "a failed import is retried by the user" }
  ],
  "doors": [ { "door": "the shape of the invite token", "decided": "opaque, 32 bytes, stored hashed", "his": "Q-1" },
             { "door": "the e-mail provider's template ids", "decided": "one template per locale", "his": null, "why": "a config change; no contract shape" } ],
  "evolution": [ { "part": "data", "now": "list by scan", "signal": "list p95 over 300 ms", "watchedBy": "the latency alarm", "next": "a status index", "cost": "1 h" } ]
}
```

- `tiers` is exactly three, in the order `lean`, `balanced`,
  `hardened`: the totals of the side-by-side table (build hours, run
  cost a month in `appetite.unit`).
- `parts[]` are the rows of that table, one per part (the eight parts
  of the right-sizing pack, or fewer); each carries the three tiers,
  `{what, hours, cost}`. `noChoice: true` marks a part that is the same
  in every tier.
- `picks[]` is the pick per part or sub-part (`compute.invite-email`):
  `tier`, `rvc` (R, V and C, each 1–3), `why` (above lean: the score
  that forced it) and `req` (the requirement it answers, optional).
  Every part has a pick, itself or through its sub-parts.
- `doors[].his` is the question id of the user's call (`Q-<n>`), or
  `null` with a `why` when the door is not his.
- `evolution[]`: the signal with its number, who or what already
  watches it, the next step and its cost. Every **lean** pick with
  R ≥ 2 has a row (by its name or its part's).
- `appetite.pick` is the pick's build hours; it never exceeds
  `appetite.hours` (over the appetite the scope is cut), unless the
  user accepted the overrun (at his call or at the close's veto):
  `appetite.accepted` (optional) is then the hours he accepted, at
  least `appetite.hours`, and the pick never exceeds it. The hours of
  the frame stay in `hours`.

The build refuses with the field named: tiers not three or out of
order, a pick for an unknown part, a score outside 1–3, a part with no
pick, a lean pick with R ≥ 2 and no evolution row, a pick over the
appetite (or over `appetite.accepted` when he accepted more), **a text over its word cap**.

### design-review.json — like discovery's review.json

```json
{
  "opened": "2026-01-12", "approved": "2026-01-13",
  "rounds": [ { "n": 1, "run": "wf_…", "findings": 75, "toAuthor": 25, "toUser": 12, "toImplementer": 2, "deferred": 15, "dismissed": 4, "unread": ["…"], "changed": "one line" } ],
  "decisions": [ { "id": "R1-U01", "round": 1, "lens": "security", "title": "…", "gap": "…", "ruling": "what the user chose", "words": "his reason, verbatim", "plain": "the decision in one plain sentence" } ],
  "conductorRulings": [ { "id": "R1-cond-1", "round": 1, "title": "…", "ruling": "one line" } ],
  "forPlan": [ { "id": "…", "title": "…", "why": "…" } ],
  "dismissed": [ { "id": "…", "round": 1, "lens": "…", "title": "…", "why": "the reason, with the sentence it quotes" } ],
  "residue": [ { "title": "…", "why": "…" } ]
}
```
