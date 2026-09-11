# The discovery blueprint — what the stage writes

The blueprint is built, never edited. Stage 1 leaves these JSON files
under `<workstream>/blueprint/`; `node claude/blueprint/build.mjs
<workstream>` validates them and writes `blueprint.html`. Text fields
accept two inline marks: `` `code` `` and `**bold**`. Every text is in
the workstream's language. See `../example/` for a filled set.

| File | Who writes it | When |
|---|---|---|
| `workstream.json` | the conductor | at open |
| `prfaq.json` | `disc-author-prfaq` | with `pr-faq.md`, kept in step through every fix |
| `stories.json` | `disc-author-stories` | with `user-stories.md`, kept in step through every fix |
| `wireframes.json` | the conductor | when the wireframes exist; one entry per file in `00-discovery/wireframes/` |
| `figures.json` | the conductor | optional: the flow in one picture (mermaid) |
| `review.json` | the conductor | after each round, from `reviews.md` and `rulings.md` |
| `report.json` | the conductor | at the close: the plain-language layer |

## workstream.json

```json
{ "slug": "2026-08-15-workspace-invites", "title": "Workspace invites", "language": "pt-BR", "stage": "discovery" }
```

`language` picks `strings.<language>.json`; `stage` marks the journey.

## prfaq.json

```json
{
  "headline": "the press release's bold headline",
  "lead": "the first paragraph after it",
  "problem": "…", "solution": "…", "how": "…",
  "faq": { "external": [ { "q": "…", "a": "…" } ], "internal": [ { "q": "…", "a": "…" } ] },
  "notBuilding": [ { "what": "…", "kind": "out | direction", "why": "…" } ],
  "bets": [ { "claim": "…", "checkedBy": "doc | CSV | user | search | …", "status": "holds | does-not-hold | unchecked", "note": "…" } ]
}
```

## stories.json

```json
{
  "personas": [ { "persona": "admin", "who": "…" } ],
  "vocabulary": [ { "term": "…", "def": "…" } ],
  "stories": [ {
    "id": "S-001", "name": "…", "as": "…", "want": "…", "so": "…",
    "acs": [ { "id": "<SLUG>-S-001-AC-1", "kind": "WHEN | IF | WHILE", "text": "the sentence after the keyword" } ],
    "badPaths": [ { "category": "Boundary input | Repeat / concurrency | Dependency failure | Permission", "case": "…", "behavior": "…" } ],
    "screens": [ "wireframes/<screen>.html" ],
    "out": [ "…" ]
  } ],
  "inferred": [ { "id": "I-1", "landed": "S-001 AC-6", "assumed": "…", "why": "…", "ruling": "confirmed | rejected | open | superseded", "changed": false, "note": "…" } ],
  "openQuestions": []
}
```

`changed: true` marks an inference the user's rulings altered after
validation; the tab shows those first. `screens` must name files that
exist in `wireframes.json`.

## wireframes.json

```json
[ { "screen": "Produção da região", "file": "wireframes/producao-regiao.html",
    "stories": [ "S-003", "S-010" ], "states": [ "empty", "loading", "error", "no permission" ],
    "note": "one line, optional", "html": "the wireframe file's markup, verbatim" } ]
```

`html` is embedded in a sandboxed frame; the file stays the source.

## figures.json

```json
[ { "title": "…", "caption": "what the picture shows, one or two sentences", "mermaid": "flowchart LR\n  A --> B" } ]
```

Mermaid renders natively in the published page. An `svg` field
(inline markup) is accepted instead of `mermaid`.

## review.json

```json
{
  "opened": "2026-09-08", "approved": "2026-09-09",
  "rounds": [ { "n": 1, "run": "wf_…", "findings": 24, "toAuthor": 2, "toUser": 5, "deferred": 1, "dismissed": 16, "unread": [ "S-001" ], "changed": "one line" } ],
  "validation": [ { "story": "S-001", "ruling": "confirm | reduce | adjust | cut", "words": "…" } ],
  "decisions": [ { "id": "disc-reviewer-boundary#3", "round": 1, "lens": "boundary", "title": "…", "gap": "…", "ruling": "what the user chose", "words": "his reason, verbatim" } ],
  "authorFixes": [ { "id": "…", "round": 1, "title": "…" } ],
  "forDesign": [ { "id": "…", "story": "S-004", "title": "…", "why": "…" } ],
  "dismissed": [ { "id": "…", "round": 1, "lens": "…", "title": "…", "why": "the reason, with the sentence it quotes" } ],
  "residue": [ { "id": "…", "title": "…", "why": "…" } ]
}
```

## report.json — the plain-language layer

Written for the reader who will read to the end: the newcomer on the
team, technical but new. Short sentences, familiar words, a role for
each thing, no code. This is what the tab shows first; the documents
sit behind a click.

```json
{
  "inOneSentence": "what this demand does, in one sentence",
  "threeThings": [ { "t": "a short claim", "p": "two sentences that make it concrete" }, { … }, { … } ],
  "howSteps": [ { "t": "a verb", "p": "one or two sentences" } ],
  "stories": { "S-001": "the story in one plain sentence", "S-002": "…" },
  "keyFaq": { "external": [ 2, 5 ], "internal": [ 1 ] },
  "outPlain": "what stays out and why, in three sentences",
  "betsPlain": "the bet that matters, in two sentences",
  "inferredPlain": "how many, what changed, in three sentences",
  "reviewPlain": "rounds, findings, what was yours, what died, in three sentences",
  "decisions": { "1:disc-reviewer-boundary#3": "the decision in one plain sentence" }
}
```

`threeThings` has exactly three items. Every story and every decision
in `review.json` needs its plain sentence; the build refuses otherwise.
`keyFaq` indexes point into `prfaq.json`'s lists: those questions show
open, the rest fold.
