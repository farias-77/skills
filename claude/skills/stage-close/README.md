# stage-close

Stage 6 of the pipeline, under one `/goal`, closing on its own. It
delivers a 1–3 minute video for users (a motion piece recorded in
staging, no technical words) and a "what's new" text, both for the
user to forward; writes the front's retro with numbers from a script;
proves with a script that nothing of the front is left on the machine;
and publishes the stage's report.

```
canary → /goal → ┌ the users' video (started at the release's green staging)
                 ├ harvest (scout) → telemetry.mjs → retro.md
                 └ cleanup.sh --check → --apply → --check empty
               → report → delivery: .mp4 + text + link
```

## Install

This skill needs the pipeline: `claude/scripts/telemetry.mjs` and
`claude/scripts/cleanup.sh`, the `video-builder` with the
`make-it-a-movie` skill, the `slides-builder`, the `scout`, and the
report template. Install the whole `claude/` folder (see the repo's
README). Copying only this folder gives the instructions without the
team or the scripts.

Runtime needs: Node 20+, git, Docker (for the cleanup), `gitleaks`.

## Agents it dispatches

| Agent | Does |
|---|---|
| `video-builder (Sonnet 5.5, high)` | the video for users (dispatched by the release, or here when it was not) |
| `scout (Haiku 5.5, medium)` | the harvest of frictions, with `templates/harvest.md` |
| `slides-builder (Sonnet 5.5, medium)` | the Close deck |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage: open, three jobs at once, report, delivery |
| `references/user-video.md` | tutorial or motion, staging and its actors, one render, what's new |
| `references/retro.md` | the format, the sources, "time is an error" |
| `references/cleanup.md` | the script, unmerged work, what the script cannot see |
| `templates/retro.md` · `whats-new.md` · `trace.md` | what the close writes |
| `templates/harvest.md` | the scout's brief for the harvest |
