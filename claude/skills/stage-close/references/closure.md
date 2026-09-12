# The closure and the sweep — step 2 of stage 6

## The closure

`05-close/closure.md` is written once and never edited after: the
frozen counterpart of the living documents. A reader a year from now
understands what the demand was without opening anything else. Its
sources are the harvest and the release's close, never memory.

| Section | Source | What it says |
|---|---|---|
| What shipped | `release.json` → `close.prod`, `versions`; `waves.md` | per repo: the version in prod and one line of what it now does that it did not; per wave: the stories and where each lives now (the repo, the PRs, the proof folder) |
| What deliberately did not ship | the discovery's "what stays out", the design's decisions, the rulings, the audit | every cut with the decision that cut it (its id, the stage, his words when he gave them); never a silent absence |
| Pendencies, each with an owner | the release's residue, the audit's residue, the watch rows given an owner, the sweep's open lines, the board's venture- and repo-class entries | the item, where it lives now (a file, an issue, a runbook, a memory), and who owns it |
| The demand in numbers | the harvest summed, the previous `close.json` | the table of `schema/close.md`, this workstream against the previous one; then one line per number that moved, saying why, without adjectives |

The numbers tell the retro's story: two rounds and no third; a lens
that dismissed more than it sustained; how many of the execution's
findings the worker deferred; how many departures the audit kept;
whether a defect reached production and how long the hotfix took. A
number that has no previous is shown alone; a number nobody measured
is `null` and the line says "not measured", never a guess.

## The sweep

Per repo of the demand, in this order, each line traced:

| Check | Command (read-only first) | If not clean |
|---|---|---|
| PRs | `gh pr list --state all --search "<workstream>"` → every PR of the demand `MERGED` or `CLOSED` | an open PR is closed with a comment naming the closure, or re-homed as a pendency with an owner |
| Branches on the origin | `git ls-remote --heads origin` → no `feat/<workstream>`, `feat/<workstream>/…`, `fix/<workstream>/…`, `hotfix/…` of this demand | `git push origin --delete <branch>` per branch; the content lives on `main` and in the tags |
| Branches locally | `git branch --list`, `git worktree list` → only `main`, no stray worktree | `git branch -D`, `git worktree remove` |
| The clone | `git status` on `main`, `git pull --ff-only` | a dirty tree from another session is a pendency with the user as owner, never touched |
| Alpha | the repo's own check that alpha is at `main` (the rollout's read-only check for alpha) | `deploy:alpha` from `main` |
| Fixtures | the repo's own reseed command (named in its `docs/` or `smoke/`) so the next demand's smoke starts on a clean stage | run it; the output to the trace |

A command the harness refuses (a `git push --delete`, a reseed that
writes to the cloud) is not retried around: it goes to
`05-close/sweep.sh`, one command per line with the repo path, and
becomes a sweep line with status `delegated` and the user as the one
who runs it. He runs it before or at the stop; the session re-reads
the origin after "apply" and marks the line `done`, or leaves it as a
pendency with him as owner. The blueprint's final touch is the
session's: the Close tab built and the artifact republished at the
URL in `.state.md`.
