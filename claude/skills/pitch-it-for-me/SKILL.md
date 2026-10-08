---
name: pitch-it-for-me
description: Writes a slide deck as HTML slides (one 1920x1080 page per slide plus a deck.json with titles and speaker notes) that tells one story to a reader who skims - one idea per slide, the picture before the sentence, exact numbers with their source in the notes. Use when asked for a deck, slides, a pitch or a presentation, and for the Deck tab of a stage report.
---

# pitch-it-for-me

You write the deck a busy reader pages through in a few minutes. Each
slide carries one idea, shown with a picture, a table, big numbers or a
diagram. The sentence on the slide supports the picture, and the speaker
notes hold the detail and the sources. You decide what to show, in what
order, and how it looks. You never decide the facts: they come from the
source files.

## What you receive

- **The story to tell:** what the deck is for and who reads it. In a
  stage report, this is the stage's paragraph in `claude/docs/stage-report.md`.
- **The sources:** the files the facts come from.
- **The output folder**, usually `<stage>/deck/`.
- **The date**, for the cover.

## The format

```
deck/
├── deck.json      {"title", "lang", "slides": [{"file": "01.html", "title": "...", "notes": "..."}]}
├── theme.css      optional: the deck's shared look, linked by every slide
├── 01.html        one slide = one full HTML document on a fixed 1920×1080 canvas
└── 02.html …
```

- **A slide** is a complete document: `<!doctype html>`, `<meta
  charset="utf-8">`, `<meta name="viewport" content="width=1920">`, a
  `<title>`, and a body that is exactly 1920×1080 with `overflow: hidden`.
  The viewer scales it to fit the screen. Nothing may sit outside the
  canvas, and the slide never scrolls.
- **The look** lives in `theme.css` (linked as `href="theme.css"`) or in
  each slide's `<style>`. Fonts come from Google Fonts. Scripts come only
  from `cdnjs.cloudflare.com`, `cdn.jsdelivr.net/npm/` or `unpkg.com`, with
  a pinned version. Images are inline SVG or `data:` URIs; everything else
  external is blocked.
- **Motion is welcome.** A slide re-runs its CSS animation each time it
  opens: a diagram that builds, numbers that count, a line that draws. It
  must end on a readable still within about 2 s, and show that still
  at once under `prefers-reduced-motion: reduce`.
- **Speaker notes** live in `deck.json`, in plain text. They hold every
  number on the slide with its source (`US$ 244/month · 01-design/operations.md:75`),
  and anything the slide left out that the reader may ask about.
- **The order** of `slides` in `deck.json` is the deck's order. File names
  are `01.html`, `02.html`, and so on.

## The story

8 to 15 slides; a deck of the short route or the hotfix (the minimal
report) is 4 to 8, checked with `--min 4`. This skeleton fits most decks;
the middle follows the story you were given.

| # | Slide | What it holds |
|---|---|---|
| 1 | Cover | what this is, in one line, and the date |
| 2 | In one sentence | the result or the proposal in one sentence |
| 3 | The picture | the one diagram of how it works |
| 4–n | The middle | one slide per idea of the story: the steps, the numbers, the risks, what changed |
| n+1 | Decided in your place | the calls someone took without the reader, each with who took it. If there are none, the slide says so in one line; it is never dropped. |
| last | What to remember | three lines, and where to dig (the files that hold the detail) |

## The rules, every slide

- **One idea per slide.** Two ideas make two slides.
- **The picture first.** Open with a diagram, a table, big numbers, a
  before/after or a row of cards. Use a bullet list only as a last resort:
  turn it into a table or cards.
- **40 words at most** of visible text, the title included. Over 40, split
  the slide or move the rest to the notes.
- **Readable from the back of the room.** Body text 32 px or more, labels
  24 px or more, a contrast of 4.5:1. One accent colour, used for the one
  thing that matters on the slide.
- **Exact numbers.** Each number is the number in the source, and its
  source is in the notes. A number you cannot find does not go on the
  slide; say so in your return.
- **His words stay his.** A ruling or a remark the reader made is quoted
  verbatim, in his language.
- **Honest.** A risk accepted, a failure or an open point is shown as one,
  with the same weight as the good news.
- **The language** of the slides and the notes is set by
  `claude/references/artifact-writing.md`.
- **No real person's name** unless the source is about that person's own
  role and the brief allows it.

`references/layouts.md` has working slides to copy, one per kind of
slide above.

## The look

The look is yours, chosen for the subject: a ground (dark or light, fixed
for the whole deck), one accent, two typefaces and a five-step type scale
(for example 120 · 76 · 48 · 32 · 24). Every slide of the deck uses the
same look. Avoid the template looks: gradient blobs, glass cards, emoji as
icons, everything centred, or an accent stripe on every card.

**In a stage report, the look is the report's.** `theme.css` starts with
`@import url("../../tokens.css");` and takes every colour, face and
radius from its tokens (`claude/report/tokens.css`): `--bg` for the
ground, `--ink-1`…`--ink-3`, `--line`, `--ok` `--warn` `--bad` for status,
`--f-sans` and `--f-mono`, never copying the values. The accent is
`--ink-1`, or a status colour when the slide is about one.

## Check before you hand back

Run `node scripts/check-deck.mjs <deck-folder> <png-folder>` once. It
checks `deck.json`, then opens every slide at 1920×1080 and reports more
than 40 words, text under 24 px, anything outside the canvas, console
errors and a blocked host. It saves a PNG of each slide at half size; in a stage report the PNG
folder is `report/<stage>/_scratch/deck-png/`. Read the PNGs, fix every
line it prints once, and run it again. If the check cannot open a browser,
it still runs the file checks; say so in your return.

When the deck is written and checked, stop. Don't add slides, files or
docs that weren't asked for.

## Publishing alone (outside a stage report)

`references/viewer.html` is a small page that pages through `deck.json`.
Publish it as the page, with `deck.json`, `theme.css` and every slide as
its files under `deck/`.

## What you return

- The folder.
- One line per slide: its file, its idea and its word count.
- Every number shown, with its source.
- Anything the story asked for that the sources do not have.
- What the check printed at the end: its last lines, or `clean`.
