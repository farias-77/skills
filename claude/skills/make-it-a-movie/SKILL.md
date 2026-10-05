---
name: make-it-a-movie
description: Makes a short motion video in code (Remotion) - a film written as one TSX file on a motion library, checked with stills and rendered once - that explains a result to a reviewer or shows what is new to users. Always motion, never a slideshow; 2D by default. Use when asked for a video, a film, a motion piece or a launch or tutorial video, and for the Video tab of a stage report.
---

# make-it-a-movie

You make a short film that someone watches instead of reading. Every
scene moves with a purpose: a diagram that builds, a number that counts,
a request that travels, the real product being used. The film is one
`.tsx` file on the video kit's motion library. You check it with stills,
render it once, and check the result.

## What you receive

- **The story:** what the film must make clear, and for whom. In a stage
  report, this is the stage's paragraph in `docs/stage-report.md`.
- **The sources:** the files the facts come from.
- **The audience:**
  - a **reviewer**, who knows the work and wants how it works, what was
    decided and what needs their eye;
  - or **users**, who want what is new and how to use it, with no
    technical detail at all.
- **The language** of everything on screen.
- **The output:** the film's folder (`film.tsx`, `assets/`) and the
  `.mp4` path.
- **The kit:** `claude/video/` of the pipeline repo. Its `README.md` is
  the contract: commands, flags, the library's parts.

## How you work

1. **Read the source whole.** Write down, for yourself, the three to
   five things the viewer must leave with.
2. **Write the script** as a list of scenes: one idea each, and the words
   on screen for each. The arcs are in `references/story.md`.
3. **Write `film.tsx`** with the library (`references/motion.md`). Start
   from `claude/video/example/film.tsx`. Put screenshots, footage and
   music in `assets/` next to it.
4. **Check:** `node <kit>/film.mjs check film.tsx`. It bundles the film and
   lists the scenes and seconds. Fix any error it prints.
5. **Stills:** `node <kit>/film.mjs stills film.tsx stills/`. This gives one
   PNG per scene, at 70% of the scene. Read every PNG. Look for text that
   is cut, crowded or too small, wrong accents, anything off the frame,
   and two motions fighting for the eye. Fix it all in one pass. Redo only
   the stills of the scenes you changed (`--scene <id>`).
6. **Render once:** `<kit>/render.sh film.tsx out.mp4` with the flags in
   the table below. It waits for the machine (`queued on …` means wait,
   not failure). Never start a render another way, never run two of yours
   at once, and never render again to polish.
7. **Check the video:** take three frames with
   `ffmpeg -nostdin -ss <t> -i out.mp4 -frames:v 1 f<t>.png`: one near the
   start, one in the middle, one in the end card. Read them. If one is
   broken, fix the film and render one more time. That is the only second
   render, and it goes in your return.
8. **Clean up:** delete `stills/` and the frames. The kit removes its own
   run folders.

When the film is rendered and checked, stop. Don't add scenes, versions,
files or docs that weren't asked for.

## The sizes

| Film | Length | Render |
|---|---|---|
| a stage video for the reviewer | 45–90 s | `--size 720` (default), 30 fps, `--max-mb 10` |
| the design debate's video, watched live | ≤ 60 s | `--size 720`, `fps: 24`, `--first` (goes ahead of the queue) |
| the users' video (what is new) | 1–3 min | `--size 1080` when it shows real screens, else 720; `--max-mb 15` |

**2D by default.** Use 3D (`references/three.md`) only when the brief asks
for it. A 3D scene costs about as much per frame as a whole 2D scene at
1080p.

**Render time is the budget.** On the shared machine, a 2D frame costs
about 0.3 to 1.1 s and a 1080p frame with real footage about 0.7 s. So a
60 s stage film (1,800 frames) takes roughly 10 to 30 minutes, and a
2-minute users' film at 1080p about 40 minutes. Shorter is faster:
cut a scene before you lower the reading time. The details are in
`references/render.md`.

## The rules on screen

- **Always motion.** Every scene animates: something builds, travels,
  counts, draws or plays. A still card that only fades in is a slide.
  Screenshots and footage are ingredients, set in motion (`Shot` drifts
  toward the target, `Screen` follows the clicks).
- **One focus at a time.** One thing moves while the rest waits. Ease
  out, never linear (except a progress bar).
- **Picture first.** Prefer a `Flow`, `Numbers`, `Bars`, `Gantt`, a
  `DecisionCard` or the real screen to a sentence. Use a sentence only
  for the one claim that is the point.
- **Twelve words on screen at most** per scene, in big type. The library
  holds each scene at least 1 s per 4 words. Over the length, cut a
  scene, never the reading time.
- **Exact numbers.** Every number on screen is the number in the source.
  List each with its `path:line` in your return.
- **Decisions taken in the viewer's place are marked as such** (a
  `DecisionCard`, a "decided for you" label). The viewer's own decisions
  are shown as theirs.
- **Honest.** A failure, a risk accepted or a point still open is shown as
  one.
- **For users: no technical detail.** No services, endpoints, tables,
  queues, deploys or ids. Talk about what the person can now do, in their
  words. See `references/story.md`.
- **No real person's data.** Names, emails and documents on screen are
  synthetic, recorded on a test or staging account, never production. A
  real person's name never appears, even as an example.
- **Language.** Every word on screen in the brief's language, with every
  accent right. The kit has no words of its own.

## The look

The look is yours, chosen for the subject: start from `THEMES.ink` or
`THEMES.paper`, then change the accent, the fonts (the kit's local faces)
and the background. Keep one accent for the one thing that matters in
each scene. Avoid template motion: a whoosh on every cut, bouncing text,
3D text spinning for no reason, word-by-word karaoke captions.

## What you return

- The paths of `film.tsx` and the `.mp4`.
- The seconds and the MB, from `render.sh`'s last line.
- The scenes, one line each.
- The three frame PNGs you checked, and what they showed.
- Every number shown, with its source.
- What you left out of the source, one line each.
- What is still wrong after the one fix, or `none`.
- Whether a second render happened, and why.
