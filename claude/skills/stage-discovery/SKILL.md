---
name: stage-discovery
description: Conducts stage 1 (Discovery) of the pipeline. An interview that extracts what to build, infers the obvious from the rest of the system and asks the rest; at its end a story-writer (Sonnet 5.5, high) writes the stories with one acceptance criterion per rule or behavior. When a screen changes, a prototype-builder (Sonnet 5.5, medium) builds the exact mock in the project's own design system, only as wide as the change; he iterates it until he says it is ready, and the stories absorb what the mock revealed. One review round (three lenses, two blind readers plus a judge per story) runs as a workflow; he confirms story by story in a playback that first explains each block in plain words; the stage closes with its report (video, deck, explainer). A conversation, never a /goal. The session runs on Opus 5.5, high. Use when /lets-cook routes a demand to the full pipeline, or to resume a discovery by its slug.
argument-hint: "[workstream-slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Workflow, AskUserQuestion, Artifact, ArtifactComments, Skill, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cp *), Bash(rm *), Bash(git *), Bash(node *), Bash(gitleaks *), Bash(make gitleaks *), Bash(realpath *), Bash(sha256sum *)
---

# Stage 1: Discovery

He says what to build. You interview him until nothing about **what**
to build is open; the stories and their acceptance criteria (ACs) are
written at the end of the interview. When a screen changes, the exact
mock of it is built after the stories, in the product's own look, and
he iterates it until he says it is ready: the discovery decides how the
screen looks, for good. One review round makes the stories robust; he
confirms them one by one. Discovery decides **what** is built and how
it looks and behaves, never how it is built.

## The bar

1. Every rule he has in mind is asked or inferred; nothing obvious is
   asked, and nothing is inferred silently.
2. Each rule he said has **exactly one** AC, and a stranger can judge
   every AC.
3. No error path (limit, dependency failure, permission, repeat)
   reaches the design without his decision.
4. When a screen changes, the mock is the screen as it will ship, in
   the product's look, and only as wide as the change.
5. He confirms story by story, after a plain explanation of each; after
   the playback nothing about **what** to build is open.
6. Out: `stories.md` with its ACs, the locked mock when a screen
   changes, and the report (the Explainer; the Video and the Deck when
   he asks for them), finished before the close.

## Two modes

**Conversation** (D1, D3's rounds, D5): he is in the room. Questions
are the work. Never decide in his place; a guess goes to Inferred,
visible, and is asked.

**Autonomous** (D0, D2, D3's build, lock and anchor, D4, D6): he waits. Dispatch, run,
rule, write, publish, without asking permission. The house rules'
"Under a `/goal`" holds in these steps, with the close as the "done".

## The flow

```
/lets-cook routes to the full pipeline → this skill, same session
  D0 recon (background) ∥ D1 interview → D2 stories
  ├─ a screen changes → D3 mock: build → his rounds → "ready" (his words) → lock → stories anchored
  └─ no screen        → (no mock)
  → D4 review (workflow) → D5 playback (him) → D6 report ∥ cleanup → close: /clear + /stage-design <slug>
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| D0 recon | `scout (Haiku 5.5, medium)` × N, background | `recon/<topic>.md`, `recon/screens/*.png` |
| D1 interview | you (Opus 5.5, high) | `notes.md`, every turn |
| D2 stories | `story-writer (Sonnet 5.5, high)`, write mode | `stories.md` |
| D3 mock (a screen changes) | `prototype-builder (Sonnet 5.5, medium)`, one agent, round orders by `SendMessage`; then `story-writer`, anchor mode | `prototype/index.html` published to one URL, `LOCK.json`, `journeys/*.yaml`, `trace` green |
| D4 review | `discovery-review-workflow.js`: `disc-lens (Sonnet 5.5, medium)` × 3 ∥ per story `blind-reader (Sonnet 5.5, low)` × 2 → `blind-judge (Sonnet 5.5, medium)`; you rule | `reviews/round-1.json`, `reviews.md` |
| D5 playback | you + **him**: a plain message per block, then the question tool | `rulings.md`, confirmed stories, his answer for the design |
| D6 report | `artifact-builder (Sonnet 5.5, medium)`; `video-builder (Sonnet 5.5, high)` ∥ `slides-builder (Sonnet 5.5, medium)` when he picks them | the Discovery tab of the workstream's link |

## What you read

| File | When |
|---|---|
| [references/interview.md](references/interview.md) | before the first question |
| [references/stories.md](references/stories.md) | at D2, before you check the stories |
| [references/mock.md](references/mock.md) | at D3, before the build order (the builder reads it too) |
| [references/playback.md](references/playback.md) | at D4, before you rule |
| `claude/references/judging.md` | at D4: the shared scale (blocks · note) and owners |

You never read the mock's HTML: the builder owns it and publishes it.

## Files

```
<designs-root>/<slug>/
├── .state.md                 stage, step (D0–D6), kit, screen (yes | no), mode (artifact | local), builder id, mock url + version, locked, report url
├── .gitignore                _run/, **/.remotion/, **/film/assets/, **/stills/
├── rulings.md · dreaming-notes.md
├── report/                   the workstream's link: report.json + discovery/ (video.mp4, deck/, explainer.html)
└── 00-discovery/
    ├── notes.md              the conversation, every turn
    ├── recon/                <topic>.md (each scout writes its own), screens/*.png
    ├── stories.md
    ├── prototype/            only when a screen changes: index.html · versions/v<N>.html · walks/v<N>.json · frames/ · LOCK.json
    ├── journeys/J<n>-<name>.yaml   only with a locked mock
    ├── reviews/              stories/ (proto.mjs split) · round-1.json (the workflow's return)
    └── reviews.md            your rulings
```

`proto.mjs` is `node <kit>/skills/stage-discovery/scripts/proto.mjs`:
`walk`, `frames`, `look`, `shots`, `lock`, `trace`, `split`, `model`
(its header documents each). It needs `playwright-core` and a Chromium;
when either is missing, say so in one line with the install command
from its header. Without a mock, only `split` and `trace none` run.

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..` is the pipeline's
   `claude/` folder; write it in `.state.md` as `kit:` and give agents
   resolved paths.
2. **The house rules.** Read `<kit>/../CLAUDE.md` and run its Open:
   the canary, the pulls, who else is working.
3. **One workstream at a time.** Read the designs root's coordination file.
   When another workstream holds his attention in a discovery or a design
   debate, say so once and queue this one: message that workstream's
   session (`SendMessage`) to tell this one when it frees him, and
   wait on its answer.
4. **New:** the slug `YYYY-MM-DD-<short-kebab-name>` (the project's
   naming rule wins), the folder, `.state.md` (`stage: discovery`,
   `step: D1`), `.gitignore`, and `00-discovery/notes.md` from
   [templates/notes.md](templates/notes.md). What `/lets-cook` already
   heard goes in as Confirmed. **Resume:** see the last section.
5. Start D0 in the same turn. At the start of every step, write
   `step: D<n>` in `.state.md`.

The host may lack a tool; say what is missing in one line and run on:

| Missing | What changes |
|---|---|
| `Artifact` (headless or cloud) | **local mode**, `mode: local`: the builder runs `proto.mjs shots`; your message gives the PNG paths; comments come by chat; the report stays in `report/` for the next local session to publish |
| the question tool | the questions go as text, same shape: numbered, lettered options, your pick first and marked |

## D0 · Recon, in the background

From his first sentences, one `scout (Haiku 5.5, medium)` per question,
in parallel, in the background; never wait on them to talk to him.
Each writes its answer, quotes with `path:line`, to
`00-discovery/recon/<topic>.md`:

- the feature map of each area he names, and how the system behaves
  today next to it (what you will infer from);
- other workstreams: the coordination file and each running workstream's
  `.state.md` that touches the same areas;
- term collisions: each domain word he used that the product already
  uses for something else;
- **when a screen changes**, the design system, as paths, never copied:
  the tokens (color, type, spacing, radius), the shared components, the
  app shell (navigation, sidebar, header), and the source of the
  screens the change sits in. The project's exported tokens and
  components (contract role 18) come first when they exist.

When the app is drivable and a screen changes, capture the current
screens of the named areas yourself, one command each, without opening
the images (`proto.mjs look <url> … --shot 00-discovery/recon/screens/<name>.png`;
log in through `--env-cmd` and `env:NAME` fills, never a secret on the
command line). A stack you bring up for this you take down when done.
A missing piece is one line in the notes.

## D1 · The interview

By [references/interview.md](references/interview.md): the voice dump
first, uninterrupted; the restatement in one short message; then
batches of at most four questions through the question tool, your
recommendation first; the razor (ask only what, guessed wrong, changes
the build); infer what is obvious or what the rest of the system
already does, and say it; nothing a scout can answer. Write `notes.md`
every turn: a dead session loses nothing.

Settle early whether a screen changes (a new screen, a new state, a
control, a column, a message he sees): the notes' Starting point says
`Screens: <which>` or `Screens: none`, and `.state.md` says
`screen: yes | no`. On `screen: yes`, dispatch the design-system scout
and the current-screens capture (D0) right then.

The interview ends when the notes have nothing in Open and nothing in
Inferred, and every rule is in the Rules table. Say it in one line and
go to D2.

## D2 · The stories

Dispatch `story-writer (Sonnet 5.5, high)` in write mode with:
`notes.md`, the recon folder,
[references/stories.md](references/stories.md), the template
([stories.md](templates/stories.md)), the `proto.mjs` path and the
language. It writes `stories.md` from the notes, proves it with
`proto.mjs trace none` against the notes' journeys, and returns its
Inferred list and its Open.

Then read `stories.md` whole: you rule on it from here to the close.
Check: each story names its journeys and carries its error-path table;
no two ACs check one behavior; the Out lines match the notes. A miss
goes back to the writer in one message. With no screen, go to D4.

## D3 · The mock, only when a screen changes

**Build.** Wait on the design-system scout's file, then dispatch
`prototype-builder (Sonnet 5.5, medium)` in the background, in build mode, with: `stories.md`, `notes.md`, the recon
folder (its design-system paths and screenshots), the shell
([templates/prototype-shell.html](templates/prototype-shell.html)),
[references/mock.md](references/mock.md), the output path, the
languages, the actors, whether time matters, the `proto.mjs` path, and
the mode (artifact or local). Keep its agent id in `.state.md`. Its
journeys keep the stories' journey ids and step ids (`s1, s2, …` of
each journey); a step the mock adds takes the next free id.

**Rounds.** Send him the link and one line: "follow the Review in the
controls (Next step, or N)". The mock is the product alone, full
screen; its floating controls (hidden with H) carry the review, a
guided path through every state he must see with what to check at
each, and switch the screen, the state, who is looking, the design
variant, the theme and the width. Name a state by its review step
("step 7 of 12, the failed invite"): in a published artifact the
`#<screen>.<state>` links do not reach the page; they work only on a
local file. Journeys are not shown to him. His feedback comes by chat
and by comments on the mock (watch it with `ArtifactComments` after the
first publish). Each batch of feedback is one **round order** to the
same agent, by `SendMessage`: one line per change, each with its source
(`chat`, `comment <id>`), his words, and your restatement. Send the
next order only after the builder's return. Sort each item first:

| Item | Path |
|---|---|
| look, copy, layout, a missing state, a name | straight to the builder; never a question to him |
| a rule, a number, scope, the data shown, a journey added or cut | restated and confirmed by him first, written to the notes as Confirmed, then ordered |

After each builder return, write its URL and version in `.state.md`
and one Mock log row in the notes. A comment is answered once its
change is published ("done in v4").

**Ready is his word, in his own words.** Never ask him for a magic
phrase. When a message of his says the screen is right ("looks good", "go
ahead", "that's it", in whatever language he speaks), restate in one line that you take it as
ready, and lock. When you cannot tell, ask through the question tool.

**Lock.** The rules whose Proof is `[build]` (a one-file mock cannot
show them) go to him first, in one question; his answer fills the
Lock block's `[build]` line. Then tell the builder this version is the
lock candidate: it
renumbers each journey's steps `s1, s2, …` in play order and reports
the old → new map. Then run:

```
node <kit>/skills/stage-discovery/scripts/proto.mjs lock <workstream>/00-discovery/prototype --words "<his words>" [--gap "<where>::<what>" …]
```

It walks once more, copies `versions/v<N>.html`, renders `frames/`,
and writes `LOCK.json`. Write the notes' Lock block and `.state.md`
(`locked: v<N>`).

**Anchor.** Dispatch `story-writer` in anchor mode with: the locked
`versions/v<N>.html`, `LOCK.json`, `frames/manifest.json`, the step
map, `notes.md`, `stories.md`,
[references/stories.md](references/stories.md), the templates
([stories.md](templates/stories.md), [journey.yaml](templates/journey.yaml)),
`proto.mjs` and the language. It writes
`journeys/*.yaml`, moves each AC id onto its locked step, adds a story
for anything the mock revealed that no story holds (each one listed as
Inferred, to be confirmed at the playback), and returns only after
`proto.mjs trace` passes. After the lock the mock changes only by an
amendment (D5).

## D4 · The review: one round

```
node <kit>/skills/stage-discovery/scripts/proto.mjs split <workstream>/00-discovery/stories.md <workstream>/00-discovery/reviews/stories
```

prints the index. Run the workflow by `scriptPath`
(`<kit>/workflows/discovery-review-workflow.js`), with `args`:
`discoveryDir`, `mock` (the locked version, or omit it when no screen
changes), `proto` (absolute paths), `language`, `index` (the JSON
`split` printed, as a value, never a string), and `inlineAgents: true`
with `agentsDir` (`<kit>/agents`) while the agents are not installed.
It returns `.result` inside an envelope; save the result as
`reviews/round-1.json`.

| Section | Who | Asks |
|---|---|---|
| Lenses | `disc-lens (Sonnet 5.5, medium)` × 3 | **in-out**: is every capability In or Out, nothing in limbo? · **coverage**: does every rule have its AC, and does each story pass through limit, dependency failure, permission and repeat? · **acceptance**: can a stranger decide pass or fail on every AC? |
| Double-blind | per story, `blind-reader (Sonnet 5.5, low)` × 2, then `blind-judge (Sonnet 5.5, medium)` | do two readers who see only the story (and the mock, when there is one) understand each AC the same way, and does the mock agree? |

A round the workflow marks invalid is fixed at its cause and run again
before anything is ruled. `[build]` ACs are not read blind.

**Rule** every finding by [references/playback.md](references/playback.md)
and `claude/references/judging.md`, in `reviews.md`
([template](templates/reviews.md)), before any fix moves:

- owner `story-writer` → one apply batch, by `SendMessage`, without
  asking him, the files staged (`git add`) first; you verify each fix
  by `git diff -- <file>` against the finding and rerun `trace`
  (`trace none - …` with no mock);
- his → into the playback, one question per decision;
- for the design → `reviews.md`, never asked;
- dismissed → with the quote or frame that closes it.

## D5 · The playback

By [references/playback.md](references/playback.md): blocks of at most
four stories. Before each block, **one message that explains it to a
newcomer**, in his language: per story, what it is in one sentence, an
example with fixture names and numbers, what happens when it fails, and
the review steps of the story's key moments ("steps 4 to 7 of the
review"; in local mode, the journey's `proto.mjs shots` PNG paths) or,
with no screen, the flow drawn in a
code block. Then the block's question call: **Confirm** ·
**Adjust** · **Cut**, with the review's decisions of his and the
writer's Inferred entries inside each story's question. An adjust that
changes behavior is an **amendment**; the last call carries the design
question.

Every answer is a line in `rulings.md`. When one story is left, propose
the short route in one line; on his yes, write `brief.md` from
`<kit>/skills/lets-cook/templates/brief.md` and load `lets-cook`.

## D6 · The report, the cleanup, the close

**The report is finished before the stage closes**: he validates
through it. The workstream's link is born here; write its URL in
`.state.md`. Dispatch the Explainer's builder now, ask him the close's
question (Video · Deck), and dispatch the builders he picks, in the
background, each with the stage's files and the report folder
(`report/discovery/`), as `claude/docs/stage-report.md` describes:

| Tab | Builder | Brief |
|---|---|---|
| Video | `video-builder (Sonnet 5.5, high)` | the problem and the solution told through the stories, 60–90 s, a motion piece; **not** the mock in use; the fixtures are invented names |
| Deck | `slides-builder (Sonnet 5.5, medium)` | the story map, the rules with their numbers, what stays out, his decisions |
| Explainer | `artifact-builder (Sonnet 5.5, medium)` | with a mock: the locked mock beside a clickable map, story → its ACs → the step or frame each one anchors on; with no screen: the story map with each story's flow drawn |

While they work, clean what this stage created: `prototype/shots/`
(local mode), any scratch frames folder, `_run/`, a recon stack still
up. When they return: every number on a slide is checked against
`stories.md` or the notes; run `gitleaks dir <workstream>` (a finding stops the publish);
publish the page to the workstream's link with the label "discovery closed".

Then: `.state.md` to `stage: design`, commit the workstream folder
(push only on his word), and one message:

| | |
|---|---|
| The link | the workstream's report, Discovery tab |
| The scope | stories · ACs · rules · what is out, one line |
| For the design | his answer to the last question |
| Next | `/clear`, then `/stage-design <slug>` |

## Resuming

Everything is in files. `/stage-discovery <slug>`: run the opening's
steps 1–3, then read `.state.md` (its step, `kit:`, `screen:`, `mode:`,
the mock's URL and version) and `notes.md` (Coverage map, Journeys,
Mock log, Open). In D3, read the unanswered comments before you speak.
The builder of an earlier session is gone: a fresh `prototype-builder`
reads `index.html`, `stories.md` and the notes first. At D4 a saved
`reviews/round-1.json` is never run again: continue from `reviews.md`.

## How to write

Literal sentences, one idea each, concrete values, his words in
quotation marks where they decide something.
