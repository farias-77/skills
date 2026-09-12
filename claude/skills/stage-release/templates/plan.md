# Release plan — <workstream>

<!--
  Written by the SESSION before the goal, from the audit's Close, the
  design's rollout.md, the repos' CLAUDE.md and the origin re-read.
  The user reads this file and gives the goal on it; after the goal
  nothing in it waits for him. Every Run and Check is copied from
  rollout.md, never paraphrased. Timestamps from `date -u`.
-->

- **Written:** <YYYY-MM-DD HH:MM UTC>
- **Goal:** <his words, verbatim, with the hour> | not yet given

## What ships

| Repo | `feat/<workstream>` @ | Waves | Lane | Last tag on `main` |
|---|---|---|---|---|
| `<repo>` | `<sha>` (audit Close) | w01, w02 | A merge ≠ deploy \| B merge = deploy | `vX.Y.Z` \| none |

- **Residue he accepted at the audit:** <one line each, with what it touches in prod>
- **Stays with the user (placeholders in the code):** <one line each> | none

## Pre-flight — only he can do these, before the goal

| # | What | Why the session cannot | Status |
|---|---|---|---|
| 1 | <the vendor password changed> | <his account> | **done** <date> \| **delegated:** <how: the parameter name, the file, the CLI> |

## The train

| # | Repo | Lane | Run | Check (read-only) | If red |
|---|---|---|---|---|---|
| 1 | `<repo>` | A | `git checkout vX.Y.Z && npm run deploy:prod -- <stacks>` | `<command> → <expected value>` | `rollback/<repo>.md` §way back |
| n | `<front>` | B | merge PR #<n> → tag the merge sha → hosting build | `<url> 200 · version stamp` | redeploy the previous build |

Order from `01-design/rollout.md` §deploy order | producer-first (no rollout order).
Integration before the train: one PR per repo into `main` in this order; Lane B merges only at its step.
Confirmation from `main`: the whole suite only when the tree or the alpha diff changed (P-17); lint, build and unit tests always after a rebase.

## Versions

| Repo | Last tag | Bump (from the commits) | Expected | Rollback |
|---|---|---|---|---|
| `<repo>` | `vX.Y.Z` \| none | major \| minor \| patch | `vX.Y.Z` | `rollback/<repo>.md` · safe for data: yes \| **no: <why>** |

## The watch — proofs the audit deferred to prod

| # | What | Readable at (UTC) | Expects | Read by |
|---|---|---|---|---|
| 1 | <the first scheduled run ends Succeeded> | <YYYY-MM-DD HH:MM> | <`sync_success 1`, alarm OK> | `<command>` |
| 2 | <a cost line after a day> | > 48 h after the train | — | pendency with an owner: <who> |

## Where the session stops

- The third red on one step: the train stopped at that repo, prod rolled back and verified, the message names the step and the evidence.
- A rollback not safe for data: <repo, step, why> — the session stops **before** that deploy. | none
- A pre-flight line found missing at its step (after three attempts).
- Nothing else. No prod-go, no confirmation per step, no question after the goal.
