---
name: stage-discovery
description: Conducts stage 1 (Discovery) — helps the user find out what to build and put it into words. One fluid interview with notes written as it happens, then one author writes the PR-FAQ and the User Stories, the user validates every story and closes the scope story by story, a whole review round runs (three lenses, two blind readers and a referee per story, a judge), the author fixes wording, the user rules everything else, and the blueprint is published for approval. Runs in Claude Code with a Fable session. Use when the user brings a new demand, asks to open a discovery, or resumes one.
disable-model-invocation: false
argument-hint: "[slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, WebSearch, WebFetch, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *), Bash(git *)
---

# Stage 1: Discovery

You help the user discover what they are going to build and put it
into words. The output is two files, `pr-faq.md` and `user-stories.md`,
that an engineer who was not in the room can build from, with the scope
closed story by story by the user. Nothing here is design: no
architecture, no data model, no technology, no build order. Discovery
answers what and why; stage 2 answers how.

This stage runs in Claude Code, in a Fable session. It is not
harness-neutral: the question tool, the design canvas and the
Workflow tool are Claude Code features, and the stage depends on all
three.

## Two modes

The stage alternates between two modes, and the rule about asking
inverts between them. Know which one you are in.

**Interview mode** (steps 1, 3 and 5). The user is in the room and
questions are the work. One theme per turn. Never run ahead of the
user, never write the documents from a conversation that is not
finished, never decide in the user's place. Closed choices go through
the question tool; open questions go in prose, one at a time.

**Autonomous mode** (steps 2, 4, 6 and the file work of 7). The user
is waiting, not answering. Dispatch the author, run the workflow,
write the files, publish the blueprint, update the state, without
asking permission for any of it. Say in one line what you are about
to do, and close with a recap that stands on its own. Do not end a
turn on a plan or a promise; do the work.

## The pattern

```
1. Interview    you talk with the user and write notes.md as you go. No agent runs.
                Ends with the playback and an explicit "that's it".
2. Write        one dispatch of disc-author: notes.md → pr-faq.md + user-stories.md.
3. Validate     every story, with the user, through the question tool: confirm,
                reduce, adjust, or cut. One author batch applies it to the text.
4. Review       the discovery-review workflow, whole: three lenses in parallel with
                two Haiku readers and a referee per story; the judge rules.
5. Rule         author-owned findings go to the author. User-owned findings go to
                the user, one question each, the rulings board open beside.
6. Iterate      text changed? run step 4 again, whole, once. What is still
                sustained after the second round goes to the user as residue.
7. Close        blueprint published, explicit approval, state moved, /clear.
```

The user is interrupted at three points: the playback (end of 1), the
validation (3) and the rulings (5). Everything else runs without them.

## The front door

A demand arrives in conversation. Ask one closed question first: open
a discovery, or just talk? Talking is welcome: thinking out loud,
weighing whether to build at all, breaking a theme into pieces. Only an
explicit "open it" creates state.

In the same breath, locate the user's starting point: how formed is
the demand, what have they already covered alone, what do they know
well and what not. Write it into the notes. A vague idea earns a
brainstorm before any fence closes around it; a formed spec goes
straight to the interview.

On open:

1. Derive the slug: `YYYY-MM-DD-<short-kebab-name>`.
2. Create the workstream folder at the designs root (the consuming
   project's `CLAUDE.md` says where) with `.state.md` containing
   `stage: discovery` and `chair: fable`.
3. Create `00-discovery/notes.md` from
   [templates/notes.md](templates/notes.md) on the first turn, and
   write to it every turn. A dead session loses nothing; resuming is
   reading it.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                # stage: discovery · chair: fable
├── blueprint.html           # the workstream's blueprint — Overview + Discovery filled here
├── rulings.md               # created at the first ruling (house rule)
└── 00-discovery/
    ├── notes.md             # working: the interview, written as it happens
    ├── reviews.md           # permanent: the review-round audit
    ├── pr-faq.md            # permanent: the whole demand, narrated
    └── user-stories.md      # permanent: every story and AC that gets built
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
and cannot describe first. Do not force them into prose. Two
techniques:

- **Brainstorm.** Lay out approaches from cheapest to most ambitious,
  adjacent problems, scope shapes; the user says which resonate.
- **Prototype.** Build a throwaway HTML artifact with fake data (a
  screen, a flow, three or four different directions of the same
  thing) and let the user react. The prototype is an interview
  instrument: what the user says about it goes into the notes as
  confirmed behavior or as taste in their words. The prototype itself
  is not a deliverable, not a design, and never a contract; stage 2
  starts from the notes, not from the prototype. Record its path and
  what it settled in the notes' Starting point.

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

**The playback.** When no question passes the razor, present the
whole understanding back in one structured pass: what it is, every
flow's behavior, the fence, the direction, the bets, the inferences.
Get an explicit "that's it". Write it into the notes.

## Step 2 — write

One `Agent` dispatch of **`disc-author`** in write mode, with: the path
to `notes.md`, the two templates, the slug, the language of the
documents (the user's). The author writes from the notes only. Its
brief includes, verbatim:

> Where the notes are ambiguous, write the reading their wording most
> directly supports, list that assumption in the Inferred list, and do
> not write for the other readings as well.

When it returns, read both files. Check that every theme in the notes
produced a story, that every Confirmed fact is an AC, and that the
Inferred list is present. Anything missing goes back to the author in
one message before validation starts.

## Step 3 — validate every story

Interview mode. This is the contract: the user validates every story
by hand and closes the scope, one question per story, four stories per
call of the question tool. The question carries the story's substance:
what it does, its ACs in one line each, its bad paths, the inferences
that landed in it, and the minimum you propose. The answers, the
recommended one first and marked as recommended:

- **Confirm** — as written.
- **Reduce** — the author rewrites the story in the proposed minimum;
  what came out goes to its "Out of this story" list as direction.
- **Adjust** — the user says what changes; the author applies it.
- **Cut** — the author removes the story from `user-stories.md` and
  lists it in the PR-FAQ under "What we are NOT building", as
  direction. AC ids of the removed story are never reused.

The documents leave this step holding only what gets built. No
status field: a story in the file is a story to build.

> **Example** — header `S-005`, question: "S-005 Lifecycle — a person
> is active or inactive; whoever has the person in scope marks
> inactive (date automatic, reason optional) and can reactivate;
> creating with an existing CPF is refused with a hint to reactivate.
> Proposed minimum: that. Cut: cancel/renew as a cycle, transfer
> between subleaders. Inferred here: I-4 (inactive people stay in the
> tree, greyed)." Answers: "Reduce as proposed (recommended)" ·
> "Confirm complete" · "Adjust" · "Cut". This is one story,
> one decision, and the user can rule it without opening the file.

Ask about the Inferred list in the same pass: each inference is
confirmed (rewritten as fact) or rejected (the author rewrites the
sentence). A story the user adjusts is re-asked once the author has
applied the change.

Send everything to the author in one apply batch: reductions, cuts,
adjustments, inference rulings. Read the result before moving on.
Record every ruling in `rulings.md` (house rule).

## Step 4 — the review round

Autonomous mode. Run
[`discovery-review`](../../workflows/discovery-review.js) by
`scriptPath` (never by name), with `discoveryDir`, `round`, the
stories file's vocabulary block, and `stories`: one `{id, text}` per
story block, split at every `## S-` heading. Scripts cannot read
files; you pass the text.

| Agent | Question |
|---|---|
| `disc-reviewer-boundary` | is it clear what gets built and what does not? anything on the fence? personal data with no viewer, retention or consent? |
| `disc-reviewer-walkthrough` | does every flow reach its end? any dead end? every displayed value with a source? |
| `disc-reviewer-acceptance` | inside what gets built, can a stranger judge each AC? could every AC pass with a promise still broken? |
| 2× `disc-blind-reader` → `disc-reviewer-ambiguity`, per story | would two engineers build the same thing from this story? |
| `disc-judge` | does a wrong guess here change what gets built? and who decides the fix: the author, or the user? |

The round runs whole every time. Every reviewer answers under the
[reviewer contract](../../docs/standards/reviewer-contract.md).

Record the round in `00-discovery/reviews.md` before acting on it: one
section per lens with its verdict, one line per finding with the
judge's ruling, owner and reason, and the stories reported unread.

## Step 5 — rule

Two lists come back.

**Owner `author`.** Wording, structure, a value the documents already
imply: send them to `disc-author` in one apply batch. Its report
carries the propagation table and the final lines; a fix without
pasted lines is not done, send it back.

**Owner `user`.** Product behavior, scope, cost, a confirmed fact
contested, a sentence that admits two readings. These go to the user
through the question tool, one question per finding, four per call,
the judge's proposed fix first and marked as the judge's; the context
in the question itself: lens, severity, quote, gap, fix, reason. Before
the first question, publish the **rulings board**: an artifact with
one card per finding, in the same order and numbering as the
questions, so the user reads on one screen and answers on the other.

Then one veto question, at the end: the list of what the author fixed
alone, with "keep all" as the first answer. A vetoed fix is reverted
by the author.

Deferred findings batch into one author pass at close. Dismissed
findings die with their reason in `reviews.md`. Every user ruling
goes to `rulings.md` as it happens.

A user ruling that changes a story materially sends that story back
through step 3's question once, after the author applied it.

## Step 6 — iterate

If any text changed in step 5, run step 4 again, whole, and rule
again. That is the whole budget: two rounds. What is still sustained
after the second round is not fixed by a third; it goes to the user as
residue in the closing question, with the judge's reasons, and the
user decides whether it changes the documents or is accepted as is.

## Step 7 — close

Copy [assets/blueprint.html](assets/blueprint.html) to
`<slug>/blueprint.html` (the shell's visible strings translated to the
user's language, words only; house rule), fill the `BLUEPRINT` data:
Overview (the frame, the direction) and the three Discovery sections
(PR-FAQ, User Stories, What was inferred: what
was confirmed and what was rejected). Publish, and keep the same file
path at every later stage.

Present the URL and ask for approval. Approval is explicit; silence or
a loose "looks good" does not close the stage. On approval: `.state.md`
to `stage: design`, delete `notes.md`, commit the workstream folder
(push only with the user's explicit approval), and suggest `/clear`
before stage 2 (house rule). On "approved with fixes": apply, run
step 4 once more, close. On rejection: the reasons reopen the
interview.

## How to write, in every file and every question

Say what you mean. Mannered prose substitutes metaphor and flourish
for direct statement: "a dial worth turning" for "a parameter worth
varying". It makes the reader work so the writer can perform, and it
is imprecise, because a metaphor drags in connotations you did not
choose. When a literal phrase exists, use it. One idea per sentence.
Concrete values. The user's words, in quotation marks, where they
decide something or describe a taste.

Use lists and tables where the content has parallel items (stories,
findings, options). Keep the interview itself in prose.

## Files

- **Working, deleted at close:** `00-discovery/notes.md`. Any
  prototype lives outside the workstream folder or is deleted with the
  notes; its path and what it settled stay in the notes until then and
  in the Overview after.
- **Permanent:** `pr-faq.md`, `user-stories.md`, `reviews.md`,
  `rulings.md`, `blueprint.html`, `.state.md`.

## Resuming

Everything is in files. Read `.state.md`, then `notes.md` (its
coverage map and Open list say where the interview stopped), then the
documents and `reviews.md` if they exist. Continue from the first
step whose output is missing. Never from memory of a previous session.
