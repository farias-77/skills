# pipeline-setup

Brings a project to the pipeline's bar
([`docs/project-contract.md`](../../../docs/project-contract.md), 20
roles in three levels). Scouts read the project at its default
branch's sha; the session rates every role, writes
`pipeline-readiness.md` on a `pipeline-setup` branch, proposes the
gaps cheapest first, and on your word applies the generic pieces on
that branch, one commit per gap. It never touches `main`, never writes
or reads a secret, never changes branch protection: those are listed
for you with a ready command.

```
open → six scouts on an audit worktree → rate each role → readiness file + plan → apply on a branch → the whole gate once
```

## Install

It needs the bar (`docs/project-contract.md`) and the pieces it copies
into the project: `claude/hooks/` (the guard, `authorize.sh`, their
test) and `claude/scripts/local-ci.sh` (the fallback signoff). Install
the whole `claude/` folder and `docs/` (see the repo's README), then run
`/pipeline-setup <path-to-project>`. Runtime needs: git, `jq`, and `gh`
for a GitHub remote.

## Agents it dispatches

| Agent | Does |
|---|---|
| `scout (Sonnet 5.5, low)` × 6 | one per group of roles; quotes with `path:line`, where it looked, what it did not find |

## Files

| Path | What |
|---|---|
| `SKILL.md` | open, audit, propose, apply, close |
| `references/audit.md` | each scout's questions, the rating rule, the probes |
| `templates/README.md` | how a template is filled |
| `templates/settings.json` · `templates/permissions.md` | the `.claude/settings.json` with the fail-closed guard wrapper, and the reason for each rule |
| `templates/pipeline-readiness.md` | the audit's report |
| `templates/golden-paths.md` · `templates/verify-map.md` · `templates/design-tokens-export.md` | golden paths, the drive section of a feature map, the tokens export |
| `templates/structure-check/` | the structure check, calibrated from the codebase |
| `templates/cloud-*` | the cloud environment for entries: setup script, session-start hook, settings fragment, its document |
