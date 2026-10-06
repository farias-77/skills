# The bar — what a project provides for the pipeline to run

The pipeline is generic. It does not know the stack, the layout or the
taste of the project that uses it: every agent reads them from the
project. This file is the bar the project meets, written as **roles**.
The project's `CLAUDE.md` names its standards and carries a **commands
table**: one row per role below, with the command, file or folder that
fills it. Agents run what that table names. The command names in this
file (`make check`, `make verify`) are examples, never the rule.

In a two-root layout (a session root holds `CLAUDE.md`, the standards
and `.claude/skills/`; the product repositories sit beside or under
it) the session root's `CLAUDE.md` is the source every stage reads.

`/pipeline-setup <path-to-project>` audits a project against this bar,
writes `pipeline-readiness.md` on a setup branch (✓ present · ~
partial · ✗ missing, each with its evidence), proposes the cheapest
order to close the gaps, and applies the generic pieces on that branch
when the user says so ([the skill](../claude/skills/pipeline-setup/SKILL.md)).

## The three levels

| Level | What it buys | Without it |
|---|---|---|
| **Required** | the stages run end to end without a human between the gates | a stage halts at its open or its pre-flight and names the missing role |
| **Recommended** | the stages run faster and the output looks like the product | the stage runs, slower or plainer, and the retro lists the gap |
| **Full experience** | every entry in its own cloud VM, as wide as the plan | entries run on the station |

## The roles at a glance

| # | Role | Level | Used by |
|---|---|---|---|
| 1 | Standards and the commands table | required | every stage |
| 2 | Golden paths | required | design, plan, execute |
| 3 | The fast check | required | execute |
| 4 | The entry gate, sized to the change | required | plan, execute |
| 5 | The whole gate, run locally | required | execute, release |
| 6 | The signoff command and the `local-ci` status | required | execute, release, lets-cook |
| 7 | Gate paths and the floor | required | execute, release |
| 8 | A stack per worktree, test actors, the sweep | required | discovery, execute, close |
| 9 | Shared files and migrations | required | plan, execute, release |
| 10 | Feature maps, with how to drive each feature | required | every stage |
| 11 | A browser-drivable app | required with screens | execute, release, close |
| 12 | Delivery: staging, production on a tag, watch, rollback | required | release |
| 13 | The smoke and the staging actors | required | release, close |
| 14 | Permissions, the guard and the authorization | required | every stage |
| 15 | Agent identities | required | execute, release |
| 16 | The station's toolchain | required | discovery, every report |
| 17 | The house lint and the structure check | recommended | execute, weekly |
| 18 | Design tokens and components, exported | recommended | discovery, execute |
| 19 | Observability as code | recommended | design, release |
| 20 | A cloud environment for entries | full experience | execute |

---

## Required

### 1 · Standards and the commands table

**What it is.** A folder of short standards (architecture, backend,
frontend, code, testing, security and data, delivery), each rule with
an id a reviewer can cite, plus an index; and in `CLAUDE.md` the
commands table that names the command, file or folder of every role
here, the worktrees root, the designs root (the folder that holds each
front's folder and `_coordination.md`), and whether a cloud environment
exists.

**Why.** The pipeline carries no taste of its own. A reviewer's
finding blocks on a `rule` basis only when it cites a written rule.

**How the stages use it.** Design applies it and never reopens it; a
change to it is his question. The builders write to it, the reviewer
cites it by id, the weekly retro sends standards changes to him as a
PR in the project.

### 2 · Golden paths

**What it is.** A short file naming one exemplar per kind of code (a
server module, an endpoint, a job, a screen, a component, a migration,
a test per layer), each a path and one sentence on what to copy. A
kind the codebase lacks says "none"; the contract commit builds the
first. Template: [golden-paths.md](../claude/skills/pipeline-setup/templates/golden-paths.md).

**Why.** Parallel builders converge on one shape only when one shape is
named.

**How the stages use it.** The plan's scouts quote the golden path of
each kind; every brief names it; the builders start from it.

### 3 · The fast check

**What it is.** One command (`make check`): lint, types, the house
lint, the unit tests. No Docker, about a minute, run in parallel
internally.

**Why.** The builders loop on it dozens of times per entry.

**How the stages use it.** `builder-backend` and `builder-frontend
(Opus 5.5, medium)` loop on it; it is the first step of the entry gate;
C, the contract commit, proves itself with it green on the stubs.

### 4 · The entry gate, sized to the change

**What it is.** The fast check plus the **affected tests** against a
base (`make test-affected base=<ref>`): the tests of what the diff
touched and of what depends on it, chosen from the real import graph
with a whole-suite fallback, printing what it chose and why. Sized: one
primary browser width plus the specs tagged width-aware, evidence
capture off unless a flag turns it on, the server suites once. A
non-UI file (a build file, a lint config) selects no screen tests; the
lockfile selects the whole suite only on a runtime or test-runner
dependency. Under 5 minutes is the aim.

**Why.** Every entry runs it once per builder pass, many entries at
once. Running the whole gate each time multiplies the clock.

**How the stages use it.** The plan copies it into `plan.md`;
`exec-gate (Sonnet 5.5, low)` runs it once per pass; the merge queue
runs it on the merged tree (skipped when the base has not moved since
the entry's green gate).

### 5 · The whole gate, run locally

**What it is.** One command (`make verify`) that runs everything:
every lint, the contract and generated-code checks, every suite at
every width, coverage, builds, the infrastructure scans, the journeys.
Exit 0 or not. It runs in any clean worktree against that worktree's
own stack, on the station or a cloud session VM.

**Why.** There is no hosted CI gate: this command is the gate.

**How the stages use it.** The signoff command (role 6) runs it once on
the top of `feat/<slug>` while he uses the app, and again after each
`A.n` or `X.n` push.

### 6 · The signoff command and the `local-ci` status

**What it is.** A command the project names (`tooling/local-ci <sha>`,
or the pipeline's fallback
[`claude/scripts/local-ci.sh`](../claude/scripts/local-ci.sh)) that
runs the whole gate in a fresh worktree at one pushed sha and, **only
on exit 0**, posts the commit status **`local-ci`** on that sha under
the **bot identity** (role 15). It has a `--dry-run` that posts
nothing; without the bot's token it exits 3 ("green, not posted"). The
token is the bot's everyday one (role 15), not a second token, so the
gate runs overnight with nobody pasting anything. The barrier is the
guard: it denies agents printing the token and posting any status by
hand, so only this command posts.

`main`'s ruleset requires `local-ci`, pull requests only, no
force-push, no deletion. Hosted CI keeps only what needs GitHub: the
deploys on `main` and on tags, the environments.

**Why.** A local run of the same commands costs no CI minutes; the
status makes the claim checkable; a status only the gate can post
cannot be forged by an agent.

**How the stages use it.** Plan's pre-flight runs it with `--dry-run`
on `main`; execute runs it on the top of the feature branch;
release merges only a head with `local-ci` green; lets-cook runs it on
the short route's PR.

### 7 · Gate paths and the floor

**What it is.** The **gate paths**: the files that decide green (the
gate's configuration, the lint and coverage settings, the CI workflows,
the floor's tests, the guard and the settings), listed in `CODEOWNERS`
and only those, so a pull request touching one needs his approval on
GitHub. The execute stage passes them to each entry as `gatePaths`.
The **floor**: the security tests that may never disappear, and a
command (`make floor base=<ref>`) that fails when one of them is gone
unless the project's exceptions register names it.

**Why.** An agent can turn a gate green by loosening it. Those paths
are where that happens, so they are the ones a person must see.

**How the stages use it.** The reviewer re-reads any fix that touched a
gate path; execute's ok question carries the PR link when the diff
touched one; release merges only with his approval there.

### 8 · A stack per worktree, test actors, the sweep

**What it is.** Commands that bring up an isolated stack for the
current worktree (its own ports, containers, network, volumes and
database, derived from the worktree), print its URLs and test actors
(one login per role the permissions distinguish), and take only that
stack down, **its images included**. Every container, volume and image
carries a label with the worktree and the front. The **sweep**
(`make sweep front=<slug> [check=1]`) lists (`check=1`) or removes
everything labelled with a front. The commands table names the
worktrees root (`<root>/<slug>/<id>`).

**Why.** Entries run side by side; a `down` that touches a neighbour,
or images left behind by deleted worktrees, turn a parallel run into a
flaky one and fill the disk.

**How the stages use it.** Each entry and QA on its own stack; the
hands-on stack on the top of `feat`; the close's
`claude/scripts/cleanup.sh` calls the sweep and proves nothing is left.

### 9 · Shared files and migrations

**What it is.** The standards list the files every feature would
otherwise edit (migrations, the API contract and its generated code,
the module registry, a route table). Migrations are named by
timestamp, and `make restamp` re-stamps this branch's migrations that
are older than the base's newest, the one renumbering the queue and
the release run after `main` moves. Expand and contract across
releases; no down migration.

**Why.** Two parallel entries editing one file collide at merge; two
fronts' migrations collide by order.

**How the stages use it.** The plan's C owns every change to them;
execute's queue and release's step 1 run `make restamp` after merging
`main` in.

### 10 · Feature maps, with how to drive each feature

**What it is.** One file per feature or domain: what it does, one line
per rule, its screens, routes, tables and jobs, and a short section on
how to drive it (the route, the actor, the steps per state, the side
effects to read back). Template:
[verify-map.md](../claude/skills/pipeline-setup/templates/verify-map.md).

**Why.** A scout can quote only what is written; the QAs and the users'
video must drive a feature they did not build.

**How the stages use it.** Discovery's and design's scouts read them
first; every brief names the map lines it changes; the builder updates
them in the same diff.

### 11 · A browser-drivable app

**What it is.** With screens: the stack serves them at a URL, an actor
logs in without a human (a seeded password or a stored session), and a
pinned browser tool (Playwright is the reference) drives them
headless.

**Why.** An AC on a screen is proved by driving it.

**How the stages use it.** The builders write the screen proofs as
browser tests; `qa-frontend (Opus 5.5, medium)` drives the screens;
the release smoke and the users' video use it.

### 12 · Delivery: staging, production on a tag, watch, rollback

**What it is.** In the hosted CI, which keeps only these:

| Piece | What good looks like |
|---|---|
| staging | a push to `main` deploys staging and runs the smoke |
| production | a `v*` tag promotes **the image staging ran**, smokes it, watches errors and latency for 15 minutes, and only then creates the GitHub release from the tag's annotation |
| rollback | a red smoke or watch moves traffic back to the previous tag by itself (code only, never a down migration) and alarms him; the same workflow can be run by hand |
| one at a time | a tag waits for the previous tag's watch to end |
| data | daily backups with point-in-time restore on the production database, and a restore drill every quarter |
| alarms | by email, both severities |

**Why.** The release never deploys by hand; a rollback written in
advance is not improvised.

**How the stages use it.** Release merges, follows the staging run,
tags, follows production. After a production rollback, the fix's new
production deploy waits for his word and a new authorization line.

### 13 · The smoke and the staging actors

**What it is.** The journey command accepts a base URL and a selection,
and the journeys that write nothing (or only as a test actor into its
own data) are marked **read-only**; the CI runs them on staging and
production. A **staging-actor command** (`make staging-actor role=<role>
[scope=<scope>]`) creates a synthetic actor in staging only, under the
agents' staging-only role; a real person's name never appears.

**Why.** Stage 4 owns working, so the release only proves each
environment serves it; the users' video needs a logged-in actor on
staging, never production.

**How the stages use it.** The CI's smoke; `video-builder (Sonnet 5.5,
high)` records the close's users' video on staging as those actors.

### 14 · Permissions, the guard and the authorization

**What it is.** In `.claude/` of **every directory the sessions open
in** (Claude Code loads settings and hooks from the session's own
directory):

- `settings.json` with **allow** rules for what the stages run all day
  (the gates, the stack, read-only `git` and `gh`, pushes of `feat/*`,
  `story/*` and `evidence/*`, deleting remote `story/*` and
  `evidence/*`, `gh pr merge`, re-running a run and the rollback
  workflow), **ask** for the rest that reaches production, and **deny**
  for reads of the `gh` and cloud credentials and the CI token, and for
  edits to the settings and hooks;
- the pipeline's guard
  [`guard-irreversible.sh`](../claude/hooks/guard-irreversible.sh) and
  [`authorize.sh`](../claude/hooks/authorize.sh) in `.claude/hooks/`,
  registered on `Bash|Edit|Write|MultiEdit|NotebookEdit` through a
  **fail-closed wrapper**: a missing guard blocks every call;
- the allow file `.claude/hooks/irreversible.allow`, written only by
  him: verbatim commands, `protected <branch>`, `default-branch
  <branch>`, and the `auth` lines `authorize.sh` writes.

Templates: [settings.json](../claude/skills/pipeline-setup/templates/settings.json)
and [permissions.md](../claude/skills/pipeline-setup/templates/permissions.md).
A standards rule against code comments excludes `.claude/hooks/`.

**Why.** The stages run without a human between the gates. Permission
rules match prefixes; the hook reads the whole command and decides
before them. The real limits sit outside the session too (role 15).

**How the stages use it.** Every stage opens with the canary (`git push
origin a:b`, denied). He authorizes a release with `! .claude/hooks/authorize.sh
release <slug> feat/<slug>@<sha>` (or `short`, `hotfix`, `legacy`); the
guard lets one merge and one tag through, then the line is dead.

### 15 · Agent identities

**What it is.** The agents never run as him. A **bot GitHub identity**
(a fine-grained token: push branches, open and merge PRs, post
statuses only through the signoff command; it cannot approve, delete a
repository or change protection) and a **cloud identity** that reads
production, deploys nothing by hand, and holds a **staging-only** role
to create and delete synthetic actors. His own keys are out of the
agents' reach; the bot's token expiry is on a calendar.

**Why.** An author cannot approve his own PR, so `CODEOWNERS` bites only
when the agents are someone else; a read-only cloud identity cannot
destroy what the guard missed.

**How the stages use it.** Plan's pre-flight checks `gh` acts as the
bot; every push, PR and status comes from it.

### 16 · The station's toolchain

**What it is.** On the machine that runs the sessions: Node (current
LTS); `playwright-core` and a Chromium for discovery's mock
(`PLAYWRIGHT_DIR`, `PROTO_CHROME`); `ffmpeg` and `npm ci` in
`claude/video/` for the reports' videos; `gitleaks`, which every report
publish runs first.

**Why.** The mock is proved by walking it headless; every stage's
report has a video; nothing is published before a leak check.

**How the stages use it.** `proto.mjs` walks and locks the mock;
`claude/video/render.sh` renders every video; `gitleaks dir` gates every
publish. Without the video toolchain the Video tab is `failed` with its
reason and the stage closes on the other two.

## Recommended

### 17 · The house lint and the structure check

**What it is.** A house linter in the fast check for what review keeps
finding by hand (a code comment where the standards forbid one, a
suppressed lint, a skipped test, a gate path missing from
`CODEOWNERS`), skipping `.claude/`; and a structure check on a diff
against a base: complexity, size, duplication, import fences, new
dependencies, with thresholds from the codebase's own p95/p99, never
from a book. Template:
[structure-check](../claude/skills/pipeline-setup/templates/structure-check/).

**Why.** Code that works and that nobody can extend is the failure the
pipeline fears most; size, complexity and fences can be gated.

**How the stages use it.** In the fast check; the weekly retro watches
the trend.

### 18 · Design tokens and components, exported

**What it is.** The tokens (colors, type, spacing, radii, motion) as one
CSS file and one JSON, generated from the source of truth, plus the
core components with their props. Recipe:
[design-tokens-export.md](../claude/skills/pipeline-setup/templates/design-tokens-export.md).

**Why.** A mock that looks like another product is approved for the
wrong reasons.

**How the stages use it.** Discovery's recon hands them to
`prototype-builder (Sonnet 5.5, medium)`; `builder-frontend (Opus 5.5,
medium)` builds on the same tokens.

### 19 · Observability as code

**What it is.** Structured logs with stable event names, metrics
derived from them, and alarms in the repo, each with a threshold, a
window, an email channel and a runbook line (the action and the first
command).

**Why.** An alarm without a runbook wakes someone for nothing; the
production watch reads alarms by name.

**How the stages use it.** Design writes `operations.md` from what
exists; the reviewer checks no failure is silent; the watch reads them.

## Full experience

### 20 · A cloud environment for entries

**What it is.** A Claude Code cloud environment in which one stage-4
entry runs end to end in a fresh VM from the repository alone: a setup
script (toolchains at the pinned versions, warm caches, the stack's
images, the browsers; about five minutes), a `SessionStart` hook that
brings the stack up only when `CLAUDE_CODE_REMOTE` is `true`, test-only
env vars (never a real secret), the guard and the settings committed,
a network allowlist with a reason per host, and the pipeline vendored
under `.claude/pipeline/` at a tag with its `VERSION`. One repository
per session: a multi-repository session loads no hooks. Templates:
[cloud-setup.sh](../claude/skills/pipeline-setup/templates/cloud-setup.sh),
[cloud-session-start.sh](../claude/skills/pipeline-setup/templates/cloud-session-start.sh),
[cloud-settings.json](../claude/skills/pipeline-setup/templates/cloud-settings.json),
[cloud-env.md](../claude/skills/pipeline-setup/templates/cloud-env.md).

**Why.** One machine caps the width; with a VM per entry the width is
the plan's, bounded only by rate limits, which are waited out.

**How the stages use it.** Execute runs every entry in a cloud session
by default and falls back to local entry by entry
([stage-execute/references/cloud.md](../claude/skills/stage-execute/references/cloud.md));
the signoff command can run the whole gate there too (no bot token on
the VM: "green, not posted", and the station posts).

---

## What never lives in the pipeline

Project specifics stay in the project: the standards, the commands,
environments and credentials, the deploy targets, the thresholds, the
golden paths, the permission rules. The pipeline's files name roles;
the project's files fill them.
