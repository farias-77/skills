# The release blueprint — `blueprint/release/release.json`

Stage 5 writes one file, by the session, rewritten whole after every
step: `release.json`. `node claude/blueprint/build.mjs <workstream>`
validates it against the plan and the execution record and assembles
the Release tab. The build refuses with the field named: an entry the
plan does not know, a production step before the ask was answered
"vai", a closed release with a watch row neither read nor owned, a
fix entry without its run, **a text over its word cap**. Text fields
accept `` `code` `` and `**bold**`. Everything in the workstream's
language.

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
  "staging": [
    { "n": 1, "at": "2026-10-03 14:10", "pr": 41, "run": "123456789", "ok": false,
      "summary": "suite 212 passed, 1 failed: `ready-email-sent`", "cause": "code", "fix": "R.1", "proof": "proof/staging-1.txt" },
    { "n": 2, "at": "2026-10-03 16:02", "pr": 43, "run": "123456901", "ok": true,
      "summary": "suite 213 passed", "cause": null, "fix": null, "proof": "proof/staging-2.txt" }
  ],
  "fixes": [ { "id": "R.1", "kind": "staging", "what": "the ready e-mail job retried on an unknown result", "rounds": 2, "sha": "7c6b5a4", "run": "04-release/entries/R.1/run.json" } ],
  "versions": [ { "artifact": "api", "from": "v1.4.0", "to": "v1.5.0", "bump": "minor", "commits": 23, "unparsed": 0, "notes": "04-release/notes/api.md" } ],
  "ask": { "at": "2026-10-03 16:20", "pr": 44, "words": "vai", "answer": "go" },
  "production": [
    { "n": 1, "at": "2026-10-03 16:31", "run": "123457002", "ok": true, "rolledBack": false,
      "checks": "4/4 green", "verified": "GET /health → 200, version v1.5.0", "proof": "proof/prod-1.txt" }
  ],
  "inProduction": [ { "artifact": "api", "version": "v1.5.0", "sha": "9f8e7d6", "at": "2026-10-03 16:36" } ],
  "watch": [
    { "n": 1, "what": "the first nightly ingestion ends Succeeded", "readableAt": "2026-10-04 06:15",
      "expects": "status SUCCEEDED, stale alarm OK", "readAt": null, "got": null, "ok": null, "owner": null }
  ],
  "pendencies": [ { "what": "the cost line after a week", "owner": "the CTO" } ]
}
```

- `ships.entries` names ids of `execution.json` that are merged;
  `amendments` names its `F.<n>`.
- `staging[].cause` is `code` (then `fix` names an `R.<n>` in
  `fixes`), `environment`, or `null` on a green run.
- `fixes[].kind` is `staging`, `production` or `hotfix`; each has its
  `run` file.
- `ask.answer` is `go` or `not-now`; `words` is his, verbatim. No
  `production` step exists before an `ask` answered `go`; a new
  artifact after a production red needs a new ask (`asks` may be an
  array when there were several; the last one is the one that
  shipped).
- A `production[]` step with `rolledBack: true` names the `fix` that
  followed.
- `watch[]`: `readAt`, `got` and `ok` are filled when read; `owner`
  when it is left as a pendency.
- `closed` is set when every watch row is read or owned and no fix is
  open.

Word caps: `summary` 25 · `what` 18 · `item` 16 · `verified` 25 ·
`expects` 20 · `inOneSentence` 35 · `threeThings[].p` and
`needsYourEye[].p` 35 · `residue[]` 20. Ids, shas, runs, paths,
dates, versions and `words` are not capped.
