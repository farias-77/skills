# The plan blueprint — what each writer and the conductor leave in JSON

Stage 3 writes under `<workstream>/blueprint/plan/`: the conductor
writes `plan.json` (the cut: from A to B, the foundation, the entries
with their edges and proofs, the concurrency cap, the cut's cards, the
pre-flight), `plan-report.json` (the plain layer the tab opens with)
and `plan-review.json` (the round and the rulings); each
`plan-writer` (Sonnet 5.5, high) writes `briefs/<id>.json` in the same
pass as its brief (`02-plan/briefs/<id>.md`).
`node claude/blueprint/build.mjs <workstream>` validates them, embeds
the brief `.md` files whole, and assembles the Plan tab. The build
refuses with the field named: an entry with no proof, an edge to an
entry that does not exist, a cycle in the edges, a story that no entry
carries, an entry or the foundation with no brief JSON or no brief
file, a duplicate id, a `kind` whose id does not fit it, a `wave`,
`width` or `depth` the edges contradict, a `criticalPath` that is not
a chain of edges, **a text over its word cap**. Text fields accept
two inline marks: `` `code` `` and `**bold**`. No HTML. Everything in
the workstream's language.

## The voice: technical, and an intern reads it to the end

Same rules as the design ([schema/design.md](design.md)): short
sentences, one idea each; the real name of a thing once, then what it
does; a number only when it changes what the reader would decide;
lists curated, never complete. The Plan tab's reader wants to know, in
ten minutes: where we start, where we land, what the foundation lays
down, what gets built in parallel and what waits for what, how each
entry is proved, and what is his to hand over before he leaves.

## Word caps (the build refuses a field over its cap)

| Field | Cap | Field | Cap |
|---|---|---|---|
| `fromA` / `toB` | 60 | `foundation.intro` | 45 |
| `foundation.items[].what` | 18 | `entries[].name` | 8 |
| `entries[].what` | 25 | `entries[].back` / `.front` | 25 |
| `entries[].touches` | 14 | `preflight[].item` | 16 |
| decisions `question` | 16 | decisions `chosen` | 30 |
| decisions `why` | 25 | decisions `options[].label` | 18 |
| decisions `options[].cost` | 14 | brief `intro` | 45 |
| brief `back[]` / `front[]` | 25 | brief `proof[]` | 25 |
| brief `worthALook[]` | 20 | brief `builderDecides[]` | 18 |
| report `inOneSentence` | 35 | report `threeThings[].p` / `needsYourEye[].p` | 35 |
| report `foundationPlain` / `graphPlain` / `reviewPlain` | 45 | review `decisions[].plain` | 25 |
| review `title` | 12 | review `ruling` | 25 |
| review `why` | 30 | review `rounds[].changed` | 20 |

`run`, `expect`, `see`, `where` and every id, number, path and command
are not capped: they are copied exactly.

## `plan.json` (the conductor)

```json
{
  "fromA": "Today the bakery has no system: orders arrive by phone and live in a notebook.",
  "toB": "Customers order online, the baker sees the day's list and marks each order ready, and the customer gets an e-mail.",
  "foundation": {
    "intro": "Lays every table, every route of the contract and the three modules down at once, so the entries never touch a shared file.",
    "items": [
      { "kind": "migration", "what": "tables `clients`, `breads`, `orders`" },
      { "kind": "contract", "what": "every route of `openapi.yaml` and the generated code" },
      { "kind": "module", "what": "modules `clients`, `menu`, `orders` registered" },
      { "kind": "factory", "what": "`factory.Client`, `factory.Bread`, `factory.Order`" }
    ],
    "proof": [ { "run": "make verify", "expect": "exit 0; every new route answers 501" } ],
    "brief": "02-plan/briefs/F.md"
  },
  "entries": [
    { "id": "E-03", "name": "Place an order", "stories": ["S-003"],
      "what": "A customer picks breads, quantities and a day; the order is stored and shown back.",
      "back": "the create-order use case in `orders`; `POST /orders`",
      "front": "the New order screen",
      "after": [],
      "proof": [
        { "run": "make test-integration pkg=orders", "expect": "`valid order`, `day in the past refused`, `unknown bread refused` pass" },
        { "see": "`e2e/journeys/new-order.spec.ts` screenshots, both themes, 390 px", "where": "ui.md §New order" }
      ],
      "touches": "module `orders`, screen New order",
      "brief": "02-plan/briefs/E-03.md" },
    { "id": "E-05", "name": "Ready e-mail", "stories": ["S-005"],
      "what": "Marking an order ready sends the customer an e-mail.",
      "back": "a job enqueued by mark-ready; the e-mail template",
      "front": null,
      "after": ["E-04"],
      "proof": [ { "run": "make test-integration pkg=orders run=Ready", "expect": "the e-mail sink holds one message per ready order" } ],
      "touches": "module `orders`, `communications`",
      "brief": "02-plan/briefs/E-05.md" }
  ],
  "concurrency": 4,
  "width": 4, "depth": 2, "criticalPath": ["F", "E-04", "E-05"],
  "decisions": [
    { "id": "P-cut-1", "doc": "cut", "when": "session", "question": "One entry for orders and the panel, or two?",
      "options": [ { "label": "A) two entries", "cost": "one more merge" }, { "label": "B) one entry", "cost": "a bigger diff to review" } ],
      "recommended": "A", "pick": "A", "chosen": "A) two entries", "why": "each proves alone", "againstRecommendation": false }
  ],
  "preflight": [ { "item": "the e-mail provider key in `/<app>/staging/email/key`", "entry": "E-05", "status": "handed" } ]
}
```

- An entry is a node of `02-plan/plan.graph.json` other than `F`.
  Its optional `kind` is `foundation` (id `F-b`, only when F splits),
  `lane` (`F-x<n>`: foundation work nobody waits for), `slice`
  (`E-<nn>`), `integration` (`E-int`) or `fix`; left out, it is read
  from the id. Optional too: `wave` (0 for a foundation entry, else the
  wave the edges put it in), `critical` (`true` on the critical path),
  `owns` (the paths it owns, as the graph lists them). A lane, in
  the same shape as an entry:

  ```json
  { "id": "F-x1", "kind": "lane", "name": "Deploy skeleton", "stories": [], "wave": 1,
    "what": "The service's deploy files, so staging exists before the first slice merges.",
    "back": null, "front": null, "after": [], "owns": ["deploy/api/**"],
    "proof": [ { "run": "make deploy-check", "expect": "exit 0" } ], "brief": "02-plan/briefs/F-x1.md" }
  ```
- `width` is the widest wave, `depth` the number of waves after the
  foundation, `criticalPath` the ids of the longest chain, `F` (and
  `F-b`) first; all three optional, copied from the graph checker's
  report and checked against the edges.
- `foundation.items[].kind` is one of `migration`, `contract`,
  `module`, `shared`, `factory`, `other`.
- An entry carries one or more `stories` (a lane or a foundation
  entry may carry none); together the entries carry
  every story of the discovery, each at least once (a story split across layer entries, as in a backend-only cut, appears in each entry that builds part of it).
- `after` lists entry ids whose **behavior** the entry's proof needs;
  it is empty when the foundation and the factories are enough. An
  edge may be written whole, `{ "id": "E-03", "class": "ui" |
  "side-effect", "stacked": true }`, as the graph has it. The
  foundation (F, and F-b) precedes every entry and is never listed;
  `F-b` alone may name `"F"`. The edges form no cycle.
- `back` or `front` is `null` when the entry has no such side.
- A proof step is `{run, expect}` or `{see, where}`; nothing else.
- `concurrency` is the widest wave: what the plan lets run at once
  (equal to `width` when both are written).
- `decisions` uses the design's card shape; `doc` is `"cut"` or an
  entry id (`"E-03"`, `"F"`).
- `preflight[].status` is `handed` or `missing`; a missing item names
  the entry it blocks (`"F"` for the foundation), and stage 4 parks it.

## `briefs/<id>.json` (the writer)

One per entry and one for the foundation (`briefs/F.json`).

```json
{
  "id": "E-03", "file": "02-plan/briefs/E-03.md",
  "intro": "One vertical slice: the customer places an order and sees it after a reload. It proves on factory data, so it waits for nobody.",
  "back": ["the create-order use case with the day and bread rules", "`POST /orders` returning the stored order"],
  "front": ["the New order screen with its empty, error and conflict states"],
  "proof": ["`make test-integration pkg=orders`: the three order cases pass", "the journey creates, reloads and still shows the order"],
  "worthALook": ["a day in the past is refused by the use case, not only by the form"],
  "builderDecides": ["the order of the form fields"]
}
```

The build embeds `file` whole behind a click and refuses a brief whose
file is missing.

## `plan-report.json` (the conductor)

```json
{
  "inOneSentence": "One foundation, then four entries at once and one that waits; the whole demand in two steps.",
  "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ],
  "needsYourEye": [ { "t": "…", "p": "…" } ],
  "foundationPlain": "…", "graphPlain": "…", "reviewPlain": "…"
}
```

## `plan-review.json` (the conductor)

One round, ruled by the conductor alone: `opened`, `approved` (the
close's date: nobody approves the plan), `rounds[]` with one entry
`{n: 1, findings, toAuthor, toUser: 0, deferred: 0, dismissed, unread[],
changed}` (`toAuthor` counts the fixes sent to the planner and the
writers; `changed` says in a few words what moved),
`conductorRulings[] {id, title, ruling}` (every sustained finding,
ruled in his place), `dismissed[] {id, lens, title, why}` (`lens` is
`plan-reviewer` or `plan-blind-reader`). `decisions[]` and `residue[]`
stay empty: no question goes to him and there is no second round.
