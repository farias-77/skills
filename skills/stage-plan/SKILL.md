---
name: stage-plan
description: Conducts stage 3 (Plan) — takes an approved design and produces, with the user, the sequence in which the whole demand is built: waves that are each a verifiable checkpoint in alpha (one feature branch per repo, the suite green, a PR open), rows inside each wave (one story × repo, with a "ready when" a person can observe), the order and what runs in parallel; one Fable author writes the goal of every wave, the whole brief the execution chair receives; a whole review round runs (three Opus lenses, two blind readers and a referee per goal, an Opus judge marking who owns each fix: author, user or worker); two rounds at most; the blueprint's Plan tab is published for approval. Runs in Claude Code with a Fable session. Use after a design is approved, or to resume a plan in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *), Bash(git *)
---

# Stage 3: Plan

A definition of how it works comes in: the design of the whole demand.
A sequence comes out: the order in which it gets built, cut so that
every step is something a person can verify in alpha. The unit of the
sequence is the **wave**: one feature branch per repo, implemented row
by row, deployed to alpha, the whole smoke suite green, a PR to
`main` open for the user. The next wave's branches cut from this
one's. Prod is stage 5's. The execution chair receives one goal per
wave and builds them in order, without coming back here.

Inside a wave, the unit is the **row**: one story in one repo (a mesh
repo, an infra step or a seed is a row too), with a "ready when" that
is a command or an observation: a smoke folder green, a screen
rendered against the real API, a resource visible. The design says
how everything works; the plan says in what order it exists in alpha
and how each step is proved. It re-decides nothing.

This stage runs in Claude Code, in a Fable session. It depends on the
question tool and the Workflow tool.

The session is the conductor. It runs the plan session with the user,
writes `waves.md` as the session happens, dispatches the author, runs
the review workflow, relays the rulings, and publishes the blueprint.
It writes exactly one plan file, `waves.md`, and never any other: the
author is the only writer of the goals, first draft to last fix. A
finding is only fixed when the author changed the file.

## Two modes

**Session mode** (step 1, step 4, and the questions of step 2). The
user is in the room and decisions are the work. Never run ahead of
the user, never dispatch the author from a session that is not
closed, never decide in the user's place. Closed choices go through
the question tool; open discussion goes in prose. No agent runs
during the session; a fact you need, you look up yourself, inline.

**Autonomous mode** (steps 2, 3, 5 and the file work of 6). The user
is waiting, not answering. Dispatch the author, run the workflow,
write the audit, publish the blueprint, update the state, without
asking permission for any of it. Say in one line what you are about
to do, and close with a recap that stands on its own. Do not end a
turn on a plan or a promise; do the work.

## The pattern

```
1. Session    you and the user: the sequence, whole. You propose it as a table
              from the stories and the design; he changes it row by row; a card
              at every real fork. Written to waves.md as you go. Ends with the
              playback and an explicit "that's it".
2. Write      one dispatch of plan-author: waves.md + the design → one goal per
              wave. Its questions come back in one batch; you ask the user and
              send the answers.
3. Review     the plan-review workflow, whole: three Opus lenses beside two
              Haiku readers and a referee per goal, then the Opus judge.
4. Rule       author-owned and worker-owned findings go to the author.
              User-owned findings go to the user, one question each, grouped by
              wave, the rulings board open beside. One veto question.
5. Iterate    text changed? run step 3 again, whole, once. What is still
              sustained after round 2 is applied without a third round.
6. Close      blueprint Plan tab, explicit approval, state moved, /clear.
```

The user is interrupted at four points: the session (1), the author's
questions (end of 2), the rulings (4, once per round) and the approval
(6). Everything else runs without him.

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

## Step 1 — the plan session

Before it, read the discovery, the design whole (`decisions.md`,
`architecture.md`, `contracts.md`, `rollout.md`, `acceptance.md`
above all), the consuming project's `CLAUDE.md`, and the `CLAUDE.md`
and `docs/` of every repo the design names: the smoke layout and the
deploy commands are what make a "ready when" concrete. Create
`waves.md` from [templates/waves.md](templates/waves.md) on the first
turn and write to it every turn; the session may span more than one
sitting, and the file is the state between them.

The session is a joint construction, not a questionnaire. Its unit is
the sequence, and it runs in five moves:

1. **Ask first whether the user has something in mind.** One open
   question: what should exist first, what is he anxious to see
   working, is there a deadline that shapes the cut. When he has a
   sequence in his head, he talks first and you complete; when he
   does not, you propose.
2. **Propose the whole sequence as a table**, at conversation
   altitude: the waves in order, one line each with what it delivers
   and what a person can do in alpha at its end; then, per wave, the
   rows with repo, work, "ready when" and what depends on what. You
   know the house and the design, so the first proposal is yours. No
   options yet. The shape that has worked: the mesh first when it is
   new (hub, identity, whole), then a foundation wave (the skeleton of
   every repo the demand touches, one thin flow crossing everything,
   login), then one wave per adjacent domain, the API rows before the
   front rows that render them, two rows in parallel when they touch
   different surfaces.
3. **Discuss freely.** He moves rows, merges waves, splits one, cuts a
   row to "later", asks "and if this came first". You check a
   dependency inline (does the front row consume a route no earlier
   row builds?) and say what you found. The sequence is born here.
4. **A card is what is left as a real fork.** When the conversation
   reaches a choice with two cuts and different costs (one bigger
   wave or two smaller ones: one cycle less against a later first
   checkpoint; the walking skeleton as its own wave or as the first
   rows of the foundation; the seed as a row or as latitude), that
   goes through the question tool as a card: the options in one line
   each with their cost, your recommendation first and marked as
   yours, his call. What you settled in prose without a fork is
   written to `waves.md` as a card with its "Chosen" line and no
   question.
5. **Close each wave** with three lines: out of this wave (what looks
   like the wave's and is a later row or direction), stays with the
   user (texts, credentials, third-party contracts, and what the wave
   does without them), and the parallel pairs.

Three rules inside the session:

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

> **Example of a card** — "The equipment inventory: A) rows 2.4 and
> 2.6 inside the people wave (one checkpoint, the wave grows to seven
> rows and its suite to ~150 cases); B) its own wave after people
> (one more PR and one more alpha cycle, the people checkpoint lands
> two days earlier). Recommended: A, the two domains share the
> person's screen." Two cuts, one line of cost each, a recommendation.
>
> **Example of a row** — "1.4 · `labs-api-tracking` · S-002
> accesses: `POST /tracking/users` (a leader is born in his region;
> a subleader by his leader), `PATCH` name and e-mail, `POST
> …/password`, `GET /tracking/users` · ready when smoke `users/` is
> green, the 403 and the 422 among the cases · depends on 1.3."

A fork goes through the question tool: the header is the wave, the
question carries the card, the answers are the options with your
recommendation first and marked as yours. Record every card in
`waves.md` as you go, recommendation beside choice. Every card where
the user chose against the recommendation goes to `taste-notes.md` on
the spot, as the pattern rather than the instance (house rule).

**The playback.** When no wave has a card left, present the whole
sequence back in one pass: the table of waves with their checkpoints,
then each wave's rows. Get an explicit "that's it". The session
closes with that ok, in conversation, no artifact.

## Step 2 — write

One `Agent` dispatch of **`plan-author`** in write mode, with: the
workstream path, `waves.md`, the design folder, the consuming
project's `CLAUDE.md`, the repo map (name and path of every repo the
sequence names), and the language of the documents (the user's). The
author writes one goal per wave under `02-plan/goals/` and returns
its questions in one batch.

Ask the user the batch through the question tool, one question per
item, the author's options as the answers with its recommendation
first. Send the answers to the same author in one message; it folds
them in. An answer that changes a row is written by you to `waves.md`
first, as a dated amendment; the author reads it there.

When the author returns, read every goal. Check that every row of
`waves.md` is a `### N.k` section in the same order, that every
"ready when" is a command or an observation, that every goal has its
proof, its four closing sections and an empty "Questions". Anything
missing goes back to the author in one message before the review
starts.

## Step 3 — the review round

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

## Step 4 — rule

Three lists come back.

**Owner `author`.** A pointer, a count, a "ready when" made
commandable with what the design already fixes, a dependency the
consume plainly implies, propagation to the next goal: send them to
`plan-author` in one apply batch. Its report carries the mentions
table and the final lines; a fix without pasted lines is not done,
send it back. Then verify a sample on disk yourself, file and line.

**Owner `worker`.** Real, but execution: they go in the same batch,
and the author writes each as one line in that goal's "The worker
decides" section. No row changes.

**Owner `user`.** A row of `waves.md` changes (add, split, merge,
move, re-pair), a wave's checkpoint changes, a cut or an order is
contested, two readings, something only the user has. These go to
the user through the question tool, one question per finding, four
per call, **grouped by wave, one wave at a time**, in the sequence's
order. The judge's proposed fix comes first and is marked as the
judge's; the context is in the question itself: lens, severity,
quote, gap, fix, reason. Before the first question, publish the
**rulings board**: an artifact with one card per finding, in the same
order and numbering as the questions, so the user reads on one screen
and answers on the other.

> **Example** — header `w02-people`, question: "coverage#2 (blocker):
> S-004 AC-6, the signed term, is in no row; the design has the flow
> (`architecture.md` §'Accept the terms'). Judge: sustained, owner
> user; which row carries it changes the wave." Answers: "Into row
> 2.1 with the sign-up (judge's proposal)" · "A new row 2.1b after
> 2.1" · "Deferred" · "Dismissed".

A user ruling that changes a row is written by you to `waves.md`
(the row in place, the amendment dated under "Amendments") before it
goes to the author as a fix. Then one veto question, at the end: the
list of what the author fixed alone and what went to the worker's
section, with "keep all" as the first answer. A vetoed fix is
reverted by the author.

Deferred findings batch into one author pass at close. Dismissed
findings die with their reason in `reviews.md`. Every user ruling
goes to `rulings.md` as it happens, and every overrule whose reason
is a pattern goes to `taste-notes.md`.

## Step 5 — iterate

If any text changed in step 4, run step 3 again, whole, and rule
again. That is the whole budget: two rounds. What is still sustained
after round 2 is not re-reviewed: the author applies the `author` and
`worker` fixes with proof by line, you verify them on disk, and the
`user` ones are ruled and applied the same way. A third round runs
only when the user asks for it explicitly, and his words go in
`reviews.md`.

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

Present: the blueprint URL, the sequence table, the verdict table,
the precision table per lens and the judge's line (from
`reviews.md`), the residue, the taste notes this stage added, and the
stage's own telemetry: rounds run, agents dispatched, approximate
cost. Approval is explicit; silence or a loose "looks good" does not
close the stage. On approval: `.state.md` to `stage: execute` with
`wave: w01-<slug>` and `chair: codex`, commit the workstream folder
(push only with the user's explicit approval), and suggest `/clear`
before stage 4 (house rule). On "approved with fixes": one author
pass, verify on disk, close. On rejection: the reasons go to the
author as fixes, or to the user as questions; never back to stage 2.

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
  `reviews/`, `reviews.md`), `rulings.md`, `taste-notes.md`,
  `blueprint.html`, `.state.md`.

## Resuming

Everything is in files. Read `.state.md`, then `waves.md` (a wave
without rows says where the session stopped), then `02-plan/goals/`
and `reviews.md` if they exist. Continue from the first step whose
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
