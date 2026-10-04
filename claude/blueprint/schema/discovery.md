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
| `stories.json` | `journey-scribe` | with `00-discovery/stories.md`, kept in step through every fix |
| `mock.json` | the conductor | optional, at D6: the locked journeys step by step, with their pictures |
| `figures.json` | the conductor | optional: the flow in one picture (mermaid) |
| `review.json` | the conductor | after the review round, from `reviews.md` and `rulings.md` |
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
    "acs": [ { "id": "J1.s2.1", "kind": "GIVEN", "text": "GIVEN … WHEN … THEN … AND …, the whole criterion" } ],
    "badPaths": [ { "category": "Boundary input | Repeat / concurrency | Dependency failure | Permission", "case": "…", "behavior": "…" } ],
    "out": [ "…" ]
  } ],
  "inferred": [ { "id": "I-1", "landed": "J1.s2.1", "assumed": "…", "why": "…", "ruling": "confirmed | rejected | open | superseded", "changed": false, "note": "…" } ],
  "openQuestions": []
}
```

- An AC is one rule or one behavior, never one per step or per state.
  Its id is the journey step where that behavior shows first,
  `J<n>.s<k>.<m>`, or `frame:<token>.<m>` for a behavior only a debug
  path reaches, exactly as `stories.md` writes it. `kind` is `GIVEN` and `text` is the whole
  GIVEN/WHEN/THEN/AND. A v8 record (`<SLUG>-S-NNN-AC-n`, kind `WHEN`,
  `IF` or `WHILE`, the text after the keyword) still builds.
- `inferred[].landed` names the AC id the inference landed in.
- `changed: true` marks an inference the user's rulings altered after
  the lock; the tab shows those first.

## figures.json

```json
[ { "title": "…", "caption": "what the picture shows, one or two sentences", "mermaid": "flowchart LR\n  A --> B" } ]
```

Mermaid renders natively in the published page. An `svg` field
(inline markup) is accepted instead of `mermaid`.

## review.json

```json
{
  "opened": "2026-01-05", "approved": "2026-01-06",
  "rounds": [ { "n": 1, "run": "wf_…", "findings": 24, "toAuthor": 2, "toUser": 5, "deferred": 1, "dismissed": 16, "unread": [ "S-001" ], "changed": "one line" } ],
  "lock": { "version": 4, "at": "2026-01-05 15:40", "words": "lock it", "override": null, "gaps": [], "url": "https://…" },
  "decisions": [ { "id": "disc-reviewer#3", "round": 1, "lens": "reviewer", "title": "…", "gap": "…", "ruling": "what the user chose", "words": "his reason, verbatim" } ],
  "authorFixes": [ { "id": "…", "round": 1, "title": "…" } ],
  "forDesign": [ { "id": "…", "story": "S-004", "title": "…", "why": "…" } ],
  "dismissed": [ { "id": "…", "round": 1, "lens": "…", "title": "…", "why": "the reason, with the sentence it quotes" } ],
  "residue": [ { "id": "…", "title": "…", "why": "…" } ]
}
```

- `lock` (optional) is the mock's `LOCK.json` as he locked it:
  `version`, `at` (its `date`), `words` (his, verbatim), `override`
  (his words when he locked over a failing walk or an open item, else
  `null`), `gaps` (every gap he accepted, as `LOCK.json` lists them:
  the walk's failures and the open items he locked over,
  `{source, where, what}`, or one line each; every gap shows under "What needs your eye") and `url` (the
  mock's https link, or `"local"` when the mock was never published:
  the page then says so instead of linking). Gaps need an override.
- `forDesign[].story` is one story id, a list of them
  (`["S-001", "S-003"]`), or `"all"` for a finding that crosses every
  story.
- `validation` (one ruling per story, v8) is optional; nothing reads it.

## mock.json (optional)

```json
{ "url": "https://…", "version": 4,
  "journeys": [ { "id": "J1", "title": "Invite a teammate",
    "steps": [ { "id": "s1", "do": "the admin opens Members and types an e-mail", "frame": "invite-form.idle",
                 "png": "00-discovery/prototype/frames/journeys/J1.s1.png" } ] } ] }
```

The Discovery tab shows each journey step by step, after "How it
works". `url` is the mock's https link, or `"local"`. `png` is optional, a path inside the workstream; the picture
is published beside the page at that same path (like the stage
report's video), and the build refuses one that is not there.

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
  "reviewPlain": "the round, findings, what was yours, what died, in three sentences",
  "decisions": { "1:disc-reviewer#3": "the decision in one plain sentence" }
}
```

`threeThings` has exactly three items. Every story and every decision
in `review.json` needs its plain sentence; the build refuses otherwise.
`keyFaq` indexes point into `prfaq.json`'s lists: those questions show
open, the rest fold.
