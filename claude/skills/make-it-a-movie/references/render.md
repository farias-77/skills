# Rendering: time, size, one render

A render is the most expensive step of the film, and the machine is
shared. You check everything before it with stills, render once, and
check the result.

## The commands

```
node <kit>/film.mjs check  film.tsx                        # ~20–40 s: bundles, lists scenes and seconds
node <kit>/film.mjs stills film.tsx stills/ [0.5]          # one PNG per scene, ~2–5 s each
node <kit>/film.mjs stills film.tsx stills/ --scene flow   # just one scene again
<kit>/render.sh film.tsx out.mp4 [--size 720|1080] [--max-mb N] [--first]
```

`render.sh` bundles the film, waits for its turn, renders under `nice`,
then encodes to H.264 with `+faststart` under the budget. Its last line
is `path · seconds · MB`.

## What a frame costs (measured on the shared 8-core machine)

| Film | Per frame | One minute at 30 fps |
|---|---|---|
| 2D motion at 720p | ~0.3–1.1 s (by the machine's load) | ~10–30 min |
| real footage at 1080p | ~0.7 s | ~20 min |
| a 3D scene (three.js, `swangle`) | ~0.8–1 s | ~25–30 min |

Measured runs: a 44 s film took about 25 minutes, and a 271 s film about
80 minutes. The telemetry measures every render; these numbers only help
you plan.

**What makes it faster:**

- a shorter film (cut a scene; never cut the reading time);
- 720p instead of 1080p;
- 24 fps for a film someone waits for live;
- `Shot` instead of `Screen` where the product's own motion adds nothing;
- 2D instead of 3D.

## The queue

- One render at a time on the machine. The others wait in line, first
  come, first served. `queued on …` means wait.
- `--first` goes ahead of the waiting renders (it does not stop the one
  running). Use it only for a film someone is watching for live: the
  design debate's.
- Never start a render outside `render.sh`, and never two of yours at once.

## Size

| Film | Budget |
|---|---|
| stage video | `--max-mb 10` (the default) |
| users' video | `--max-mb 15` |

The encode caps the bitrate so the file fits, and runs a two-pass when it
has to. Audio is kept when the film has it (AAC 128k).

## Before the render, every time

- `check` passes, and the total seconds are inside the length you were
  given.
- Every still has been read: no cut text, nothing off the frame, the
  accents right, one focus per scene.
- Every number on screen matches its source.

## After the render

- Take three frames with ffmpeg (start, middle, end card) and read them.
- `ffprobe -v error -show_entries format=duration,size -of csv=p=0 out.mp4`
  confirms the length and size.
- Delete `stills/` and the frames. The kit already removed its run folders
  and keeps no bundle cache.

## When the render fails

Read the error and fix the film once, then render again. If it fails a
second time, stop. Return the error and the film's path; do not keep
retrying. "Disk full" means stop and report it, never delete anything to
make room.
