---
name: stage-discovery
description: Stage 1 of the pipeline. Turns a raw demand into what will be built, with nothing left to guess. He talks, you read back what you understood and what you will assume, you ask one question at a time only what is his to decide, the stories get one criterion per rule, a changed screen gets a guided mock, one review round hunts the holes, and he approves on one page. Use when /lets-cook routes a demand here, when he brings an idea or a tracker request, or to resume a discovery by its slug.
argument-hint: "<the idea, in his words | a tracker code such as REQ-12 | workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Workflow, AskUserQuestion, Artifact, ArtifactComments, PushNotification, Skill, Bash(node *), Bash(git *), Bash(mkdir *), Bash(ls *), Bash(cp *), Bash(rm *), Bash(date *), Bash(realpath *), Bash(gitleaks *), Bash(make gitleaks *)
---

# Stage 1 · Discovery

Discovery decides **what** is built and how it looks and behaves,
never how it is built. It is a conversation, not a `/goal`. Two rules
shape all of it:

- **Facts are your job, decisions are his.** What the code, the
  standards book or a scout can answer is never a question to him.
- **He is asked little and never left guessing where things stand.**
  He has four moments: he talks, he answers, he reacts to the screen,
  he approves. Between them you work alone and call him back.

## The bar

The stage is done when every line holds:

1. Every decision that is his has his answer; everything you decided
   in his place was shown to him with its source.
2. Every rule he decided has exactly one acceptance criterion, with
   real values, and `discovery.mjs check --gate` passes.
3. Everything left out is in `not-building.md` with its reason.
4. When a screen changes, he walked the guided mock and said it is
   right; it is locked.
5. One review round ran, and every confirmed finding is fixed, ruled
   or answered.
6. He approved on the page, and the ids are frozen.

## The flow

```
0 door ─► 1 he talks ─► 2 readback ─► 3 interview ─► 4 stories ─┬─► 5 mock ◄ him ─┬─► 7 gate ◄ him ─► /stage-design
          (scouts read)  ◄ him         ◄ him, one     (alone)    └─► 6 review ─────┘
                                       at a time                    (alone, in parallel)
```

| Stop | Who (model, effort) | Produces |
|---|---|---|
| 0 door | you (Fable 5.2, medium) | the folder, `.state.md`, the size, the tracker row |
| 1 he talks | him; `discovery-scout` (Haiku 5.5, high) × N in the background | `notes.md` (Said), `discovery/recon/*.md` |
| 2 readback | you | one message; the notes' Assumptions |
| 3 interview | you and him | the notes' Decisions, Rules, Journeys, every turn |
| 4 stories | `discovery-story-writer` (Sonnet 5.5, high) | `stories.md`, `not-building.md` |
| 5 mock, when a screen changes | `discovery-mock-designer` (Opus 5.5, medium); you run the rounds | `mock/mock.html`, the page, `mock/LOCK.json` |
| 6 review | `discovery-review-workflow.js`: `discovery-story-reader` × 2 per story (Haiku 5.5, high), `discovery-hole-hunter` and `discovery-finding-verifier` (Sonnet 5.5, medium); you rule | `discovery/review/`, `rulings.md` |
| 7 gate | you and him | his yes, `discovery/ids.json`, the next play |

## The three sizes

Size the demand at the door, say it in one line, and correct it at
the readback. A demand can step up a size while it runs; it steps
down only on his word.

| Size | Signs | Stops |
|---|---|---|
| **small**: a clear idea, no screen | one rule or behavior changes, nothing new on screen | 1, 2, 4, 6 (one reviewer), 7. The interview happens only if the readback leaves a question |
| **feature** | a screen changes, or several rules, or a new kind of user | every stop |
| **large and foggy** | several independent parts, or the goal itself is unclear | 1, 2, then cut: the readback proposes the parts and their order; on his yes, write `parts.md` (one line per part: slug, one sentence, what it depends on) and hand him one play per part. Each part is its own discovery at feature size |

A trivial change (a label, a one-line fix) is not this stage's:
`/lets-cook` routes it.

## What you read

| File | When |
|---|---|
| [references/messages.md](references/messages.md) | at the opening: the six templates and the status line |
| [references/interview.md](references/interview.md) | before stop 1 |
| [references/readback.md](references/readback.md) | before stop 2 |
| [references/stories.md](references/stories.md) | at stop 4, before you check the stories |
| [references/mock.md](references/mock.md) | at stop 5, before the build order and before each round |
| [references/review.md](references/review.md) and `<kit>/references/judging.md` | at stop 6, before you rule |
| [references/gate.md](references/gate.md) | at stop 7, and when you first build the page |

## Files

```
<designs-root>/<slug>/
├── .state.md          stage, stop, state (🔴 🟢 ✅), the status line, size, screen, page url
├── notes.md           his words and every decision, with provenance, written every turn
├── stories.md         S-001…, criteria with ids and real values, assumptions, for the design
├── not-building.md    what was left out, with the reason
├── mock/              mock.html, LOCK.json (only when a screen changes)
├── rulings.md         every ruling, his or yours
├── dreaming-notes.md  frictions, as they happen
└── discovery/         working files: recon/, review/, page/, page.json, ids.json
```

The script is `node <kit>/skills/stage-discovery/scripts/discovery.mjs`
(`state`, `check`, `split`, `page`, `shots`, `lock`, `freeze`; its
header documents each). Only `shots` needs a browser
(`playwright-core`); when it is missing, say so in one line with the
install command from the header.

## Opening · stop 0, the door

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..`; write it in
   `.state.md` as `kit:` and give agents absolute paths.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open:
   the pulls, who else is working, the designs root, the tracker.
3. **An existing slug** resumes (last section). Otherwise:
4. **The demand.** His sentence, or the tracker request pulled by
   `notion-tracker pull <code>`. Ask now only what would throw the
   whole stage away if guessed wrong (which product or repo, when
   more than one fits); usually nothing.
5. **The size**, by the table above, from the request alone.
6. **The folder.** The slug is a short kebab name; create the
   folder, `notes.md` from the template with the request, and the
   state: `discovery.mjs state <ws> --stop 1 --state needs-you
   --about "<tell me everything>" --lang <his language> --set
   size=<size> --set kit=<kit> --set session="discovery · <slug>"`.
7. **Another workstream holds him** in a discovery or a design
   debate: say so in one line, ask that session by `SendMessage` to
   tell this one when he is free, and wait.
8. Send the opening template. The session's name is in it, so he can
   find the tab again.

Run `discovery.mjs state` at every change of stop and every change of
state. The line it prints is the status line of your message
([references/messages.md](references/messages.md)).

## Stops 1 to 3 · He talks, the readback, the interview

By [references/interview.md](references/interview.md) and
[references/readback.md](references/readback.md).

**Recon, in the background, from his first sentences.** One
`discovery-scout` per topic, in parallel, each writing
`discovery/recon/<topic>.md` with quotes and `path:line`:

| Topic | The question |
|---|---|
| `today` | what the product does today next to the change (the feature map, the code): what you will assume from |
| `standards` | the standards book's rules that touch it |
| `neighbors` | other workstreams on the same area (`_coordination.md`, their `.state.md`) and the live state of what they claim |
| `words` | words he used that the product already uses for something else |
| `design-system` | when a screen changes: the design system as paths (tokens, shared components, the app shell, that screen's source) and screenshots of the screen today |

Every agent of this stage is the stage's own, named `discovery-…`
(`<kit>/agents/`); no other stage dispatches them.

Questions go through the question tool, one per call, one call per
turn. `notes.md` is written after every answer. No status line during
these stops.

## Stop 4 · The stories

Dispatch `discovery-story-writer` in the background with: `notes.md`, the recon
folder, [references/stories.md](references/stories.md), the two
templates, the script, the workstream path. Send the "running without
you" template with the 🟢 line.

When it returns: `discovery.mjs check <ws>` passes, and you read
`stories.md` whole, because you rule on it until the close. Each
story has its journeys and its error-path table, no two criteria
check one rule, every example value is the notes'. A miss goes back
to the writer in one message. What it listed under Open you settle
from the notes, or it is a question to him.

Then start stop 6, and stop 5 when a screen changes, **in the same
turn**: the review does not wait for the mock.

## Stop 5 · The mock, when a screen changes

By [references/mock.md](references/mock.md). Dispatch `discovery-mock-designer`
in the background with: `stories.md`, `notes.md`, the recon folder
(design system paths, screenshots), `references/mock.md`,
`templates/mock.html`, the script, the workstream path. Keep its
agent id in `.state.md`.

When it returns: `check`, write `discovery/page.json` (status "screen
in review"), `page`, look at the pictures it checked, publish
([references/gate.md](references/gate.md), The page). Then the "back"
template with the link, 🔴, and a push notification. He walks the
tour and reacts; you run the rounds; he says it is right; you lock.

**No screen:** write three to five cases into `page.json` from the
notes' examples (the data before, the action, the data after, the ids
each proves). They are shown on the page at the gate; there is no
stop 5.

## Stop 6 · The review, one round

By [references/review.md](references/review.md). `check`, `split`,
the workflow, then you rule every confirmed finding: the writer's
fixes in one batch, yours in his place, his as questions, the
design's to its list. The second pass reads only the diff.

With a screen, his questions from the review wait until the mock is
locked, then go one at a time.

## Stop 7 · The gate, and the close

By [references/gate.md](references/gate.md): nothing of his is open,
`check --gate` passes, the page is rebuilt and published, the gate
template ends the turn. His yes in his own words → `freeze`, the
rulings, the tracker, the cleanup, the commit, and the approved
template with the next play on his clipboard and printed:

```
/clear
/stage-design <slug>
```

Before the close message, append to `dreaming-notes.md` what cost him
time in this run (a question he should not have been asked, a round
that a better first build would have saved), one line each.

## Without the tools

No `Artifact` tool (a headless or cloud session): the page is built
all the same; give its file path and the `shots` pictures, and
publish from the next local session. No question tool: one question
per message, as numbered options with your pick first.

## Resuming

`/stage-discovery <slug>`: the opening's steps 1 and 2, then
`.state.md` (stop, state, size, the page's URL, the designer's id)
and `notes.md` (Decisions with an empty answer, Assumptions,
Deferred). Open with the "back" template: done, decided, waiting. At
stop 5 read the unanswered comments before you speak; an agent of an
earlier session is gone, so a fresh `discovery-mock-designer` or `discovery-story-writer`
reads the files first. A saved `discovery/review/round-1.json` is
never run again: continue from `reviews.md`.
