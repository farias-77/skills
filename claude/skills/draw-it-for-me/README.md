# draw-it-for-me

Claude builds one HTML page that explains one thing by showing it: a
diagram that builds step by step, a request travelling through a system,
a 3D view of the layers, a chart, a playground where the reader changes an
input and sees the result. It is for readers who skim and won't read a
wall of text.

The page is self-contained, works in light and dark, works on a phone,
and respects reduced motion. Libraries load from the CDNs that hosted
pages allow (cdnjs, jsdelivr, unpkg).

## Use only this skill

1. Copy this folder to `~/.claude/skills/draw-it-for-me/`.
2. For the check script, have `playwright-core` (or `playwright`) with a
   Chromium installed, or point `PLAYWRIGHT_DIR` at a folder whose
   `node_modules` has it.
3. Ask: "draw it for me: how the checkout works, from these files".

In the pipeline, the `artifact-builder` agent preloads this skill and
writes the Explainer tab of the stage report.

## Files

- `SKILL.md`: the method, the page rules and the return.
- `references/starter.html`: a working page to start from (tokens, both
  themes, the theme button, a stepper over an SVG diagram).
- `references/diagrams.md`: mermaid, mermaid revealed step by step,
  Cytoscape, dagre and ELK layouts, lines that draw, Rough.js.
- `references/motion.md`: GSAP timelines and ScrollTrigger, a dot along a
  path, Motion One, Lottie, Matter.js.
- `references/three.md`: three.js with an SVG fallback, drag to orbit,
  layers, particles, exploded views, fly-throughs, globes.
- `references/data.md`: count-up tiles, Chart.js, ECharts, D3, a
  before/after slider.
- `references/interaction.md`: stepper, click to reveal, toggles, replay
  with a scrubber, playground, mini quiz.
- `references/text.md`: highlighted code, KaTeX, terminal replay, glossary
  on hover, callouts.
- `scripts/look.mjs`: one look at the page at desktop and phone width, in
  both themes, with console errors and sideways overflow.
