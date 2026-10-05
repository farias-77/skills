---
name: stage-close
description: Conducts stage 6 (Close) of the pipeline under one /goal, and closes on its own. It delivers the video for users (1–3 min, a motion piece recorded in staging, no technical words) as an .mp4 plus a "what's new" text for the user to forward; writes the front's retro (at most 5 items per section, numbers from claude/scripts/telemetry.mjs, slowness counted as something that went wrong); proves nothing of the front is left on the machine with claude/scripts/cleanup.sh; and publishes its report (video, deck, explainer). A scout harvests the frictions. The retro changes nothing in the pipeline: the weekly retro does. The session runs on Opus 5.5, high. Use when a front's .state.md says stage close, or to resume a close by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Bash
---

# Stage 6: Close

## The bar

1. The users get a 1–3 minute video, in motion, with no technical
   word, and a "what's new" text ready to paste.
2. The retro has at most 5 items per section; its numbers come from
   the script; time lost counts as something that went wrong.
3. Nothing of the front is left on the machine, proven by a script.
4. It closes on its own. What he says later goes into the retro,
   verbatim.
5. It is the one stage that waits for its own video: the video for
   users is what the close delivers.

## The team

| Who (model, effort) | Does |
|---|---|
| you, the session (Opus 5.5, high) | the retro, the cleanup, the checks, the delivery |
| `video-builder (Sonnet 5.5, medium)` | the video for users, started at the release's green staging |
| `scout (Sonnet 5.5, low)` | the harvest of frictions, with `templates/harvest.md` |
| `slides-builder (Sonnet 5.5, medium)` | the Close deck |

## The flow

```
0 open            canary · preconditions · the /goal → he pastes it
1 in parallel ┌── the video for users: wait for what is left of its render (or dispatch it now)
              ├── harvest: scout + templates/harvest.md ──► telemetry.mjs ──► retro.md
              └── cleanup.sh --check → --apply → --check empty
2 report          Video (the users' video) · Deck (retro, numbers, what's new) · Explainer (the numbers)
3 deliver         the .mp4, the text, the link · PushNotification · closed
```

| Read | When |
|---|---|
| [references/user-video.md](references/user-video.md) | before you brief or check the video |
| [references/retro.md](references/retro.md) | before you write the retro |
| [references/cleanup.md](references/cleanup.md) | before the cleanup |

```
<designs-root>/<slug>/05-close/
├── whats-new.md                 the text for users (templates/whats-new.md)
├── retro.md                     templates/retro.md
└── trace.md                     one line per step (templates/trace.md)
<designs-root>/<slug>/report/close/video.mp4   the video for users, also the Close tab's Video
<designs-root>/<slug>/metrics.json             written by telemetry.mjs
```

## Unattended

Nothing in this stage asks him. A wait on the render ends the turn on
a `ScheduleWakeup` sized to what is left. Keep `trace.md` current; it
is the resume point.

## Step 0 · Open

1. **The house rules.** Read the file that
   `realpath ${CLAUDE_SKILL_DIR}/../../../CLAUDE.md` prints and run its
   Open: the model line, then the canary.
2. **Preconditions.** `.state.md` says `stage: close`; the release's
   trace ends with the tag in production (a short route or a hotfix
   closes inside lets-cook, with `templates/short-close.md` of that
   skill, not here).
3. **The `/goal`**, then end the turn:

```
/goal Close <slug> with the stage-close skill, without asking me anything.
Done when: the video for users and the "what's new" text are ready; retro.md is written with the
script's numbers; cleanup.sh --check comes back empty; the Close tab is on the front's link; and I
got the notification with the video, the text and the link.
```

## Step 1 · Three jobs at once

Start all three in one turn.

**The video for users.** The release dispatched the
`video-builder (Sonnet 5.5, medium)` at its green staging. Read its
state from the machine: `report/close/video.mp4` exists → done; a
render of it still running (`pgrep -af 'render.sh.*<slug>'`) → wake
when it should end; neither → dispatch it now with
`references/user-video.md` and the stories (it records in staging).
When it returns, check it as that reference says.

**The retro.**
1. Dispatch one `scout (Sonnet 5.5, low)` with `templates/harvest.md`
   and these paths: `dreaming-notes.md`, `rulings.md`, every stage's
   board or trace (`03-execution/` board and parked list,
   `04-release/trace.md`), and the reviews files. It returns each
   friction with `path:line`, the quote and the time it cost; nothing
   is written to a file.
2. Run `node claude/scripts/telemetry.mjs <slug> --ws <designs-root>/<slug>`. It writes
   `metrics.json`: time, cost and his touches per stage, with `gaps`
   for what it could not measure.
3. Write `05-close/retro.md` from `templates/retro.md`, as
   `references/retro.md` says.

**The cleanup.** Follow `references/cleanup.md`:
`cleanup.sh <slug> --check`, decide what is his (unmerged work),
`--apply`, then `--check` until it comes back empty. Paste the final
`--check` output into `trace.md`: it is the proof.

## Step 2 · The report, finished before the close

Dispatch `slides-builder (Sonnet 5.5, medium)` as
`docs/stage-report.md` describes, into `report/close/`:

| Tab | Who | What |
|---|---|---|
| Video | the users' video itself | 1–3 min, for users |
| Deck | `slides-builder (Sonnet 5.5, medium)` | the retro (at most 5 per section), the numbers per stage, the "what's new" text |
| Explainer | the report template from `metrics.json` | the front's time, cost and touches per stage, beside the earlier fronts' `metrics.json` |

Check every number on a slide against `metrics.json`. Run
`gitleaks dir <designs-root>/<slug>`; a finding stops the publish.
Publish to the front's link with the label "closed". The page stays
private: nothing goes outside the company without his approval.

## Step 3 · Deliver and close

1. `.state.md` → `stage: closed`. Your line in `_coordination.md`:
   closed. Commit the workstream folder (push only on his word).
   From here the folder is history, read only: nobody updates its
   design documents; what must last lives in the feature map.
2. One message and a `PushNotification`:

| | |
|---|---|
| For users | the `.mp4` path (≤ 15 MB, ready to forward) |
| What's new | the text, in full, ready to paste |
| The link | the front's report, Close tab |
| The numbers | time · cost (estimate) · his touches, one line |
| Known issue | only if the video has one he should know before forwarding |

It is the last stage: no next command. When he comments later, append
his words verbatim at the end of `retro.md`, marked `[user]`, and
commit.

## When the render fails

Run the cleanup first (it frees the render caches and the front's images),
then render **once more** if the failure was the machine's (disk,
memory). A second failure: deliver the text alone, mark the Video tab
"failed", and write one line in `dreaming-notes.md`. A problem seen in
the finished video goes in the message as a known issue; it is
rendered again only on his note.

## Resuming

`/stage-close <slug>`: the canary, then `.state.md` and `trace.md`. A
retro already written is not rewritten; a cleanup is re-checked, never
assumed.
