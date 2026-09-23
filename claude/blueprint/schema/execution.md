# The execution blueprint — what the session leaves in JSON

Stage 4 writes one file under `<workstream>/blueprint/execution/`, by
the session: `execution.json` (the entries with their state, sha,
rounds and findings; the amendments to the foundation; the precision
of every reviewer; the plain layer the tab opens with; the audit),
rewritten whole whenever an entry changes state and before and after
the audit. `node claude/blueprint/build.mjs <workstream>` validates it
against `blueprint/plan/plan.json` and assembles the Execution tab. The
build refuses with the field named: an entry id the plan does not
know, a plan entry or `F` missing or listed twice, a merged entry with
no sha, a parked entry whose audit item does not exist, an amendment
for an unknown entry, a reviewer that is not `exec-lens-*` or
`exec-qa-*`, a closed audit with an unruled item, **a text over its
word cap**; and it refuses any file of the retired lanes-and-waves
execution (`lanes/`, `waves/`, `exec-report.json`, `audit.json`). Text
fields accept two inline marks: `` `code` `` and `**bold**`. No HTML.
Everything in the workstream's language.

## The voice: technical, and an intern reads it to the end

Same rules as the plan ([schema/plan.md](plan.md)): short sentences,
one idea each; the real name of a thing once, then what it does; a
number only when it changes what the reader would decide; lists
curated, never complete. The Execution tab's reader wants to know, in
ten minutes: what got built and merged, what waits and why, how
precise each reviewer was, and what waits for his ruling at the audit.
The record (`03-execution/`) is named as the authority, never copied.

## `execution.json` (the session)

```json
{
  "started": "2026-10-01", "closed": null,
  "branch": "feat/2026-10-01-bakery-orders", "head": "3f2a91c",
  "gate": "make verify: 412 passed · coverage 100% · 18 journeys",
  "entries": [
    { "id": "F", "status": "merged", "sha": "a1b2c3d", "rounds": 1, "found": 6, "sustained": 2,
      "summary": "Tables, the contract and the factories laid down; every new route answers 501." },
    { "id": "E-03", "status": "merged", "sha": "9e8d7c6", "rounds": 2, "found": 14, "sustained": 5,
      "summary": "A customer places an order and sees it after a reload." },
    { "id": "E-05", "status": "parked", "sha": null, "rounds": 3, "found": 11, "sustained": 3,
      "summary": "The ready e-mail.", "parked": "P.1" }
  ],
  "amendments": [ { "id": "F.1", "what": "`orders.note` column and the field in `POST /orders`", "for": "E-03", "sha": "5d4c3b2" } ],
  "precision": [
    { "lens": "exec-lens-workaround", "found": 4, "sustained": 3, "deferred": 0, "latitude": 0, "dismissed": 1, "user": 0 }
  ],
  "report": {
    "inOneSentence": "…",
    "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ],
    "needsYourEye": [ { "t": "…", "p": "…" } ],
    "entriesPlain": "…", "reviewPlain": "…"
  },
  "audit": {
    "parked": [ { "id": "P.1", "entry": "E-05", "title": "…", "why": "…", "recommendation": "…", "ruling": null, "words": null } ],
    "choices": [ { "id": "C.1", "entry": "E-03", "title": "…", "where": "`backend/internal/orders/app/create.go:41`", "chosen": "…", "recommendation": "keep", "ruling": null, "words": null } ],
    "latitude": [ { "entry": "E-03", "what": "…" } ]
  }
}
```

- `entries[].id` is the foundation `F`, an entry of `plan.json`, an
  amendment `F.<n>` or a fix entry `X.<n>`; every entry of `plan.json`
  and `F` appear exactly once. `status` is `waiting`, `building`,
  `merged` or `parked`; a merged entry has its `sha`; a parked one
  names its audit item in `parked`.
- `sha` is present on every entry and amendment, `null` until merged.
- `amendments[].id` is `F.<n>`; `for` names the entry that needed it.
- `precision[].lens` is one of the seven lenses or the two QA
  (`exec-lens-*`, `exec-qa-*`).
- `audit.*[].ruling` and `words` are `null` until the user rules;
  `recommendation` is `keep` or `fix` for a choice, one sentence for a
  parked item. A choice's ruling is `keep`, `fix` or `revert`; a
  parked item's ruling is his decision in one sentence. Audit ids are
  unique, and every `entry` is a known entry id.
- `closed` is set when the user approves the audit; every audit item
  then has its ruling.

Word caps: `summary` 25 · `what` 18 (amendments and latitude) · `title` 12 · `why` 30 ·
`recommendation` 25 · `chosen` 25 · `inOneSentence` 35 ·
`threeThings[].p` and `needsYourEye[].p` 35 · `entriesPlain` and
`reviewPlain` 45. Ids, shas, paths, `gate` and `words` are not capped.
