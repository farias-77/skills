---
name: stage-release
description: Conducts stage 5 (Release) of the pipeline under one /goal. It merges the finished front (feat/<slug>) into main under the user's authorization, follows the CI's staging deploy and smoke, tags vX.Y.Z so the CI promotes the same image to production with a smoke and a 15-minute watch that rolls back on its own, and closes with its report (video, deck, explainer). A red gets one fix entry through the stage-4 pipeline, then it stops. It stops for the user only on its stop list. The short route and the hotfix follow the same path from lets-cook. The session runs on Opus 5.5, high. Use when a front's .state.md says stage release, or to resume a release by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Skill, Bash
---

# Stage 5: Release

## The bar

1. From the `/goal` to production without him, except an irreversible
   step nobody planned.
2. Production runs the image staging ran. A red production goes back
   to the previous tag by itself, through the CI.
3. His authorization covers one front and dies at its tag.
4. A red gets one fix. A second red stops.
5. The report (Video, Deck, Explainer) is finished before the stage
   closes.

## The team

| Who (model, effort) | Does |
|---|---|
| you, the session (Opus 5.5, high) | every step below; you never write or review code |
| the CI (GitHub Actions) | push to `main`: staging deploy + smoke. Tag `v*`: the same image to production, smoke, 15-minute watch, rollback, then the GitHub release |
| the project's signoff command (`claude/scripts/local-ci.sh` when it names none) | the project's whole gate on this machine or a cloud VM, in a fresh worktree; the only writer of the required `local-ci` status, posted under the bot identity on green |
| the stage-4 cast through `exec-entry-workflow.js` mode `fix` | an `X.n` fix: `builder-backend` · `builder-frontend (Opus 5.5, medium)`, `exec-gate (Sonnet 5.5, low)`, `reviewer (Opus 5.5, high)`; no QA unless the fix asks for one (`qa: 'backend'` when it touches auth, permissions or personal data) |
| `scout (Haiku 5.5, medium)` | anything you need to look up |
| `video-builder (Sonnet 5.5, high)` · `slides-builder` · `artifact-builder (Sonnet 5.5, medium)` | the report's tabs; `video-builder` also starts the close's video for users |

## The flow

```
0 open        canary · preconditions · the authorization line read back · the /goal → he pastes it
1 main        main moved? merge main into feat + local CI · local-ci green on the head · merge
2 staging     the CI deploys and smokes · green → peers told, the users' video starts recording
3 tag         vX.Y.Z on the merge, notes from the stories → push (the authorization is spent)
4 production  the CI: same image → smoke → 15-min watch → GitHub release · red → rollback by itself
5 close       trace · telemetry · report (3 tabs) · cleanup · .state.md → close · the message
```

Read [references/release.md](references/release.md) before step 1. It
holds the trunk, the authorization, how fronts take turns on `main`, the
smoke and the watch, the hotfix and the legacy repos. Read
[references/migrations.md](references/migrations.md) when `plan.md`
lists a migration.

```
<designs-root>/<slug>/04-release/
├── plan.md      written at execute, during his use (templates/plan.md)
├── trace.md     one line per step as it ends, `date -u` (templates/trace.md)
└── notes.md     the tag's annotation
```

## Unattended

Inside the `/goal` nothing waits for him but the stop list. A wait on
the CI ends the turn on a `ScheduleWakeup` sized to it (a staging deploy
~20 min, production plus the watch ~35 min), never on a question. Keep
`trace.md` current: it is your checklist and your resume point.

## Step 0 · Open

1. **The house rules.** Read the file that
   `realpath ${CLAUDE_SKILL_DIR}/../../../CLAUDE.md` prints and run its
   Open: the canary.
2. **Preconditions.** `.state.md` says `stage: release`; the execute
   recorded his ok; `04-release/plan.md` exists; the PR
   `feat/<slug>` → `main` is open and ready. Missing: stop and send him
   back to the stage that owns it.
3. **The authorization.** `cat .claude/hooks/irreversible.allow` and
   find a live `auth release <slug>` line (the execute's ok handed him
   the command). Missing or expired: the message below carries, first,
   the exact command for him to run:
   `! .claude/hooks/authorize.sh release <slug> feat/<slug>@<the head he said ok to>`.
4. **Coordination.** Edit your line in `_coordination.md`: stage
   `release`, branch, this session's name.
5. **The `/goal`.** Fill it from `plan.md` and end the turn:

```
/goal Release <slug> with the stage-release skill, without asking me anything outside its stop list.
Authorized in this release: the merge of feat/<slug> into main, its fix/<slug>/X.n fixes, one tag
vX.Y.Z, and these known irreversible steps from plan.md: <list, or "none">.
Goes live for real people: <from plan.md, or "nothing">.
Done when: the tag is in production with the smoke and the 15-minute watch green, the GitHub release
exists, the report's three tabs are published, and I got the notification with the link and the next command.
```

The irreversible steps the `/goal` names were his call already (in
`plan.md`); they never stop the release. Only what it does not name
does.

## Step 1 · Into main

1. **Take the turn.** One front at a time sits between its merge and
   its green staging. GitHub is the truth: a staging deploy running on
   `main` means another front is there; wait it out on a wakeup. Tell
   the release sessions named in `_coordination.md` that you are
   merging (`SendMessage`). A hotfix that says it goes first, goes
   first (references/release.md, "Taking turns").
2. **`main` moved since his ok?** Merge `origin/main` into
   `feat/<slug>` (a merge, never a rebase), renumber the migrations if
   the project has a command for it (`make restamp`), push, and run the
   signoff command on the new head. A red
   here is an `X.n` on `feat`, exactly as at execute.
3. **The merge.** The PR's head has `local-ci` green, and the code
   owner's approval when the PR touches the gate's paths (asked at the
   execute's ok). Then
   `gh pr merge <n> --merge --match-head-commit <head>`. The guard lets
   it through when the head is, or descends from, the authorized sha.
   A guard denial is a stop: record it and ask, the authorize command
   ready.

## Step 2 · Staging

The push to `main` runs the staging deploy and its smoke. Wake when it
should be done and read the run (`gh run view <id>`); never poll.

- **Green:** tell the peers `main` is free. Dispatch the close's video
  for users now, in the background: `video-builder (Sonnet 5.5, high)`
  with `stage-close/references/user-video.md` and the stories; it
  records in staging while you go on (on the short route only when a
  screen users see changed). Write its agent id in `.state.md` as
  `video:`.
- **Red:** the red rule below.

## Step 3 · The tag

1. **Version.** A front is a minor, the short route and a hotfix a
   patch, a major only on his word. No `v*` tag yet: `v1.0.0`.
2. **Notes**, in `04-release/notes.md`: the version and date, then one
   line per story (id + what changed for its user), then what goes
   live for real people. The CI publishes them with the release.
3. `git tag -a vX.Y.Z <the merge sha on main> -F 04-release/notes.md`,
   then `git push origin vX.Y.Z`. The guard spends the authorization on
   this push; the same tag pushed again still passes. The CI holds the
   tag until the previous tag's watch ends.

## Step 4 · Production

The tag runs production: the image staging ran, the smoke, the
15-minute watch, then the GitHub release. A red smoke or watch moves
the traffic back to the previous tag, alarms him by email, and
creates no release. Wake when it should be done and read the run.

- **Green:** the release exists. Go to step 5.
- **Rolled back:** the red rule.

## The red rule: one fix, then stop

| Red | What happens |
|---|---|
| staging (deploy, migrate, smoke) | one `X.n`: `exec-entry-workflow.js` mode `fix` on `fix/<slug>/X.n` from `main` (the `reviewer (Opus 5.5, high)` always) → PR → `local-ci` → merge (the authorization covers it) → staging again |
| `local-ci` on the PR at step 1 | one `X.n` on `feat/<slug>`, as at execute |
| production rolled back | one `X.n` on `fix/<slug>/X.n`, its PR green on `local-ci` → **ask** him before it goes anywhere: the old line died at the tag, so its merge and its patch tag need his new `! .claude/hooks/authorize.sh release <slug> fix/<slug>/X.n@<sha>` → merge → staging and smoke → a patch tag |
| the environment (runner, network, a quota) | run it again once; it does not count. Never a production `migrate`: that is a stop |
| a second red of code, anywhere | stop |

An `X.n` runs exec-entry by `scriptPath`; when the Workflow tool refuses
the kit's path, copy it into `<slug>/_run/`, check both `sha256sum`s
match, and run the copy.

## The stop list (only these stop)

| Stop and ask | Why |
|---|---|
| a contract migration (drop, rename) or deleting data not named in the `/goal` | cannot be undone |
| a red `migrate` in production: never run again by you | production's schema may be half-applied |
| turning on an effect for real people the `/goal` did not name | real people |
| a new paid resource, a DNS switch | cost and cutover |
| a new production deploy after a rollback | a real incident: he decides |
| a second red of code | it does not loop |
| a guard denial | something is outside what he authorized |

A stop is a `PushNotification` plus the question tool: what happened,
the evidence in one line, the options with yours first, and the
`! authorize` command ready when "yes" needs one. Everything that does
not depend on the answer goes on (the report's pieces, the trace).

## Step 5 · Close

1. **Trace and numbers.** `trace.md` complete; run
   `node claude/scripts/telemetry.mjs <slug> --stage release --ws <designs-root>/<slug> --out -`.
2. **The report, finished before the close.** Dispatch the builders in
   one message, in the background, with the stage's files and
   `report/release/`, as `claude/docs/stage-report.md` describes:

| Tab | Builder | Brief |
|---|---|---|
| Video | `video-builder (Sonnet 5.5, high)` | `main` → staging → tag → production, the smokes and the watch, 30–45 s |
| Deck | `slides-builder (Sonnet 5.5, medium)` | the version and notes, the smokes, a rollback if one happened, what went live for real people, the stage's numbers |
| Explainer | the report template from `trace.md`; with an incident, `artifact-builder (Sonnet 5.5, medium)` draws it | the release's timeline |

   When they return, check every number against `trace.md` and the CI
   runs, run
   `gitleaks dir <designs-root>/<slug>` (or `make gitleaks dir=…` when gitleaks is not on PATH; a finding stops the publish),
   and publish to the front's link with the label "release closed".
   The short route and the hotfix stop at step 4 (`lets-cook` §7): their
   Release tab is built and published at the short close, by the table
   in `lets-cook` §8, because their link exists only from then.
3. **Cleanup.** Remove what this stage created: the `X.n` worktrees and
   their stacks (`claude/scripts/cleanup.sh <slug> --check` shows what
   is left; the full sweep is the close's).
4. **Records.** `.state.md` → `stage: close`. Your line in
   `_coordination.md`: "out in vX.Y.Z". Commit the workstream folder.
5. **The message**, with a `PushNotification`:

| | |
|---|---|
| In production | vX.Y.Z, the GitHub release's link |
| The link | the front's report, Release tab |
| Watch | green, or the rollback and what came after |
| Next | `/clear`, then `/stage-close <slug>` |

## Resuming

`/stage-release <slug>`: run the canary, then read `.state.md`,
`trace.md` and the CI runs of `main` and of the tags. The trace's last
line is where you are; never resume from memory.
