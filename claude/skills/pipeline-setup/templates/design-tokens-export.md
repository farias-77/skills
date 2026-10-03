# Recipe — export the design tokens and components

The discovery prototype is a single self-contained HTML file. To look
like the real product it needs the product's tokens and the shapes of
its core components, in a form it can inline. This recipe produces
three files, regenerated from the source of truth by one command, so
they never drift:

| File | What it holds | Read by |
|---|---|---|
| `design/export/tokens.css` | every token as a CSS custom property on `:root`, plus the dark theme under `[data-theme="dark"]` (or `@media (prefers-color-scheme: dark)`) | the prototyper inlines it as is |
| `design/export/tokens.json` | the same tokens as data: `{ "color": { "bg": "#fff", ... }, "space": {...}, "radius": {...}, "font": {...}, "shadow": {...}, "motion": {...} }` | the prototype checker and the UX reviewer compare against it |
| `design/export/components.md` | the core components: name, the props that change its look, the states, the source path, and a screenshot path per state | the prototyper copies the shapes; the builder finds the real component |

The doctrine names the export command (for example `make design-export`)
and the folder. Commit the output: the pipeline reads files, never
builds the app to find a color.

## Step 1 — find the source of truth

Scout the project for where tokens live today; one of these is usually
true:

| The project has | Export from |
|---|---|
| a tokens file (`tokens.json`, Style Dictionary, Tokens Studio) | that file, through its existing build |
| a Tailwind config (`tailwind.config.*`, or `@theme` in CSS for v4) | the resolved config (`resolveConfig`) or the `@theme` block |
| CSS custom properties in a global stylesheet | that stylesheet's `:root` and theme blocks |
| a CSS-in-JS theme object (styled-components, Emotion, MUI, Chakra, vanilla-extract) | the theme object, imported by a small script |
| a mobile theme (Flutter `ThemeData`, SwiftUI assets, Compose) | the theme file, parsed or mirrored once into JSON |
| nothing central: colors and sizes inline | step 0: name the tokens first — a demand of its own, not a setup task |

## Step 2 — the export script

One script, run by the export command, **written in the language the
repo's own tooling uses** and placed where that tooling lives, so its
lint, formatting and file-layout rules already apply (a new TypeScript
file inside a front end with strict file boundaries would fail them; a
Go, Python or shell tool beside the repo's other tools does not). It
reads the source of truth, flattens the token tree into `--group-name`
custom properties, and writes the two token files. Give it a test when
the repo tests its tooling.

The shape, in TypeScript, for a theme object:

```ts
import { writeFileSync, mkdirSync } from 'node:fs'
import { theme, darkTheme } from '../src/shared/ui/theme'

type Tree = { [k: string]: string | number | Tree }
const flat = (t: Tree, prefix = ''): [string, string][] =>
  Object.entries(t).flatMap(([k, v]) =>
    typeof v === 'object' ? flat(v, `${prefix}${k}-`) : [[`--${prefix}${k}`, String(v)]])

const block = (sel: string, t: Tree) =>
  `${sel} {\n${flat(t).map(([k, v]) => `  ${k}: ${v};`).join('\n')}\n}\n`

mkdirSync('design/export', { recursive: true })
writeFileSync('design/export/tokens.css',
  block(':root', theme) + block('[data-theme="dark"]', darkTheme))
writeFileSync('design/export/tokens.json', JSON.stringify({ light: theme, dark: darkTheme }, null, 2))
```

For Tailwind v3, `resolveConfig(config).theme` is the tree; keep the
groups the screens use (`colors`, `spacing`, `borderRadius`,
`fontFamily`, `fontSize`, `boxShadow`, `transitionTimingFunction`). For
Tailwind v4, copy the `@theme` block into `tokens.css` as `:root`
variables. For Style Dictionary, add a `css/variables` and a `json`
platform pointing at `design/export/`.

## Step 3 — the components list

For each component the screens reuse (button, input, select, table,
card or panel, dialog, toast, tabs, empty state, badge, navigation):

```md
### Button
- source: `src/shared/ui/Button.tsx`
- look props: `variant` (primary | secondary | ghost | danger), `size` (sm | md), `loading`
- states: default, hover, focus-visible, disabled, loading
- screenshots: `design/export/shots/button-*.png`
```

Screenshots come from the component catalogue when the project has one
(Storybook: `test-storybook` or a Playwright pass over each story's
iframe URL), or from a single Playwright script that opens a page with
every component in every state. Light and dark, at 1x.

## Step 4 — wire it in

- The export command runs in the gate's "generated code is up to date"
  check, so a token change without a re-export fails the gate.
- The doctrine's frontend document names `design/export/` as the
  prototype's source.
- Discovery's recon passes the three files to the prototyper; the mock
  inlines `tokens.css` and copies the component shapes.

## What it costs

| Part | Cost | Why |
|---|---|---|
| the token export (`tokens.css`, `tokens.json`) and the components list without screenshots | S, or M when the source needs parsing | one script over one source of truth |
| a screenshot per state of each component | M with a component catalogue (Storybook) already running; **L without one** | rendering every component in every state needs a page that does it, which is product work: a demand of its own |

## Done when

- `design/export/tokens.css` renders a sample page in light and dark
  with no hard-coded color;
- every token in the source appears in `tokens.json`;
- `components.md` lists every component the last three features used,
  with its source, props and states;
- each component has a screenshot per state, or the readiness file
  carries the per-state samples as an L demand.
