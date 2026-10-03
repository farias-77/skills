# The launch package — L1 to L4 and its delivery, stage 6

The package is what he forwards to the people who use the product: the
film (16:9 and 9:16), its captions, a "what's new" text and the
changelog lines. The film is recorded from the real app and rendered by
the video kit in launch mode (`claude/video/schema.md`, "Launch mode").

```
L1  launch-director (Opus 5.5, high) · plan  ─┐ dispatched at step 0, background
L2  footage-recorder (Sonnet 5.5, medium)     │ when L1 returns
L3  launch-director (Opus 5.5, high) · film   │ when L2 returns, background; render ~1 h per cut loaded
L4  the session checks                        ─┘ before the step-5 message
D   the launch page                            web copies on the Artifact asset store; local files without the tool
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

## Delivery — the launch page

The master is too big for the blueprint (its videos stop at 10 MB) and
for one artifact file (15 MB). It reaches him on its own page, a link he
can forward inside his organization, with the masters as local files
beside it:

```
D1  web copies   scripts/web-copy.sh launch.mp4 web/launch.mp4    (≤ 19 MB each; the asset cap is 20 MiB)
                 scripts/web-copy.sh launch-vertical.mp4 web/launch-vertical.mp4
D2  the page     templates/launch-page.html → web/index.html, placeholders filled,
                 published with capabilities {assets: {}}
D3  upload       Artifact publish, url = the page, asset: true, file_paths = the two web copies → their urls
D4  republish    __FILM_URL__ and __VERTICAL_URL__ ← those urls, exactly as returned; the same file again
```

- **D1.** `web-copy.sh` copies a file already under the cap; otherwise
  it re-encodes in two passes at the bitrate the cap allows (full size
  from 2.5 Mbit/s, 720 px on the short side from 0.6 Mbit/s). Exit 3
  means the film is too long for one asset: no page; the message gives
  the local files only and says why.
- **D2.** The session writes `05-close/launch/web/index.html` from the
  template and fills every `__PLACEHOLDER__`: the title and a one-line
  subtitle (the release's name and date), the language, the headings
  and the vertical cut's label in the workstream's language,
  `whats-new.md` as the text (HTML-escaped) and one `<li>` per
  changelog line. The first publish passes `icon: "video"` and
  `capabilities: {"assets": {}}`; the players stay hidden while their
  URL is still a placeholder. A page that declares `assets` is visible
  inside his organization only, never public: the message says so.
- **D3.** One upload call with both web copies. The result gives each
  file's `url`; the page uses it exactly as given.
- **D4.** Fill the two URLs and publish the same file again (same URL).
  No vertical cut: leave `__VERTICAL_URL__`, its player stays hidden.
  The page's URL goes in `trace.md`, so a later round of his notes
  republishes it instead of making a new one. The session does not
  render or screenshot the page afterwards.

**No Artifact tool** (a headless run, a host without it), or a publish
or an upload refused: the delivery is the local files (the master, the
vertical cut, the captions, each with its absolute path and size), and
the message says why the film has no link. The close never waits on
it. The web copies and `index.html` are committed with the workstream;
the masters follow the footage rule of step 6.

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
