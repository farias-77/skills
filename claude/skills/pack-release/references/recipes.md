# Release: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).
The platform commands are **examples of one platform**: Google Cloud
Run for services and jobs, Firebase Hosting for the static front,
Terraform for infrastructure, GitHub for the repository, goose and
PostgreSQL for migrations. The project's doctrine names its own
platform; translate the step, keep the rule.

Placeholders: `$SERVICE`, `$JOB`, `$REGION`, `$SITE`, `$PROJECT_NUMBER`,
`$RELEASE_IMAGE`, `$PREVIOUS_REVISION`, `$PREVIOUS_JOB_IMAGE`, `$SHORT`
(short sha).

## Candidate before traffic (example: Cloud Run + Firebase Hosting)

```bash
# Cloud Run: not on a first deploy ("--no-traffic not supported when creating a new service")
gcloud run deploy "$SERVICE" --image "$RELEASE_IMAGE" --no-traffic --tag "rc-$SHORT" --region "$REGION"
curl -fsS "https://rc-$SHORT---$SERVICE-$PROJECT_NUMBER.$REGION.run.app/live"
gcloud run services update-traffic "$SERVICE" --to-tags "rc-$SHORT=10"      # only if traffic gives a signal
gcloud run services update-traffic "$SERVICE" --to-latest                    # promote; clears the sticky split
gcloud run services update-traffic "$SERVICE" --to-revisions "$PREVIOUS_REVISION=100"   # roll back
gcloud run jobs update "$JOB" --image "$PREVIOUS_JOB_IMAGE" --region "$REGION"   # jobs have no traffic

# Firebase Hosting: production build to a channel, smoke it, then promote the same bytes
firebase hosting:channel:deploy "rc-$SHORT" --expires 1d
npx playwright test smoke --config smoke.config.ts      # BASE_URL = the channel URL; fails on pageerror
firebase hosting:clone "$SITE:rc-$SHORT" "$SITE:live"
```

When the service is owned by Terraform, the candidate goes between the
`app` apply and the step that serves the release; the next
`terraform plan` must show no traffic or image change (inference).
There is no `firebase hosting:rollback`: roll back in the console's
release history, or `hosting:clone` a version id (the docs write
`SITE:@VERSION`, the CLI source parses `SITE@VERSION`; test on staging
first). Preview channel URLs are public.

## Per-revision bake reads (example: Cloud Monitoring)

Read `run.googleapis.com/request_count` grouped by
`response_code_class`, and `run.googleapis.com/request_latencies`, both
filtered on `resource.labels.revision_name`, for the new and the
previous revision over the same window. They are visible within ~2 min.

## Plan gate (Terraform)

```bash
terraform -chdir="$ROOT" plan -out=tfplan -input=false
terraform -chdir="$ROOT" show -no-color tfplan > plan.txt        # goes in the PR
terraform -chdir="$ROOT" show -json tfplan \
  | jq -e '[.resource_changes[] | select(.change.actions | index("delete"))] | length == 0'
# tfplan itself holds state and variables: it never leaves the machine
```

Narrow the `jq` filter to the stateful resource types (databases,
buckets, secrets) when a release legitimately replaces stateless ones.
On Cloud SQL, set `settings.deletion_protection_enabled = true` (the
API-level protection) as well as Terraform's `deletion_protection`.

## Permission config (`.claude/settings.json` of the release session)

Example for GitHub + Terraform + gcloud + Firebase; swap the cloud CLI
lines for the project's platform. `staging` stands for the project's
staging branch name.

```json
{
  "permissions": {
    "allow": [
      "Bash(gh pr create *)", "Bash(gh pr view *)", "Bash(gh pr checks *)", "Bash(gh pr merge *)",
      "Bash(gh run list *)", "Bash(gh run view *)", "Bash(gh run watch *)", "Bash(gh run rerun *)",
      "Bash(gh release create *)", "Bash(git push origin feat/*)", "Bash(git push origin hotfix/*)",
      "Bash(terraform -chdir=* init *)", "Bash(terraform -chdir=* plan *)", "Bash(terraform -chdir=* show *)",
      "Bash(gcloud run services describe *)", "Bash(gcloud run revisions describe *)",
      "Bash(gcloud run jobs describe *)", "Bash(gcloud run jobs executions list *)",
      "Bash(gcloud logging read *)", "Bash(gcloud secrets versions list *)", "Bash(gcloud scheduler jobs describe *)"
    ],
    "deny": [
      "Bash(terraform apply*)", "Bash(terraform * apply*)", "Bash(terraform destroy*)", "Bash(terraform * destroy*)",
      "Bash(terraform * state *)", "Bash(terraform * import *)", "Bash(terraform * force-unlock*)",
      "Bash(gcloud secrets versions add *)", "Bash(gcloud secrets versions access *)",
      "Bash(gcloud secrets versions destroy *)", "Bash(gcloud * delete *)",
      "Bash(gcloud * add-iam-policy-binding *)", "Bash(gcloud * set-iam-policy *)",
      "Bash(git push --force*)", "Bash(git push -f*)", "Bash(git push * --force*)", "Bash(git push --delete *)",
      "Bash(git push * main*)", "Bash(git push * staging*)", "Bash(git tag -d *)",
      "Bash(gh pr review *)", "Bash(gh pr merge * --admin*)", "Bash(gh secret *)", "Bash(gh variable *)",
      "Bash(gh release delete *)", "Bash(firebase deploy*)", "Bash(firebase hosting:disable*)"
    ]
  },
  "hooks": {
    "PreToolUse": [{ "matcher": "Bash", "hooks": [{
      "type": "command", "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/release-guard.sh", "timeout": 30
    }]}]
  }
}
```

Why the guard exists next to the rules:
- Rules resolve before the auto-mode classifier, so allowing
  `gh pr merge *` skips its "merging a pull request no human has
  approved" block; the guard restores it.
- A hook "allow" never overrides deny or ask rules; exit 2 blocks before
  rules, in every mode. Hook prompts still show in auto mode.
- `.claude/` is a protected path, and hooks load from the working
  directory's `.claude/` only, so start the session there.

## The PreToolUse guard (`.claude/hooks/release-guard.sh`)

```bash
#!/usr/bin/env bash
# Denies irreversible commands; asks before anything that reaches production. Fails closed.
set -euo pipefail
trap 'echo "release-guard: internal error, denying" >&2; exit 2' ERR
STAGING="${RELEASE_STAGING_BRANCH:-staging}"; PROD="${RELEASE_PROD_BRANCH:-main}"
cmd="$(jq -r '.tool_input.command // empty')"
deny() { echo "release-guard: $1" >&2; exit 2; }
ask()  { jq -n --arg r "$1" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"ask",permissionDecisionReason:$r}}'; exit 0; }
# Whole-string regexes also catch /usr/bin/terraform, bash -c '…', git -C . push — forms the rules miss.
grep -Eq 'terraform[^|;&]*\b(apply|destroy|import|force-unlock|state (rm|mv|push))\b' <<<"$cmd" && deny "infrastructure writes run in CI only"
grep -Eq 'secrets versions (add|access|destroy|disable)' <<<"$cmd" && deny "secret values are the user's: send the ! command"
grep -Eq "git[^|;&]* push[^|;&]*(--force|-f\b|--delete|:refs/|\b($PROD|$STAGING)\b)" <<<"$cmd" && deny "no direct or forced push to $PROD/$STAGING"
grep -Eq 'gh api[^|;&]*(/merge|/rulesets|/environments|/protection)' <<<"$cmd" && deny "merges and protections go through gh pr merge or the user"
if grep -Eq 'gh pr merge' <<<"$cmd"; then
  pr="$(grep -Eo 'gh pr merge +[0-9]+' <<<"$cmd" | grep -Eo '[0-9]+$' || true)"
  [ -n "$pr" ] || deny "name the PR number"
  grep -Eq -- '--(squash|rebase|admin)' <<<"$cmd" && deny "merge commit only, never --admin"
  out="$(gh pr view "$pr" --json baseRefName,headRefOid -q '.baseRefName+" "+.headRefOid')"
  read -r base sha <<<"$out"; [ -n "$base" ] || deny "cannot resolve PR #$pr"
  # The user's go for this exact head, set when he launched the session (inference: the agent's shell cannot change it).
  [ "$base" != "$PROD" ] || [ "${RELEASE_GO_SHA:-}" = "$sha" ] || ask "PR #$pr into $PROD deploys production (head $sha). Go?"
fi
# Platform examples: production writes outside the workflow (adapt the CLI and the prod naming).
grep -Eq 'gcloud[^|;&]* (deploy|update|update-traffic|execute|pause|resume|create)\b[^|;&]*prod' <<<"$cmd" && ask "Writes to production outside the deploy workflow."
grep -Eq 'firebase[^|;&]*hosting:clone[^|;&]*:live' <<<"$cmd" && ask "Changes the live site."
grep -Eq 'gh (workflow run|run rerun)[^|;&]*prod' <<<"$cmd" && ask "Re-runs a production deploy."
exit 0
```

`gh run rerun <id>` names an id, not a workflow. Where production
reruns must ask, resolve the id with
`gh run view <id> --json workflowName` (inference). The boundary that
holds is outside the session: the agent's cloud CLI impersonates a
read-only service account (for example `run.viewer`, `logging.viewer`,
`monitoring.viewer`, no `secretAccessor`), never a human admin login
(inference).

## Expand/contract (example: goose + PostgreSQL 18)

```
R1  binary that tolerates the new shape + expand migration   (a feature-free release)
R2  features use the new shape; backfill in batches
R3  code stops touching the old shape → the next release drops it, with its own go
```

```sql
-- +goose NO TRANSACTION
-- +goose Up
SET lock_timeout = '1s';          -- fail fast and retry; never queue reads behind DDL
SET statement_timeout = '30min';  -- sized to the slowest statement in this file
CREATE INDEX CONCURRENTLY IF NOT EXISTS t_x_idx ON t (x);
```

Add `CHECK (c IS NOT NULL) NOT VALID` in one migration and
`VALIDATE CONSTRAINT` in the next; validation takes only
`SHARE UPDATE EXCLUSIVE`. PostgreSQL 18 also accepts NOT NULL
constraints as `NOT VALID`.

## Flags and switches

- **Release toggle:** a config value flipped by its own PR (for example
  a `*_enabled` variable in the production IaC variables): a merge to
  `main`, so its own go. The auto-mode classifier blocks production flag
  toggles by default.
- **Off is the old behavior;** test both states; the adding PR carries
  the removal task; release toggles live a week or two.
- **Ops kill switches** (an email sink, a paused scheduler) flip without
  a deploy: the workflow flips them on a red; outside the run the agent
  asks, command ready.
