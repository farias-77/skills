# Operations · <project>

<!-- Read by design and release, and by every operator of production.
Seeded by the kit's `standards` skill; the project owns it and changes
it only by pull request. Rule ids are never changed and never reused. -->

How code reaches production, how it is watched, and what happens when
it breaks. Nothing reaches production by hand: every step here is a
workflow, a command or an alarm in the repo.

## Environments

| Environment | Where | Data | Deployed by |
|---|---|---|---|
| local | one stack per worktree, `<stack up command>` | seeded test actors | the developer or agent |
| staging | `<staging url>` | synthetic actors only | a push to `main` |
| production | `<production url>` | real users | a `v*` tag |

- **OPS-1** · Local, staging and production are the only environments; a new shared environment is a pull request to this file. *Why:* every extra environment is one more place that drifts.
- **OPS-2** · A local stack derives its ports, containers, network, volumes and database from its worktree, and labels each container, volume and image with the worktree and the workstream. *Why:* stacks run side by side, and a label is what lets one be removed without touching its neighbour.
- **OPS-3** · `<stack down command>` removes only its own worktree's stack, images included, and `<sweep command> workstream=<slug>` removes everything labelled with that workstream. *Why:* stacks left behind fill the disk and make the next run flaky.
- **OPS-4** · Local and staging run the same database engine and major version as production, with the same migrations. *Why:* a migration proved on another engine proves nothing.
- **OPS-5** · Staging holds no real person's data; its actors are created by `<staging-actor command> role=<role>` and carry no real name. *Why:* staging is driven by agents and recorded in videos.

Staging and production are alike by construction: ARC-13.

## Delivery

```
PR (local-ci green) ──► main ──push──► staging: build or reuse the image → deploy → smoke
                                            │ green
            git tag -a vX.Y.Z ──push──► production: the same image → smoke → 15-min watch
                                            → release notes (green) · rollback (red)
```

- **OPS-6** · `main` accepts pull requests only, requires the `local-ci` status, and refuses force-pushes and deletion. *Why:* every commit on `main` passed the whole gate.
- **OPS-7** · Only finished work merges into `main`; unfinished work stays on its branch. *Why:* any commit of `main` can be tagged and released.
- **OPS-8** · A push to `main` deploys staging and runs the smoke there. *Why:* every sha of `main` gets a green or red staging before anyone tags it.
- **OPS-9** · The image is keyed by the hash of what builds it, so a commit that does not change the build inputs reuses the image. *Why:* the deploy is fast and the image staging ran is the one production gets.
- **OPS-10** · Production deploys only from an annotated `v*` tag on a commit of `origin/main` whose staging is green, and it promotes that commit's image without rebuilding. *Why:* production runs exactly what staging proved.
- **OPS-11** · A production deploy waits until the previous tag's watch has ended. *Why:* two releases in one watch window cannot be told apart, and the rollback target is ambiguous.

The hosted CI keeps only the deploys and the environments; the gate
runs locally through the signoff command (`<signoff command>`).

## Release

- **OPS-12** · The smoke checks health and readiness, the sha served, the migrations applied, the read-only journeys, and a browser on each frontend's entry routes with zero page errors and a root that is not empty. *Why:* the features were proved before the merge; the smoke proves this environment serves them.
- **OPS-13** · For 15 minutes after a production deploy, the watch sends its own probes every minute and reads server errors of the new revision, restarts and out-of-memory, readiness, the entry routes and latency p95 against `<p95 threshold> ms`. *Why:* its own probes keep low traffic from reading as healthy.
- **OPS-14** · The CI creates the GitHub release from the tag's annotation only after a green watch; no person or agent creates one by hand. *Why:* the list of releases is the list of what has run in production.
- **OPS-15** · The tag's annotation is the release notes: what changed for users in plain words, then the migrations and flags the release carries. *Why:* the notes are written once, before the deploy, where the release reads them.

## Feature flags

- **OPS-16** · A flag exists only when a change has more than one audience at once (a cohort, a customer, a staged rollout); a change everyone gets together ships without one. *Why:* each flag doubles the paths to test and to reason about.
- **OPS-17** · Each flag has a row in `<flags file>` with its owner, its audiences and its end date. *Why:* a flag with no owner never ends.
- **OPS-18** · When the rollout ends, the flag and its losing path are deleted within the next two releases. *Why:* a dead branch in the code misleads every reader after.

## Migrations in production

How a migration file is written (timeouts, transactions, the linter)
lives in `engineering.md`; this section is the order across releases.

```
R1  code that tolerates the new shape + the expand migration
R2  the code uses the new shape; the backfill runs in batches
R3  the code stops reading the old shape → a later release contracts it
```

- **OPS-19** · A release only expands the schema (a new table, a nullable column, a column with a constant default, an index built concurrently, a new enum value, a constraint added `NOT VALID`). *Why:* the previous release's code must run on the new schema for a rollback to work.
- **OPS-20** · A contract (a drop, a rename, a type change, `NOT NULL` on a column the previous release reads) ships in a later release than the code that stopped using the old shape, and its release notes name it. *Why:* a contract is the only irreversible step, so it is taken alone and on purpose.
- **OPS-21** · A backfill runs as a batched, resumable, idempotent job, separate from the schema migration. *Why:* a long backfill inside a migration holds locks and cannot be resumed.
- **OPS-22** · No migration has a down step, and no rollback touches the schema. *Why:* a down migration on real data loses what was written since.
- **OPS-23** · Migrations are named by timestamp, and after `main` is merged into a branch, `<restamp command>` re-stamps that branch's migrations older than the base's newest. *Why:* two workstreams' migrations must apply in the order they reach `main`.
- **OPS-24** · A migration that touches an existing table records, before the merge, its real-data risk (duplicates for a unique index, nulls for `NOT NULL`, lock time on a large table, backfill duration) and the read-only count that checked it, with the date. *Why:* staging data does not show what production holds.
- **OPS-25** · A migration that fails in production is a stop: the old revision keeps serving, nobody re-runs it, and the error goes to `<owner>` with the log. *Why:* a re-run on a half-applied migration can make it worse.

## Rollback

- **OPS-26** · A red smoke or a red watch rolls production back by itself: traffic and job images to the previous tag's image, frontends rebuilt from that tag, then a smoke. *Why:* a rollback written in advance is not improvised at 3 a.m.
- **OPS-27** · A rollback moves code only: never the previous tag's infrastructure code, never a down migration. *Why:* the schema only expands (OPS-19), so the old code runs on it.
- **OPS-28** · After a production rollback, the next production deploy waits for an explicit go from `<owner>`. *Why:* the fix of a red release is the release most likely to be red again.

**The runbook.** Run `gh workflow run rollback.yml -f tag=<previous tag>`
→ follow it with `gh run watch` → check the sha served at
`<health url>` → tell `<incident channel>` → open the incident file
(OPS-37).

## Alarms and runbooks

Severities: **P1**, users cannot complete a main path or data is wrong;
**P2**, users are slowed or a background path is failing. An error logs
one line that an existing alarm catches; a new alarm is added only for a
main-path failure that has an action someone takes.

| Alarm | Event name | Threshold | Window | Severity | Channel | Runbook: action · first command |
|---|---|---|---|---|---|---|
| `<alarm>` | `<event_name>` | `<count or rate>` | `<n> min` | `<P1, P2>` | `<channel>` | `<what to do>` · `<command>` |

- **OPS-29** · Every alarm is declared at `<path>` with an event name, a threshold, a window, a severity, a channel and a runbook line, and has its row in the table above. *Why:* the watch reads alarms by name, and the person woken acts from the row.
- **OPS-30** · Every runbook line names the action and the first command to run; an alarm without an action is deleted. *Why:* an alarm with no action wakes someone for nothing.
- **OPS-31** · An alarm matches a stable event name, and a diff that renames an alarmed event changes the alarm in the same diff. *Why:* a renamed event silences its alarm without anyone noticing.
- **OPS-32** · P1 and P2 alarms both reach `<channel>` by e-mail. *Why:* one channel is read; two are each half-read.

## Backups and restore drills

- **OPS-33** · The production database has daily backups and point-in-time restore, kept `<n>` days. *Why:* a bad write is found days later, not minutes.
- **OPS-34** · Every quarter, a restore drill restores the latest backup into a scratch instance, checks `<row counts or a query>`, and records the date, the duration and the result in `<path>`. *Why:* a backup never restored is a hope, not a backup.

## Incidents

An incident is any P1, any rollback, and any data found wrong in
production.

- **OPS-35** · Within 15 minutes of an incident starting, `<owner>` is told in `<incident channel>`: what is broken, for whom, since when. *Why:* the first message sets who acts.
- **OPS-36** · The person or agent acting keeps a timeline as it happens, in UTC: what was seen, what was done, by whom. *Why:* memory rewrites the order of events within a day.
- **OPS-37** · Within two working days, `<incidents path>/YYYY-MM-DD-<slug>.md` holds the post-incident note: impact, cause, how it was detected, the timeline, and each follow-up as a demand or a proposed rule. *Why:* an incident with no follow-up happens again.

## Access to production

- **OPS-38** · Production changes only through the tag workflow and the IaC applied by the CI (ARC-10); no person or agent deploys or runs a migration by hand. *Why:* every change to production is then a reviewed commit.
- **OPS-39** · The agents' cloud identity reads production's logs, metrics and deploy state, holds no database role, and can create synthetic actors in staging only. *Why:* an agent that can only read cannot destroy what the permissions missed.
- **OPS-40** · The agents' GitHub identity can push branches, open and merge pull requests and run workflows, and cannot approve a pull request, change branch protection or delete a repository; its token's expiry date is in `<path>`. *Why:* `CODEOWNERS` only bites when the author is someone else.
- **OPS-41** · People read production data through `<read-only role>`; a write outside the deploy path uses `<break-glass procedure>`, is time-boxed, and is recorded in `<incidents path>`. *Why:* a hand-written fix to data is a change nobody reviewed.
