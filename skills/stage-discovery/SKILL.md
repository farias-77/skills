---
name: stage-discovery
description: Conducts stage 1 (Discovery) of the pipeline — the front door for new demands. Interviews the founder turn by turn until scope is perfectly understood (every coverage category Clear, no open questions), then writes the PR-FAQ and User Stories from the interview notes — inferring is allowed, silent inferring is not — runs the four clarity reviewers with an audited round, and publishes the workstream blueprint for approval. Use when the user brings a new demand ("we have a demand"), asks to open a discovery, or an in-progress discovery needs resuming.
disable-model-invocation: false
argument-hint: "[slug]"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rm *)
---

# Stage 1: Discovery

The engineering team interviewing the product owner: at the end of this
stage, everything that needs to be built exists **in files** — a PR-FAQ and
User Stories with no nuance left to interpretation — and four independent
reviewers have failed to find a hole in them. Nothing here is design: no
architecture, no data model, no technology. Discovery answers *what* and
*why*; stage 2 answers *how*.

**The one rule everything else serves:** the interview ends when you can
write both documents **without silently inventing anything**. Inferring is
allowed — often good: it makes answering cheap — but every inference is
**registered in the Inferred list** and reviewed by the founder. The sin is
never the assumption; it is the assumption nobody can audit.

## The front door

A new demand arrives in conversation. Before anything else, ask (one closed
question): **open a discovery, or just talk?** The founder may want to
think out loud, organize the ideas, weigh whether it is worth building at
all, or break a big theme into pieces before committing to any of them —
all of that is conversation, and conversation is welcome here. Only an
explicit "open it" creates state.

On open:

1. Derive the slug: `YYYY-MM-DD-<short-kebab-name>`.
2. Create the workstream folder at the workspace's designs root (the
   consuming project's `CLAUDE.md` says where designs live) and the state
   file: `designs-root/<slug>/.state.md` with `wave: (pending cut)` and
   `stage: discovery`.
3. Start `notes.md` at the workstream root **on the first turn** — the
   interview notes are written as the conversation happens, so a dead
   session loses nothing and resume is just re-reading them. When the wave
   cut is approved, the notes move into wave 1's `00-discovery/`. Notes
   are a working file: deleted when the stage closes (see Lifecycle).
4. **Create the workstream's Project in Linear — via the Linear MCP, with
   NO issues.** The Project is the founder's portfolio view of the
   workstream (name = the workstream title, description = the one-line
   frame); issues never live here — they are born in GitHub at planning.
   If the Linear MCP is not configured in this workspace, say so once and
   continue — a tracker mirror never blocks a stage.

## Breaking into waves

A large demand does not enter whole. Propose a cut into **waves**:

- **Wave 1 is the MVP — the smallest thing that is still useful end to
  end.** A user starts at the beginning and reaches the end, however
  narrow the path, and gets real value from it.
- **Each next wave builds on the previous one**, named and with one line
  of scope — not a "future ideas" graveyard: wave 2 starts as soon as
  wave 1 ships.
- **Ask the evolution question**: *"how do you imagine this product
  evolving?"* — things that will NOT enter this workstream and are not for
  now, but show where the product is heading. Record them in the wave map
  as direction. Knowing the destination is what lets the design build
  wave 1 extensible in the right places instead of guessing.

The founder approves the cut before the interview goes deep. When it is
approved, **all wave folders are born at once**, named
`wNN-<what-it-delivers>` (order prefix + a 2-4 word kebab slug of what the
wave ships):

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                      # wave: w01-invite-by-email · stage: discovery
├── w01-invite-by-email/           # this wave — the full pipeline runs here
│   ├── blueprint.html             # one blueprint PER WAVE (each wave runs all stages)
│   └── 00-discovery/              # stage folders, numbered in pipeline order
├── w02-resend-and-revoke/
│   └── README.md                  # one page: what this wave builds, written NOW
└── w03-bulk-csv-invites/
    └── README.md
```

Each future wave starts with only a `README.md` — one page, written during
the cut, describing what that wave delivers and its rough scope. **The
README is the seed of that wave's discovery**: when a wave closes (stage
7), the closure suggests opening the next one on the spot, and its
discovery starts from the README plus what the previous wave shipped —
next waves are a queue that moves, not a parking lot.

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
- **Ladder up, then stop**: when the founder brings a solution ("add a
  CSV export button"), ask why until you reach the business goal behind it
  ("accountants re-type this data every month") — then **stop laddering**.
  Chasing every "why" branch expands scope; this interview exists to close
  it.
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
  depend on how the founder happens to narrate.
- **Infer to go faster** — propose the behavior you believe is right
  ("I assume the expired invite stays visible as `expired` — confirm?")
  instead of asking everything open. Confirmed on the spot, it is fact;
  not discussed, it goes to the Inferred list. Never inferred silently.

### 3. Delimit

Close the fence. Two explicit lists — **In** and **Out** — and nothing in
limbo. Out has two kinds, both named: **not building** (with the reason)
and **next wave / next workstream** (with the wave it lands in). "Bulk
invites: out, wave 2" is a decision; silence about bulk invites is a bug
this stage exists to prevent. Predictable follow-up requests get named and
classified now.

### 4. Lock acceptance

For each story, acceptance criteria that a stranger could judge without
asking anyone. Before closing any item, **restate what you understood and
ask for confirmation** — your rewrite of the founder's words, confirmed by
the founder, is the contract. At decision points, offer **closed options**
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
| Boundary (In and Out lists closed; evolution mapped) | Clear / Partial / Missing |

Rules:

- A question may only target a **Partial or Missing** cell — if every cell
  is Clear, you have nothing to ask. This is what "no useless questions"
  means mechanically: never ask what the notes already answer.
- **At most 5 questions per round**, highest-impact cells first.
- When every cell is Clear, do the **playback — always, before
  finalizing**: present the complete understanding back to the founder in
  one structured pass (what it is, the waves, every flow's behavior, the
  fence, the inferences so far) and get an explicit "that's it". The
  playback is where wrong assumptions die cheap.
- Then the closing question: **"is there anything I should be asking that
  I haven't?"** The founder's answer to that question has revealed a
  missing item often enough that no checklist replaces it.

## Interviewer self-check (every turn, before sending)

Delete or rewrite any question that:

1. Is two questions wearing one question mark.
2. Is a leading question — one that smuggles in its own answer ("don't you
   think X would be better?"). Proposing openly is welcome — we are
   building the company, suggestions are part of the job: "we could do X,
   which buys us Y — want it in?" is a proposal the founder can refuse.
   The sin is the question that only accepts one answer.
3. Asks about a vague hypothetical instead of a concrete scenario.
4. Is already answered in the notes.
5. Ladders "why" past the business goal you already reached.

## Writing the documents

Write only when the coverage map is all Clear and the playback got its
explicit "that's it". Two files inside the current wave's folder, from the
templates — stage folders are numbered so they sort in pipeline order:

- `wNN-<wave>/00-discovery/pr-faq.md` —
  [templates/pr-faq.md](templates/pr-faq.md).
  The product narrated: press release, external FAQ, internal FAQ, what we
  are NOT building, and what would have to be true.
- `wNN-<wave>/00-discovery/user-stories.md` —
  [templates/user-stories.md](templates/user-stories.md). Stories with IDs
  (`S-001`, `S-002`, ...), acceptance criteria in EARS form (`WHEN
  <condition>, the system SHALL <behavior>`) with IDs
  (`<SLUG>-S-001-AC-1`), and bad paths enumerated per story. Those AC IDs
  are referenced by every later stage, through to the e2e round.

**Nothing invented silently.** While writing, any fact you catch yourself
assuming goes into the **Inferred** list with your best guess marked as a
guess — the founder confirms each one explicitly at the checkpoint. An
empty Inferred list after honest writing is rare; treat suspiciously.

## The review round

The round is **audited**: it exists in `00-discovery/reviews.md`, and the
stage physically cannot close without that file complete. This is what
makes skipping a reviewer impossible — the conductor has to do something
with every review, so ignoring one is not a behavior that can happen
quietly.

1. Dispatch **all reviewers of the round together, always** — never a
   subset, never "just the one that failed last time" (a fix for one lens
   regresses another; only the full round catches it). The round is:

   | Agent | Validates |
   |---|---|
   | `discovery-walkthrough` | every covered case runs end to end in behavior |
   | `discovery-acceptance` | the delivery as a whole is judgeable from the ACs |
   | `discovery-boundary` | In and Out are closed; nothing in limbo |
   | 2× blind readers → `discovery-ambiguity` | one reading only — two independent engineers build the same thing |

   The ambiguity lens runs as a pipeline: dispatch **two blind readers**
   (general-purpose agents, prompt in
   [discovery-ambiguity's reader brief](../../agents/discovery-ambiguity.md))
   in parallel with the other lenses; when both return, dispatch
   `discovery-ambiguity` with the two builds attached to judge the
   divergences.

2. Record the round in `reviews.md` **before acting on it**: one section
   per reviewer with its verdict, and one line per finding.
3. Give **every finding a disposition**, written next to it in
   `reviews.md`: `fixed` (document changed), `to-founder` (it is a real
   question — goes into the next interview round's agenda), or `rejected`
   (with the reason, and rejecting a blocker requires the founder's
   explicit sign-off). No finding stays undispositioned.
4. Fix the documents, take the `to-founder` items to the founder, then run
   the **entire round again** — all reviewers, fresh. Repeat until a round
   comes back with **zero blockers**.

Reviewer contract: verdict (`pass` / `pass with fixes` / `fail`) +
findings with severity (`blocker` / `fix` / `detail`); zero findings is
valid only alongside a "Verified" list proving coverage — a zero-finding
report without the enumeration is invalid and gets re-dispatched.

## The blueprint

One artifact **per wave** (each wave runs the whole pipeline), one URL
from its discovery to its closure. Copy
[assets/blueprint.html](assets/blueprint.html) to
`wNN-<wave>/blueprint.html`, fill only the `BLUEPRINT` data object (never
the shell), publish, and keep republishing the same file path at every
later stage — the stage tabs light up as the wave advances. Discovery
fills the **Overview** (the frame, the wave map — which shows ALL waves,
so any wave's blueprint locates itself in the whole) and the three
**Discovery** sections: PR-FAQ, User Stories, What was inferred.

## Closing

Present the blueprint URL and ask for review. Approval is explicit —
silence, or a loose "looks good" without reading, does not close the
stage. On approval: mark `.state.md` `stage: design`, move the Linear
Project to its design status (if the MCP is available), commit the
workstream folder, and hand off to `stage-design`. On "approved with
fixes": apply, re-run the review round, close. On rejection: the reasons
re-open the interview.

## Lifecycle of the files

Working files die with the stage; the record survives it.

- **Working (deleted at stage close):** `notes.md`,
  `00-discovery/reviews.md`, the blind readers' outputs.
- **Permanent:** the wave's blueprint (the artifact that accumulates the
  wave, stage by stage), `00-discovery/pr-faq.md`,
  `00-discovery/user-stories.md`, the future waves' READMEs, and
  `.state.md`.

## Resuming

Everything lives in files: `notes.md` (with the coverage map), the two
documents, `reviews.md`, `.state.md`. To resume, read them and continue
from the first non-Clear cell — never from memory of a previous session.
