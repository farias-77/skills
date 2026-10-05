# Glossary

One line per term. One name per thing: when a file needs a word that
is here, it uses this one.

## The work

| Term | Meaning |
|---|---|
| **front** · **workstream** | one demand end to end: one folder `<designs-root>/<slug>/`, one report link, one line in `_coordination.md` |
| **slug** | the front's id, `YYYY-MM-DD-<short-kebab-name>`; every stage resumes by it |
| **route** | how a demand travels: **full** (the six stages), **short** (one behaviour, one entry), **hotfix** (production broken now); `repo: legacy` marks either of the last two in an old repository |
| **the play** | what he types to start a stage: `/clear`, then `/stage-<name> <slug>` (or `/lets-cook <idea>`) |
| **`/goal`** | the one message, handed to him at a stage's open, that lets the stage run to its close on its own; discovery, a conversation, has none |
| **the canary** | `git push origin a:b`, run at every stage's open: the guard must deny it with a reason starting `guard-canary`, or the stage does not open |
| **the authorization line** | `! .claude/hooks/authorize.sh <release\|short\|hotfix\|legacy> …`, run by him only; one line in the guard's allow file that lets one front merge into `main` and push one tag; dies at its tag or in 3 days |
| **pre-flight** | what only he can hand over (a key, an account, a DNS record), each with a ready `!` command; checked at plan, handed over at execute's open |
| **veto list** | what the conductor decided in his place (`ruled: conductor`), one line each, in the close message; he may undo any before the next stage |
| **designs root** (`<designs-root>`) | the folder the project's `CLAUDE.md` names for every front's folder, `_coordination.md` and `_retros/` |
| **`_coordination.md`** | the designs root's one line per front: stage, branch, the session's name, shared files, what was agreed. Sessions talk by `SendMessage`; the file records the outcome |

## Discovery and design

| Term | Meaning |
|---|---|
| **mock** | discovery's live, clickable prototype, built edit by edit while he talks |
| **the lock** | the conductor freezing the mock when nothing is open (`LOCK.json`, `versions/v<N>.html`, `frames/`); changed after only by an amendment |
| **AC** | an acceptance criterion: exactly one per rule or behaviour, judgeable by a stranger |
| **playback** | his story-by-story confirmation (Confirm · Adjust · Cut), four stories per question call |
| **disc-lens kinds** | **in-out** (In or Out, nothing in limbo) · **coverage** (every rule has its AC; limit, dependency failure, permission, repeat walked) · **acceptance** (a stranger can pass or fail it) |
| **double-blind** | two `blind-reader` read one story or brief alone; a `blind-judge` compares them |
| **blind-judge kinds** | **diverge** (two readings) · **contradicts** (the mock or another text says otherwise) · **undecidable** (something is missing) |
| **proposal** | design's one solution sized to the problem, with its evolution path v1 → v2 → v3 |
| **the debate** | design's rounds with him over the proposal, until he says "closed" |
| **the guard** | `claude/hooks/guard-irreversible.sh`, the PreToolUse hook that denies what cannot be undone. Not the `overengineering-guard`, which is a design agent |

## Plan and execute

| Term | Meaning |
|---|---|
| **node** | one unit of the build graph: `C`, an `E-nn`, or `E-int` |
| **C** | the contract commit: thin, first, alone; lays down what two entries would both write (the contract, migrations, stubs) |
| **E-nn** | an entry: one whole behaviour, at most 12 ACs, front and back in parallel on the Contract |
| **E-int** | the integration entry, last |
| **brief** | the whole instruction an entry's builders get; ends with "The builder decides" |
| **entry gate** | the per-entry checks `exec-gate` runs once per builder pass: the fast check plus the affected tests |
| **whole gate** | the project's full gate (`make verify` or its name), run once on the top of `feat/<slug>` by the signoff command, which posts `local-ci` |
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
| **the report** · **the front's link** | one private page per front: a rail of stages, each with Video · Deck · Explainer, finished before the stage closes (`docs/stage-report.md`) |
| **`rulings.md`** | one line per ruling (his, or `ruled: conductor`), at the front's root |
| **`dreaming-notes.md`** | the frictions each stage notes as they happen; his own words marked `[user]`, a pattern of his choices marked `[taste]` |
| **`metrics.json`** | the front's numbers, written by `claude/scripts/telemetry.mjs` |
| **weekly retro** | the only place the pipeline changes: the week's closed fronts read together, he rules each proposal (apply · park · drop) |
