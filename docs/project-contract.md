# The bar — what a project provides for the pipeline to run

The pipeline is generic. It does not know the stack, the layout or the
taste of the project that uses it: every agent reads them from the
consuming project. This file is the bar the project meets, written as
**roles**, never as a language, a framework, a command or a folder.
The project's `CLAUDE.md` names its engineering doctrine; the
doctrine names the command, the file or the folder that fills each
role. Agents run what the doctrine names. The examples in agent
prompts and in this file are illustrations, never the rule.

In a two-root layout (a session root holds `CLAUDE.md`, the doctrine
and `.claude/skills/`; the product repositories sit beside or under
it) the product repositories need no `CLAUDE.md` of their own: the
session root's `CLAUDE.md` and the doctrine's contract table (one row
per role of this file, with the command, file or folder that fills
it) are the source every stage reads.

`/pipeline-setup <path-to-project>` audits a project against this bar,
writes `pipeline-readiness.md` on a setup branch of it (✓ present · ✗
missing · ~ partial, each with its evidence), proposes the cheapest order to close
the gaps, and applies the generic pieces on a branch when the user
says so ([the skill](../claude/skills/pipeline-setup/SKILL.md)).

## The three levels

| Level | What it buys | Without it |
|---|---|---|
| **Required** | the six stages run end to end without a human between the gates | a stage halts at its pre-flight and names the missing role |
| **Recommended** | the stages run fast and the output looks and behaves like the product | the stage runs, slower or plainer, and the retro lists the gap |
| **For the full experience** | release without a stop, parallel width past one machine, the launch video | the stage falls back to the plain path and says so |

## The roles at a glance

| # | Role | Level | Used by |
|---|---|---|---|
| 1 | Doctrine folder and its index | required | every stage |
| 2 | Golden paths file | required | design, plan, execute, weekly |
| 3 | The gate, run locally | required | execute, release |
| 4 | The fast check, focused tests, affected tests | required | plan, execute |
| 5 | Stack up / env / down per worktree, with test actors | required | discovery, plan, execute, release |
| 6 | The evidence command | recommended | release, close |
| 7 | The structure check and its comparison | required | close, weekly |
| 8 | The shared files list | required | plan, execute |
| 9 | Feature maps | required | discovery, design, plan, execute |
| 10 | A browser-drivable app | required when the product has screens | execute, release, close |
| 11 | Release roles: environments, deploy, rollback | required | release |
| 12 | Permission settings and the guard hook | required | execute, release |
| 13 | Local-CI signoff that main accepts | required | execute, release |
| 22 | The mock toolchain, on the station | required | discovery |
| 14 | The verify map inside each feature map | recommended | execute, release, close |
| 15 | Design tokens and components, exported | recommended | discovery, execute |
| 16 | Observability as code: log metrics, alarms, runbooks | recommended | design, execute, release |
| 17 | Parallelism capacity, measured | recommended | plan, execute |
| 18 | Autonomous release permissions | full experience | release |
| 19 | Progressive delivery | full experience | release |
| 20 | A cloud runner for parallel width | full experience | execute |
| 21 | The video toolchain | full experience | every stage report, close |

---

## Required

### 1 · The doctrine folder and its index

**What it is.** A folder of documents that is the bar every builder
writes to and every reviewer measures against, and one index file that
says which document holds what. The project's `CLAUDE.md` names the
folder. The doctrine covers, in whatever files it chooses:

| Topic | What it fixes |
|---|---|
| architecture | where code runs, the modules and how they talk, what the shape grows into |
| backend | how a server-side feature is organized: modules, layers, persistence, contracts, jobs |
| frontend | how a screen is organized: routes, features, state, components, the visual direction |
| code | the rules of the diff, including what the guard rejects mechanically and what a workaround is |
| testing | the test layers, what each proves, the coverage bar, the rules of a good test |
| local development | the commands of roles 3–7 and how a stack is isolated per worktree |
| delivery | the branches, what runs on each, the environments, deploy and rollback (role 11) |
| sides | which folders are the server side and which the screen side |

**Why.** The pipeline carries no taste of its own. A reviewer's finding
blocks only when it names a written rule it violates, so a rule that is
not written cannot block.

**How the stages use it.** Design applies it and never reopens it; plan
cuts entries along its sides; the builder writes to it; the reviewers
cite it by `path:line`; the weekly retro turns repeated lessons into
doctrine lines. A gate failure is attributed to the side whose folder
it is in.

### 2 · The golden paths file

**What it is.** A short file naming the exemplary unit to copy for
every kind of code: a server module, an endpoint, a job, a screen, a
component, a migration, and a test of each layer. Each line is a path
and one sentence on what to copy from it. A kind the codebase does not
have yet says "none"; the plan's foundation builds its first exemplar.
Template: [golden-paths.md](../claude/skills/pipeline-setup/templates/golden-paths.md).

**Why.** Parallel builders converge on one shape only when one shape is
named. Without it, five entries of the same kind write five shapes.

**How the stages use it.** Design reads it in recon. `plan-scout
(Sonnet 5.5, low)` copies the right line into each area's recon and
every brief names the golden path of each kind it adds. `builder (Opus
5.5, medium)` starts a new unit from it; `reviewer (Opus 5.5, high)`
blocks on a departure only where it is written as a rule. Stage 4
halts at its pre-flight without it.

### 3 · The gate, run locally

**What it is.** One command that runs everything the CI runs, locally
and identically: the guard, lint, contract and generated-code checks,
all tests, coverage, builds, the structure check, the journeys. Exit 0
or not. It runs in any worktree, against that worktree's own stack.

**Why.** Execution runs many entries at once, each in its own worktree,
and cannot wait for a hosted CI queue on every round. A gate that
differs from CI lets a green entry turn red at merge.

**How the stages use it.** Plan fixes the gate commands once in
`plan.md`; `exec-gate (Sonnet 5.5, low)` runs them once per builder pass; the
execute session runs the whole gate once on the feature branch at the
end; release reads its result before the first merge.

### 4 · The fast check, focused tests and affected tests

**What it is.** Three commands under the gate.

| Command | What it does |
|---|---|
| **fast check** | the loop while coding: lint and the tests of what was touched, in seconds to a minute |
| **focused tests** | the tests of one module or one spec, with their arguments |
| **affected tests** | the tests of every module and screen a diff touched and of what depends on them, chosen from the diff against a base; prints what it chose and why |

**Why.** The builder iterates dozens of times per entry. Running the
whole gate each time multiplies the clock by the number of entries.

**How the stages use it.** The builder loops on the fast check and the
focused tests, never the journeys; `exec-gate (Sonnet 5.5, low)` runs
the fast check and the affected tests once per builder pass, the only
place the suites run. Without affected tests, each pass runs the whole
gate.

### 5 · Stack up / env / down per worktree, with test actors

**What it is.** Three commands that bring up an isolated local stack for
the current worktree, print its URLs and test actors, and remove only
that stack. Isolated means its own ports, its own container, network
and volume names and its own database, all derived from the worktree,
so N stacks run side by side and `down` never touches another one.
The stack seeds **test actors**: one login per role the product's
permissions distinguish, with credentials that exist only in the
local stack.

**Why.** Entries are built and proved in parallel. Two stacks on one
port, or a `down` that removes a neighbour's database, turn a parallel
run into a flaky one.

**How the stages use it.** Discovery's recon screenshots the current
screens as an actor; plan's scout reads the commands and the machine
scout measures how many stacks fit; `qa-frontend (Opus 5.5, medium)`
and `qa-backend (Opus 5.5, medium)` use each entry on its own stack as
the actors; release asks the doctrine for the staging
actors (never a production actor).

### 6 · The evidence command

**What it is.** A command that writes the entry's verification record
for the head it runs on: which gate commands ran, on which sha, with
which result, plus pointers to the screenshots, videos and side
effects captured. Redacted: no token, password or
person's data.

**Why.** Merge decisions are made on a record, not on a message that
says "tests pass".

**How the stages use it.** Stage 4 writes no record per entry: the
committed tests and the gate's summary line are its evidence, and the
signoff's record per tree is what the queue reads. Release and the
close may run it for their own record.

### 7 · The structure check and its comparison

**What it is.** A command that checks the files a diff changed against
a base, for:

| Check | Fails when |
|---|---|
| complexity | a changed function goes over the ceiling for its class |
| size | a changed function or file goes over the ceiling for its class |
| duplication | the share of added lines inside a clone exceeds the codebase's own rate |
| import boundaries | an added import crosses a layer or module fence the doctrine writes |
| new dependencies | a new direct dependency, or an unpinned version, that no ruling allowed |

It prints each violation with its file and line and exits non-zero on
any. A **comparison** mode measures two refs and prints the numbers
side by side.

**The thresholds come from the codebase's own distribution**, never
from a book: measure every function of the code as it is today, set
the warning line at the p95 and the failing line at the p99 of each
class (product and test, per language). A gate at a number the code
already lives far inside never fires; a gate at a number half the code
breaks is ignored. Re-measure between workstreams, never during one.
Its tools are dependencies like any other: declared in a manifest with
exact versions, not fetched ad hoc. Because it diffs against a base,
a hosted CI job that runs it needs the history and the base ref (a
full-depth checkout, the base passed explicitly).
Template: [structure-check](../claude/skills/pipeline-setup/templates/structure-check/).

**Why.** Code that works and that nobody can extend later is the
failure the pipeline fears most. Taste cannot be gated; size,
complexity, duplication and fences can.

**How the stages use it.** The project may list it among the gate
commands; the close measures `main` before and after the workstream;
the weekly retro watches the trend and proposes a refactor slice past
a threshold.

### 8 · The shared files list

**What it is.** The doctrine names the files every feature would
otherwise edit: schema migrations, the API contract and its generated
code, the module registry, and any other single file a new feature has
to touch (a route table, a permissions matrix, a translation index).

**Why.** Two parallel entries editing one file collide at merge.
Laying those files down once removes the collision instead of
resolving it every time.

**How the stages use it.** Plan's foundation owns every change to them
and is built first; after it they are frozen. An entry that cannot be
built without changing one changes it minimally and lists it
(`outsideOwns`); the reviewer reads it, and the queue merges entries
one at a time, so a collision shows as a conflict at the update.

### 9 · Feature maps

**What it is.** The doctrine names where the documentation of each
feature lives: one file per feature or per business domain, saying
what it does, the screens and routes it has, the tables it writes, the
jobs and events it owns. A technical module without a map of its own
is covered when the doctrine names where its rules are written.

**Why.** Recon must find what exists without reading the whole
codebase, and a scout can only quote what is written down.

**How the stages use it.** Discovery's recon reads the maps of the
areas the user names; design's scouts read them before the codebase;
plan names which rows each entry updates; the builder updates the map
for what its entry changed.

### 10 · A browser-drivable app

**What it is.** When the product has screens: the local stack serves
them at a URL, an actor can log in without a human (a seeded password,
a test login route or a stored session), and a browser automation tool
(Playwright is the reference) drives them headless. The project pins
the tool's version and its browsers.

**Why.** Acceptance on a screen is proved by driving it, not by
reading the code that draws it. Screenshots and video are the
evidence the user audits.

**How the stages use it.** `builder (Opus 5.5, medium)` writes the
screen acceptance as browser journeys; the gate runs them;
`qa-frontend (Opus 5.5, medium)` drives the screens by hand; the user
compares the screenshots with the locked mock's frames once, in the
stage report; release runs the same journeys against staging with
`verifier (Opus 5.5, medium)`.

### 11 · Release roles: environments, deploy, rollback

**What it is.** The doctrine's delivery document names:

| Role | What it is |
|---|---|
| environments | at least one pre-production environment (staging, alpha) and production, with the branch that deploys each |
| deploy commands | how each environment is deployed: the CI on a merge, or a command; the read-only check of its result |
| the production diff | a command that shows what production would change before it does |
| rollback command | how production returns to the previous version, and whether it is safe for the data a migration wrote |
| migrations policy | expand and contract across releases; what is reversible |

**Why.** Release follows the project's own delivery pipeline and never
deploys by hand what the doctrine automates. A rollback that is not
written in advance is improvised during an incident.

**How the stages use it.** The release session writes its plan from
this document, merges to staging on its own, follows the CI, runs the
verifier on staging, and rolls back on the triggers written in the
plan.

### 12 · Permission settings and the guard hook

**What it is.** The `.claude/settings.json` of **every directory the
pipeline's sessions open in**, with the items below. Claude Code loads
the settings and the hooks they register from the session's own
directory, so where `CLAUDE.md`, the doctrine and `.claude/skills/`
sit in a root above the product repository, the root carries them
(and the product repository too, when sessions open there as well); a
copy only in a repository no session opens in guards nothing.

- **allow** rules for what the stages run all day: the gate commands,
  the stack commands, read-only `git` and `gh`, staging deploys, and
  (role 18) the merge into `main` and the production deploy and
  migration;
- **ask** rules for the rest that reaches production: re-running a
  deploy workflow, a release, writing a secret, `terraform apply`;
- **deny** rules for what cannot be undone: force-push, destroying
  infrastructure, dropping data, deleting a bucket or a repository,
  posting a commit status by hand, and edits to the settings and hooks
  themselves;
- the pipeline's **PreToolUse guard hook**,
  [`claude/hooks/guard-irreversible.sh`](../claude/hooks/guard-irreversible.sh),
  copied to `.claude/hooks/` and registered on `Bash` and every file
  tool. It is the pipeline's file and keeps its header comments: a
  doctrine rule against code comments excludes `.claude/hooks/`. It **denies** the irreversible classes even when a rule is
  broad, unless the allow file names that exact command; it **asks**
  before a secret's value is written or read, and before a merge into
  a protected branch whose head the user's play did not authorize. The
  allow file (`.claude/hooks/irreversible.allow`, written only by the
  user) takes verbatim commands and the lines `merge-from <sha>`,
  `merge-head <sha>`, `protected <branch>` and
  `default-branch <branch>`.

Templates: [settings.json](../claude/skills/pipeline-setup/templates/settings.json),
the guard's tests in
[claude/hooks/tests/](../claude/hooks/tests/guard-irreversible.test.sh),
and the notes on each rule in
[permissions.md](../claude/skills/pipeline-setup/templates/permissions.md).

**Why.** Execute and release run without a human between the gates.
Permission rules match command prefixes and are not a security
boundary on their own; a hook reads the whole command and decides
before the rules. The real limits sit outside the session too: branch
protection, cloud roles that cannot delete, secrets the agent cannot
read.

**How the stages use it.** Execution runs entries under the allow list
with no prompt; release merges and deploys under it; the hook stops
the class of command no stage should ever run on its own.

### 13 · Local-CI signoff that main accepts

**What it is.** One command that runs a gate command of role 3 in a
clean worktree at one commit and posts a commit status on that sha
through the GitHub commit status API
(`gh api repos/:owner/:repo/statuses/:sha`). It posts under **two
contexts**: `local-ci/affected` for the affected gate on each merge of
the execute queue, and `local-ci` for the whole gate, run once at the
end of the stage. Branch protection on `main` requires `local-ci`
only, so no intermediate head of the feature branch satisfies `main`
after only an affected gate. An affected run whose selection is empty
on a non-empty diff runs the whole gate instead of signing off a run
that tested nothing. The command removes its worktree and the stack
the gate brought up on exit. Hosted CI keeps the deploy and a cheap
trust check. Template:
[local-ci.sh](../claude/skills/pipeline-setup/templates/local-ci.sh)
and its document
[local-ci.md](../claude/skills/pipeline-setup/templates/local-ci.md)
(`--context` picks the context). When the doctrine names another
check as the one `main` requires, requiring `local-ci` is a doctrine
ruling before it is a protection change. A remote that is not GitHub
has no commit status: the signoff's protection part does not apply.

**Why.** A hosted queue on every merge is the slowest step of a
parallel build. A local run of the same commands takes minutes, and the
status makes the claim checkable.

**How the stages use it.** Execute requires it: without the command,
it is an item of the pre-flight. The execute session's merge queue
posts `local-ci/affected` on each merged head and `local-ci` once on
the top of the feature branch after the whole gate; release merges
into `main` behind `local-ci`. A signoff is only as strong as who can
post it: the strongest setup posts it from one host with a token that
agent shells cannot read.

### 22 · The mock toolchain, on the station

**What it is.** On the machine that runs the discovery session, not in
the project: Node 18 or later, `playwright-core` (or `playwright`) and
a Chromium. Discovery's `claude/skills/stage-discovery/scripts/proto.mjs`
finds them through `PLAYWRIGHT_DIR` (a folder whose `node_modules` has
playwright-core) and `PROTO_CHROME` (a Chromium binary; otherwise the
common system paths, then Playwright's own browser). Install once:
`npm i --prefix "$PLAYWRIGHT_DIR" playwright-core`.

**Why.** The mock is proved mechanically: every journey walked, every
state reached, every frame rendered headless before he can lock it.
Without a browser the lock gate cannot run.

**How the stages use it.** `prototyper` and `prototype-checker` walk
the mock and render its frames; the lock freezes the frames; the
recon screenshots the current app's screens (role 10) with
`proto.mjs look`.

## Recommended

### 14 · The verify map inside each feature map

**What it is.** A short section in each feature map that says how to
reach and drive the feature: the URL or route, the actor who can see
it, the steps to reach each state, the side effects to read back (the
table, the event, the e-mail) and how to read them. Template:
[verify-map.md](../claude/skills/pipeline-setup/templates/verify-map.md).

**Why.** The QAs, the release check and the footage recorder all
need to drive a feature they did not build. Without the map each one
rediscovers the path, and a wrong path proves the wrong thing.

**How the stages use it.** The QAs start from it when they drive an
entry; release reuses it on staging; `footage-recorder
(Sonnet 5.5, medium)` follows it to record the launch video.

### 15 · Design tokens and components, exported

**What it is.** The product's design tokens (colors, type scale,
spacing, radii, shadows, motion) exported as one CSS file of custom
properties and one JSON file, generated from the source of truth, plus
a list of the core components with their props and a rendered sample
of each. Recipe:
[design-tokens-export.md](../claude/skills/pipeline-setup/templates/design-tokens-export.md).

**Why.** The discovery mock is what the user approves. A mock that
looks like a different product is approved for the wrong reasons, and
the builder then rebuilds it in the real look.

**How the stages use it.** Discovery's recon hands the export to
`prototyper (Opus 5.5, medium)`, so the mock uses the real tokens and
the real component shapes; the builder builds the screens on the same
tokens.

### 16 · Observability as code

**What it is.**

| Role | What it is |
|---|---|
| log-based metrics | structured logs with stable event names, and metrics derived from them in code |
| alarm definitions | alarms declared in the repo (infrastructure as code), each with a threshold, a window and a channel |
| runbooks | one per alarm: what it means, how to check, how to mitigate, who is told; text inline in the alarm's definition counts when it states the action and the first command to run |

**Why.** Design right-sizes operations per part; a mechanism without a
reader is cut, and an alarm without a runbook wakes someone for
nothing. Release reads each alarm's first evaluation, which only
works when the alarm is code with a name.

**How the stages use it.** Design writes the observability document
from what exists; `reviewer (Opus 5.5, high)` checks every diff for
errors logged and no silent failure; release reads the alarms once at the end of
production.

### 17 · Parallelism capacity, measured

**What it is.** A number: how many stacks, builds and browser runs the
machine holds at once before every run gets slower, measured with the
project's real stack and recorded with its load. The project's role is
a stack light enough to run several copies, and the machine's
resources written down (cores, memory, disk pressure).

**Why.** The plan maximizes parallel width; past the measured cap,
every run gets slower and the stage does not finish sooner.

**How the stages use it.** The plan draws the widest graph the work
allows and does not measure the machine by default; its machine scout
runs only when the conductor asks for it. The execute session starts
runs up to the measured cap, or the plan's widest wave, and watches
the load.

## For the full experience

### 18 · Autonomous release permissions

**What it is.** The merge into `main` and the production deploy sit
in **allow** in the settings (the template's default), kept safe by
three things: branch protection that requires the `local-ci` signoff
(role 13), the guard hook (role 12), and the user's play, which writes
`merge-from <audited head>` into the guard's allow file (the strict
variant is `merge-head`, the exact head). The guard asks on any other
head.

**Why.** Release then runs from play to done, and his one ruling is
the play.

**How the stages use it.** Release merges, deploys and watches without
a stop; a production red rolls back on its own by the plan's triggers.

### 19 · Progressive delivery

**What it is.** The platform can send a share of production traffic to
the new version (a traffic split, a tagged revision, a canary, a
feature flag) and move it back with one command.

**Why.** A defect reaches a fraction of the users for minutes instead
of all of them.

**How the stages use it.** Release ships progressively where the
platform allows it, reads the smoke run and the alarms, and promotes
or rolls back; otherwise it deploys straight and runs the smoke.

### 20 · A cloud runner for parallel width

**What it is.** A way to run one entry in a cloud session or a remote
runner: a setup script that installs the toolchain and brings the
stack up in a few minutes, the secrets the stack needs for tests only,
and a way for the evidence to come back.

**Why.** One machine caps the width; the plan's widest wave may be
wider.

**How the stages use it.** The execute session sends the entries past
the local cap to the runner and merges what comes back through the
same queue; how one entry runs in a cloud session, what it needs and
how its evidence comes back is in
[stage-execute/references/cloud.md](../claude/skills/stage-execute/references/cloud.md).

### 21 · The video toolchain

**What it is.** On the station that runs the pipeline: Node (the
current LTS), `ffmpeg`, and the video kit's dependencies installed once
(`claude/video/`). For the launch video, the app reachable on staging
or production with an actor, and the browser tool able to record at
1920×1080.

**Why.** Every stage report opens with a video, and the close's launch
video is recorded from the real app.

**How the stages use it.** `video-scribe (Sonnet 5.5, medium)` renders
each stage's video; `footage-recorder (Sonnet 5.5, medium)` records
the journeys; the kit renders the launch video. Without the toolchain,
the stage report has slides and the blueprint only, and says so.

---

## What never lives in the pipeline

Project specifics stay in the project: the doctrine, the commands,
environments and credentials, the deploy targets, the thresholds, the
golden paths, the permission rules. The pipeline's files name roles;
the project's files fill them.
