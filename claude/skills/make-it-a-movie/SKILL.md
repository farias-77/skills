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

- **The brief** (`brief.md`): what the film must make clear, for whom,
  the length, the real assets, and the visual rules.
- **The shot list** (`shotlist.md`), and the style guide when the caller
  fixes the look.
- **For a stage report**, the brief is the stage's line in
  `docs/stage-report.md` with its source files, and the shot list is the
  stage's arc in `references/story.md`. You write both files from them
  and add nothing they do not hold.
- **The audience:**
  - a **reviewer**, who knows the work and wants how it works, what was
    decided and what needs their eye;
  - or **users**, who want what is new and how to use it, with no
    technical detail at all.
- **The language** of everything on screen.
- **The output:** the film's folder and the `.mp4` path.
- **The kit:** `claude/video/` of the pipeline repo. Its `README.md` is
  the contract: commands, flags, the library's parts.

The film's decisions (what it says, its beats) belong to whoever was
asked for the film. If that is you, in your own session, write the brief
and the shot list from the templates first. If you are a builder sent by
a session, they come from that session or an Opus agent it sends; when
the film is not a stage report and either file is missing, stop and ask
for it.

## How you work

The film moves through gates. Each gate is a file or a check, and the
next one starts only when it passes. The detail is in
`references/production-contract.md`, and the templates are in
`templates/`.

```
brief → assets → style guide + shot list → film.tsx + check → contact sheet
      → render once → critique → repair (one more render at most) → deliver
```

1. **Brief.** Read `brief.md` and its sources whole. Write down, for
   yourself, the three to five things the viewer must leave with.
2. **Assets.** Put every asset the brief lists in `assets/`. A missing
   logo, screen, recording or number stops the work with a question.
   Never draw a stand-in.
3. **Style guide and shot list.** Write `style-guide.md` (the palette in
   hex, the type, the pacing, the motion, the texture). Write or complete
   `shotlist.md`: per beat, the entry state, the exit state, why it
   exists, the words on screen and the reads (what the viewer must find
   and understand, one at a time). A beat without a reason is cut. The
   arcs are in `references/story.md`.
   For a film whose viewers do not know the work (users, newcomers), the
   session that owns the brief gives the shot list's on-screen text, in
   order and nothing else, to a fresh agent with no context, and asks it
   to explain the subject back in five sentences and to list every word
   that blocked it. The text is fixed until the explanation is right.
4. **Film.** Write `film.tsx` with the library (`references/motion.md`),
   starting from `claude/video/example/film.tsx`. Then run
   `node <kit>/film.mjs check film.tsx`, which bundles the film and lists
   the scenes and seconds. Fix any error it prints.
5. **Contact sheet.** Run `node <kit>/film.mjs stills film.tsx stills/`
   (one still per beat: `templates/contact-film.tsx` when a scene holds
   several), then make the 360 px phone sheet. Read every PNG against the
   contract's checklist: readable at 360 px wide, the subject filling the
   frame, inside the safe area, real assets,
   one type scale and one palette, the subject read by 2 s, and a last
   frame that works as a poster. Fix it all in one pass, then redo only
   the stills you changed (`--scene <id>`).
6. **Render once:** `<kit>/render.sh film.tsx out.mp4` with the flags in
   the table below. It waits for the machine (`queued on …` means wait,
   not failure). Never start a render another way, never run two of yours
   at once, and never render again to polish.
7. **Critique.** Judge only the rendered file. Take a sheet at 2 frames
   a second at 360 px wide
   (`ffmpeg -nostdin -i out.mp4 -vf "fps=2,scale=360:-1,tile=8x8" stills/phone-%02d.png`)
   and strips around the fastest transitions. Score 1 to 10, from those
   frames only: the hook in the first 2 s, readability at phone size,
   frame fill, motion that explains (no dead frame, one read at a time),
   continuity across cuts, plain words. Write `reviews/critique.md`:
   the six scores, then the 3 largest defects with timestamp, evidence
   and a local fix.
8. **Repair.** When any score is under 8, or a defect breaks the film,
   fix the scenes the defects name and render one more time. That is the
   only second render. Score again from the new frames and put both sets
   of scores in your return.
9. **Clean up.** Delete `<film>/stills/` by its full path. Never `rm` a
   glob, and never delete anything under `/tmp` or `$TMPDIR`: other
   renders keep their bundles there. The kit removes its own run folders.

When the film is rendered and checked, stop. Don't add scenes, versions,
files or docs that weren't asked for.

## The sizes

| Film | Length | Render |
|---|---|---|
| a stage video for the reviewer | 45–90 s | `--size 720` (default), 30 fps, `--max-mb 10` |
| the release video for the reviewer | 30–45 s | `--size 720`, 30 fps, `--max-mb 10` |
| the design debate's video, watched live | ≤ 60 s | `--size 720`, `fps: 24`, `--first` (goes ahead of the queue) |
| the users' video (what is new) | 1–3 min | `--size 1080` when it shows real screens, else 720; `--max-mb 15` |

**One format:** 1920×1080, horizontal. A vertical or square cut is never
made from it by cropping.

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
- **Fill the frame.** Each beat has one subject: the thing its caption
  talks about. It spans at least half the frame's width or 45% of its
  height. When a state is small (a button, a card, a line), the camera
  zooms in until it fills the frame, then pulls back for the next state.
  A wide shot, with the subject under a quarter of the width, is for one
  beat of context at most, and then the frame needs company around it.
  Centre the picture on the true centre (y 540); never leave a dead band
  at the top or the foot.
- **Picture first.** Prefer a `Flow`, `Numbers`, `Bars`, `Gantt`, a
  `DecisionCard` or the real screen to a sentence. Use a sentence only
  for the one claim that is the point.
- **Twelve words on screen at most** per scene, in big type. The library
  holds each scene at least 1 s per 4 words. Over the length, cut a
  scene, never the reading time.
- **Type floors on the 1920 canvas:** the hook and the peaks 140 px or
  more; the caption 88 px; any label inside the picture 56 px (mono
  52 px). Text meant to be read is never under 66% opacity. A label that
  does not fit at its floor is cut or shortened, never shrunk.
- **Exact numbers, real screens.** Every number on screen is the number
  in the source; list each with its `path:line` in your return. Never
  invent a product screen, a metric, a logo or a quote.
- **Decisions taken in the viewer's place are marked as such** (a
  `DecisionCard`, a "decided for you" label). The viewer's own decisions
  are shown as theirs.
- **Sober.** State things plainly and calmly. No exclamation marks, no
  teaser question answered in capitals ("Fast or reliable? BOTH!"), and
  no hype words.
- **Honest.** A failure, a risk accepted or a point still open is shown as
  one.
- **For users: no technical detail.** No services, endpoints, tables,
  queues, deploys or ids. Talk about what the person can now do, in their
  words. See `references/story.md`.
- **No real person's data.** Names, emails and documents on screen are
  synthetic, recorded on a test or staging account, never production. A
  real person's name never appears, even as an example.
- **Language.** Every word on screen is English, by `claude/references/artifact-writing.md`, with every
  accent right. The kit has no words of its own.

## The look

The look is the style guide. Without one from the caller, choose it for
the subject: start from `THEMES.ink` or `THEMES.paper`, then change the
accent, the fonts (the kit's local faces) and the background. Keep one
accent for the one thing that matters in each scene. Each object moves by
its class (`references/motion.md`), and after every move the viewer knows
where to look.

Avoid these template defaults: big centred text on every scene,
everything fading in the same way, everything overshooting, a gradient
for its own sake, a logo sting at the end, a whoosh on every cut, bouncing
text, 3D text spinning for no reason, word-by-word karaoke captions, a
caption that rises and fades the same way on every beat, a corner label
on every scene, and a frame where nothing moves and nothing is being
read.
Any background beyond the theme's `bgKind` is a pre-rendered image, never
a live full-screen SVG or gradient, which glitches under software GL.

## What you return

- The paths of `film.tsx`, `brief.md`, `style-guide.md`, `shotlist.md`,
  `reviews/critique.md` and the `.mp4`.
- The seconds and the MB, from `render.sh`'s last line.
- The beats, one line each.
- The frames and strips you checked, and what they showed.
- Every number shown, with its source.
- What you left out of the source, one line each.
- What is still wrong after the repair, or `none`.
- Whether a second render happened, and why.
