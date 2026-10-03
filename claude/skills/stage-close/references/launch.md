# The launch package — L1 to L4 of stage 6

The package is what he forwards to the people who use the product: the
film (16:9 and 9:16), its captions, a "what's new" text and the
changelog lines. The film is recorded from the real app and rendered by
the video kit in launch mode (`claude/video/schema.md`, "Launch mode").

```
L1  launch-director (Opus 5.5, high) · plan  ─┐ dispatched at step 0, background
L2  footage-recorder (Sonnet 5.5, medium)     │ when L1 returns
L3  launch-director (Opus 5.5, high) · film   │ when L2 returns, background; render ~1 h per cut loaded
L4  the session checks                        ─┘ before the step-5 message
```

## L1 · plan

Dispatch `launch-director` with `mode: plan` and, as paths:

| Input | Path |
|---|---|
| the locked mock | `00-discovery/prototype/LOCK.json`, `index.html`, `frames/` |
| the journeys | `00-discovery/journeys/*.yaml` |
| the demand | `00-discovery/stories.md`, `00-discovery/pr-faq.md` |
| the delivery page | `03-execution/explain.md` |
| the release record | `04-release/trace.md`, `04-release/notes/`, `blueprint/release/release.json` |
| where things live | the verify sections of the feature maps the project's doctrine names |
| the language | `blueprint/workstream.json` |
| the environment | the URL to record on and its mode: `read-only` on production, `demo-account` with the session file's path, or `local` |
| the accent | the product's accent colour from its exported design tokens |
| the music | a track he gave with its licence line, or none |
| the folder | `05-close/launch/` |

It returns the brief, `shots.json`, `whats-new.md`, `changelog.md`, the
features, what is cut and why, and what it needs from him.

**The session checks the cut list against the release record**: every
story that reached production is a feature of the film or a line in
the cut list with its reason. A story missing from both goes back to
the director once.

## L2 · shoot

Dispatch `footage-recorder` with `shots.json`, the environment, its
mode and `05-close/launch/footage/`. The recorder runs
`claude/video/record.mjs` one journey at a time and checks every take.

| The recorder returns | The session does |
|---|---|
| a journey recorded and checked | nothing; L3 takes it |
| a selector repaired | nothing; the shot list carries the fix |
| a journey failed (the step, why) | back to the director once: re-plan the journey or cut it |
| `blockedWrites` > 0 on production | the take is void; the journey is recorded on a demo account or cut |
| motion fps under 15 | the recorder has already re-recorded with `--slow 0.25`; one more when the machine is quieter, then the film is made with what exists and the flaw is noted |

## L3 · film

Dispatch `launch-director` with `mode: film`, the footage folder and the
recorder's report, in the background. It writes
`launch.storyboard.json` from the logs, validates it, checks the stills
at both shapes, renders with `render-launch.sh` (queued on the
machine's render lock with the stage videos), checks six frames and two
vertical ones, fixes once, and returns the paths, the sizes and what is
still wrong. The session never polls the render: the director's return
is the notification.

## L4 · check

The session opens the director's frames itself (it is about to rule on
them) and `whats-new.md`, and checks:

- every caption and line in the workstream's language, accents right;
- no personal data on any frame;
- each feature of the brief has its chapter in the film, or is in the
  cut list;
- `whats-new.md` names each feature and where it lives, under 120
  words, nothing the release did not ship;
- the sizes are inside the budgets (the film ~50 MB, the vertical ~25
  MB) and both files play (`ffprobe` shows video and, with music,
  audio).

One more director pass at most; what remains goes in the step-5
message as a known flaw.

## When the film cannot be made

No browser-drivable app, no environment, no toolchain, or every journey
failed: the package is the text alone (`whats-new.md`, `changelog.md`),
the message says why there is no film, and the retro records it as a
`W-` friction against the project's contract. The close does not wait.

## Licences

- **Music**: only a track he gave with its licence line — source,
  licence, plan, date — copied into `credits.md` and the storyboard's
  `music.credit`. The kit bundles no audio. A free-plan generated track
  or a library licensed for one platform only is not accepted.
- **Remotion**: free for teams of up to three people; four or more
  people operating it need a company licence (pack-launch-video,
  tooling).
- **Fonts**: the kit's are SIL OFL, local files.
