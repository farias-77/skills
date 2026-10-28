# weekly-retro

The weekly review of the whole factory, and the only place where the
pipeline and a project's standards change. Once a week the session
reads every workstream that moved (closed or in flight) with the
numbers and signals the stages record on their own, writes one board,
asks him to rule each proposal, lands the pipeline changes by
fast-forward, and hands the standards changes to `/standards update`,
which opens one pull request per project. A rule the reviewers keep
enforcing by hand becomes a demand for a check.

```
telemetry on each workstream → the board → apply · park · drop → pipeline: worktree → verify → fast-forward · standards: one PR
```

## Install

It reads what the other stages leave (`retro.md`, `rulings.md`,
`metrics.json` from `claude/scripts/telemetry.mjs`) and edits the
pipeline repo it is installed from. Install the whole `claude/` folder
(see the repo's README). Runtime needs: git, `jq`, and `gh` for the
incident issues.

## Agents it dispatches

| Agent | Does |
|---|---|
| `scout (Haiku 5.5, high)` | a quote or a line from a workstream's notes or an earlier board |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the week, the board, the rulings, applying and landing |
| `references/governance.md` | who decides what, the shape of a proposal, the numbers, the fixed items, versions and rollback |
| `templates/board.md` | the week's board |
