# The release blueprint — what the session leaves in JSON

Stage 5 writes one file, `<workstream>/blueprint/release/release.json`,
rewritten whole at every trace line that changes it (the goal, a
merge, a confirmation, the versions, a train step, a fix, a watch
row, the close). `node claude/blueprint/build.mjs <workstream>`
validates it against the plan and assembles the Release tab. The
build refuses with the field named: a repo the plan does not know, a
train step with no output, a version without its URL when the stage
is closed, a fix not merged when closed, a watch row neither read nor
given an owner when closed, a pre-flight line still open when closed,
**a text over its word cap**. Text fields accept two inline marks:
`` `code` `` and `**bold**`. No HTML. Everything in the workstream's
language.

## The voice

Same as the plan and the execution ([schema/plan.md](plan.md),
[schema/execution.md](execution.md)): short sentences, one idea each;
the real name of a thing once, then what it does; a number only when
it changes what the reader decides. The Release tab's reader wants to
know, in five minutes: what is in production and since when, what the
train did and where it stopped, what was fixed on the way, what the
watch read, and what stays with an owner. The record (`trace.md`, the
rows, `proof/`) is named as the authority, never copied.

## Word caps (the build refuses a field over its cap)

| Field | Cap | Field | Cap |
|---|---|---|---|
| `inOneSentence` | 35 | `threeThings[].p` / `needsYourEye[].p` | 35 |
| `trainPlain` / `versionsPlain` / `watchPlain` | 45 | `preflight[].what` / `.how` | 20 |
| `confirmation[].stood` | 25 | `rollback[].note` | 35 |
| `train[].what` | 14 | `fixes[].seen` / `.what` | 20 |
| `watch[].what` | 20 | `stops[].what` / `.how` | 25 |
| `close.residue[].what` | 20 | | |

`run`, `expect`, `see`, `where`, `got`, `shot`, `file`, `sha`, `url`,
`tag`, `words`, `returnTo`, every hour, id, number, name, path and
command are not capped: they are copied exactly.

## `release.json`

```json
{
  "opened": "2026-09-11 02:40 UTC", "closed": "2026-09-11 16:20 UTC",
  "goal": { "words": "conduz de ponta a ponta, inclusive o go de prod", "at": "2026-09-11 03:20 UTC" },
  "inOneSentence": "Three repos in production since the morning of 11/09; the first scheduled runs finished on their own; one alarm was fixed by a hotfix.",
  "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ],
  "needsYourEye": [ { "t": "…", "p": "…" } ],
  "trainPlain": "…", "versionsPlain": "…", "watchPlain": "…",
  "ships": [ { "repo": "labs-api-ingestion", "sha": "884d790", "waves": ["w01", "w02"], "lane": "A" } ],
  "preflight": [ { "what": "the three SSM parameters of prod", "status": "delegated", "how": "by CLI, values from the vendor's doc, never printed", "at": "2026-09-11 03:42 UTC" } ],
  "integration": [ { "repo": "labs-api-ingestion", "pr": { "n": 14, "url": "…" }, "rebased": false, "ci": "green", "mergedAt": "2026-09-11 03:22 UTC", "mainSha": "9902327" } ],
  "confirmation": [ { "repo": "labs-api-tracking", "treeIdentical": true, "alphaDiffEmpty": true, "suite": null, "stood": "the whole suite green on the branch at the audit's close" },
                    { "repo": "labs-api-ingestion", "treeIdentical": true, "alphaDiffEmpty": true, "suite": { "passed": 34, "failed": 0, "skipped": 0, "file": "04-release/proof/suite-labs-api-ingestion.txt" }, "stood": null } ],
  "versions": [ { "repo": "labs-api-ingestion", "from": null, "to": "v1.0.0", "bump": "initial", "sha": "9902327", "url": "https://github.com/…/releases/tag/v1.0.0", "notesFile": "04-release/notes/labs-api-ingestion.md", "unparsed": 0 } ],
  "rollback": [ { "repo": "labs-api-ingestion", "returnTo": "absence: schedule off, service and monitoring destroyed, data kept", "dataSafe": true, "note": "the tables are RETAIN; nothing the tracking reads changes shape", "file": "04-release/rollback/labs-api-ingestion.md" } ],
  "train": [
    { "step": 7, "repo": "labs-api-ingestion", "what": "data and service stacks, schedule off", "run": "git checkout v1.0.0 && npm run deploy:prod -- labs-ingestion-data-prod labs-ingestion-service-prod", "expect": "runs ACTIVE with PITR; scheduler DISABLED; 4 lambdas nodejs22.x arm64; no stub", "got": "all as expected; 0 alarms yet", "ok": true, "at": "2026-09-11 04:12 UTC", "file": "04-release/proof/train-7.txt" },
    { "step": 11, "repo": "labs-front-tracking", "what": "merge = deploy, then the live site", "see": "the site serves the new bundle with the ingestion strings", "where": "https://tracking.clonexlabs.com", "shot": "04-release/proof/train-11.png", "ok": true, "at": "2026-09-11 04:40 UTC" }
  ],
  "fixes": [ { "id": "R.1", "kind": "hotfix", "repo": "labs-api-ingestion", "seen": "sync-stale alarm ALARM with the ingestion healthy", "what": "2 h period with the night forced by the schedule", "pr": { "n": 17, "url": "…" }, "tag": "v1.0.2", "status": "deployed" } ],
  "watch": [ { "n": 1, "what": "the first scheduled run ends Succeeded", "at": "2026-09-11 12:01 UTC", "expect": "SUCCEEDED, sync_success 1, alarm OK", "got": "SUCCEEDED in 20 s, sync_success 1", "ok": true, "readAt": "2026-09-11 12:05 UTC", "file": "04-release/proof/watch-1.txt", "owner": null },
             { "n": 3, "what": "the monthly bill after a week", "at": "2026-09-18 00:00 UTC", "expect": "under the budget", "got": null, "ok": null, "readAt": null, "file": null, "owner": "operations, next demand" } ],
  "stops": [],
  "close": { "date": "2026-09-11 16:20 UTC", "prod": [ { "repo": "labs-api-ingestion", "version": "v1.0.2", "sha": "48f25ac", "deployedAt": "2026-09-11 16:11 UTC" } ],
             "residue": [ { "what": "the night derivation assumes the schedule never crosses midnight UTC", "owner": "observability demand" } ] }
}
```

- `goal` is `null` until he gives it; when set, `words` are his,
  verbatim. `closed` is `null` while the stage runs.
- `ships[].repo` is a lane of `sequence.json` and `waves` are its
  waves; `integration`, `confirmation`, `versions`, `rollback` and
  `close.prod` name only repos in `ships`.
- `preflight[].status` is `done`, `delegated` or `open`; a closed
  stage has no `open` line.
- `confirmation`: `treeIdentical` and `alphaDiffEmpty` both true ⇒
  `stood` says why the audit's green stands (P-17) and `suite` may be
  null; either false ⇒ `suite` with the four fields.
- `versions[].to` is `vN.N.N`; `bump` is `major`, `minor`, `patch` or
  `initial`; a closed stage has a version with `url` and `sha` for
  every repo in `ships`.
- `train[]` is a step of the plan's train table in order: `{step,
  repo, what, run, expect, got, ok, at, file}` or `{step, repo, what,
  see, where, shot, ok, at}`; a red step keeps `ok: false` and its
  `got` until the fix's deploy, then the step is rewritten green with
  the new `at`. A closed stage has every step `ok: true`.
- `fixes[].id` is `R.<n>`; `kind` is `fix` (before or in the train)
  or `hotfix` (at the watch); `status` is `building`, `merged`,
  `deployed` or `stopped`. A closed stage has every fix `merged`
  (kind fix) or `deployed` (kind hotfix).
- `watch[]`: `ok` is `null` until read; a closed stage has every row
  read (`readAt`, `ok: true`) or given an `owner` (a pendency the
  plan announced: beyond 48 h).
- `stops[]`: `{at, what, how}` — the third red, a rollback not safe
  for data; how it ended.
- `close` is `null` until the close; when set, `prod` has one line per
  repo in `ships` and `residue` carries what stays with an owner.
