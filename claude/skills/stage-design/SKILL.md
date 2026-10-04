---
name: stage-design
description: Conducts stage 2 (Design) — takes the locked discovery (the mock the user approved, its journeys and stories) and turns it into one solution at the "basics done well" bar, agreed with the user, then into the four documents stage 3 plans from. Scouts read the current system (Sonnet 5.5, low); the conductor asks the user what he has in mind; one architect (Opus 5.5, high) writes one proposal, with where it disagrees with him and the evolution path; an overengineering critic (Opus 5.5, medium) cuts what serves no AC and no real risk; the proposal is presented as a video and slides and debated with him until he says it is closed, the slides re-rendered each round; four writers (Sonnet 5.5, high) write solution.md, data-and-contracts.md, tests.md and operations.md in parallel, about 40 KB each; one reviewer (Opus 5.5, medium), one round, blocking findings only; the stage report (video, slides, blueprint). Runs in Claude Code with an Opus 5.5 session at high effort. Use after a discovery is locked, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, Skill, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rg *), Bash(git *), Bash(node *), Bash(cp *), Bash(sha256sum *)
---

# Stage 2: Design

The lock comes in: the mock the user clicked and approved, its
journeys, its stories. The design comes out: **one** way the system
carries that product, at the "basics done well" bar, agreed with him,
and written in four documents the plan can cut. The design covers the
whole demand; the cut into slices is stage 3's.

This stage has one enemy: volume. Agents left alone overengineer, and
every page a design adds is a page stage 4 builds, reviews and carries.
So there is one proposal, not three; one critic whose only job is to
cut; four documents with a budget of about 40 KB each; one reviewer,
one round. What the design relaxes is written down as the evolution
path: what to add, and on which signal, if the feature grows.

The shape of the system is given. The consuming project's engineering
doctrine (its `CLAUDE.md` says where) fixes where code runs, how
modules talk, the stack and the quality gates. The design applies it
and never reopens it; a demand the doctrine cannot hold is a point for
the debate, marked **changes the doctrine**.

The session is the conductor, **Opus 5.5 at high effort**. It writes
`notes.md`, `reviews.md`, `rulings.md`, `taste-notes.md`,
`telemetry.json`, the scouts' answers under `recon/`, the conductor's
blueprint JSON, and a fix of one or two lines the reviewer's finding
asks for. Every other file is written by its agent: `proposal.md` by
the architect, each document by its writer.

The stage starts on his play (house rule "Every stage starts on his
play"): `/clear`, `/model claude-opus-5-5`, `/effort high`,
`/stage-design <slug>`. Its interaction is at the start: the talk (D1)
and the debate (D3–D4) until he says "closed". From there it runs on
its own to its close, and it never starts stage 3.

At the start of the stage, load the `pack-right-sizing` skill (the
Skill tool). Its bar, its floor and its overengineering list are how
you read the proposal, the critic's cuts and the review.

## He is in the loop twice

1. **D1, the talk**: what he has in mind, before anything is drawn.
2. **D3–D4, the debate**: he watches and reads the proposal, and you
   iterate with him until he says it is closed ("fechado", "closed",
   or words to that effect).

Everything else runs without him: dispatch, judge, write the audit,
build the reports, update the state, without asking permission. A
decision of his class that arises after he closed the proposal is
taken in his place, conservatively (the option that keeps the lock and
the floor and stays reversible, at the smallest cost), marked
`ruled: conductor` in `rulings.md`, and listed in the close message
for his veto.

Every reply that dispatches or waits on an agent carries a status
table (agent · task · state), the state read from the harness. Say in
one line what you are about to do, and close with a recap that stands
on its own. Do not end a turn on a plan or a promise; do the work.

## The pattern

```
D0 reading     you read the lock; scout (Sonnet 5.5, low) × N in parallel read the current
               system (routes, data, patterns, the doctrine, the other fronts) → recon/
D1 talk        "do you have something in mind?" → his words in notes.md (nothing is an answer)
D2 proposal    architect (Opus 5.5, high) → proposal.md: one solution at the "basics done
               well" bar, where it disagrees with him and why, the evolution path
               → overengineering-critic (Opus 5.5, medium) cuts → the architect applies or rebuts
               (design-research only when the proposal leans on what the scouts could not confirm)
D3 present     video-scribe (Sonnet 5.5, medium) ∥ slides-scribe (Sonnet 5.5, high)
               → a video of 2–3 min and a deck; no blueprint yet → he watches, reads, debates
D4 iterate     his points → decided with him → the architect updates proposal.md
               → the slides re-rendered (never the video) … until he says "closed"
D5 documents   design-writer (Sonnet 5.5, high) × 4 in parallel → review-prep.mjs (size,
               AC coverage) → design-reviewer (Opus 5.5, medium), one round, blocking only
               → you judge → fixes applied by you or the writer, verified on disk
D6 report      the blueprint JSON and build → the final video, the final slides, the blueprint
               → state → plan; the next play
```

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor | Opus 5.5, high | the reading, the talk, the debate, the answers to the writers, the judging, the close |
| `scout` × N | Sonnet 5.5, low | one question each about the current system or the doctrine, all at D0 in parallel: quotes with `path:line`, never conclusions; you save each answer to `recon/` |
| `architect` | Opus 5.5, high | one agent for the whole stage, resumed with `SendMessage` so it keeps its context: writes and updates `proposal.md` |
| `overengineering-critic` | Opus 5.5, medium | cuts from the proposal what serves no AC and no real risk |
| `design-researcher` | Sonnet 5.5, medium | only when needed: the `design-research` workflow, one per premise about an external tool the scouts could not confirm |
| `video-scribe` | Sonnet 5.5, medium | the video at D3 and the final one at D6 |
| `slides-scribe` | Sonnet 5.5, high | the deck at D3, re-rendered each D4 round, and the final one at D6 |
| `design-writer` × 4 | Sonnet 5.5, high | one document each, in parallel, with its blueprint JSON; asks, never decides |
| `design-reviewer` | Opus 5.5, medium | one round over the four documents: AC coverage, consistency, security posture; blocking findings only, each with a quote |

## Preconditions

`.state.md` says `stage: design`; `00-discovery/` has the lock
(`prototype/` with its version and `frames/`, `journeys/*.yaml`,
`stories.md`, `pr-faq.md`); `blueprint/` has the discovery JSON.
Missing: halt, back to stage 1.

## The host

Check at the open which of these the session has; say in one line
what is missing and run on:

| Missing | What changes |
|---|---|
| a model switch (print mode, no human) | the stage runs on the session's model and effort; write both in `telemetry.json` (`session`), one line in `dreaming-notes.md`, and go on |
| `Artifact` (a headless or cloud run) | **local mode**, `.state.md` gets `mode: local`: the decks stay on disk and the messages give the path of the first slide and of the video; at D6, as `docs/stage-report.md` says for local mode |
| the question tool | the questions go as text, in the same shape: the context, the options with their cost, your pick first and marked |
| `Workflow` accepting a `scriptPath` outside the working directories | copy `design-research.js` into `<workstream>/_run/` and check both `sha256sum`s match. `_run/` is not committed |

**Waiting.** A workflow or a background agent wakes you when it ends.
End the turn on the status table; never wait in a foreground `sleep`.
A print-mode session (`claude -p`) ends background tasks 600 s after
the turn ends unless its harness sets
`CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0`
([testing the pipeline](../../docs/testing-the-pipeline.md)).

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: design
├── blueprint.html             # built, never edited (house rule)
├── blueprint/design/          # <doc>.json × 4 (writers) · proposal.json · decisions.json · design-report.json · design-review.json (you)
├── report/design/             # the stage report (D6): storyboard.json, video.mp4, project/
├── rulings.md · taste-notes.md · dreaming-notes.md
├── 00-discovery/              # the lock (stage 1, untouched here)
└── 01-design/
    ├── notes.md               # your record: what exists today, his words, the debate, the answers
    ├── telemetry.json         # your record, in the shared shape (claude/docs/telemetry.md)
    ├── recon/                 # <topic>.md: the scouts' answers, saved by you
    ├── research/              # <topic>.md, only when a premise needed it
    ├── proposal.md            # the architect's: the solution, the disagreements, the evolution path
    ├── presentation/          # D3–D4: storyboard.json, video.mp4, project/ (the deck)
    ├── solution.md · data-and-contracts.md · tests.md · operations.md
    ├── reviews/               # critic.json (D2), review.json (D5): each return, as it came
    └── reviews.md             # the audit: your file
```

## D0 — reading

If the session is not on **Opus 5.5 at high effort**, ask the user
once to switch (`/model claude-opus-5-5`, `/effort high`) and wait (a
session that cannot switch: see the host table). Load `pack-right-sizing`. Read the lock's `stories.md`
and `pr-faq.md` whole (you rule on them all stage long); the journeys,
the mock and the codebase are read by agents. Create
`01-design/notes.md` from [templates/notes.md](templates/notes.md) and
`01-design/telemetry.json` with `openedAt` and the session's model
([claude/docs/telemetry.md](../../docs/telemetry.md)).

Then, in one message, one **`scout (Sonnet 5.5, low)`** per question,
all in parallel:

- per area the lock touches (a backend module, a frontend app, a job,
  the infra): what exists today (routes, tables, screens, jobs, the
  commands) and the golden path (the exemplary module) of each kind of
  code the lock will need;
- the front's design tokens and components, so the screens map the
  mock onto what the app has;
- the doctrine's rules for anything the lock will add (a table, a
  route, a job, a screen, an alarm);
- the other running workstreams (the designs root's coordination
  file, each `.state.md`) and the files they share with this one.

**The base** is each repo's base branch at its current head: each
scout opens its answer with `<repo>@<branch> <sha>`. Ask each scout to
quote file by file (`grep -n` on one file, or a `Read`), never from a
concatenated listing, whose line numbers drift. The scout never
writes: save each answer, as it came, to `01-design/recon/<topic>.md`
in one `Write`; the architect and the writers read `recon/`.

When they return, write the notes' **What exists today** (one line per
fact with its source) and **No-gos** (from the PR-FAQ and the stories'
Out lines). Then D1 in the same turn.

## D1 — the talk

One message, then wait. Three lines on the lock (what is being built,
for whom, how many stories), three lines on what exists today, then
one open question: **"Do you have something in mind for how to build
this?"** He may describe a whole design, one constraint, or nothing.
"Nothing" is a complete answer.

Write his words, as close to verbatim as the notes allow, to the
notes' **His idea**. One follow-up question at most, and only when his
words leave open a choice the architect cannot make without him
(which of two things he meant). Then D2 in the same turn.

## D2 — the proposal

Dispatch **`architect (Opus 5.5, high)`** with `Agent`, in propose
mode: the workstream path, the lock, `notes.md`, `recon/`,
`research/`, the doctrine's path, the repos with their base branch,
the template ([templates/proposal.md](templates/proposal.md)), the
language and the date. Write its agent id in `telemetry.json`
(`design.architect`): every later turn of the architect is a
`SendMessage` to that id, so it keeps what it read and why it chose.

The architect writes `01-design/proposal.md`: one solution, the names
the documents will copy, where it disagrees with his idea and why,
and the evolution path. It returns its premises. **A premise it could
not confirm** about an external tool (a vendor API, a limit, a price
the design leans on) is when research runs: the
[`design-research`](../../workflows/design-research.js) workflow by
`scriptPath`, one per topic, with `topic`, `questions`, `designDir`,
`repos`, `template` ([templates/research-target.md](templates/research-target.md)),
`language`, `date`; then `SendMessage` the architect to revise from
`research/<topic>.md`. No unconfirmed premise, no research.

**The critic.** Dispatch **`overengineering-critic (Opus 5.5,
medium)`** with `proposal.md`, `notes.md`, the lock, `recon/` and the
doctrine. Save its return, as it came, to `01-design/reviews/critic.json`.
Send the cuts to the architect (`SendMessage`): it applies each or
rebuts it in the proposal's "The critic's cuts", one row each.

**Read `proposal.md` whole: you rule on it.** A rebuttal stands only
when it names the AC, the floor item (pack §3 D) or the real risk the
mechanism serves; a weak one goes back to the architect once, with
your reason. A disagreement with his idea stands only on a clear
reason (an AC it fails, a floor item, a cost, a one-way door, the
doctrine); a preference goes back. Then D3 in the same turn.

## D3 — present

Dispatch, in one message, with `<root>` = `01-design/presentation`,
the workstream path, the language, the date, the sources
(`proposal.md`, `notes.md`) and this focus paragraph:

> **The proposal.** The problem in the user's words. The solution in
> one picture. The main flows, step by step. The bar: what is done
> well, and what was relaxed. The evolution path: what to add, and on
> which signal. Where the architect disagrees with his idea, and why.
> What the critic cut.

- **`video-scribe (Sonnet 5.5, medium)`**: a video of about 2 to 3
  minutes (this brief overrides its usual length), plain language, the
  picture first; written to `<root>/storyboard.json` and
  `<root>/video.mp4`.
- **`slides-scribe (Sonnet 5.5, high)`**: the deck, before any
  blueprint exists: the same story plus the details for debate (the
  parts and the names, each flow, the evolution table, each
  disagreement with both sides); the last slide is the open points.
  `__BLUEPRINT_URL__` has no target and is left out; `__VIDEO_URL__`
  becomes `video.mp4`.

Publish the deck as `docs/stage-report.md` step 4a does (a new
Artifact from the Slides type, `title: "<workstream title> ·
Proposal"`), read the slide files, and publish them to the deck's URL
with the video beside them (`files: {"video.mp4": "<root>/video.mp4"}`;
local mode: the host table). Then one message: the video and the deck
in two lines, the solution in one sentence, the disagreements in short
topics, and "What do you think?". Then wait.

## D4 — iterate until he says closed

Each time he answers:

1. **Take his points.** A visible numbered list, his words quoted.
2. **Decide with him.** A point that is an instruction ("drop the
   queue") is taken as given. A point that is a question for the
   architect ("why not a cron?") goes to it first (`SendMessage`), and
   its answer comes back to him in one line. A point that is a choice
   goes through the question tool in the house shape: the context in
   the question, the architect's pick first and marked, at most four
   to a call. Each ruling goes to `rulings.md`; one against the pick
   also goes to `taste-notes.md`, as the pattern.
3. **Update the proposal through the architect.** One `SendMessage`
   with every ruled point and his words. It edits `proposal.md` in
   place, adds a row to "Changes per round", and records how each
   disagreement was settled. You never edit `proposal.md`.
4. **Re-render the slides only.** `slides-scribe (Sonnet 5.5, high)`
   in update mode over the same `<root>`, with what changed; republish
   to the same deck URL (read the slide files first). The video is not
   redone.
5. **One message:** the deck's link, what changed in a table (point ·
   change), what is still open. Then wait.

Write each round to the notes' **The debate**. Repeat until he says
the proposal is closed. Then: `SendMessage` the architect to mark it
closed with the date and his words. When the proposal grew during the
debate by something he did not ask for (a part or a mechanism the
architect added), the critic reads that delta once and the architect
applies or rebuts its cuts, without a new presentation. Then D5 in the
same turn.

**A point that changes the doctrine** is written by you, now, so the
writers can cite it: in a `git worktree` of the repo that holds the
doctrine, on a branch `doctrine/<workstream>` (never by switching that
repo's checkout), the why in the commit message with his words. It
merges with the close commit.

## D5 — the documents

Four `Agent` dispatches of **`design-writer (Sonnet 5.5, high)`**, in
one message, one per document, in write mode, each with the same
brief: the workstream path, `proposal.md` (the source of every
decision and every name), `notes.md`, `recon/`, `research/`, the lock,
its template, the shared rules
([references/design-docs.md](references/design-docs.md)), the
blueprint schema (`${CLAUDE_SKILL_DIR}/../../blueprint/schema/design.md`)
and the language. Keep each writer's agent id: answers and fixes go
back by `SendMessage`.

| Document | Template | Holds |
|---|---|---|
| `solution.md` | [templates/solution.md](templates/solution.md) | the parts, the screens, the flows, the decisions, the security posture, where the architect disagreed with him and how it was settled, the evolution path |
| `data-and-contracts.md` | [templates/data-and-contracts.md](templates/data-and-contracts.md) | the tables and migrations; **the Contract** per entry-sized feature: route, request and response JSON, errors |
| `tests.md` | [templates/tests.md](templates/tests.md) | per AC of the discovery, cited by id, the layer that proves it (unit, API, journey): one AC, one primary proof |
| `operations.md` | [templates/operations.md](templates/operations.md) | migration and rollout, flags, the alarms that would wake someone, rollback, the run cost |

**The writers' questions.** Merge the ones that are the same choice
and answer each once, from `proposal.md` and the notes. A question of
his class is not asked: rule it conservatively, `ruled: conductor`,
for the veto list. Write each answer to the notes' "Questions
answered", and send it to every writer it touches. A name that is
not in `proposal.md` is added there first, by the architect, then
copied.

**Before the review**, run
`node ${CLAUDE_SKILL_DIR}/scripts/review-prep.mjs <workstream>`. It
checks the four documents exist and end with "The implementer
decides", lists every AC id of `stories.md` that `tests.md` does not
cite, and weighs the documents: one over 40 KB, or the set over
160 KB, is a warning (`--doc-budget-kb`, `--total-budget-kb` change
the defaults). A missing AC or a missing section goes back to its
writer. A warning never stops the stage: the document usually copies
what another source holds; the writer cuts the copy, and the warning
goes to `dreaming-notes.md`.

**The review: one reviewer, one round.** Dispatch
**`design-reviewer (Opus 5.5, medium)`** with the four documents,
`proposal.md`, `notes.md`, the lock (`stories.md`, `journeys/`,
`prototype/` with its `frames/`), the doctrine's path and the
reviewer contract
([docs/standards/reviewer-contract.md](../../docs/standards/reviewer-contract.md)).
It checks three things: every AC is proved in `tests.md`; the four
documents agree with each other, with `proposal.md` and with the
locked mock; the security posture (pack §3 D7, the doctrine). It
returns blocking findings only, each with a quote and its
`<file>:<line>`. Save the return, as it came, to
`01-design/reviews/review.json`, and write `01-design/reviews.md`
([template](templates/reviews.md)).

**Judge** every finding by [references/judging.md](references/judging.md):
sustained or dismissed, one row each in `reviews.md` before any fix
moves. A sustained fix of one or two lines you apply yourself with
`Edit`; a larger one goes to its writer (`SendMessage`, apply mode).
A fix that renames, revalues or removes something runs
`node ${CLAUDE_SKILL_DIR}/scripts/propagation-check.mjs <workstream> <old term> …`
before and after it: every hit is changed, or stays only as a
negation. Verify every fix on disk. **There is no second round.**

## D6 — the report and the close

Write the conductor's JSON under `blueprint/design/`
(schema: `${CLAUDE_SKILL_DIR}/../../blueprint/schema/design.md`):
`proposal.json` (the debate: his idea, the rounds, the disagreements
and how each was settled, his closing words), `decisions.json` (his
rulings from the debate and every `ruled: conductor` line, each with
the recommendation and the pick), `design-review.json` from
`reviews.md`, and `design-report.json`, the plain layer the tab opens
with. Then `node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>`.
The build refuses with the field named; a refusal goes back to the
writer of that JSON.

**The stage report**: follow
[docs/stage-report.md](../../docs/stage-report.md) (video, then
slides, then blueprint), with the design's focus paragraph. Every
number on a slide is quoted from a document, `notes.md` or
`telemetry.json`, never summed by the scribe: check each before you
publish.

Close `telemetry.json` in the shared shape: a step row per D0–D6 with
its wall-clock and his minutes (D1, D3–D4), the agents dispatched
with their model and effort, hours and tokens as the harness reports
them, the debate rounds, the documents' sizes in KB, the review's
findings (found, sustained, dismissed), and the cost when the harness
reports one.

Then one message, after the three layers: the review in one line
(found · sustained · dismissed), the **veto list** (every
`ruled: conductor` line), the taste notes added, the telemetry in one
line. The stage closes now: he approved the design when he closed the
proposal. `.state.md` to `stage: plan`, the close commit of the
workstream folder (never `report/**/.remotion/`, the video kit's
browser cache; push only on his word), the doctrine branch merged. The
message ends with the next play, and nothing runs until he types it:

```
/clear
/model claude-opus-5-5
/effort high
/stage-plan <slug>
```

A veto he sends before he gives that play is applied by its writer,
then the blueprint is rebuilt and republished.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something. In the terminal: a table for parallel things,
a flow in a code block for a sequence, short topics for lists; a
paragraph only for the one argument that is prose.

## Resuming

Everything is in files. Read `.state.md`, then `notes.md` and
`telemetry.json`. Continue from the first step whose output is
missing: no `recon/` → D0; no "His idea" → D1; no `proposal.md` → D2;
no `presentation/` deck → D3; `proposal.md` not marked closed → D4;
a document missing → D5 (a writer redispatched with the list of what
is on disk; it never rewrites a finished file); no
`reviews/review.json` → the review; otherwise D6. The architect of a
previous session is gone: a new `architect (Opus 5.5, high)` dispatch
in update mode reads `proposal.md` and "Changes per round" and goes
on. Never resume from memory of a previous session.
