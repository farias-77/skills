# The close blueprint — what the session leaves in JSON

Stage 6 writes one file, `<workstream>/blueprint/close/close.json`,
rewritten whole at every trace line that changes it (the harvest, the
closure, a sweep line, the board, a ruling, an issue, the close).
`node claude/blueprint/build.mjs <workstream>` validates it against
the release and assembles the Close tab. The build refuses with the
field named: a close without a closed release, a number key missing,
a `moved` line on an unknown key, an entry without its section or
suggestion, a closed stage with an entry not ruled, an `issue` or
`join` ruling without its issue, a sweep line still open, a count in
`numbers.this` that does not match the board, **a text over its word
cap**. Text fields accept two inline marks: `` `code` `` and
`**bold**`. No HTML. Everything in the workstream's language.

## The voice

Same as the release ([schema/release.md](release.md)): short
sentences, one idea each; the real name of a thing once, then what it
does; a number only when it changes what the reader decides. The
Close tab's reader wants to know, in five minutes: what is in
production, how this demand compares with the last one, what stays
with an owner, and what the pipeline is being told — entry by entry,
with the ruling next to each. The record (`closure.md`, the ledger,
the harvest) is named as the authority, never copied.

## Word caps (the build refuses a field over its cap)

| Field | Cap | Field | Cap |
|---|---|---|---|
| `inOneSentence` | 35 | `threeThings[].p` / `needsYourEye[].p` | 35 |
| `numbersPlain` / `boardPlain` / `sweepPlain` | 45 | `numbers.moved[].why` | 25 |
| `cut[].what` | 20 | `cut[].by` | 25 |
| `pendencies[].what` | 20 | `sweep[].what` / `.how` | 20 |
| `board.entries[].title` | 14 | `board.entries[].seen` | 25 |
| `board.entries[].edit` | 30 | `close.note` | 35 |

`where`, `owner`, `destination`, `slug`, `url`, `words`, `quote`,
every hour, id, number, name, path, lens and stage name are not
capped: they are copied exactly. His words are never cut.

## `close.json`

```json
{
  "opened": "2026-09-11 17:00 UTC", "closed": "2026-09-11 22:10 UTC",
  "inOneSentence": "Three repos in production since 11/09; the pipeline gets twenty-one issues from what this demand taught.",
  "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ],
  "needsYourEye": [ { "t": "…", "p": "…" } ],
  "numbersPlain": "…", "boardPlain": "…", "sweepPlain": "…",
  "previous": { "slug": "2026-08-28-ops-dashboard", "closedAt": "2026-09-07" },
  "numbers": {
    "this":     { "days": 4, "waves": 2, "rows": 13, "fixRows": 3, "roundsDiscovery": 2, "roundsDesign": 2, "roundsPlan": 2,
                  "found": 422, "sustained": 247, "deferred": 107, "dismissed": 68, "fixPasses": 15, "suiteRuns": 12, "stops": 4,
                  "departuresKept": 7, "departuresReverted": 0, "silentChoices": 4, "auditItems": 18, "auditFixRows": 1,
                  "releaseFixRows": 0, "hotfixes": 1, "watchRead": 2, "watchOwned": 1, "rulings": 130, "entries": 55, "issues": 21, "tokensM": null },
    "previous": { "days": 11, "waves": 8, "rows": null, "…": null },
    "moved": [ { "key": "days", "why": "prod on the fourth day against the eleventh: one release stage instead of eight waves" } ]
  },
  "lenses": [ { "stage": "discovery", "lens": "acceptance", "found": 13, "sustained": 2, "deferred": 0, "dismissed": 11 } ],
  "cut": [ { "what": "the fourth alarm, on the status route", "by": "refused against the recommendation (D-17): a single read has no damage of its own" } ],
  "pendencies": [ { "what": "the test-clock gate in the front", "where": "03-execution/audit-prep.md", "owner": "the next front workstream" } ],
  "sweep": [ { "repo": "labs-api-ingestion", "what": "three branches on the origin", "status": "delegated", "how": "`05-close/sweep.sh`, run by the user", "at": "2026-09-11 18:02 UTC" } ],
  "board": {
    "entries": [
      { "id": "U-1", "section": "user", "stage": "house", "title": "the agent status table in every reply", "seen": "asked at discovery, reaffirmed as house practice", "edit": "one sentence in every stage skill's autonomous-mode paragraph", "destination": "claude/skills/*/SKILL.md", "parkedFrom": null,
        "recurrence": { "verdict": "new", "issue": null, "inText": false }, "suggested": "issue", "ruled": "issue", "words": null, "issue": { "n": 41, "url": "https://github.com/…/issues/41" } },
      { "id": "P-3", "section": "pipeline", "stage": "design", "title": "clock-position metric math", "seen": "a false alarm on the first day of prod", "edit": "a fixed line in the alarms lens: the window must contain the event by construction", "destination": "claude/agents/design-reviewer-alarms.md", "parkedFrom": null,
        "recurrence": { "verdict": "closed", "issue": 12, "inText": true }, "suggested": "question", "ruled": "issue", "words": "strengthen it: the rule was there and the lens did not apply it", "issue": { "n": 44, "url": "…" } },
      { "id": "T-2", "section": "taste", "stage": "design", "title": "an alarm only where there is real damage", "seen": "two cards chosen against the recommendation", "edit": null, "destination": null, "parkedFrom": null,
        "recurrence": null, "suggested": "question", "ruled": "discard", "words": "it is taste, leave it in the notes", "issue": null },
      { "id": "V-1", "section": "venture", "stage": "design", "title": "one writer per table", "seen": "the contract is the shared table's schema", "edit": null, "destination": "the venture's engineering doc", "parkedFrom": null,
        "recurrence": null, "suggested": "pendency", "ruled": "pendency", "words": null, "issue": null },
      { "id": "X-3", "section": "discard", "stage": "execute", "title": "a network drop at a parameter read", "seen": "one case rerun", "edit": null, "destination": null, "parkedFrom": null,
        "recurrence": null, "suggested": "discard", "ruled": "discard", "words": null, "issue": null }
    ]
  },
  "close": { "date": "2026-09-11 22:10 UTC", "issuesUrl": "https://github.com/…/issues?q=label%3Adreaming", "note": "twenty-one issues opened, three joined; the repos on main; the blueprint final at the same URL" }
}
```

- The build requires `blueprint/release/release.json` with `closed`
  set, and refuses `close.json` otherwise: the tab's "what is in
  production" is the release's `inProduction`.
- `closed` is `null` while the stage runs; `close` is `null` until
  the close.
- `previous` is `null` when no earlier workstream has a
  `close.json`; then `numbers.previous` is `null` too and the table
  has one column.
- `numbers.this` carries every key of the list above, a number or
  `null` (not measured — never estimated); `numbers.previous` the same
  keys or `null`; `moved[].key` is one of them.
- The page derives **ratios per row** from `numbers.this` and
  `numbers.previous` (days, findings, fixes, rulings, hotfixes and
  dreaming entries per row; sustained and dismissed over found), with
  a disclaimer that rows are the plan's unit and still differ in size
  between workstreams; nothing is written in the JSON for them, and a
  `null` or a zero denominator shows "not measured".
- `lenses[]` is the precision per lens the harvest read, in full: the
  page tints the off ones (more dismissed than sustained).
- `sweep[].status` is `done`, `delegated` (the user runs it, from
  `sweep.sh`) or `open`; a closed stage has no `open` line.
- `board.entries[]`: `section` is `user`, `pipeline`, `taste`,
  `venture`, `repo` or `discard`; `stage` is the stage it bit
  (`discovery` … `close`, or `house`); `parkedFrom` names the previous
  workstream when the entry returned from its board; `recurrence` is
  set for pipeline candidates (`user` and `pipeline` sections, and a
  parked one whose class is pipeline) and `null` elsewhere;
  `suggested` is `issue`, `join`, `discard`, `park`, `pendency` or
  `question` (the three kinds asked at the stop); `ruled` is `null`
  until the stop, then `issue`, `join`, `discard`, `park` or
  `pendency`; `words` are his, verbatim, when he gave them; `issue`
  is set when `ruled` is `issue` or `join`. A closed stage has every
  entry ruled, every `issue`/`join` with its issue, and
  `numbers.this.entries` and `.issues` equal to what the board shows.
- `close.issuesUrl` is the search for this workstream's issues on the
  pipeline repo (the `dreaming` label and the month).
