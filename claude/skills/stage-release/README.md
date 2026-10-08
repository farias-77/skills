# stage-release

Stage 5 of the pipeline. One `/goal` takes a finished workstream from its
feature branch to production: the merge into `main` under the user's
authorization, the CI's staging deploy and smoke, a `vX.Y.Z` tag that
promotes the same image to production with a smoke and a 15-minute
watch that rolls back on its own, and the stage's report. A red gets
one fix, then it stops; the user is asked only what is on the stop
list.

```
canary → /goal → main (local-ci green) → staging → tag → production + watch → report → /stage-close <slug>
```

## Install

This skill needs the pipeline: the stage-4 cast and its
`exec-entry-workflow.js` for a fix, the guard hook and
`authorize.sh`, `claude/scripts/` (telemetry, cleanup) and the report
builders. Install the whole `claude/` folder (see the repo's README).
Copying only this folder gives the instructions without the team or
the guard.

The project must have: a `local-ci` status required on `main`; a
staging deploy on push to `main`; a production deploy on `v*` tags that
promotes the staging image, smokes, watches and rolls back; and the
guard installed with the settings wrapper.

## Agents it dispatches

| Agent | Does |
|---|---|
| `scout (Haiku 5.5, medium)` | lookups |
| the stage-4 cast, through `exec-entry-workflow.js` mode `fix` | an `X.n` fix |
| `video-builder (Sonnet 5.5, high)` | the Release video; starts the close's video for users at the green staging |
| `slides-builder (Sonnet 5.5, medium)` | the Release deck |
| `artifact-builder (Sonnet 5.5, medium)` | the Explainer, only when there was an incident |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage, step by step (0–5), the red rule, the stop list |
| `references/release.md` | the trunk, the authorization, taking turns on `main`, smoke and watch, the hotfix, legacy repos |
| `references/migrations.md` | expand now and contract later; the risk on real data |
| `templates/plan.md` | the release plan, written at execute |
| `templates/trace.md` | one line per step |
