# lets-cook

The single entry point of the pipeline: `/lets-cook <idea>`. It always
opens the same way, with scouts in the background and a light
interview, and then picks the route itself, saying it in one line with
the reason:

| Route | When | Path |
|---|---|---|
| full | several rules, a new screen, new data, an integration, or doubt about what to build | loads `stage-discovery` in the same session |
| short | one behavior that fits one entry | a one-page brief → one authorization and one `/goal` → the entry pipeline → his use → release → a short close |
| hotfix | production broken now | the same, starting from a test that reproduces the bug |
| `repo: legacy` | a short route or a hotfix in an old, frozen repo | the repo's own CI and deploy, a session watch, his ok before production when there is no staging |

Every route keeps every check; only the ceremony shrinks.

## Install

This skill needs the pipeline: `stage-discovery` (full route),
`stage-release` and its `references/release.md` (the path to
production), `stage-close/references/cleanup.md`, the stage-4 cast and
`exec-entry-workflow.js`, the guard and `authorize.sh`, and
`claude/scripts/`. Install the whole `claude/` folder (see the repo's
README).

## Agents it dispatches

| Agent | Does |
|---|---|
| `scout (Sonnet 5.5, low)` × 2–4 | the area's map, the other fronts, legacy or not, broken in production or not |
| the stage-4 cast, through `exec-entry-workflow.js` | the one entry and its adjustments |
| `slides-builder (Sonnet 5.5, medium)` | the minimal report's decks |
| `video-builder (Sonnet 5.5, high)` | the users' video, only when a screen users see changed |

## Files

| Path | What |
|---|---|
| `SKILL.md` | open, interview, route, brief, entry, use, release, short close, switching |
| `references/routes.md` | the criteria, examples on each side of the line, `repo: legacy` |
| `references/light-interview.md` | the razor, the hotfix questions |
| `templates/brief.md` | the one-page brief |
| `templates/short-close.md` | the short close: numbers, retro, what's new, the cleanup proof |
