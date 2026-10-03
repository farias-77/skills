---
name: stage-design
description: Conducts stage 2 (Design) — takes the locked discovery (the mock the user approved, its journeys and stories) and arrives at the user with the whole design ready, right-sized part by part. Autonomous except one short call. Recon first (scouts, Sonnet 5.5 low; a researcher, Sonnet 5.5 medium, only where a premise is unconfirmed); then the design-tiers workflow — a breadboard and three architects in parallel (Opus 5.5 high), one per tier (lean, balanced, hardened), each covering every part with build hours, run cost and risks; the sizing judge (Opus 5.5 high) picks a tier per part on risk × reversibility × cost; an overengineering critic and a risk critic (Sonnet 5.5 high) attack the pick from opposite sides; the judge reconciles into sizing.md with the evolution path. Then the user's call: one short deck with the three tiers side by side and at most one question call of four, only on what is his. Then ten writers (Sonnet 5.5 high) in two waves (data-model and contracts fix the names), each document carrying the tier and evolution path of its parts, ui mapping the locked mock to the app and acceptance turning the journeys into test specs; review round 1 whole and round 2 delta, automatic, then stop — eleven lenses (six Opus 5.5 medium, five Sonnet 5.5 medium) reporting only correctness, coverage of the lock, contradictions and one-way doors, the sizing lens flagging any mechanism without a named requirement, plus blind readers per flow; the conductor judges; the stage report (video, slides, blueprint). Runs in Claude Code with an Opus 5.5 session at high effort. Use after a discovery is locked, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, Skill, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(rg *), Bash(git *), Bash(node *)
---

# Stage 2: Design

The lock comes in: the mock the user clicked and approved, its
journeys, its stories. The design comes out: how the system carries
that product, **at the size it needs**, with a written path for
growing each part when a number says so. The design covers the whole
demand; the cut into slices is stage 3's.

This stage has one enemy, and it is not a missing feature. Agents left
alone overengineer: a feature that should take ten minutes becomes a
day of hardening on top of hardening that adds nothing. The company is
a startup that ships fast and still wants a reliable service. So the
design is never one proposal. It is three, the most basic version that
is still reliable, a middle one, and a maximum-safety one, drawn for
every part, priced in hours and dollars, and then balanced: care where
a one-way door or a real risk sits, lean everywhere else. The user
sees the three side by side and the one final answer.

The shape of the system is given. The consuming project's engineering
doctrine (its `CLAUDE.md` says where) fixes where code runs, how
modules talk, the stack and the quality gates. The design applies it
and never reopens it; a demand the doctrine cannot hold is a question
for the user, marked **changes the doctrine**.

The session is the conductor, **Opus 5.5 at high effort**. It runs the
recon, writes the frame, runs the sizing, holds the call, dispatches
the writers, runs the review, judges every finding, and closes with the
stage report. It writes `notes.md`, `reviews.md`, `rulings.md`,
`taste-notes.md`, `telemetry.md` and the conductor's blueprint JSON.
Every other file is written by its agent, first draft to last fix: the
tiers by their architects, `sizing.md` by the judge, each document by
its writer. A finding is only fixed when its writer changed the file.

At the start of the stage, load the `pack-right-sizing` skill (the
Skill tool). Its rubric, floor and checklists are how you read
`sizing.md`, judge the critics' work and rule the review.

## The mode: autonomous, except his call

The user is in the loop once, at G3, for a short call: a deck and at
most one question call of four questions, only on what is his (cost,
scope, data format, contract shape, security posture, an irreversible
choice). Everything else runs without him: dispatch, run the
workflows, judge, write the audit, build the reports, update the
state, without asking permission for any of it. A decision of his
class that arises after the call is taken in his place,
conservatively (the option that keeps the lock, closes the floor and
stays reversible, at the smallest cost), marked `ruled: conductor` in
`rulings.md`, and listed at the close for his veto.

Every reply that dispatches or waits on an agent carries a status
table (agent · task · state), the state read from the harness, never
assumed. Say in one line what you are about to do, and close with a
recap that stands on its own. Do not end a turn on a plan or a
promise; do the work. Every reply in the terminal is built to be
followed at a glance: a table for parallel things, a flow in a code
block for a sequence, short topics for lists.

## The pattern

```
G0 Recon     plan-scout (Sonnet 5.5, low) per area the lock touches → recon/<area>.md;
             scout (Sonnet 5.5, low) per single question; design-research workflow
             (design-researcher, Sonnet 5.5, medium) only where a premise is unconfirmed
             → research/; you write the frame in notes.md: appetite in hours, no-gos
G1 Tiers  ┐  design-tiers workflow: architect (Opus 5.5, high) breadboard → three architects
G2 Sizing ┘  in parallel, lean · balanced · hardened → sizing-judge (Opus 5.5, high) picks per
             part → overengineering-critic + risk-critic (Sonnet 5.5, high) in parallel →
             the judge reconciles → sizing.md (final), tiers/critics.md
G3 His call  the deck (slides-scribe, Sonnet 5.5, high): the three tiers side by side, the
             pick, the doors, the evolution path; at most one question call of ≤ 4, only
             on what is his; his rulings → notes.md, rulings.md; sizing-judge amends sizing.md
G4 Documents design-writer (Sonnet 5.5, high) × 10 in two waves: data-model + contracts
             (the names), then the other eight; each with the tier and evolution path of
             its parts; ui maps the mock, acceptance turns the journeys into test specs
G5 Review    design-review workflow: round 1 whole, round 2 delta, both automatic, then stop.
             Eleven lenses + per flow two blind readers and a referee; you judge every
             finding; fixes and their propagation land within the round
G6 Report    the blueprint JSON, the build, then the stage report (video → slides →
             blueprint); his veto list; approval; state → plan; /clear
```

The user is interrupted at G3 and at the close of G6. Nothing else
waits for him.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor | Opus 5.5, high | the frame, the call, the answers to the writers, the judging, the close |
| `plan-scout` × 1 per area | Sonnet 5.5, low | reads one area of the codebase the lock touches, writes `recon/<area>.md`: what exists today and the golden path of each kind of code there, every line with where it was read |
| `scout` × N | Sonnet 5.5, low | one question each, about the doctrine, other fronts or a past record: quotes with `path:line`, never conclusions |
| `design-researcher` | Sonnet 5.5, medium | the design-research workflow, one per unconfirmed premise about an external tool: its docs, limits, prices, failure behavior |
| `architect` × 4 | Opus 5.5, high | the breadboard, then one tier each, in parallel and blind to each other |
| `sizing-judge` | Opus 5.5, high | the pick per part, the reconcile, the amend after the call; writes `sizing.md` |
| `overengineering-critic` | Sonnet 5.5, high | attacks the pick: what here has no named requirement? |
| `risk-critic` | Sonnet 5.5, high | attacks the pick: what failure here would hurt a user or the data? |
| `slides-scribe` | Sonnet 5.5, high | the deck of the call, and the slides of the stage report |
| `design-writer` × 10 | Sonnet 5.5, high | one document each, in two waves; asks, never decides |
| `design-reviewer-{data, code, infra, security, contracts}` | Opus 5.5, medium | five lenses that judge mechanism, each reads everything |
| `design-reviewer-sizing` | Opus 5.5, medium | every mechanism has a `req:`, every document builds its pick |
| `design-reviewer-{alarms, coverage, facts, ui, consistency}` | Sonnet 5.5, medium | five lenses that check against a source: the ops pack, the lock, the repo and research, the mock, the other documents |
| `design-blind-reader` × 2 per flow | Sonnet 5.5, low | builds one flow alone, in the documents' language |
| `design-reviewer-ambiguity` | Sonnet 5.5, low | compares the two builds key by key |
| `video-scribe` | Sonnet 5.5, high | the stage report's video |

## Preconditions

`.state.md` says `stage: design`; `00-discovery/` has the lock
(`prototype/` with its version and `frames/`, `journeys/*.yaml`,
`stories.md`, `pr-faq.md`); `blueprint/` has the discovery JSON.
Missing: halt, back to stage 1.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: design
├── blueprint.html             # built, never edited (house rule)
├── blueprint/                 # the discovery JSON, plus:
│   └── design/                # <doc>.json × 10 (writers) · decisions.json · design-report.json · design-review.json (you)
├── report/design/             # the stage report: storyboard.json, video.mp4, project/ (the deck)
├── rulings.md · taste-notes.md · dreaming-notes.md
├── 00-discovery/              # the lock (stage 1, untouched here)
└── 01-design/
    ├── notes.md               # your record: the frame, what exists today, his call, the answers
    ├── telemetry.md           # your record: time, agents, tokens, rounds, findings by class
    ├── recon/                 # <area>.md, by plan-scout
    ├── research/              # <topic>.md, by the research workflow, only where needed
    ├── tiers/                 # breadboard.md · lean.md · balanced.md · hardened.md · critics.md
    ├── sizing.md              # the final design in one page: the pick per part, the evolution path
    ├── call/                  # the deck of his call (slides-scribe)
    ├── reviews/               # round-1.json, round-2.json: each round's return value, as it came
    ├── architecture.md · data-model.md · contracts.md · ui.md · security.md
    ├── infra.md · observability.md · rollout.md · code.md · acceptance.md
    └── reviews.md             # the round audit: your file
```

## G0 — recon

If the session is not on **Opus 5.5 at high effort**, ask the user to
switch (`/model`) and wait. Load `pack-right-sizing`. Read the lock's
`stories.md` and `pr-faq.md` whole (you rule on them all stage long);
the journeys, the mock and the doctrine are read by agents. Create
`01-design/notes.md` from [templates/notes.md](templates/notes.md)
and `01-design/telemetry.md` with the stage's start time.

Then, in one message, in parallel:

- **`plan-scout (Sonnet 5.5, low)`, one per area the lock touches** (a
  backend module, a frontend app, a job, the infra): what exists today
  there (modules, routes, tables, screens, jobs, the commands) and the
  golden path (the exemplary module) of each kind of code the lock
  will need, written to `01-design/recon/<area>.md`, every line with
  where it was read. One more for the front's design tokens and
  components, so the ui part maps the mock onto what the app has.
- **`scout (Sonnet 5.5, low)`, one question each:** the doctrine's
  rules for anything the lock will add (a table, a route, a job, a
  screen, an alarm); other fronts (the coordination file, every running
  workstream's `.state.md`, the files they share with this one).
- **The [`design-research`](../../workflows/design-research.js)
  workflow** (`design-researcher (Sonnet 5.5, medium)`), one per
  external tool **only where a premise is unconfirmed**: a vendor
  API, a limit, a price the design will lean on and the recon cannot
  answer from the repo. By `scriptPath`, with `topic`, `questions`,
  `designDir`, `repos`, `template` ([templates/research-target.md](templates/research-target.md)),
  `language`, `date`.

When they return, write the notes' **What exists today** (one line per
fact with its source) and **The frame**: the appetite in hours, from
the size of the lock (the user's own number when he gave one at
discovery), and the no-gos from the PR-FAQ and the stories' Out lines.
The appetite is a budget the design must fit, not an estimate of it.
Then G1 starts in the same turn.

## G1 + G2 — three tiers, then the size

Run [`design-tiers`](../../workflows/design-tiers.js) by `scriptPath`,
with `designDir`, `discoveryDir`, `doctrineDir`, `repos` (each repo
the design builds on, with its base branch), `templatesDir`
(`${CLAUDE_SKILL_DIR}/templates`), `packsDir`
(`${CLAUDE_SKILL_DIR}/..`), `agentsDir`
(`${CLAUDE_SKILL_DIR}/../../agents`), `appetiteHours`, `language` and
`date`. While the v9 agents are not installed in the running Claude
Code, pass `inlineAgents: true`: each agent then reads its definition
from `agentsDir` and its packs from `packsDir`.

```
architect·breadboard ──► architect·lean     ┐
  what must happen,      architect·balanced ├─► sizing-judge·pick ──► overengineering-critic ┐
  no mechanism chosen    architect·hardened ┘     R × V × C,            risk-critic          ├─► sizing-judge·reconcile
                          blind to each other     a tier per part       (opposite sides)     ┘     sizing.md (final)
```

The workflow checks between the steps (every tier covers the
breadboard's parts with hours and cost; lean meets every AC and the
floor; every pick follows the rubric or says why; every lean part with
R ≥ 2 has an evolution row whose signal has a watcher; the hours add
up; every critic finding has a ruling) and re-dispatches once. It
returns `{ status, files, totals, picks, evolution, doors, questions,
critics, problems }`.

**Read `sizing.md` whole: you rule on it.** It is one page. Check it
against the pack's §3 B and your own reading of the lock: the parts
above lean each have a real door or risk behind them, the lean parts
each hold the floor, the questions for his call are only his class.
Anything in `problems`, or anything you would rule otherwise, goes
back to `sizing-judge (Opus 5.5, high)` in amend mode, one dispatch,
with the lines to change and why; never edit `sizing.md` yourself.
Status `incomplete`: fix the cause (a premise, a missing file) and
relaunch with `resumeFromRunId`.

A premise the breadboard marked "changes the doctrine" is a question
for the call, never decided here.

## G3 — his call

One deck and at most one question call. Nothing else waits for him.

**The deck.** Dispatch `slides-scribe (Sonnet 5.5, high)` with the
stage `design`, the workstream path, the language, the date, `<root>`
= `01-design/call`, the sources (`sizing.md`, `tiers/`, `notes.md`)
and this focus paragraph:

> **The sizing call.** Eight slides, no video and no blueprint link.
> The final design in one picture. The three tiers side by side, part
> by part, with their hours and monthly cost. The pick per part: what
> gets more care and why, what is relaxed and why. The one-way doors.
> The evolution path: what moves up later, on which number, watched by
> what. The total against the appetite. The questions that are his,
> each with the pick.

Publish it as `docs/stage-report.md` step 4a does (a new Artifact from
the Slides type, `title: "<workstream title> · Sizing"`), read the
slide files, publish them to the deck's URL. Then one message: the
deck's link, the totals in a table (tier · hours · US$/month; the
pick last), the parts above lean in short topics.

**The questions.** The judge's "For his call", only what is his class,
**at most four, in one call** through the question tool, in the house
shape: the context in the question (the part, the scores, what each
option costs in hours and dollars), the pick first and marked as the
recommendation. When nothing is his, say so in the message, say that
the writers start now and that every pick is open to his veto at the
close, and go on in the same turn.

His answers go to `notes.md` ("His call"), one line each to
`rulings.md`; an answer against the recommendation also goes to
`taste-notes.md`, as the pattern. An answer that changes a pick goes
to `sizing-judge (Opus 5.5, high)` in amend mode, with his words; the
writers start from the amended page. If he comments on the deck
beyond the questions, note each comment in a visible list and apply
the ones that change a pick the same way.

## G4 — the documents

Ten `Agent` dispatches of **`design-writer (Sonnet 5.5, high)`**, one
per document, in write mode, each with the same brief: the workstream
path, `sizing.md`, `tiers/`, `notes.md`, `recon/`, `research/`, the
lock (`stories.md`, `journeys/`, `prototype/`, `pr-faq.md`), the
document's template and the header block's
([templates/doc-header.md](templates/doc-header.md)), the shared
rules ([references/design-docs.md](references/design-docs.md)), the
blueprint schema (`${CLAUDE_SKILL_DIR}/../../blueprint/schema/design.md`),
the language. The `observability` and `infra` writers also get the
path of the ops pack (`${CLAUDE_SKILL_DIR}/../pack-ops/SKILL.md`).

They go in **two waves**, because ten writers minting names in
parallel write ten vocabularies:

1. **The names.** `data-model` and `contracts`, in one message. They
   fix every name the design uses: tables, columns, enum values,
   routes, fields, status and error codes, events. Answer their
   questions and get the answers applied before the second wave.
2. **The rest.** `architecture`, `ui`, `security`, `infra`,
   `observability`, `rollout`, `code`, `acceptance`, in one message,
   with `data-model.md` and `contracts.md` added to the brief as the
   source of every name.

Every document opens with `## Size and evolution`: the rows of
`sizing.md` for its parts and their evolution path. Every mechanism
line ends with `(req: …)`. Each builds its parts at the tier picked,
nothing above it. `ui` maps every screen and frame of the mock onto
the real front and lists what the mock fakes; `acceptance` turns every
journey step into a case.

**The writers' questions.** Answer from `sizing.md`, the tier files
and the notes what they settle. A question of his class is not asked:
rule it conservatively in his place, `ruled: conductor`, listed for
veto at the close. Write every answer to the notes' "Questions
answered after the call", and send the answers to every writer whose
document the answer touches, in one message.

**Before the review**, check mechanically: every document has its
`## Size and evolution` block (`rg -L '^## Size and evolution' 01-design/*.md`
lists the ones without), every flow in `architecture.md` follows the
flow format, every document ends with its latitude and references.
What is missing goes back to its writer in one message.

## G5 — review and judge

Run [`design-review`](../../workflows/design-review.js) by
`scriptPath` with `designDir`, `discoveryDir`, `doctrineDir`, `repos`,
`packsDir`, `agentsDir`, `inlineAgents`, `round: 1`, `language`, the
glossary block, and `flows`: one `{id, text}` per flow of
`architecture.md`, split at every `### ` heading under `## Flows`.

The lenses report only four kinds of finding: **correctness, coverage
of the lock, contradictions, one-way doors**. The size was decided at
G2: a part built at its pick is not a gap because a higher tier would
cover more.

| Lens | Question |
|---|---|
| `design-reviewer-data` (Opus 5.5, medium) | every read has a key path; writes that must land together do; every invariant has a constraint |
| `design-reviewer-code` (Opus 5.5, medium) | the construction razor and the doctrine hold; no workaround, temporary step or speculation |
| `design-reviewer-infra` (Opus 5.5, medium) | configs that hold the flows, IAM by the verb, the run cost against the pick and real prices, a rollout with real steps back |
| `design-reviewer-security` (Opus 5.5, medium) | the abuse paths; the class sweep answered at the pick's tier |
| `design-reviewer-contracts` (Opus 5.5, medium) | every field a screen needs arrives; success and error; contracts only grow |
| `design-reviewer-sizing` (Opus 5.5, medium) | every mechanism names its requirement; every document builds its pick; the evolution signals are watched |
| `design-reviewer-alarms` (Sonnet 5.5, medium) | every alarm earns its ring; no main-path failure ends in silence |
| `design-reviewer-coverage` (Sonnet 5.5, medium) | every story, AC, journey step, side effect and frame has a home; every element names what reads it |
| `design-reviewer-facts` (Sonnet 5.5, medium) | every claim about the codebase checked in the repo; every external claim traced to research |
| `design-reviewer-ui` (Sonnet 5.5, medium) | `ui.md` maps the locked mock whole and true; nothing the mock fakes is built |
| `design-reviewer-consistency` (Sonnet 5.5, medium) | everything in two documents, and in `sizing.md`, says the same thing |
| 2 × `design-blind-reader` (Sonnet 5.5, low) → `design-reviewer-ambiguity` (Sonnet 5.5, low), per flow | would two engineers implement the same flow from these steps? |

Every reviewer answers under the
[reviewer contract](../../docs/standards/reviewer-contract.md). The
workflow returns `{ round, mode, valid, findings, lenses, unread }`; a
round in which no flow was read is invalid: fix the cause, run it
again.

Record before acting: save the return value as it came in
`01-design/reviews/round-N.json`, and write `01-design/reviews.md`
([template](templates/reviews.md)) from it in one `Write`.

**Judge.** Rule every finding by
[references/judging.md](references/judging.md): merge by fix first,
then sustained / deferred / dismissed, each kept only when it names
the failure, who sees it, how likely it is and its requirement; owner
`writer`, `implementer` or `his class` (ruled by you, conservatively,
for his veto). Every fix at its smallest: a fix that adds a mechanism
passes the pack's list C and carries its `req:`. Write the rulings to
`reviews.md` before any fix moves.

- **`writer`**: one apply batch per writer, dispatched in one message;
  the report carries the mentions table and the final lines; a fix
  without pasted lines is not done. **Before the batch**, for every
  fix that renames, revalues, removes or recounts something, search
  the **old** term, value, key or count across the ten documents and
  their JSON, and send the fix to every writer whose document has a
  hit, in the same batch, with the lines to change. **When the batch
  returns**, search the old one again: it may survive only as a
  negation; each other hit goes back to its writer before the next
  round. A writer propagates inside its own document; across
  documents, propagation is yours, and it is finished in the round
  that made the fix, never left for the next round's lenses.
- **`implementer`**: the writer adds one line to that document's "The
  implementer decides".
- **`his class`**: you rule it, `ruled: conductor` in `rulings.md`
  with the reason; the fix goes to the writers as above. A ruling that
  changes a pick goes to `sizing-judge (Opus 5.5, high)` in amend mode
  first, then to the writers whose header block it changes.
- **deferred to the evolution path**: the judge adds the row to
  `sizing.md`, and the writers copy it into their header blocks.

**Round 2 runs automatically**, right after round 1's fixes are
applied and the propagation search comes back clean: the same
workflow with `round: 2`, `changed` (the documents and flows whose
text changed), `fixes` (what was applied) and `lenses` (the lenses
that had a sustained finding; consistency and sizing always run).
Judge it the same way. **Then stop.** What is still sustained after
round 2 is applied by the writers with proof by line, verified on disk
by you, and written in `reviews.md` as residue; the workflow refuses a
third round.

## G6 — the report and the close

Write the conductor's JSON under `blueprint/design/`:
`decisions.json` (one entry per pick above lean and per one-way door
from `sizing.md`, plus his rulings from the call and every
`ruled: conductor` line, each with the recommendation and the pick),
`design-review.json` from `reviews.md` and `rulings.md`, and
`sizing.json` from `sizing.md` (the Size subtab: the appetite, the
three tiers side by side, each pick with `rvc` `[R, V, C]` and its
why, the doors with `his` = the call's question or null, the evolution
path with its signal and `watchedBy`), and
`design-report.json`, the plain layer the tab opens with, in the
intern's voice (schema: `${CLAUDE_SKILL_DIR}/../../blueprint/schema/design.md`):
its `needsYourEye` carries the parts above lean and why, and the
decisions taken in his place. Then
`node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>`.
The build refuses with the field named; a refusal goes back to the
writer of that JSON.

Close `telemetry.md`: per step (G0–G6) the wall-clock time, his
minutes (the call, the close), the agents dispatched with their model,
their hours and tokens as the harness reports them, the rounds, and
the findings by class (correctness, coverage, contradiction, door,
size) with how many were sustained.

**The stage report**: follow
[docs/stage-report.md](../../docs/stage-report.md) (video, then
slides, then blueprint). To the design's focus paragraph add: **why it
is this size**: the three tiers in one picture, what got care and
what was relaxed, and the evolution path as the way it grows.

Then present, after the three-layer message: the review in a table
(round · findings · sustained by owner · dismissed), the **veto list**
(every `ruled: conductor` line and every pick he did not see at the
call, one line each), the residue, the taste notes added, and the
telemetry in one line. He sends adjustments as they come; you note
each in a visible list and dispatch nothing until he says "apply";
then one batch per writer (a pick changed goes to the judge first),
verify on disk, rebuild, republish, and ask again. Approval is
explicit; silence does not close the stage. On approval: `.state.md`
to `stage: plan`, the close commit of the workstream folder (push only
on his word), and suggest `/clear` before stage 3.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something. A question names its options by what they
cost, in hours and dollars. In the terminal: a table for parallel
things, a flow in a code block for a sequence, short topics for lists;
a paragraph only for the one argument that is prose.

## Files

- **Permanent:** everything in `01-design/`, `blueprint/design/`,
  `report/design/`, `blueprint.html`, `rulings.md`, `taste-notes.md`,
  `.state.md`.
- **Nothing is deleted at the close.** The tier files stay: they are
  the next tier of every part, already designed, for the day its
  evolution signal fires.

## Resuming

Everything is in files. Read `.state.md`, then `notes.md` and
`telemetry.md` (the steps closed say where the stage stopped). Then
continue from the first step whose output is missing: no `recon/` →
G0; no `sizing.md` with status `final` → G1 (a design-tiers run with
`resumeFromRunId` when its run id is in `telemetry.md`); no "His call"
block → G3; documents missing → G4 (a writer redispatched with the
list of what is on disk; it never rewrites a finished file); no
`reviews/round-2.json` → G5; otherwise G6. Never from memory of a
previous session.
