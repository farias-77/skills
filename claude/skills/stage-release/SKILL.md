---
name: stage-release
description: Stage 5 of the pipeline, under one /goal. Takes the finished feat/<slug> to production safely - up to date with main, merged, staging deployed and smoked by the CI, a tag that promotes the same image to production with a smoke and a 15-minute watch that rolls back on its own - and stops for him only on its stop list. A red gets one fix, a second red stops. Use when a workstream's .state.md says stage release, or to resume a release by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Workflow, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Skill, Bash
---

# Stage 5 · Release

Release takes what he already used and said ok to, and puts it in
production the way the project's `operations.md` says: through staging,
then the same image to production, watched, with a rollback written in
advance. The session never writes or reviews code; it moves the work
through the gates, waits on the CI without polling, and stops only for
what cannot be undone.

## The bar

The stage is done when every line holds:

1. The tag is in production, the image staging ran, with the smoke and
   the 15-minute watch green, and the GitHub release exists.
2. Nothing reached production that he did not authorize in the `/goal`;
   a step outside it stopped and asked.
3. A red got one fix at most; a second red stopped.
4. `trace.md` has one line per step, and the report's Explainer is
   published.

## The flow

```
/stage-release <slug> → opening: preconditions + the /goal
  1 main: take the turn → up to date → merge
  → 2 staging (the CI deploys and smokes)
  → 3 the tag vX.Y.Z, notes from the stories
  → 4 production (the CI: same image → smoke → 15-min watch → release · red → rollback by itself)
  → 5 report ∥ cleanup → /clear, /stage-close <slug>
  a red anywhere → one X.n fix → again · a second red → stop
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| every step | you (Opus 5.5, medium) | `trace.md`, the merge, the tag, the notes |
| staging, production | the CI | the deploys, the smokes, the watch, the rollback, the GitHub release |
| the whole gate | the project's signoff command | `local-ci` on the head that merges |
| an `X.n` fix | `exec-entry-workflow.js` mode `fix`: the builders, `exec-gate`, the `reviewer`; a QA when it touches auth, permissions or personal data | the fix, merged |
| facts | `scout` (Haiku 5.5, high) | what you need to look up |
| report | the Explainer from the template with `trace.md`; `artifact-builder` (Sonnet 5.5, medium) when there was an incident; video and slides only when he asks | the Release tab |

## What you read

| File | When |
|---|---|
| the project's `operations.md` (its standards folder) | at the opening: its environments, delivery, rollback and alarms win over the kit's defaults |
| [references/release.md](references/release.md) | before step 1: the trunk, taking turns on `main`, the smoke and the watch, the hotfix, legacy repos |
| [references/migrations.md](references/migrations.md) | when `plan.md` lists a migration |
| `04-release/plan.md` | whole, at the opening |

## Files

```
<designs-root>/<slug>/04-release/
├── plan.md      written at execute, during his use (template: templates/plan.md)
├── trace.md     one line per step as it ends, `date -u` (template: templates/trace.md)
└── notes.md     the tag's annotation
```

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..`, written as `kit:`
   in `.state.md`.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open: the
   pulls, who else is working.
3. **Preconditions.** `.state.md` says `stage: release`; the execute
   recorded his ok; `04-release/plan.md` exists; the PR `feat/<slug>` →
   `main` is open and ready. Missing: stop and name the stage that owns
   it.
4. **Coordination.** Your line in `_coordination.md`: stage `release`,
   branch, this session's name.
5. **The goal**, filled from `plan.md`:

```
/goal Release <slug> with the stage-release skill, without asking me anything outside its stop list.
Authorized in this release: the merge of feat/<slug> into main, its fix/<slug>/X.n fixes, one tag
vX.Y.Z, and these known irreversible steps from plan.md: <list, or "none">.
Goes live for real people: <from plan.md, or "nothing">.
Done when: the tag is in production with the smoke and the 15-minute watch green, the GitHub release
exists, the Release tab is published, and I got the notification with the link and the next command.
```

A wait on the CI ends the turn on a `ScheduleWakeup` sized to it (a
staging deploy about 20 minutes, production plus the watch about 35),
never on a question. `trace.md` is your checklist and your resume
point: one line per step as it ends.

## 1 · Into main

1. **Take the turn** on `main` by release.md, "Taking turns on main".
2. **Up to date, right before the merge**, by the house rule: fetch;
   when `origin/main` has commits `feat/<slug>` lacks, merge it in, run
   the project's restamp, push, run the signoff command on the new
   head, fetch again. With a cloud environment these run in cloud
   sessions and this machine only fast-forwards `feat` and posts the
   status (stage-execute's `references/cloud.md`). A red here is an
   `X.n` on `feat`.
3. **The merge.** The head has `local-ci` green, and the code owner's
   approval when the PR touches a gate path. Then `gh pr merge <n>
   --merge --match-head-commit <head>`. When Claude Code refuses it,
   send him the PR link: the merge is his click, and that wait is his.

## 2 · Staging

The push to `main` runs the staging deploy and its smoke. Wake when it
should be done and read the run (`gh run view <id>`). Green: tell the
peers `main` is free. Red: the red rule.

## 3 · The tag

1. **Version.** A workstream is a minor, the short route and a hotfix a
   patch, a major only on his word. No `v*` tag yet: `v1.0.0`.
2. **Notes** in `04-release/notes.md`: the version and date, one line
   per story (what changed for its user), then what goes live for real
   people. The CI publishes them with the release.
3. `git tag -a vX.Y.Z <the merge sha on main> -F 04-release/notes.md`,
   then `git push origin vX.Y.Z`; a refusal goes to him the same way.
   The CI holds the tag until the previous tag's watch ends.

## 4 · Production

The tag runs production: the image staging ran, the smoke, the
15-minute watch, then the GitHub release. A red smoke or watch moves
the traffic back to the previous tag by itself, alarms him, and
creates no release. Wake when it should be done and read the run.
Green: step 5. Rolled back: the red rule.

## The red rule: one fix, then stop

| Red | What happens |
|---|---|
| staging (deploy, migrate, smoke) | one `X.n`: exec-entry mode `fix` on `fix/<slug>/X.n` from `main` (in a cloud session when the project has one) → PR → `local-ci` → merge → staging again |
| `local-ci` on the PR at step 1 | one `X.n` on `feat/<slug>`, as at execute |
| production rolled back | one `X.n`, its PR green on `local-ci` → **ask** him before it goes anywhere → merge → staging → a patch tag |
| the environment (runner, network, a quota) | run it again once; it does not count. A production `migrate` is never run again: that is a stop |
| a second red of code, anywhere | stop |

## The stop list

| Stop and ask | Why |
|---|---|
| a contract migration (drop, rename) or deleting data the `/goal` did not name | cannot be undone |
| a red `migrate` in production | production's schema may be half-applied |
| an effect for real people the `/goal` did not name | real people |
| a new paid resource, a DNS switch | cost and cutover |
| a new production deploy after a rollback | a real incident: he decides |
| a second red of code | it does not loop |

A stop is a `PushNotification` plus the question tool: what happened,
the evidence in one line, the options with yours first.

## 5 · The report and the close

1. **Trace and numbers.** With a `tracker:` line in `.state.md`,
   `notion-tracker released <tag>` (or `stopped <why>`). `trace.md`
   complete; `node <kit>/scripts/telemetry.mjs <slug> --stage release
   --ws <workstream> --out -`.
2. **The report**, as `<kit>/../docs/stage-report.md` describes. The
   Explainer is the release's timeline from `trace.md`; with an
   incident, `artifact-builder` draws the incident. Ask the close's
   question (also make: Video · Deck) and dispatch what he picks:
   `video-builder` (Sonnet 5.5, high) `main` → staging → tag →
   production, 30–45 s; `slides-builder` (Sonnet 5.5, medium) the
   version and notes, the smokes, a rollback if one happened, what went
   live. Check every number against `trace.md` and the CI runs,
   `gitleaks dir <workstream>`, publish labelled "release closed". The
   short route and the hotfix stop at step 4: their Release tab is
   published at the short close (`lets-cook`).
3. **Cleanup.** The `X.n` worktrees and their stacks
   (`<kit>/scripts/cleanup.sh <slug> --check` shows what is left; the
   full sweep is the close's).
4. **What the runbook lacked.** A step you had to work out that the
   project's `operations.md` does not say is a `[standards]` line in
   `dreaming-notes.md`.

Then `.state.md` → `stage: close`, your line in `_coordination.md` "out
in vX.Y.Z", commit the workstream folder, and one message with a
`PushNotification`: vX.Y.Z and the GitHub release's link · the link ·
the watch (green, or the rollback and what came after) · the next play:

```
/clear
/stage-close <slug>
```

## Resuming

`/stage-release <slug>`: the opening's steps 1–2, then `.state.md`,
`trace.md` and the CI runs of `main` and of the tags. The trace's last
line is where you are.
