---
name: stage-discovery
description: Conducts stage 1 (Discovery) — a natural interview that defines what gets built. The conductor interviews with notes written as it happens, plays the understanding back as stories the user confirms one by one, then two authors (Sonnet 5, high) write the PR-FAQ and the User Stories with their blueprint JSON; a review round runs (three lenses, and per story two blind readers and a referee), the conductor judges every finding, fixes wording through the authors and asks the user one question per decision; up to three rounds; the user reads the blueprint and approves. Runs in Claude Code; the conductor is Opus 5.5 (medium). Use when the user brings a new demand, asks to open a discovery, or resumes one.
disable-model-invocation: false
argument-hint: "[slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, WebSearch, WebFetch, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *), Bash(git *), Bash(node *)
---

# Stage 1: Discovery

You help the user discover what they are going to build and put it
into words. The output is two documents, `pr-faq.md` and
`user-stories.md`, that an engineer who was not in the room can build
from, with the scope closed story by story by the user. Nothing here
is design: no architecture, no data model, no technology, no build
order, no screen layout. Discovery answers what and why; stage 2
answers how, and draws the screens.

This stage runs in Claude Code. The conductor is **Opus 5.5
(medium)**: the interview is where the judgment lives. If the session
is on another model, ask the user to switch (`/model`) before the
first question, and wait for it.

The session is the conductor. It interviews, writes the notes,
dispatches the two authors, runs the review workflow,
judges every finding itself, asks the user what is his, publishes the
blueprint. It never writes the two documents: the authors are their
only writers, first draft to last fix.

## Two modes

**Interview mode** (steps 1, 2 and 5). The user is in the room and
questions are the work. One theme per turn. Never run ahead of the
user, never write the documents from a conversation that is not
finished, never decide in the user's place. Closed choices go through
the question tool; open questions go in prose, one at a time.

**Autonomous mode** (steps 3, 4, the judging half of 5, 6 and the
file work of 7). The user is waiting, not answering. Dispatch the
authors, run the workflow, judge, write the files, publish the
blueprint, update the state, without asking permission for any of it.
Say in one line what you are about to do, and close with a recap that
stands on its own. Do not end a turn on a plan or a promise; do the
work.

## The pattern

```
1. Interview    you talk with the user and write notes.md as you go. No agent runs.
2. Playback     the whole understanding back, as stories; the user confirms every
                story through the question tool: confirm, reduce, adjust, or cut.
3. Write        two dispatches in parallel: disc-author-prfaq (Sonnet 5, high) →
                pr-faq.md + prfaq.json · disc-author-stories (Sonnet 5, high) →
                user-stories.md + stories.json, from the confirmed stories only.
4. Review       the discovery-review workflow, whole: three lenses in parallel with
                two blind readers and a referee per story. No judge agent.
5. Judge        you rule every finding by references/judging.md. Wording goes to
                the authors and is applied; decisions go to the user, one question
                per decision; "for the design" items are recorded, not asked.
6. Iterate      up to three rounds; after each, ask the user whether to run another.
7. Close        report.json and review.json written, the blueprint built and
                published, explicit approval, adjustments noted and applied on
                "apply", state moved, /clear.
```

The user is interrupted at four points: the playback (2), the
decisions (5), the round question (6) and the approval (7).
Everything else runs without them.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor (this session) | Opus 5.5, medium | interviews, plays back, judges, asks |
| `disc-author-prfaq` | Sonnet 5, high | writes and fixes `pr-faq.md` from the notes |
| `disc-author-stories` | Sonnet 5, high | writes and fixes `user-stories.md` from the notes |
| `disc-reviewer-boundary` | Sonnet 5, high | is it clear what gets built and what does not? |
| `disc-reviewer-walkthrough` | Sonnet 5, high | does every flow reach its end, every value with a source? |
| `disc-reviewer-acceptance` | Sonnet 5, high | can a stranger judge each AC; does the set cover the promise? |
| 2× `disc-blind-reader` | Haiku 4.5, high | builds one story alone, in the documents' language |
| `disc-reviewer-ambiguity` | Sonnet 5, high | compares the two builds key by key |

## The front door

A demand arrives in conversation. An explicit request to open or
start a discovery opens it. When the intent is not clear, ask one
closed question: open a discovery, or just talk? Talking is welcome:
thinking out loud, weighing whether to build at all, breaking a theme
into pieces. Only an explicit "open it" creates state.

In the same breath, locate the user's starting point: how formed is
the demand, what have they already covered alone, what do they know
well and what not. Write it into the notes. A vague idea earns a
brainstorm before any fence closes around it; a formed spec goes
straight to the interview.

When decisions already exist in a document the user points to (an
inventory, an earlier workstream, a spec), read it before the first
question and write its decisions into the notes as **Confirmed**,
each with its source. Then interview only the gaps and the
contradictions. The document is the user's earlier word; code that
behaves otherwise is evidence of what exists today, never a decision.

On open:

1. Ask for Opus 5.5 at medium effort if the session is not on it.
2. Derive the slug: `YYYY-MM-DD-<short-kebab-name>`.
3. Create the workstream folder at the designs root (the consuming
   project's `CLAUDE.md` says where) with `.state.md` containing
   `stage: discovery`, and `blueprint/workstream.json` (slug, title,
   the user's language, `stage: discovery`).
4. Create `00-discovery/notes.md` from
   [templates/notes.md](templates/notes.md) on the first turn, and
   write to it every turn. A dead session loses nothing; resuming is
   reading it.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                # stage: discovery
├── blueprint.html           # built by the blueprint builder (step 7); never edited by hand
├── blueprint/               # the data the blueprint is built from (schema: claude/blueprint/schema/discovery.md)
│   ├── workstream.json      # the conductor, at open
│   ├── prfaq.json           # disc-author-prfaq, kept in step with pr-faq.md
│   ├── stories.json         # disc-author-stories, kept in step with user-stories.md
│   ├── figures.json         # the conductor, optional: the flow in one picture
│   ├── review.json          # the conductor, after each round
│   └── report.json          # the conductor, at the close: the plain-language layer
├── rulings.md               # created at the first ruling (house rule)
└── 00-discovery/
    ├── notes.md             # the interview, written as it happens; kept
    ├── reviews.md           # the review-round audit: findings, rulings, for-the-design, dismissed
    ├── pr-faq.md            # the whole demand, narrated
    └── user-stories.md      # every story and AC that gets built
```

## Step 1 — the interview

The interview reduces the user's unknowns until the ones that would
change what gets built are gone. Four kinds of unknown, and a technique
for each. Use the names; the user knows them.

**Known knowns** are what the user brought. Write them into the notes
as said, in the user's words. Do not ask what the notes already
answer.

**Known unknowns** are what the user knows they have not decided.
Interview them one question at a time, in the order of how much
construction depends on each answer. Every question passes the razor
before it is asked: a wrong guess at its answer would change what gets
built (scope, data, behavior). A question whose every answer leads to
the same construction is not asked. When the user brings a solution
("add a CSV export"), ask why until you reach the business goal, then
stop; chasing further branches widens the scope this interview exists
to close.

**Unknown knowns** are what the user will recognize when they see it
and cannot describe first. Do not force them into prose: **brainstorm**.
Lay out approaches from cheapest to most ambitious, adjacent problems,
scope shapes; the user says which resonate. When the flow is clearer
as a picture than as prose, draw it once as mermaid in
`blueprint/figures.json`.

Screens are the design stage's. When the demand has a front, record
what the user sees (the data, where each value comes from), what they
can do, and where they go next, in words. Never the layout, the
components or the look.

**Unknown unknowns** are what the user has not considered. When the
demand enters territory the user does not command, run a **blindspot
pass** before asking anything: search (do not answer from memory), lay
out the dimensions that exist, what good looks like, how good it can
get, and the potholes; then collect the decision. A user deciding
inside a map they have seen decides once.

**References.** When words run out, ask for one: a product, a site, a
library, a folder of code. Source code is the best reference; stage 2
can read the code behind a screen, not only the screenshot. Record
what to look at and what the user liked about it.

Then, per flow, make behavior concrete:

- Start from a concrete business event and walk it step by step:
  click, message, state. At every step ask "and if...?": wrong input,
  empty state, repeated action, timeout, dependency down, actor
  without permission. Sweep who, what, when, where, how.
- At every step that shows the user a value, ask where it comes from.
  A number with no source is a step nobody can build.
- Infer to go faster: propose the behavior you believe is right ("I
  assume the expired invite stays visible as expired; confirm?").
  Confirmed on the spot, it is a fact. Not discussed, it goes to the
  notes' Inferred block. Never inferred silently.
- Anchor on the concrete. For something that already happens, ask
  about the last real case. For something new, walk a scenario ("the
  first customer lands on this tomorrow").
- Close the fence: In and Out, nothing in limbo. Out has two kinds,
  both named: not building (with the reason) and future direction.
  Ask the evolution question ("how do you imagine this evolving?")
  and say what it is for: none of it gets built now; it tells stage 2
  where to leave room.
- Name the bets: what would have to be true for this to work. Check
  each one you can check (search, a document, the user's knowledge)
  and record the result. An unchecked bet is written as unchecked.

**Restate before closing a theme.** Your rewrite of the user's words,
confirmed by the user, is what goes into the Confirmed block. At
decision points offer closed options through the question tool.

Keep the coverage map in the notes current. It is an instrument: it
tells you where the unknowns are. It is not the goal: a question is
asked because a wrong guess would change the build, not because a
cell is not Clear.

**Self-check before every question.** Delete or rewrite a question
that: is two questions with one question mark; smuggles its own answer
(proposing openly is fine: "we could do X, which buys Y, want it in?");
asks a vague hypothetical instead of a concrete scenario; is already
answered in the notes; ladders "why" past the business goal.

> **Example of a question that passes** — "When a leader deactivates a
> person who still holds a phone, what happens to the phone: it stays
> with the person until someone collects it, or it goes back to stock
> now?" Two answers, two different builds (a derived "pending return"
> state, or none); the notes did not settle it; one question.
>
> **Example of a question that fails** — "Should the deactivation
> screen show a confirmation dialog?" Every answer builds the same
> thing at this altitude; the implementer decides it.

## Step 2 — the playback, story by story

When no question passes the razor, present the whole understanding
back in one structured pass: what it is, the flows, the fence, the
direction, the bets, the inferences. Then cut it into stories and
close the scope with the user, one question per story, four stories
per call of the question tool, in the shape the house rules fix for
every question: the question text carries the context and asks one
clear thing; each option's label is the answer itself, and its
description is why that answer is an option. For a story, the
question text says what the story does, its behavior and bad paths in
one line each, the inferences that landed in it, and the minimum you
propose. The options, the recommended one first and marked as
recommended:

- **Confirm** — as played back.
- **Reduce** — the story shrinks to the proposed minimum; what came
  out goes to its "Out of this story" list as direction.
- **Adjust** — the user says what changes.
- **Cut** — nothing of it gets built; it goes to "What we are NOT
  building", as direction.

> **Example** — header `S-005`, question: "S-005 Lifecycle: a person
> is active or inactive. Whoever has the person in scope marks
> inactive (date automatic, reason optional) and can reactivate;
> creating with an existing CPF is refused with a hint to reactivate.
> Proposed minimum: exactly that. Out of the minimum: cancel/renew as
> a cycle, transfer between subleaders. Inferred here: inactive
> people stay in the tree, greyed. What do you want built?"
> Options: label "Reduce to the minimum" / description "the cycle and
> the transfer have no story asking for them yet; they stay as
> direction" (recommended) · "Confirm the whole story" / "the cycle
> and the transfer get built now, as written" · "Adjust" / "you say
> what changes" · "Cut" / "nothing of this gets built; it goes to
> What we are NOT building".

An adjusted story is asked again once the change is written. Each
inference is confirmed (it becomes a fact) or rejected in the same
pass. Write the result into the notes' **Stories** block (id, name,
the ruling, the user's words) and each ruling into `rulings.md`
(house rule). What leaves this step is only what gets built.

## Step 3 — write

Two `Agent` dispatches in the same message, in parallel:
**`disc-author-prfaq`** and **`disc-author-stories`**, each with the
path to `notes.md`, its template, the slug, the language of the
documents (the user's), and the blueprint schema
(`${CLAUDE_SKILL_DIR}/../../blueprint/schema/discovery.md`). Each author
writes from the notes only, and writes its blueprint JSON
(`blueprint/prfaq.json`, `blueprint/stories.json`) in the same pass:
the same content, in the shape the shell reads, kept in step through
every later fix. Both briefs include, verbatim:

> Where the notes are ambiguous, write the reading their wording most
> directly supports, list that assumption in the Inferred list, and do
> not write for the other readings as well.

When both return, read the two files together. Check that every
confirmed story is written and no other, that every Confirmed fact is
an AC, that the PR-FAQ's "What we are NOT building" matches the notes'
Out blocks and the cut stories, and that the two JSON files match
their documents. Anything missing goes back to the author of that
file in one message before the review starts. What an author had to
guess sits in its Inferred list; you ask the user about each one with
the decisions of step 5.

## Step 4 — the review round

Autonomous mode. Run the `discovery-review` workflow by
`scriptPath` (never by name):
`${CLAUDE_SKILL_DIR}/../../workflows/discovery-review.js`, with
`discoveryDir`, `round`, `language` (the documents'), the stories
file's vocabulary block, and `stories`: one `{id, text}`
per story block, split at every `## S-` heading. Scripts cannot read
files; you pass the text.

The round runs whole every time: the document lenses in parallel with
the per-story blind reads. Every reviewer answers under the
reviewer contract (`docs/standards/reviewer-contract.md` in the
pipeline repo). The
workflow returns the findings with the referees' verdicts and the
lens results; it rules nothing. A round in which every story came
back unread is **invalid**: the workflow says so, and you fix the
cause (the readers' output, the keys) and run it again before
judging anything.

## Step 5 — judge, then ask

You are the judge. The ruler is
[references/judging.md](references/judging.md): read it whole the
first time, and rule every finding by it, in `reviews.md`, before
anything else happens. Per finding: sustained, deferred, dismissed or
for-the-design, the owner (author or user) on a sustained one, and the
reason with the sentence that decides it. Merge first: findings whose
fix is the same edit, seen by several lenses, are one finding with
one ruling.

**Owner `author`.** Wording, structure, a value the documents already
imply, an alignment between the two files: send them to the author of
the file in one apply batch each, applied without asking the user.
The author's report carries the propagation table and the final
lines; a fix without pasted lines is not done, send it back. There is
no veto question: the user reads the blueprint at the close and
reports there whatever he wants changed.

**Owner `user`.** Product behavior, scope, cost, personal data, a
confirmed fact contested, a sentence that admits two readings that
are two products, and every entry of the authors' Inferred lists
(confirm, and the author rewrites it as fact; or reject, and the
author rewrites the sentence). Group them **by decision**: several findings that
resolve by the same choice are one question. Ask through the question
tool, one question per decision, four per call, in the house shape:
the question text carries the context (the lens, the quote, the gap,
why it matters) and asks one clear thing; the options are the
possible decisions, your recommendation first and marked as yours,
each with its label as the decision and its description as what that
decision costs or buys. Every answer is a ruling line in `rulings.md`
as it happens; a pattern across answers is a line in `taste-notes.md`.

**For the design.** A finding whose answer is a mechanism the design
stage decides (a lock, a retry policy, an HTTP status, a storage
shape) is not asked and not dropped: it goes to the "For the design"
list of `reviews.md`, which stage 2 reads at its macro shape.

**Dismissed** findings die with the sentence that forecloses them, in
`reviews.md`. They are visible in the blueprint's review block.

A user ruling that changes a story materially is confirmed once more
in step 2's shape, after the author applied it.

## Step 6 — iterate

The round is cheap (Sonnet and Haiku), so it runs again after every
round that changed text, whole. Three rounds are the ceiling. After
each round's rulings are applied, ask the user one question: run
another round, or close with what is left; say what the round found
(findings, sustained, what changed) in the question. The third round
is never followed by a fourth. What is still sustained when the user
closes goes to the blueprint's review block as residue, with your
reasons, and he decides at the approval.

## Step 7 — close

The blueprint is built, never edited (house rule). Write the two
files that are yours: `blueprint/review.json` (the rounds, your
validation, the user's decisions, the author fixes, the for-the-design
list, the dismissed with their sentence, the residue; from `reviews.md`
and `rulings.md`) and `blueprint/report.json`, the plain-language
layer the tab shows first: one sentence, three things to know, the
flow in verbs, one sentence per story, one per decision the user took,
and a short paragraph for what stays out, the bets, the inferred and
the review. Write it for the newcomer on the team: technical but new,
familiar words, a role for each thing, no code. Check the authors'
`prfaq.json` and `stories.json` are in step with the final documents.
Then:

```
node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream-dir>
```

The build validates every file against the schema
(`${CLAUDE_SKILL_DIR}/../../blueprint/schema/discovery.md`) and
refuses with the field named; fix the data, never the HTML. Publish `blueprint.html`,
keep the same file path at every later stage, and record the owning
account beside the URL in `.state.md`.

Present the URL and ask for approval. Approval is explicit; silence or
a loose "looks good" does not close the stage. The user reads the
blueprint and sends adjustments one at a time: note each one in a
visible list and dispatch the authors only when he says "apply"; never
between two adjustments. After the batch, run step 4 once more if the
text changed materially, and ask again. On approval: `.state.md` to
`stage: design`, commit the workstream folder (push only with the
user's explicit approval), and suggest `/clear` before stage 2 (house
rule). The close commit is the last act, after he says there is
nothing more. On rejection: the reasons reopen the interview.

## How to write, in every file and every question

Say what you mean. Mannered prose substitutes metaphor and flourish
for direct statement: "a dial worth turning" for "a parameter worth
varying". It makes the reader work so the writer can perform, and it
is imprecise, because a metaphor drags in connotations you did not
choose. When a literal phrase exists, use it. One idea per sentence.
Concrete values. The user's words, in quotation marks, where they
decide something or describe a taste.

Use lists and tables where the content has parallel items (stories,
findings, options). Keep the interview itself in prose. Every agent
named in a message carries its model and effort in parentheses.

## Files

- **Permanent:** `notes.md`, `pr-faq.md`,
  `user-stories.md`, `reviews.md`, `rulings.md`, `taste-notes.md`,
  `blueprint/*.json`, `blueprint.html`, `.state.md`.

## Resuming

Everything is in files. Read `.state.md`, then `notes.md` (its
coverage map and Open list say where the interview stopped), then the
documents and `reviews.md` if they exist. Continue from the first
step whose output is missing. Never from memory of a previous session.
