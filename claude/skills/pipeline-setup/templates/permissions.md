# Permissions — notes on `settings.json` and the guard

`settings.json` (beside this file) is the project's
`.claude/settings.json` for a pipeline run. Its PreToolUse hook is the
pipeline's own guard, `claude/hooks/guard-irreversible.sh`, copied to the
project's `.claude/hooks/`; `claude/hooks/tests/guard-irreversible.test.sh`
checks it. There is one guard: setup installs it, release relies on it.
JSON has no comments, so each rule's reason is here.

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
lines: the merge is the deploy, and the guard already holds the merge.

## The three lists

**allow** — what the stages run all day without a prompt: the gate and
its parts, the stack, read-only `git` and `gh`, commits and pushes of
feature branches, opening pull requests, the staging deploy, and, for the
autonomous release, the merge into `main` and the production deploy and
migration. The merge is allowed because the guard checks it: it asks
whenever the head is not the one the user's play authorized. Keep each
rule as narrow as the command: `Bash(make ci)`, never `Bash(make *)`.
A broad allow rule (`Bash(gh *)`, `Bash(terraform *)`, `Bash(gcloud *)`)
covers an irreversible command too.

**ask** — what still stops for the user's click: re-running a deploy
workflow, a release, writing a secret, `terraform apply`.

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

`guard-irreversible.sh` reads the whole tool call (stdin JSON) for Bash
and for every file tool, so `bash -c`, a full binary path or a chained
command is caught too. It decides one of three things:

- **deny** — destroying infrastructure; deleting data, databases or
  buckets; force-push, pushing a deletion, a mirror or `--all`; pushing
  straight to a protected branch; merges that bypass protection
  (`--admin`, the merge API); forging a commit status; any agent write
  to the guard, its allow file or the settings;
- **ask** — writing or reading a secret's value; a merge into a
  protected branch whose head the play did not authorize, or that the
  guard cannot resolve;
- **nothing** — the settings' rules decide.

It fails closed: input it cannot read blocks. A hook's decision holds in
every permission mode, before the rules. `--self-test` runs a few
samples; the test file runs every case.

- **Project rules.** Add the project's own irreversible commands under
  `PROJECT RULES` in the copy (a production database name, a wipe
  script) and a case for each in the copied test; run the test.
- **The allow file.** `.claude/hooks/irreversible.allow`, written by the
  user himself (a `!` command), never by an agent. One entry per line:
  a command verbatim (that exact string passes, for an irreversible
  step the release plan names); `merge-from <sha>` (a merge whose head
  is that sha or descends from it: the play's line, which covers the
  release's own fixes); `merge-head <sha>` (exactly that head);
  `protected <branch>` and `default-branch <branch>` (`main`, `master`,
  `production` and `prod` always are). The release stage's
  `references/permissions.md` says how the play writes it and how the
  close removes the workstream's lines.
- **False positives.** A commit message that mentions "drop table"
  is denied too; the agent rewords it. A project whose doctrine runs
  down-migrations on the local stack narrows that line to its
  production target.

## Two postures for release

| Posture | `gh pr merge`, prod deploy | Safe because |
|---|---|---|
| **autonomous** (the template's default, role 18) | **allow** | branch protection requires the `local-ci` signoff, so `main` takes only a head the whole gate passed; the guard asks on any head the play did not authorize and denies the irreversible |
| **supervised** | moved back to **ask** | the user clicks each one |

The autonomous posture holds only once the signoff is required on
`main` (see the header of `local-ci.sh`). Until he sets that
protection, setup moves the three rules back to **ask** and says why.

## The limits that sit outside the session

The settings and the hook guard the session. The real boundary is
outside it, and setup lists it for the user:

- branch protection or a ruleset on `main`: pull requests only, the
  signoff required, no force-push, no deletion;
- the cloud identity the agent uses can deploy and read, not delete
  data or change IAM;
- secrets are written by the user (a `!` command), never read by an
  agent.
