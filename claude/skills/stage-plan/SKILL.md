---
name: stage-plan
description: Conducts stage 3 (Plan) — takes an approved design and cuts, with the user, how the whole demand gets built as fast as the machine allows. One scout (Haiku 4.5, max) per area of the codebase the design touches writes what exists today; the conductor (Opus 5.5, high) arrives with the cut: the foundation (every migration, the whole contract with its generated code, the modules registered, the shared pieces and factories, laid down once so no entry ever touches a shared file) and the graph of entries (a story or a small group, built vertically, back and front; an edge only where an entry's proof needs another entry's behavior), each proved by commands; the user shapes and approves it; then one writer (Sonnet 5, high) per entry writes the brief its builder will receive, deciding nothing; a review round of three lenses (Sonnet 5, high), two blind readers (Haiku 4.5, high) and a referee (Sonnet 5, low) per brief, judged by the conductor; round 2 automatic over the delta, a third only on the user's word; the blueprint's Plan tab read by the user at the close, the pre-flight handed over. Runs in Claude Code with an Opus 5.5 session at high effort. Use after a design is approved, or to resume a plan in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git status *), Bash(git diff *), Bash(git add *), Bash(git commit *), Bash(nproc), Bash(free *), Bash(node *)
---

# Stage 3: Plan

A definition of how it works comes in: the design of the whole
demand. A cut comes out: **from A to B, as parallel as the machine
allows**. A is what exists in the codebase today; B is what the
design says exists at the end. The plan re-decides nothing of the
design: it says what is laid down first, what is then built at the
same time, what waits for what, and how each piece is proved by a
command.

Three words:

| Word | What it is | At stage 4 |
|---|---|---|
| **foundation** | everything the entries would otherwise fight over, laid down once: every migration of the demand (expansion only), the whole contract (`openapi.yaml` and its generated code), the new modules registered, the shared pieces the design names, the factories the proofs seed with. One entry, built and merged first | built alone, before any entry |
| **entry** | one story, or a small group of stories that share a screen or a flow and only prove together. Built **vertically**: back and front and tests, in its own worktree with its own stack. Proved by commands: `run` / `expect`, or a screen and its artboard (`see` / `where`) | one builder, one branch, one merge |
| **edge** | entry B waits for entry A only when B's **proof** needs A's behavior (a button A builds, a state A's action produces). Data is not an edge: the foundation's factories seed it. Everything with no edge runs at once, up to the concurrency cap | the session starts an entry the moment its edges are merged |

The foundation is what makes the fan-out possible. After it, no entry
edits a migration, the contract, the generated code or the module
registry: those are the files two parallel entries would collide on.
An entry that finds the contract must change stops; the change is a
foundation amendment at stage 4, small and serial, and the entries in
flight rebase on it.

The session is the conductor, **Opus 5.5 at high effort**. It runs
the cut with the user, writes `02-plan/plan.md` as the session closes,
dispatches scouts and writers, runs the review, judges every finding,
builds the blueprint, and hands over the pre-flight. It writes
`plan.md`, `reviews.md`, `rulings.md`, `taste-notes.md` and the
conductor's blueprint JSON; every brief is written by its writer,
first draft to last fix. A finding is only fixed when the writer
changed the file.

## Two modes

**Session mode** (step 2 and the reading of 6). The user is in the
room to shape the cut and approve it. You arrive with the proposal; he
does not have to think it up. Closed choices go through the question
tool in the house shape; open discussion goes in prose. A fact the
recon did not bring is fetched by a `scout`. Every reply in the
terminal is built to be followed at a glance: a table for parallel
things, a flow drawn in a code block for a sequence, short topics for
lists.

**Autonomous mode** (steps 1, 3 to 5 and the file work of 6). The
user is waiting, not answering. Dispatch, run the workflows, judge,
write the audit, build the blueprint, update the state, without
asking permission for any of it. Every reply that dispatches or waits
on an agent carries a status table (agent · task · state), the state
read from the harness, never assumed. Say in one line what you are
about to do, and close with a recap that stands on its own. Do not
end a turn on a plan or a promise; do the work.

## The pattern

```
0. Open     Opus 5.5, effort high; read the design whole and the discovery's stories
1. Recon    one plan-scout (Haiku 4.5, max) per area of the codebase the design touches, in
            parallel → 02-plan/recon/<area>.md: what exists today (modules, routes, tables, screens,
            factories, the make targets and the suites with their size)
2. The cut  SESSION. from A to B in one line; the foundation; the entries and their edges, drawn
            as a graph; the concurrency cap; the pre-flight; approval through the question tool;
            adjustments in a visible list, applied on "apply" → 02-plan/plan.md
3. Write    one plan-writer (Sonnet 5, high) per entry and one for the foundation, in parallel,
            same source (plan.md + the design + recon + the template): the brief its builder
            receives, every proof as run/expect, plus blueprint/plan/briefs/<id>.json; zero
            decisions — questions come back in one batch, you answer them against the approved cut
4. Round 1  whole and automatic: plan-review workflow (three lenses Sonnet 5 high; per brief two
            blind readers Haiku 4.5 high + a referee Sonnet 5 low); you judge every finding by
            references/judging.md; wording → writers; the cut → you, against what he approved
5. Round 2  automatic, delta only (the briefs that changed + the fixes); a third round only on
            the user's word
6. Close    plan-report.json + plan-review.json + plan.json, the blueprint built and published;
            the user reads the Plan tab and sends adjustments in a batch, applied on "apply"; the
            pre-flight handed over; approval; close commit last; state → execute; /clear
```

The user is interrupted at: the cut (2), a question a writer raised
that only he can answer (end of 3), a finding that would change the
cut (4 or 5), and the close (6). Everything else runs without him.
Round 2 runs without asking: the plan is mechanical and he is waiting,
not answering.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor | Opus 5.5, high | the cut, the answers to the writers, the judging, the close |
| `plan-scout` × 1 per area | Haiku 4.5, max | reads one area of the codebase and its docs, writes `recon/<area>.md`: facts and where they are |
| `plan-writer` × 1 per entry, + 1 for the foundation | Sonnet 5, high | one brief each, in parallel, from the same source; asks, never decides |
| `plan-reviewer-{coverage, verifiability, order}` | Sonnet 5, high | three lenses, each reads everything |
| `plan-blind-reader` × 2 per brief | Haiku 4.5, high | builds and proves one brief alone, reading only that file, in the brief's language |
| `plan-reviewer-ambiguity` | Sonnet 5, low | compares the two builds key by key |

## Preconditions

`.state.md` says `stage: plan`; `01-design/` has the approved design
with `notes.md`; `blueprint/design/` has the design JSON. Missing:
halt, back to stage 2.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: plan
├── blueprint.html             # built, never edited (house rule)
├── blueprint/                 # the discovery and design JSON, plus:
│   └── plan/                  # plan.json · plan-report.json · plan-review.json (you)
│       └── briefs/            # <id>.json, one per entry and F for the foundation (writers)
├── rulings.md · taste-notes.md · dreaming-notes.md
├── 00-discovery/ · 01-design/ # untouched here
└── 02-plan/
    ├── plan.md                # the cut: A → B, the foundation, the entries, the graph; your file
    ├── recon/                 # <area>.md, one per area, by the scouts
    ├── briefs/<id>.md         # one per entry, F.md for the foundation — the builder's brief
    ├── reviews/               # round-N.json: each round's return value, as it came
    └── reviews.md             # the round audit: your file
```

## Step 0 — open

If the session is not on **Opus 5.5 at high effort**, ask the user to
switch (`/model`) and wait. Then read, before speaking again: the
design whole (`notes.md`, `architecture.md`, `contracts.md`,
`data-model.md`, `ui.md`, `acceptance.md` above all), the discovery's
stories, and the consuming project's `CLAUDE.md`. Not the codebase:
the scouts read it.

## Step 1 — recon

Autonomous mode. One `Agent` dispatch of **`plan-scout`** per area
of the codebase the design touches (`code.md` and `architecture.md`
name them: each backend module, each frontend app, the ingestion, the
infra), all in one message, each with the area's path, the design
folder and the template ([templates/recon.md](templates/recon.md)).
A scout writes `02-plan/recon/<area>.md`: the modules, routes,
tables, screens and jobs that exist, the factories and fixtures, the
`make` targets that build, test and verify, the suites with their
size and duration when the docs say, and what the design names that
does not exist yet. Facts only, each with where it was read.

Read every file when the scouts return. This is A: where the demand
starts from. Measure the machine too (`nproc`, `free -g`): the
concurrency cap is how many isolated stacks it holds at once, with
room for the session itself.

## Step 2 — the cut

Session mode. Arrive with the whole proposal; the user shapes it and
approves it. The order of the conversation:

| Move | You bring | The user |
|---|---|---|
| A → B | one line: where the codebase is (from recon), where the design ends | confirms |
| the foundation | the list: migrations, contract routes, modules, shared pieces, factories; its proof | adds, cuts |
| the entries | a table: entry · stories · what it builds back and front · how it is proved | splits, groups, cuts |
| the graph | the edges, each with the behavior the proof needs; the graph drawn; the steps it takes | contests an edge |
| the cap and the pre-flight | how many entries at once, from the machine; what the entries need from him | confirms, hands over |

**How the foundation is found.** Everything two entries would both
edit: every new or changed table and column of `data-model.md` as
migrations (expansion only); every new or changed route of
`contracts.md` in `openapi.yaml`, with the generated code (the route
exists and answers "not implemented" until its entry lands); every new
module registered in the composition; every shared piece the design
names (a component two screens use, a helper two use cases use); one
factory per entity the proofs seed. Nothing behavioral: no use case,
no screen. Its proof is the whole gate green on an empty implementation.

**How the entries are found.** One entry per story. Group two or
three stories into one entry only when they share a screen or a flow
and neither proves alone. An entry is vertical: the use case, the
route implementation, the screen, the tests. An entry with more than
about eight acceptance criteria splits into thinner vertical slices,
each still end to end. Every entry names what it builds, the design
sections it follows, the ACs it carries and what it touches.

**How the edges are found.** Ask, for each entry: does its proof need
another entry's **behavior**? A test that needs a customer in the
database seeds one with a factory: no edge. A test that clicks "mark
ready" needs the entry that builds that button: an edge. An edge is
written with the behavior consumed. Fewer edges is faster; an edge
the proof does not need is a queue for nothing.

**Ask for the approval through the question tool.** The foundation
and the graph in one question each, "Approve" first; where the cut has
a real fork (one entry or two, an edge or a seed), the alternatives
are the other answers, one line of cost each; otherwise "Change" is
the only other answer and he says what in "Other". Adjustments he
sends go to a visible list and are applied when he says "apply". When
he approves, write `02-plan/plan.md` from
[templates/plan.md](templates/plan.md), whole, in one pass, the forks
recorded as cards with the recommendation beside the choice. A fork
where he chose against the recommendation goes to `taste-notes.md` on
the spot, as the pattern.

Four rules inside the proposal:

- **Every proof is a command or a screen, on the local stack.** `run`
  is a `make` target or a test spec the worktree runs (or that the
  entry itself creates, and then it says so); `expect` is what it
  prints, with the cases named. `see` is a screenshot of the local
  stack from a journey spec, both themes, 390 px; `where` is the
  artboard in `ui.md`. "Works" is not a proof. Nothing needs alpha or
  prod: alpha is stage 5's.
- **After the foundation, no entry touches a shared file.** Migrations,
  the contract, the generated code and the module registry are the
  foundation's. An entry that needs one of them changed is a
  foundation amendment, never an edit inside the entry.
- **The plan covers the whole demand, and nothing else.** Every story
  of the discovery lands in exactly one entry; the PR-FAQ's "What we
  are NOT building" and the stories' "Out of this story" never do. The
  design's latitude stays latitude.
- **The user leaves nothing behind.** Everything an entry would need
  from him (a credential, a text, an account, a third-party contract)
  is listed as the pre-flight and handed over at the close. An entry
  with a pre-flight item is marked; stage 4 parks it if the item is
  missing and finishes everything else.

> **Example of a graph question** — header `graph`, question: "After
> the foundation: E-01 clients, E-02 menu, E-03 place an order and
> E-04 the baker's panel run at once (the order and the panel seed
> customers and breads with factories); E-05 the ready e-mail waits
> for E-04 (its test clicks 'mark ready'). Cap 4: two steps after the
> foundation." Answers: "Approve" · "Fold E-05 into E-04 (one entry,
> one step less, a bigger diff)" · "Change".

## Step 3 — write

One `Agent` dispatch of **`plan-writer`** per entry and one for the
foundation, all in one message, in write mode, each with the same
brief: the workstream path, `plan.md`, the entry it owns, the recon,
the design folder, the discovery, the brief template, the blueprint
schema (`${CLAUDE_SKILL_DIR}/../../blueprint/schema/plan.md`), the
consuming project's `CLAUDE.md` and the language. The writer writes
`02-plan/briefs/<id>.md` and `blueprint/plan/briefs/<id>.json` in the
same pass and returns its questions. It decides nothing: a value the
cut and the design do not fix is a question. Answer from `plan.md`,
the design and the recon what they settle, the simplest option that
keeps the approved graph as it stands; an answer that would change an
entry or an edge is not yours: ask the user through the question tool.
Every answer you gave goes to `rulings.md` marked `ruled: conductor`
and is listed at the close for veto. Send the answers to each writer
in one message.

When the writers return, read every brief: every entry has its brief,
every proof has `run` and `expect` (or `see` and `where`), the closing
sections are there and "Questions" is empty. Anything missing goes
back to its writer in one message before the review starts.

## Step 4 — round 1

Autonomous mode. Run the `plan-review` workflow by `scriptPath`
(never by name): `${CLAUDE_SKILL_DIR}/../../workflows/plan-review.js`,
with `planDir`, `designDir`, `discoveryDir`, `reconDir`, `root` (the
codebase path), `round: 1`, `language`, and `briefs`: one
`{id, path}` per brief file. The workflow passes paths; the readers
open only their brief.

| Lens | Question |
|---|---|
| `plan-reviewer-coverage` (Sonnet 5, high) | every story AC and every acceptance case lands in exactly one entry; every table, route, module and factory the design names is in the foundation; every screen has its entry; nothing is built that nothing forces |
| `plan-reviewer-verifiability` (Sonnet 5, high) | every `run` is a make target or spec that exists or that the entry creates, and every `expect` is what it prints; every `see` names its journey and artboard; bad paths included; nothing needs alpha, prod or a person |
| `plan-reviewer-order` (Sonnet 5, high) | every edge is a behavior the proof needs, every such need has its edge, the graph has no cycle; after the foundation no entry touches a shared file; entries that run at once do not collide on the same file; the foundation is complete |
| 2 × `plan-blind-reader` (Haiku 4.5, high) → `plan-reviewer-ambiguity` (Sonnet 5, low), per brief | would two builders build the same entry from this brief alone, and call it done on the same command and output? |

Every reviewer answers under the house reviewer contract
(`docs/standards/reviewer-contract.md` in the pipeline repo). The
workflow returns `{ round, mode, valid, findings, lenses, unread }`; a
round in which no brief was read is invalid: fix the cause, run it
again.

Record before acting: save the return value as it came in
`02-plan/reviews/round-N.json`, and write `02-plan/reviews.md`
([template](templates/reviews.md)) from it in one `Write`.

**Judge.** You rule every finding by
[references/judging.md](references/judging.md): merge by fix first,
then sustained / deferred / dismissed, with the owner of each
sustained one: `writer`, `user` or `builder`. Write the rulings to
`reviews.md` before any fix moves.

- **`writer`**: a pointer, a case name, a `run` made exact with what
  the recon already fixes, propagation between two briefs. One apply
  batch per writer, in one message; the report carries the mentions
  table and the final lines; a fix without pasted lines is not done.
- **`builder`**: real, but execution: one line in that brief's "The
  builder decides", with its bound.
- **`user`**: an entry changes (add, split, group, cut), an edge is
  added or removed, the foundation changes, the cut is contested, two
  readings that are two products. You rule these yourself against the
  cut he approved when the graph and the foundation stay as they are
  (`ruled: conductor`, listed at the close for veto); a change you
  make to `plan.md` is dated under "Amendments" before it reaches a
  writer. A finding that would change the graph or the foundation is
  his: one question per decision, the house shape, your pick first.

## Step 5 — round 2, and a third

Round 2 runs without asking, over the delta: the workflow receives
`changed` (the briefs whose text changed) and `fixes` (what was
applied); the lenses check that each fix landed and did not break its
surroundings; the blind readers reopen only the briefs that changed.
Judge and apply it the same way. Then tell the user, with the two
rounds in a table (findings, sustained by owner, dismissed, what
changed), that the plan is at the close; **a third round runs only on
his word**, delta again. What is still sustained after the last round
is applied by the writers with proof by line and verified on disk by
you; the residue is written, not chased.

## Step 6 — close

Write the conductor's JSON under `blueprint/plan/`: `plan.json` from
`plan.md` (A → B, the foundation, the entries with their edges and
proofs, the cap, the cut's cards, the pre-flight), `plan-review.json`
from `reviews.md` and `rulings.md`, and `plan-report.json`, the plain
layer the tab opens with, in the intern's voice (schema above). Then
`node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>` and
publish `blueprint.html`. The build refuses with the field named: an
entry with no proof, an edge to nothing, a cycle, a story no entry
carries, a brief missing, a text over its word cap.

Present: the blueprint URL, the graph, the entry table, the round
table, the decisions you took in his place (the writers' questions you
answered, the user-owned findings you ruled), one line each, the
residue, the taste notes added, the stage's telemetry (agents,
approximate cost), and the **pre-flight**: every item the entries need
from him, as a checklist. **This is where the user reads the plan.**
He sends adjustments as they come; you note each in a visible list and
dispatch nothing until he says "apply"; then one batch per writer (a
change to `plan.md` is yours, dated under "Amendments"), verify on
disk, rebuild, republish, and ask again. The pre-flight is handed over
here: every item checked, or the entry it blocks marked in `plan.md`
so stage 4 parks it. Approval is explicit; silence does not close the
stage. On approval, and only after he says there is nothing else:
`.state.md` to `stage: execute`, the close commit of the workstream
folder (push only with his explicit approval), and suggest `/clear`
before stage 4.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something. A card names its options by what they cost.
A proof names a command and its output, a screen and its artboard.
In the terminal: a table for parallel things, a flow in a code block
for a sequence, short topics for lists.

## Files

- **Permanent:** everything in `02-plan/`, `blueprint/plan/`,
  `blueprint.html`, `rulings.md`, `taste-notes.md`, `.state.md`.
- **Nothing is deleted at the close.** `recon/` is the A the dreaming
  compares against what stage 4 found.

## During execution

The plan is amendable, not sacred. When an entry changes while being
built (a proof proves wrong, a simpler cut appears, the contract needs
a field), stage 4 edits the entry in `plan.md` and its brief in place
and writes the amendment, dated, under "Amendments", in the user's
words where he gave them. A change to a shared file is a foundation
amendment, recorded the same way. The Status column is stage 4's to
fill, entry by entry. Nothing comes back to this stage for it.

## Resuming

Everything is in files. Read `.state.md`, then `recon/` (absent means
the scouts did not run), `plan.md` (absent means the cut was not
approved), `02-plan/briefs/`, `reviews.md` if they exist. Continue
from the first step whose output is missing. A writer that died is
redispatched with the list of what is on disk; it never rewrites a
finished file. Never from memory of a previous session.

## Boundaries

No code, no tests, no branches, no deploy (stage 4). No re-decision
of the design: an entry that cannot be built as designed becomes a
question to the user and, answered, a dated amendment in `notes.md`,
never a local workaround in a brief. The discovery fence does not
reopen: a story lands in an entry or the user cuts it in the
discovery, with the record there. Frictions worth learning from go to
the workstream's `dreaming-notes.md` on the spot; judging them is
stage 6's job.
