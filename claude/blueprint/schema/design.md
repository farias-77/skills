# The design blueprint — what each writer leaves in JSON

Stage 2 writes one JSON per document under `<workstream>/blueprint/design/`
(the same name as the document: `solution`, `data-and-contracts`,
`tests`, `operations`), by that document's `design-writer` (Sonnet 5.5,
high), in the same pass as the document; the conductor writes
`proposal.json`, `decisions.json`, `design-report.json` and
`design-review.json` at the close. `node claude/blueprint/build.mjs
<workstream>` validates them, embeds the four `.md` documents whole,
and assembles the Design tab. The build refuses with the field named:
a missing key, a figure absent where one is required, a story that
does not exist, an AC with no proof or with two, a duplicate decision
id, **a text over its word cap**. Text fields accept two inline marks:
`` `code` `` and `**bold**`. No HTML. Everything in the workstream's
language (`workstream.json` names it).

The tab, in order: what we are building · the proposal and the debate
· the solution · data and contracts · what proves it works · how it
ships and is watched · the review.

## The voice: technical, and a newcomer reads it to the end

The reader is a capable, technical person who joined the team last
month: they know what a route, a table and an alarm are, but they have
never seen this system. Rules:

- Short sentences, one idea each. The real name of a thing once
  (`invites`, `invites-send-failed`), then what it does.
- Every flow in three lines: **what happens** · **when it goes wrong**
  · **worth a look**. Never a fourth.
- A number only when it changes what the reader would decide. The rest
  stays in the `.md`, and the text says the file is the authority.
- No code, no JSON bodies: those are behind the click, in the document.
- Lists are curated, never complete, except the tests: every AC has its
  row, because the row is the proof the AC is covered.

## Word caps (the build refuses a field over its cap)

| Field | Cap | Field | Cap |
|---|---|---|---|
| `intro` | 45 | `worthALook[]` | 20 |
| `latitude[]` | 18 | `flows[].happens` | 60 |
| `flows[].goesWrong` | 45 | `flows[].look` | 20 |
| `parts[].does` | 14 | `parts[].runsWhere` | 8 |
| `screens[].whatsNew` | 40 | `security[].how` | 20 |
| `evolution[].relaxed` / `.add` | 12 | `evolution[].signal` | 14 |
| `evolution[].cost` | 8 | `contracts[].caller` | 8 |
| `contracts[].returns` | 20 | `contracts[].errors` | 16 |
| `tables[].holds` | 14 | `tables[].key` | 8 |
| `migrations` | 35 | `proofs[].proves` | 16 |
| `convention` | 35 | `rollout[].what` | 16 |
| `rollout[].gate` | 14 | `flags[].guards` | 14 |
| `alarms[].firesWhen` | 20 | `alarms[].doWhat` | 30 |
| `rollback` | 45 | `runCost` | 35 |
| proposal `hisIdea` | 60 | proposal `rounds[].changed` | 20 |
| proposal `disagreements[].said` | 25 | proposal `disagreements[].proposed` | 20 |
| proposal `disagreements[].why` | 25 | proposal `disagreements[].settled` | 20 |
| proposal `cuts[].why` | 20 | proposal `closed.words` | 30 |
| decisions `question` | 16 | decisions `chosen` | 30 |
| decisions `why` | 25 | decisions `options[].label` / `.cost` | 18 / 14 |
| report `inOneSentence` | 35 | report `threeThings[].p` / `needsYourEye[].p` | 35 |
| report `costPlain` | 35 | report `reviewPlain` | 45 |
| review `findings[].title` | 12 | review `findings[].why` | 30 |

## Common fields (every document JSON)

```json
{
  "doc": "solution",
  "intro": "two or three sentences: what this document fixes, in plain words",
  "worthALook": [ "one line each, at most three: what a reviewer should poke here" ],
  "latitude": [ "one line each: what the implementer decides, as the document lists it" ]
}
```

## solution.json

```json
{
  "figure": { "mermaid": "flowchart LR …", "caption": "what the picture shows, one or two sentences" },
  "parts": [ { "name": "invites use case", "runsWhere": "api", "does": "one line" } ],
  "flows": [ { "id": "send-invite", "name": "Send an invite", "stories": ["S-001"],
               "happens": "3–5 sentences: the flow from trigger to end",
               "goesWrong": "2–4 sentences: the failures that matter and what the system does",
               "look": "one sentence: where to poke" } ],
  "screens": [ { "name": "Invites · pending", "route": "/settings/invites", "stories": ["S-001"], "whatsNew": "2–3 sentences" } ],
  "security": [ { "topic": "who can invite", "how": "one line" } ],
  "evolution": [ { "relaxed": "list by scan, no index", "signal": "list p95 over 300 ms", "add": "an index on status", "cost": "1 h" } ]
}
```
The figure is ONE picture: the parts, where each runs, the arrows with a
label (`writes`, `reads`, `calls`). Mermaid `flowchart`; node ids ASCII,
labels in quotes. `evolution` is the proposal's "What changes if it
grows", every row; an empty list means nothing was relaxed.
`screens` and `security` are optional.

## data-and-contracts.json

```json
{
  "contracts": [ { "feature": "Send an invite", "routes": ["POST /invites"], "caller": "the admin's browser",
                   "returns": "one line", "errors": "the classes, in words" } ],
  "tables": [ { "name": "invites", "key": "id", "holds": "one line" } ],
  "migrations": "one or two sentences: what is added, and that each step is reversible",
  "figure": { "mermaid": "optional erDiagram", "caption": "…" }
}
```
One `contracts` entry per Contract section of the document (one per
entry-sized feature). `tables`, `migrations` and `figure` are optional.

## tests.json

```json
{
  "proofs": [ { "ac": "J1.s2.1", "layer": "api", "proves": "one line: what the test asserts" } ],
  "convention": "one or two sentences: how a test is run and what green means"
}
```
Exactly one row per AC of the discovery's `stories.json`: an AC with no
row, an AC with two rows, or an id the discovery does not have refuses
the build. `layer` is `unit`, `api` or `journey`.

## operations.json

```json
{
  "rollout": [ { "step": 1, "what": "one line", "gate": "what must be true before the next step, or —" } ],
  "flags": [ { "name": "invites_enabled", "guards": "one line", "default": "off" } ],
  "alarms": [ { "name": "invites-send-failed", "firesWhen": "one line", "wakes": "who", "doWhat": "the first thing to do" } ],
  "rollback": "two or three sentences: how to undo, and what cannot be undone",
  "runCost": "one or two sentences: what it adds to the monthly bill"
}
```
`flags`, `alarms` and `runCost` are optional; only alarms that wake
someone are listed.

## Files the conductor writes

### proposal.json — the debate, from `proposal.md` and `notes.md`

```json
{
  "hisIdea": "what he had in mind at D1, close to his words; \"nothing in mind\" is an answer",
  "disagreements": [ { "said": "his words", "proposed": "the architect's way", "why": "the reason", "settled": "the outcome" } ],
  "rounds": [ { "n": 1, "date": "2026-10-04", "changed": "one line" } ],
  "cuts": [ { "mechanism": "a retry queue", "outcome": "applied", "why": "one line" } ],
  "closed": { "date": "2026-10-04", "words": "his closing words" }
}
```
`cuts` is the critic's: `applied` (cut) or `rebutted` (kept, with the
requirement it serves). `closed` is absent only while the debate is
open.

### decisions.json — one entry per card, from `notes.md` and `rulings.md`

```json
[ { "id": "D-1", "doc": "solution", "when": "talk | debate | writer | review | veto",
    "question": "the fork, one line", "chosen": "the option taken, one line", "why": "one line",
    "options": [ { "label": "A) …", "cost": "one line" } ], "recommended": "A", "pick": "B", "againstRecommendation": false } ]
```
`doc` is one of the four documents, `proposal` or `macro` (the opening
section). `pick` is the letter of the option chosen (null when the pick
is none of the listed options: the tab then shows `chosen` as its own
box).

### design-report.json — the plain layer the tab opens with

```json
{
  "inOneSentence": "what we are building",
  "figure": { "mermaid": "the whole thing in one picture", "caption": "…" },
  "threeThings": [ { "t": "a short claim", "p": "two sentences" }, {…}, {…} ],
  "needsYourEye": [ { "t": "short title", "p": "two sentences: a decision taken in his place, a tradeoff, a number that encodes a rule" } ],
  "costPlain": "optional: what it costs to run, in two sentences",
  "reviewPlain": "two or three sentences: the one review round, what was sustained, what died"
}
```

### design-review.json — the one round, from `reviews.md`

```json
{
  "opened": "2026-10-04", "approved": "2026-10-05", "verified": 14,
  "findings": [ { "id": "R-1", "area": "coverage | consistency | security", "title": "…", "ruling": "sustained | dismissed",
                  "fixedBy": "conductor | writer | implementer | his", "why": "the reason; on a dismissal, the sentence that forecloses it" } ],
  "sizesKB": { "solution.md": 18.2, "data-and-contracts.md": 22.0, "tests.md": 6.1, "operations.md": 4.3 }
}
```
`verified` is the number of ACs the reviewer checked.
