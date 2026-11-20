# Glossary

One line per term. One name per thing: when a file needs a word that
is here, it uses this one.

## The work

| Term | Meaning |
|---|---|
| **workstream** (never "front" in an artifact) | one demand end to end: one folder `<designs-root>/<slug>/`, one report link, one line in `_coordination.md` |
| **slug** | the workstream's id, `YYYY-MM-DD-<short-kebab-name>`; every stage resumes by it |
| **route** | how a demand travels: **full** (the six stages), **short** (one behaviour, one entry), **hotfix** (production broken now); `repo: legacy` marks either of the last two in an old repository |
| **the play** | what he types to start a stage: `/clear`, then `/stage-<name> <slug>` (or `/lets-cook <idea>`) |
| **`/goal`** | the one message, handed to him at a stage's open, that lets the stage run to its close on its own; discovery, a conversation, has none |
| **pre-flight** | what only he can hand over (a key, an account, a DNS record), each with a ready `!` command; checked at plan, handed over at execute's open |
| **veto list** | what the conductor decided in his place (`ruled: conductor`), one line each, in the close message; he may undo any before the next stage |
| **designs root** (`<designs-root>`) | the folder named by the line `designs-root: <path>` in the project's `CLAUDE.md` (relative to the main checkout, or absolute), for every workstream's folder, `_coordination.md` and `_retros/` |
| **`_coordination.md`** | the designs root's one line per workstream: stage, branch, the session's name, shared files, what was agreed. Sessions talk by `SendMessage`; the file records the outcome |

## Discovery and design

| Term | Meaning |
|---|---|
| **readback** | discovery's one message after he talks: what was understood, what will be assumed (with its source, most costly first), and what only he decides |
| **provenance** | how a line of `notes.md` was decided: **said** (his words), **accepted** (proposed, and he said yes to that item), **assumed** (proposed, not answered) |
| **criterion** | an acceptance criterion: exactly one per rule or behaviour, with real values and the place each outcome is seen; its id is `J<journey>.s<step>.<n>` |
| **not-building** | `not-building.md`: what was decided not to build, each line an `NB-n` with its reason; a later request for it is an amendment, not a bug |
| **guided mock** | the changed screen built from the project's own design system: one real screen, a switch between its states, and a tour of about five stops that says where to look and which rule each stop proves; none when no screen changes |
| **the lock** | the mock frozen with his words once he walked the tour (`mock/LOCK.json`); changed after only by an amendment |
| **the gate** | discovery's stop 7: he approves the stories, what was decided for him and the mock on one page; after his yes the ids freeze (`discovery/ids.json`) |
| **hunt** | one kind of hole a `discovery-hole-hunter` looks for: **errors** · **access** · **limits** · **code** (a small demand runs them as one, **whole**) |
| **seat** | the point of view of a `discovery-story-reader`: **builder** or **tester**; two seats read each story without seeing each other, and their disagreement is the finding |
| **verifier classes** | what a `discovery-finding-verifier` (a hunter's claim) or a `discovery-reading-comparer` (a story's two blind readings) returns for a finding that holds: **writing** (the text is wrong or reads two ways) · **gap** (nobody decided it) · **mechanism** (the answer belongs to the design) |
| **double-blind** | plan: two `blind-reader`s read one brief alone and a `blind-judge` compares them (**diverge** · **contradicts** · **undecidable**) |
| **solution** | design's one solution sized to the problem, with its evolution path v1 → v2 → v3, in `solution.md`: drafted, debated, closed, then expanded for the builders |
| **the debate** | design's rounds with him over the solution, drawn as one page, until he says "closed" |

## Plan and execute

| Term | Meaning |
|---|---|
| **node** | one unit of the build graph: `C`, an `E-nn`, or `E-int` |
| **C** | the contract commit: thin, first, alone; lays down what two entries would both write (the contract, migrations, stubs) |
| **E-nn** | an entry: one whole behaviour, at most 12 ACs, frontend and backend in parallel on the Contract |
| **E-int** | the integration entry, last |
| **brief** | the whole instruction an entry's builders get; ends with "The builder decides" |
| **entry gate** | the per-entry checks `exec-gate` runs once per builder pass: the fast check plus the affected tests |
| **whole gate** | the project's full gate (`make verify` or its name), run once at the end, on the final head of `feat/<slug>` after his ok, by the signoff command, which posts `local-ci` |
| **the signoff command** | the project's command that runs the whole gate in a clean worktree and, only on exit 0 and under the bot identity, posts the `local-ci` commit status; `claude/scripts/local-ci.sh` is the fallback |
| **`local-ci`** | the commit status `main`'s ruleset requires; no agent posts it by hand |
| **gate paths** · `gatePaths` | the code-owner paths: what decides green (the gate's config, the CI, the floor's tests). A fix touching one is re-read by the reviewer; a PR touching one needs his approval on GitHub |
| **heartbeat** | `beats.jsonl`: one line per agent start and end, `{at, event, agent, ceiling}`; the watcher reads silence past the ceiling |
| **`-r2`** | the relaunch of a silent cloud entry on a new branch `story/<slug>/<id>-r2` from its last pushed commit |
| **A.n** | one round of his adjustments at the hands-on: one answer of his = one brief = one entry |
| **X.n** | one fix of a red after the queue (local CI red, a staging red, a production rollback) |
| **tech lead** | the execute session: runs the graph, the queue and the merges; writes and reviews no code |

## The record

| Term | Meaning |
|---|---|
| **the report** · **the workstream's link** | one private page per workstream: a rail of stages, each with Video · Deck · Explainer, finished before the stage closes (`docs/stage-report.md`) |
| **`rulings.md`** | one line per ruling (his, or `ruled: conductor`), at the workstream's root |
| **`dreaming-notes.md`** | the frictions each stage notes as they happen; his own words marked `[user]`, a pattern of his choices marked `[taste]`, a gap in the project's standards marked `[standards]` |
| **standards book** | the project's own rules in its own repo, in the folder `standards:` names: `architecture.md` (`ARC-n`), `engineering.md` (`ENG-n`), `testing.md` (`TST-n`), `security.md` (`SEC-n`), `design-system.md` (`DS-n`), `operations.md` (`OPS-n`), the feature maps; built by `/standards setup`, changed only by a pull request he approved |
| **stack pack** | the kit's defaults for one stack (`claude/skills/standards/references/stacks/`), read where the project's book leaves a choice to the stack |
| **rule → check** | a rule the reviewers cite three or more times in a week becomes a demand for a check (a lint rule, a test helper) that catches it for free |
| **signals** | the counts `telemetry.mjs` writes beside the numbers for the weekly retro: first passes, A.n and X.n rounds, rulings taken in his place, tagged notes, rule ids cited |
| **`metrics.json`** | the workstream's numbers, written by `claude/scripts/telemetry.mjs` |
| **weekly retro** | the only place the pipeline changes: the week's closed workstreams read together, he rules each proposal (apply · park · drop) |
