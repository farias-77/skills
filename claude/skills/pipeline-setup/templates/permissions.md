# Permissions — notes on `settings.json` and the guard

`settings.json` (beside this file) is the project's
`.claude/settings.json` for a pipeline run; `guard-irreversible.sh` is its
PreToolUse hook, and `guard-irreversible.test.sh` checks the hook. JSON
has no comments, so each rule's reason is here.

## Replace the placeholders

The `make …` targets and `./scripts/local-ci.sh` are placeholders for the
commands the doctrine names. Replace each with the project's own:

| Placeholder | Role (`docs/project-contract.md`) |
|---|---|
| `make ci` | the gate (3) |
| `make check`, `make test`, `make test-affected` | fast check, focused tests, affected tests (4) |
| `make structure-check` | the structure check (7) |
| `make evidence` | the evidence command (6) |
| `make stack-up`, `make stack-env`, `make stack-down`, `make migrate-local` | the stack per worktree (5) |
| `./scripts/local-ci.sh` | the local-CI signoff (13) |
| `make deploy-staging`, `make deploy-prod`, `make migrate-prod`, `make migrate-down` | release roles (11) |

A project whose deploys run only in hosted CI on a merge drops the deploy
lines: the merge is the deploy, and it is already under **ask**.

## The three lists

**allow** — what the stages run all day without a prompt: the gate and
its parts, the stack, read-only `git` and `gh`, commits and pushes of
feature branches, opening pull requests, the staging deploy. Keep each
rule as narrow as the command: `Bash(make ci)`, never `Bash(make *)`.
A broad allow rule (`Bash(gh *)`, `Bash(terraform *)`, `Bash(gcloud *)`)
covers an irreversible command too.

**ask** — what reaches `main` or production: `gh pr merge`, the
production deploy and migration, re-running a deploy workflow, a
release, writing a secret, `terraform apply`. In the supervised
posture these stop for the user's click.

**deny** — what no stage runs: force-push, deleting a remote branch,
pushing to `main`, `--admin` merges, deleting a repo or a release,
`terraform destroy` and state surgery, deleting a bucket, dropping a
database, migrating down; reading `.env` and secrets; editing the
settings and the hooks; posting a commit status directly
(`gh api *statuses*`), so the only signoff is the one `local-ci.sh`
posts after it ran the gate.

Rules match the start of the command and its wildcards; they are not a
security boundary on their own: one reordered flag or a `bash -c`
escapes a prefix. That is why the hook exists.

## The guard hook

`guard-irreversible.sh` reads the whole command (stdin JSON,
`.tool_input.command`) and denies the irreversible classes wherever they
sit in the string: force-push and history rewrites, protection bypass,
infrastructure destroy, cloud deletes of data, Kubernetes namespace and
storage deletes, SQL `DROP` / `TRUNCATE` / `DELETE` or `UPDATE` without
`WHERE`, migration resets and downs, `rm -rf` of the root, home, parent
or whole working directory, device wipes.

A hook's deny holds in every permission mode, before the rules.

- **Project rules.** Add the project's own irreversible commands at the
  bottom of the script (a production database name, a wipe script) and
  a line for each in `guard-irreversible.test.sh`; run the test.
- **The approved exception.** When a release plan names an irreversible
  step (a contract migration that drops a column after its expand
  shipped), the user adds that exact command, one line, to
  `.claude/hooks/irreversible.allow` at the pre-flight. The hook lets
  that exact string through and nothing else. Agents cannot write the
  file: the settings deny `Edit` and `Write` on `.claude/hooks/**`.
- **False positives.** A commit message that mentions "drop table"
  is denied too; the agent rewords it. A project whose doctrine runs
  down-migrations on the local stack narrows that line to its
  production target.

## Two postures for release

| Posture | `gh pr merge`, prod deploy | Safe because |
|---|---|---|
| **supervised** (the template's default) | **ask** | the user clicks each one |
| **autonomous** (role 18) | moved to **allow** | branch protection requires the `local-ci` signoff, so `main` takes only a head the gate passed; the hook denies the irreversible; the user's play names the head |

Move to autonomous only once the signoff is required on `main` (see the
header of `local-ci.sh`) and the release plan's rollback is written.

## The limits that sit outside the session

The settings and the hook guard the session. The real boundary is
outside it, and setup lists it for the user:

- branch protection or a ruleset on `main`: pull requests only, the
  signoff required, no force-push, no deletion;
- the cloud identity the agent uses can deploy and read, not delete
  data or change IAM;
- secrets are written by the user (a `!` command), never read by an
  agent.
