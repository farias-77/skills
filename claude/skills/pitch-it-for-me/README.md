# pitch-it-for-me

Claude writes a slide deck for a reader who pages through it in a few
minutes. Each slide holds one idea, the picture comes before the sentence,
there are 40 words at most on a slide, and every number has its source in
the speaker notes. Each slide is its own HTML page on a fixed 1920×1080
canvas, so it can use real diagrams, charts and motion. A `deck.json`
lists the order, the titles and the notes.

## Use only this skill

1. Copy this folder to `~/.claude/skills/pitch-it-for-me/`.
2. For the check script, have `playwright-core` (or `playwright`) with a
   Chromium installed, or point `PLAYWRIGHT_DIR` at a folder whose
   `node_modules` has it. Without it, the file checks still run.
3. Ask: "pitch it for me: the proposal in these files, for the team".
4. To publish the deck on its own, publish `references/viewer.html` as the
   page with the deck's files under `deck/`.

In the pipeline, the `slides-builder` agent preloads this skill and
writes the Deck tab of the stage report.

## Files

- `SKILL.md`: the format, the story, the rules per slide and the return.
- `references/layouts.md`: the slide skeleton, a shared `theme.css`, and
  ten working layouts (cover, statement, big numbers, a diagram that
  builds, table, comparison, timeline, decided in your place, quote, what
  to remember).
- `references/viewer.html`: a small page that pages through a deck
  published on its own.
- `scripts/check-deck.mjs`: checks `deck.json` and every slide (words, text
  size, the canvas, blocked hosts, console errors) and saves a PNG of each.
