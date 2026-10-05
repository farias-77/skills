# The stage report

Each workstream has **one link**. The page has a rail of stages on the
left, and each stage has three tabs: **Video · Deck · Explainer**. The same
link fills in as each stage finishes.

```
┌──────────────┬───────────────────────────────────────────┐
│ Operations   │  ● CLOSED · 05/10 14:20                   │
│              │  Design                                   │
│ ● Discovery  │  Video   Deck   Explainer                 │
│ ● Design  ◀  │  ┌─────────────────────────────────────┐  │
│ ◐ Plan       │  │  player / slides / explainer        │  │
│ ○ Execute    │  └─────────────────────────────────────┘  │
│ ○ Release    │  time · cost · your touches               │
│ ○ Close      │                                           │
└──────────────┴───────────────────────────────────────────┘
● closed   ◐ running   ○ not yet          (phone: the rail becomes a top bar)
```

**The report is finished before the stage closes.** The user validates
much of the work through it, so the stage's closing message goes out only
when its three tabs are published, and that message carries the link.

## What each tab shows

| Stage | Video | Deck | Explainer |
|---|---|---|---|
| Discovery | the problem and the solution told through the stories, 60–90 s | the story map, rules, what stays out, his decisions | the locked mock + a clickable map of stories → ACs |
| Design | the proposal: one picture of the system, the main flow, the evolution path | decisions (against the recommendation first), risks accepted, what the guard cut | the architecture: layers, data in motion, the v1 → v2 → v3 selector |
| Plan | the graph assembling: contract commit, entries in parallel, critical path | entries, edges and why, merge points with other fronts, what was decided in his place | the clickable DAG (each node: ACs, files, dependencies) |
| Execute | what was built, real screens in motion | per entry: ACs → proofs, findings, A.n, what is parked | the replay of the DAG on a timeline: what ran when, where the time went |
| Release | main → staging → tag → production, smokes and the watch, 30–45 s | versions, notes, smokes, rollback if any | the release timeline; with an incident, the incident drawn |
| Close | **for users**: a tutorial of the new screens, or a motion piece of the idea if only the backend changed, 1–3 min, recorded on staging | the retro (up to 5 per section) + the numbers + the "what's new" text to paste | the workstream's numbers: time, cost and touches per stage, against earlier workstreams |

**Short route and hotfix:** the rail is **Build · Release · Close**. Build
and Release have only the Deck. The Close makes the users' video only when
a screen users see changed. Under each stage, its three numbers (time,
cost, his touches) come from the telemetry.

## Who builds what

| Piece | Who | How |
|---|---|---|
| Video | `video-builder (Sonnet 5.5, medium)` | `make-it-a-movie`, one render (`claude/video/render.sh`) |
| Deck | `slides-builder (Sonnet 5.5, medium)` | `pitch-it-for-me`, HTML slides paged inside the report |
| Explainer · discovery, design, a release incident | `artifact-builder (Sonnet 5.5, medium)` | `draw-it-for-me` |
| Explainer · plan, execute, release, close | **no agent**: the template `claude/report/explainer.html` + an `explainer.json` the session fills | from `plan.graph.json`, the board, `trace.md` or the telemetry |
| The page (rail + tabs) | the fixed template `claude/report/shell.html` + `report.json` | no build step |
| Publishing | the stage session (Opus 5.5, high) | Artifact, always to the same URL |

The builders run **in parallel** and never read each other's work. Each
brief carries the stage's line of the table above, the source files, the
language and the output path.

## The order, at every stage's close

```
stage work done
  → report.json: this stage "running", its tabs "building", its numbers from
    node claude/scripts/telemetry.mjs <slug> --stage <stage> --ws <workstream> --out -
  → in parallel: video-builder · slides-builder · artifact-builder (or the session fills explainer.json)
  → wait for all three (renders queue on the machine, one at a time)
  → gitleaks dir <workstream>; a finding stops the publish (a leak, per the security standard)
  → the session reads the new text files, then publishes to the SAME url: index.html, report.json and this stage's files only
  → report.json: the stage "closed" with closedAt, each tab "ready" (or "failed" with why); publish once more
  → the closing message: the link (…#<stage>), then what the stage asks of him
```

**The design debate's video** is the exception that runs early. At the
start of the debate, the proposal's deck goes out first, with the question
"Closed / I have points" and "the video arrives in ~N min". The video
follows: at most 60 s, 720p at 24 fps, rendered with `--first` so it goes
ahead of the queue. Both are published on the link at once (Design,
running). This video stays the Design tab's video, unless the debate
added or removed a part of the system; then it is rendered again from the
closed proposal.

**The close** waits for its users' video, which is the close's product.
Recording starts as soon as the release is green on staging. The video
is rendered at `report/close/video.mp4` (`--size 1080 --max-mb 15`), where
the Close tab plays it, and goes out as that `.mp4` plus the "what's new" text for him to forward;
nothing is published outside the company without his approval.

**When a piece fails** (a render that dies, a deck that cannot be
written), the builder gets one fix of its own and no more. The tab is set
to `failed` with one line of why, a line goes to `dreaming-notes.md`, and
the stage closes with the tabs that exist.

**After an adjustment**, only the affected piece is rebuilt, at the same
path, and republished with a label ("design · adjusted").

**Without the Artifact tool** (a cloud or headless run), the pieces stay in
`report/` and the next local session publishes them.

## Where the files live

```
<workstream>/report/
├── index.html            the shell, copied from claude/report/shell.html at discovery, <title> set to the workstream's name
├── report.json           stages, states, numbers, tabs
└── <stage>/
    ├── video.mp4         video-builder's render; its source is film/film.tsx (assets/ deleted after the render)
    ├── deck/             deck.json, theme.css, 01.html …
    ├── explainer.html    artifact-builder's page, or a copy of claude/report/explainer.html
    └── explainer.json    (template stages only)
```

**The first publish** (discovery; on the short route and the hotfix,
the short close, which publishes all three stages at once): copy the shell to `report/index.html`,
set its `<title>`, then publish it with `icon: "report"` and the label
"discovery closed" (or "closed"). Save the URL in `.state.md`. Every later stage
publishes to that `url`. It sends only its own files, because files left
out of a publish are kept, and it uses a label ("plan closed"), so the
version history is the workstream's timeline.

Limits are wide: 7 videos of at most 15 MB is about 90 MB, against 256 MB
per version.

## report.json

```json
{
  "title": "Orders", "slug": "2026-10-05-orders", "lang": "pt-BR", "route": "full", "updatedAt": "05/10 16:40",
  "notices": [{"tone": "warn", "text": "Design video renders after the plan's."}],
  "stages": [
    {"id": "design", "name": "Design", "state": "closed", "closedAt": "05/10 14:20",
     "numbers": {"time": "2 h 05 min", "cost": "US$ 5,80", "touches": "3"},
     "tabs": {"video": {"state": "ready", "file": "design/video.mp4", "seconds": 74},
              "deck": {"state": "ready", "dir": "design/deck"},
              "explainer": {"state": "ready", "file": "design/explainer.html"}}}
  ]
}
```

- `stages[].id`: `discovery` `design` `plan` `execute` `release` `close`, or
  `build` `release` `close` on the short route and the hotfix.
- `state`: `closed` · `running` · `todo`.
- A tab's `state`: `ready` · `building` · `failed` (with `why`) · `none`
  (not made for this stage, with `why`).
- `lang`: `en` or `pt-BR` (the shell's own words).
- `notices` are the operations lines on the rail; drop them when they are
  no longer true.

A deep link opens a stage and a tab: `…#design` or `…#design-deck`.

## explainer.json (plan, execute, release, close)

```json
{"title": "The build graph", "lede": "One sentence.", "lang": "pt-BR",
 "blocks": [
   {"kind": "numbers", "items": [{"label": "entries", "value": "5", "sub": "3 start together"}]},
   {"kind": "graph", "title": "…", "select": "E-01", "legend": [{"group": "done", "label": "merged"}],
    "nodes": [{"id": "E-01", "label": "Place an order", "group": "done|running|todo|parked|hot", "detail": {"ACs": ["S1.1"]}}],
    "edges": [{"from": "C", "to": "E-01", "label": "ui", "hot": true}]},
   {"kind": "timeline", "title": "…", "unit": "min", "rows": [{"label": "E-01", "start": 18, "end": 70, "tone": "ok|warn|bad|hot"}]},
   {"kind": "table", "title": "…", "columns": ["Stage", "Time"], "rows": [["Design", "2 h 05 min"]]},
   {"kind": "mermaid", "title": "…", "code": "flowchart LR\n  A --> B"},
   {"kind": "note", "tone": "warn", "text": "One line."}
 ]}
```

- **Plan:** the graph comes from `plan.graph.json` (nodes; `after` as
  edges, labelled by class).
- **Execute:** the same graph with each node's state, and a timeline of
  the entries.
- **Release:** a timeline of its steps from `trace.md`.
- **Close:** numbers and a table per stage, from the telemetry.

`claude/report/example/` is a working sample of the whole report.
