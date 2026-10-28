---
name: stage-discovery
description: Stage 1 of the pipeline. Interviews him until nothing about what to build is open, writes the stories with one acceptance criterion per rule, builds the exact mock when a screen changes, reviews the stories once, and closes on a one-text playback he confirms. Use when /lets-cook routes a demand to the full route, or to resume a discovery by its slug.
argument-hint: "[workstream-slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, Workflow, AskUserQuestion, Artifact, ArtifactComments, Skill, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cp *), Bash(rm *), Bash(git *), Bash(node *), Bash(gitleaks *), Bash(make gitleaks *), Bash(realpath *), Bash(sha256sum *)
---

# Stage 1 · Discovery

Discovery decides **what** is built and how it looks and behaves, never
how it is built. It is a conversation, never a `/goal`. You interview
him; the facts are your job, the decisions are his. At the end the
stories hold every rule he decided, the mock (when a screen changes)
shows every state, and he has read one plain text of what was
understood and said yes.

## The bar

The stage is done when every line holds:

1. Every decision in the design tree has his answer or an Out line;
   nothing was assumed without being shown to him.
2. Every rule he decided has exactly one acceptance criterion (AC), and
   a stranger can judge each one.
3. Every journey has its four error paths (limit, dependency failure,
   permission, repeat) decided or marked Out.
4. When a screen changes, the locked mock is the screen as it will ship,
   in the product's look, only as wide as the change.
5. He confirmed the playback text.
6. The report's Explainer is published.

## The flow

```
/lets-cook → this skill
  D0 recon (background) ∥ D1 interview ◄ him
  → D2 stories
  → D3 mock, when a screen changes ◄ him (rounds until "ready") → lock → stories anchored
  → D4 review (one round) → D5 playback ◄ him → D6 report → /clear, /stage-design <slug>
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| D0 recon | `scout` (Haiku 5.5, high) × N, background | `recon/<topic>.md`, `recon/screens/*.png` |
| D1 interview | you (Opus 5.5, medium) | `notes.md`, written every turn |
| D2 stories | `story-writer` (Sonnet 5.5, high) | `stories.md` |
| D3 mock | `prototype-builder` (Sonnet 5.5, high), then `story-writer` to anchor | `prototype/`, `journeys/*.yaml` |
| D4 review | `discovery-review-workflow.js`: `disc-lens` × 3 (Sonnet 5.5, medium) ∥ per story `story-reader` × 2 (Haiku 5.5, high) → `blind-judge` (Sonnet 5.5, medium); you rule | `reviews/round-1.json`, `reviews.md` |
| D5 playback | you + him | `rulings.md`, his yes, the design answer |
| D6 report | `artifact-builder` (Sonnet 5.5, medium); video and slides only when he asks | the Discovery tab of the workstream's link |

## What you read

| File | When |
|---|---|
| [references/interview.md](references/interview.md) | before the first question |
| [references/stories.md](references/stories.md) | at D2, before you check the stories |
| [references/mock.md](references/mock.md) | at D3, before the build order (the builder reads it too) |
| [references/playback.md](references/playback.md) | at D4, before you rule |
| `<kit>/references/judging.md` | at D4: the scale (blocks · note) and the owners |

The mock's HTML is the builder's; you read the mock through `proto.mjs`.

## Files

```
<designs-root>/<slug>/
├── .state.md            stage, step, kit, screen (yes|no), mode (artifact|local), builder id, mock url + version, locked, report url
├── .gitignore           _run/, **/.remotion/, **/film/assets/, **/stills/
├── rulings.md · dreaming-notes.md
├── report/              the workstream's link: report.json + discovery/
└── 00-discovery/
    ├── notes.md         the interview, every turn (template: templates/notes.md)
    ├── recon/           <topic>.md per scout, screens/*.png
    ├── stories.md
    ├── prototype/       only when a screen changes: index.html, versions/, walks/, frames/, LOCK.json
    ├── journeys/        only with a locked mock: J<n>-<name>.yaml
    ├── reviews/         stories/ (one file per story), round-1.json
    └── reviews.md       your rulings (template: templates/reviews.md)
```

`proto.mjs` is `node <kit>/skills/stage-discovery/scripts/proto.mjs`
(`walk`, `frames`, `look`, `shots`, `lock`, `trace`, `split`,
`assemble`, `model`; its header documents each). It needs
`playwright-core` and a Chromium; when one is missing, say so in one
line with the install command from its header. With no screen, only
`split` and `trace none` run.

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..` is the kit; write
   it in `.state.md` as `kit:` and give agents absolute paths.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open: the
   pulls, who else is working.
3. **His attention.** When another workstream holds him in a discovery
   or a design debate, say so in one line, ask that session by
   `SendMessage` to tell this one when he is free, and wait.
4. **New:** the slug `YYYY-MM-DD-<short-kebab-name>`, the folder,
   `.state.md` (`stage: discovery`, `step: D1`), `.gitignore`, and
   `notes.md` from the template, with what `/lets-cook` heard as
   Confirmed. **Resume:** the last section.
5. Start D0 in the same turn. Write `step: D<n>` in `.state.md` at the
   start of every step.

Without the `Artifact` tool (a headless or cloud session) the stage
runs in **local mode** (`mode: local`): the mock is shown as `proto.mjs
shots` PNG paths, comments come by chat, and the report waits in
`report/` for the next local session. Without the question tool, the
questions go as numbered text, your pick first.

## D0 · Recon, in the background

From his first sentences, one `scout` per question, in parallel; you
talk to him while they read. Each writes `recon/<topic>.md`, every
claim quoted with `path:line`:

- the feature map of each area he names, and what the system does next
  to it today (what you will infer from);
- other workstreams touching the same areas (`_coordination.md` and
  their `.state.md`);
- domain words he used that the product already uses for something
  else;
- when a screen changes: the project's `design-system.md` (its
  standards book) and the design system as paths (tokens, shared
  components, the app shell, the source of the screens around the
  change), the project's exported tokens first.

When a screen changes and the app runs, capture the current screens of
the named areas: `proto.mjs look <url> … --shot recon/screens/<name>.png`,
logging in through `--env-cmd` and `env:NAME` fills. A stack you bring
up for this you take down.

## D1 · The interview

By [references/interview.md](references/interview.md): his dump first,
your restatement, then the design tree in rounds through the question
tool, each question worded so yes takes your pick. Settle early whether
a screen changes (`.state.md` `screen: yes | no`); on yes, dispatch the
design-system scout and the screen capture right then. Write
`notes.md` every turn: a dead session loses nothing.

Done when the frontier is empty: nothing in Open, nothing in Inferred
he has not seen, every rule in the Rules table. Say so in one line and
go to D2.

## D2 · The stories

Dispatch `story-writer` in write mode with `notes.md`, the recon
folder, [references/stories.md](references/stories.md),
[templates/stories.md](templates/stories.md), `proto.mjs` and his
language. It returns after `proto.mjs trace none` passes, with its
Inferred list and Open.

Read `stories.md` whole: you rule on it until the close. Check each
story names its journeys and has its error-path table, no two ACs check
one behavior, and the Out lines match the notes. A miss goes back to
the writer in one message. No screen: go to D4.

## D3 · The mock, when a screen changes

By [references/mock.md](references/mock.md).

**Build.** Once the design-system scout has written, dispatch
`prototype-builder` in build mode, in the background, with
`stories.md`, `notes.md`, the recon folder,
[templates/prototype-shell.html](templates/prototype-shell.html),
`references/mock.md`, the output path, his language, the actors,
whether time matters, `proto.mjs` and the mode. Keep its agent id in
`.state.md`.

**Rounds.** Send him the link and one line: "Ctrl+→ walks every state;
the bar on top says what to check". His feedback comes by chat and by
comments on the mock (`ArtifactComments`). Each batch is one round
order to the same builder by `SendMessage`, one line per change: its
source (`chat`, `comment <id>`), his words, your restatement. Sort each
item first:

| Item | Path |
|---|---|
| look, copy, layout, a missing state, a name | straight to the builder |
| a rule, a number, scope, the data shown, a journey added or cut | restated to him and confirmed first, written to the notes as Confirmed, then ordered |

After each return, write the URL and version to `.state.md` and a Mock
log row to the notes; answer a comment once its change is published
("done in v4").

**Ready is his word, in his own words.** When a message says the screen
is right ("looks good", "that's it", in any language), say in one line
that you take it as ready, and lock. When you cannot tell, ask.

**Lock.** Rules a one-file mock cannot show (Proof `[build]` in the
notes) go to him in one question first. Then the builder renumbers each
journey's steps in play order and reports the old → new map. Then:

```
node <proto.mjs> lock <workstream>/00-discovery/prototype --words "<his words>" [--gap "<where>::<what>" …]
```

Write the notes' Lock block and `.state.md` (`locked: v<N>`).

**Anchor.** Dispatch `story-writer` in anchor mode with the locked
`versions/v<N>.html`, `LOCK.json`, `frames/manifest.json`, the step map,
`notes.md`, `stories.md`, `references/stories.md`, the templates
(`stories.md`, `journey.yaml`), `proto.mjs` and the language. It
returns after `proto.mjs trace` passes. From here the mock changes only
by an amendment (D5).

## D4 · The review, one round

```
node <proto.mjs> split <workstream>/00-discovery/stories.md <workstream>/00-discovery/reviews/stories
```

prints the index. Run `<kit>/workflows/discovery-review-workflow.js`
by `scriptPath` with `args`: `discoveryDir`, `mock` (the locked
version; omitted with no screen), `proto`, `language`, `index` (the
JSON `split` printed, as a value), and `inlineAgents: true` with
`agentsDir: <kit>/agents`. Save its `.result` as `reviews/round-1.json`.

| Part | Asks |
|---|---|
| Lenses (`disc-lens` × 3) | **in-out**: is every capability In or Out? · **coverage**: does every rule have its AC, and every story its four error paths? · **acceptance**: can a stranger judge every AC? |
| Double-blind (per story: `story-reader` × 2, then `blind-judge`) | do two readers who see only the story (and the mock) understand each AC the same way, and does the mock agree? |

A round the workflow marks invalid is fixed at its cause and run again
before anything is ruled. Then rule every finding in `reviews.md` by
[references/playback.md](references/playback.md):

- the writer's → one apply batch by `SendMessage`, the files staged
  (`git add`) first; verify each fix by `git diff -- <file>` against
  its finding and rerun `trace`;
- his → into the playback;
- for the design → `reviews.md`, never asked here;
- dismissed → with the quote or frame that closes it.

## D5 · The playback

By [references/playback.md](references/playback.md): **one message**
that says in plain words what was understood, then **one question
call** (his decisions · "Is this what we build?" · the design
question). An adjust that changes behavior is an amendment. Every
answer is a line in `rulings.md`.

When the demand shrank to one story, propose the short route in one
line; on his yes, write `brief.md` from
`<kit>/skills/lets-cook/templates/brief.md` and load `lets-cook`.

## D6 · The report and the close

The link is born here; write its URL in `.state.md`. Dispatch the
Explainer's builder now; meanwhile ask him the close's question (also
make: Video · Deck, none is a valid answer) and dispatch what he picks.
Each builder gets the stage's files and `report/discovery/`, as
`<kit>/../docs/stage-report.md` describes:

| Tab | Builder | Brief |
|---|---|---|
| Explainer (always) | `artifact-builder` | **as visual as possible**: what will be built, understood by skimming. Each flow drawn and animated step by step, the main path then where it branches on a failure; the rules' numbers as visuals; the locked mock's frames where a screen changes. Motion wherever it shows something moving through the flow, never as decoration. Text only as short labels |
| Video (when asked) | `video-builder` | the problem and the solution told through the flows, 60–90 s; invented names for the people |
| Deck (when asked) | `slides-builder` | the flows, the rules with their numbers, what stays out, his decisions |

While they work, remove what the stage left behind: `prototype/shots/`,
scratch frame folders, `_run/`, a recon stack still up. When they
return, check every number on a slide against `stories.md` or the
notes, run `gitleaks dir <workstream>` (a finding stops the publish),
and publish to the workstream's link labelled "discovery closed".

Then `.state.md` → `stage: design`, commit the workstream folder (push
on his word), and one message: the link · the scope in one line
(stories · ACs · rules · what is out) · his design answer · the next
play:

```
/clear
/stage-design <slug>
```

## Resuming

`/stage-discovery <slug>`: the opening's steps 1–3, then `.state.md`
(step, kit, screen, mode, the mock's URL and version) and `notes.md`
(Coverage, Journeys, Mock log, Open). In D3, read the unanswered
comments before you speak; the builder of an earlier session is gone,
so a fresh `prototype-builder` reads `index.html`, `stories.md` and the
notes first. At D4, a saved `reviews/round-1.json` is never run again:
continue from `reviews.md`.
