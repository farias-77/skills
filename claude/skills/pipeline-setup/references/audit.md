# The audit — what each scout looks for, and how a role is rated

Six scouts, one per group of roles of `docs/project-contract.md`,
dispatched together. Each gets its group's rows below **as the
question**, the path of the **audit worktree** (a detached checkout of
the default branch's sha, never the user's working tree), the
standards' path read the same way when they live in another
repository, the session roots, and the shape of the answer: per role,
the literal lines with `path:line`, where it looked, what it did not
find. The scout quotes; the session rates.

## The rating

| Mark | When |
|---|---|
| ✓ present | the role exists, the commands table in `CLAUDE.md` names it, and the evidence shows it does what the bar says |
| ~ partial | it exists but misses a part the bar names (not in the commands table; not isolated per worktree; images left on `down`; thresholds from a book) |
| ✗ missing | the scout found nothing, and said where it looked |

✗ only when the scout's "where it looked" covers the places the role
would be; otherwise send it again with the places it missed. A role
that does not apply (no screens: 11, 18) is `n/a` with the reason.

## Group A — standards and layout (1, 2, 9, 10)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 1 standards | `CLAUDE.md` naming a standards folder and an index; rules with ids; a commands table naming each role's command, the worktrees root and whether a cloud environment exists; the line `designs-root: <path>` in `CLAUDE.md` or `CLAUDE.local.md` | folder + index + ids + the table covering every required role | the table is missing or partial, no `designs-root:` line, rules have no ids, or `CLAUDE.md` does not point at them |
| 2 golden paths | a `golden-paths*` file or an "exemplars" section | one exemplar per kind, each present at the audited sha (`git ls-tree`) | kinds missing, or paths that no longer exist |
| 9 shared files and migrations | a list of the shared files; the migrations' naming (timestamp or sequence); a `restamp` target; a down-migration rule | the list, timestamped migrations, a restamp command, expand and contract written | sequence-numbered migrations, or no restamp |
| 10 feature maps | `docs/features/` or the folder the standards name; per map, rules one per line and a section on how to drive the feature | one per feature or domain, each with its drive section when something is built | maps without drive sections, or features without maps |

## Group B — commands (3, 4, 5, 6, 7, 17)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 3 fast check | a `check` target or script and what it runs; whether it starts Docker | lint, types, house lint, unit tests, no Docker, about a minute | it starts the stack or runs the server suites |
| 4 entry gate | an affected selector (`test-affected`, `--changed`, `go list -deps`, `nx affected`) taking a base; the browser config's projects and width tag; the evidence flag; how build files and the lockfile are mapped | selection by import graph with a whole-suite fallback, printed; one primary width plus tagged specs; evidence off by default; non-UI files select no screen tests | any part missing — say which |
| 5 whole gate | a `verify` (or `ci`) target; the hosted CI workflows, to compare | one local command runs everything, in any clean worktree | hosted CI runs steps no local command runs |
| 6 signoff | a command that runs the whole gate in a fresh worktree and posts a commit status (`statuses/` in a script); where its token lives; a `--dry-run`; whether `main`'s ruleset requires `local-ci` | posts `local-ci` only on exit 0, under a bot token agents cannot read, required on `main` | posts but not required, posts on red, the token in a readable place, or none (then the fallback `claude/scripts/local-ci.sh` is the fix) |
| 7 gate paths and floor | `CODEOWNERS`; the floor's test list and a `floor` target; an exceptions register | `CODEOWNERS` lists the gate paths only, and the floor command fails when a floor test disappears | `CODEOWNERS` over everything or missing gate paths, or no floor command |
| 17 house lint and structure check | a repo linter for comments, suppressions, skipped tests; a structure check (lizard, gocognit, jscpd, dependency-cruiser) and where its thresholds came from | both in the fast check, thresholds calibrated from the code | one of them, or thresholds from a book |

## Group C — the local stack (8, 11)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 8 stack and sweep | compose files and stack scripts; names and ports derived from the worktree; a `down` and whether it removes images (`--rmi local`); a label per worktree and front; a `sweep` target with a check mode; seeded actors per role | up / env / down per worktree, images removed, labels, a sweep, actors | fixed ports or names, images kept, no labels or no sweep |
| 11 browser | `playwright.config.*` and its pinned version; a login helper or stored session | pinned, headless, an actor logs in without a human | logins need a human, or not pinned |

## Group D — delivery, permissions, identities (12, 13, 14, 15)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 12 delivery | the deploy workflows: staging on `main`, production on a `v*` tag with the same image, a smoke, a watch, a rollback workflow, the release created after the watch; the alarm channel; backups and a restore drill in the delivery document | every row of the bar's table | a hosted gate still required, production built separately, no rollback, or no restore drill |
| 13 smoke and staging actors | the journey command's base URL and selection; read-only journeys marked; a staging-actor command | a read-only smoke against a URL and a staging-only actor command | the smoke is a health check only, or actors are hand-made |
| 14 permissions and guard | `.claude/settings.json` and `.claude/hooks/` **in every session root**: the guard, `authorize.sh`, the fail-closed wrapper, deny rules for credential reads | the template's shape in every session root, the test green | rules but no hook; a hook registered without the wrapper; no `authorize.sh`; or only in a repository no session opens in |
| 15 identities | how `gh` and the cloud CLI are authenticated for the agents (`gh api user`, the active cloud account); a bot account; the cloud identity's roles | the agents run as a bot and a read-only cloud identity with a staging-only role | the agents run as the user |

## Group E — design and observability (18, 19)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 18 tokens | a tokens source, an export folder, a component list | an export the mock can inline, plus the components | tokens centralized but not exported |
| 19 observability | a structured logger with stable event names; alarms in IaC with an email channel and a runbook line | metrics, alarms and runbooks in the repo | alarms only in a console, or no runbooks |

## Group F — the cloud environment (20)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 20 cloud environment | a cloud setup script and its timings; a `SessionStart` hook gated on `CLAUDE_CODE_REMOTE`; a document with the env var names (test-only values) and the network allowlist; allow rules for the gate, the stack, `git ls-remote` and pushes of `story/*` and `evidence/*`; the pipeline vendored under `.claude/pipeline/` with `VERSION`, and whether its guard copy matches the pipeline's | all present, setup under ~5 minutes, no real secret, the vendored guard current | any piece missing — say which; a stale vendored guard; symlinks the VM cannot follow |

## Probes the session runs itself

One-line commands, quoted in the readiness file:

| Probe | For |
|---|---|
| `node --version`, `ffmpeg -version \| head -1`, `gitleaks version` (or `make -n gitleaks dir=.`) | role 16 |
| `ls "$PLAYWRIGHT_DIR"/node_modules/playwright-core/package.json`, then `proto.mjs look` on a file holding `<p>probe</p>` with `--shot` (`proto.mjs` adds the page skeleton itself and refuses a full page) | role 16, the mock |
| in each session root: `ls -L .claude/skills/lets-cook/SKILL.md .claude/agents .claude/workflows`, `jq .permissions.additionalDirectories .claude/settings.local.json`, `git status --short .claude` empty (the links in `.git/info/exclude`) | the README's install (role 14) |
| `git -C <project> remote get-url origin` | the remote's kind |
| GitHub only: `gh api repos/<owner>/<repo>/rulesets` and `.../branches/<default>/protection` (read-only) | roles 6 and 7 |
| GitHub only: `gh api user --jq .login` | role 15: who the agents are |
| `git -C <audit worktree> rev-parse HEAD` | the sha the audit read |

**A remote that is not GitHub:** never call `gh` for this project and
never guess an owner from its name; the ruleset parts of roles 6 and 7
are `n/a: non-GitHub remote`.
