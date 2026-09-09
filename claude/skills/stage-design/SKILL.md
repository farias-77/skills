---
name: stage-design
description: Conducts stage 2 (Design) — takes an approved discovery and produces, with the user, how the whole demand works: the macro shape and then the ten documents one by one, every call recorded as a decision card; one Fable author transcribes the decisions into the design files, the research and the UI artboards; a whole review round runs (nine Opus lenses, two blind readers and a referee per flow, an Opus judge that marks who owns each fix: author, user or implementer); the author fixes wording, the user rules what changes the product, the implementer keeps declared latitude; two rounds at most; the blueprint's Design tab is published for approval. Runs in Claude Code with a Fable session. Use after a discovery is approved, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, WebSearch, WebFetch, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *), Bash(git *)
---

# Stage 2: Design

A defined scope comes in: the discovery, the stories as the user
closed them. A definition of how it works comes out: what the pieces are,
where each one runs, how they talk to each other, what is stored and
how, what alarms, how it reaches production, and what the implementer
is free to decide. The design covers the whole demand; the cut into
waves and issues is stage 3's. The design is not a build contract and
does not try to be perfect: it is the guarantee that the system grows
in one shape, and it says explicitly where it stops deciding.

This stage runs in Claude Code, in a Fable session. It is not
harness-neutral: the question tool, the design canvas and the
Workflow tool are Claude Code features, and the stage depends on all
three.

The session is the conductor. It runs the design session with the
user, writes `decisions.md` as the session happens, dispatches the
author, runs the review workflow, relays the rulings, and publishes
the blueprint. It writes exactly one design file, `decisions.md`, and
never any other: the author is the only writer of everything else,
first draft to last fix. A finding is only fixed when the author
changed the file.

## Two modes

**Session mode** (steps 1 and 4, and the questions of step 2). The
user is in the room and decisions are the work. One document, one
card at a time. Never run ahead of the user, never dispatch the author
from a session that is not closed, never decide in the user's place.
Closed choices go through the question tool; open discussion goes in
prose. No agent runs during the session; a fact you need, you look up
yourself, inline, and say what you found.

**Autonomous mode** (steps 2, 3, 5 and the file work of 6). The user
is waiting, not answering. Dispatch the author, run the workflow,
write the audit, publish the blueprint, update the state, without
asking permission for any of it. Say in one line what you are about
to do, and close with a recap that stands on its own. Do not end a
turn on a plan or a promise; do the work.

## The pattern

```
1. Session    you and the user: the macro shape, then the ten documents one by
              one, one card per decision, written to decisions.md as you go.
              Ends with the playback and an explicit "that's it".
2. Write      one dispatch of design-author: decisions.md + discovery → research,
              the ten documents, the artboards, the canvas, and the blueprint's
              Design tab in the same pass. Its questions come back in one batch;
              you ask the user and send the answers.
3. Review     the design-review workflow, whole: nine Opus lenses beside two
              Haiku readers and a referee per flow, then the Opus judge.
4. Rule       author-owned and implementer-owned findings go to the author.
              User-owned findings go to the user, one question each, grouped by
              document, the rulings board open beside. One veto question.
5. Iterate    text changed? run step 3 again, whole, once. What is still
              sustained after round 2 is applied without a third round.
6. Close      the review block into the Design tab, explicit approval, state
              moved, /clear.
```

The user is interrupted at four points: the session (1), the author's
questions (end of 2), the rulings (4, once per round) and the approval
(6). Everything else runs without them.

## Preconditions

`.state.md` says `stage: design`; `00-discovery/` has the approved
`pr-faq.md` and `user-stories.md`.
Missing: halt, back to stage 1. Set `chair: fable` in `.state.md`.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: design · chair: fable
├── blueprint.html             # the workstream's blueprint; this stage fills BLUEPRINT.design
├── rulings.md                 # every ruling, appended as it happens (house rule)
├── taste-notes.md             # what the user chose against the recommendation (house rule)
├── 00-discovery/              # the demand (stage 1, untouched here)
└── 01-design/                 # the whole demand's design
    ├── decisions.md           # the session's record: the conductor's file
    ├── research/              # one file per researched target
    ├── ui/                    # the screens: <Screen>.dc.html + canvas.json
    ├── reviews/               # round-N.json: each round's return value, as it came
    ├── architecture.md · data-model.md · contracts.md · ui.md · security.md
    ├── infra.md · observability.md · rollout.md · code.md · acceptance.md
    └── reviews.md             # the round audit: the conductor's file
```

## Step 1 — the design session

Before it, read the discovery whole, the consuming project's
`CLAUDE.md`, and the `CLAUDE.md` and `docs/` of every repo the demand
touches. Create `01-design/decisions.md` from
[templates/decisions.md](templates/decisions.md) on the first turn and
write to it every turn; the session may span more than one sitting,
and the file is the state between them.

The session is a joint construction, not a questionnaire. Its unit
is the document, and each document runs the same way:

1. **Ask first whether the user has something in mind.** One open
   question. When he does, he talks first and you complete; when he
   does not, you propose.
2. **Propose the whole document in prose**, at conversation altitude,
   already in the form you believe he would take: for architecture,
   the components, where each runs, the flows and how each works;
   for observability, the alarms and whom each wakes. You know the
   house (the project's `CLAUDE.md`, the standards, the repos), so the
   first proposal is yours. No options yet.
3. **Discuss freely.** He changes, adds, cuts, asks "and if". You
   look up a fact inline when one weighs. The design is born here.
4. **A card is what is left as a real fork.** When the conversation
   reaches a choice with two paths and different costs (which store,
   sum per request or an aggregate table, alarm on 5xx or on latency),
   that goes through the question tool as a card: the options in one
   line each with their cost, your recommendation first and marked as
   yours, his call. What you settled in prose without a fork is
   written to `decisions.md` as a card with its "Chosen" line and no
   question.
5. **Close the document** with "what here does the implementer
   decide?", and write the answer as the section's Latitude list.

A card exists for a choice the user would want made differently, or
one that encodes a business rule, a cost or a risk. Everything else
(the request body, the DDL, the IAM statement, the artboard's pixels)
is transcription, and the author does it. Do not walk the user
through transcription; do not transcribe a decision in his place. On
the ops-dashboard w01 this shape gives about ten macro cards and two
or three forks per document, not ten questions per document.

**Layer 1, the macro shape.** Run as one document: the proposal in
prose covers the fixed agenda below, in this order, and the forks
become cards:

1. Data: what is stored, where, and what is not stored.
2. Compute: what runs where.
3. Messaging: event or sync, per boundary.
4. Identity and access: who calls what, with which credential.
5. Repos: new or existing.
6. Build vs buy: what is not built.
7. Cost envelope: the accepted monthly ceiling at three scales,
   declared before the design exists.
8. Alarm philosophy: what wakes someone, given who actually answers.
9. Environment and rollout macro: alpha, profiles, names, test
   credentials.
10. Extension points: where the direction the discovery recorded
    ("What we are NOT building", "Out of this story") will land, and what
    does not change when it does.

**Layer 2, the ten documents, one by one.** With the macro shape
decided, walk every document in writing order, each through the five
moves above. Nothing is skipped: the user wants to see the alarms, the rollout and the
acceptance convention as much as the flows, so that he knows what is
alarming and what proves the thing works.

| Document | What earns a card |
|---|---|
| `architecture.md` | each flow end to end; the components, where each runs and what each guarantees; every mechanism that guards a rule (a lock, idempotency, a retry, a cutoff); what happens when the other side fails |
| `data-model.md` | the entities and their keys; the access patterns; what is retained and for how long |
| `contracts.md` | the list of endpoints and events, who calls each, the error classes; the exact shapes are transcription |
| `ui.md` | the screens and the states that matter; what is reused from the product as it is |
| `security.md` | every class of the fixed sweep that needs a call: risk accepted, or covered how |
| `infra.md` | the resources, and every config that encodes a rule or a cost |
| `observability.md` | which alarms exist, and whom each one wakes |
| `rollout.md` | the deploy order, the cutover gates, the way back |
| `code.md` | the repo layout where it departs from the house structure |
| `acceptance.md` | which cases prove the demand: the case list, not the request bodies |

Three rules inside the session:

- **A mechanism card shows the whole kit.** When the choice is a piece
  of infra or a platform mechanism, the card lists what it drags in:
  resources, rollout steps, runbooks, acceptance cases, the monthly
  line. The user decides on the set, not on the piece.
- **A fact that would change a decision is looked up before the
  decision, by you, inline.** A price, a service limit, whether an
  API exposes a field. Say what you found and where. A cost
  difference of thirty percent or more on one line of the envelope
  triggers the lookup before the card is answered. Nothing is
  dispatched to an agent during the session.
- **Every document's section ends with its latitude.** Ask, per
  document: what here does the implementer decide? Write the answer
  as the section's Latitude list. The hard classes (the
  [design-docs reference](references/design-docs.md) lists them)
  never go there; if the user tries to leave one open, say which
  class it is and ask for the call.

> **Example of a card** — "Where does the panel's aggregation run?
> A) the API sums the recordings per request, no aggregate table
> (simplest; a person with 5,000 recordings costs one query of ~1 MB);
> B) a nightly job writes per-person totals (a second table, a job,
> an alarm for the job). Recommended: A until a screen reads more
> than a month at once." Two builds, one line of cost each, a
> recommendation with its trigger for change.
>
> **Example of a latitude line** — "architecture: retries on the
> Cognito calls, within the Lambda's 10 s budget." A bound the design
> sets, a choice the implementer makes.

A fork goes through the question tool: the header is the document,
the question carries the card, the answers are the options with your
recommendation first and marked as yours. Record every card in
`decisions.md` as you go, recommendation beside choice. Every card
where the user chose against the recommendation goes to
`taste-notes.md` on the spot, as the pattern rather than the instance
(house rule).

**The playback.** When no document has a card left, present the whole
design back in one structured pass: the one-sentence frame, the macro
shape, per document the cards and the latitude. Get an explicit
"that's it". The session closes with that ok, in conversation, no
artifact.

## Step 2 — write

One `Agent` dispatch of **`design-author`** in write mode, with: the
workstream path, `decisions.md`, the consuming project's `CLAUDE.md`,
the repo map, and the language of the documents (the user's). The
author researches every target, writes the ten documents, draws the
artboards, publishes the canvas, writes `BLUEPRINT.design` in the
workstream's `blueprint.html`, and returns its questions in one
batch. The tab is written here, not at the close: the rounds change
sentences, and the author carries what they change into the tab in
its apply passes.

Ask the user the batch through the question tool, one question per
item, the author's options as the answers with its recommendation
first. Send the answers to the same author in one message; it folds
them in and writes them into `decisions.md`'s "Questions answered
after the session" section is yours: you write that section from the
answers, the author reads it.

When the author returns, read the ten documents. Check that every
story has a flow or a screen, that every flow
follows the flow format (numbered steps, a failure table), that every
document ends with its latitude section and its references, and that
`ui.md` carries the canvas link. Open `blueprint.html` and check the
Design tab renders (both scripts parse; the nine sections are there;
the altitude reads as a report, not a projection). Anything missing
goes back to the author in one message before the review starts.

## Step 3 — the review round

Autonomous mode. Run
[`design-review`](../../workflows/design-review.js) by `scriptPath`
(never by name), with `designDir`, `discoveryDir`, `round`, the
design's glossary block, and `flows`: one `{id, text}` per flow of
`architecture.md`, split at every `### ` heading under `## Flows`.
Scripts cannot read files; you pass the text.

| Agent | Question |
|---|---|
| `design-reviewer-data` | every read has a key path; growth is bounded; writes that must land together do |
| `design-reviewer-code` | the house architecture standard holds; coupling, seams, extension points with their "does not change" line |
| `design-reviewer-infra` | configs on purpose, IAM by the verb, cost at three scales against real prices, the way in and out |
| `design-reviewer-security` | the abuse paths; the class sweep answered with mechanisms |
| `design-reviewer-contracts` | every contract whole, success and error; the data each side needs arrives |
| `design-reviewer-alarms` | every alarm has its four fields and would not ring on a quiet day |
| `design-reviewer-coverage` | every story has its home; the whole builds the product the PR-FAQ narrates; nothing in the design is unforced |
| `design-reviewer-facts` | every claim about the outside world traces to research |
| `design-reviewer-ui` | the screens fit the product as it is; every story state has a home |
| 2× `design-blind-reader` → `design-reviewer-ambiguity`, per flow | would two engineers implement the same flow from these steps? |
| `design-judge` | could the implementer place this and build it one way? and who decides the fix: the author, the user, or the implementer? |

The round runs whole every time. Every reviewer answers under the
[reviewer contract](../../docs/standards/reviewer-contract.md),
declared latitude included.

Record the round before acting on it, with no agent and no rewriting:
save the workflow's return value as it came in
`01-design/reviews/round-N.json` (the machine record: every finding
with ruling, owner and reason, the lens verdicts, the unread flows),
and write the human index in `01-design/reviews.md`
([template](templates/reviews.md)) from it with one `Write`: the
verdict table per lens with the run id (from the workflow's journal),
the blind-read table, and one line per finding, to which your rulings
are appended in step 4. The JSON is the authority; the index is what
a reader opens.

## Step 4 — rule

Three lists come back.

**Owner `author`.** Wording, propagation, a value the decisions
already fix: send them to `design-author` in one apply batch. Its
report carries the mentions table and the final lines; a fix without
pasted lines is not done, send it back. Then verify a sample on disk
yourself, file and line.

**Owner `implementer`.** Real, but latitude: they go in the same
batch, and the author writes each as one line in that document's
"The implementer decides" section. No mechanism changes.

**Owner `user`.** Behavior, a data format, a contract's shape, the
security posture, cost, a decision contested, two readings. These go
to the user through the question tool, one question per finding,
four per call, **grouped by document, one document at a time**, in
the documents' writing order, so the user keeps one context per
batch. The judge's proposed fix comes first and is marked as the
judge's; the context is in the question itself: lens, severity, quote,
gap, fix, reason. Before the first question, publish the **rulings
board**: an artifact with one card per finding, in the same order and
numbering as the questions, so the user reads on one screen and
answers on the other.

> **Example** — header `contracts`, question: "contracts#3 (blocker,
> from the ambiguity referee on the flow 'new password by the
> superior'): the flow says 'the open sessions end'. Reader 1 revokes
> the refresh tokens (an access token lives up to 60 min). Reader 2
> adds a password epoch checked on every request (ends within one
> request). Judge: sustained, owner user; the two builds differ in
> what the user experiences and in the data model." Answers: "Revoke
> the refresh tokens (judge's proposal)" · "Epoch per request" ·
> "Deferred" · "Dismissed". One finding, one decision, answerable
> without opening a file.

Then one veto question, at the end: the list of what the author fixed
alone and what went to latitude, with "keep all" as the first answer.
A vetoed fix is reverted by the author.

Deferred findings batch into one author pass at close. Dismissed
findings die with their reason in `reviews.md`. Every user ruling goes
to `rulings.md` as it happens, and every overrule whose reason is a
pattern goes to `taste-notes.md`.

A user ruling that contradicts a card in `decisions.md` amends the
card: write the amendment there, dated, before sending it to the
author.

## Step 5 — iterate

If any text changed in step 4, run step 3 again, whole, and rule
again. That is the whole budget: two rounds. What is still sustained
after round 2 is not re-reviewed: the author applies the `author` and
`implementer` fixes with proof by line, you verify them on disk, and
the `user` ones are ruled and applied the same way. A third round runs
only when the user asks for it explicitly, and his words go in
`reviews.md`.

Told to find errors, reviewers always find errors. The budget is what
turns that into a calibrated pass instead of an infinite loop; the
residue is written down, not chased.

## Step 6 — close

The author wrote `BLUEPRINT.design` at step 2 and carried every
applied fix into it. Here you add what only the close knows, in one
edit: the lens verdict table with the user's rulings beside the
judge's, the residue, the stage's telemetry. Then read the tab once
as the user will (same path, same URL forever): the nine sections,
every section opening with a picture or a table, the cards with the
rejected option in one line, the 6–8 thousand words. What is off
goes to the author as one fix batch, not to you: the tab is the
author's file.

Present: the blueprint URL, the canvas URL, the verdict table, the
precision table per lens and the judge's line (from `reviews.md`),
the residue, the taste notes this stage added, and the stage's own
telemetry: rounds run, agents dispatched, approximate cost. Approval
is explicit; silence or a loose "looks good" does not close the
stage. On approval: `.state.md` to `stage: plan`, commit the
workstream folder (push only with the user's explicit approval), and
suggest `/clear` before stage 3 (house rule). On "approved with
fixes": one author pass, verify on disk, close. On rejection: the
reasons go to the author as fixes, or to the user as questions; never
back to stage 1.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something or describe a taste. A card names its options
by what they cost, not by adjectives.

Use lists and tables where the content has parallel items (cards,
findings, options). Keep the session itself in prose.

## Files

- **Working, deleted at close:** the author's scratch notes, if any.
- **Permanent:** everything in `01-design/` (`decisions.md`, the ten
  documents, `research/`, `ui/`, `reviews/`, `reviews.md`), `rulings.md`,
  `taste-notes.md`, `blueprint.html`, `.state.md`.

## Resuming

Everything is in files. Read `.state.md`, then `decisions.md` (the
sections without cards say where the session stopped), then the
documents and `reviews.md` if they exist. Continue from the first
step whose output is missing. Never from memory of a previous session.

## Boundaries

No wave cut, no issue decomposition (stage 3). No code and no
executable tests (stage 4): `acceptance.md` is the spec; the `.sh`
live in each repo's `smoke/`. The discovery fence does not reopen
silently: an in-scope item the design proves unviable becomes a
question to the user and, answered, a dated amendment in
`decisions.md`. Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is stage 6's job.
