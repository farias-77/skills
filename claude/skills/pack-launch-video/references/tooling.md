# Launch video: tooling

Versions as published in October 2026. The project's doctrine pins
what it actually uses.

| Package | Version | Notes |
|---|---|---|
| `remotion`, `@remotion/cli`, `@remotion/media`, `@remotion/captions` | 4.0.532 | |
| `@remotion/transitions`, `@remotion/three` | 4.0.532 | same version as the core, always |
| `three` | 0.186.1 | |
| `@react-three/fiber` | 9.4.0 | React 19 needs ≥ 9.1.2 |
| Playwright | 1.63.0 | `page.screencast` since 1.59. `fps` and `showActions.style` are 1.64-only. |
| ffmpeg | 6.1.1 | |

## Licences of the tools

- **Remotion.** Free for up to three people. Four or more people
  operating Remotion need a Company License (per-seat plan at $25/mo
  per seat; per-render plan at $0.01 per render with a $100/mo
  minimum). Check the current terms before the first render of a
  release.
- Audio and voice licences are in [recipes.md](recipes.md#narration-and-music).
  Every audio file gets a `credits.md` line: source URL, licence, plan,
  date.

## Commands

| Command | What it checks |
|---|---|
| `npx remotion benchmark --concurrencies=1,2,4` | the best concurrency on the machine |
| `npx remotion still <id> --frame=N --scale=0.5` | one proof frame |
| `npx remotion render … --frames=a-b` | one chapter |
| `ffprobe -show_entries stream=codec_name,width,height,r_frame_rate,pix_fmt` | the master's specs |
| `ffmpeg -i master.mp4 -af ebur128 -f null -` | loudness |

## Mechanical checks

- A script fails when any burned-in label is over 42 characters or over
  20 characters per second.
- A script fails when any segment's `LEVEL × (output width / source
  width)` is over 1.5.
- A script fails when an audio file under `public/` has no `credits.md`
  line.

## Fitting it into the pipeline's video kit (inference)

- Add scene types `screen` (footage + segments + cursor), `step`,
  `chapter` and `hero3d` to the kit's storyboard, keeping its
  validation and stills.
- Add a launch render profile that keeps the audio and drops the
  review-video size cap.
