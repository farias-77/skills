---
name: stage-design
description: Conducts stage 2 (Design) — takes an approved discovery and designs, with the user, how the whole demand gets built on the system as it is. Recon first (scouts, Haiku 4.5 max, read the current system; a deep-research workflow, Sonnet 5 high, reads the docs of every external tool); then the conductor asks whether the user already has a shape in mind, builds on it or arrives with its own proposal across the eleven subjects under the construction razor (extend what exists, a new piece only for a new responsibility, never a workaround, never speculation), and iterates with him to a final version; then ten writers (Sonnet 5, high) write the ten documents in parallel, deciding nothing, and review round 1 runs at once: ten lenses (Sonnet 5, high), two blind readers (Haiku 4.5, high) and a referee (Sonnet 5, low) per flow, judged by the conductor; delta rounds on the user's call, three at most; the blueprint's Design tab read by the user at the close. Runs in Claude Code with an Opus 5.5 session at high effort. Use after a discovery is approved, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, WebSearch, WebFetch, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *), Bash(git *), Bash(node *)
---

# Stage 2: Design

A defined scope comes in: the discovery, the stories as the user
closed them. A definition of how it works comes out: what changes in
the system as it is today, where, how it is stored, what it exposes,
what alarms, how it reaches production, and what the implementer is
free to decide. The design covers the whole demand; the cut into waves
is stage 3's. The design is not a build contract: it is the guarantee
that the system grows in one shape, and it says where it stops
deciding.

The shape itself is given. The consuming project's engineering
doctrine (its `CLAUDE.md` says where) fixes where code runs, how
modules talk, the stack, CI/CD and the quality gates. The design
applies it; it never reopens it. A demand the doctrine cannot hold is
a card for the user, marked **changes the doctrine**.

The session is the conductor, **Opus 5.5 at high effort**. It runs
the recon, the proposal and the conversation with the user, writes
`notes.md` as the session happens, dispatches writers, runs the review, judges
every finding, and builds the blueprint. It writes `notes.md`,
`reviews.md`, `rulings.md`, `taste-notes.md` and the conductor's
blueprint JSON; every design document is written by its writer, first
draft to last fix. A finding is only fixed when the writer changed
the file.

## Two modes

**Session mode** (steps 2 and 3, and the questions of 4 and 5). The
user is in the room and decisions are the work. Never dispatch a
writer from a session that is not closed, never decide in his place.
Closed choices go through the question tool in the house shape; open
discussion goes in prose. A fact the conversation needs and the recon
did not bring is fetched the same way: a `scout` for the system, a
`design-research` workflow for an external tool; say what came back.
Every reply in the terminal is built to be followed at a
glance: a table for parallel things, a flow drawn in a code block for
a sequence, short topics for lists; no paragraph where a table does
the job, and no over-information in a table.

**Autonomous mode** (steps 1, 4, the round of 5, and the file work of
6 and 7). The
user is waiting, not answering. Dispatch, run the workflows, write
the audit, build the blueprint, update the state, without asking
permission for any of it. Say in one line what you are about to do,
and close with a recap that stands on its own. Do not end a turn on a
plan or a promise; do the work.

## The pattern

```
0. Open      Opus 5.5, effort high; read the discovery and the doctrine; notes.md opened
1. Recon     in parallel: scouts (Haiku 4.5, max) read the system as it is today;
             one design-research workflow (Sonnet 5, high) per external tool → research/
2. Proposal  ask whether he already has a shape in mind. Yes: he talks first, you build on it and
             say where you would go another way, with the tradeoffs. No: you arrive with the
             proposal. Either way it covers all eleven subjects, under the construction razor
3. Converse  iterate with him to the final version; real forks become cards; notes.md rewritten
             in place, one version of each decision; ends on an explicit "that's it"
4. Write     ten design-writer (Sonnet 5, high) in parallel, one per document, same source:
             your brief + notes.md + research/ + the template; zero decisions — questions come
             back to you, you answer or ask the user; each also writes blueprint/design/<doc>.json
5. Review    round 1 whole and automatic, right after the writers: design-review workflow (ten lenses Sonnet 5 high;
             per flow two blind readers Haiku 4.5 high + a referee Sonnet 5 low); you judge
             every finding by references/judging.md; wording → writers, decisions → user,
             one question per decision
6. Iterate   the user says whether another round runs; rounds 2 and 3 are delta only;
             three at most
7. Close     design-report.json + design-review.json + decisions.json, node claude/blueprint/build.mjs,
             publish; the user reads and sends adjustments in a batch, applied on "apply";
             approval, close commit last, state → plan, /clear
```

The user is interrupted at: the proposal and the conversation (2–3),
the writers' questions (end of 4), the rulings (5, per round), the
round question (6) and the approval (7). Everything else runs without
him.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor | Opus 5.5, high | the proposal, the conversation, the judging, the blueprint |
| `scout` × N | Haiku 4.5, max | one question each about the system as it is: quotes with path:line, never conclusions |
| `design-researcher` | Sonnet 5, high | one deep-research workflow per external tool: planner, searchers, synthesizer, critic, citer |
| `design-writer` × 10 | Sonnet 5, high | one document each, in parallel, from the same source; asks, never decides |
| `design-reviewer-{data, code, infra, security, contracts, alarms, coverage, facts, ui, consistency}` | Sonnet 5, high | ten lenses, each reads everything |
| `design-blind-reader` × 2 per flow | Haiku 4.5, high | builds one flow alone, in the documents' language |
| `design-reviewer-ambiguity` | Sonnet 5, low | compares the two builds key by key |

## Preconditions

`.state.md` says `stage: design`; `00-discovery/` has the approved
`pr-faq.md` and `user-stories.md`; `blueprint/` has the discovery
JSON. Missing: halt, back to stage 1.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: design
├── blueprint.html             # built, never edited (house rule)
├── blueprint/                 # the discovery JSON, plus:
│   └── design/                # <doc>.json × 10 (writers) · decisions.json · design-report.json · design-review.json (you)
├── rulings.md · taste-notes.md · dreaming-notes.md
├── 00-discovery/              # the demand (stage 1, untouched here)
└── 01-design/
    ├── notes.md               # the session's record: your file, written as it happens
    ├── research/              # one file per topic, by the research workflow
    ├── ui/                    # <Screen>.dc.html artboards
    ├── reviews/               # round-N.json: each round's return value, as it came
    ├── architecture.md · data-model.md · contracts.md · ui.md · security.md
    ├── infra.md · observability.md · rollout.md · code.md · acceptance.md
    └── reviews.md             # the round audit: your file
```

## Step 0 — open

If the session is not on **Opus 5.5 at high effort**, ask the user to
switch (`/model`) and wait. Then read the discovery whole and the
consuming project's `CLAUDE.md`; the engineering doctrine it points
to is read by scouts, never skipped. Create `01-design/notes.md` from
[templates/notes.md](templates/notes.md) with the one-sentence frame
and the stories to cover.

## Step 1 — recon

Autonomous mode. Before any proposal, learn the system as it is,
because the right design extends what exists and a design from memory
invents a second one. In one message, in parallel:

- **Scouts** (`scout`, Haiku 4.5, max), one question each: what the
  feature maps and `docs/` say about every module the stories touch;
  the routes, tables, jobs and screens those modules have today; the
  business rules the stories cite; the doctrine's rules for anything
  the demand will add (a table, a route, a job, a screen, an alarm).
  Each returns quotes with `path:line` and what it did not find.
- **Deep research** (the
  [`design-research`](../../workflows/design-research.js) workflow,
  Sonnet 5, high), one per external tool the demand depends on (a
  vendor API, a provider, a library): its documentation, limits,
  prices, failure behavior. By `scriptPath`, with `topic`,
  `questions`, `designDir`, `repos`. Each writes
  `research/<topic>.md` with a source per fact and marks the rest
  *not verified*.

Write what came back into the notes' **What exists today** block, one
line per fact with its source. Read every research file whole.

## Step 2 — the proposal

Session mode. First ask the user one thing: does he already have a
shape in mind for this? Then:

- **He does.** He talks first, all of it. You build the proposal on
  what he said, and where you would go another way you say so, with
  the tradeoff of each option and your pick. His idea is the starting
  point, not a verdict.
- **He does not.** You arrive with the proposal ready.

Either way, the proposal walks the eleven subjects below, in order,
and passes every piece through the construction razor. For each story:
what changes (the module, the route created or edited, the table or
column, the job, the screen), why it is built that way, what stays
out, and what the implementer decides. For each subject that the
demand does not touch, say that nothing changes and why, in one line.
The user reads the whole shape at once and reacts.

### The construction razor

The design is the smallest change that is the right long-term shape
of the system. Every piece of the proposal passes this, and the code
lens checks it again:

| When | Then |
|---|---|
| The responsibility already exists (a route, a table, a screen, a job) | **extend it**: a field, a filter, a rule in the use case |
| The responsibility is new | **a new piece, in the module that owns it**, in the house pattern |
| What exists is wrong for the demand | **fix what exists**; never a parallel path beside it |
| The fit needs a flag, a special case, a copy or a temporary step | it is a workaround: **it does not enter**, unless the user asked for the temporary explicitly, in his words |
| An abstraction serves a second case nobody asked for | it is speculation: **it does not enter**; extension points exist only when named |
| The doctrine cannot hold the demand | a card marked **changes the doctrine**, for the user; never decided here |

## Step 3 — the conversation

Session mode. Iterate on the proposal with the user until it is the
final version. The eleven subjects, one block of `notes.md` each:

| # | Subject | What the conversation settles | Becomes |
|---|---|---|---|
| 1 | The shape | what this demand changes in the system's shape against the doctrine (a module, a repo, where something runs, how blocks talk, a store); usually nothing, and it says so; build vs buy; the cost envelope at three scales; extension points (what the discovery left out) | the shape block |
| 2 | Architecture | one flow per story or group, end to end; the mechanisms that guard a rule (lock, idempotency, retry, cutoff); what happens when the other side fails | `architecture.md` |
| 3 | Data model | entities and keys; access patterns; retention | `data-model.md` |
| 4 | Contracts | routes, events, shared tables; who calls; error classes | `contracts.md` |
| 5 | Screens | the screens and their states, drawn here from the stories (discovery draws none); what is reused | `ui.md` + `ui/` |
| 6 | Security | the class sweep: covered how, or risk accepted and why | `security.md` |
| 7 | Infra | resources; every config that encodes a rule or a cost; the bill at three scales | `infra.md` |
| 8 | Observability | the alarms that wake someone and whom; what is only watched; a window is not a clock | `observability.md` |
| 9 | Rollout | order, gates, the way back, the first run | `rollout.md` |
| 10 | Code | repos, where the tree departs from the house, the seams | `code.md` |
| 11 | Acceptance | the case groups and how each runs; infra is proved by synth, never by a test under `infra/` | `acceptance.md` |

Every subject is thought, even when nothing changes in it: a small
feature may need no alarm and no infra, but the notes say so and why
("no alarm: the route is synchronous and its errors fall under the 5xx
alarm"), and the lens of that subject checks the reason. Per subject:

```
1. the proposal's position on it, from the recon
2. discuss freely; a fact that weighs on a decision → a scout or a research workflow, reported
3. a real fork → a card through the question tool: the options with their cost, yours first
4. close with "what here does the implementer decide?" → the subject's latitude list
5. notes.md rewritten in place: a revised decision replaces the old one, never sits beside it
```

A card exists for a choice the user would want made differently, or
one that encodes a business rule, a cost or a risk. Everything else
(a request body, a DDL, an IAM statement) is transcription, and the
writers do it. A mechanism card shows the whole kit it drags in:
resources, rollout steps, runbooks, acceptance cases, the monthly
line. The hard classes ([design-docs](references/design-docs.md))
never go to latitude; if the user tries to leave one open, name the
class and ask for the call. A card where he chose against the
recommendation goes to `taste-notes.md` on the spot, as the pattern.

**The final version.** When no subject has a card left, present the
design back in one pass: per subject what changes (or "nothing,
because"), the cards and the latitude, as a table. Get an explicit
"that's it"; the session closes with it, and step 4 starts in the
same turn.

## Step 4 — write

Ten `Agent` dispatches of **`design-writer`** in one message, one per
document, in write mode, each with the same brief: the workstream
path, `notes.md`, `research/`, the discovery, the document's template,
the blueprint schema, the language. The writer writes its document
and `blueprint/design/<doc>.json` in the same pass, and returns its
questions. It decides nothing: a decision the notes do not carry is a
question. Answer from the notes what the notes settle; ask the user
the rest through the question tool, grouped by decision; write every
answer to the "Questions answered after the session" block of
`notes.md`; send the answers to the writer in one message.

When the writers return, read the ten documents: every story has a
flow or a screen, every flow follows the format (numbered steps, a
failure table), every document ends with its latitude and its
references, `ui.md` names its artboards. Anything missing goes back to
its writer in one message before the review starts.

## Step 5 — review and judge

Autonomous mode, right after the writers' questions are answered.
Run [`design-review`](../../workflows/design-review.js) by `scriptPath`
with `designDir`, `discoveryDir`, `round: 1`, `language`, the glossary
block, and `flows`: one `{id, text}` per flow of `architecture.md`,
split at every `### ` heading under `## Flows`.

| Lens | Question |
|---|---|
| `design-reviewer-data` (Sonnet 5, high) | every read has a key path; growth is bounded; writes that must land together do |
| `design-reviewer-code` (Sonnet 5, high) | the construction razor and the doctrine hold; blocks every workaround, temporary step or speculation; coupling, seams, extension points with their "does not change" line |
| `design-reviewer-infra` (Sonnet 5, high) | configs on purpose, IAM by the verb, cost at three scales against real prices; infra proved by synth, never by a test under `infra/` |
| `design-reviewer-security` (Sonnet 5, high) | the abuse paths; the class sweep answered with mechanisms |
| `design-reviewer-contracts` (Sonnet 5, high) | every contract whole, success and error; the data each side needs arrives |
| `design-reviewer-alarms` (Sonnet 5, high) | every alarm has its four fields, would not ring on a quiet day, and does not depend on where a window sits on the clock |
| `design-reviewer-coverage` (Sonnet 5, high) | every story has its home; nothing in the design is unforced |
| `design-reviewer-facts` (Sonnet 5, high) | every claim about the outside world traces to research |
| `design-reviewer-ui` (Sonnet 5, high) | the screens fit the product as it is; every story state has a home |
| `design-reviewer-consistency` (Sonnet 5, high) | everything that appears in two documents says the same thing in both: names, values, keys, shapes, counts |
| 2 × `design-blind-reader` (Haiku 4.5, high) → `design-reviewer-ambiguity` (Sonnet 5, low), per flow | would two engineers implement the same flow from these steps? |

Every reviewer answers under the
[reviewer contract](../../docs/standards/reviewer-contract.md). The
workflow returns `{ round, valid, findings, lenses, unread }`; a round
in which no flow was read is invalid: fix the cause, run it again.

Record before acting: save the return value as it came in
`01-design/reviews/round-N.json`, and write `01-design/reviews.md`
([template](templates/reviews.md)) from it in one `Write`.

**Judge.** You rule every finding by
[references/judging.md](references/judging.md): merge by fix first,
then sustained / deferred / dismissed, with the owner of each
sustained one: `writer`, `user` or `implementer`. Write the rulings
to `reviews.md` before any fix moves.

- **`writer`**: wording, propagation, a value the notes already fix,
  a mismatch between two documents. One apply batch per writer,
  dispatched in one message; the report carries the mentions table
  and the final lines; a fix without pasted lines is not done. No
  veto question: the user reads the blueprint at the close.
- **`implementer`**: real, but latitude: the writer adds one line to
  that document's "The implementer decides".
- **`user`**: behavior, a data format, a contract's shape, security
  posture, cost above the materiality bar, a card contested, two
  readings that are two products. One question per **decision**
  (findings that resolve by the same choice are one question), four
  to a call, grouped by document in writing order, the house shape:
  the context in the question, your pick first and marked as yours.
  Every ruling goes to `rulings.md` as it happens; a ruling that
  amends a card amends `notes.md`, dated, before it reaches a writer.

## Step 6 — iterate

After the rulings are applied, ask the user, with the round's numbers
in a table (findings, sustained by owner, dismissed, what changed):
run another round, or close. **Round 1 is whole and automatic; rounds
2 and 3 run only on his word and only over the delta**: the workflow
receives `changed` (the documents and flows whose text changed) and
`fixes` (what was applied); the lenses check that each fix landed and
did not break its surroundings; the blind readers reopen only the
flows whose text changed. Three rounds at most. What is still
sustained after the last round is applied by the writers with proof
by line and verified on disk by you; the residue is written, not
chased.

## Step 7 — close

Write the conductor's JSON under `blueprint/design/`:
`decisions.json` from `notes.md` and `rulings.md` (one entry per
card, recommendation and pick), `design-review.json` from
`reviews.md` and `rulings.md`, and `design-report.json`, the plain
layer the tab opens with, in the intern's voice (schema:
`${CLAUDE_SKILL_DIR}/../../blueprint/schema/design.md`). Then
`node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>` and publish
`blueprint.html`. The build refuses with the field named: a missing
figure, a story a flow names that does not exist, a bill line with
the wrong number of scales, a text over its word cap.

Present: the blueprint URL, the round table, the decisions that were
his, the residue, the taste notes added, the stage's telemetry
(rounds, agents, approximate cost). **This is where the user reads
the design.** He sends his adjustments as they come; you note each in
a visible list and dispatch nothing until he says "apply"; then one
batch per writer, verify on disk, rebuild, republish, and ask again.
Approval is explicit; silence does not close the stage. On approval,
and only after he says there is nothing else: `.state.md` to
`stage: plan`, the close commit of the workstream folder (push only
with his explicit approval), and suggest `/clear` before stage 3.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something. A card names its options by what they cost.
In the terminal: a table for parallel things, a flow in a code block
for a sequence, short topics for lists; a paragraph only for the one
argument that is prose.

## Files

- **Permanent:** everything in `01-design/`, `blueprint/design/`,
  `blueprint.html`, `rulings.md`, `taste-notes.md`, `.state.md`.
- **Nothing is deleted at the close.** `notes.md` is the record the
  dreaming reads next to `rulings.md`.

## Resuming

Everything is in files. Read `.state.md`, then `notes.md` (the
recon block and the subjects without a block say where the session
stopped), then `research/`, the documents and `reviews.md` if they
exist. Continue
from the first step whose output is missing. A writer that died is
redispatched with the list of what is on disk; it never rewrites a
finished file. Never from memory of a previous session.
