---
name: stage-close
description: Conducts stage 6 (Close) — finishes one workstream and produces two different things for two different readers. For the pipeline, a sprint-style retro that changes nothing: the session (Opus 5.5, medium) harvests the whole record through one close-harvester (Sonnet 5.5, medium) per source, writes the workstream in numbers and the delivery metrics (lead time, his hours, agent hours, tokens, rounds, findings by class, revert rate, change failure rate), measures what the workstream did to the structure of main, sweeps the branches and worktrees, and writes what went well, what went wrong and the pipeline issues each friction suggests — a file for the weekly-retro, not his report. For the people, the launch package: launch-director (Opus 5.5, high) plans the film from the locked mock, the delivery page and the release record, footage-recorder (Sonnet 5.5, medium) records the real app journey by journey, the video kit renders it in launch mode (3D cold open, zoom-to-cursor tutorial per feature, captions, music bed) at 16:9 and 9:16, plus a "what's new" text and a changelog line per feature. Delivers the film on a launch page (web copies on the Artifact asset store; local files when the tool is missing) and ends with one message: the film's link to forward, the text to paste, the retro's link. Use when a workstream's .state.md says stage close, or to resume a close in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, Bash
---

# Stage 6: Close

The workstream is in production. This stage marks it finished and does
the whole closing properly, for two readers who want different things:

| Output | For | What it is |
|---|---|---|
| **The launch package** | the users and the employees, through him | the film that explains the need, what is new and how to use every new feature, step by step on the real product; a vertical cut for phones; a "what's new" text to paste; a changelog line per feature |
| **The retro** | the pipeline (the weekly retro) | how it went, like a sprint retro: what went well, what went wrong, the numbers, and the pipeline issues each friction suggests — a file, not his report |

The film matters most: people ask him for features that already exist
because nobody showed them. It is the most elaborate video the pipeline
makes, and it is built to the bar of a designer's portfolio.

The retro is **a retro, not a change**: nothing in the pipeline repo is
edited, no issue is opened, no idea is decided here. Once a week the
user runs `weekly-retro` over every workstream closed that week and
decides there what changes; a friction seen in three workstreams
weighs more than one seen once, and only a week's view shows it.

The session is **Opus 5.5 at medium effort**. It reads neither the
record nor the footage whole: the harvesters read the record, the
director and the recorder make the film, and the session assembles,
checks and talks.

## The pattern

```
0. Open      .state.md says close, the release is closed → L1 dispatched at once, in the background
1. Harvest   close-harvest workflow: one close-harvester (Sonnet 5.5, medium) per source, in parallel
2. Numbers   the retro's numbers · the delivery metrics · the structure of main before and after
3. Sweep     worktrees, branches and stacks left behind
4. Retro     went well · went wrong · pipeline issues → 05-close/retro.md, retro.json, metrics.json
                                                       ┐ in parallel with 1–4
   L1 Plan   launch-director (Opus 5.5, high), plan mode → brief, shots.json, whats-new.md, changelog.md
   L2 Shoot  footage-recorder (Sonnet 5.5, medium) → footage/<journey>/ (footage.mp4 + log.json)
   L3 Film   launch-director (Opus 5.5, high), film mode → storyboard, stills, render-launch.sh,
             six frames checked → launch.mp4 · launch-vertical.mp4 · launch.srt
   L4 Check  the session reads the director's frames and the text; the package is complete
                                                       ┘
5. Deliver   web copies ≤ 19 MB → the launch page (Artifact, asset store) · local paths without the tool
   Message   one message: the film to forward, the text to paste, the retro's link
6. Close     his notes verbatim · .state.md → closed · the commit
```

He is in the room only at step 5: he watches the film, forwards it, and
says anything he wants about the film or the retro. Nothing is ruled.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the session | Opus 5.5, medium | the numbers, the sweep, the retro, the package's check, the message |
| `close-harvester` × 1 per source | Sonnet 5.5, medium | reads one source of the record; returns numbers, precision, metrics and frictions with `file:line` and the quote; decides nothing |
| `launch-director` | Opus 5.5, high | plans the film and writes its text (plan mode); writes the storyboard from the real footage, renders and checks it (film mode) |
| `footage-recorder` | Sonnet 5.5, medium | records the real app from the shot list, journey by journey, and checks every take |

## Preconditions

`.state.md` says `stage: close`; `blueprint/release/release.json` has
`closed` set. Missing: halt, back to stage 5.

For the film, the project's contract (`docs/project-contract.md`)
names: a browser-drivable app (role 10) on staging or production, an
actor for it (a demo account's session file, or read-only journeys),
the verify maps (role 14) and the video toolchain (role 21). Missing:
the film is not made; the retro says so as a `W-` friction and the
message says what is missing. The close never waits on the film.

```
designs-root/<workstream>/05-close/
├── harvest/<source>.json   # each harvester's answer, verbatim
├── structure/              # the structure check before and after, and their comparison
├── metrics.json            # the delivery metrics, in the shape references/metrics.md fixes
├── telemetry.json          # the close's own measures (claude/docs/telemetry.md)
├── retro.md                # the retro, for reading
├── trace.md                # one line per step, `date -u`
└── launch/
    ├── brief.md            # the director's plan: need, features, chapters, what is cut and why
    ├── shots.json          # the shot list
    ├── footage/<journey>/  # footage.mp4 + log.json per journey (not committed over 50 MB)
    ├── launch.storyboard.json
    ├── stills/             # the director's stills and frames
    ├── launch.mp4          # 1920x1080, ~50 MB budget, with its audio
    ├── launch-vertical.mp4 # 1080x1920, ~25 MB budget
    ├── launch.srt          # the captions, from the step data
    ├── whats-new.md        # the text he pastes, in the workstream's language
    ├── changelog.md        # one line per feature
    ├── credits.md          # the music's licence line, when there is music
    └── web/                # the launch page: index.html + the web copies (≤ 19 MB each), committed
blueprint/close/retro.json  # the retro in the fixed shape weekly-retro reads
```

## Step 0 — open, and start the film

Read `.state.md` and the release's closed record. Then, before anything
else, dispatch `launch-director (Opus 5.5, high)` in **plan mode**, in
the background, by [references/launch.md](references/launch.md): the
film is the long pole (recording, then up to an hour of rendering per
cut on a loaded machine), so it runs while the retro is written. The
music bed is his to give: a track he licensed, with its licence line;
none given, the film has no music and says nothing about it. Create
`05-close/telemetry.json` with `openedAt` and the session's model
([claude/docs/telemetry.md](../../docs/telemetry.md)); a step row as
each step ends.

## Step 1 — harvest

By [references/harvest.md](references/harvest.md): run
`${CLAUDE_SKILL_DIR}/../../workflows/close-harvest.js` by `scriptPath`
with the workstream, the language, the number keys and the four
sources (documents, execution, release, notes) with their paths. Save
each answer as it came to `05-close/harvest/<source>.json` before
anything is summed. The stages' telemetry is not harvested: it is one
JSON shape per stage, summed by
`scripts/telemetry-sum.mjs` into `05-close/harvest/telemetry.json`
([references/metrics.md](references/metrics.md)); only a workstream
older than that shape adds the fifth source, `telemetry`.

## Step 2 — the numbers

**The retro's numbers.** Sum what the harvesters counted into the keys
of `${CLAUDE_SKILL_DIR}/../../blueprint/schema/close.md`: the days, the
stories and entries, the rounds per stage, the findings, the parked,
the staging runs and reds, the fixes, rollbacks and hotfixes, the
watch, the rulings. And the precision per stage and reviewer: found ·
sustained · deferred · latitude · dismissed. A number the record does
not carry is `null`, never estimated. No comparison with earlier
workstreams here: the weekly compares.

**The delivery metrics**, by [references/metrics.md](references/metrics.md),
into `05-close/metrics.json`: the lead time (the workstream's first
commit to its production deploy); from the stages' telemetry
(`telemetry-sum.mjs`) his hours and the agent hours per stage, the
tokens, the rounds, the cost and the findings by class; the revert
rate and the change failure rate. Each with its source; `null` where
the record does not carry it.

**The structure of main.** The fear is code that works and that nobody
can extend later, so every close measures what this workstream did to
`main`. Run the project's structure check (the role
`docs/project-contract.md` names; the doctrine names its command) in a
throwaway worktree at the `main` the workstream started from (the
merge-base of `feat/<workstream>` with `main`) and at the release's
merge sha, compare the two with the project's comparison command, save
the outputs to `05-close/structure/`, and remove the worktrees. Five
numbers go into the retro, before → after: duplication, complexity,
boundary violations, the gate's runtime and the reverts the
release-scribes listed. A measure past the weekly's threshold
(weekly-retro, "the structure of main") is a `W-` friction with its
numbers and the files the check names; the weekly decides the
refactor. A project with no structure check: "not measured", and one
idea lands `doctrine`.

## Step 3 — sweep

What the workstream left behind, so the next one starts clean: the
entry worktrees and their branches merged or abandoned, a local stack
still up, a feature branch already in `main`, a stale lock. Remove
what is safely removable (merged branches, dead worktrees, stopped
stacks) and list the rest for the user with the command that removes
it. Never delete a branch that is not merged, never touch `main` or
the staging branch. The film's footage is not swept: it is kept until
he has the film.

## Step 4 — the retro

By [references/retro.md](references/retro.md), like a sprint retro,
from the harvest, the numbers and the metrics:

- **What went well** — what the record shows went smoothly and should
  be kept, each with its evidence.
- **What went wrong** — every friction worth a line: what happened,
  where (`file:line`), the quote, what it cost (a round, a stop, a red,
  a day, an hour of his, a question he had to answer).
- **Pipeline issues** — what could change so the next workstream is
  faster, better and smoother: the stage, the pipeline file it would
  touch, the change in one or two sentences, why, and the frictions
  behind it. An idea that belongs to the project's doctrine or to the
  venture is marked so.

Write `05-close/retro.md` from [templates/retro.md](templates/retro.md)
and `blueprint/close/retro.json` in the shape the schema fixes; build
and publish the blueprint (its Close tab is the retro's link). The
retro is not presented to him on its own: it goes in the step-5
message as a link.

## The launch package — L1 to L4

By [references/launch.md](references/launch.md). In short:

1. **L1 · plan.** The director's plan-mode return: the brief, the shot
   list, `whats-new.md`, `changelog.md`, the features, what is cut and
   why, and what it needs from him. A need only he can meet (a demo
   account, the music) goes in the step-5 message, never as a stop:
   the film is made with what exists.
2. **L2 · shoot.** Dispatch `footage-recorder (Sonnet 5.5, medium)`
   with the shot list, the environment and its mode (`read-only` on
   production; a demo account's session file otherwise). It returns
   the footage folders, the takes it checked, the selectors it
   repaired, and the journeys that failed. A failed journey goes back
   to the director once (re-plan or cut); the rest of the film goes
   on.
3. **L3 · film.** Dispatch the director in **film mode**, in the
   background, with the footage folders. It writes the storyboard from
   the recorded timings, checks the stills at 16:9 and 9:16, renders
   with `claude/video/render-launch.sh` (it queues on the machine's
   render lock by itself), checks six frames, fixes once, and returns
   the paths, the sizes and what is still wrong.
4. **L4 · check.** The session reads the director's frames (the six
   and the two vertical ones) and `whats-new.md`, and rules on them as
   the last eye before him: a caption in the wrong language, a frame
   with personal data, a feature from the release record missing from
   both the film and the cut list. One more director pass at most;
   what remains goes in the message as a known flaw.

## Step 5 — deliver, then the message

**Deliver** by [references/launch.md](references/launch.md), "Delivery":
the master (~50 MB) is too big for the blueprint and for one artifact
file, so `scripts/web-copy.sh` makes a copy of each cut under the asset
cap (19 MB), the session publishes the launch page from
`templates/launch-page.html` with the `assets` capability, uploads the
two copies to its asset store and publishes the page again with their
URLs. Without the Artifact tool, or when a publish is refused or the
film is too long for one asset, the film goes out as local files and
the message says why.

One message, in his language (the labels below are the English form),
and nothing before it:

```
▶ Launch film   <launch page URL>                  <m:ss> · to forward (inside the organization)
▣ Masters       <abs>/05-close/launch/launch.mp4   <MB> MB · launch-vertical.mp4 <MB> MB · launch.srt
◧ Retro         <blueprint URL>#close              for the weekly retro
```

Without the page, the first line is the master's absolute path and the
reason there is no link.

Then `whats-new.md` in a code block, ready to paste, and the changelog
lines under it. Then, in at most three lines: the features cut from the
film and why, a known flaw, what the film still needs from him (a
licensed track, a demo account) if anything. The paths are absolute.
A film redone after his notes is copied and uploaded again, and the
same page republished with the new URLs.

He forwards the film; anything he says goes on record:

- about the **film** (a label, a cut, a feature missing): the director
  in film mode again, once per round of his notes; the same paths;
- about the **retro**: his words verbatim into `retro.md` and
  `retro.json` as his notes, with the idea or friction they refer to
  when he names one. Nothing is ruled; his notes are the input the
  weekly weighs first.

## Step 6 — close

When he says it is closed, it is: close `05-close/telemetry.json`, add
its row to `metrics.json` (run `telemetry-sum.mjs` again and take its
`stages` and `totals`), rebuild the blueprint, `.state.md` →
`stage: closed`, and commit the workstream folder (the footage only
when it is under 50 MB in all; the films always), push only with his
explicit approval. The close's stage report is this package:
the launch page replaces the stage video (`claude/docs/stage-report.md`), the
retro's tab is its blueprint layer, and there are no slides: the retro
is the weekly's, not his. Suggest `/clear`.

## How to write

Say what you mean. Literal sentences, concrete values, the user's
words verbatim. An idea names the file it would touch and the evidence
behind it; an idea with no evidence is not written. The film's words
and the "what's new" are in the workstream's language, for people who
were not in the room: the product's own names, no pipeline term.

## Resuming

Everything is in files. Read `.state.md`, `05-close/trace.md`,
`05-close/harvest/`, `retro.md`, `05-close/launch/`. Continue from the
first step with no trace line; a launch step whose output exists (the
brief, a journey's `log.json`, `launch.mp4`, the launch page's URL in
`trace.md`) is not redone.

## Boundaries

No edit to the pipeline repo, no issue opened, no idea decided: the
weekly retro does that. No edit to product code. No write to
production: the footage is recorded read-only or on a demo account.
The sweep never deletes unmerged work. Music only with its licence
line.
