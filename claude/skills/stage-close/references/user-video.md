# The video for users

The close delivers one video to the people who use the product: the
operators, the employees, the clients. It answers three things: what
problem this solves for them, how to use it, and where it is. People
ask for features that already exist because nobody showed them; this
video is the showing.

## Which piece

| The front has | The video is |
|---|---|
| a screen someone uses | a **tutorial** of the new screens, recorded in staging, cut into a motion piece |
| only backend | a **motion piece** that explains the idea in the users' words ("your leads arrive on their own at 6 am") |

Screens are ingredients; the piece is motion. 1–3 minutes, an `.mp4`
of at most 15 MB that he forwards himself. Built with the
`make-it-a-movie` skill by `video-builder (Sonnet 5.5, high)`, in
one render.

## The brief the builder gets

- The stories (`00-discovery/stories.md`, or the ACs of `brief.md` on
  the short route and the hotfix) and the tag's notes.
- The staging URLs and the journeys to record, one per story a user
  touches.
- The audience: users and employees. No technical word: no endpoint,
  table, deploy, flag, migration. A clever script: the problem first,
  then how to use it, then where it is.
- Where to put things: the video at `report/close/video.mp4` (the Close
  tab plays it; rendered with `--size 1080 --max-mb 15`), the text at
  `05-close/whats-new.md`,
  its scratch under `05-close/_scratch/` (removed by the cleanup).

## Recorded in staging, never in production

1. **Actors.** One synthetic staging actor per role, and per scope a
   story distinguishes (the manager of one region and of another),
   created and deleted with the project's staging-actor command. The
   agents' identity may do that in staging only. The builder saves one
   browser session per journey in its scratch.
2. **Only the front's actors' rows appear.** The builder filters the
   screens to the actors it created and checks, on the stills, that no
   visible row came from anyone else. A copy of production data used
   in a cutover rehearsal never stays in staging; if one is there, the
   recording stops and the session says so.
3. **No real person's name** anywhere: names on screen are the actors'
   invented names.

## One render, checked before it

The builder checks the key frames as stills **before** rendering: the
right screen, the actors' rows only, captions readable, nothing
technical on screen. Then it renders once.

You check the finished video by its stills and its length, never by
watching it whole: duration 1–3 min, size ≤ 15 MB, the stills match
the stories. A problem seen after the render goes in the delivery
message as a known issue.

## What's new

`templates/whats-new.md`, in the users' language: a title, two or three
sentences of what changed for them, one line per thing they can now
do, and where to find it. No version numbers, no technical words. It
goes in the Close deck and, in full, in the final message.

## Nothing goes outside

The `.mp4` and the text go to him; he forwards them. Nothing is
published on a public page, a store or a social account without his
approval.
