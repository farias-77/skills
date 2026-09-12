# Rollback — `<repo>` · `<vX.Y.Z | none>` → `<the version shipping>`

<!--
  Written by the SESSION before any tag, one file per repo under
  04-release/rollback/. Documented, not rehearsed: when a train step
  goes red the session executes this page, then verifies it with the
  same checks, then builds the fix. A way back that is not code-only
  is a STOP the plan named before the goal — the session does not
  deploy that repo; it calls the user.
-->

## The way back

- **Return to:** `<the previous tag>` — the last version proven in prod | **absence** — this demand created the stacks; the way back is the schedule off and the service stacks destroyed, the data stacks kept (`RETAIN`)
- **Commands:** <exactly, in order: `git checkout <tag>` + `npm run deploy:prod -- <stacks>`, or the hosting's redeploy of the previous build, or `aws scheduler update-schedule --state DISABLED` then `cdk destroy <stack>`>
- **Stacks touched by the way back:** <names> · not touched: <names, why>

## Data

- **What this release changed about stored data:** <tables, indexes, buckets, lifecycle rules, schemas — one line each, with the expand → migrate → contract step it is at>
- **Code rollback is safe against it:** **yes** — <why: additive fields, readers tolerate both shapes> | **NO** — <the contracted field or migrated shape; this is a stop, written in plan.md §where the session stops>

## Verifying the way back

- <the rollout's checks for this repo, run against the restored version: health, the version stamp, the key read-only flow — the commands and the expected values>
