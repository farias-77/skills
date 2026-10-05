# The production contract

A film made in code goes wrong in a predictable way: every decision that
nobody wrote down is filled with a safe default, such as big centred text,
a gradient, everything fading in the same way, a logo at the end. The
contract removes those gaps before the render. It keeps five layers apart,
each in its own file, with a gate between each one and the next.

## The layers

| Layer | File | Who decides |
|---|---|---|
| Director: what the film says | `brief.md` | the session that asked for the film, or an Opus agent it sends |
| Reference: how it looks and moves | `style-guide.md` | the same; when the brief leaves the look open, the builder, inside the brief's rules |
| Timeline: beats, states, cues | `shotlist.md` | the session that asked; in a stage report, the stage's arc in `story.md` |
| Renderer | `film.tsx`, `assets/` | the builder |
| Critic: what the frames show | `reviews/critique.md` | the builder, from rendered frames only |

`video-builder (Sonnet 5.5, medium)` renders and criticises. It never
decides what the film says. The three planning files start from
`templates/`.

```
<film>/
  brief.md  style-guide.md  shotlist.md
  film.tsx  assets/
  reviews/critique.md
  stills/                 scratch: stills, frames, strips; deleted at the end
<out>.mp4
```

## The gates

```
1 brief          brief.md complete: FILM · ASSETS · VISUAL RULES · DELIVERABLES
2 assets         every asset the brief lists is in assets/; a missing one stops the work
3 plan           style-guide.md and shotlist.md written; a beat without a reason is cut
4 film           film.tsx; `film.mjs check` passes, the total inside the length
5 contact sheet  one still per beat, read against the checklist; fixed in one pass
6 render         render.sh, once
7 critique       frames and transition strips; the 3 largest defects in reviews/critique.md
8 repair         only those scenes; one more render when a defect breaks the film
9 deliver        the .mp4 and the text; stills/ deleted
```

A gate is passed when its file exists or its check is clean. Do not start
a gate before the previous one has passed.

## The brief

The brief keeps the facts about the product apart from the choices about
the film:

- **ASSETS are facts:** the real logo, real screens and footage, the
  brand's tokens, licensed audio, and every number with its `path:line`.
- **FILM and VISUAL RULES are choices:** the one sentence to remember,
  the audience, the length, what to keep, and what to avoid.

Never invent a product screen, a metric, a logo or a quote. When an
asset is missing, stop and ask for it. Never draw a convincing stand-in.

## The style guide

Write the look down before `film.tsx`:

- the palette in hex;
- the type: faces, sizes, weights;
- the composition: where the eye sits, and the margins;
- the pacing: seconds between meaningful changes;
- the motion per class of object (`motion.md`);
- the texture: the theme's `bgKind`, an image, or none.

When the brief gives a reference film or site, the guide also lists what
to take from it and a **DO NOT COPY** list: its logo, its words, its
exact layout.

## The shot list

Write one row per beat: the entry state, the exit state, the reason the
beat exists, its seconds, the words on screen, and its cue. For UI motion,
list the screen's states first, then the moves between them. If you
cannot write the reason for a beat, cut the beat.

With music, the shot list opens with the beat grid (bpm and the first
downbeat in seconds). The cuts that matter land on a beat, and the
scenes' `secs` come from the grid. Stage videos have no music.

## The contact sheet, before the render

`node <kit>/film.mjs stills film.tsx stills/` writes one PNG per scene.
Run it once more at scale `0.33` (640 px wide, a phone held sideways).
Read every PNG against this list:

- the text is readable at 0.33; a word you cannot read there is too
  small;
- everything is inside the safe area: 96 px from the sides and 54 px
  from the top and the bottom of the 1920×1080 canvas (the kit's own
  corner label and progress bar aside);
- only real assets, and nothing drawn to look like the product;
- one type scale and one palette, the style guide's;
- by 2 s the viewer has read what the film is about, as a plain
  statement and never a teaser;
- the last frame works as a poster: it says what to remember and is
  readable on its own.

Fix everything in one pass. Then redo only the stills you changed
(`--scene <id>`).

## The critique, after the render

The critique judges the rendered file only, never what the code meant
to do. Put every PNG in `stills/`.

1. **Frames:** `ffmpeg -nostdin -ss <t> -i out.mp4 -frames:v 1 stills/frame-<t>.png`,
   one near the start, one in the middle, one on the end card.
2. **Strips** around the 2 or 3 fastest transitions in the shot list,
   8 frames in one image:
   `ffmpeg -nostdin -ss <t-0.4> -t 0.8 -i out.mp4 -vf "fps=10,scale=384:-1,tile=8x1" -frames:v 1 stills/strip-<t>.png`.
   Look for a ghosted or doubled layer, a half-faded frame where nothing
   reads, and two things that move at once. With music, take one strip at
   each cue and check that the cut lands on it.
3. **`reviews/critique.md`:** the 3 largest defects, no more. Give each
   one its timestamp, the evidence (the PNG and what it shows) and a local
   fix (the scene id and the change). When there are fewer than 3, write
   fewer and never pad the list.
4. **Repair:** when a defect breaks the film (unreadable text, a glitch,
   a wrong or invented asset, a wrong number), fix only the scenes it names
   and render one more time. Anything smaller goes in the return as still
   wrong.

## Known traps

- **Full-screen backgrounds under software GL.** A full-screen SVG
  pattern under a radial gradient ghosted and doubled its layers under
  `swangle`. Any background beyond the theme's `bgKind` is a pre-rendered
  1920×1080 PNG in `assets/`, placed with `<Img>`. Transitions dip, so
  one scene fades out completely before the next fades in. Never
  crossfade two full frames. The kit's scene fade already dips.
- **Deleting files.** Never `rm` a glob, and never delete anything under
  `/tmp` or `$TMPDIR`. Other renders keep their bundles there, and one
  glob has already wiped them. Delete only `<film>/stills/`, by its full
  path. The kit removes its own run folders.
- **One format.** The film is horizontal, 16:9. If a vertical or square
  version is ever wanted, it is a separate composition laid out for that
  frame, never a crop.

## What is delivered

The `.mp4` at the given path, and the text the brief asks for (for
users, the "what's new" text). The film folder is the source: the brief,
the style guide, the shot list, `film.tsx` and `reviews/critique.md`.
Make no poster file and no other format unless the brief lists one.
