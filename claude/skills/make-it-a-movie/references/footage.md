# Real screens: screenshots and footage

Real product screens are the best ingredient for a users' film. There are
two ways to bring them in:

- **Screenshots** (`Shot`) cost almost nothing to render. Use them for a
  step where the result is what matters.
- **Footage** (`Screen`) shows the motion of the product itself: a menu
  opening, a list filling. Use it where that motion explains the step.

## Screenshots with `Shot`

Take them at 1920×1080 (Playwright `page.screenshot`, viewport
1920×1080), save them under `assets/`, and set them in motion:

```tsx
import {Shot, Caption} from '@kit/motion';

{
  id: 'step2', label: 'New rule', text: '2/4 · Choose the trigger', secs: 4.5,
  render: () => (
    <>
      <Shot src="assets/rules-new.png" focus={{x: 1240, y: 420}} zoom={1.35} ring={{x: 1100, y: 390, w: 300, h: 60}} />
      <Caption at={0.4}>2/4 · Choose the trigger</Caption>
    </>
  ),
}
```

The shot enters, drifts from the whole screen to `focus`, then draws the
ring around the target. Keep `zoom` at 1.5 or less for a region of the
screen. For a label-sized subject (a count, a button, one line), zoom up
to 3, so it spans half the frame and its key number reads at 360 px wide;
capture that screen at `uiScale` 1.5 so the text stays sharp.

## Footage with `record.mjs` and `Screen`

`node <kit>/record.mjs shots.json assets/` drives the real app with
Playwright, one journey at a time. Per journey it writes
`assets/<id>/footage.mp4` (1920×1080, 30 fps) and `assets/<id>/log.json`.
The cursor is not baked in: the film draws it from the log.

```json
{
  "baseUrl": "https://staging.example.com/",
  "mode": "demo-account",
  "uiScale": 1.25,
  "locale": "pt-BR",
  "fixedTime": "2026-10-01T10:00:00",
  "storageState": "/abs/path/demo-session.json",
  "mask": [".customer-email"],
  "journeys": [
    {"id": "rules", "title": "Automatic rules", "start": "rules",
     "steps": [
       {"label": "Open Rules in the menu", "do": "click", "target": "role=link[name='Rules']", "result": "main table"},
       {"label": "Name the rule", "do": "fill", "target": "#name", "value": "Free shipping"},
       {"label": "Save", "do": "click", "target": "text=Save rule", "result": "tr.fresh", "hold": 2}
     ]}
  ]
}
```

| Field | What it is |
|---|---|
| `mode` | `read-only` (every request but GET, HEAD and OPTIONS is aborted and counted), `demo-account` (writes allowed, on an account made for it), `local` |
| `uiScale` | 1 to 1.5: the page is laid out at 1920/uiScale CSS px and rendered at that device scale, so a dense UI reads larger and stays sharp under the zoom (1.25 is a good default) |
| `fixedTime` | freezes the app's clock, so dates on screen never date the film |
| `storageState` | a Playwright session file for the demo account; never a password in the shot list |
| `mask` | selectors blurred on every page (anything personal) |
| `steps[].do` | `click`, `fill` (typed key by key), `select`, `press`, `hover`, `scroll`, `wait`, `goto` |
| `steps[].label` | the caption: 3–6 words, one action, at most 42 characters |
| `steps[].result` | where the result appears: the camera goes there after the click |
| `steps[].hold` | seconds the result is held (default 1.5) |
| `slow` | 0.1 to 1, or `--slow <rate>`: CSS runs slower while capturing and the footage is compressed back, for smooth motion on a loaded machine. CSS-driven UI only. |

`log.json` carries:

- `steps[]`, with `startMs`, `actionMs`, `endMs`, the target `rect` and the
  `result` rect;
- `cursor[]`, `clicks[]` and `typing[]`;
- `durationMs` and `motionFps`.

If `motionFps` is below about 15 on a journey whose motion matters, record
it again with `--slow 0.25`.

In the film:

```tsx
import {Screen, Caption, footageFrom} from '@kit/motion';
import rulesLog from './assets/rules/log.json';

const rules = footageFrom(rulesLog, 'assets/rules/footage.mp4');
const s1 = rules.steps[0];

{
  id: 'rules-1', label: 'Rules', text: '1/3 · Open Rules in the menu', secs: (s1.endMs - s1.startMs) / 1000 + 0.6,
  render: () => (
    <>
      <Screen footage={rules} fromMs={s1.startMs} toMs={s1.endMs} zoom={1.4} />
      <Caption at={0.3}>1/3 · Open Rules in the menu</Caption>
    </>
  ),
}
```

The scene's length comes from the log (`endMs - startMs`), never from a
typed number. The camera zooms toward each click about 1 s before it,
holds a result for 2 s, and never shows past the footage's edge. A scene
longer than its footage range holds the last frame.

## The safety rules

- Staging or a test account only. Never production, never a real
  customer's data.
- Synthetic names only; a real person's name never appears, even
  blurred into the background.
- Anything that could identify a person goes in `mask`.
- The footage folder is deleted after the render, unless the brief says
  to keep it.
