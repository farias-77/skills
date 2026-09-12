# The execution blueprint — what each worker and the master leave in JSON

Stage 4 writes under `<workstream>/blueprint/execution/`: each **worker**
writes `lanes/<repo>.json` (its lane: every row with its PR, rounds and
proof; the suites; what is worth a look), rewritten whole after every
row; the **master** writes `waves/<wNN>.json` at each gate (the walk
with what it printed, the tag and shas, the fixes, the parked items,
"for the intern"), `exec-report.json` at the end of the waves (the
plain layer the tab opens with) and `audit.json` before and after the
audit (the items, the user's rulings, the fixes, the close).
`node claude/blueprint/build.mjs <workstream>` validates them and
assembles the Execution tab. The build refuses with the field named: a
lane or a row the plan does not know, a merged row with no PR or no
proof output, a walk step with no output, a gated wave with a red
step, a closed audit with an unruled item, **a text over its word cap**.
Text fields accept two inline marks: `` `code` `` and `**bold**`. No
HTML. Everything in the workstream's language.

## The voice: technical, and an intern reads it to the end

Same rules as the plan ([schema/plan.md](plan.md)): short sentences,
one idea each; the real name of a thing once, then what it does; a
number only when it changes what the reader would decide; lists
curated, never complete. The Execution tab's reader wants to know, in
ten minutes: what got built and proved, where the master stopped to
accept and what it saw, what was decided in his place, and what waits
for him at the audit. The record (the row files, the traces) is
named as the authority, never copied.

## Word caps (the build refuses a field over its cap)

| Field | Cap | Field | Cap |
|---|---|---|---|
| lane `intro` | 45 | lane `rows[].what` | 18 |
| lane `rows[].notes[]` / `.departures[]` / `.choices[]` / `.stops[]` | 25 | lane `worthALook[]` | 20 |
| wave `inOneParagraph` | 70 | wave `fixes[].why` / `parked[].why` | 20 |
| intern `problem` | 45 | intern `roles[].role` / `.analogy` | 18 |
| intern `guards[].stops` | 14 | intern `guards[].why` | 20 |
| intern `alphaVsProd[]` | 20 | report `inOneSentence` | 35 |
| report `threeThings[].p` / `needsYourEye[].p` | 35 | report `lanesPlain` / `wavesPlain` / `auditPlain` | 45 |
| audit `title` | 12 | audit `plain` | 25 |
| audit `standardSays` / `built` / `reading` | 35 | audit `why` | 25 |
| audit `fixes[].what` | 20 | audit close `alphaAt` / `residue[].what` | 20 |

`run`, `expect`, `see`, `where`, `got`, `shot`, `file`, `branch`,
`sha`, `words` and every id, number, name, path, url and command are
not capped: they are copied exactly.

## `lanes/<repo>.json` (the worker)

```json
{
  "repo": "labs-api-ingestion", "session": "minute-ingestion-ingestion",
  "intro": "Eight rows, one branch each, all merged; the extract row took two builders. Alpha runs the whole pipeline against the stub.",
  "rows": [
    { "num": "1.3", "story": "S-008", "wave": "w01", "what": "extract: the panel client, the CSV, the snapshot in S3",
      "status": "merged", "branch": "feat/2026-09-08-minute-ingestion/1.3-extract",
      "pr": { "n": 7, "url": "https://github.com/…/pull/7" },
      "rounds": [ { "n": 1, "lenses": 5, "findings": 36, "sustained": 16, "deferred": 17, "dismissed": 3 },
                  { "n": 2, "lenses": 5, "findings": 4, "sustained": 2, "deferred": 1, "dismissed": 1 } ],
      "proof": { "run": "bash smoke/run.sh runs", "expect": "`0 failed` of 10 cases", "got": "10 passed, 0 failed", "file": "03-execution/w01/proof/1.3-runs.txt" },
      "attempts": 1, "mergedAt": "2026-09-11 01:20 UTC", "fixOf": null,
      "notes": ["the timeout case uses real timers with short values: `AbortSignal.timeout` ignores fake timers"],
      "departures": [], "choices": ["invalid payload → `INTERNAL_ERROR`; the snapshot schema is born in 1.4 with its first reader"],
      "stops": [] },
    { "num": "1.2.f1", "story": "S-008", "wave": "w01", "what": "fix: the AWS clients without the `@smithy` import", "status": "merged",
      "branch": "…", "pr": { "n": 12, "url": "…" }, "rounds": [ { "n": 1, "lenses": 5, "findings": 1, "sustained": 0, "deferred": 1, "dismissed": 0 } ],
      "proof": { "run": "bash smoke/run.sh panel-stub", "expect": "`0 failed` of 3", "got": "3 passed, 0 failed", "file": "…" },
      "attempts": 1, "mergedAt": "…", "fixOf": "1.2", "notes": [], "departures": [], "choices": [], "stops": [] }
  ],
  "suites": [ { "wave": "w01", "cases": 34, "passed": 34, "failed": 0, "skipped": 0, "minutes": 14, "file": "03-execution/w01/proof/suite-labs-api-ingestion.txt" } ],
  "worthALook": ["the alpha stub has no reserved concurrency: the regional quota is 10"]
}
```

- `status` is `merged`, `building`, `parked` or `open`. A `merged` row
  has `pr`, `mergedAt` and a proof with `got` (or `shot`); `rounds` has
  one or two entries, never three. `attempts` is 1, 2 or 3.
- `num` is a plan row (`1.3`), a fix row (`1.2.f1`, `fixOf: "1.2"`;
  `w01.f1` when the fix belongs to a walk step and no row: `fixOf:
  "w01"`) or an audit row (`A.1`, `fixOf: "A"`). A plan row's `story`
  and `wave` match `sequence.json`.
- `proof` is `{run, expect, got, file}` or `{see, where, shot}`, where
  `shot` is the screenshot's path under `03-execution/`.

## `waves/<wNN>.json` (the master)

```json
{
  "n": "w01", "name": "the pipeline runs", "gatedAt": "2026-09-11 05:10 UTC", "tag": "w01",
  "inOneParagraph": "A run started by hand ends Succeeded with the orphans in the tables and the status route answering. Alpha is the tag `w01` of the ingestion repo; the tracking suite still passes on what the run wrote.",
  "shas": [ { "repo": "labs-api-ingestion", "sha": "04c59e5" } ],
  "suitesBefore": [ { "repo": "labs-api-ingestion", "passed": 34, "failed": 0, "skipped": 0, "file": "…" } ],
  "walk": [
    { "step": 1, "run": "aws stepfunctions start-execution … --input '{}'", "expect": "status `SUCCEEDED` within 10 min", "got": "SUCCEEDED in 6m12s", "ok": true, "file": "03-execution/w01/proof/walk-1.txt" },
    { "step": 4, "see": "the panel still opens", "where": "screenshot to `03-execution/w01/proof/`", "shot": "03-execution/w01/proof/walk-4-light-1440.png", "ok": true }
  ],
  "shadow": [ { "repo": "labs-api-ingestion", "passed": 34, "failed": 0, "skipped": 0, "file": "…" } ],
  "fixes": [ { "id": "w01-1", "lane": "labs-api-ingestion", "row": "1.2.f1", "why": "the three lambdas failed to import `@smithy/node-http-handler`", "status": "merged" } ],
  "parked": [],
  "forTheIntern": {
    "problem": "The operations dashboard is fed by hand from the Minute panel. This wave makes a scheduled run fetch the panel's data and write it into the tables the dashboard already reads.",
    "roles": [ { "component": "`extract`", "role": "logs into the panel and saves a snapshot", "analogy": "the courier who photographs the noticeboard" } ],
    "guards": [ { "guard": "the run lock", "stops": "two runs writing at once", "why": "AC-4: one run per organization at a time" } ],
    "alphaVsProd": ["alpha reads a stub that serves recorded responses; prod reads the real panel"]
  }
}
```

- `n` is a wave of `sequence.json`. `gatedAt` is `null` while the wave
  is open; when set, every walk step has `ok: true` and every fix has
  `status: merged`. A walk step is `{step, run, expect, got, ok, file}`
  or `{step, see, where, shot, ok}`; a red step keeps `ok: false` and
  its `got` until the fix's merge, then the step is rewritten green.
- `forTheIntern` has the four parts of `explain.md`; `roles` and
  `guards` are curated (the ones that explain the wave), never the
  whole inventory.

## `exec-report.json` (the master)

```json
{
  "inOneSentence": "Three sessions built three repos at once; two gates walked green; one item waits for you.",
  "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ],
  "needsYourEye": [ { "t": "…", "p": "…" } ],
  "lanesPlain": "…", "wavesPlain": "…", "auditPlain": "…"
}
```

## `audit.json` (the master)

```json
{
  "opened": "2026-09-11", "closed": null,
  "items": [
    { "id": "D.1", "kind": "D", "title": "smoke fixes without a lens", "plain": "Four fixes to smoke expectations entered on the top branch without a lens reading them.",
      "where": "w01 · 1.7 · `5dc88d3` `6bfb9a4` `d944b5f` `04c59e5`",
      "standardSays": "every change goes through a lens before the merge; the conductor may fix a one-line problem, not a series",
      "built": "the conductor fixed on the top of the stack after the rows' rounds; three touch smoke expectations only",
      "reading": "none touches a business rule; the risk is the precedent: an assert loosened to fit the product, unseen",
      "recommendation": "keep", "why": "record the rule: a test-expectation change always passes a lens",
      "ruling": "keep", "words": "passa a valer a regra" }
  ],
  "fixes": [ { "id": "A.1", "lane": "labs-api-ingestion", "row": "A.1", "from": "C.2", "what": "the real invite code out of the recorded fixtures", "status": "merged", "pr": { "n": 13, "url": "…" } } ],
  "close": { "date": "2026-09-11 22:40 UTC", "shas": [ { "repo": "labs-api-ingestion", "sha": "9f1c2ab", "tag": "w01" } ], "alphaAt": "alpha at these shas, deploy read whole, no removal",
             "suites": [ { "repo": "labs-api-ingestion", "passed": 34, "failed": 0, "skipped": 0 } ],
             "residue": [ { "what": "the `sync-stale` alarm proved on the first day of prod", "owner": "stage 5" } ] }
}
```

- `kind` is `P` (parked), `D`, `C`, `N` or `S`. `ruling` is `keep`,
  `fix`, `revert` or `null` (not yet asked). `close` is `null` until
  the Close section is written; when set, every item has a ruling and
  every fix is `merged` — a null where the stage claims to be closed
  is an unclosed audit (ledger P-2).
