# The storyboard format

A video is a **storyboard**: one JSON file that lists scenes from a small,
typed vocabulary. The kit renders it with no code change per video:

```
claude/video/render.sh <storyboard.json> <out.mp4>
```

`render.sh` installs the dependencies on first use, validates the
storyboard (and fails with the field named), renders 1920x1080 at 30 fps
with `--concurrency=2` under `nice`, and re-encodes to H.264 yuv420p with
`+faststart`, capped so the file stays under ~10 MB (`VIDEO_MAX_MB`,
default 9.5). It prints `path · seconds · MB` on the last line.

**Renders queue.** The machine is shared and a render is heavy, so only
one render runs at a time: `render.sh` takes a `flock` on
`${TMPDIR:-/tmp}/pipeline-video-render.lock` (`VIDEO_RENDER_LOCK`
overrides) before the render and releases it after the encode. Ten
scribes dispatched together write and validate their storyboards in
parallel; their renders then run one after another, each waiting its
turn (the waiting ones print `queued on <lock>`). A 2-minute video takes
3.5 to 10 minutes to render at `--concurrency=2`, by the machine's load,
so the tenth of ten waits 35 to 90 minutes — the caller dispatches them in the
background and never polls.

Two cheaper tools for the author:

```
node claude/video/prepare.mjs --check <storyboard.json>   # validate only; prints scenes and seconds
node claude/video/stills.mjs <storyboard.json> <out-dir>  # one PNG per scene at 70% of it, half size
```

`stills.mjs` takes no lock: it renders one frame per scene in a single
tab and is the check before the render (legibility, overflow, accents).

## The file

```json
{
  "title": "Landings — a arquitetura",
  "stamp": "landings · design",
  "source": "/abs/path/to/the/source.md",
  "lang": "pt-BR",
  "scenes": [ ... ]
}
```

| Field | Required | What it is |
|---|---|---|
| `title` | yes | The video's name (≤120 chars). Not shown on screen. |
| `stamp` | no | Printed on the film bands, upper case (≤24 chars): workstream · stage. |
| `source` | no | The file the facts come from. Not shown; it is the record. |
| `lang` | no | The on-screen language; `pt-BR` by default. The kit has no words of its own on screen: every visible word comes from the storyboard. |
| `scenes` | yes | 2 to 40 scenes, in order. The last one should be an `end`. |

## Common scene fields

Every scene has a `type` and may carry:

| Field | Limit | What it does |
|---|---|---|
| `seconds` | 2–30 | The scene's length. Omitted, it is computed (below). |
| `kicker` | 32 chars | A small red line above the title, upper case: the chapter. |
| `title` | 48 chars | The scene's heading (not on `title` and `end`, which have their own). |
| `cite` | 70 chars | The source line at the bottom left: `architecture.md:152-157`. Every number on screen is cited. |
| `badge` | 22 chars | A red rubber stamp at the top right: a decision taken in the reader's place, a risk accepted, a failure. |

Tones, where a type takes them: `ok` (green, ✓), `fail` (red, ✕), `warn`
(amber, !), `hot` (red, the one thing to look at).

## The vocabulary

| Type | Fields | Limits |
|---|---|---|
| `title` | `title`, `subtitle?` | title 60 chars, subtitle 90 |
| `statement` | `text`, `emphasis?` | text 110 chars; `emphasis` is a substring of `text`, drawn red and underlined |
| `bullets` | `items`, `highlight?` | 1–4 items of 64 chars; `highlight` is an item index |
| `flow` | `nodes`, `edges?` | 2–6 nodes `{id, label, sub?, tone?}` (label 26, sub 34); edges `{from, to, label?, dashed?, tone?}` (label 22) |
| `table` | `columns`, `rows`, `highlight?` | 2–4 columns (22 chars), 1–5 rows; a cell is a string or `{text, tone}` (40 chars) |
| `code` | `code`, `language?`, `highlight?` | ≤12 lines of ≤70 chars, spaces not tabs; `highlight` is a list of 1-based line numbers |
| `image` | `src`, `caption` | `.png`, `.jpg`, `.webp` or `.gif`; absolute or relative to the storyboard; caption 80 chars |
| `numbers` | `items` | 2–4 `{value, label, tone?}`; value 8 chars (a plain integer counts up), label 40 |
| `timeline` | `events` | 2–6 `{at, label, tone?}`; `at` 10 chars, label 40 |
| `end` | `lines`, `footer?` | 1–3 lines of 28 chars (the last one in red), footer 60 |

The limits are what keeps every frame legible: a storyboard that passes
validation does not overflow. A flow lays its nodes out by itself: a
node's column is the longest path of edges to it, and the nodes of one
column stack. A chain of five or six nodes leaves narrow boxes: keep
those labels to one or two short words.

## Timing

A scene without `seconds` lasts `1 + 2.5 × lines` seconds, between 3.5
and 14 (`title` and `end`: at most 7; `image`: at least 5). A *line* is
one unit of text the viewer reads: the title, the subtitle, a bullet, a
node, a table row (the header counts as one), a number, an event, an end
line, the caption plus one for looking at the picture; a unit over 8
words counts as two; an edge label counts as half; code counts a line
per three lines of code. Items appear one after another during the
first 45% of the scene; the rest is reading time.

## Validation

`prepare.mjs` (called by `render.sh`) stops at the first invalid field
and names it:

```
invalid storyboard design-architecture.storyboard.json
  scenes[3].items[2]: longer than 64 characters (71): "…"
```

It also warns, without failing, when a `title`, `statement` or `end`
scene shows more than 12 words at once, when the total is outside
45–120 s, and when the last scene is not an `end`. Over 300 s fails.

## Example

```json
{
  "title": "Exemplo — um pedido de amostra",
  "stamp": "exemplo · design",
  "scenes": [
    {"type": "title", "kicker": "design · arquitetura", "title": "Um formulário, uma rota",
     "subtitle": "Como o pedido de amostra chega ao time."},
    {"type": "flow", "title": "Quem chama quem",
     "nodes": [{"id": "b", "label": "Navegador"}, {"id": "h", "label": "Hosting"},
               {"id": "a", "label": "API", "sub": "módulo sales", "tone": "hot"},
               {"id": "d", "label": "Postgres"}],
     "edges": [{"from": "b", "to": "h", "label": "POST"}, {"from": "h", "to": "a", "label": "rewrite"},
               {"from": "a", "to": "d", "label": "limite"}]},
    {"type": "numbers", "title": "Os limites", "cite": "architecture.md:156",
     "items": [{"value": "1", "label": "pedido por e-mail em 24 h"}, {"value": "5", "label": "pedidos por IP em 24 h"}]},
    {"type": "statement", "title": "IP forjado", "badge": "decidido",
     "text": "Aceitamos o risco: o robô esgota a cota.", "emphasis": "Aceitamos o risco"},
    {"type": "timeline", "title": "A entrega", "events": [
      {"at": "10:02", "label": "checks escritos em vermelho"},
      {"at": "11:05", "label": "revisão bloqueia", "tone": "fail"},
      {"at": "11:52", "label": "merge", "tone": "ok"}]},
    {"type": "end", "lines": ["Estático.", "Uma rota."], "footer": "exemplo · video kit"}
  ]
}
```

`examples/example.json` uses all ten types and is the kit's smoke test:
`./render.sh examples/example.json /tmp/example.mp4`.

## The project

| Path | What it is |
|---|---|
| `render.sh` | The one entry point: install once, validate, queue, render, encode. |
| `prepare.mjs` | Validates a storyboard and stages one render (fonts and images in a private public dir). |
| `stills.mjs` | One PNG per scene, for checking before the render. |
| `src/storyboard.mjs` | The contract: limits, validation, timing. Shared by node and the bundle. |
| `src/look.tsx` | The identity: proof paper, film-base ink, one grease-pencil red; Big Shoulders and IBM Plex from `public/fonts` (no network). |
| `src/scenes.tsx` | One component per scene type. |
| `src/Video.tsx`, `src/Root.tsx` | The composition `story`; its length comes from the storyboard. |

`npx remotion studio src/index.ts` opens the example for work on the
look (its image scene shows only once `examples/screenshot.png` is
copied into `public/`); a new scene type is a validator case in `storyboard.mjs`, a
component in `scenes.tsx`, and a row in this file.
