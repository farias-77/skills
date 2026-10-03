# The stage report

Every stage closes with three layers of the same report: a **video**,
**slides** and the **blueprint**. They are one path, read in that
order, each one a step up in detail:

> Watch the video to understand how it works, then the slides for the
> details, and the full blueprint only when it is really needed: always
> "if I want more detail, I go up one layer."

| Layer | What it answers | Size | Made by |
|---|---|---|---|
| Video | how the stage's result works | 1–2 min, ≤ 10 MB | `video-scribe (Sonnet 5.5, medium)` + `claude/video/render.sh` |
| Slides | the details he follows day to day | 8–15 slides, ≤ 40 words each | `slides-scribe (Sonnet 5.5, high)` |
| Blueprint | everything, with the documents behind the click | as today | `claude/blueprint/build.mjs` |

**The rule:** each layer is enough on its own. Nothing in the video is
missing from the slides; nothing in the slides is missing from the
blueprint. He goes up one layer only when he wants more detail, so a
layer never sends him up for something it should have shown.

This procedure is the stage's last step. It runs once the stage's own
close has written its blueprint JSON, and it replaces "present the
blueprint URL": the stage presents the three layers instead.

## Inputs

- the stage's blueprint JSON (the report block first: it is the plain
  layer he already reads in voice);
- the stage's documents, for the exact numbers and their `path:line`;
- the workstream's language (`blueprint/workstream.json`);
- the blueprint's URL, when an earlier stage already published it
  (in `.state.md`).

| Stage | Tab | Blueprint JSON | Documents |
|---|---|---|---|
| discovery | `discovery` | `blueprint/*.json` | `00-discovery/` |
| design | `design` | `blueprint/design/*.json` | `01-design/` |
| plan | `plan` | `blueprint/plan/` | `02-plan/` |
| execute | `execution` | `blueprint/execution/execution.json` | `03-execution/` |
| release | `release` | `blueprint/release/release.json` | `04-release/` |
| close | `close` | `blueprint/close/retro.json` | `05-close/` |

## Where the files live

```
<workstream>/
├── blueprint/stage-report.json     # per tab: the video's path and the slides' link (schema/stage-report.md)
└── report/<tab>/
    ├── storyboard.json             # video-scribe's
    ├── video.mp4                   # the render, ≤ 10 MB, committed with the workstream
    └── project/                    # slides-scribe's deck, in the Slides type's format
        ├── deck.json
        └── slides/<id>.html
```

## The order

```
1 blueprint   node claude/blueprint/build.mjs <workstream>          (the stage's own close, as today)
2 video       video-scribe (Sonnet 5.5, medium) → report/<tab>/storyboard.json
              → claude/video/render.sh … report/<tab>/video.mp4    (background, nice, concurrency 2)
3 slides      slides-scribe (Sonnet 5.5, high) → report/<tab>/project/   (dispatched while the video renders)
4 publish     a. the deck Artifact, created from the Slides type   → slides URL
              b. stage-report.json + rebuild + the blueprint with the video beside it → blueprint URL
5 link        the deck's placeholders ← the blueprint URL; publish the deck files
6 message     video → slides → blueprint, one message
```

**1 · The blueprint.** The stage builds it as it does today. A build
that refuses stops here: the report is built on a blueprint that
builds.

**2 · The video.** Dispatch `video-scribe (Sonnet 5.5, medium)` with
the stage, the workstream path, the language, the stage's focus
paragraph (below) and `report/<tab>/` as its folder. It writes
`storyboard.json` and renders it:
`claude/video/render.sh report/<tab>/storyboard.json report/<tab>/video.mp4`.
The render runs in the background, under `nice`, two browser tabs at
most (`render.sh` fixes both), and keeps the file under 10 MB.

**3 · The slides.** Dispatch `slides-scribe (Sonnet 5.5, high)` with
the same stage, path, language and focus paragraph, `report/<tab>` as
`<root>`, and the date. It does not need the video: dispatch it as
soon as the storyboard is written. It writes `project/deck.json` and
`project/slides/<id>.html`, with two placeholders for the links it
cannot know, `__VIDEO_URL__` and `__BLUEPRINT_URL__`.

**4 · Publish.**

- **a. The deck.** One new Artifact per stage, created from the Slides
  type: `Artifact` publish with
  `type_url: "https://claude.ai/artifact/8jTsAFQMFDb2oA8MsPJ2eL"`,
  `title: "<workstream title> · <Stage>"`,
  `auto_open: "after_first_write"`, and no files. The reply carries
  the deck's URL. The deck's look is the house identity in
  `slides-scribe`: no design system is installed.
- **b. The blueprint.** Add the tab to `blueprint/stage-report.json`
  (`{"<tab>": {"video": "report/<tab>/video.mp4", "slides": "<deck URL>"}}`,
  keeping the earlier stages' keys), rebuild, and publish
  `blueprint.html` with the video beside it:
  `files: {"report/<tab>/video.mp4": "<workstream>/report/<tab>/video.mp4"}`.
  An earlier stage's blueprint is updated at its URL; the earlier
  videos stay published, because files left out of a publish are
  kept. The build refuses a missing video, one over 10 MB, a tab that
  is not on the page or a slides link that is not a claude.ai
  Artifact. The page shows, above the tab's first section, the bar
  **Assista · Leia · Aprofunde**: the player, the link to the slides,
  and "you are here".

**5 · Link both ways.** The blueprint already links the slides (4b).
Now replace the deck's placeholders, on the slide files only:
`__VIDEO_URL__` with `<blueprint URL>#layers-<tab>` (the player at the
top of the tab) and `__BLUEPRINT_URL__` with `<blueprint URL>#<tab>`.
Then publish the deck to its URL: `root: "<workstream>/report/<tab>"`,
`file_path: "<root>/project/deck.json"`, and every slide in `files` as
`{"project/slides/<id>.html": "project/slides/<id>.html"}`. The
Artifact tool publishes only what the session has read, so the session
reads the slide files (small, by design) before this call. It does not
re-read, render or screenshot the deck after it is published.

**6 · The message.** One message, in his language, in this order, and
nothing before it:

```
▶ Vídeo      <blueprint URL>#layers-<tab>   1–2 min · comece por aqui
▤ Slides     <deck URL>                     <n> slides · os detalhes
◧ Blueprint  <blueprint URL>                tudo · só se precisar
```

Then what the stage's own close asks of him (approve, adjust), as the
stage skill says.

**When a layer fails.** A failed render or a deck that cannot be
written never holds the stage's close. The layer that exists is
published; `stage-report.json` carries only the field that exists, and
the bar shows the missing step greyed. The failure is noted in the
workstream's `dreaming-notes.md`.

**After adjustments.** When he sends adjustments and the stage applies
them, the blueprint is rebuilt and republished as today. The video and
the slides are redone only when the adjustment changes what they show;
then the same deck URL and the same video path are reused.

## What each stage shows

The session passes the stage's paragraph to both scribes. The video
tells it as a story in one or two minutes; the slides give the detail,
one idea per slide.

**Discovery — the demand, the stories, the decisions.** What is being
asked and for whom, in the PR-FAQ's headline and the problem in one
picture; the stories as a map, one line each, with what each lets the
persona do; what stays out; the bets still open; and the decisions he
took in the interview, with the inferences that were confirmed in his
place on their own slide.

**Design — how it works, the decisions taken, the risks.** The one
picture of the system and the flow that matters most, step by step;
what it costs at each scale; the decisions he took (those against the
recommendation first) and, apart, the ones the conductor or a writer
took in his place; the risks accepted, with who accepted them; how it
reaches the first environment; the review in numbers.

**Plan — the cut, the order, the foundation.** From A to B in one
picture; the foundation and why it comes first; the entries as a
graph, with what can run in parallel and the edges that force an
order; the proof each entry must show; what the pre-flight still needs
from him; the rulings the conductor took in his place, listed for veto.

**Execute — what was built, the proof, what was decided in his place.**
What is merged, entry by entry, against the plan's graph; the proof
that it works, as the commands and results the verifier ran; what
blocked and how it was fixed; the choices the builders and the session
made in his place, and what is parked for his ruling at the audit.

**Release — what went live, the gates.** What is in production, with
its versions; the path through staging and production, gate by gate,
with the reds and their fixes; his "go?" verbatim; what the watch
read after the deploy and what is still left to an owner.

**Close — what went wrong, the ideas.** The workstream in numbers;
what worked; what went wrong, each with its cost and where it
happened; the ideas each one suggests and where they would land; his
own notes verbatim; what the sweep leaves for him to run.

## Costs and limits

- **The render** runs once per stage, in the background, under `nice`
  with concurrency 2 (`render.sh`): the machine is shared. It is redone
  only when the storyboard changes.
- **The video** is ≤ 10 MB (`render.sh` aims at 9.5; the build refuses
  more), so the blueprint Artifact stays far under its limits across
  six stages.
- **The deck** has 8–15 slides, ≤ 40 words and ≤ 200 elements each;
  `slides-scribe` checks itself before it reports.
- **The session's context** pays for the slide files it must read to
  publish them and nothing else: it never reads the storyboard or the
  stage's documents for this step; the scribes do.
