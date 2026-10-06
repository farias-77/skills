# make-it-a-movie

Claude makes a short motion video in code with Remotion. The film is one
`.tsx` file built on a small motion library: diagrams that build,
numbers that count, decisions set against their alternatives, real
product screens with a camera that follows the clicks. A brief, a
style guide and a shot list fix every decision before the code. Claude
then checks every scene as a still, renders once, and repairs only the
three largest defects seen in the rendered frames.

Two audiences:

- **A reviewer** (45–90 s, 720p): how the work runs, what was decided,
  what needs their eye.
- **Users** (1–3 min): what is new and how to use it, with no technical
  detail.

2D by default; 3D only when asked.

## Use only this skill

1. Copy this folder to `~/.claude/skills/make-it-a-movie/`.
2. Copy the video kit (`claude/video/` in this repo) somewhere on the
   machine and run `npm ci` in it once. It needs Node 20+, ffmpeg and
   `flock`.
3. Ask: "make it a movie: what changed in checkout, for our users", and
   give the kit's path.

In the pipeline, `video-builder (Sonnet 5.5, high)` preloads this skill
and makes the Video tab of the stage report. It renders; the brief and
the shot list come from the session that asks for the film.

## Files

- `SKILL.md`: the gates, the sizes, the rules on screen and the return.
- `references/production-contract.md`: the five layers, the gates, the
  contact sheet, the critique and the known traps.
- `templates/`: `brief.md`, `style-guide.md`, `shotlist.md` and `contact-film.tsx`.
- `references/motion.md`: the motion library, scene by scene: its parts,
  your own motion, timing, themes, music.
- `references/story.md`: the arcs for a reviewer (per stage) and for
  users (a tutorial, or a motion piece when only the backend changed).
- `references/footage.md`: screenshots with `Shot`, footage recorded with
  `record.mjs` and played with `Screen`, and the safety rules.
- `references/render.md`: what a frame costs, the queue, the size budget,
  the checks before and after the one render.
- `references/three.md`: a 3D scene, when the brief asks for one.
