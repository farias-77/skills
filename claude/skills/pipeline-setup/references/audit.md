# The audit — what each scout looks for, and how a role is rated

Six scouts, one per group of roles, dispatched together. Each gets its
group's rows below **as the question**, the path of the **audit
worktree** (a detached checkout of the default branch's sha, never the
user's working tree, which may sit on another branch or carry
uncommitted work), the doctrine's path read the same way when it lives
in another repository, the session roots of Step 0, and the shape of
the answer: per role, the literal lines that answer it with
`path:line`, where it looked, what it did not find. The scout quotes;
the session rates.

## The rating

| Mark | When |
|---|---|
| ✓ present | the role exists, the doctrine (or `CLAUDE.md`) names it, and the evidence shows it does what the bar says |
| ~ partial | it exists but misses a part the bar names (not isolated per worktree; thresholds from a book, not from the code; not named in the doctrine; runs in hosted CI only) |
| ✗ missing | the scout found nothing, and said where it looked |

A role the scout did not find is ✗ only when the scout's "where it
looked" covers the places it would be. Otherwise send the scout again
with the places it missed; never rate on a search that did not look.
A role that does not apply (no screens: role 10, 14, 15) is `n/a` with
the reason.

## Group A — doctrine and layout (roles 1, 2, 8, 9, 14)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 1 doctrine | `CLAUDE.md` naming a docs/engineering folder; an index (`README.md`, `index.md`) in it; documents on architecture, backend, frontend, code, testing, local development, delivery; where the sides (server, screen folders) are named | folder + index + every topic, named from `CLAUDE.md` | docs exist but no index, topics missing, or `CLAUDE.md` does not point at them |
| 2 golden paths | a file named like `golden-paths*`, or a doctrine section "exemplars", "copy this module", "reference implementation" | one exemplar per kind, each present at the audited sha (`git ls-tree`) and under the calibrated p95 | exemplars only for some kinds, paths that no longer exist, or exemplars over p95 |
| 8 shared files | a doctrine list of migrations folder, API contract (OpenAPI, proto, GraphQL schema), generated code, module registry, route table | the list exists in the doctrine | the files exist but no list names them |
| 9 feature maps | `docs/features/`, `*.feature.md`, a per-module README the doctrine names as the feature's documentation | named in the doctrine, one per feature **or per business domain**, as the doctrine organizes them; a technical module without a map of its own counts when the doctrine names where its rules live (another map, its README) | some features or domains have no map and no other written home, or the maps are not named |
| 14 verify map | in the feature maps: a route, an actor, steps per state, side effects to read back | every map whose feature has something built to drive (a screen, a server effect) carries it; a map with nothing built yet is not counted | some of those maps carry it |

## Group B — commands (roles 3, 4, 6, 7, 13, 24)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 3 gate | `Makefile`, `justfile`, `Taskfile.yml`, `package.json` scripts, `bin/ci`, `scripts/ci*`; the hosted CI workflows (`.github/workflows/*.yml`), to compare with | one local command runs what CI runs, named in the doctrine | CI runs steps no local command runs, or the local command is not named |
| 4 fast check · focused · affected | targets like `check`, `lint`, `test`, `test:changed`, `--changed`, `affected`, `nx affected`, `turbo --filter=...[base]`, `go list -deps` scripts | all three, named | fast check only; affected missing |
| 6 evidence | a command writing a verification record (sha, commands, result) — often named `evidence`, `verify-record`, `proof` | exists, named | — |
| 7 structure check | a script or target running lizard, gocyclo, gocognit, eslint complexity / max-lines, jscpd, dependency-cruiser, depguard, import-linter, ArchUnit; its thresholds and where they came from | diff-scoped, all five checks, thresholds calibrated from the code, a compare mode | some checks only, thresholds from a book, whole-tree only |
| 24 sized gate | the browser config's projects (`projects:` in `playwright.config.*`) and which one the per-entry gate passes (`--project`); a width tag (`@phone`, `grep`/`grepInvert`); where evidence screenshots are taken and the flag around them (`EVIDENCE`, `process.env`); the affected selector's mapping of build files, ignore files, lint config, placeholders and the lockfile; whether it reads an import graph (`madge`, `dependency-cruiser`, `go list -deps`, `nx`, `turbo`) and its fallback; whether the gate's check and its affected step both run the server suites | the per-entry gate runs one primary width plus the tagged specs, evidence off by default, the server suites once; non-UI files select no screen tests and the lockfile only on a runtime or test-runner dependency; selection by import graph with a whole-suite fallback; the whole gate runs every width, visual, the full server suites and evidence | any one of them missing — say which: every width per entry, evidence always on, the server suites twice, a build file or the lockfile selecting the whole suite, selection by folder rather than by graph |
| 13 signoff | a script posting a commit status (`gh api .../statuses/`, `gh signoff`), and whether CI or branch protection requires the context; the doctrine lines that name `main`'s required check | a local status is posted under `local-ci/affected` (per merge) and `local-ci` (whole gate), and `main` requires `local-ci` only | posted but not required, one context for both, or nothing local. When the doctrine names another required check (the hosted CI's aggregate), ✓ needs his doctrine ruling first: the plan lists it with the lines it changes. On a non-GitHub remote, the protection part is `n/a: non-GitHub remote` |

## Group C — the local stack (roles 5, 10)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 5 stack | `docker-compose*.yml`, `compose.yaml`, devcontainer, `Tiltfile`, `Procfile`, stack scripts; `COMPOSE_PROJECT_NAME` or a name derived from the worktree; ports from an env or an offset; a `down` that removes only its project; seed scripts with users per role | up / env / down per worktree, isolated names and ports, actors seeded per role | one stack per machine (fixed ports or names), or no actors |
| 10 browser | `playwright.config.*`, `@playwright/test` in a manifest with its version, an auth setup (`storageState`, a login helper), e2e folder | pinned, headless, an actor logs in without a human | present but logins need a human, or not pinned |

## Group D — release and permissions (roles 11, 12, 18, 19, 23)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 11 release | a delivery document; deploy workflows per environment; a staging/alpha environment; a rollback command or workflow; a production diff (`terraform plan`, a dry run); a migrations policy (expand/contract) | every row of the bar's table, written | deploy exists but rollback or staging is missing or unwritten |
| 12 permissions | `.claude/settings.json` `permissions.allow/deny/ask`; `hooks.PreToolUse` and the hook scripts — **in every session root** of Step 0 (the root repository of a two-root layout, the product repository when sessions open there) | deny covers the irreversible classes and a guard hook exists, in every directory the pipeline's sessions open in | rules but no hook; allow rules broad enough to cover a destroy; or settings and guard only in a repository no session opens in (Claude Code loads them from the session's directory, so they are inert there) |
| 18 autonomous | merge and prod deploy in `allow`, with the signoff required on `main` | both | merge allowed without a required signoff (a risk: rate it ~ and say so) |
| 19 progressive | traffic split, tagged revisions, canary config, feature flags in the deploy code | the deploy can send a share of traffic and move it back | flags exist but deploys are all-or-nothing |
| 23 smoke | the journey command (role 3's journeys) and its options: a base URL (`--base-url`, `BASE_URL`, `baseURL` from an env), a journey selection (a tag, a grep, a project); journeys marked read-only (a tag such as `@readonly`, a folder, a list in the doctrine); the test actors per environment in the delivery document | one command runs the read-only journeys against a given URL with that environment's actors, all named in the doctrine | the command takes a URL but no journey is marked read-only, or the actors per environment are not named |

## Group E — design and observability (roles 15, 16)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 15 tokens | tokens file, Tailwind config or `@theme`, global CSS custom properties, theme objects; an export folder; a component catalogue (Storybook) | an export the prototype can inline, plus the components list | tokens centralized but not exported, or no components list |
| 16 observability | a structured logger and stable event names; log-based metrics in IaC; alarm definitions in IaC; a runbooks folder linked from the alarms, or runbook text inline in the alarm (its documentation field) | metrics, alarms and runbooks all in the repo; an inline runbook counts when it states the action to take and the first command to run | alarms exist only in a console, no runbooks, or inline text that only restates the alarm |

## Group F — capacity and runner (roles 17, 20)

| Role | Look for | ✓ when | ~ when |
|---|---|---|---|
| 17 capacity | a recorded measurement (a `machine.md`, a doctrine line "N stacks at once"), the stack's footprint | measured, with its load | a guess with no measurement |
| 20 cloud runner | `.claude/` cloud setup, a devcontainer, a CI runner config for agent sessions; a setup script under ~5 minutes | an entry can run remotely and its evidence returns | a devcontainer exists but nothing runs an entry there |

## Probes the session runs itself

These are one-line commands, not reading; the session runs them and
quotes the output in the readiness file:

| Probe | For |
|---|---|
| `node --version`, `ffmpeg -version \| head -1` | role 21 (on the station) |
| `node --version`; `ls "$PLAYWRIGHT_DIR"/node_modules/playwright-core/package.json`; `printf '<p>probe</p>\n' > "${TMPDIR:-/tmp}/proto-probe.html" && node <pipeline>/claude/skills/stage-discovery/scripts/proto.mjs look "${TMPDIR:-/tmp}/proto-probe.html" --shot "${TMPDIR:-/tmp}/proto-probe.png"` (the target is a file holding an HTML **fragment**: `proto.mjs` adds the page skeleton itself, refuses a full page, and reads a non-URL target as a file; it opens the Chromium it resolves and writes one PNG) | role 22 (on the station) |
| `nproc`, `free -g \| head -2` | role 17, the machine's size |
| `git -C <project> remote get-url origin` | the remote's kind: GitHub (`github.com[:/]<owner>/<repo>`) or not |
| GitHub remote only: `gh api repos/<owner>/<repo>/branches/<default>/protection` (read-only; a 404 means no protection), with owner and repo taken from the remote URL | roles 13 and 18 |
| `git -C <audit worktree> rev-parse HEAD` | the sha the audit read |

**A remote that is not GitHub** (a bare path, another host): never call
`gh` or the GitHub API for this project, and never guess an owner from
the project's name — a lookalike repository on GitHub is someone
else's. The protection probe is not run; roles 13 and 18 record their
protection part as `n/a: non-GitHub remote` and are rated on the rest.
