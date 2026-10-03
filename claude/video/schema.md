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

## Launch mode

The close's launch video (stage 6) is a different film: for the company's
users and employees, not for the technical lead. It explains the need,
shows what is new, and teaches every new feature step by step on the real
product. A storyboard with `"mode": "launch"` switches the kit to it: its
own vocabulary, its own look (a dark stage, the product as the colour, one
accent), footage recorded from the real app, a 3D cold open, captions from
the step data, an optional music bed, and a 16:9 film plus a 9:16 cut.

```
node claude/video/record.mjs <shots.json> <footage-dir>              # record the journeys (footage-recorder)
node claude/video/prepare.mjs --check <storyboard.json>              # validate
node claude/video/stills.mjs <storyboard.json> <dir> [0.5] [--vertical]   # one PNG per scene
claude/video/render-launch.sh <storyboard.json> <out.mp4> [--no-vertical | --vertical-only]
#  → <out>.mp4 (1920x1080) · <out>-vertical.mp4 (1080x1920) · <out>.srt
```

`render-launch.sh` takes the same `flock` as `render.sh` (one render at a
time on the machine) and holds it for both cuts; it renders with
`--concurrency=2` under `nice`, `--gl=swangle` for the 3D (`VIDEO_GL`
overrides), keeps the audio (AAC, loudness-normalized to −16 LUFS), and
waits up to 180 s for a footage frame (a loaded machine needs it),
writes the `.srt` first and the 9:16 cut last (a failed vertical cut
exits 3 and leaves the film; `--vertical-only` redoes it), and
encodes at CRF 18 capped by a budget and by 8 Mbit/s: ~50 MB for the film
(`LAUNCH_MAX_MB`), ~25 MB for the vertical cut (`LAUNCH_VERTICAL_MAX_MB`).
Measured on a loaded 4-core laptop: footage scenes cost ~0.7 s a frame and
the 3D opening ~0.8 s, so a 4-minute film is about an hour per cut there,
half that on an idle machine. Review the stills first; render once.

### The shot list and the footage

The footage is recorded, never mocked: `record.mjs` drives the real app
with Playwright, one journey at a time, and writes per journey
`<footage-dir>/<id>/footage.mp4` (1920x1080, 30 fps) and `log.json`. The
cursor is not baked in: the render draws it from the log.

```json
{
  "baseUrl": "https://staging.example.com/",
  "mode": "read-only",
  "uiScale": 1.25,
  "locale": "pt-BR",
  "fixedTime": "2026-10-01T10:00:00",
  "storageState": "/abs/path/demo-session.json",
  "mask": [".customer-email"],
  "journeys": [
    {"id": "rules", "title": "Regras automáticas", "start": "rules",
     "steps": [
       {"label": "Abra Regras no menu", "do": "click", "target": "role=link[name='Regras']", "result": "main table"},
       {"label": "Dê um nome à regra", "do": "fill", "target": "#name", "value": "Frete grátis"},
       {"label": "Salve", "do": "click", "target": "text=Salvar regra", "result": "tr.fresh", "hold": 2}
     ]}
  ]
}
```

| Field | What it is |
|---|---|
| `mode` | `read-only` (production: every request but GET, HEAD and OPTIONS is aborted and counted as `blockedWrites`), `demo-account` (writes allowed, on an account made for it), `local` |
| `uiScale` | 1 to 1.5: lays the page out at 1920/uiScale CSS px and renders it at that device scale, so a dense desktop UI reads larger and stays sharp under the zoom (1.25 is a good default) |
| `fixedTime` | freezes the app's clock, so dates on screen never date the video |
| `storageState` | a Playwright session file for the demo account; never a password in the shot list |
| `mask` | selectors blurred on every page (personal data) |
| `steps[].do` | `click`, `fill` (typed key by key), `select`, `press`, `hover`, `scroll`, `wait`, `goto` |
| `steps[].label` | the caption, ≤42 chars, 3–6 words, one action |
| `steps[].result` | where the result appears: the camera goes there after the click (a result bigger than a close-up is shown wide) |
| `steps[].hold` | seconds the result is held (default 1.5; at least 1.3 on screen) |
| `slow` | 0.1 to 1 (default 1), or `--slow <rate>` on the command line: the page's CSS and Web Animations run at that rate while every beat of the script is stretched to match, and the log and frames are compressed back at the end, so the footage plays at real speed with 1/rate times the frames. CSS-driven UI only: the app's JS timers are not slowed |

The glide is eased with ≥25 intermediate moves (hover states fire), the
cursor arrives 0.3 s before each click, every time is logged on the
frames' clock. `log.json` carries `steps[]` (`startMs`, `actionMs`,
`endMs`, the target `rect`, the `result` rect), `cursor[]`, `clicks[]`,
`typing[]`, the `durationMs`, `slow` and `motionFps`. Frames arrive on
repaint, so the whole-take `captured fps` is low whenever the screen
holds still; `motionFps` is the rate while it moves (frames less than
200 ms apart), and it is the one that says whether motion stutters.
Under load it can drop to a few frames a second: below ~15 on a journey
whose motion matters, record it again with `--slow 0.25` (measured on
the self-test app: 28 motion fps at real speed, 65 slowed), then on a
quieter machine.

### The launch file

```json
{
  "mode": "launch",
  "title": "Regras automáticas — lançamento",
  "lang": "pt-BR",
  "accent": "#FF5B2E",
  "footage": {"rules": "footage/rules"},
  "music": {"src": "music/bed.mp3", "credit": "<source URL> · <licence> · <plan> · <date>", "volume": 0.5},
  "scenes": [
    {"type": "hero3d", "kicker": "Balcão · outubro", "title": "Regras automáticas",
     "subtitle": "Frete e descontos que se aplicam sozinhos.",
     "cards": [{"footage": "rules", "step": 1}, {"footage": "rules", "step": 3}]},
    {"type": "statement", "kicker": "a necessidade", "text": "Toda sexta eu ajusto o frete pedido por pedido, na mão.",
     "emphasis": "na mão", "cite": "equipe de vendas"},
    {"type": "numbers", "kicker": "o custo", "items": [{"value": "4 h", "label": "por semana ajustando frete"}]},
    {"type": "screen", "footage": "rules", "steps": [1, 3], "speed": 2.5, "style": "tilt",
     "kicker": "o que há de novo", "title": "Regras que trabalham por você", "caption": "Crie uma vez. Vale em todo pedido."},
    {"type": "chapter", "kicker": "tutorial", "title": "Crie uma regra", "path": "Balcão › Regras › Nova regra"},
    {"type": "step", "footage": "rules", "step": 1},
    {"type": "step", "footage": "rules", "step": 2, "detail": "O nome aparece no pedido do cliente"},
    {"type": "step", "footage": "rules", "step": 3},
    {"type": "chapter", "kicker": "recapitulando", "title": "Em três passos",
     "items": ["Abra Regras no menu", "Dê um nome à regra", "Salve"]},
    {"type": "end", "kicker": "já disponível", "lines": ["Regras automáticas.", "Em Balcão › Regras."],
     "footer": "balcão · 1 de outubro de 2026 · dúvidas: #suporte"}
  ]
}
```

| Field | What it is |
|---|---|
| `mode` | `"launch"`. Without it the storyboard is a stage-review video (the vocabulary above). |
| `accent` | the product's accent colour, `#RRGGBB` (its design tokens); default `#FF5B2E` |
| `footage` | id → a folder `record.mjs` wrote (absolute or relative to the storyboard); ids are lower-case with dashes |
| `music` | optional. A track the user licensed, **never bundled with the kit**: `credit` (≥12 chars) carries the receipt — source, licence, plan, date — and the same line goes in the workstream's `credits.md`. Fades in over 1 s, sits back under the tutorial, fades out over the last 2 s. |

### The launch vocabulary

| Type | Fields | Timing |
|---|---|---|
| `hero3d` | `title` (40), `kicker?` (32), `subtitle?` (80), `cards?` 0–5 of `{footage, step}` or `{footage, atMs}` | 5.5 s (3–8) |
| `statement` | `text` (110), `emphasis?` (a substring, set in the accent), `kicker?`, `cite?` (70, the attribution) | 0.32 s a word, 4–9 s |
| `numbers` | `items` 1–3 `{value (8), label (40)}`, `kicker?`, `title?` (48); a plain integer counts up | 3 + 1.2 s an item, ≤7 s |
| `screen` | `footage`, the range (`steps: [first, last]` or `fromMs`/`toMs`; whole footage by default), `caption?` (42), `kicker?`, `title?` (48), `zoom?`, `speed?` (1–3), `style?` (`window` \| `tilt`) | the range ÷ speed, ≤30 s |
| `step` | `footage`, `step` (1-based), `label?` (42; the recorded label by default), `detail?` (60), `zoom?` | the recorded step, held until the result has shown ≥1.3 s and the caption can be read; ≤14 s |
| `chapter` | `title` (40), `kicker?`, `path?` (48, where it lives: `A › B › C`); with `items` (2–6 of 42) it is the overview or the recap list | 3–3.4 s; a list 1.6 + 0.9 s an item |
| `end` | `lines` 1–3 of 28 (the last in the accent), `footer?` (60), `kicker?` | 5.5 s |

Every scene takes `seconds` to override its timing within its range.

**What the kit does by itself.**

- **Chapters and steps are numbered** from their order: a chapter card
  gets its index (01, 02 …); the steps after it are `1/4 … 4/4`, shown in
  the step's caption and as the progress bars over the window, with the
  chapter's name.
- **Chapter cards preview** the screen their tutorial opens on (a still
  of the next scene's footage, at the right of the 16:9 card), so the
  cut that follows lands on something the eye already met.
- **One take.** A `step` or `screen` that starts where the previous one
  ended on the same footage is a cut inside one take: the window stays,
  the caption changes.
- **The camera** zooms from the log: in ~1 s before each click (it
  lands before the click), on the result after it, back to the wide shot
  when the result is larger than a close-up or the next target is far;
  clicks closer than 0.6 s of zoom-out merge into one pan; springs without
  bounce, 730 ms in, 870 ms out. `zoom` is the effective magnification on
  the source pixels, 1 (none) to 1.5 (default 1.35): above 1.5 a 1080p
  source stops being sharp, so validation refuses it. The translation is
  clamped: the frame never shows past the footage's edge.
- **The cursor** is drawn in post on the logged path (eased, slightly
  arced), with a press and a ripple per click; the step's target is ringed
  in the accent as the cursor arrives and the ring leaves as the click
  lands.
- **9:16.** The vertical cut is the same storyboard: the window becomes
  a 1000×1000 crop that follows the cursor and the zoom; text and 3D lay
  themselves out for the phone.
- **Captions.** Every label on screen is also a cue in `<out>.srt`
  (step labels as `n/m · label`), built from the same data.

**Validation** names the field, as in review mode, and also refuses:
a footage id with no folder or no `log.json`; a step number outside the
footage; a range outside it; a caption that reads faster than 20
characters a second at its scene's length; a `zoom` over 1.5; music
without its credit. It warns when the film does not open on `hero3d`,
does not close on `end`, when a chapter card is not followed by its
footage, and when the total is outside 150–360 s (the launch target;
600 s fails).

## The project

| Path | What it is |
|---|---|
| `render.sh` | The one entry point: install once, validate, queue, render, encode. |
| `render-launch.sh` | The launch profile: audio, higher quality, a ~50 MB budget, 16:9 + 9:16 + `.srt`, same queue. |
| `record.mjs` | Records the launch footage from a shot list: Playwright at 1920x1080, footage + log per journey. |
| `prepare.mjs` | Validates a storyboard and stages one render (fonts and images in a private public dir). |
| `stills.mjs` | One PNG per scene, for checking before the render. |
| `src/storyboard.mjs` | The contract: limits, validation, timing. Shared by node and the bundle. |
| `src/look.tsx` | The identity: proof paper, film-base ink, one grease-pencil red; Big Shoulders and IBM Plex from `public/fonts` (no network). |
| `src/scenes.tsx` | One component per scene type. |
| `src/Video.tsx`, `src/Root.tsx` | The compositions `story`, `launch` and `launch-vertical`; their length comes from the storyboard. |
| `src/launch/` | Launch mode: `contract.mjs` (validation, timing, numbering, captions), `look.tsx` (the dark stage, Inter Tight · Instrument Serif · Plex Mono, the motion tokens), `camera.ts` (zoom and cursor from the log), `Footage.tsx` (`screen`, `step`), `Hero.tsx` (`hero3d`, three.js), `cards.tsx` (`chapter`, `statement`, `numbers`, `end`), `Launch.tsx` (the film and the music bed). |

`npx remotion studio src/index.ts` opens the example for work on the
look (its image scene shows only once `examples/screenshot.png` is
copied into `public/`); a new scene type is a validator case in `storyboard.mjs`, a
component in `scenes.tsx`, and a row in this file.
