---
name: stage-plan
description: Conducts stage 3 (Plan) — takes an approved design and builds, with the user, the sequence in which the whole demand gets built: one scout (Sonnet 5, high) per repo writes what exists today, the conductor (Fable 5.1, high) arrives with the cut ("from A to B") as rows (one story in one repo, with a proof that is a command and its expected output), lanes (the rows of one repo, in order, an edge only where a proof needs another row running) and waves (the acceptance gates: which rows, the walk the master runs in alpha, the suites), the user approves wave by wave; then one writer (Sonnet 5, high) per lane × wave writes the worker's goal in parallel, deciding nothing; a review round of three lenses (Opus 5, high), two blind readers (Haiku 4.5, high) and a referee (Sonnet 5, low) per goal, judged by the conductor; round 2 automatic over the delta, a third only on the user's word; the blueprint's Plan tab built from JSON and read by the user at the close, the pre-flight handed over, the sessions of stage 4 named. Runs in Claude Code with a Fable session at high effort. Use after a design is approved, or to resume a plan in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *), Bash(git *), Bash(node *)
---

# Stage 3: Plan

A definition of how it works comes in: the design of the whole
demand. A sequence comes out: **from A to B, and the steps in
between**. A is what exists in the repos and in alpha today; B is what
the design says exists at the end; the steps are rows, ordered inside
lanes, accepted at waves. The plan re-decides nothing of the design:
it says in what order the design comes to exist in alpha, how each
step is proved by a command, and where a person accepts.

Three words, from the smallest up:

| Word | What it is | Who owns it at stage 4 |
|---|---|---|
| **row** | one story inside one repo, with its own proof: a command and the output it must print (`run` / `expect`), or a screen and where to look (`see` / `where`). A mesh repo, an infra step or a seed is a row too | one worker, one branch, one PR |
| **lane** | the rows of one repo, in order. An edge between two rows exists only when one row's **proof** needs the other running in alpha; a contract the design froze is not an edge, the consumer proves on seeded data. Lanes run in parallel from day one | one worker session per lane |
| **wave** | an acceptance gate, not a phase: the rows that must be merged and deployed, the walk the master runs in alpha end to end (commands with expected outputs, screenshots for what is visual), each repo's whole suite green before. Nothing is accepted for the demand until its wave is green; no lane stops for a wave | the master session |

The session is the conductor, **Fable 5.1 at high effort**. It runs
the cut with the user, writes `waves.md` as the session closes,
dispatches scouts and writers, runs the review, judges every finding,
builds the blueprint, and hands over the pre-flight and the team.
It writes `waves.md`, `team.md`, `reviews.md`, `rulings.md`,
`taste-notes.md` and the conductor's blueprint JSON; every goal is
written by its writer, first draft to last fix. A finding is only
fixed when the writer changed the file.

## Two modes

**Session mode** (steps 2 and the reading of 7). The user is in the
room to shape the cut and approve it. You arrive with the proposal;
he does not have to think it up. Closed choices go through the
question tool in the house shape; open discussion goes in prose.
No agent runs during the session; a fact you need, you look up in
`recon/` or the repo yourself, inline. Every reply in the terminal is
built to be followed at a glance: a table for parallel things, a flow
drawn in a code block for a sequence, short topics for lists.

**Autonomous mode** (steps 1, 3 to 6 and the file work of 7). The
user is waiting, not answering. Dispatch, run the workflows, judge,
write the audit, build the blueprint, update the state, without
asking permission for any of it. Every reply that dispatches or waits
on an agent carries a status table (agent · task · state), the state
read from the harness, never assumed. Say in one line what you are
about to do, and close with a recap that stands on its own. Do not
end a turn on a plan or a promise; do the work.

## The pattern

```
0. Open     first message: ask the user to switch to Fable, effort high; wait for his ok
1. Recon    one plan-scout (Sonnet 5, high) per repo the design names, in parallel
            → 02-plan/recon/<repo>.md: what exists today (smoke folders and counts, deploy
            commands, branch conventions, the tables, routes and screens the rows will extend)
2. The cut  SESSION. from A to B in one line; the rows; the lanes with their edges; the waves
            where the user wants to look; approval wave by wave through the question tool;
            adjustments in a visible list, applied on "apply" → waves.md, team.md
3. Write    one plan-writer (Sonnet 5, high) per lane × wave, in parallel, same source
            (waves.md + the design + recon + the template): the worker's goal, every row with
            run/expect, plus blueprint/plan/goals/<repo>-wNN.json; zero decisions — questions
            come back in one batch, you answer them against the approved cut
4. Round 1  whole and automatic: plan-review workflow (three lenses Opus 5 high; per goal two
            blind readers Haiku 4.5 high + a referee Sonnet 5 low); you judge every finding by
            references/judging.md; wording → writers; the cut → you, against what he approved
5. Round 2  automatic, delta only (the goals that changed + the fixes); a third round only on
            the user's word
6. Close    plan-report.json + plan-review.json + sequence.json, node claude/blueprint/build.mjs,
            publish; the user reads the Plan tab and sends adjustments in a batch, applied on
            "apply"; the pre-flight handed over; approval; close commit last; state → execute; /clear
```

The user is interrupted at: the switch (0), the cut (2), a question
a writer raised that only he can answer (end of 3), a finding that
would change what a wave accepts (4 or 5), and the close (6).
Everything else runs without him. Round 2 runs without asking: the
plan is mechanical and he is waiting, not answering.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor | Fable 5.1, high | the cut, the answers to the writers, the judging, the close |
| `plan-scout` × 1 per repo | Sonnet 5, high | reads the repo and its docs, writes `recon/<repo>.md`: facts and where they are |
| `plan-writer` × 1 per lane × wave | Sonnet 5, high | one goal each, in parallel, from the same source; asks, never decides |
| `plan-reviewer-{coverage, verifiability, order}` | Opus 5, high | three lenses, each reads everything |
| `plan-blind-reader` × 2 per goal | Haiku 4.5, high | builds and proves one goal alone, reading only that file, in the goal's language |
| `plan-reviewer-ambiguity` | Sonnet 5, low | compares the two builds key by key |

Where the Fable tokens go: the cut and the judging. What left Fable
since the first run: writing the goals (writers), reading the repos
(scouts), the judge agent (you already hold the goals). No script
checks a goal; the writers, the lenses and you do.

## Preconditions

`.state.md` says `stage: plan`; `01-design/` has the approved design
with `notes.md`; `blueprint/design/` has the design JSON. Missing:
halt, back to stage 2.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: plan
├── blueprint.html             # built, never edited (house rule)
├── blueprint/                 # the discovery and design JSON, plus:
│   └── plan/                  # sequence.json · plan-report.json · plan-review.json (you)
│       └── goals/             # <repo>-wNN.json, one per goal (writers)
├── rulings.md · taste-notes.md · dreaming-notes.md
├── waves.md                   # the cut: A → B, frozen contracts, lanes, waves; your file, written once approved
├── 00-discovery/ · 01-design/ # untouched here
└── 02-plan/
    ├── recon/                 # <repo>.md, one per repo, by the scouts
    ├── goals/<repo>/wNN.md    # one goal per lane × wave — the worker's brief
    ├── team.md                # the sessions of stage 4: name, model, effort, folder, first message
    ├── reviews/               # round-N.json: each round's return value, as it came
    └── reviews.md             # the round audit: your file
```

## Step 0 — open

The first message after the skill is invoked asks the user to switch
the session to **Fable, effort high**, and says why in one line: the
cut is the one act of thought in this stage, and the judging is his
to trust. Nothing else happens until he says he switched. Then read,
before speaking again: the design whole (`notes.md`,
`architecture.md`, `contracts.md`, `data-model.md`, `rollout.md`,
`acceptance.md` above all), the discovery's stories, the consuming
project's `CLAUDE.md` and the house standards. Not the repos: the
scouts read those.

## Step 1 — recon

Autonomous mode. One `Agent` dispatch of **`plan-scout`** per repo
the design names (`code.md` lists them), all in one message, each
with the repo path, the design folder and the template
([templates/recon.md](templates/recon.md)). A scout reads the repo
and its `docs/` and writes `02-plan/recon/<repo>.md`: the smoke
layout with the folders and their case counts, the commands that
deploy, test and run the suite, the branch conventions, the tables,
routes, screens and stacks the design's rows will extend, what is
already in alpha, and how long the whole suite takes when the docs
say. Facts only, each with where it was read; a repo that does not
exist yet gets a one-line file saying so. Scouts read the repo and
its docs; they do not call the cloud.

Read every file when the scouts return. This is A: where the demand
starts from.

## Step 2 — the cut

Session mode. Arrive with the whole proposal; the user shapes it and
approves it. The order of the conversation:

| Move | You bring | The user |
|---|---|---|
| A → B | one line: where the repos and alpha are (from recon), where the design ends | confirms |
| the frozen contracts | the schemas, routes and events `contracts.md` and `data-model.md` fix, as a list: the reason a lane never waits for another | confirms |
| the rows | a table: story × repo, what it builds, what it consumes, how it is proved (`run` / `expect` or `see` / `where`) | adds, cuts, reorders |
| the lanes | one table per repo: rows in order, edges only where a proof needs another row running, `∥` where two rows touch different surfaces; a drawing of the lanes side by side | contests an edge |
| the waves | where he wants to look: each wave as a vertical line in the drawing, with the rows it requires, the walk step by step as commands, the suites; forks as cards (one wave or two, the thin flow first or not) | approves wave by wave |
| the team | one session per lane plus the master: name, model, effort | confirms |

**How the rows are found.** From the design: `contracts.md` says who
owns each surface, `acceptance.md` says the cases and their folders,
`ui.md` the screens, `infra.md` the resources. One row per story per
repo; an infra step, a seed, a mesh repo briefed whole is a row too.
Every row names what it builds, what it consumes, what it touches
(folders, tables, screens) and who reads what it writes: that list is
what the wave runs as its affected folders.

**How the edges are found.** A depends on B only when A's proof needs
B running in alpha. A route the front reads, a table the tracking
reads: if the shape is frozen in the design, the consumer proves with
seeded data in that shape and the edge does not exist; the real
producer is proved once, in the wave's walk. An edge that exists is
written with what is consumed. Rows of the same lane with no edge
between them and on different surfaces are marked `∥`.

**How the waves are found.** Walk the lanes from the first row up and
close a wave at the first point where a person can do something end
to end in alpha that they would want to see before more is built on
it. A wave never ends on "the tables exist"; fold it forward or give
it a thin flow that proves it. A new repo's first wave is its
skeleton plus one thin flow crossing everything. Fewer, bigger waves
when the domains are adjacent (the user's taste on record); a lane
with more than about eight rows in one wave splits by domain. Every
wave carries: the rows it requires, the affected folders (what those
rows touch, plus the folders that read what they write), the walk as
numbered steps each with `run` and `expect` (or `see` and `where`,
and then a screenshot is the evidence), whether each repo's whole
suite must be green before it, and "the master decides": what the
master may settle alone at that wave and what parks.

**Ask for the approval, wave by wave, through the question tool.**
One question per wave, four per call, in order: the wave's line, its
rows and its walk in the question, "Approve" first. Where the cut has
a real fork (one bigger wave or two smaller ones, the skeleton as its
own wave or as the first rows), the alternatives are the other
answers, one line of cost each; otherwise "Change" is the only other
answer and he says what in "Other". A rejected or changed wave gets a
second proposal in the next call, not a discussion; if he rejects
that one too, the wave is what he wrote in "Other", transcribed as
is. Adjustments he sends between questions go to a visible list and
are applied when he says "apply". When every wave is approved, write
`waves.md` from [templates/waves.md](templates/waves.md), whole, in
one pass, the forks recorded as cards with the recommendation beside
the choice, and `team.md` from [templates/team.md](templates/team.md).
Every wave where he chose against the recommendation goes to
`taste-notes.md` on the spot, as the pattern.

Three rules inside the proposal:

- **Every proof is a command or a screen.** `run` is a command line
  the worker or the master types; `expect` is what it prints, with
  the count ("`0 failed` of 14 cases, `accounts-source-403` among
  them"). `see` is a screen against the alpha API, in both themes, at
  390 px; `where` is the artboard in `ui.md`, and the screenshot goes
  to the wave's proof folder. "Works" is not a proof. Nothing needs a
  human eye before the close of stage 4; nothing needs prod.
- **Alpha is the lane branch, and nothing else.** Every row is
  built on its own branch and never deployed from there; its PR
  merges into `feat/<workstream>` of its repo when its proof is
  green, and that merge is what deploys. So "what is in alpha" is
  always the top of each lane branch, which the board already shows.
  At a wave, the master tags that top (`w01`) in every repo the wave
  requires and walks; while a walk or a whole suite runs on a stack,
  no deploy lands on it (the workers keep coding and merging; only
  the deploy waits). A red walk is fixed by a row on top, never by a
  rollback, because nothing else entered alpha meanwhile. The branch
  names and who merges are stage 4's; the plan writes the rule in
  `waves.md` and in every goal.
- **The sequence covers the whole demand, and nothing else.** Every
  story of the discovery lands in a row; the PR-FAQ's "What we are NOT
  building" and the stories' "Out of this story" never do. The
  design's latitude stays latitude.
- **The user leaves nothing behind.** Everything a row would need
  from him (a credential, a text, an account, a third-party contract)
  is listed as the pre-flight and handed over at the close, before
  stage 4 opens. A row with a pre-flight item is marked; stage 4
  parks it if the item is missing and finishes everything else.

> **Example of a wave question** — header `w01`, question: "w01 ·
> the pipeline runs · requires ingestion 1.0–1.5 · walk: 1) `aws
> stepfunctions start-execution … --input '{}'` → status `SUCCEEDED`
> within 10 min · 2) `aws dynamodb query … orphan#residencial` → count
> ≥ 1 · 3) `curl …/ingestion/status` → `last_success_at` of this run ·
> suites: ingestion whole (34 cases). The tracking and front lanes
> keep running; nothing of theirs is accepted here." Answers:
> "Approve" · "Fold into w02 (one gate instead of two; first look
> later)" · "Change".

## Step 3 — write

One `Agent` dispatch of **`plan-writer`** per lane × wave, all in one
message, in write mode, each with the same brief: the workstream
path, `waves.md`, the lane and wave it owns, `recon/<repo>.md`, the
design folder, the discovery, the goal template, the blueprint
schema, the consuming project's `CLAUDE.md` and the language. The
writer writes `02-plan/goals/<repo>/wNN.md` and
`blueprint/plan/goals/<repo>-wNN.json` in the same pass and returns
its questions. It decides nothing: a value the cut and the design do
not fix is a question. Answer from `waves.md`, the design and the
recon what they settle, the simplest option that keeps every approved
wave as it stands; an answer that would change a row, an edge or a
wave's walk is not yours: ask the user through the question tool.
Every answer you gave goes to `rulings.md` marked `ruled: conductor`
and is listed at the close for veto. Send the answers to each writer
in one message.

When the writers return, read every goal: every row of that lane and
wave is a `### N.k` section in the same order, every row has `run`
and `expect` (or `see` and `where`), the four closing sections are
there and "Questions" is empty. Anything missing goes back to its
writer in one message before the review starts.

## Step 4 — round 1

Autonomous mode. Run
[`plan-review`](../../workflows/plan-review.js) by `scriptPath`
(never by name), with `planDir`, `wavesPath`, `designDir`,
`discoveryDir`, `reconDir`, `repos` (name and path), `round: 1`,
`language`, and `goals`: one `{id, repo, wave, path}` per goal file.
The workflow passes paths; the readers open only their goal.

| Lens | Question |
|---|---|
| `plan-reviewer-coverage` (Opus 5, high) | every story AC and every acceptance case lands in exactly one row; every screen and every resource has its row; both ends of every contract are built by the last wave that consumes them; no row builds what nothing forces |
| `plan-reviewer-verifiability` (Opus 5, high) | every `run` is a command that exists in that repo and every `expect` is an output it prints; every `see` names its artboard; every row proved on seeded data has its real producer in some wave's walk; the wave's walk crosses lanes; nothing needs a human eye or prod |
| `plan-reviewer-order` (Opus 5, high) | every edge is real and every real edge is declared; a consume with no edge is provable on frozen data; `∥` rows and parallel lanes do not collide on a stack, a table's schema or a screen; lanes that share an alpha stack are listed; the affected folders of each wave are complete |
| 2 × `plan-blind-reader` (Haiku 4.5, high) → `plan-reviewer-ambiguity` (Sonnet 5, low), per goal | would two engineers build the same rows from this goal alone, and call each one done on the same command and output? |

Every reviewer answers under the
[reviewer contract](../../docs/standards/reviewer-contract.md). The
workflow returns `{ round, mode, valid, findings, lenses, unread }`;
a round in which no goal was read is invalid: fix the cause, run it
again.

Record before acting: save the return value as it came in
`02-plan/reviews/round-N.json`, and write `02-plan/reviews.md`
([template](templates/reviews.md)) from it in one `Write`.

**Judge.** You rule every finding by
[references/judging.md](references/judging.md): merge by fix first,
then sustained / deferred / dismissed, with the owner of each
sustained one: `writer`, `user` or `worker`. Write the rulings to
`reviews.md` before any fix moves.

- **`writer`**: a pointer, a count, a `run` made exact with what the
  recon already fixes, an edge the proof plainly implies, propagation
  to the goal that consumes it. One apply batch per writer, in one
  message; the report carries the mentions table and the final lines;
  a fix without pasted lines is not done. No veto question: the user
  reads the blueprint at the close.
- **`worker`**: real, but execution: one line in that goal's "The
  worker decides", with its bound.
- **`user`**: a row of `waves.md` changes (add, split, merge, move,
  re-pair), an edge is added or removed, a wave's walk or its
  required rows change, the cut is contested, two readings that are
  two products. You rule these yourself against the sequence he
  approved when the wave's walk and required rows stay as they are
  (`ruled: conductor`, listed at the close for veto); a row that
  moves or a new row is written by you to `waves.md` (in place, the
  amendment dated under "Amendments") before it goes to a writer. A
  finding that would change what a wave accepts is his: one question
  per decision, the house shape, your pick first.

## Step 5 — round 2, and a third

Round 2 runs without asking, over the delta: the workflow receives
`changed` (the goals whose text changed) and `fixes` (what was
applied); the lenses check that each fix landed and did not break its
surroundings; the blind readers reopen only the goals that changed.
Judge and apply it the same way. Then tell the user, with the two
rounds in a table (findings, sustained by owner, dismissed, what
changed), that the plan is at the close; **a third round runs only on
his word**, delta again. What is still sustained after the last round
is applied by the writers with proof by line and verified on disk by
you; the residue is written, not chased.

## Step 6 — close

Write the conductor's JSON under `blueprint/plan/`: `sequence.json`
from `waves.md` and `team.md` (A → B, the frozen contracts, the
lanes with their rows, the waves with their walks, the cut's cards,
the team, the pre-flight), `plan-review.json` from `reviews.md` and
`rulings.md`, and `plan-report.json`, the plain layer the tab opens
with, in the intern's voice
([schema](../../blueprint/schema/plan.md)). Then
`node claude/blueprint/build.mjs <workstream>` and publish
`blueprint.html`. The build refuses with the field named: a row with
no proof, a wave requiring a row that does not exist, a goal JSON
missing for a lane × wave, a text over its word cap.

Present: the blueprint URL, the lanes drawing, the wave table, the
round table, the decisions you took in his place (the writers'
questions you answered, the user-owned findings you ruled), one line
each, the residue, the taste notes added, the stage's telemetry
(agents, approximate cost), and the **pre-flight**: every item the
rows need from him, as a checklist. **This is where the user reads
the plan.** He sends adjustments as they come; you note each in a
visible list and dispatch nothing until he says "apply"; then one
batch per writer (a change to `waves.md` is yours, dated under
"Amendments"), verify on disk, rebuild, republish, and ask again.
The pre-flight is handed over here: every item checked, or the row it
blocks marked in `waves.md` so stage 4 parks it. Approval is
explicit; silence does not close the stage. On approval, and only
after he says there is nothing else: `.state.md` to `stage: execute`
with one line per lane (`lane: <repo> · row: <first>`) and the master
line, the close commit of the workstream folder (push only with his
explicit approval), and suggest `/clear` before stage 4. Then his
part of stage 4 is three moves: open the sessions `team.md` names,
run the execute skill in each, give the master its one goal.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something. A card names its options by what they cost.
A proof names a command and its output, a screen and its artboard.
In the terminal: a table for parallel things, a flow in a code block
for a sequence, short topics for lists.

## Files

- **Permanent:** `waves.md`, everything in `02-plan/`,
  `blueprint/plan/`, `blueprint.html`, `rulings.md`,
  `taste-notes.md`, `.state.md`.
- **Nothing is deleted at the close.** `recon/` is the A the dreaming
  compares against what stage 4 found.

## During execution

The plan is amendable, not sacred. When a row changes while being
built (a proof proves wrong, a simpler cut appears, the user adds a
row), the master edits the row in `waves.md` and the goal in place
and writes the amendment, dated, under "Amendments" in `waves.md`, in
the user's words where he gave them. The Status column is stage 4's
to fill, row by row. Nothing comes back to this stage for it.

## Resuming

Everything is in files. Read `.state.md`, then `recon/` (absent means
the scouts did not run), `waves.md` (absent means the cut was not
approved), `02-plan/goals/`, `reviews.md` if they exist. Continue
from the first step whose output is missing. A writer that died is
redispatched with the list of what is on disk; it never rewrites a
finished file. Never from memory of a previous session.

## Boundaries

No code, no tests, no branches, no deploy (stage 4). No re-decision
of the design: a row that cannot be built as designed becomes a
question to the user and, answered, a dated amendment in `notes.md`,
never a local workaround in a goal. The discovery fence does not
reopen: a story lands in a row or the user cuts it in the discovery,
with the record there. Frictions worth learning from go to the
workstream's `dreaming-notes.md` on the spot; judging them is stage
6's job.
