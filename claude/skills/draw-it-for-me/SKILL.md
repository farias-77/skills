---
name: draw-it-for-me
description: Builds an explanatory artifact, one self-contained HTML page that explains ONE thing (a system, a flow, a plan, a decision, a set of numbers) by showing it - diagrams that build, motion, 3D, charts, steppers, playgrounds - so a reader who skims understands it without a wall of text. Use when asked to explain, visualize, illustrate or "draw" something as a page, and for the Explainer tab of a stage report.
---

# draw-it-for-me

You make one page that explains one thing by showing it. The reader skims
and does not like reading long text. Hold their attention by letting them
see the idea: a picture that builds, a step they click through, a number
that moves when they change an input. Prose only supports the picture.

## What you receive

- **The subject and the source:** the files that hold the facts. Every
  fact on the page comes from them.
- **The reader:** who opens the page, and what they must be able to do
  or decide after it.
- **Where the page lands:** a stage report (a supporting file, as a full
  HTML document) or published alone as its own page. The brief says which.
- **The output path:** usually `<folder>/explainer.html`.

## How you work

1. **Read the source whole.** Then write down, for yourself, the three
   to five things the reader must leave with. Everything on the page
   serves one of them, and nothing else goes on the page.
2. **Choose the shape.** Pick one main pattern per idea from the table
   below. Use one strong centrepiece rather than five small effects.
3. **Start from `references/starter.html`.** It holds the tokens, both
   themes, the theme button, the phone layout, a stepper and the
   reduced-motion rule. Keep its skeleton and change the rest.
4. **Build each part from its reference.** Copy the snippet and adapt
   it. The libraries and their pinned URLs are already in the snippets.
5. **Check it once** (below), fix what the check shows, and stop.

| The idea is… | Default pattern | Reference |
|---|---|---|
| how parts connect | a diagram that builds step by step (mermaid, or hand SVG) | `diagrams.md` |
| a big graph (a plan, dependencies) | Cytoscape with click to open a node | `diagrams.md` |
| a sequence or a process | a stepper: one step per screen, next and previous | `interaction.md` |
| something moving through a system | SVG path animation, or a dot travelling an edge (GSAP) | `motion.md` |
| numbers | number tiles with count-up, then Chart.js | `data.md` |
| a rule, a price, a limit | a playground: change the input, see the output | `interaction.md` |
| before and after | a slider between the two states | `data.md` |
| layers or space (architecture, a map) | three.js, only when depth explains it | `three.md` |
| a run over time | a replay with a scrubber | `interaction.md` |
| code or a command | highlighted lines, a terminal replay | `text.md` |

**Defaults first.** Mermaid, steppers, SVG motion, Chart.js, count-up
tiles and click to reveal are the defaults. 3D, physics (Matter.js),
Lottie and ECharts or D3 are used only when they explain better than the
defaults, and you say in one line why.

## The page rules

These are the hosting rules. A page that breaks one shows blank or broken
to the reader, with no error.

- **One file.** CSS and JS inline. Libraries load as `<script src>` with a
  pinned version, only from `cdnjs.cloudflare.com` (preferred),
  `cdn.jsdelivr.net/npm/`, `unpkg.com`. Stylesheets load only from Google
  Fonts, so a library's CSS is inlined. Everything else is blocked:
  external images, tiles, fetches and APIs. Draw images as SVG or embed
  them as `data:` URIs.
- **Both themes.** Every colour is a token on `:root`, redefined under
  `@media (prefers-color-scheme: dark)` with `:root:not([data-theme="light"])`
  and again under `:root[data-theme="dark"]`. `body` sets its background
  from a token. Charts and SVG take their colours from the tokens too.
- **Phone-proof.** The page works at 390 px wide with a 16 px side gutter.
  The body never scrolls sideways; only a diagram, table or code block may
  scroll inside its own box.
- **Complete at rest.** Everything is visible once the page loads.
  Animation starts from a visible state, never stuck at `opacity: 0`.
- **Reduced motion.** Under `prefers-reduced-motion: reduce`, show the end
  state, or let the reader step through it by hand.
- **3D has a fallback.** A 3D scene first renders a still SVG in the same
  box, then replaces it when WebGL starts. If WebGL is missing, the SVG
  stays.
- **Body text at 17–18 px**, running text near 65 characters wide, headings
  with `text-wrap: balance`.
- **The document shape depends on where the page lands.**
  - In a stage report, write a full document: `<!doctype html>`, `<html>`,
    `<head>` with `<meta charset="utf-8">` and the viewport meta, `<body>`.
  - Published alone as its own page, leave those four tags out: the host
    wraps the page itself. Start with `<title>` and `<style>`.

## The words

- Write in English, by `claude/references/artifact-writing.md`.
- Every number is the number in the source, exactly. When a number is
  not in the source, leave it out and say so in your return.
- A decision someone took in the reader's place is marked as such, with
  who took it.
- A failure or an open risk is shown as one. A page that shows only green
  when the record has red is wrong.
- No real person's name. Invented example names only when the source
  already uses them.

## The look

The look is your call, and it should come from the subject. Pick one
direction: a ground, one accent, two typefaces from Google Fonts, and a
type scale. Use it everywhere on the page. Avoid the template looks:
purple gradients, glass cards, emoji as icons, everything centred, or an
accent stripe on every card.

## Check before you hand back

Run `node scripts/look.mjs <page.html> <out-dir>` once. It opens the page
in a headless browser at 1280 px and 390 px, in light and dark, saves four
PNGs, and lists console errors and sideways overflow. Read the PNGs, fix
what is wrong once, and run it again only if you changed the layout.
If the script cannot run (no browser on the machine), say so in your
return.

When the page is written and checked, stop. Don't add pages, features,
files or docs that weren't asked for.

## What you return

- The path of the page and its size.
- The three to five things it explains, one line each.
- The patterns and libraries used.
- What the check showed: the console errors and overflow, or `clean`.
- Any fact the brief asked for that the source does not have.
