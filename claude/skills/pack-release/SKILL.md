---
name: pack-release
description: Autonomous, responsible releases; read it before writing a release plan, before any merge that deploys staging or production, and when configuring the release session's permissions and guard hook.
user-invocable: false
---

# Pack: autonomous, responsible releases

## When this pack applies

An agent can merge into the staging branch and into `main`, and the
project's own CI workflows deploy each environment.
Read this pack before writing a release plan, before any merge that
deploys, and when configuring the release session's permissions.

Precedence: the user's words, then the project's doctrine (its
delivery standard and deploy workflows), then this pack. The doctrine
decides the environments and branch names, the deploy order, which
identity writes to production, the CI's automatic rollback, the watch
length and the platform. The commands in the references are examples
of one platform, never the rule.

## Principles

1. **The agent merges; the CI deploys.** Production's deploy identity
   trusts only `main`, so the agent reaches production by a merge,
   never by a credential.
2. **Build once, promote that artifact.** Production takes the image
   staging built for the same tree; a rebuild needs a new go from the
   user.
3. **Roll back first, investigate second.** Rollbacks are normal;
   stopping the bleeding is the first priority.
4. **Reversible is automatic; irreversible is the human's.** Moving
   traffic, restoring an image or pausing a scheduler returns to a
   state he approved. A dropped column, a revoked secret or a real
   email does not.
5. **Expand in the release, contract in a later one.** Then a rollback
   is only moving traffic.
6. **The secret's value exists before its consumer.** A mounted secret
   with no version breaks a first deploy as a platform refusal.
7. **Green means proven on the real environment.** A green HTTP suite
   can sit in front of a front end that renders a blank screen.
8. **Ask for everything only he can run, once, up front.** Finding them
   one blocked step at a time costs hours.
9. **Guards are mechanical.** Command-pattern rules are not a security
   boundary; cloud IAM and branch rulesets hold the line, deny rules
   and a hook are the floor.
10. **Confirm a step by reading its result, never by its exit code.**

## The checklist

**Plan and pre-flight**
- [ ] One message and one push notification carry every action reserved
      for the user as a ready `!` command: infrastructure bootstrap
      apply, secret value write, credential or personal-data read,
      production deploy dispatch, DNS/TLS, IAM. None is marked
      "delegable".
- [ ] Each pre-flight item is read back before the staging merge (an
      access token prints, the bootstrap resources exist, the user's code-owner
      approval is in).
- [ ] Every secret the release mounts or reads has an ENABLED version in
      that environment before the merge that creates its consumer.
- [ ] Production env-var secrets pin a version number (they resolve at
      instance startup); a rotation is its own release; versions are
      disabled before they are destroyed.
- [ ] Each production infrastructure root has a read-only saved plan
      from the release PR's tree; the PR carries the human-readable
      plan text and the counts; the binary plan, which holds state and
      variables, never leaves the machine.
- [ ] The plan JSON has no `"delete"` in a stateful resource's
      `change.actions`; `prevent_destroy` misses a removed configuration.
- [ ] The managed database has provider-level deletion protection, not
      only the IaC tool's flag, which protects only against deletion
      through that tool.
- [ ] A first deploy into an empty environment names its known reds and
      their rule (e.g. an alert policy that 404s on a log metric created
      in the same apply: rerun after ~10 min).
- [ ] The rollback is written per artifact (service revision, job image,
      static-site release) with "safe for data: yes/no" and why.
- [ ] Each rollback path has run once on staging before production
      relies on it.
- [ ] The database login path the release uses has run on staging
      (a managed connector or socket may not perform IAM login by
      itself).

**Migrations**
- [ ] Every migration only expands: new table, nullable column or
      constant default, `CREATE INDEX CONCURRENTLY`, `NOT VALID` then
      `VALIDATE` in a later transaction.
- [ ] No `DROP`, `RENAME`, type change or `NOT NULL` on anything the
      previous release reads (Squawk `ban-drop-column`,
      `renaming-column`, `changing-column-type`, `adding-required-field`).
- [ ] Each migration passes Squawk's `require-lock-timeout` and
      `require-statement-timeout`.
- [ ] A migration with `CONCURRENTLY` opts out of the migration tool's
      per-file transaction (goose: `-- +goose NO TRANSACTION`).
- [ ] The previous revision keeps serving through the migrate step and
      works after it (the deploy applies the app with the old image
      first).
- [ ] A contract ships at least one release after no deployed code reads
      the old shape, with its own go.

**Deploy**
- [ ] The required check is green on the release PR's head sha; merged
      as a merge commit.
- [ ] The required aggregator check fails, never skips, when a needed
      job fails ("skipped" counts as success).
- [ ] Deploy concurrency has `cancel-in-progress: false`; nothing
      cancels a running migration.
- [ ] Production deploys the digest staging proved; the previous
      revision and job image are recorded before serving.
- [ ] The candidate is smoked on its tag URL, and the front on a preview
      channel, before taking traffic.
- [ ] After a split or a rollback the next release sends traffic to the
      latest revision explicitly, or every later deploy keeps the split.

**Post-deploy verification**
- [ ] Read-only smoke: the liveness endpoint returns 200; the release
      revision serves 100%; the image is the release digest; jobs run
      the release image; scheduler state matches the declared config.
- [ ] Browser smoke of every front: entry routes load, zero
      `pageerror`, non-empty root.
- [ ] After the CI's green, the session runs one read-only check of its
      own.
- [ ] The 15-minute watch compares the new revision with the previous
      one in the same window, never before against after.
- [ ] Alarm state is written as read: "no datapoints" is not "healthy".
- [ ] Tags and releases go on the merge sha after green; a published tag
      is never rewritten.

**Permissions**
- [ ] Deny rules cover every irreversible class (below); no allow rule
      covers one (no `Bash(gh *)`, `Bash(<cloud-cli> *)`,
      `Bash(terraform *)`).
- [ ] A PreToolUse guard asks before a merge into `main` or a
      production write outside the workflow, and fails closed.
- [ ] The agent's own cloud identity is read-only; writes go only
      through CI identities.
- [ ] No token, password or key appears in a rule, prompt, trace or PR
      body.

## Anti-patterns

- **Finding the user's actions by being blocked.** Apply, deploy dispatch,
  credential read, secret write, discovered one at a time.
- **The secret written after the deploy.** The platform refuses the job
  ("version latest not found") instead of a suite failing with a reason.
- **A green HTTP suite as proof of a front.** A local stack injected a
  build-time variable the real build lacked, so hundreds of green
  journeys never saw the blank screen.
- **Fixing a test suite through PR, CI and deploy** when the
  workstation can run it against staging far faster.
- **Waiting out an alarm's first evaluation** on an environment with no
  traffic.
- **Canary theater.** 5% of a trickle of requests: a handful of
  requests gives no signal.
- **Down migrations as the production rollback.** Roll back the code;
  keep the expanded schema.
- **Argument-constraining allow rules** (`Bash(gh pr merge * --base
  staging)`): one reordered flag escapes them.
- **Two owners of the traffic split.** The IaC tool and a manual
  rollback undo each other unless the workflow resets the split
  (inference).
- **Flag sprawl.** Toggles never removed, On meaning the old behavior,
  one state tested.
- **Allow lists grown by "don't ask again":** one-off commands and,
  eventually, a pasted bearer token.
- **Overbuilding.** A managed progressive-delivery product, a rollout
  controller or a flag SaaS for one service and one operator
  (inference).

## Core recipes

**The release procedure, with go/no-go**

| # | Step | GO when | NO-GO → |
|---|---|---|---|
| 0 | Plan; one message with the user's actions | every pre-flight item read back | park before the staging merge, one line |
| 1 | Production diff: saved plan, JSON gate | no deletes on stateful resources; counts as expected | stop, ask (data) |
| 2 | PR feature → staging, merge | required check green on the head sha | fix entry `R.n` |
| 3 | Follow the staging deploy | run green | environment red → one rerun or park; code red → the one fix `R.n`; a second red → stop and report |
| 4 | Smoke on staging: health, the sha, the read-only journeys | green | as in 3 |
| 5 | Release PR staging → `main`, ask for the go | the user's go, or the goal quoted verbatim | stop |
| 6 | Merge (merge commit) | required check green on the head sha | — |
| 7 | Follow the production deploy: data → app (old image serving) → migrate → candidate at 0% → tag smoke → 100% → smoke → front via preview channel | each step green | automatic rollback |
| 8 | Watch 15 min, per-revision reads, the alarms the release touches | rollback thresholds hold | roll back; the one fix `R.n` through staging; ask before the new production deploy; a second red → stop and report |
| 9 | Tags and releases on the merge sha | — | — |
| 10 | The later proofs that have their own hour | read and traced | hotfix |

**Rollback triggers**

| Trigger | Threshold | Action | Who |
|---|---|---|---|
| Any step after serve fails | non-zero | traffic → previous revision; job → previous image | CI |
| Candidate smoke on the tag URL | non-2xx or digest mismatch | never promote | CI |
| Front smoke on the channel | `pageerror` or empty root | never promote to live | CI |
| 5xx ratio, new vs previous revision, same window | > 2× previous and > 1%, with ≥ 100 requests on new (inference) | roll back | the watch |
| p95 latency, same window | > 1.5× previous over the watch (inference) | roll back | same |
| Start failures, memory kills | instance could not start; OOM in logs | roll back | same |
| Job execution on the new image | `failed` | previous image | agent asks |
| Migrate fails | any | old revision keeps serving; no schema rollback; stop | human |
| Contract ran, or real side effects sent | — | roll forward through `R.n` | human |
| Fewer than 100 requests in the watch | — | verdict "no signal", not "healthy"; rely on the smoke | — |

Read request count by response class and latency per revision, exclude
4xx, and also check an absolute SLO; alert policies and log-based
metrics lag well behind the platform's own metrics.

**Expand/contract.** R1 ships a binary that tolerates the new shape
plus the expand migration (a feature-free release); R2 uses the new
shape and backfills in batches; R3 stops touching the old shape, and
the release after drops it with its own go. Every migration sets a
short `lock_timeout` (fail fast and retry) and a `statement_timeout`
sized to its slowest statement.

**Flags and switches.** A release toggle is a config value flipped by
its own PR (its own go); Off is the old behavior; test both states; the
adding PR carries the removal task. Ops kill switches (an email sink, a
paused scheduler) flip without a deploy; outside the run the agent
asks, command ready.

**The permission pattern.** Allow the read-only and the reversible:
PR create, view, checks and merge; run list, view, watch and rerun;
release create; pushes to feature and hotfix branches; IaC init, plan
and show; read-only cloud describes and logs. Deny every irreversible
class: IaC apply, destroy, state, import, force-unlock; secret version
add, access, destroy; cloud deletes and IAM writes; force, deleting or
direct pushes to `main` or staging; tag deletes; PR reviews and admin
merges; repository secrets and variables; direct static-site deploys.
Allowing `gh pr merge *` skips the auto-mode classifier's "merging a PR
no human approved" block, so a guard hook restores it; a hook "allow"
never overrides a deny, and exit 2 blocks in every mode.

**The guard hook** (PreToolUse on Bash) matches the whole command
string, so `bash -c '…'`, absolute paths and `git -C . push` cannot slip
past, and fails closed on any internal error. It **denies** IaC writes,
secret value writes and reads, forced or direct pushes to `main` or
staging, `gh api` calls on merges, rulesets or protections, and a
`gh pr merge` with no PR number or with `--squash`, `--rebase` or
`--admin`. It **asks** before a merge into `main` unless the PR's head
sha equals the go sha the user set when he launched the session (an
environment variable the agent cannot change, inference), and before
any production deploy, traffic move, job run, scheduler change, live
promotion or production rerun outside the workflow. The boundary that
holds stays outside the session: the agent's cloud CLI runs as a
read-only identity, with no secret accessor.

**When the agent stops and asks** (what cannot be undone, and a new
production deploy after a rollback): a
production merge without the user's word; a deletion or replacement on
a stateful resource in the plan; a contract migration, or a rollback
not safe for data; a secret, IAM, DNS or TLS write; a new production
deploy after a production rollback; anything the go or the goal did
not name. **When it stops and reports:** a failed
migration; a second red after the one fix.

The settings file, the guard script, the platform example commands and
the migration SQL are in [references/recipes.md](references/recipes.md);
tools and the guard's test in [references/tooling.md](references/tooling.md);
sources in [references/sources.md](references/sources.md).
