---
name: lets-cook
description: The single entry point of the pipeline. `/lets-cook <idea>` always opens the same way, with scouts in the background and a light interview, then the session picks the route by its own judgment and says it in one line with the reason. Full route: it loads stage-discovery in the same session. Short route (one behavior, one entry): a one-page brief, one authorization and one /goal, the stage-4 entry pipeline, his use, the release path, a short close. Hotfix (production broken now): the same with a test that reproduces the bug first. A fix in a legacy repo is a short route or a hotfix marked `repo: legacy`. Every route keeps every check; only the ceremony shrinks. He can switch routes at any time. The session runs on Opus 5.5, high. Use for any new demand, change, bug or incident.
argument-hint: "<the idea, in his words>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, PushNotification, ScheduleWakeup, Skill, Bash
---

# Let's cook: one door, three routes

## The bar

1. One door, always the same: `/lets-cook <idea>`. You pick the route
   and say it in one line, with why.
2. Every route keeps every check: builder → gate → reviewer ∥ QAs →
   local CI with the whole gate → staging → tag → watch. Only the
   ceremony shrinks.
3. The short route reaches production with three touches from him: the
   idea, the authorization with the `/goal`, his ok.
4. A hotfix starts from a test that reproduces the bug, red before the
   fix and green after. Never a shortcut.
5. He switches routes whenever he wants, and nothing he said is lost.

## The flow

```
/lets-cook <idea> ──► scouts in the background ──► light interview ──► the route, in one line
  ├─ full    ──► load stage-discovery, same session
  ├─ short   ──► brief ──► ! authorize + /goal ──► one entry ──► his use ──► release ──► short close
  └─ hotfix  ──► brief + the test that reproduces ──► ! authorize + /goal ──► one entry
                 ──► release (his staging check, or delegated) ──► short close
  (short or hotfix in an old repo: `repo: legacy`)
```

| Read | When |
|---|---|
| [references/routes.md](references/routes.md) | before you announce the route |
| [references/light-interview.md](references/light-interview.md) | before the first question |
| `stage-release/references/release.md` | before the release of a short route or a hotfix |

## The team

| Who (model, effort) | Does | Route |
|---|---|---|
| you, the session (Opus 5.5, high) | the interview, the route, the brief, the release, the short close | all |
| `scout (Haiku 5.5, medium)` × 2–4 | the area's map, the other workstreams, legacy or not, broken in production or not | all |
| the stage-4 cast through `exec-entry-workflow.js` | `builder-backend` · `builder-frontend (Opus 5.5, medium)` → `exec-gate (Sonnet 5.5, low)` → `reviewer (Opus 5.5, high)` ∥ `qa-frontend` · `qa-backend (Opus 5.5, medium)` by surface | short, hotfix |
| `slides-builder (Sonnet 5.5, medium)` | the minimal report's decks | short, hotfix |
| `video-builder (Sonnet 5.5, high)` | the users' video, only when a screen users see changed | short, hotfix |
| `artifact-builder (Sonnet 5.5, medium)` | the Release explainer, only with an incident | short, hotfix |

## Unattended, after the `/goal`

From his `/goal` to the notification, the only things that wait for him
are his use (short route), his staging check (hotfix, unless
delegated) and the release's stop list. A wait ends on a
`ScheduleWakeup`. Nobody answers a permission prompt either: every
command you run follows `claude/references/commands.md`. Append one
line to `<designs-root>/<slug>/trace.md` at each step, as it happens,
with the time `date -u +%FT%TZ` printed; never rewrite a line.

## 1 · Open

1. **The house rules.** Read the file that
   `realpath ${CLAUDE_SKILL_DIR}/../../../CLAUDE.md` prints and run its
   Open: the canary, then the designs root.
2. **Scouts, in the background, from his first sentence.** One
   `scout (Haiku 5.5, medium)` per question: where this lives (the
   feature map, the files); which workstreams are open
   (`_coordination.md`) and whether one touches this area; is it in a
   legacy repo.
   Hotfix and short route skip the attention queue; a full route waits
   its turn inside stage-discovery.

## 2 · The light interview

Follow `references/light-interview.md`.

## 3 · The route

Decide by `references/routes.md` and say it in one line. When in
doubt between short and full, go full: going small on the wrong thing
builds the wrong thing.

- **Full:** create nothing. Load `stage-discovery` with the Skill tool,
  with what he said as Confirmed lines for its notes; its Open creates
  the slug, the folder and `.state.md`. This skill ends there.
- **Short or hotfix:** go on.

## 4 · The brief and the authorization

1. Write `<designs-root>/<slug>/brief.md` from `templates/brief.md`.
   Hotfix: its first AC is the one that reproduces the bug.
2. `gitleaks dir <designs-root>/<slug>`: a finding stops everything
   (a secret in a brief is an incident).
3. `.state.md`, rewritten at each step:

   ```
   route: short | hotfix
   repo: product | legacy <repo>
   branch: feat/<slug> | hotfix/<slug> | <the legacy repo's branch>
   step: <the step just done, as "5 · the entry">
   stage: open | closed
   ```

   Your row in `_coordination.md` (`| Workstream | Route · stage | Branch |
   Session |`): `| <slug> | <route> · <step> | <branch> | <session> |`. A
   hotfix also tells every session named there, by `SendMessage`:
   "hotfix <slug> in flight, it merges first".
4. One message, then end the turn: the brief's link, the route line,
   and the two commands he runs (where the root runs the pipeline
   clone's guard by path, `authorize.sh` is the one beside that guard):

```
! .claude/hooks/authorize.sh <short | hotfix> <slug> <feat/<slug> | hotfix/<slug>>
/goal Ship <slug> by the <short route | hotfix> with the lets-cook skill, from <designs-root>/<slug>/brief.md.
I authorize the merge into main and one patch tag; the authorization expires at the tag.
Done when: the entry passed its gate and review; <I used it and said ok through the question tool | my
staging check is delegated>; local-ci is green on the PR's final head; the tag is in production with the smoke and
the watch green; cleanup.sh --check came back empty; I got the notification. Never loosen this done
to call it met; stop early only when truly stuck, with why in trace.md.
```

In a legacy repo there is no tag (`stage-release/references/release.md`,
"Legacy repos"):

```
! .claude/hooks/authorize.sh legacy <repo> <branch>
/goal Ship <slug> in the legacy repo <repo> with the lets-cook skill, from <designs-root>/<slug>/brief.md.
I authorize the merge of <branch> into <repo>'s main, no tag; the authorization expires in 3 days.
Done when: the entry passed its gate and review; <I said ok through the question tool (before production
when the repo has no staging) | my check is delegated>; the repo's own CI deployed it; the 15-minute watch
is green; the parity line is in the feature map; cleanup.sh --check came back empty; I got the
notification. Never loosen this done to call it met; stop early only when truly stuck, with why in trace.md.
```

## 5 · The entry

- **Branch:** `feat/<slug>` from `main` (hotfix: `hotfix/<slug>` from
  `main`; legacy: the repo's own branch rule).
- **Hotfix first:** the test that reproduces the bug, at the cheapest
  layer that shows it, red on the current code. It stays in the
  security floor when the bug was one.
- Run `exec-entry-workflow.js` mode `build`, one entry, with the args
  of stage-execute's table (its step 3): `briefPath` = `brief.md`,
  `sides` = the sides its ACs touch (`['back']`, `['front']` or both),
  `designDir`, `storiesPath` and `mockDir` none, `base` = `main`,
  `referencesDir` = `${CLAUDE_SKILL_DIR}/../stage-execute/references`,
  `heartbeat` = `bash ${CLAUDE_SKILL_DIR}/../stage-execute/scripts/heartbeat.sh <designs-root>/<slug>/entry/`,
  `evidenceDir` = `<designs-root>/<slug>/entry/`. The args a full route
  takes from `plan.md` come from here:

  | Arg | Short route value |
  |---|---|
  | `entry` · `kind` | `E1` · `entry` |
  | `worktree` · `branch` | a worktree of the branch under the product's worktrees root, `<root>/<slug>/E1` · `feat/<slug>` (hotfix: `hotfix/<slug>`) |
  | `projectDocs` | the worktree's `CLAUDE.md` |
  | `fastCheck` · `gateCommands` | the commands table's fast check, then it and the entry gate with `base=main`, each with `-C <worktree>` |
  | `gatePaths` | the code-owner paths (`CODEOWNERS`) |
  | `trailer` | the commit trailer your own commits carry |
  | `loadThreshold` | `nproc` |

  The `reviewer (Opus 5.5, high)` always runs; on a hotfix, with the
  security pass.
- When the entry comes back `ready`, push and open the PR ready. Fixes
  and rounds are checked by the entry gate only. The whole gate runs
  once, on the final head, before it ships: the project's signoff
  command (`claude/scripts/local-ci.sh` when it names none), run bare
  from the session root as `tooling/local-ci <sha>` (`tooling/local-ci
  --dry-run <sha>` in a rehearsal: it posts nothing), after his ok on
  the short route, right away on a hotfix. A red there is one fix,
  checked by the entry gate, then the whole gate once more. The merge
  waits for its `local-ci`.

## 6 · His use

- **Short route:** bring the local environment up with the brief's
  "The seed shows", and ask through the question tool: ok, or what to
  adjust. Each answer is one `A.n` round (mode `fix`, the `reviewer (Opus 5.5, high)` on
  every round), then ask again, until his ok. His ok closes the build.
- **Hotfix:** his check is on staging, after the merge (step 7),
  unless he delegated it.

## 7 · Release

Follow steps 1–4 of `stage-release` with its `references/release.md`:
take the turn on `main`, merge, staging, a **patch** tag (`v1.0.0`
when the repo has no `v*` tag yet), production, the watch. The release's red rule and stop list apply as they are. A
hotfix goes first on `main` (release.md, "The hotfix"). In a legacy
repo: release.md, "Legacy repos". At the green staging, dispatch the
users' video only when a screen users see changed.

## 8 · The short close

1. `node claude/scripts/telemetry.mjs <slug> --ws <designs-root>/<slug>`.
2. Write `<designs-root>/<slug>/close.md` from `templates/short-close.md`:
   the numbers, a short retro, the "what's new" text.
3. `claude/scripts/cleanup.sh <slug> --check` → `--apply` → `--check`
   empty (`stage-close/references/cleanup.md`).
4. **The minimal report**, finished before the message, as
   `claude/docs/stage-report.md` describes. The rail is Build · Release
   · Close:

| Stage | Video | Deck | Explainer |
|---|---|---|---|
| Build | — | the brief, "Assumed", the proof, what the review found | — |
| Release | — | version, notes, smokes | only with an incident |
| Close | only if a screen users see changed | numbers and "what's new" | — |

5. `.state.md` → `stage: closed`; your `_coordination.md` row: "out in
   vX.Y.Z", or, when the release stopped before production, "closed:
   not out, <why, in a few words>" (the stop and its next commands are
   in `04-release/trace.md`). Commit the folder. One message and a
   `PushNotification`: the version (or "not out" and why), the link,
   the "what's new" text, the video if any.

## Switching routes

| Switch | What happens |
|---|---|
| short → full, any time | the brief and your notes become Confirmed lines of the discovery's notes; a branch already built stays, and the plan names it as an entry's base. Load `stage-discovery` |
| full → short, until the design closes | the discovery or design conductor proposes it in one line when one story is left; on his yes it writes `brief.md` and loads `lets-cook` |
| he says "switch" | switch; never argue the route twice |

## Resuming

`/lets-cook <slug>` with an existing folder: the canary, then
`.state.md` and `trace.md`, and from the release on
`04-release/trace.md`. The last line written is where you are.
