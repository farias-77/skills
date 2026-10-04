# The execution blueprint — what the session leaves in JSON

Stage 4 writes one file under `<workstream>/blueprint/execution/`, by
the session: `execution.json` (the entries with their state, sha,
rounds and findings; the tally of the reviewer and the QAs; the plain
layer the tab opens with; the audit),
rewritten whole whenever an entry changes state and before and after
the audit. `node claude/blueprint/build.mjs <workstream>` validates it
against `blueprint/plan/plan.json` and assembles the Execution tab. The
build refuses with the field named: an entry id the plan does not
know, a plan entry or `F` missing or listed twice, a merged entry with
no sha, a parked entry whose audit item does not exist, an agent that is not
`reviewer`, `qa-frontend` or `qa-backend` (or a retired name of an
older record), a precision row whose `withRepro` + `ruleOnly` is not
its `blocking`, a closed audit with an unruled item, **a text over its
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
many findings blocked, and what waits for his ruling at the audit.
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
    { "id": "E-03", "status": "merged", "sha": "9e8d7c6", "rounds": 2, "found": 9, "sustained": 2,
      "summary": "A customer places an order and sees it after a reload." },
    { "id": "E-05", "status": "parked", "sha": null, "rounds": 2, "found": 6, "sustained": 3,
      "summary": "The ready e-mail.", "parked": "P.1" }
  ],
  "precision": [
    { "lens": "reviewer", "found": 6, "blocking": 2, "notes": 4, "downgraded": 1, "closed": 2 },
    { "lens": "qa-frontend", "found": 3, "blocking": 1, "notes": 2, "downgraded": 0, "closed": 1 }
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

- `entries[].id` is the foundation `F`, an entry of `plan.json`, or a
  fix entry `X.<n>` (the whole gate red at the end, or a fix he ruled
  at the audit); every entry of `plan.json` and `F` appear exactly
  once. `rounds` counts the checks (the whole one and the delta);
  `found` and `sustained` count the findings and the blocking ones. `status` is `waiting`, `building`,
  `merged` or `parked`; a merged entry has its `sha`; a parked one
  names its audit item in `parked`.
- `sha` is present on every entry, `null` until merged.
- `amendments` is optional and absent in a new record (stage 4 has no
  foundation amendments); an older record's list (`F.<n>`, `for`,
  `sha`) still builds and shows.
- `precision[].lens` is one of stage 4's agents that find: `reviewer`,
  `qa-frontend`, `qa-backend`. The retired names (`verifier`,
  `structure-reviewer`, `ux-reviewer`, `exec-lens-*`, `exec-qa-*`) are
  still accepted, so an older record builds.
- A precision row is exec-entry's tally summed across entries
  (`references/judging.md`, "The tally"): `found`, `blocking`, `notes`,
  `downgraded` (marked blocking without a basis or a proof) and
  `closed` (its items closed in the delta). Older rows (`deferred`,
  `learn`, `withRepro`, `ruleOnly`; or v8's `sustained`, `latitude`,
  `dismissed`, `user`) still build; the table shows the columns the
  record carries.
- `audit.*[].ruling` and `words` are `null` until the user rules;
  `recommendation` is `keep` or `fix` for a choice, one sentence for a
  parked item. A choice's ruling is `keep`, `fix` or `revert`; a
  parked item's ruling is his decision in one sentence. Audit ids are
  unique, and every `entry` is a known entry id.
- `closed` is set when the user approves the audit; every audit item
  then has its ruling.

Word caps: `summary` 25 · `what` 18 (latitude, and an older record's amendments) · `title` 12 · `why` 30 ·
`recommendation` 25 · `chosen` 25 · `inOneSentence` 35 ·
`threeThings[].p` and `needsYourEye[].p` 35 · `entriesPlain` and
`reviewPlain` 45. Ids, shas, paths, `gate` and `words` are not capped.
