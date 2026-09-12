# Team — <workstream> — the sessions of stage 4

<!--
  Written by the conductor at the close of the plan, from the lanes.
  The execute skill prints this table on its first message and the
  user opens the sessions as named. One session per lane plus the
  master; a demand with one repo has no master: the single session is
  the worker and runs the walk itself.
-->

| Session | Name | Model, effort | Folder | Owns | First message |
|---|---|---|---|---|---|
| master | `<slug>-master` | Fable 5.1, high | `<labs root>` | the waves: accepts, routes fixes, the walk, the reports; parks what is the user's | `/stage-execute <slug>` then "finish everything; call me when it is all green" |
| worker | `<slug>-<repo>` | Opus 5, high | `<labs root>` | lane `<repo>`: rows in order, builders (Sonnet 5, high) and lenses inside, the repo's suite | `/stage-execute <slug> worker <repo>` |

Rules the sessions share: a worker never waits for the master to go on
with its lane; only a wave waits. Every message between sessions is
one line and points at a file. Lanes that share an alpha stack:
<pair> — never a smoke and a deploy at the same time there.
