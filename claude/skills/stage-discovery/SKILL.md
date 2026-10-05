---
name: stage-discovery
description: Conducts stage 1 (Discovery) of the pipeline. The user talks; a prototype-builder (Sonnet 5.5, medium) turns each answer into a visible edit of a live mock on his second screen; the conductor locks the mock when nothing is open; a story-writer (Sonnet 5.5, high) writes the stories with one acceptance criterion per rule or behavior; one review round (three lenses and two blind readers plus a judge per story) runs as a workflow; he confirms story by story in a playback; the stage closes with its report (video, deck, explainer). A conversation, never a /goal. The session runs on Opus 5.5, high. Use when /lets-cook routes a demand to the full pipeline, or to resume a discovery by its slug.
argument-hint: "[workstream-slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, ArtifactComments, Skill, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cp *), Bash(rm *), Bash(git *), Bash(node *), Bash(gitleaks *), Bash(realpath *), Bash(sha256sum *)
---

# Stage 1: Discovery

He says what to build. While he talks, a mock of it appears on the
screen beside the chat, looking and behaving like the real product.
When nothing is open, you lock it; the stories and their acceptance
criteria (ACs) come from the conversation and the locked mock; one
review round makes them robust; he confirms them one by one. Discovery
decides **what** is built and how it looks and behaves, never how it is
built.

## The bar

1. Each answer of his becomes a visible edit of the mock within minutes.
2. Each rule he said has **exactly one** AC, and a stranger can judge
   every AC.
3. No error path (limit, dependency failure, permission, repeat)
   reaches the design without his decision.
4. He confirms story by story; after the playback nothing about
   **what** to build is open.
5. Out: the locked mock, `stories.md` with its ACs, and the report
   (Video · Deck · Explainer), finished before the close.

## Two modes

**Conversation** (D1–D3, D6): he is in the room. Questions are the work.
Never decide in his place, never put in the mock a rule he did not say
or confirm (a guess goes to Inferred, visible, and is asked).

**Autonomous** (D0, D4, D5, D7): he waits. Dispatch, run, rule, write,
publish, without asking permission. Do not stop to summarize and
announce the next step, to offer to wait, to list non-blocking choices,
or because a step finished: go on to the next step in the same turn.
Stop only for: a question that is his (through the question tool), a
background agent you must wait on (end the turn on the status table;
it wakes you), or the close.

## The flow

```
/lets-cook routes to the full pipeline → this skill, same session
  D0 recon (background) ─┐
  D1 interview ◄─────────┼──► D2 live mock (edit by edit, on his second screen)
                         │
  D3 lock (you) → D4 stories → D5 review (workflow) → D6 playback (him)
  → D7 report ∥ cleanup → close: /clear + /stage-design <slug>
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| D0 recon | `scout (Sonnet 5.5, low)` × N, background | `recon/<topic>.md`, `recon/screens/*.png` |
| D1 interview | you (Opus 5.5, high) | `notes.md`, every turn |
| D2 live mock | `prototype-builder (Sonnet 5.5, medium)`, one agent, edit orders by `SendMessage` | `prototype/index.html`, published to one URL |
| D3 lock | you | `LOCK.json`, `versions/v<N>.html`, `frames/` |
| D4 stories | `story-writer (Sonnet 5.5, high)` | `journeys/*.yaml`, `stories.md`, `trace` green |
| D5 review | `discovery-review-workflow.js`: `disc-lens (Sonnet 5.5, medium)` × 3 ∥ per story `blind-reader (Sonnet 5.5, low)` × 2 → `blind-judge (Sonnet 5.5, medium)`; you rule | `reviews/round-1.json`, `reviews.md` |
| D6 playback | you + **him**, question tool | `rulings.md`, confirmed stories, his answer for the design |
| D7 report | `video-builder (Sonnet 5.5, medium)` ∥ `slides-builder (Sonnet 5.5, medium)` ∥ `artifact-builder (Sonnet 5.5, medium)` | the Discovery tab of the front's link |

## What you read

| File | When |
|---|---|
| [references/interview.md](references/interview.md) | before the first question |
| [references/mock.md](references/mock.md) | before the first edit order (the builder reads it too) |
| [references/stories.md](references/stories.md) | at D4, before you check the stories |
| [references/playback.md](references/playback.md) | at D5, before you rule |
| `claude/references/judging.md` | at D5: the shared scale (blocks · note) and owners |

You never read the mock's HTML: the builder owns it and publishes it.
Anything you need from a file you have not read goes to a scout.

## Files

```
<designs-root>/<slug>/
├── .state.md                 stage, step (D0–D7), kit, mode (artifact | local), builder id, mock url + version, locked, report url
├── .gitignore                **/.remotion/ and _run/
├── rulings.md · dreaming-notes.md
├── report/                   the front's link: report.json + discovery/ (video.mp4, deck/, explainer.html)
└── 00-discovery/
    ├── notes.md              the conversation, every turn
    ├── recon/                <topic>.md (each scout writes its own), screens/*.png
    ├── prototype/            index.html · versions/v<N>.html · walks/v<N>.json · frames/ · LOCK.json
    ├── journeys/J<n>-<name>.yaml
    ├── stories.md
    ├── reviews/              stories/ (proto.mjs split) · round-1.json (the workflow's return)
    └── reviews.md            your rulings
```

`proto.mjs` is `node <kit>/skills/stage-discovery/scripts/proto.mjs`:
`walk`, `frames`, `look`, `shots`, `lock`, `trace`, `split`, `model`
(its header documents each). It needs `playwright-core` and a Chromium;
when either is missing, say so in one line with the install command
from its header and keep interviewing.

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..` is the pipeline's
   `claude/` folder; write it in `.state.md` as `kit:` and give agents
   resolved paths.
2. **The model.** Not on Opus 5.5 at high effort: one line recommending
   the switch, and go on without waiting.
3. **The guard canary.** `git push origin a:b` must come back denied by
   the guard hook. No denial: the stage does not open; say why in one
   line.
4. **One front at a time.** Read the designs root's coordination file.
   When another front holds his attention in a discovery or a design
   debate, say so once and queue this one; message that front's
   session when it frees him.
5. **New:** the slug `YYYY-MM-DD-<short-kebab-name>` (the project's
   naming rule wins), the folder, `.state.md` (`stage: discovery`,
   `step: D1`), `.gitignore`, and `00-discovery/notes.md` from
   [templates/notes.md](templates/notes.md). What `/lets-cook` already
   heard goes in as Confirmed. **Resume:** see the last section.
6. Start D0 in the same turn.

The host may lack a tool; say what is missing in one line and run on:

| Missing | What changes |
|---|---|
| `Artifact` (headless or cloud) | **local mode**, `mode: local`: the builder runs `proto.mjs shots`; your message gives the PNG paths; comments come by chat; the report stays in `report/` for the next local session to publish |
| the question tool | the questions go as text, same shape: numbered, lettered options, your pick first and marked |
| `Workflow` accepting the kit's path (a symlink outside the working directories) | copy the workflow into `<workstream>/_run/`, check both `sha256sum`s match, run the copy |

## D0 · Recon, in the background

From his first sentences, one `scout (Sonnet 5.5, low)` per question,
in parallel, in the background; never wait on them to talk to him.
Each writes its answer, quotes with `path:line`, to
`00-discovery/recon/<topic>.md`:

- the feature map of each area he names;
- the exported design tokens and components (paths, and the lines that
  name the typeface, radius and color roles);
- other fronts: the coordination file and each running workstream's
  `.state.md` that touches the same areas;
- term collisions: each domain word he used that the product already
  uses for something else.

When the app is drivable, capture the current screens of the named
areas yourself, one command each, without opening the images
(`proto.mjs look <url> … --shot 00-discovery/recon/screens/<name>.png`;
log in through `--env-cmd` and `env:NAME` fills, never a secret on the
command line). A stack you bring up for this you take down when done.
A missing export or a stack that cannot come up is one line in the
notes; the mock then uses the shell's defaults.

## D1 · The interview

By [references/interview.md](references/interview.md): the voice dump
first, uninterrupted; the restatement in one short message; then
batches of at most four questions through the question tool, your
recommendation first; the razor (ask only what, guessed wrong, changes
the build); infer to go faster; nothing a scout can answer. Write
`notes.md` every turn: a dead session loses nothing.

## D2 · The live mock

**v1** as soon as one journey is clear (actor, trigger, steps, end): do
not wait for the whole interview. Dispatch `prototype-builder (Sonnet
5.5, medium)` in the background, in build mode, with: `notes.md`, the
recon folder, the tokens and components paths (or "none"), the shell
([templates/prototype-shell.html](templates/prototype-shell.html)),
[references/mock.md](references/mock.md), the output path, the
languages, the actors, whether time matters, the `proto.mjs` path, and
the mode (artifact or local). Keep interviewing while it builds. Keep
its agent id in `.state.md`.

**Every later version is an edit order** to the same agent, by
`SendMessage` (it keeps its context): one line per change, each with
its source (`batch 3 · Q2`, `comment <id>`, `chat`), his words, and your
restatement. One batch of his answers is one order, published once.
Sort each item first:

| Item | Path |
|---|---|
| look, copy, layout, motion, a missing state | straight to the builder |
| a rule, a number, scope, the data shown, a journey added or cut | restated and confirmed by him first, written to the notes as Confirmed, then ordered |

The builder edits, runs `proto.mjs walk` until it passes, copies the
version, **publishes it itself** to the same URL, and returns: the URL,
the version, what changed per journey, its Inferred list and its gaps.
Record the URL and version in `.state.md` and a Mock log row. Then one
short message: the link (first time), what changed per journey, what to
look at first. Deep links: `#play-J2` opens a journey, `#<screen>.<state>`
a state; `~dark`, `~pt-BR`, `~phone` add to either.

**His feedback** comes by chat and by comments on the mock. Watch the
artifact with `ArtifactComments` after the first publish; each comment
becomes a line of the next edit order and is answered once its change
is published ("done in v4"). The builder's Inferred entries go to the
notes' Inferred block and into a later batch.

**A builder that cannot publish** (the tool is not given to
subagents): you publish its file yourself, reading it first, and say
in one line that the context cost is now yours.

## D3 · The lock

You lock when the checklist is empty:

- `notes.md` has nothing in Open and nothing in Inferred;
- every rule in the Rules table is shown by a journey step, or marked
  `[build]` in its Proof column with his ok;
- every comment is answered;
- the last walk passed.

Tell the builder this version is the lock candidate: it renumbers each
journey's steps `s1, s2, …` in play order and reports the old → new
map. Then announce in one line ("locked v6: 4 journeys, 11 rules") and
run:

```
node proto.mjs lock 00-discovery/prototype --words "<your announcement>" [--gap "<where>::<what>" …]
```

It walks once more, copies `versions/v<N>.html`, renders `frames/`,
and writes `LOCK.json`. He may object in one line; his confirmation
comes at the playback. Write the notes' Lock block and `.state.md`
(`step: D4`, `locked: v<N>`). After the lock the mock changes only by
an amendment (D6).

## D4 · The stories

Dispatch `story-writer (Sonnet 5.5, high)` in write mode with: the
locked `versions/v<N>.html`, `LOCK.json`, `frames/manifest.json`,
`notes.md`, [references/stories.md](references/stories.md), the
templates ([journey.yaml](templates/journey.yaml),
[stories.md](templates/stories.md)), the `proto.mjs` path and the
language. It writes `journeys/*.yaml` and `stories.md` and returns only
after `proto.mjs trace` passes.

Then read `stories.md` whole: you rule on it from here to the close.
Check by reading what `trace` cannot: each story names its journeys and
carries its error-path table; no two ACs check one behavior; the Out
lines match the notes. A miss goes back to the writer in one message.

## D5 · The review: one round

```
node proto.mjs split 00-discovery/stories.md 00-discovery/reviews/stories
```

prints the index. Run the workflow by `scriptPath`
(`<kit>/workflows/discovery-review-workflow.js`), with `args`:
`discoveryDir`, `mock` (the locked version), `proto` (absolute paths),
`language`, and `index` (the JSON `split` printed, as a value, never a
string). It returns `.result` inside an envelope; save the result as
`reviews/round-1.json`.

| Section | Who | Asks |
|---|---|---|
| Lenses | `disc-lens (Sonnet 5.5, medium)` × 3 | **in-out**: is every capability In or Out, nothing in limbo? · **coverage**: does every rule have its AC, and does each story pass through limit, dependency failure, permission and repeat? · **acceptance**: can a stranger decide pass or fail on every AC? |
| Double-blind | per story, `blind-reader (Sonnet 5.5, low)` × 2, then `blind-judge (Sonnet 5.5, medium)` | do two readers who see only the story and the mock understand each AC the same way, and does the mock agree? |

A round the workflow marks invalid is fixed at its cause and run again
before anything is ruled. `[build]` ACs are not read blind.

**Rule** every finding by [references/playback.md](references/playback.md)
and `claude/references/judging.md`, in `reviews.md`
([template](templates/reviews.md)), before any fix moves:

- owner `story-writer` → one apply batch, by `SendMessage`, without
  asking him; you verify each changed line and rerun `trace`;
- his → into the playback, one question per decision;
- for the design → `reviews.md`, never asked;
- dismissed → with the quote or frame that closes it.

There is no second round.

## D6 · The playback

By [references/playback.md](references/playback.md): story by story,
four per call, **Confirm** · **Adjust** · **Cut**, with the review's
decisions of his and the writer's Inferred entries inside each story's
question. About ten stories, three calls.

- An adjust that changes behavior is an **amendment**: an edit order to
  the builder, `proto.mjs lock` again with his answer as `--words`, the
  writer re-derives only that story, `trace` green.
- A cut story leaves `stories.md`; an Out line takes its place.
- **The last call carries the design question** (Nothing in mind,
  propose · I have an idea · I have a constraint). His answer goes,
  verbatim, to the notes' "For the design".

Every answer is a line in `rulings.md`.

## D7 · The report, the cleanup, the close

**The report is finished before the stage closes**: he validates
through it. The front's link is born here; write its URL in
`.state.md`. Dispatch the three builders in one message, in the
background, each with the stage's files and the report folder
(`report/discovery/`), as `claude/docs/stage-report.md` describes:

| Tab | Builder | Brief |
|---|---|---|
| Video | `video-builder (Sonnet 5.5, medium)` | the problem and the solution told through the stories, 60–90 s, a motion piece; **not** the mock in use; the fixtures are invented names (`meta.fixtures`) |
| Deck | `slides-builder (Sonnet 5.5, medium)` | the story map, the rules with their numbers, what stays out, his decisions |
| Explainer | `artifact-builder (Sonnet 5.5, medium)` | the locked mock beside a clickable map: story → its ACs → the step or frame each one anchors on |

While they work, clean what this stage created: `prototype/shots/`
(local mode), any scratch frames folder, `_run/`, a recon stack still
up. When they return: every number on a slide is checked against
`stories.md` or the notes; the video builder deleted its `.remotion/`
cache; run `gitleaks dir <workstream>` (a finding stops the publish);
publish the page to the front's link with the label "discovery closed".

Then: `.state.md` to `stage: design`, commit the workstream folder
(push only on his word), and one message:

| | |
|---|---|
| The link | the front's report, Discovery tab |
| The scope | stories · ACs · rules · what is out, one line |
| For the design | his answer to the last question |
| Next | `/clear`, then `/stage-design <slug>` |

Nothing runs until he types it.

## Resuming

Everything is in files. `/stage-discovery <slug>`: run the opening's
steps 1–4, then read `.state.md` (its step, `kit:`, `mode:`, the mock's
URL and version) and `notes.md` (Coverage map, Journeys, Mock log,
Open). From D2 on, read the unanswered comments before you speak. The
builder of an earlier session is gone: a fresh `prototype-builder`
reads `index.html` and the notes first. At D5 a saved
`reviews/round-1.json` is never run again: continue from `reviews.md`.
Never resume from memory of an earlier session.

## How to write

Literal sentences, one idea each, concrete values, his words in
quotation marks where they decide something. In messages: a table for
parallel things, a flow block for a sequence, short topics for a list.
Every agent named carries its model and effort in parentheses. The
files are written in his language; ids and keywords (GIVEN, WHEN,
THEN) stay as the templates have them.
