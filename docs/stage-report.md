# The stage report

Every stage closes with a report in layers of the same content, read
in order, each one a step up in detail:

> Watch the video to understand how it works, then the slides for the
> details, and the full blueprint only when it is really needed: always
> "if I want more detail, I go up one layer."

Not every stage has every layer. A video is made where a picture in
motion shows what the slides cannot: the mock in use, the proposal,
the graph. Where the result is something he has already used himself,
there is no video.

| Stage | Video | Slides | Blueprint |
|---|---|---|---|
| Discovery | the locked mock in use, 60–90 s | yes | yes |
| Design | the proposal, at the start of the debate (D3) and at the end (D6) | yes, re-rendered at each round of the debate | yes |
| Plan | the graph, 60–90 s | yes | yes |
| Execute | **none**: his hands-on with the running app is the validation, and nothing is recorded while he uses it | yes | yes |
| Release | **none** | yes | yes |
| Close | the launch film, 16:9 only, on its own launch page | none | the Retro tab |

| Layer | What it answers | Size | Made by |
|---|---|---|---|
| Video | how the stage's result works | the stage's length above, ≤ 10 MB | `video-scribe (Sonnet 5.5, medium)` + `claude/video/render.sh` |
| Slides | the details he follows day to day | 8–15 slides, ≤ 40 words each | `slides-scribe (Sonnet 5.5, high)` |
| Blueprint | everything, with the documents behind the click | as today | `claude/blueprint/build.mjs` |

**The rule:** each layer is enough on its own. Nothing in the video is
missing from the slides; nothing in the slides is missing from the
blueprint. He goes up one layer only when he wants more detail, so a
layer never sends him up for something it should have shown.

This procedure is the stage's last step. It runs once the stage's own
close has written its blueprint JSON, and it replaces "present the
blueprint URL": the stage presents its layers instead.

**The stage waits for its video.** A stage with a video does not close
until the render has finished: the video is made only when the stage
is really done, and the message that closes the stage carries it.

**The close is the exception.** Stage 6 makes no review video and no
slides. Its two layers are the **launch film**, on its own launch page
(web copies under the artifact asset cap; the master as a local file),
and the **Retro tab** of the blueprint. The film is for the people who
use the product; the retro is for the weekly retro. The close skill
and its `references/launch.md` ("Delivery") fix the steps;
`stage-report.json` gets no `close` key, because the blueprint's videos
stop at 10 MB.

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
├── blueprint/stage-report.json     # per tab: the video's path (when the stage has one) and the slides' link (schema/stage-report.md)
└── report/<tab>/
    ├── storyboard.json             # video-scribe's (discovery, design, plan)
    ├── video.mp4                   # the render, ≤ 10 MB, committed with the workstream (discovery, design, plan)
    └── project/                    # slides-scribe's deck, in the Slides type's format
        ├── deck.json
        └── slides/<id>.html
```

## The order

```
1 blueprint   node claude/blueprint/build.mjs <workstream>          (the stage's own close, as today)
2 video       discovery, design, plan only:
              video-scribe (Sonnet 5.5, medium) → report/<tab>/storyboard.json
              → claude/video/render.sh … report/<tab>/video.mp4    (nice, concurrency 2; the stage waits for it)
3 slides      slides-scribe (Sonnet 5.5, high) → report/<tab>/project/   (dispatched while the video renders)
4 publish     a. the deck Artifact, created from the Slides type   → slides URL
              b. stage-report.json + rebuild + the blueprint (the video beside it, when there is one) → blueprint URL
5 link        the deck's placeholders ← the blueprint URL; publish the deck files
6 message     [video →] slides → blueprint, one message
```

**1 · The blueprint.** The stage builds it as it does today. A build
that refuses stops here: the report is built on a blueprint that
builds.

**2 · The video** (discovery, design and plan; execute and release
skip this step). Dispatch `video-scribe (Sonnet 5.5, medium)` with the
stage, the workstream path, the language, the stage's focus paragraph
(below) and `report/<tab>/` as its folder. It writes `storyboard.json`
and renders it:
`claude/video/render.sh report/<tab>/storyboard.json report/<tab>/video.mp4`.
The render runs under `nice`, two browser tabs at most (`render.sh`
fixes both), queues behind any other render on the machine, and keeps
the file under 10 MB. The slides are written while it renders; the
stage's close waits for it.

**3 · The slides.** Dispatch `slides-scribe (Sonnet 5.5, high)` with
the same stage, path, language and focus paragraph, `report/<tab>` as
`<root>`, and the date. It does not need the video: in a stage with
one, dispatch it as soon as the storyboard is written. It writes
`project/deck.json` and `project/slides/<id>.html`, with a placeholder
for each link it cannot know: `__BLUEPRINT_URL__` always, and
`__VIDEO_URL__` only in a stage with a video (the brief says which).

**4 · Publish.**

- **a. The deck.** One new Artifact per stage, created from the Slides
  type: `Artifact` publish with
  `type_url: "https://claude.ai/artifact/8jTsAFQMFDb2oA8MsPJ2eL"`,
  `title: "<workstream title> · <Stage>"`,
  `auto_open: "after_first_write"`, and no files. The reply carries
  the deck's URL. The deck's look is the house identity in
  `slides-scribe`: no design system is installed. Design makes one
  more deck the same way before its report: the proposal, in
  `01-design/presentation/`, with its video beside it and no blueprint
  placeholder; its slides are re-rendered at each round of the debate,
  its video is not.
- **b. The blueprint.** Add the tab to `blueprint/stage-report.json`
  (`{"<tab>": {"video": "report/<tab>/video.mp4", "slides": "<deck URL>"}}`,
  or `{"<tab>": {"slides": "<deck URL>"}}` for execute and release,
  keeping the earlier stages' keys), rebuild, and publish
  `blueprint.html`, with the video beside it when there is one:
  `files: {"report/<tab>/video.mp4": "<workstream>/report/<tab>/video.mp4"}`.
  An earlier stage's blueprint is updated at its URL; the earlier
  videos stay published, because files left out of a publish are
  kept. The build refuses a missing video, one over 10 MB, a tab that
  is not on the page or a slides link that is not a claude.ai
  Artifact. The page shows, above the tab's first section, the bar
  **Watch · Read · Dig in** (in the workstream's language): the
  player, the link to the slides, and "you are here". On the Execution
  and Release tabs the bar has no Watch step.

**5 · Link both ways.** The blueprint already links the slides (4b).
Now replace the deck's placeholders, on the slide files only:
`__VIDEO_URL__` (when the deck has it) with
`<blueprint URL>#layers-<tab>` (the player at the top of the tab) and
`__BLUEPRINT_URL__` with `<blueprint URL>#<tab>`. Then publish the deck
to its URL: `root: "<workstream>/report/<tab>"`,
`file_path: "<root>/project/deck.json"`, and every slide in `files` as
`{"project/slides/<id>.html": "project/slides/<id>.html"}`. The
Artifact tool publishes only what the session has read, so the session
reads the slide files (small, by design) before this call. It does not
re-read, render or screenshot the deck after it is published.

**6 · The message.** One message, in his language, in this order, and
nothing before it:

```
▶ Vídeo      <blueprint URL>#layers-<tab>   1–2 min · comece por aqui      (discovery, design, plan)
▤ Slides     <deck URL>                     <n> slides · os detalhes
◧ Blueprint  <blueprint URL>                tudo · só se precisar
```

Execute and release send the last two lines only. Then what the
stage's own close asks of him (approve, adjust), as the stage skill
says.

**Local mode.** Without the Artifact tools (a headless or cloud run),
nothing is published: the deck and the video stay in `report/<tab>/`;
in each slide file `__VIDEO_URL__` becomes the relative path to
`video.mp4` and `__BLUEPRINT_URL__` the relative path to
`blueprint.html`; `stage-report.json` names, as `slides`, the deck's
first slide (`report/<tab>/project/slides/<id>.html`); the message
gives the local paths.

**When a layer fails.** The stage waits for its render, but a render
that fails, or a deck that cannot be written, is not retried past the
scribe's own one fix. The layer that exists is published;
`stage-report.json` carries only the field that exists, and the bar
shows the missing step greyed. The failure is noted in the
workstream's `dreaming-notes.md`.

**After adjustments.** When he sends adjustments and the stage applies
them, the blueprint is rebuilt and republished as today. The video and
the slides are redone only when the adjustment changes what they show;
then the same deck URL and the same video path are reused.

## What each stage shows

The session passes the stage's paragraph to the scribes. Where there
is a video, it tells the story in its length; the slides give the
detail, one idea per slide.

**Discovery — the mock he locked, the stories, the decisions.** The
video is short and alone in its job: 60 to 90 seconds of the locked
mock being used, from its journey frames in order, so he re-watches
what he approved, and nothing else. The slides add the rest: what is
being asked and for whom, in the PR-FAQ's headline; the stories as a
map, one line each, with what each lets the persona do; the rules;
what stays out; and the decisions he took in the interview, with the
inferences confirmed in his place on their own slide.

**Design — how it works, the decisions taken, the risks.** The video
shows the proposal: at D3 the one the debate starts from, at D6 the
one it closed on. The one picture of the system and the flow that
matters most, step by step; what it costs at each scale; the decisions
he took (those against the recommendation first) and, apart, the ones
the conductor or a writer took in his place; the risks accepted, with
who accepted them; how it reaches the first environment; the review in
numbers. And **why it is this size**: what is done well, what was
relaxed and the evolution path as the way it grows, where the
architect disagreed with him and how it was settled, and what the
critic cut.

**Plan — the graph, the width, the foundation.** The video is 60 to 90
seconds of the graph. The graph as one flow: the foundation, the
entries side by side, the integration entry; the critical path drawn
in the hot tone and the start order; the few edges that force an order
and the proof behind each; the entries built by two builders, back and
front on the design's Contract; the prerequisites only he can hand
over; every choice the conductor made in his place, listed for veto.

**Execute — slides and blueprint only.** No video: he used the app
himself at the hands-on, and that is the validation. What is merged,
entry by entry, against the plan's graph; the proof that it works: the
ACs with their tests, the gate, the reviewer's and the QAs' findings;
what blocked and how it was fixed; the adjustments `A.<n>` he asked
for at the hands-on and what each changed; the choices the builders
and the session made in his place, and what is parked for his ruling
at the audit.

**Release — slides and blueprint only.** What is in production, with
its versions; his play verbatim; the path from the merge into `main`
through staging and production, step by step, with the smokes, the
reds and the one fix; the rollout (the candidate smoked on its tag,
the shift) or the straight deploy and its smoke; the 15-minute watch
against the previous revision; any rollback, with its trigger, and his
answer before the production deploy that followed it; the alarms'
first evaluation and what is still left to an owner.

**Close — the launch film and the Retro tab; no slides.** The film, on
the launch page, is what he forwards: the need, what is new, and how
to use every new feature, step by step on the real product, in one
16:9 cut (stage-close, "Delivery"). The Retro tab is the blueprint
layer, written for the weekly retro rather than for him: the
workstream in numbers from each stage's telemetry; what went well;
where it got stuck, each with where the time went; up to three ideas,
kept as a record in the workstream (`05-close/retro.md`); his own
notes verbatim.

## Costs and limits

- **The render** runs once per stage that has a video, under `nice`
  with concurrency 2 (`render.sh`): the machine is shared. It is redone
  only when the storyboard changes.
- **The video** is ≤ 10 MB (`render.sh` aims at 9.5; the build refuses
  more), so the blueprint Artifact stays far under its limits across
  the stages.
- **The deck** has 8–15 slides, ≤ 40 words and ≤ 200 elements each;
  `slides-scribe` checks itself before it reports.
- **The session's context** pays for the slide files it must read to
  publish them and nothing else: it never reads the storyboard or the
  stage's documents for this step; the scribes do.

**Never commit the renderer's cache.** Remotion keeps a ~220 MB browser in a `.remotion/` folder next to wherever it runs; the kit runs from its own folder, and the workstream's `.gitignore` (written by discovery when it creates the folder) carries `**/.remotion/` as a second fence.
