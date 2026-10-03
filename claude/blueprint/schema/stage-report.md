# blueprint/stage-report.json — the stage report's links

Optional. Written by the session at step 4b of `docs/stage-report.md`,
one key per tab that closed with its video and slides; the earlier
tabs' keys are kept.

```json
{
  "design": { "video": "report/design/video.mp4", "slides": "https://claude.ai/artifact/<id>" }
}
```

| Field | Rule |
|---|---|
| key | a tab of this build: `discovery`, `design`, `plan`, `execution`, `release`, `close` |
| `video` | optional; a relative `.mp4` path inside the workstream (no leading `/`, no `..`); the file exists and is ≤ 10 MB; it is published beside the page at that same path |
| `slides` | optional; the deck's `https://claude.ai/artifact/<id>` (or `/code/artifact/<id>`) link, or, when the session has no Artifact tools (local mode), the deck's first slide as a relative path inside the workstream (`report/<tab>/project/slides/<id>.html`) |

At least one of the two. No other field. The page shows, above the
tab's first section, the bar "Assista · Leia · Aprofunde" (the strings'
`layers`): the player, the link to the slides, and "you are here"; a
missing field shows its step greyed.
