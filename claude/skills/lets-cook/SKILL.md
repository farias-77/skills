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
  ├─ full    ──► slug + notes ──► load stage-discovery, same session
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
| `scout (Sonnet 5.5, low)` × 2–4 | the area's map, the other fronts, legacy or not, broken in production or not | all |
| the stage-4 cast through `exec-entry-workflow.js` | `builder-backend` · `builder-frontend (Opus 5.5, medium)` → `exec-gate (Sonnet 5.5, low)` → `reviewer (Opus 5.5, high)` ∥ `qa-frontend` · `qa-backend (Opus 5.5, medium)` by surface | short, hotfix |
| `slides-builder (Sonnet 5.5, medium)` | the minimal report's decks | short, hotfix |
| `video-builder (Sonnet 5.5, high)` | the users' video, only when a screen users see changed | short, hotfix |

## Unattended, after the `/goal`

From his `/goal` to the notification, the only things that wait for him
are his use (short route), his staging check (hotfix, unless
delegated) and the release's stop list. A wait ends on a
`ScheduleWakeup`. Keep
`<designs-root>/<slug>/trace.md` current, one line per step, `date -u`.

## 1 · Open

1. **The house rules.** Read the file that
   `realpath ${CLAUDE_SKILL_DIR}/../../../CLAUDE.md` prints and run its
   Open: the canary.
2. **Scouts, in the background, from his first sentence.** One
   `scout (Sonnet 5.5, low)` per question: where this lives (the
   feature map, the files); which fronts are open
   (`_coordination.md`) and whether one touches this area; is it in a
   legacy repo.
   Hotfix and short route skip the attention queue; a full route waits
   its turn inside stage-discovery.

## 2 · The light interview

Follow `references/light-interview.md`. Restate the idea in one to
three lines. Ask only what would throw the build away if guessed wrong;
everything else you assume and write under "Assumed" in the brief, and
he sees it when he uses it. Questions go through the question tool,
your pick first. For a hotfix, ask once: "Can I ship without you
checking staging?"

## 3 · The route

Decide by `references/routes.md` and say it in one line:
"short route: one behavior, 2 ACs, one nullable column, nothing
irreversible". When in doubt between short and full, go full: going
small on the wrong thing builds the wrong thing.

- **Full:** create the slug (`YYYY-MM-DD-<name>`) and
  `<designs-root>/<slug>/`, write what he said as Confirmed lines for
  the discovery's notes, and load `stage-discovery` with the Skill
  tool. This skill ends there.
- **Short or hotfix:** go on.

## 4 · The brief and the authorization

1. Write `<designs-root>/<slug>/brief.md` from `templates/brief.md`.
   Hotfix: its first AC is the one that reproduces the bug.
2. `gitleaks dir <designs-root>/<slug>`: a finding stops everything
   (a secret in a brief is an incident).
3. `.state.md`: route, `repo` (legacy or not), step. Your line in
   `_coordination.md`: slug, route, branch, this session's name. A
   hotfix also tells every session named there, by `SendMessage`:
   "hotfix <slug> in flight, it merges first".
4. One message, then end the turn: the brief's link, the route line,
   and the two commands he runs:

```
! .claude/hooks/authorize.sh <short | hotfix> <slug> <feat/<slug> | hotfix/<slug>>
/goal Ship <slug> by the <short route | hotfix> with the lets-cook skill, from <designs-root>/<slug>/brief.md.
I authorize the merge into main and one patch tag; the authorization expires at the tag.
Done when: the entry passed its gate and review; local-ci is green on the PR; <I used it and said ok
through the question tool | my staging check is delegated>; the tag is in production with the smoke and
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
  `designDir`, `storiesPath` and `mockDir` none, `base` = `main`. The
  `reviewer (Opus 5.5, high)` always runs; on a hotfix, with the
  security pass.
- When the entry comes back `ready`, push and open the PR ready. Fixes
  and rounds are checked by the entry gate only. The whole gate runs
  once, on the final head, before it ships: the project's signoff
  command (`claude/scripts/local-ci.sh` when it names none), after his
  ok on the short route, right away on a hotfix. A red there is one
  fix, checked by the entry gate, then the whole gate once more. The
  merge waits for its `local-ci`.

## 6 · His use

- **Short route:** bring the local environment up with the brief's
  "The seed shows", and ask through the question tool: ok, or what to
  adjust. One round of adjustments (`A.n`, mode `fix`, the `reviewer (Opus 5.5, high)` on
  every round), then ask again. His ok closes the build.
- **Hotfix:** his check is on staging, after the merge (step 7),
  unless he delegated it.

## 7 · Release

Follow steps 1–4 of `stage-release` with its `references/release.md`:
take the turn on `main`, merge, staging, a **patch** tag, production,
the watch. The release's red rule and stop list apply as they are. A
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
   `docs/stage-report.md` describes. The rail is Build · Release
   · Close:

| Stage | Video | Deck | Explainer |
|---|---|---|---|
| Build | — | the brief, "Assumed", the proof, what the review found | — |
| Release | — | version, notes, smokes | only with an incident |
| Close | only if a screen users see changed | numbers and "what's new" | — |

5. `.state.md` → `closed`; your `_coordination.md` line: "out in
   vX.Y.Z". Commit the folder. One message and a `PushNotification`:
   the version, the link, the "what's new" text, the video if any.

## Switching routes

| Switch | What happens |
|---|---|
| short → full, any time | the brief and your notes become Confirmed lines of the discovery's notes; a branch already built stays, and the plan names it as an entry's base. Load `stage-discovery` |
| full → short, until the design closes | the discovery or design conductor proposes it in one line when one story is left |
| he says "switch" | switch; never argue the route twice |

## Resuming

`/lets-cook <slug>` with an existing folder: the canary, then
`.state.md` and `trace.md`. The trace's last line is where you are.
