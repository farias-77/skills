# stage-close

Stage 6 of the pipeline, under one `/goal`. It looks back: the
workstream's retro with the script's numbers and the proposals for the
project's standards (gathered from the `[standards]` lines and a drift
check of the maps). And it looks out: a "what's new" text and, when he
asks, a video and a deck that explain the feature to its users and the
team, in the project's design system. It proves with a script that
nothing is left on the machine, and publishes its report.

```
/goal + Video · Deck? → ┌ what's new ∥ video ∥ deck (what he picked)
                        ├ harvest ∥ drift check (scouts) → telemetry.mjs → retro.md
                        └ cleanup.sh --check → --apply → --check empty
                      → report → delivery: text + files + link
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
| `video-builder (Sonnet 5.5, high)` | the video for users, when he asks |
| `slides-builder (Sonnet 5.5, medium)` | the deck for the team, when he asks |
| `scout (Haiku 5.5, high)` × 2 | the harvest of frictions (`templates/harvest.md`) and the drift check of the maps |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage: open, three jobs at once, report, delivery |
| `references/user-video.md` | the video and the deck for users: tutorial or motion, the look, staging and its actors, one render, what's new |
| `references/retro.md` | the format, the sources, "time is an error" |
| `references/cleanup.md` | the script, unmerged work, what the script cannot see |
| `templates/retro.md` · `whats-new.md` · `trace.md` | what the close writes |
| `templates/harvest.md` | the scout's brief for the harvest |
