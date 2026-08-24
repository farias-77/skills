---
name: stage-discovery
description: Conducts stage 1 (Discovery) of the pipeline — the front door for new demands. Interviews the user turn by turn until scope is perfectly understood (every coverage category Clear, no open questions), then writes ONE PR-FAQ and ONE User Stories document covering the whole demand — inferring is allowed, silent inferring is not — runs the audited review round as a workflow (three lenses plus two blind readers and their judge), and publishes the workstream blueprint for approval. Use when the user brings a new demand ("we have a demand"), asks to open a discovery, or an in-progress discovery needs resuming.
disable-model-invocation: false
argument-hint: "[slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *)
---

# Stage 1: Discovery

The engineering team interviewing the product owner: at the end of this
stage, everything that needs to be built exists **in files** — one PR-FAQ
and one User Stories document, covering the whole demand, with no nuance
left to interpretation — and four independent review lenses have failed
to find a hole in them. That pair is the package the demand's owner
reviews **once**: after approval, the pipeline does not come back for
more requirements. Nothing here is design: no architecture, no data
model, no technology, no build sequencing — everything about HOW and in
what order the thing gets built is engineering's problem, downstream.
Discovery answers *what* and *why*; stage 2 answers *how*.

**The one rule everything else serves:** the interview ends when you can
write both documents **without silently inventing anything**. Inferring is
allowed — often good: it makes answering cheap — but every inference is
**registered in the Inferred list** and reviewed by the user. The sin is
never the assumption; it is the assumption nobody can audit.

## The front door

A new demand arrives in conversation. Before anything else, ask (one closed
question): **open a discovery, or just talk?** The user may want to
think out loud, organize the ideas, weigh whether it is worth building at
all, or break a big theme into pieces before committing to any of them —
all of that is conversation, and conversation is welcome here. Only an
explicit "open it" creates state.

**Locate the user's starting point in the same breath**: how formed is
this demand? A vague idea earns exploration first — brainstorm
approaches, scope shapes, adjacent problems, cheapest-to-most-ambitious
— because closing a fence around an unexplored idea locks in the first
framing, not the best one. A formed spec goes straight to the interview.
Depth of interview is proportional to how much territory the user has
already covered on their own.

On open:

1. Derive the slug: `YYYY-MM-DD-<short-kebab-name>`.
2. Create the workstream folder at the workspace's designs root (the
   consuming project's `CLAUDE.md` says where designs live) and the state
   file: `designs-root/<slug>/.state.md` with `stage: discovery`.
3. Start `00-discovery/notes.md` **on the first turn** — the interview
   notes are written as the conversation happens, so a dead session loses
   nothing and resume is just re-reading them. Notes are a working file:
   deleted when the stage closes (see Lifecycle).
4. **Create the workstream's Project in Linear — via the Linear MCP, with
   NO issues.** The Project is the user's portfolio view of the
   workstream (name = the workstream title, description = the one-line
   frame); issues never live here — they are born in GitHub at planning.
   **Linear is the main tracking surface: the MCP missing is a halt** —
   ask for it to be set up and stop; no stage proceeds without it.

## What this stage produces

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                # stage: discovery
├── blueprint.html           # the workstream's blueprint — Overview + Discovery filled here
└── 00-discovery/
    ├── notes.md             # working: the interview, live, with the coverage map
    ├── reviews.md           # permanent: the review-round audit
    ├── pr-faq.md            # permanent: the whole demand, narrated
    └── user-stories.md      # permanent: every story and AC of the whole demand
```

The two documents cover **everything that will be built** — the entire
demand, delimited in detail, reviewable in one sitting by someone who was
not in the interview. Two things must never blur into each other:

- **What will be built** — all of it lands in these two documents now,
  and all of it is commitment: nothing in them is a maybe.
- **Where the product is heading** — direction, not commitment. Captured
  by the evolution question (below), recorded so stage 2 designs the
  right things extensible, and explicitly NOT part of what these
  documents promise.

## The interview

Four movements as the backbone, in order — add movements when the demand
calls for more (the four are a floor, not a ceiling). One theme per turn,
never a wall of questions. Each movement has techniques that are known to
work; use them by name.

### 1. Frame

What is it, who is it for, what problem does it solve, what changes in the
world when it exists.

- Open with **context-free questions** — questions that do not presuppose
  the solution. Keep them concrete and few: this is not a coaching
  session, and open-ended wandering is the enemy of moving fast. Ask what
  shapes construction ("who suffers most from this today?", "what must be
  true a month after launch for this to have worked?") and move on.
- **Ladder up, then stop**: when the user brings a solution ("add a
  CSV export button"), ask why until you reach the business goal behind it
  ("accountants re-type this data every month") — then **stop laddering**.
  Chasing every "why" branch expands scope; this interview exists to close
  it.
- **Blindspot pass — teach before asking, when the user does not master
  the territory.** An answer given from ignorance sounds like a
  requirement but is a guess. When the demand enters a domain the user
  shows little command of, invert the interview for a moment: lay out
  the choice space — the dimensions that exist, what "good" looks like
  there, and the ceiling (*"do you know how good this can get?"*) —
  then collect the decision. A user deciding inside a map they have
  seen decides once; a user deciding blind re-decides in stage 4.
- **Ask for a reference when words run out.** Some requirements are
  "I'll know it when I see it" — do not force them into prose. Ask:
  *"is there something out there that already does this the way you
  want?"* — a product, a site, a competitor, a library. The reference
  goes into the notes and travels to stage 2, which can read the code
  behind it, not just the screenshot.
- **Anchor on the concrete.** When the demand touches something that
  already happens, ask about the real past case ("when did this last
  happen? what did you do?") — real behavior beats hypotheticals. When the
  demand is something NEW, being built to exist for the first time, there
  is no past to ask about: anchor on a concrete scenario instead ("first
  customer lands on this tomorrow — walk me through what they do"). Either
  way, never a question that suggests its own answer.

### 2. Walk through

Make behavior concrete. Never discuss requirements in the abstract.

- Start from a **concrete business event** ("a customer wants to invite a
  teammate") and simulate it step by step: click by click, message by
  message, state by state.
- At every step, probe **"and if...?"**: wrong input, empty state, repeat
  action, timeout, the dependency is down, the user lacks permission.
- Sweep **who / what / when / where / how** per flow, so coverage does not
  depend on how the user happens to narrate.
- **Infer to go faster** — propose the behavior you believe is right
  ("I assume the expired invite stays visible as `expired` — confirm?")
  instead of asking everything open. Confirmed on the spot, it is fact;
  not discussed, it goes to the Inferred list. Never inferred silently.

### 3. Delimit

Close the fence. Two explicit lists — **In** and **Out** — and nothing in
limbo. Out has two kinds, both named: **not building** (with the reason)
and **future direction** (not scheduled — see the evolution question).
"Bulk invites: not building, revisit after launch" is a decision; silence
about bulk invites is a bug this stage exists to prevent. Predictable
follow-up requests get named and classified now.

- **Ask the evolution question**: *"how do you imagine this product
  evolving?"* — and make its purpose explicit to the user when asking:
  **none of this gets built now**. The answers exist so we build today's
  scope already pointed in the direction the product is walking — they
  are recorded as **direction**, they never enter In, and they are what
  lets stage 2 design the right places extensible instead of guessing.

### 4. Lock acceptance

For each story, acceptance criteria that a stranger could judge without
asking anyone. Before closing any item, **restate what you understood and
ask for confirmation** — your rewrite of the user's words, confirmed by
the user, is the contract. At decision points, offer **closed options**
(use AskUserQuestion), not open text: choices close ambiguity, prose opens
it.

## The coverage map (when the interview ends)

Keep a table in `00-discovery/notes.md` — the interview's dashboard,
updated every turn:

| Category | State |
|---|---|
| Behavior (every flow, happy and bad paths) | Clear / Partial / Missing |
| Actors & permissions | Clear / Partial / Missing |
| Data the user sees and touches | Clear / Partial / Missing |
| Integrations & external dependencies | Clear / Partial / Missing |
| Edge cases (empty, limits, repeats, races) | Clear / Partial / Missing |
| Constraints (legal, cost, deadline, platform) | Clear / Partial / Missing |
| Terminology (every domain word defined) | Clear / Partial / Missing |
| Boundary (In and Out lists closed; direction mapped) | Clear / Partial / Missing |

Rules:

- A question may only target a **Partial or Missing** cell — if every cell
  is Clear, you have nothing to ask. This is what "no useless questions"
  means mechanically: never ask what the notes already answer.
- **At most 5 questions per round.** Priority is not vague "impact":
  the question goes first when a **wrong guess at its answer would
  change what gets built** — architecture, data, scope. A question
  whose any answer leads to the same construction can wait or die.
  (This is the same razor stage 3's judge uses to triage a cold
  reader's questions — the ruler is one, at both ends of the pipeline.)
- **A taste requirement closes in the user's words.** Nothing visual is
  built in this stage. When the demand carries taste ("premium",
  "playful", "clean"), record how the user says it should FEEL — their
  own words, plus the reference if one exists — and mark the cell Clear.
  Do not chase EARS-grade precision for feel: turning those words into
  pixels and validating them by the user's reaction is stage 2's job.
  What the screen DOES still closes here, fully.
- When every cell is Clear, do the **playback — always, before
  finalizing**: present the complete understanding back to the user in
  one structured pass (what it is, every flow's behavior, the fence, the
  direction, the inferences so far) and get an explicit "that's it". The
  playback is where wrong assumptions die cheap.

## Interviewer self-check (every turn, before sending)

Delete or rewrite any question that:

1. Is two questions wearing one question mark.
2. Is a leading question — one that smuggles in its own answer ("don't you
   think X would be better?"). Proposing openly is welcome — we are
   building the company, suggestions are part of the job: "we could do X,
   which buys us Y — want it in?" is a proposal the user can refuse.
   The sin is the question that only accepts one answer.
3. Asks about a vague hypothetical instead of a concrete scenario.
4. Is already answered in the notes.
5. Ladders "why" past the business goal you already reached.

## Writing the documents

Write only when the coverage map is all Clear and the playback got its
explicit "that's it". Two files, from the templates:

- `00-discovery/pr-faq.md` — [templates/pr-faq.md](templates/pr-faq.md).
  The product narrated: press release, external FAQ, internal FAQ, what we
  are NOT building, and what would have to be true.
- `00-discovery/user-stories.md` —
  [templates/user-stories.md](templates/user-stories.md). Stories with
  IDs (`S-001`, `S-002`, ...), acceptance criteria in EARS form —
  `WHEN <condition>, the system SHALL <behavior>` — with IDs
  (`<SLUG>-S-001-AC-1`), and bad paths enumerated per story. Those AC IDs
  are referenced by every later stage, through to the e2e round.

**Nothing invented silently.** While writing, any fact you catch yourself
assuming goes into the **Inferred** list with your best guess marked as a
guess — the user confirms each one explicitly at the checkpoint. An
empty Inferred list after honest writing is rare; treat suspiciously.

## The review round (a workflow, so it cannot be skipped)

Run [`discovery-review`](../../workflows/discovery-review.js) —
`Workflow({scriptPath: '<workflows-root>/discovery-review.js', args:
{discoveryDir, round}})` (invoke by
`scriptPath` pointing at the file under the consuming project's
workflows root — e.g. `.claude/workflows/` — never by `name`: the name
registry does not reliably carry these workflows; field-reported by
ops-tracking w2n3).
It is ONE invocation covering the whole round: the three document lenses
and the two blind readers run concurrently, and the ambiguity judge
closes with both builds in hand. **Every round is full — every lens,
every time**; the full re-run is the regression guard.

| Agent | Validates |
|---|---|
| `disc-reviewer-walkthrough` | every covered case runs end to end in behavior |
| `disc-reviewer-acceptance` | the delivery as a whole is judgeable from the ACs |
| `disc-reviewer-boundary` | In and Out are closed; nothing in limbo |
| 2× `disc-blind-reader` → `disc-reviewer-ambiguity` | one reading only — two independent engineers build the same thing |

The blind readers are **`disc-blind-reader`** agents (Sonnet) — a
standardized definition, never a prompt improvised by the conductor.
Each reads the two documents alone and commits to a concrete build;
`disc-reviewer-ambiguity` then judges the divergences between the two
builds — divergence is the ambiguity signal, suspicion is not.

The round is audited in `00-discovery/reviews.md`:

1. Record the round **before acting on it**: one section per reviewer
   with its verdict, and one line per finding.
2. Give **every finding a disposition**, written next to it:
   `fixed` (document changed), `to-user` (a real question — goes into
   the next interview round's agenda), or `rejected` (with the reason;
   rejecting a blocker requires the user's explicit sign-off). No
   finding stays undispositioned.
3. Fix the documents, take the `to-user` items to the user, then run
   the next round under the **exit rules** below.

### Exit rules — pre-registered, from round 1

The same protocol as stage 2 (`stage-design` §3), at this stage's
scale: the round is six agents over two documents, so there are no
delta rounds — what is capped is the loop, and deciding the exit
mid-review, tired, is what these rules exist to prevent.

- **A round returns blockers** → fix them, verify each one in the
  documents (the sentence that changed, not the intention), then run
  the closing round.
- **A round returns zero blockers** → the loop ends: the remaining
  `fix` items are applied in a mini-pass, verified the same way, and
  the review closes.
- **At most two full rounds** — the opening one and the closing one.
  The closing round closes the review when it returns zero
  blockers, or **≤1 blocker that is a loose wire in something the
  first round's fixes introduced** (applied as a mini-pass, verified
  in the documents). A third round requires the user's explicit
  say-so.
- **`detail` findings are never applied per round** — they batch into
  one sweep at close.
- **Simplify or remove:** when a finding shows a hole opened by a
  previous fix, the disposition is to simplify or remove that fix —
  never a third sentence patching the second.

Every lens answers under the house
[reviewer contract](../../docs/standards/reviewer-contract.md) — the
single source for verdict semantics, severities, verbatim proof, and the
Verified rule; the workflow re-dispatches lazy passes on its own.

## The blueprint

One artifact per workstream, one URL from discovery to closure. Copy
[assets/blueprint.html](assets/blueprint.html) to
`<slug>/blueprint.html`, fill only the `BLUEPRINT` data object (the
shell's visible strings are translated to the user's language if the
conversation is not in English — words only, never structure; house
rule in the repo's `CLAUDE.md`), publish, and keep republishing the
same file path at every later stage — the stage tabs light up as the
workstream advances.
Discovery fills the **Overview** (the frame, and the product direction
from the evolution question) and the three **Discovery** sections:
PR-FAQ, User Stories, What was inferred.

## Closing

Present the blueprint URL and ask for review. Approval is explicit —
silence, or a loose "looks good" without reading, does not close the
stage. On approval: mark `.state.md` `stage: design`, commit the
workstream folder — push only with the user's explicit approval — and
suggest `/clear` before stage 2 (house rule: stage transitions, in the
repo's `CLAUDE.md`). On "approved with fixes": apply, re-run the review
round, close. On rejection: the reasons re-open the interview. Moving
the Linear Project forward is **not this skill's job**: each stage moves
the Project to its own status when it actually starts — stage 2 will
move it when it opens.

## Lifecycle of the files

Working files die with the stage; the record survives it.

- **Working (deleted at stage close):** `00-discovery/notes.md`.
- **Permanent:** the workstream's blueprint (the artifact that
  accumulates the workstream, stage by stage), `00-discovery/pr-faq.md`,
  `00-discovery/user-stories.md`, `00-discovery/reviews.md` (the
  round audit — the dreaming reads what blocked here), and
  `.state.md`.

## Resuming

Everything lives in files: `notes.md` (with the coverage map), the two
documents, `reviews.md`, `.state.md`. To resume, read them and continue
from the first non-Clear cell — never from memory of a previous session.
