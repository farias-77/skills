---
name: stage-close
description: Stage 6 of the pipeline, under one /goal, asking him nothing but what to make. Closes a workstream that is in production - the workstream's retro with the script's numbers and the proposals for the project's standards, the "what's new" text, and when he asks, a video and a deck that explain the new feature to its users and the team in the project's design system - proves nothing is left on the machine, and publishes its report. Use when a workstream's .state.md says stage close, or to resume a close by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Bash
---

# Stage 6 · Close

Close does two things. It looks back: a short retro with real numbers,
so the weekly retro can make the pipeline better, and the proposals
the work raised for the project's standards. And it looks out: the
people who use the product learn what is new, in a text he forwards
and, when he asks, a video and a deck in the product's own look. It
changes nothing in the pipeline or the standards: the weekly retro
rules those.

## The bar

The stage is done when every line holds:

1. `retro.md` has at most 5 items per section, its numbers from
   `telemetry.mjs`, time lost counted as something that went wrong.
2. Every `[standards]` line of the workstream and every drift between
   the merged code and the maps is in the retro's "For the standards".
3. The "what's new" text is ready to paste; the video and the deck he
   picked explain the feature to its users, follow the project's
   `design-system.md`, and carry no technical word.
4. `cleanup.sh --check` comes back empty.
5. The report's Explainer is published.

## The flow

```
/stage-close <slug> → opening: preconditions + the /goal + one question (Video · Deck)
  in parallel ┌── the users' material: what's new ∥ video ∥ deck (what he picked)
              ├── the retro: harvest ∥ drift check → telemetry → retro.md
              └── cleanup: --check → --apply → --check empty
  → report → deliver
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| everything else | you (Opus 5.5, medium) | `retro.md`, `whats-new.md`, the cleanup proof |
| harvest · drift check | `scout` (Haiku 5.5, high) × 2 | the frictions with `path:line`; what the merged diff added that the maps do not name |
| the video for users | `video-builder` (Sonnet 5.5, high), when he asks | `report/close/video.mp4` |
| the deck for the team | `slides-builder` (Sonnet 5.5, medium), when he asks | `report/close/deck/` |
| the Explainer | the report template from `metrics.json` and the retro | the Close tab |

## What you read

| File | When |
|---|---|
| [references/retro.md](references/retro.md) | before you write the retro |
| [references/user-video.md](references/user-video.md) | before you brief or check the video and the deck |
| [references/cleanup.md](references/cleanup.md) | before the cleanup |
| the project's `design-system.md` | handed to the video and deck builders |

## Files

```
<designs-root>/<slug>/
├── 05-close/
│   ├── whats-new.md     the text for users (template: templates/whats-new.md)
│   ├── retro.md         template: templates/retro.md
│   └── trace.md         one line per step (template: templates/trace.md)
├── report/close/        video.mp4 and deck/ when asked
└── metrics.json         written by telemetry.mjs
```

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..`, written as `kit:`
   in `.state.md`.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open: the
   pulls, who else is working.
3. **Preconditions.** `.state.md` says `stage: close`; the release's
   trace ends with the tag in production. A short route or a hotfix
   closes inside `lets-cook`, not here.
4. **The goal**, and in the same message the one question this stage
   asks (multi-select, none is a valid answer): "For the people who use
   it, also make:" **Video** · **Deck**.

```
/goal Close <slug> with the stage-close skill, asking me nothing else.
Done when: retro.md is written with the script's numbers and the standards proposals; the
"what's new" text and the material I picked are ready; cleanup.sh --check comes back empty;
the Close tab is published; and I got the notification with the text, the files and the link.
```

A wait on a render ends the turn on a `ScheduleWakeup` sized to what is
left. `trace.md` is the resume point.

## 1 · Three jobs at once

**The users' material**, by
[references/user-video.md](references/user-video.md):

- `05-close/whats-new.md` from its template, always: what they can now
  do, in their words.
- **Video**, when picked: `video-builder` with the stories, the tag's
  notes, the staging URLs and actors, and the project's
  `design-system.md` (surface: video). It records on staging. Check it
  as the reference says.
- **Deck**, when picked: `slides-builder` with the same sources and
  `design-system.md` (surface: slides): the feature explained to the
  team, screen by screen, in the product's look.

**The retro.**

1. Two `scout`s, in parallel. The **harvest**, with
   [templates/harvest.md](templates/harvest.md) and the paths:
   `dreaming-notes.md`, `rulings.md`, `03-execution/board.md` and its
   parked list, `04-release/trace.md`, every stage's `reviews.md`. The
   **drift check**: "List each route, table, job, module, cloud
   resource and integration that `git diff <the previous tag>...<this
   tag>` adds in the product repo, and for each, quote where the
   project's feature maps or `architecture.md` name it, or say it is
   missing."
2. `node <kit>/scripts/telemetry.mjs <slug> --ws <workstream>` writes
   `metrics.json`: time, cost and his touches per stage, with `gaps`.
3. Write `05-close/retro.md` from its template, by
   [references/retro.md](references/retro.md).

**The cleanup**, by [references/cleanup.md](references/cleanup.md):
`cleanup.sh <slug> --check`, decide what is his (unmerged work),
`--apply`, then `--check` until it comes back empty. The final
`--check` output goes into `trace.md`: it is the proof.

## 2 · The report

As `<kit>/../docs/stage-report.md` describes. The Explainer is filled
from the template with `metrics.json` and the retro: the workstream's
time, cost and touches per stage beside the earlier workstreams', and
the retro's sections. The video and the deck are the users' material
from step 1. Check every number against `metrics.json`, run `gitleaks
dir <workstream>` (a finding stops the publish), and publish labelled
"closed".

## 3 · Deliver

`.state.md` → `stage: closed`; your line in `_coordination.md`:
closed; with a `tracker:` line, `notion-tracker done`. Commit the
workstream folder. From here the folder is history: what must last
lives in the feature maps and the standards.

One message and a `PushNotification`:

| | |
|---|---|
| What's new | the text, in full, ready to paste |
| For users | the video's path (≤ 15 MB) and the deck, when made |
| The link | the workstream's report, Close tab |
| The numbers | time · cost (estimate) · his touches, one line |
| For the standards | how many proposals wait for the weekly retro |

It is the last stage: no next command. When he comments later, append
his words verbatim at the end of `retro.md`, marked `[user]`, and
commit.

**A render that fails** gets one more try when the cause was the
machine (disk, memory), after the cleanup. A second failure: deliver
without it, mark the tab `failed`, one line in `dreaming-notes.md`.

## Resuming

`/stage-close <slug>`: the opening's steps 1–2, then `.state.md` and
`trace.md`. A retro already written is not rewritten; a cleanup is
re-checked, never assumed.
