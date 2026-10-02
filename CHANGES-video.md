# Video kit — what changes

The CTO follows the agents' work through short videos instead of
documents: one video per design document, one per execute entry
showing what the agents did, one for the plan's cut, the release and
the close. This change adds the kit and the agent that uses it. It
does **not** edit any stage skill yet; the lines each stage would add
are proposed below.

## What is new

| Path | What it is |
|---|---|
| `claude/video/` | A Remotion project (4.0.532, React 19) that renders a **storyboard JSON** into an MP4 with no code change per video. The look is the v9 proposal's "contact sheet / film strip": proof paper, film-base ink, one grease-pencil red, Big Shoulders and IBM Plex from local files. |
| `claude/video/schema.md` | The storyboard contract: ten scene types (`title`, `statement`, `bullets`, `flow`, `table`, `code`, `image`, `numbers`, `timeline`, `end`), their limits, the timing rule, an example. |
| `claude/video/render.sh` | `render.sh <storyboard.json> <out.mp4>`: installs once, validates (fails with the field named), renders 1920x1080 at 30 fps with `--concurrency=2` under `nice`, re-encodes to H.264 yuv420p under ~10 MB. Renders **queue** on one `flock` (`${TMPDIR:-/tmp}/pipeline-video-render.lock`): one render at a time on the machine, the others wait. |
| `claude/video/prepare.mjs`, `stills.mjs` | Validate only (`--check`); one PNG per scene for checking before the render. |
| `claude/agents/video-scribe.md` | `video-scribe (Sonnet 5.5, medium)`: reads one source, writes a 45–120 s storyboard for the technical lead (picture first, ≤12 words on screen, numbers exact and cited, decisions taken in his place stamped, failures shown), renders it, checks four frames, returns the paths. For an execute entry the story is fixed: brief → checks written red → what the builder built → the proof → what the reviewers found and what blocked → the result. |

The flow:

```
stage session ──dispatch (background, one per source)──▶ video-scribe (Sonnet 5.5, medium)
                                                          │ reads the source
                                                          │ writes <name>.storyboard.json   ← parallel
                                                          │ prepare --check · stills · Read
                                                          ▼
                                                   render.sh  ── flock ──▶ one render at a time
                                                          ▼
                                                   <workstream>/videos/<name>.mp4 (+ 4 frames checked)
```

## Cost and time

- Writing a storyboard is one Sonnet-medium read of the source; the
  render is CPU only.
- A 2-minute video renders in 3.5 to 9.5 minutes at
  `--concurrency=2` on the shared 8-core machine, depending on its
  load (the demo, 112.5 s: 3.5 min at load 4; the 121 s example:
  9.5 min at load 11). Ten design videos dispatched together write in
  parallel and render one after another: the tenth lands 35 to 90
  minutes later. The
  session dispatches the scribes in the background and moves on; it
  never waits on a video to close a stage.

## Where each stage would call video-scribe

One line per stage skill, to add when the stage owners agree (the
stage-execute skill is being edited by another session right now; no
skill is touched by this change):

| Stage skill | The line to add |
|---|---|
| `stage-design` | After the user approves the design: dispatch `video-scribe (Sonnet 5.5, medium)` in the background, **one per design document**, source `01-design/<doc>.md`, output `videos/design-<doc>.mp4`; the renders queue by themselves. |
| `stage-plan` | After the cut is approved: dispatch `video-scribe (Sonnet 5.5, medium)` once, source the plan's cut (waves, lanes, what is out), output `videos/plan-cut.mp4`. |
| `stage-execute` | When an entry merges: dispatch `video-scribe (Sonnet 5.5, medium)` in the background, source the entry's last `run-N.json`, its evidence folder, its goal and its board row, output `videos/execute-<entry>.mp4`; at the audit that closes the stage, one more over the board and the run returns, output `videos/execute-stage.mp4`. |
| `stage-release` | After the user's "vai" and the train: dispatch `video-scribe (Sonnet 5.5, medium)` once, source the release trace and notes, output `videos/release.mp4`. |
| `stage-close` | After the retro: dispatch `video-scribe (Sonnet 5.5, medium)` once, source the close record, output `videos/close.mp4`. |

Open questions for the user before the lines go in:

- Whether the videos also enter the blueprint (a link per document in
  the Design tab, per entry in the Execution tab). The blueprint is
  built, never edited; it would be a field in the stage's JSON and a
  line in the shell.
- Whether `videos/` is committed with the workstream or kept out of
  git (an MP4 is up to 10 MB).

## Demo

The kit was run by hand, as the agent's stand-in, on the landings
workstream's `01-design/architecture.md` (the central document: the
components, the request flow, the failure table and the decisions):
`/home/farias/clonex/proposals/v9/test/videos/design-architecture.mp4`
(11 scenes, 112.5 s, 7.7 MB, H.264 yuv420p 1920x1080 30 fps), its
storyboard next to it, and four frames checked in `frames/`.
