---
name: stage-plan
description: Conducts stage 3 (Plan) — takes an approved design and proposes the sequence in which the whole demand is built: waves that are each a verifiable checkpoint in alpha (one feature branch per repo, the suite green, a PR open), rows inside each wave (one story × repo, with a "ready when" a person can observe), the order and what runs in parallel; the user approves or rejects the cut, and the rest is mechanical: one Fable author writes the goal of every wave, the whole brief the execution chair receives; a whole review round runs (three Opus lenses, two blind readers and a referee per goal, an Opus judge marking who owns each fix); two rounds at most; the blueprint's Plan tab is published, and the user opens the Codex session that builds the waves. Runs in Claude Code with a Fable session. Use after a design is approved, or to resume a plan in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *), Bash(git *)
---

# Stage 3: Plan

A definition of how it works comes in: the design of the whole demand.
A sequence comes out: the order in which it gets built, cut so that
every step is something a person can verify in alpha. The unit of the
sequence is the **wave**: one feature branch per repo, implemented row
by row, deployed to alpha, the whole smoke suite green, its PR merged
into the workstream branch `feat/<workstream>`. The next wave cuts
from that branch. `main` and prod are stage 5's. The execution chair receives one goal per
wave and builds them in order, without coming back here.

Inside a wave, the unit is the **row**: one story in one repo (a mesh
repo, an infra step or a seed is a row too), with a "ready when" that
is a command or an observation: a smoke folder green, a screen
rendered against the real API, a resource visible. The design says
how everything works; the plan says in what order it exists in alpha
and how each step is proved. It re-decides nothing.

This stage runs in Claude Code, in a Fable session. It depends on the
question tool and the Workflow tool.

The session is the conductor. It proposes the cut, writes `waves.md`
once the user approves it, dispatches the author, runs the review
workflow, rules what the review leaves against the approved sequence,
publishes the blueprint and hands the user the line that starts the
execution chair. It writes one plan file, `waves.md`, and never a
goal: the author is the only writer of the goals, first draft
to last fix. A finding is only fixed when the author changed the file.

The design is where the user thinks; the plan is mechanical. He is
asked twice: to approve the cut, and to approve the close. Everything
between is yours, decided against the sequence he approved and listed
at the close for veto.

## Two modes

**Session mode** (step 1 and the approval of step 6). The user is in
the room to approve or reject. You arrive with the proposal; he does
not have to think it up. The cut goes through the question tool,
wave by wave; a rejected wave gets a second proposal, not a
discussion. No agent runs during the session; a fact you need, you
look up yourself, inline.

**Autonomous mode** (steps 2 to 5 and the file work of 6). The user
is waiting, not answering. Dispatch the author, answer its questions
against the approved sequence, run the workflow, rule what the judge
hands the user against that same sequence, write the audit, publish
the blueprint, update the state, without asking
permission for any of it. Say in one line what you are about to do,
and close with a recap that stands on its own. Do not end a turn on
a plan or a promise; do the work.

## The pattern

```
1. The cut     you propose the whole sequence as a table, from the stories and
               the design; the user approves or rejects it wave by wave through
               the question tool. Written to waves.md once approved.
2. Write       one dispatch of plan-author: waves.md + the design → one goal per
               wave. Its questions come back in one batch; you answer them
               against the approved sequence and the design.
3. Round 1     the plan-review workflow, whole: three Opus lenses beside two
               Haiku readers and a referee per goal, then the Opus judge.
4. Apply       everything the judge did not dismiss is applied: findings and
               suggestions alike. Author-owned and worker-owned go to the author;
               user-owned you rule yourself against the approved sequence.
5. Round 2     the workflow again, whole, over the applied goals. What it
               returns is applied the same way and is final: no third round.
6. Close       blueprint Plan tab, explicit approval, state moved, /clear.
               The user opens Codex with `$stage-execute <slug>`.
```

Two rounds, always, whatever round 1 returned: the second reads the
applied fixes, and that is what makes the result final without a
third.

The user is interrupted twice: the cut (1) and the close (6).
Everything else runs without him.

## Preconditions

`.state.md` says `stage: plan`; `01-design/` is approved (the Design
tab published, the user's explicit ok recorded). Missing: halt, back
to stage 2. Keep `chair: fable` in `.state.md`.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: plan · chair: fable
├── blueprint.html             # the workstream's blueprint; this stage fills BLUEPRINT.plan
├── rulings.md · taste-notes.md
├── waves.md                   # the sequence: the conductor's file; Status filled by stage 4
├── 00-discovery/ · 01-design/ # untouched here
└── 02-plan/
    ├── goals/                 # one per wave: wNN-<slug>.md — the execution chair's brief
    ├── reviews/               # round-N.json: each round's return value, as it came
    └── reviews.md             # the round audit: the conductor's file
```

## Step 1 — the cut

Before it, read the discovery, the design whole (`decisions.md`,
`architecture.md`, `contracts.md`, `rollout.md`, `acceptance.md`
above all), the consuming project's `CLAUDE.md`, and the `CLAUDE.md`
and `docs/` of every repo the design names: the smoke layout and the
deploy commands are what make a "ready when" concrete.

**Arrive with the proposal.** The user does not have to think the
sequence up; you bring it and he approves or rejects. Present the
whole sequence as a table in the conversation: the waves in order,
one line each with what it delivers and what a person can do in alpha
at its end; then, per wave, the rows with repo, work, "ready when",
what depends on what and what runs in parallel. The shape that has
worked: the mesh first when it is new (hub, identity, whole), then a
foundation wave (the skeleton of every repo the demand touches, one
thin flow crossing everything, login), then one wave per adjacent
domain, the API rows before the front rows that render them, two
rows in parallel when they touch different surfaces. The user's
taste on record: fewer, bigger waves when the domains are adjacent.

**Ask for the approval, wave by wave, through the question tool.**
One question per wave, four per call, in order: the wave's line and
its rows in the question, "Approve" first. Where the cut had a real
fork (one bigger wave or two smaller ones, the skeleton as its own
wave or as the first rows of the foundation), the alternatives are
the other answers, one line of cost each; otherwise "Change" is the
only other answer and he says what in "Other". A rejected or
changed wave gets a second proposal in the next call, not a
discussion; if he rejects that one too, the wave is what he wrote in
"Other", transcribed as is. When every wave is approved, write `waves.md` from
[templates/waves.md](templates/waves.md), whole, in one pass, the
forks recorded as cards with the recommendation beside the choice.
Every wave where he chose against the recommendation goes to
`taste-notes.md` on the spot, as the pattern.

Three rules inside the proposal:

- **Every wave is a checkpoint a person can verify.** Its "ready
  when" is what someone does in alpha at its end, in one sentence
  ("the first real leader logs in and sees only his region"). A wave
  that ends on "the tables exist" is not a checkpoint; fold it into
  the next one or give it a thin flow that proves it.
- **Every row's "ready when" is a command or an observation.** A
  smoke folder green, with the bad paths; a screen rendered against
  the alpha API; a resource listed. "Works" is not a ready-when. When
  the design's `acceptance.md` names the cases, the row names the
  folder that holds them.
- **The sequence covers the whole demand, and nothing else.** Every
  story of the discovery lands in a row; the PR-FAQ's "What we are
  NOT building" and the stories' "Out of this story" never do. The
  design's latitude stays latitude: the plan does not fix what the
  design left to the implementer.

> **Example of a wave question** — header `w02`, question: "w02 ·
> people and inventory · ready when a subleader's link registers a
> person, the queue releases her, and her kit is in stock. Rows: 2.1
> `labs-api-tracking` people + invite link + the two public routes
> (smoke `people/`) · 2.2 queue and lifecycle (smoke `queue/`, after
> 2.1) · 2.3 inventory (smoke `inventory/`, after 2.2) · 2.4 `front`
> public sign-up (screen vs alpha, after 2.1) · 2.5 front queue and
> people (after 2.2) · 2.6 front inventory (after 2.3). Parallel:
> 2.2 ∥ 2.4, 2.3 ∥ 2.5." Answers: "Approve" · "Inventory as its own
> wave w03 (one more alpha cycle; the people checkpoint two days
> earlier)" · "Change".
>
> **Example of a row** — "1.4 · `labs-api-tracking` · S-002
> accesses: `POST /tracking/users` (a leader is born in his region;
> a subleader by his leader), `PATCH` name and e-mail, `POST
> …/password`, `GET /tracking/users` · ready when smoke `users/` is
> green, the 403 and the 422 among the cases · depends on 1.3."

## Step 2 — write

One `Agent` dispatch of **`plan-author`** in write mode, with: the
workstream path, `waves.md`, the design folder, the consuming
project's `CLAUDE.md`, the repo map (name and path of every repo the
sequence names), and the language of the documents (the user's). The
author writes one goal per wave under `02-plan/goals/` and returns
its questions in one batch.

Answer the batch yourself, against the approved sequence, the
design and the house standards: the simplest option that keeps the
sequence as approved. Send the answers to the same author in one
message; it folds them in. An answer that would change a row is not
yours: it waits for the close, where it is asked with the approval.
Every answer you gave is listed at the close for veto.

When the author returns, read every goal. Check that every row of
`waves.md` is a `### N.k` section in the same order, that every
"ready when" is a command or an observation, that every goal has its
proof, its four closing sections and an empty "Questions". Anything
missing goes back to the author in one message before the review
starts.

## Step 3 — round 1

Autonomous mode. Run
[`plan-review`](../../workflows/plan-review.js) by `scriptPath`
(never by name), with `planDir`, `wavesPath`, `designDir`,
`discoveryDir`, `repos` (name and path), `round`, and `goals`: one
`{id, text, wave}` per goal, the goal file verbatim and the wave's
section of `waves.md` verbatim. Scripts cannot read files; you pass
the text.

| Agent | Question |
|---|---|
| `plan-reviewer-coverage` | every story AC and every acceptance case lands in exactly one row; both ends of every contract are built by the time a row consumes them; no row builds what nothing forces |
| `plan-reviewer-verifiability` | every "ready when" is a command or an observation a person can make in alpha with what exists by then; the wave's checkpoint proves the wave; nothing needs prod |
| `plan-reviewer-order` | every consume has a producer that ran; every dependency is real and every real one is declared; parallel pairs do not collide; the deploy order across repos holds; the branches cut from the right place |
| 2× `plan-blind-reader` → `plan-reviewer-ambiguity`, per goal | would two engineers build the same wave from this goal, and call each row done on the same evidence? |
| `plan-judge` | could the execution chair build this row one way and prove it? and who decides the fix: the author, the user, or the worker? |

The round runs whole every time. Every reviewer answers under the
[reviewer contract](../../docs/standards/reviewer-contract.md).

Record the round before acting on it, with no agent and no rewriting:
save the workflow's return value as it came in
`02-plan/reviews/round-N.json` (the machine record), and write the
human index in `02-plan/reviews.md`
([template](templates/reviews.md)) from it with one `Write`: the
verdict table per lens with the run id (from the workflow's journal),
the blind-read table, and one line per finding, to which your rulings
are appended in step 4. The JSON is the authority; the index is what
a reader opens.

## Step 4 — apply

Everything the judge did not dismiss is applied: sustained and
deferred alike, the suggestions with the findings. The judge's job
here is to kill what is wrong (plain wrong, a row contested without a
defect, detail the worker finds in the code); what survives is work
for the author, not a decision for the close. Three lists come back.

**Owner `author`.** A pointer, a count, a "ready when" made
commandable with what the design already fixes, a dependency the
consume plainly implies, propagation to the next goal: send them to
`plan-author` in one apply batch. Its report carries the mentions
table and the final lines; a fix without pasted lines is sent back
once; a second time, it is recorded in `reviews.md` as not applied
and left for round 2 to find. Then verify a sample on disk yourself,
file and line.

**Owner `worker`.** Real, but execution: they go in the same batch,
and the author writes each as one line in that goal's "The worker
decides" section. No row changes.

**Owner `user`.** A row of `waves.md` changes (add, split, merge,
move, re-pair), a wave's checkpoint changes, a cut or an order is
contested, two readings. You rule these yourself, against the
sequence the user approved: the judge's proposal when it keeps every
approved wave's checkpoint as it stands; the smallest change that
does otherwise. A row that moves or a new row is written by you to
`waves.md` (the row in place, the amendment dated under "Amendments")
before it goes to the author as a fix. A finding that would change
what a wave delivers or its checkpoint is not yours: park it for the
close, where it is asked with the approval. Every ruling you take in
the user's place goes to `rulings.md` as it happens, marked
`ruled: conductor`, and is listed at the close for veto.

> **Example** — coverage#2 (blocker): S-004 AC-6, the signed term, is
> in no row; the design has the flow. Judge: sustained, owner user,
> "into row 2.1 with the sign-up". The wave's checkpoint does not
> move: you take the judge's proposal, edit row 2.1 in `waves.md`,
> send the fix to the author, and the close lists it.

Dismissed findings die with their reason in `reviews.md`. A ruling
whose reason is a pattern goes to `taste-notes.md`.

## Step 5 — round 2

Run step 3 again, whole, over the applied goals, and apply what it
returns exactly as in step 4. That is the whole budget, and it is
spent every time: two rounds, the second reading the first's fixes.
What round 2 returns is final: applied, verified on disk, and taken
to the close. There is no third round; what the user finds at the
close is a fix pass, not a round.

Told to find errors, reviewers always find errors. The fixed budget
is what turns that into a calibrated pass instead of an infinite
loop; the second round is the proof that the first's fixes landed.

## Step 6 — close

Fill `BLUEPRINT.plan` in the workstream's `blueprint.html` (the file
stage 1 created; same path, same URL forever). The shape the shell
renders:

```js
plan: {
  intro, cells: [{v, l}],                 // the sequence in one paragraph; waves · rows · repos · cases
  waves: [{ n: 'w01', name, state,        // state: 'this wave' | 'done' | 'next' | ''
            delivers, ready, stories,     // ready = the checkpoint sentence
            rows: [{ num, repo, front, t, ready, dep, par }],
            parallel, out, user }],
  decisions: { taken: [...], decided: [...] },   // the session's cards, house card shape
  review: { round, totalRounds, expected: 4, blind: { pass, total }, lenses: [...] },
}
```

The blueprint is the report, not the files' projection (house rule):
natural to read above all. The tab opens with the sequence as one
picture (a column per wave, its rows as cards, the checkpoint at the
bottom of each column), then one block per wave with its rows as a
table, then the session's cards with the rejected option in one line
each, then the review scoreboard. The reader who skims the columns
knows what exists in alpha after each wave and when they get to look.

**Nothing else to write for the chair.** The goals are the brief. The
execution chair is a Codex session opened at the consuming project's
root (where `.codex/` lives) with the line
`$stage-execute <workstream-slug>`: its skill reads `.state.md`, takes
the wave it names and runs to the last one.

Present: the blueprint URL, the sequence table, the verdict table,
the precision table per lens and the judge's line (from
`reviews.md`), the residue, the taste notes this stage added, the
stage's own telemetry (agents dispatched, approximate cost), and
then the two lists he approves or vetoes through the question tool:
everything you decided in his place (the author's questions you
answered, the user-owned findings you ruled), one line each, "keep
all" first; and the findings you parked because they would change a
wave's checkpoint, one question each. This is his review of the
final result: what round 2 left is what he reads. Approval is
explicit; silence or a loose "looks good" does not close the stage.
On approval: `.state.md` to `stage: execute` with `wave: w01-<slug>`
and `chair: codex`, commit the workstream folder (push only with the
user's explicit approval), give the user the line
`$stage-execute <workstream-slug>` to type in a Codex session opened at
the project root, and suggest `/clear` (house rule). On a veto or a
parked finding he sustains: one author pass, verify on disk, close. On
rejection: the reasons go to the author as fixes; never back to
stage 2.

## During execution

The plan is amendable, not sacred. When a wave changes while being
built (a row proves wrong, a simpler cut appears, the user adds a
row mid-wave), the execution chair edits the row in `waves.md` and
the goal in place and writes the amendment, dated, under
"Amendments" in `waves.md`, in the user's words where he gave them.
The Status column of `waves.md` is stage 4's to fill, row by row.
Nothing comes back to this stage for it.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something. A card names its options by what they cost,
not by adjectives. A "ready when" names a folder, a screen, a
resource, a count.

## Files

- **Working, deleted at close:** the author's scratch notes, if any.
- **Permanent:** `waves.md`, everything in `02-plan/` (`goals/`,
  `reviews/`, `reviews.md`), `rulings.md`,
  `taste-notes.md`, `blueprint.html`, `.state.md`.

## Resuming

Everything is in files. Read `.state.md`, then `waves.md` (absent
means the cut was not approved), then `02-plan/goals/`, `reviews.md`
if they exist. Continue from the first step whose
output is missing. Never from memory of a previous session.

## Boundaries

No code, no tests, no branches, no deploy (stage 4). No re-decision
of the design: a row that cannot be built as designed becomes a
question to the user and, answered, a dated amendment in
`decisions.md`, never a local workaround in a goal. The discovery
fence does not reopen: a story lands in a row or the user cuts it in
the discovery, with the record there. Frictions worth learning from
go to the workstream's `dreaming-notes.md` on the spot; judging them
is stage 6's job.
