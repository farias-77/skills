# local-ci

The local-CI signoff of the pipeline's bar (`docs/project-contract.md`,
role 13): runs a gate command in a clean worktree at one commit and,
with `--post`, signs that commit off on GitHub so `main` accepts it.
Copy `local-ci.sh` next to this file into the project (for example
`tools/local-ci/`), keep this file beside it as its documentation (the
script carries no comments), and name the command in the doctrine.

```
local-ci.sh [--post] [--context NAME] [REF]     REF defaults to HEAD
```

## What it does

1. Resolves REF to a sha and checks it out detached in a fresh
   worktree: uncommitted changes in your tree never reach the gate.
2. With `SELECT_CMD` set (the affected context), runs it in the
   worktree; it prints the affected selection against `LOCAL_CI_BASE`.
   **An empty selection on a non-empty diff runs the whole gate**
   (`FULL_GATE_CMD`) instead of signing off a run that tested nothing:
   a change to the build files or the tooling often selects nothing.
3. A tree that already passed the same gate command (same
   `git rev-parse <sha>^{tree}`) is not run again: its record is reused
   and re-posted.
4. With `--post`: posts `pending`, runs the gate, logs to
   `$LOCAL_CI_DIR/<sha>.log`, posts `success` or `failure` on the sha
   through the commit status API (`gh api repos/:owner/:repo/statuses/<sha>`).
5. On exit, runs `STACK_DOWN_CMD` in the worktree (a gate that ends with
   the stack up leaves no orphan stack behind), then removes the
   worktree. Exits with the gate's code.

## Environment

| Variable | Default | What it is |
|---|---|---|
| `GATE_CMD` | `make ci` | the gate, run from the worktree root |
| `SELECT_CMD` | unset | the affected selector's dry run: prints what it would test, nothing when it selects nothing |
| `FULL_GATE_CMD` | `make ci` | the whole gate, run when the selection is empty on a non-empty diff |
| `LOCAL_CI_BASE` | `origin/main` | the base the selection and the diff are read against |
| `STACK_DOWN_CMD` | `make stack-down` | the project's stack-down role, run in the worktree on exit; set it empty when the gate brings no stack up |
| `LOCAL_CI_DIR` | `~/.cache/local-ci/<repo>-<hash>` | logs and passed records, keyed by `git rev-parse --git-common-dir`, so every worktree of one repository shares the cache |
| `SIGNOFF_CONTEXT` | `local-ci` | the status context; `--context` overrides |

Setup replaces each default with the project's own command.

## Two contexts

The execute queue posts `local-ci/affected` on each merge
(`--context local-ci/affected`, the affected gate as `GATE_CMD`, the
selector as `SELECT_CMD`); the whole gate at the end of the stage posts
`local-ci`. `main` requires `local-ci` only, so no intermediate head
satisfies it.

## What it costs

The whole gate is the slowest command the project has: a clean
checkout, every test, every build, the journeys, in one run. Expect
the time the hosted CI takes, or more on a machine already running
other stacks. Run the whole gate once, at the end, under `nice`; the
affected context is the one that runs per merge.

## Branch protection — what makes the signoff count

The status is only a claim until `main` requires it. Requiring it is
the user's step, and when the doctrine names another required check
(the hosted CI's aggregate job), it is a doctrine change first: the
doctrine lines that name the required check change in the same
decision. Then, with a classic protection rule (a ruleset works the
same):

```
gh api -X PUT repos/:owner/:repo/branches/main/protection --input - <<'JSON'
{"required_status_checks": {"strict": true, "contexts": ["local-ci"]},
 "enforce_admins": true, "required_pull_request_reviews": null,
 "restrictions": null}
JSON
```

That PUT replaces the whole protection of the branch: read the current
one first (`gh api repos/:owner/:repo/branches/main/protection`) and
merge.

Who can post the status decides how strong it is. Anyone with write
access can post a `success` on any sha. The strongest setup: run this
script on one host (the merge queue), post with a GitHub App's
installation token that no agent shell can read, and pin the required
check to that app (`"checks": [{"context": "local-ci", "app_id": <id>}]`).
The settings template denies `gh api *statuses*` to the agents, so the
only way they sign off is through this script, which runs the gate
first.

Hosted CI keeps the deploy and a cheap trust check (lint, generated
code unchanged); the full gate stops running there.

A remote that is not GitHub has no commit status API: the script runs
the gate without `--post`, and the signoff and its protection are
`n/a: non-GitHub remote` in the readiness file.
