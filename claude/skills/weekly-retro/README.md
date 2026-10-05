# weekly-retro

The only place where the pipeline changes. Once a week the session
reads the retro and the rulings of every front closed that week, writes
a board (raw numbers per front and route, last week's changes beside
them, proposals with their evidence and exact edit, the live fixes to
ratify, the fixed items that are due), asks the user to rule each
proposal, and lands what he approved by fast-forward on the pipeline
repo.

```
read the week's retros → the board → apply · park · drop → edit in a worktree → verify → fast-forward
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
| `scout (Sonnet 5.5, low)` | a quote or a line from a front's notes or an earlier board |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the week, the board, the rulings, applying and landing |
| `references/governance.md` | who decides what, the shape of a proposal, the numbers, the fixed items, versions and rollback |
| `templates/board.md` | the week's board |
