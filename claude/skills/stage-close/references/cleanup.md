# The cleanup

Every stage cleans what it created as it leaves; the close proves the
whole front is gone. The machine is shared by several fronts, and
leftovers (images, volumes, worktrees, caches) fill the disk until a
gate fails for no reason in the code.

## The script

```
claude/scripts/cleanup.sh <slug> --check      list what is left; exit 1 when anything is
claude/scripts/cleanup.sh <slug> --apply      remove it
claude/scripts/cleanup.sh <slug> --check      must come back empty: the proof
```

Pass `--repo <dir>` for every repo the front touched (the plan's
repos) and `--ws <designs-root>/<slug>`.

| It finds | How |
|---|---|
| worktrees | path or branch carries the slug |
| branches, local and on origin | `feat/<slug>`, `story/<slug>/*`, `evidence/<slug>/*`, `fix/<slug>/*`, `hotfix/<slug>`, `revert/<slug>` |
| docker | the project's `make sweep front=<slug>` (containers, volumes, networks, images with the front's label); without it, everything named `<slug>-*` |
| scratch | `_run/`, `_scratch/`, `.remotion/` under the front's folder |

## Unmerged work is his

The script never removes unmerged work by itself. It lists it as
`unmerged` until you pass:

- `--discard <branch>` when `rulings.md` says he discarded it;
- `--keep <branch>` when he said "later". It stays, and the retro gets
  one "Got stuck" line saying where it is.

Nothing in `rulings.md` about it: keep it, and say so in the retro.

## What the script cannot see

| Item | How you clear it |
|---|---|
| staging actors created for the video | the project's staging-actor command, delete, for this front's actors |
| cloud sessions the front launched | none still running (the execute's list of cloud runs) |
| remote `feat/` or `hotfix/` branches still there | the ruleset deletes merged branches; one left is listed as `his`: name it in the message |

## The proof

The final `--check` output goes into `05-close/trace.md`. The close's
`/goal` is not done until it reads "nothing of <slug> is left".
