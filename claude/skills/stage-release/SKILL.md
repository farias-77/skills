---
name: stage-release
description: Conducts stage 5 (Release) — takes the audited feature branch to production through the project's own delivery pipeline, with one question to the user. The session (Opus 5.5, medium) writes the release plan from the audit and the doctrine's delivery standard; merges the feature branch into staging on its own; follows the CI while it deploys staging and runs the real suite; a red is fixed as an entry R.n through the stage-4 pipeline (builders, gate, panel, judge) and staging runs again; the versions and notes come from one release-scribe (Sonnet 5, high) per versioned artifact; then the session opens the release PR and asks the user once, "vai?"; on his word it merges, follows production through the CI (same artifact, read-only checks, the doctrine's automatic rollback), reads every proof the audit deferred at its hour, and calls him once at the end with everything in prod. Also runs a hotfix the same way while the workstream is not closed. Use when a workstream's .state.md says stage release, to resume a release in progress, or with `hotfix` for a regression found in production.
disable-model-invocation: false
argument-hint: "<workstream-slug> [hotfix]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Bash
---

# Stage 5: Release

Stage 4 left `feat/<workstream>` merged, gated, reviewed and audited.
This stage puts it in production and reports once. **How** code
reaches each environment is the project's: the engineering doctrine
the project's `CLAUDE.md` names has a delivery standard (the branches,
what the CI does on each, the staging suite, the production checks,
the automatic rollback, the command that shows the production diff).
The session follows it; it never deploys by hand what the doctrine
says the CI deploys.

**One question, at the end of staging.** Everything before it runs on
its own: the audit's approval already authorized staging. When staging
is green, the session opens the release PR and asks the user one
thing: "vai?". Production waits for his word and for nothing else.

| Word | What it is here |
|---|---|
| **the plan** | `04-release/plan.md`: what ships, the versions, the pre-flight only the user can do, the staging and production steps as the doctrine defines them with the read-only check of each, the rollback, the proofs deferred to production with their hour |
| **staging** | the environment the doctrine promotes to before production (a project may call it alpha) |
| **entry `R.n`** | a fix built through the stage-4 pipeline (`exec-entry`): builders, gate, panel, judge. The session never writes or reviews code |
| **the watch** | the proofs the audit deferred to production, each with an hour; the stage does not close before every one is read |

The session is **Opus 5.5 at medium effort**. It conducts directly:
the steps are sequential, so there are no workers. Every reply that
dispatches or waits on an agent or a run carries a status table (what
· state), read from the harness. A wait on something outside (the CI,
a deploy, a proof's hour) ends the turn on a wakeup sized to what it
waits for; never a loop that checks early.

## The pattern

```
0. Plan       preconditions → 04-release/plan.md from the audit and the doctrine's delivery standard
1. Staging    PR feat/<ws> → staging branch, CI green → merge (the session's) → the CI deploys and runs
              the staging suite → the session follows it
              red → entry R.n through exec-entry → merge into feat/<ws> → staging again · third red stops
2. Version    one release-scribe (Sonnet 5, high) per versioned artifact, dispatched in parallel
3. The ask    the release PR staging → main (notes, versions, the production diff, the watch)
              → ONE question to the user: "vai?"
4. Production merge → the CI deploys the same artifact → the doctrine's read-only checks → the session follows
              red → the doctrine's rollback → entry R.n → staging → the ask again
5. Watch      every deferred proof at its hour → read → traced · a regression → hotfix
6. Close      release.json → the blueprint's Release tab → tags → .state.md → one PushNotification
```

## Preconditions

`.state.md` says `stage: release`; `03-execution/audit.md` is approved
and `blueprint/execution/execution.json` has `closed` set; every entry
is merged or ruled at the audit. Missing: halt, back to stage 4.

```
designs-root/<workstream>/04-release/
├── plan.md        # the plan: what the session will do, in order
├── trace.md       # one line per step as it ends, `date -u`
├── notes/         # the release notes, one file per versioned artifact (the scribes)
├── entries/R.<n>/ # the fix entries' run.json and evidence
└── proof/         # the CI summaries, the checks' output, the watch readings
```

## Step 0 — the plan

Read the audit, the execution record, the design's rollout and
observability documents, and the doctrine's delivery standard. Write
`04-release/plan.md` from [templates/plan.md](templates/plan.md) by
[references/plan.md](references/plan.md): what ships (the entries and
amendments), the versioned artifacts, the pre-flight (what only the
user can do: a secret, a DNS record, an account), each staging and
production step as the doctrine defines it with the command the
session runs and the read-only check of its result, the rollback, the
watch with absolute hours, and where the session stops. A pre-flight
item still missing parks the release before step 1; the session says
so in one line.

## Step 1 — staging

Open the PR from `feat/<workstream>` to the staging branch the
doctrine names; when its CI is green, merge it (the audit authorized
this). The CI deploys staging and runs the staging suite; follow it
(`gh run watch`, or a wakeup sized to the run's usual duration) and
save its summary to `proof/`.

A red is read before anything: the failing case, its log, the
environment. A red caused by the environment and not the code (a
missing pre-flight item, a flaky provider) is traced and, when it is
the user's, parked. A red in the code becomes **entry `R.n`**: the
session writes its brief (the failure, the evidence, the design
section it breaks), runs it through
`${CLAUDE_SKILL_DIR}/../../workflows/exec-entry.js` exactly as stage 4
does, merges it into `feat/<workstream>` through the queue, and
promotes to staging again. The third red on the same step stops the
release and calls the user with the three traces.

## Step 2 — the versions

Dispatch one `release-scribe` (Sonnet 5, high) per versioned artifact
the doctrine names (one repo, or several deployables in one repo), all
in one message, each with: the artifact's name, repo, paths and tag
prefix; its sha on the staging branch; the plan's path; the doctrine
folder (its commit convention); and its notes file under
`04-release/notes/`. Each derives the version from the commits and
writes the notes; nothing is created. A scribe that returns no valid
version is dispatched once more; a second failure is derived by the
session by the same rules, never guessed. A commit outside the
convention is traced.

## Step 3 — the ask

Open the release PR from the staging branch to `main` with the notes,
the versions, the production diff (the command the doctrine names for
it, its output attached) and the watch list. Then ask the user **one
question** through the question tool: what goes, the staging proof
line, the production diff in one line, the rollback, and "vai?" —
answers "vai" (recommended when staging is green) and "não agora" with
what he wants first. His words go to the trace and to `rulings.md`.
"Não agora" stops here; his reasons become entries or a new ask.

## Step 4 — production

On "vai": merge the release PR. The CI deploys to production the same
artifact staging proved, runs the doctrine's read-only checks and, on
a red, its automatic rollback. Follow it, save the summary to
`proof/`, and verify with a read-only call of your own that production
answers what the checks say. Tag each versioned artifact on the merge
sha with its version and create the release with its notes, as the
doctrine says.

A red in production: confirm the rollback ran and production is back
on the previous version (read-only), trace it, build the fix as entry
`R.n`, and go back to step 1. The user is asked again at step 3: a
new artifact is a new "vai".

## Step 5 — the watch

By [references/watch.md](references/watch.md): every proof the audit
deferred to production is read at its hour, with a wakeup; a
regression is a hotfix.

## Step 6 — close

When every watch row is read (or listed as a pendency with an owner)
and no fix is open: `blueprint/release/release.json` (schema:
`${CLAUDE_SKILL_DIR}/../../blueprint/schema/release.md`), the build
(`node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>`)
and publish, `.state.md` → `stage: close`, the commit of the
workstream folder, and one **PushNotification**: everything in
production, the versions, the pendencies with their owners.

## Hotfix

`/stage-release <slug> hotfix`, while `.state.md` is not `closed`: a
regression found in production. The trace line with what was seen and
where; `hotfix/<slug>` from `main`; the fix as entry `R.n` through
exec-entry with that branch as its base; the PR into `main` with its
notes; the ask ("vai?"); production as in step 4; then `main` merged
back into the staging branch and into `feat/<workstream>` if it is
still open. After `closed`, a regression is a new demand: say so and
stop.

## How to write

Say what you mean. Literal sentences, concrete values. A trace line
carries the command's summary and the file under `proof/`, never the
whole output. Every agent named carries its model and effort.

## Resuming

Everything is in files. Read `.state.md`, `plan.md`, `trace.md` (the
first plan step with no trace line is where to resume), `proof/` and
`entries/`. A CI run in flight is followed from where it is; never
redone.

## Boundaries

The session writes no product code and reviews none: a fix is an
entry through the stage-4 pipeline. It deploys only the way the
doctrine says, and nothing to production before the user's "vai".
No force-push to `main` or the staging branch; no rewriting of a
published tag. Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot.
