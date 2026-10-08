# Permissions — notes on `settings.json`, the guard and the authorization

`settings.json` (beside this file) is the `.claude/settings.json` for a
pipeline run (role 14 of `docs/project-contract.md`). JSON has no
comments, so each rule's reason is here.

## Where they go: every directory a session opens in

Claude Code loads `.claude/settings.json`, and the hooks it registers,
from the directory the session opens in, not from the repository a
command later touches.

| Layout | Install the settings, the guard and `authorize.sh` in |
|---|---|
| one repository | that repository |
| two roots: `CLAUDE.md`, the standards and `.claude/skills/` in a root, the product in a child repository | the root, and the product repository too when sessions open there (a cloud entry always does) |

Each session root also needs the README's install, out of git: the
`skills`, `agents` and `workflows` symlinks in `.claude/` and
`.claude/settings.local.json`, listed in
`.git/info/exclude`. The audit reports them missing; Step 3 never
commits them.

At the root, a command into the product names it (`git -C <product> …`,
`make -C <product> …`); the allow rules carry that form. Each copy is
committed in its own repository, on that repository's setup branch.

## What to copy

| From the pipeline | To | Why |
|---|---|---|
| `claude/hooks/guard-irreversible.sh` | `.claude/hooks/`, `chmod +x` | the guard |
| `claude/hooks/authorize.sh` | `.claude/hooks/`, `chmod +x` | the user's authorization lines; the guard denies it to agents |
| `claude/hooks/tests/guard-irreversible.test.sh` | `.claude/hooks/tests/` | proves the copy, with the project's own rules added as cases |
| `claude/hooks/remind-scout.sh` | `.claude/hooks/`, `chmod +x` | the PostToolUse reminder: after 4 reads in a row, the main session is told to send the scout; never blocks, behind a fail-open wrapper |
| `claude/hooks/tests/remind-scout.test.sh` | `.claude/hooks/tests/` | proves the reminder's copy |

All of them keep their header comments. A standards rule against code
comments, or a linter that enforces one, excludes `.claude/hooks/`, in
the same commit.

## Replace the placeholders

The `make …` targets and `tooling/local-ci` stand for the commands the
project's commands table names:

| Placeholder | Role |
|---|---|
| `make check` | the fast check (3) |
| `make test-affected` | the entry gate (4) |
| `make verify` | the whole gate (5) |
| `tooling/local-ci` | the signoff command (6); `claude/scripts/local-ci.sh` when the project has none |
| `make floor` | the floor (7) |
| `make up`, `make env`, `make down`, `make sweep` | the stack per worktree and the sweep (8) |
| `make qa-seed`, `make db-query` | the test actors, and a read-only query on the stack's database (8) |
| `make test-backend`, `make test-journey` | one server package, one browser spec (4) |
| `make restamp` | migrations (9) |
| `make staging-actor` | the staging actors (13) |
| `rollback.yml` | the rollback workflow (12) |
| `<designs-root>`, `<pipeline clone>` in `additionalDirectories` | the `designs-root:` line's folder (resolved from the main checkout when relative) and the clone of the pipeline, as `~/…` paths: every agent reads and writes the workstreams' folders and runs the kit's workflows by path; outside them, a print-mode or subagent Read or Write is denied. A path that differs per machine goes in `.claude/settings.local.json` instead (1) |

**Dead rules are pruned.** Every rule that names a target is probed
with the runner's dry run (`make -n <target>`, or the project's
equivalent) in the repository it reaches; a target not found is removed
and the readiness file lists it.

## The three lists

**allow** — what the stages run all day: the gates, the stack, the
signoff command, read-only `git` and `gh`, commits and pushes of
`feat/*`, `fix/*`, `hotfix/*`, `revert/*`, `story/*` and `evidence/*`, deleting remote
`story/*` and `evidence/*` (the guard allows no other deletion), a `v*`
tag push, `gh pr merge`, re-running a run, the rollback workflow; and
what the check seats run, or every entry ends `inconclusive`: one test,
one spec, the env, the seed, the read-only query, `curl` to `127.0.0.1`,
a QA script under the evidence folder, `nproc`, `/proc/loadavg` and the
heartbeat; the stack's `up`, `status` and `down`, `gitleaks`, the load
wait, `cleanup.sh`, the kit's `node` scripts, `ffmpeg`, `ffprobe` and
`render.sh`, the stills' removal, `systemd-inhibit`. Each in the bare
form and the `-C <worktree>` form (`claude/references/commands.md`
says why). The merge and the tag sit in allow because the guard checks each against
his authorization line. Keep each rule as narrow as the command: a
broad `Bash(gh *)` or `Bash(gcloud *)` covers an irreversible command
too. Nothing allows a push to `main`.

**ask** — what still stops for his click: writing a secret,
`terraform apply`.

**deny** — force-push, `--admin` merges, deleting a repository,
creating or deleting a release (the CI creates it after the watch),
`terraform destroy`; any commit status by hand (`gh api *statuses*`:
only the signoff command posts); **reading credentials**: `.env`,
`secrets/`, `~/.config/gh/`, `~/.config/gcloud/` and the CI token
(`~/.config/local-ci/`, or wherever the signoff command keeps it);
editing the settings, `settings.local.json` (it holds the agent's
identity env) and the hooks. File edits are denied by `Edit(…)` rules
only: they cover every file-editing tool, and a `Write(…)` deny is
dead (Claude Code warns about it at session start).

Rules match prefixes and are not a boundary on their own: one
reordered flag or a `bash -c` escapes them. That is why the hook
exists.

**A deny that shadows an allow.** A deny wins over every allow, so a
project's broad deny can switch a route off: `Bash(gh *)` denies `gh pr
create`, `Bash(git tag *)` the release tag, `Bash(git push origin
feat/*)` or `hotfix/*` the push, `Bash(git push origin v*)` the tag
push. The audit fills each template allow's `*` with a sample (`gh pr
create x`, `git push origin feat/x`, `git tag -a v1.0.0`) and matches it
against every project deny; each hit is named in the readiness file,
and Step 3 removes that deny and keeps the template's narrow denies
above.

## The guard hook

Registered on `Bash|Edit|Write|MultiEdit|NotebookEdit` with timeout 60
through a **fail-closed wrapper**: when the guard file is missing or
not executable, the wrapper exits 2 and every call is blocked. The
guard reads the whole tool call:

- **deny** — destroying infrastructure; deleting data, databases or
  buckets; force-push, a mirror, `--all`, a refspec push (`src:dst`,
  which makes `git push origin a:b` the canary); pushing to a protected
  branch; deleting any remote branch but `story/*` and `evidence/*`; a
  merge into a protected branch or a `v*` tag that no live
  authorization covers; a status, ref, tag or release written through
  the API; switching the agent's identity or printing its credentials;
  reading the CI token; any agent write to the guard, `authorize.sh`,
  the allow file or the settings;
- **ask** — writing or reading a secret's value; a merge the guard
  cannot resolve (GitHub silent for 20 s);
- **nothing** — the rules decide.

Input it cannot read, and any internal error, blocks. `--self-test`
runs a few samples; the test file runs every case. Add the project's
own irreversible commands under `PROJECT RULES` in the copy, each with a
test case.

## The allow file and the authorization lines

`irreversible.allow` in the guard's own directory (symlinks followed),
the file the `authorize.sh` beside it writes: `.claude/hooks/` in a
copy install; next to the pipeline clone's guard when a root runs it by
path (`../skills/claude/hooks/`), and there the `!` commands below name
that `authorize.sh`. `GUARD_ALLOW_FILE` overrides both. Written only by
the user (a `!` command), never by an agent: the guard denies a write
to any path named `irreversible.allow`, and the settings deny Edit and
Write on it anywhere. One entry per line:

| Line | Meaning |
|---|---|
| a command, verbatim | that exact command passes |
| `protected <branch>` | one more protected branch (`main`, `master`, `production`, `prod` always are) |
| `default-branch <branch>` | the repository's default branch, protected too |
| `auth <route> <slug> merge=<branch>[@<sha>] tag=<0\|1> until=<UTC>` | written by `authorize.sh` |
| `auth tag <slug> ref=<ref> merged=<sha> tag=1 until=<UTC>` | written by `authorize.sh tag` |

He authorizes a workstream with one of:

```
! .claude/hooks/authorize.sh release <slug> feat/<slug>@<sha>   # the head he said ok to, its fix/<slug>/* PRs, one v* tag
! .claude/hooks/authorize.sh short   <slug> feat/<slug>         # one merge, one patch tag
! .claude/hooks/authorize.sh hotfix  <slug> hotfix/<slug>       # one merge and a revert/* PR, one patch tag
! .claude/hooks/authorize.sh legacy  <repo> <branch>            # one merge in that repository, no tag
! .claude/hooks/authorize.sh tag     <slug> main@<sha>          # no merge, one v* tag on exactly <sha>: a release with no workstream
```

The guard marks `merged=<sha>` when it lets a merge through and
`used=<tag>` when it lets the tag through; after the tag the line is
dead. Lines expire in 3 days. After a production rollback the fix's
new production deploy needs a new line: his word, by construction.

## The limits outside the session

The settings and the hook guard the session; the boundary is outside
it, and setup lists it for the user with ready commands:

- `main`'s ruleset: pull requests only, `local-ci` required, no
  force-push, no deletion; `CODEOWNERS` on the gate paths only;
- the agents run as a bot GitHub identity and a cloud identity that
  reads production and holds a staging-only role (role 15);
- secrets are written by the user, never read by an agent.
