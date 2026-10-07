# The video kit

Renders a **film** into an MP4. A film is one `.tsx` file that default-exports
`defineFilm({...})`: a list of scenes, each a few lines of React on the kit's
motion library (`src/motion/`). How to write one, scene by scene, is the
`make-it-a-movie` skill; this file is the kit's contract.

```
node claude/video/film.mjs check  <film.tsx>                         # bundles it; lists scenes and seconds
node claude/video/film.mjs stills <film.tsx> <dir> [0.5] [--scene id]  # one PNG per scene, at 70% of it
claude/video/render.sh <film.tsx> <out.mp4> [--size 720|1080] [--max-mb N] [--first]
node claude/video/record.mjs <shots.json> <footage-dir>              # real product footage (Playwright)
node claude/video/blind.mjs <text.md> <out.md>                       # the blind text test (claude CLI, Sonnet 5.5 low)
```

| What | How |
|---|---|
| Canvas | Every coordinate is on 1920×1080. The render scales it: **720p by default**, `--size 1080` for a users' video with real screens. |
| Frame rate | `fps` in the film, 30 by default; 24 is enough for a video someone waits for live. |
| Assets | Next to the film, in `assets/` (screenshots, footage, music); used as `staticFile('assets/<file>')`. Linked into the run, never copied. |
| Fonts | Local in `public/fonts` (Inter Tight, Instrument Serif, IBM Plex Sans and Mono, Big Shoulders); no network at render time. |
| The queue | One render at a time on the machine: `render.sh` takes a `flock` on `$TMPDIR/pipeline-video-render.lock`; the others wait (`queued on …` means wait, not failure). `--first` goes ahead of the waiting ones: only for a video someone is watching for live. |
| The budget | `--max-mb` (default 10): CRF 20 capped at the bitrate the budget allows, a two-pass when the cap is not enough. Audio is kept when the film has it. |
| Cleanup | Each run bundles in a private `.run-*` folder and a temp dir, both deleted at the end; the bundler cache is off, so nothing grows between renders. |
| The browser | `film.mjs` uses `VIDEO_BROWSER`, else Playwright's Chrome Headless Shell, else a copy Remotion already has in `node_modules/.remotion`. It never downloads one: without any, it stops and prints the one install command, `cd claude/video && npx playwright-core install chromium-headless-shell` (about 250 MB, once per machine). |
| The machine | Renders run under `nice`, 3 browser tabs (`VIDEO_CONCURRENCY`), `--gl=swangle` (`VIDEO_GL`). |

`render.sh` prints `path · seconds · MB` on its last line.

## The motion library

`import {...} from '@kit/motion'` (`src/motion/`):

| File | What it has |
|---|---|
| `core.tsx` | `defineFilm`, `THEMES` (`ink`, `paper`), `useTheme`, `useSec`, `prog`/`lin`/`ease`, the scene timing (1 s per 4 words on screen, 2.5 s at least) and the film shell (background, corner labels, progress bar, music bed) |
| `text.tsx` | `Pop`, `Display`, `Body`, `Mono`, `Head`, `Caption`, `Chip`, `Panel`, `Tick`, `Lines`, `Count`, `Numbers`, `TitleCard`, `Divider`, `EndCard`, `DecisionCard`, `Choices` |
| `diagrams.tsx` | `Flow` (boxes and arrows that draw themselves), `Traveler` (a dot along an edge), `Gantt`, `Bars` |
| `screen.tsx` | `Screen` (recorded footage, the camera following the clicks, the cursor drawn in post), `Shot` (a screenshot drifting toward what matters), `footageFrom(log, src)` |

A film may also write its own components with `remotion` and `three`
(`@remotion/three`) directly; the library is a head start, not a fence.

`example/film.tsx` is a working film: `node claude/video/film.mjs check claude/video/example/film.tsx`.

## Footage

`record.mjs` drives the real app at 1920×1080 from a shot list and writes,
per journey, `footage.mp4` and `log.json` (every move, click and keystroke
on the frames' clock). The shot list and the log are described in
`make-it-a-movie`'s `references/footage.md`.
