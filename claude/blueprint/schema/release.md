# The release blueprint — `blueprint/release/release.json`

Stage 5 writes one file, by the session, rewritten whole after every
step: `release.json`. `node claude/blueprint/build.mjs <workstream>`
validates it against the plan and the execution record and assembles
the Release tab. The build refuses with the field named: an entry the
plan does not know, a merge into main or a production step (a deploy,
a traffic shift) before the play was answered `go`, a production step
after a red or a rollback with no new `go`, a closed release with a
watch row neither read nor owned, a fix entry without its run, **a
text over its word cap**. Text fields accept `` `code` `` and
`**bold**`. Everything in the workstream's language.

The order the tab tells: **the play** (his `go`) → **the merge** into
main behind the local-CI signoff → **staging** → the verifier on the
locked journeys → **production** (progressive, or straight with a
smoke run) → each **alarm's first evaluation** → done.

## The voice

Same as the other tabs: short sentences, one idea each; the reader
wants to know, in five minutes, what is in production, how it got
there, what broke on the way and what still waits for someone.

## `release.json`

```json
{
  "started": "2026-10-03", "closed": null,
  "report": {
    "inOneSentence": "…",
    "threeThings": [ { "t": "…", "p": "…" }, { "t": "…", "p": "…" }, { "t": "…", "p": "…" } ],
    "needsYourEye": [ { "t": "…", "p": "…" } ]
  },
  "ships": { "entries": ["F", "E-01", "E-02", "E-03"], "amendments": ["F.1"], "residue": [ "the cost line is read after a week" ] },
  "preflight": [ { "item": "the e-mail provider key for production", "status": "done" } ],
  "ask": { "at": "2026-10-03 14:02", "words": "go", "answer": "go" },
  "merge": { "pr": 41, "sha": "9f8e7d6", "at": "2026-10-03 14:10", "signoff": "local-ci" },
  "staging": [
    { "n": 1, "at": "2026-10-03 14:20", "run": "123456789", "ok": false,
      "summary": "verifier 5/6 entries PASS; E-05 FAIL: `ready-email-sent`", "cause": "code", "fix": "R.1", "proof": "proof/staging-1.txt" },
    { "n": 2, "at": "2026-10-03 16:02", "pr": 43, "run": "123456901", "ok": true,
      "summary": "verifier 6/6 entries PASS", "cause": null, "fix": null, "proof": "proof/staging-2.txt" }
  ],
  "fixes": [ { "id": "R.1", "kind": "staging", "what": "the ready e-mail job retried on an unknown result", "rounds": 2, "sha": "7c6b5a4", "run": "04-release/entries/R.1/run-1.json" } ],
  "versions": [ { "artifact": "api", "from": "v1.4.0", "to": "v1.5.0", "bump": "minor", "commits": 23, "unparsed": 0, "notes": "04-release/notes/api.md" } ],
  "rollout": {
    "mode": "progressive",
    "candidate": { "rev": "api-00042", "tag": "rc-9f8e7d6", "smoke": "4/4" },
    "shifts": [ { "pct": 10, "at": "2026-10-03 16:20" }, { "pct": 100, "at": "2026-10-03 16:31" } ],
    "bake": { "minutes": 10, "newReq": 412, "new5xx": 0.0, "prev5xx": 0.1, "newP95": 180, "prevP95": 190, "verdict": "hold" }
  },
  "production": [
    { "n": 1, "at": "2026-10-03 16:31", "run": "123457002", "ok": true, "rolledBack": false,
      "checks": "4/4 green", "verified": "GET /health → 200, version v1.5.0", "proof": "proof/prod-1.txt" }
  ],
  "rollbacks": [],
  "alarms": [ { "name": "api-5xx", "state": "ok" }, { "name": "import-stale", "state": "no-datapoints" } ],
  "inProduction": [ { "artifact": "api", "version": "v1.5.0", "sha": "9f8e7d6", "at": "2026-10-03 16:36" } ],
  "watch": [
    { "n": 1, "what": "the first nightly import ends Succeeded", "readableAt": "2026-10-04 06:15",
      "expects": "status SUCCEEDED, stale alarm OK", "readAt": null, "got": null, "ok": null, "owner": null }
  ],
  "pendencies": [ { "what": "the cost line after a week", "owner": "the CTO" } ],
  "numbers": { "wallClockH": 2.6, "hisMin": 6, "tokensM": null, "reverts": 0, "revertRate": 0 }
}
```

- `ask` is **the play**: `words` his words, verbatim; `answer` is `go`
  (or `not-now` when he held it); `at` the play's hour; `pr` optional
  (no release PR is asked on). No merge into main and no production
  step exists before an `ask` answered `go`; a new artifact after a
  production red or a rollback needs a new `go` (`asks` may be an
  array when there were several; the last one is the one that
  shipped).
- `merge` (optional until it happens): the PR into main, its merge
  `sha`, `at`, and the `signoff` context it merged behind
  (`local-ci`).
- `ships.entries` names ids of `execution.json` that are merged;
  `amendments` names its `F.<n>`.
- `staging[]` is each staging deploy with the verifier's run on the
  locked journeys; `pr` is optional (staging deploys main's merge
  sha). `cause` is `code` (then `fix` names an `R.<n>` in `fixes`),
  `environment`, or `null` on a green run.
- `fixes[].kind` is `staging`, `production` or `hotfix`; each has its
  `run` file.
- `rollout` (optional): `mode` is `progressive` or `straight`. A
  progressive one names its `candidate` (`rev`, `tag`, `smoke` as
  read on the tag); `shifts[]` are the traffic moves (`pct` 0–100,
  `at`), each one a production step under the same `go` rule; `bake`
  is the new revision against the previous one (`minutes`, `newReq`,
  `new5xx` and `prev5xx` in %, `newP95` and `prevP95` in ms, `null`
  when not measured) and its `verdict`: `hold`, `no-signal` or
  `trigger`.
- A `production[]` step with `rolledBack: true` names the `fix` that
  followed. `rollbacks[]` (optional): `at`, the `trigger` that fired,
  its `value`, the revision traffic went back `to`, and the `fix`
  (`null` until opened).
- `alarms[]` (optional): each alarm's first evaluation after the
  bake, written as read: `ok`, `no-datapoints`, `firing` or
  `not-evaluated`. "No datapoints" is never written as `ok`.
- `numbers` (optional, from the trace's numbers line): `wallClockH`
  (play → done), `hisMin` (his minutes), `tokensM`, `reverts`,
  `revertRate` (reverts ÷ commits); each a number, or `null` when the
  record does not carry it.
- `watch[]`: `readAt`, `got` and `ok` are filled when read; `owner`
  when it is left as a pendency.
- `closed` is set when every watch row is read or owned and no fix is
  open.

Word caps: `summary` 25 · `what` 18 · `item` 16 · `verified` 25 ·
`expects` 20 · `rollbacks[].trigger` 14 · `inOneSentence` 35 ·
`threeThings[].p` and `needsYourEye[].p` 35 · `residue[]` 20. Ids,
shas, runs, paths, dates, versions, numbers and `words` are not
capped.
