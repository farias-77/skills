---
name: stage-release
description: Conducts stage 5 (Release). It takes the audited feature branch into main and production on its own, from the user's play to done. The session (Opus 5.5, medium) writes the release plan, with the rollback triggers, the stop list, the migrations and the toggles, and checks the project's permissions and guard hook. It sends him, in one message, every action only he can run plus the play line that authorizes the merge. His play is his "go". Then it runs alone. It merges into main behind the local-CI signoff and deploys staging. The verifier (Opus 5.5, medium) runs the locked journeys on staging. Production goes out progressively where the platform allows: a candidate at 0% smoked on its tag, the traffic shift, and a bake against the previous revision. Otherwise it goes straight, followed by a smoke run. The session reads each alarm's first evaluation, tags the versions from one release-scribe (Sonnet 5.5, medium) per artifact, and closes with the stage report (video, slides, blueprint). A red on staging is fixed as an entry R.n through the stage-4 pipeline. A rollback trigger rolls production back automatically. It stops and asks only on its written list. Also runs a hotfix while the workstream is not closed. Use when a workstream's .state.md says stage release, to resume a release in progress, or with `hotfix` for a regression found in production.
disable-model-invocation: false
argument-hint: "<workstream-slug> [hotfix]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, Skill, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Bash
---

# Stage 5: Release

Stage 4 left `feat/<workstream>` merged, gated, reviewed and audited.
This stage puts it in `main` and in production, and reports once.

**Mode: autonomous under his play.** He presses play once. **His play
is his "go"** (reports render the word in the workstream's
language). From then on the session conducts every step alone:
the merge into `main`, the deploys, the proof on staging, the
progressive rollout, the rollback, the fixes. It asks him only for
what it cannot reach (a key, an account, a DNS record, all in one
message up front) and for what is on the stop list below. Merge and
deploy permissions are granted by the project's settings. In
exchange, the session owes him responsibility, and here that means
five concrete things:

- every step is confirmed by reading its result, never by an exit
  code;
- the rollback triggers are written before the play and fire on their
  own;
- nothing runs that the plan does not name;
- the guard hook holds whatever cannot be undone;
- the session stops on its written list.

**How** code reaches each environment is the project's. The
engineering doctrine that the project's `CLAUDE.md` names has a
delivery standard: the environments, what deploys each, the read-only
check of each, the production diff, the rollback, the migrations
policy (`docs/project-contract.md`, role 11). The session follows it.
It never deploys by hand what the doctrine says the CI deploys.

| Word | What it is here |
|---|---|
| **the play** | his one action: he runs the `!` line that writes the merge authorization into the guard's allow file, and says go in his own words. Quoted verbatim in the trace, in `rulings.md` and in the PR into `main` |
| **the plan** | `04-release/plan.md`: what ships, the pre-flight, every step with its command and its read-only check, the rollback triggers, the migrations, the toggles, the stop list. Written before the play |
| **the guard** | the project's `.claude/hooks/guard-irreversible.sh` (the pipeline's `claude/hooks/guard-irreversible.sh`, installed by pipeline-setup). It denies what cannot be undone and asks before a merge into a protected branch that the play did not authorize |
| **staging** | the environment the doctrine deploys before production (a project may call it alpha) |
| **the locked journeys** | the journeys locked at discovery, as stage 4 turned them into each entry's acceptance checks |
| **candidate** | the new production revision, deployed with no traffic under a tag URL |
| **bake** | ≥ 10 minutes with the new revision serving, read against the previous revision in the same window |
| **entry `R.n`** | a fix built through the stage-4 pipeline (`exec-entry`). The session never writes or reviews code |

## The team

| Agent | Does |
|---|---|
| the session (Opus 5.5, medium) | the plan, the pre-flight, the merges, the deploys, the reads, the rollback, the record |
| `verifier (Sonnet 5.5, high)` | prove mode: the locked journeys on staging, and the read-only ones on the candidate and on production |
| `release-scribe (Sonnet 5.5, medium)` | one per versioned artifact: the version, the notes, the reverts |
| the stage-4 pipeline | an `R.n` fix: `builder (Opus 5.5, medium; high on the fix)`, `exec-gate (Sonnet 5.5, low)`, the verifier, the reviewers |
| `scout (Sonnet 5.5, low)` | whatever the session needs to look up, by the house rule |
| `video-scribe (Sonnet 5.5, medium)`, `slides-scribe (Sonnet 5.5, high)` | the stage report |

**Packs.** At step 0 the session loads `pack-release` and `pack-ops`
with the Skill tool. They hold the checklists and recipes this skill
points to: the go/no-go per step, the candidate commands per platform,
the thresholds, the migration rules and the toggle rules. Every
verifier prompt names `pack-release` to read first.

The session is **Opus 5.5 at medium effort**. It runs the steps
in order and has no workers. Every reply that dispatches or waits
carries a status table (what · state). A wait on something outside (a
CI run, a deploy, a bake, a proof's hour) ends the turn on a wakeup
sized to it. It never loops to check early.

## The pattern

```
0 open      preconditions · model · permissions and guard checked · packs loaded
            → 04-release/plan.md (steps, rollback triggers, migrations, toggles, stop list)
1 play      ONE message + one PushNotification: every pre-flight item as a ready ! command,
            the play line last → he runs them and says go → each item read back, the play quoted
2 main      PR feat/<ws> → main · the local-CI signoff on its head · merge commit,
            --match-head-commit · the guard checks the head against the play
            ‖ release-scribe (Sonnet 5.5, medium) per artifact on the merge sha
3 staging   the doctrine's deploy of that sha → read-only: staging serves it · migrations ran
4 verify    verifier (Sonnet 5.5, high) per entry, on staging: the locked journeys
            red → R.n through exec-entry → PR into main → 3 again · third red on a step: stop
5 prod      progressive: candidate at 0% + tag → smoke on the tag → shift → bake vs previous → 100%
            straight:    deploy → smoke run of the read-only journeys
            a trigger fires → automatic rollback → R.n → 3 → ask before the new artifact
6 alarms    each alarm's first evaluation, read once after the bake, written as read
7 done      tags + releases on the released sha · release.json · .state.md · PushNotification
8 report    claude/docs/stage-report.md: video → slides → blueprint
```

**When a merge into `main` deploys production by itself** (the
doctrine says so), the order changes. Steps 3 and 4 run first, from
`feat/<workstream>` or the staging branch the doctrine names. Step 2
then *is* the production deploy, and step 5 follows the CI's rollout,
progressive when the CI does it that way.

## Preconditions

- `.state.md` says `stage: release`.
- `03-execution/audit.md` is approved, and
  `blueprint/execution/execution.json` has `closed` set.
- Every entry is merged or was ruled at the audit.

If any is missing, halt and send the user back to stage 4. If the
session is not on Opus 5.5 at medium effort, ask him to switch
(`/model`) and wait.

```
designs-root/<workstream>/04-release/
├── plan.md        # the whole stage, written before the play
├── trace.md       # one line per step as it ends, `date -u`
├── notes/         # per versioned artifact: <artifact>.md (the notes) and <artifact>.json (the scribe's return)
├── entries/R.<n>/ # the fix entries' run-*.json and evidence
└── proof/         # CI summaries, smoke and bake reads, the alarms, the watch, verify/<entry>/
```

## Step 0 — open: the permissions, then the plan

**Permissions first.** These checks are read-only, by
[references/permissions.md](references/permissions.md):

- the project's `.claude/settings.json` registers the guard on
  `PreToolUse`;
- `.claude/hooks/guard-irreversible.sh --self-test` passes;
- the allow rules cover the merge, deploy and migration commands the
  plan will run (role 18 of `docs/project-contract.md`);
- branch protection on `main` requires the local-CI signoff (role 13).

A missing guard halts the release before the plan. The user installs
it with `/pipeline-setup`, which carries the settings template and
the hook. A merge or deploy command left under **ask** still works,
but it prompts him each time, so the pre-flight message says which
ones will. A `main` without the signoff requirement merges behind the
hosted checks, and the report says so.

**The plan.** The session reads the audit, the execution record, the
design's rollout, data-model and observability documents, and the
doctrine's delivery standard (through a scout where it only needs a
fact). It then writes `04-release/plan.md` from
[templates/plan.md](templates/plan.md) by
[references/plan.md](references/plan.md):

- what ships and the versioned artifacts;
- the pre-flight;
- every step with its command and the read-only check of its result;
- the rollout mode, progressive or straight, by
  [references/rollout.md](references/rollout.md);
- the **rollback triggers** with this project's thresholds and
  commands;
- the migrations, each one an expansion;
- the toggles;
- the watch;
- the stop list.

The plan is complete before the play, because the play authorizes
exactly what the plan says.

## Step 1 — the play

**Everything only he can run goes in one message, with one
PushNotification.** That covers:

- the pre-flight items: a secret's value, an account, DNS or TLS, an
  infrastructure apply the CI cannot run;
- every action the harness's classifier reserves for him: an apply,
  writing a secret's value, reading a credential or a person's data,
  dispatching an agent whose job is a production deploy;
- any command the plan names that the guard denies, as a verbatim line
  for the allow file;
- last, **the play line**:

```
! printf 'merge-from %s  # release <slug> <date>\n' <audited head of feat/<slug>> >> .claude/hooks/irreversible.allow
```

Each command is ready to run and final when sent. A secret goes
through a scratchpad script that pipes the value from where it lives,
so the message never holds one. The play authorizes the audited head
and the release's own fixes, because they descend from it and pass
the local-CI signoff. A project that wants every fix to ask writes
`merge-head` instead; the reference explains the difference.

He runs the lines and says go. His words, verbatim, are the play. If
a goal of his already authorized this release by name ("deploy to
production and merge into main, following the standard procedure"),
the goal is quoted as his words, and the play line is still his to
run, because the session cannot write the allow file. Then the
session reads back each item with its read-only check, including
`cat .claude/hooks/irreversible.allow`, which the guard allows. It
writes the trace line and the `rulings.md` line
(`<date> · release · play · ruled: go · "<his words>"`). While he
works through the list, the session goes on with whatever does not
depend on it: the PR into `main` and its signoff. A pre-flight item
still missing parks the release before the merge, with one line
saying which.

## Step 2 — main

1. Open the PR from `feat/<workstream>` into `main`. The body carries
   the plan's summary and the play, verbatim.
2. Confirm the local-CI signoff on its head sha (role 13). The
   execute stage's queue posted it. If it is missing, run the
   project's local CI in a clean worktree at that head, which posts
   it. Never post a status by hand: the guard denies that.
3. When the required checks are green, merge:
   `gh pr merge <n> --merge --match-head-commit <head>`. It is a merge
   commit. `--match-head-commit` makes the merge refuse a head that
   moved after the check. The guard reads the PR's base and head and
   lets the merge through only when the head is the one the play
   authorized. An "ask" from the guard here means the head is not the
   one the play named: the session stops, it does not route around it.
4. Record the merge sha.

**The versions.** Right after the merge, dispatch one
`release-scribe (Sonnet 5.5, medium)` per versioned artifact the
doctrine names, all in one message. Each one gets:

- the artifact's name, repo, paths and tag prefix;
- the merge sha;
- the plan's path;
- the doctrine folder, for its commit convention;
- `04-release/notes/<artifact>.md` and `.json`.

Each derives the version and writes the notes, and creates nothing. A
scribe with no valid version is dispatched once more. After a second
failure the session derives it by the same rules and never guesses.
When an `R.n` changes the sha that goes to production, the scribes
run again on the new sha.

## Step 3 — staging

The doctrine's staging deploy of the merge sha runs: the CI on the
merge, a staging branch fast-forwarded, or a command. The session
follows it (`gh run watch`, or a wakeup sized to the run) and saves
the summary under `proof/`. It then reads, read-only, that staging
serves that sha (the build sha the health endpoint exposes, or the
image digest). It also confirms each migration ran and that the
previous revision still serves through it, by
[references/rollout.md](references/rollout.md). The plan also names
any rollback path that has never run. That path runs once here, back
and forward, before production relies on it.

## Step 4 — the verifier on staging

Dispatch one `verifier (Sonnet 5.5, high)` per entry in prove mode,
all in one message. Each one gets:

- `pack-release` to read first;
- the entry's acceptance files and the commit that added them (the
  locked journeys);
- staging's URLs and the test actors the doctrine names for staging,
  never a production actor and never a token;
- the sha it must find deployed;
- `04-release/proof/verify/<entry>/` as its evidence folder.

The checks that proved the entry on the local stack now run on the
real environment: every screen in a browser, every side effect read
back, and the PII canary over staging's logs. The lines stage 4 could
not reach locally, and staging reaches, run here too. The
failure-mode block stays in stage 4. FAIL or INCONCLUSIVE is a red.

**A red is read before anything:** the failing case, its log, the
environment.

- **A red caused by the environment** (a missing pre-flight item, a
  flaky provider) is traced, and parked when it is his.
- **A red in the code becomes entry `R.n`.** The session writes the
  brief: the failure, the evidence, the design section it breaks. It
  runs the entry through
  `${CLAUDE_SKILL_DIR}/../../workflows/exec-entry.js` with `main` as
  its base, merges the PR into `main` exactly as in step 2, and
  returns to step 3.
- **A defect in the checks themselves** (not the product): the
  entry's verifier runs them from the station against staging until
  they pass, before the PR. That costs one deploy cycle instead of
  one per attempt.

The third red on the same step stops the release.

## Step 5 — production

The previous revision, job image and front release are recorded
first: they are the rollback target. Production deploys the artifact
staging proved, the same digest, never a rebuild. It deploys the way
the doctrine says: a workflow the session dispatches or follows, or a
command the settings allow. Migrations run before the new code
serves, and they only expand. The mode comes from the plan, by
[references/rollout.md](references/rollout.md):

- **Progressive, where the platform allows it** (role 19: a tagged
  revision, a traffic split, a canary):
  1. Deploy the candidate with no traffic, under a tag.
  2. The smoke runs on the tag URL. It covers health, the sha and
     digest served, and a `verifier (Sonnet 5.5, high)` running the
     read-only journeys only.
  3. Shift the traffic. When production gives a signal (≥ 100 requests
     expected in the bake window), shift a share first and bake it
     against the previous revision in the same window. When it does
     not, go to 100% at once and write the bake's verdict as "no
     signal".
  4. Promote to 100%. Clear any sticky split.
- **Straight, otherwise:** deploy, then the smoke run (health, the sha
  served, the verifier on the read-only journeys), then a bake against
  the absolute thresholds.

**The rollback triggers are automatic.** They are written in the plan
before the play. When one fires, the session acts in this order:

1. Run the rollback the plan names: traffic back to the previous
   revision, the job's image back, the front's release back. It is
   never a down migration.
2. Verify read-only that production serves the previous revision.
3. Trace it.
4. Build the fix as `R.n`, merge it into `main`, and prove it on
   staging (steps 3–4).
5. Ask him before the new artifact goes to production, because a new
   artifact after a rollback is on the stop list.

The default triggers:

- the candidate's smoke is red, or its digest is not the release's:
  it is never promoted;
- the smoke after the shift is red;
- the 5xx ratio is above 2× the previous revision's and above 1%;
- p95 latency is above 1.5× for 10 minutes;
- start failures or memory kills;
- an alarm the release touches fires;
- a job run on the new image fails.

The doctrine's values override these defaults.

## Step 6 — the alarms

Read each alarm's first evaluation once, after the bake. The alarms
are the ones the design's observability document names, plus the
existing ones the release touches. By then, the platform has
evaluated them. Each state is written exactly as read: OK with data,
"no datapoints", firing, or "not evaluated yet". "No datapoints" is
never written as healthy. A firing alarm the release touches is a
rollback trigger. Nothing waits past the bake: from here the alarms
watch on their own and notify whoever they notify.

**The watch.** Some proofs have an hour of their own: the first
scheduled run, or the first real data. Each one is a wakeup at that
hour, by [references/watch.md](references/watch.md). A proof more than
48 h out becomes a pendency with an owner.

## Step 7 — done

1. Tag each versioned artifact on the released sha with its version,
   and create the release with its notes, as the doctrine says.
2. Write `blueprint/release/release.json` (schema:
   `${CLAUDE_SKILL_DIR}/../../blueprint/schema/release.md`). The play
   is the `ask`, with `words` set to his words.
3. Build and publish with
   `node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>`.
4. Write the numbers line in the trace, by
   [templates/trace.md](templates/trace.md).
5. `.state.md` → `stage: close`, once no watch row is still waiting.
   Until then, it stays `stage: release` with the hours of the
   waiting rows.
6. Commit the workstream folder and send one **PushNotification**:
   what is in production, the versions, the pendencies with their
   owners.

## Step 8 — the stage report

Follow `claude/docs/stage-report.md`: video, then slides, then the
blueprint, in one message by [templates/report.md](templates/report.md).
A watch row read after the report updates `release.json` and the
blueprint. The video and the slides are not redone.

## Migrations: expand in this release, contract in a later one

Every migration in a release only **expands**: a new table, a
nullable column or one with a constant default, an index built
concurrently, a constraint added `NOT VALID` and validated later. The
previous revision must keep working on the expanded schema, because
that is what makes a rollback just a traffic move. A **contract**
(drop, rename, type change, `NOT NULL` on what the previous release
reads) ships at least one release after no deployed code reads the
old shape, and it is on the stop list. Each migration sets a short
lock timeout and a statement timeout. A failed migration leaves the
old revision serving and stops the release. No down migration ever
runs in production: the guard denies it. The recipes are in
`pack-release`.

## Release toggles

A toggle the plan names is a config value with its own change. Off
is the old behavior. Stage 4 tested both states. The plan gives each
toggle its state at release, who flips it, and when. A flip the plan
names is a step like any other. A flip it does not name is outside
the plan, so the session asks. An **ops kill switch** (an e-mail sink,
a paused schedule) flips on a red as a rollback action, without a
deploy. Every toggle carries its removal task, and the report lists
it for the close. A release toggle lives a week or two.

## When the session stops and asks

The session stops and asks on this list, and only on it. One question
goes through the question tool, with one PushNotification, and
whatever does not depend on the answer goes on:

- a failed migration (the old revision keeps serving);
- a contract migration, or a rollback the plan marks not safe for data;
- a deletion or replacement of a stateful resource in the production
  diff;
- anything the guard asks. A guard "deny" is never retried another way;
- anything outside the plan: a command, an environment, an artifact or
  a toggle it does not name;
- a new artifact for production after a production rollback;
- the third red on one step;
- a pre-flight item found missing (a secret, IAM, DNS, TLS).

His answer is a ruling: it goes to `rulings.md` and the trace,
verbatim.

## Hotfix

`/stage-release <slug> hotfix`, while `.state.md` is not `closed`,
handles a regression found in production. His invocation is the play.

1. Write the trace line with what was seen and where.
2. Cut `hotfix/<slug>` from `main`.
3. Build the fix as `R.n` through exec-entry, with that branch as its
   base.
4. Merge the PR into `main` behind the signoff. The play's
   `merge-from` covers it because it descends from the audited head.
5. Run steps 3 to 7.

A hotfix the session starts on its own, from the watch, asks him
first, because it is a new artifact. After `closed`, a regression is
a new demand: say so and stop.

## How to write

- Say what you mean, in literal sentences with concrete values.
- A trace line carries the command's summary and the file under
  `proof/`, never the whole output.
- Every agent named carries its model and effort.
- No token, password or key goes in a rule, a prompt, the trace or a
  PR body.

## Resuming

Everything is in files. Read `.state.md`, `plan.md`, `trace.md`,
`proof/` and `entries/`. The first plan step with no trace line is
where to resume. A CI run, a deploy or a bake in flight is followed
from where it is, never redone. A candidate left at 0% is either
smoked or removed by the plan's rollback, never promoted unread.

## Boundaries

- The session writes no product code and reviews none. A fix is an
  entry through the stage-4 pipeline.
- It deploys only the way the doctrine says, and nothing before the
  play.
- It never pushes straight to `main` or a protected branch, never
  force-pushes, and never rewrites a published tag.
- It never edits the settings, the guard or its allow file. Those are
  his.
- Frictions worth learning from go to the workstream's
  `dreaming-notes.md` on the spot.
