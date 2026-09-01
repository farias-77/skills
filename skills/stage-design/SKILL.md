---
name: stage-design
description: Conducts stage 2 (Design) of the pipeline — runs the design session with the user in two layers (the macro cards, then the mechanisms document by document, every call recorded in decisions.md as the complete design in decisions), dispatches the design-author (an Opus agent that transcribes the session's decisions into the design files, researches every target, and publishes the UI as the wave's design canvas), runs the review rounds as a deterministic workflow (ten Opus lenses at the maximum bar, the design-judge proposing a ruling on every finding), and puts every finding with the judge's ruling in front of the user through the question tool — he confirms or overrules each one, what he sustains loops the author, deltas re-run only what he kept open, one full final round always runs and he reads it. Fills this wave's Design tabs in the workstream's single blueprint. Use after the discovery is approved, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Artifact, AskUserQuestion, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(rm *)
---

# Stage 2: Design

The demand stops being "what we build" and becomes "how it works" — and
gets its build order. The design is defined **with the user, whole**:
the macro shape and the mechanisms, live, in the design session that
opens the stage. A single author transcribes what was decided into the
design files; ten specialist reviewers try to break it at the maximum
bar, always at the maximum; a judge proposes a ruling on each finding;
**the user gives the final ruling on every one**. Nothing in this stage is decided
in his place and shown later — the fait accompli is the failure mode
this shape exists to kill, and the ops-dashboard w01 run is the
evidence: 149 lines of macro decisions became 7,300 lines of design the
author chose alone, and 158 findings and 14 rounds were the price of
re-litigating them.

The session is the **conductor** here: it runs the design session,
dispatches, audits, relays, publishes. It writes exactly one design
file — `decisions.md`, the session's record — and never any other: the
author is the only writer of everything else, first draft to last fix.
That single-writer rule is what keeps the fix loop honest: a finding is
only "fixed" when the author changed the file.

## Preconditions

`.state.md` says `stage: design`; the workstream's `00-discovery/` has
the approved `pr-faq.md` and `user-stories.md`. Missing ⇒ halt, back to
stage 1. Move the Linear Project to its design status via the Linear
MCP — **Linear is the main tracking surface: the MCP missing is a halt,
here and at every stage boundary**; ask for it to be set up and stop.
(Each stage moves the Project when it opens — closing does not move it.)

## What this stage produces

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: design · wave: w01-invite-by-email
├── blueprint.html             # THE blueprint — one per workstream, same URL forever;
│                              #   Overview + Discovery are workstream-level, the
│                              #   stage tabs from Design on are per wave (wave pills)
├── waves.md                   # the cut — decided at the session, instantiated by the author
├── 00-discovery/              # the whole demand (stage 1, untouched here)
├── w01-invite-by-email/       # the current wave — the pipeline runs here
│   └── 01-design/
│       ├── decisions.md       # the design session's record — the whole design in decisions; the conductor's file
│       ├── research/          # one file per researched target
│       ├── ui/                # the screens: <Screen>.dc.html + canvas.json
│       ├── *.md               # architecture · data-model · contracts · ui · security · infra · observability · rollout · code · acceptance
│       └── reviews.md         # the round audit, the user's rulings on every finding — permanent
└── w02-resend-and-revoke/
    └── README.md              # seed: what that wave delivers — its design starts here
```

Plus the wave's **design canvas** (a separate artifact — the screens,
editable) and the **Design tabs** of the blueprint, under this wave.

## 1 — The design session (you and the user; no fan-out)

The design is the user's, taken live — this session is where
overengineering dies, and it is the stage's highest-leverage hours. It
runs in two layers, both on the same primitive: **one tradeoff card per
decision**, presented in conversation — the options in one line each
with their cost said out loud, your recommendation, the user's call.
Before it, read the discovery, the consuming project's `CLAUDE.md`, the
touched repos — and the house
[taste ledger](../../docs/standards/taste.md): what the
user has chosen and rejected in past sessions, and why. **Your
recommendation is shaped by it**: the point of the joint build is that
over time the first proposal already comes the way he would take it,
and the ledger is how the pipeline learns that. Dispatch a single
surgical research agent only when a fact (a price, a service limit)
would change a decision — the full per-target research belongs to the
author, after, scoped to what was decided.

**Layer 1 — the macro shape.** The fixed agenda:

1. **The wave cut** — how the demand slices; wave size is where cost scale is set.
2. **Data** — what is stored, where; and what is NOT stored.
3. **Compute** — what runs where.
4. **Messaging** — event vs sync, per boundary (the architecture standard's default).
5. **Identity and access** — who calls what, with which credential.
6. **Repos** — new repo or existing.
7. **Build vs buy** — what is not built.
8. **Cost envelope** — the accepted monthly ceiling at three scales, declared before the design exists; the infra lens enforces it.
9. **Alarm philosophy** — what wakes someone, given who actually answers.
10. **Environment and rollout macro** — alpha, profiles, names, test credentials; the acceptance spec needs them early.

**Layer 2 — the mechanisms, document by document.** With the macro
shape decided, walk **all ten documents** in the order they will be
written, and for each one propose the decisions it needs as cards —
you prepare the proposal (you have read the discovery, the repos and
the ledger; the recommendation is yours), the user rules. Nothing is
skipped: the design is built together here, whole, and the author
afterwards only consolidates it into the files.

| Document | What earns a card |
|---|---|
| `architecture.md` | each flow end to end; the components and what each guarantees; every mechanism that guards a rule (a lock, idempotency, a retry, a cutoff) |
| `data-model.md` | the entities and their keys; the access patterns; what is retained and for how long |
| `contracts.md` | the list of endpoints and events, who calls each, the error classes; the exact shapes are transcription |
| `ui.md` | the screens and the states that matter; what is reused from the product as it is |
| `security.md` | every class of the fixed sweep that needs a call — risk accepted, or covered how |
| `infra.md` | the resources, and every config that encodes a rule or a cost |
| `observability.md` | which alarms exist, and what each one wakes |
| `rollout.md` | the deploy order, the cutover gates, the way back |
| `code.md` | the repo layout where it departs from the house structure |
| `acceptance.md` | which cases prove the wave — the case list, not the request bodies |

**The test for a card is the blueprint's test:** it is a decision if
the user would want it made differently, or if it encodes a business
rule, a cost, or a risk. Everything else — the request body, the DDL,
the IAM statement, the artboard's pixels — is transcription, and the
author does it. Do not walk the user through transcription; do not
transcribe a decision in his place.

Record every call in `wNN-<wave>/01-design/decisions.md`
([template](templates/decisions.md)) **as you go**, one section per
layer-2 document, every card carrying **what you recommended and what
he chose** — **the one design file the conductor writes**, the declared
exception to the single-writer rule: it is the session's record and
the whole design in decisions. The session may span more than one
sitting; the file is the state between them. The author transcribes it
and never edits it; reviewers contest it only on defect (the reviewer
contract's clause).

The session closes in two steps, both in conversation, no artifact:
the user's explicit ok on the recorded decisions; then **the ledger
delta** — every card where his choice diverged from your
recommendation, proposed back to him as a taste entry (the pattern,
not the instance: "prefers a Lambda cron over Step Functions until a
flow needs a human wait", never "chose B on card 7"). He confirms,
rewrites or drops each; what he confirms is written to the ledger
now, by you. Next session's recommendations start from it.

## 2 — Dispatch the author

One `Agent` call: **`design-author`** (Opus — the single writer carries
the whole design, so the capability sits here rather than in the
reviewers, which read one lens each). The dispatch hands it: the
workstream folder path (discovery inside), **`decisions.md` — the
design it transcribes, never redesigns**, the consuming project's
`CLAUDE.md`, and the repo map. The author does the rest — its
definition carries the method:

- **It instantiates the session's cut**: `waves.md` at the workstream
  root from the decided cut (every story and AC of the discovery in
  exactly one wave — the coverage lens audits the mapping in both
  directions), the current wave's folders, README seeds for the next
  ones.
- **Research per target** (one deep-research workflow each, never a
  global sweep), scoped to the decisions taken, **the living docs of
  every touched repo** as input, the documents — `code.md` (the
  file-tree preview, a guide) and `acceptance.md` (the executable
  acceptance spec, frozen with `contracts.md`) included — and the
  **UI artboards** in `01-design/ui/`, which the author itself
  publishes as the wave's **design canvas** (one artifact per wave,
  the link recorded in `ui.md`).
- It writes under the house
  [architecture standard](../../docs/standards/architecture.md),
  simplicity clause included — the decisions already chose the
  simplest form; the transcription does not add a mechanism.

If the author finds a decision the session did not take, or one the
detail proves untenable, the path is always the same: **it becomes a
question to the user** (relayed by you, in one batch where possible)
and the transcription continues with the answer — the stage never goes
back to stage 1, and the author never decides in his place. The
`(decided in your place)` flag exists for the case the user answers
"you decide"; its target at checkpoint is zero.

## 3 — The review round (a workflow, so it cannot be skipped)

Run [`design-review`](../../workflows/design-review.js) —
`Workflow({scriptPath: '<workflows-root>/design-review.js', args: {...}})`
with `designDir`, `discoveryDir`, `wavesPath`, and `round` (invoke by
`scriptPath` pointing at the file under the consuming project's
workflows root — e.g. `.claude/workflows/` — never by `name`: the name
registry does not reliably carry these workflows; field-reported by
ops-tracking w2n3). The workflow is the guarantee:
the dispatch is deterministic, structured output is forced on every
reviewer, and a lazy pass is re-dispatched — discipline made physical.
Specialists run in parallel; `design-reviewer-coherence` always runs
last, with the specialist verdicts in hand.

**The lenses report, the judge proposes, the user rules (§4):**

- **Round 1 is the full ten** — the first look is where
  unknown-unknowns surface, so nothing narrows it.
- **Reviewers report at the maximum bar; `design-judge` (Opus) rules
  every finding** — `sustained` / `deferred` / `dismissed`, with a
  one-line reason — calibrated by `decisions.md`, the round history in
  `reviews.md` and the house taste ledger (pass `tastePath`). **Its
  ruling is a proposal**: the round comes back with every finding
  ruled, and the user confirms or overrules each one before anything
  moves. `open` is the judge's guess at what stays open; his rulings
  decide.
- **Every later round is the delta**: pass `lenses: [...]` = the
  lenses whose findings the user sustained, plus a `scope` note naming
  what changed.
- **When a delta comes back with nothing the user sustains, ONE full
  final round runs — always, once**: every lens, over the final state —
  mid-review fixes can break what had already passed, and on
  ops-dashboard the final round caught a defect the deltas could not
  see three times out of four. It reaches him like any round;
  **whether another final round runs is decided with him, never
  automatically**.

Told to find errors, reviewers always find errors — that is by design,
not a defect. What turns it from an infinite loop into a calibrated one
is who rules: on ops-dashboard w01 the judge, ruling alone, dismissed
5 findings in 158 and deferred 84, and the deferred sweeps reopened
three finals. Now the judge proposes and the user rules by what he
would build; every overrule is recorded, and the judge reads that
record next time.

| Reviewer | Specialist in | Judges (holistically — reads everything, reports its lens) |
|---|---|---|
| `design-reviewer-data` | data | entities, keys, access patterns, growth, query cost |
| `design-reviewer-code` | code organization | patterns, decoupling, extension points — and the architecture standard |
| `design-reviewer-infra` | infrastructure | configs at their best, exposure, IAM, cost at three scales vs real prices, rollout |
| `design-reviewer-security` | security | breach-opening patterns, secrets, isolation, the fixed class sweep |
| `design-reviewer-contracts` | contracts | every API/event defined whole — success AND error; the data each side needs arrives |
| `design-reviewer-alarms` | observability | alarms that make sense — the four fields, no over-alarming, no low-traffic false rings |
| `design-reviewer-coverage` | coverage, both ways | the cut covers the whole discovery; this wave's slice is fully designed; nothing in the design exists unforced |
| `design-reviewer-facts` | evidence | every claim about an external tool or existing service traces to research |
| `design-reviewer-ui` | UI | the artboards fit the product as it is today; every story state has a home |
| `design-reviewer-coherence` | cross-cutting | contradictions across the whole — runs last, with all verdicts |
| `design-judge` | the proposal | not a lens — rules every finding with a reason, after coherence, calibrated by the decisions, the history and the taste ledger; a proposal |
| **the user** | the ruling | confirms or overrules the judge on every finding, through the question tool; decides what proceeds and therefore whether another round runs |

Every reviewer is **Opus** — the rounds are few now, so the strongest
read is affordable where it matters — and answers under the house
[reviewer contract](../../docs/standards/reviewer-contract.md) at the
maximum bar, always: severity says how bad IF real; the judge says
whether it should proceed; the user says whether it does. The workflow
re-dispatches lazy passes and unruled findings on its own.

## 4 — The rulings are the user's; the judge proposes them

Every round comes back with **the judge's ruling and reason on every
finding** — a proposal. Before anything is fixed, put every finding in
front of the user **through the question tool, always** — never as
prose he answers in chat:

- **One question per finding.** The question text carries the context
  he needs to rule without opening a file: the lens and severity, what
  the document says (the quote), the gap in one line, the fix the lens
  proposes, and **the judge's reason**. Batch them four to a call, in
  the order the workflow returned them; the same loose wire across
  three documents is still one finding per lens.
- **The answers are the judge's three rulings** — `sustained` ·
  `deferred` · `dismissed` — and **the judge's pick comes first, marked
  as his** (label it "— the judge's ruling"). The other two follow. He
  confirms by picking the first, overrules by picking another, and
  writes his reason in "Other" when he wants it recorded in his words.
- **He may stop the round.** "Enough" through "Other" is a ruling: the
  design is buildable as it stands, the remaining findings are recorded
  as unaddressed by his call.

The three rulings mean:

- **sustained** → the author fixes it in this loop.
- **deferred** → parked to the close; whether it ever enters is decided
  there, with him (below).
- **dismissed** → dies, with the reason recorded — the reasons are what
  teach the lenses, and the judge.

No round runs on the judge's ruling alone: an unruled finding reaches
him as sustained by construction — it is still his to confirm. Every
ruling also goes to the workstream's `rulings.md` (house rule in the
repo's `CLAUDE.md`) — the judge's proposal beside his ruling.

The round is audited in **`01-design/reviews.md` — permanent**
([template](templates/reviews.md)), **before anything is applied**:

1. Record the round: one section per reviewer — verdict, run id (from
   the workflow's journal, not from your prose), what it verified,
   findings **with the judge's ruling and reason, and his ruling and
   reason** ("confirmed", or his words).
2. Send what he sustained to the **same author** via SendMessage —
   it revises the files (single writer).
3. **Verify the applied findings on disk** — file and line per
   finding. "Marked fixed, not applied" has happened twice; the
   author's word is not the check. (A fix that touches a screen also
   republishes the canvas — the author does it as part of the fix.)
4. Run the next round with `lenses` = the lenses whose findings he
   sustained (the workflow's `open` is the judge's guess — adjust it
   to his rulings). When a delta comes back with nothing he sustains,
   run **the full final round** (no `lenses` arg). It reaches him the
   same way; what he sustains there loops as a delta, and **the two of
   you decide whether another final round runs**.
5. At close, write the **precision table**: per lens, findings raised ·
   sustained · deferred · dismissed by him, across all rounds — and
   **the judge's line**: how many of its rulings he confirmed, how many
   he overruled, in which direction. Both go into the stage's
   telemetry (§6); stage 6 uses them to tighten the lens that cried
   wolf and to recalibrate the judge. And the **ledger delta of the
   review**: every overrule whose reason is a pattern (not a one-off)
   is proposed to him as a taste entry, same rule as the session's —
   confirmed, it is written now.

Three rules hold inside the loop:

- **Deferred findings never enter on their own.** At close, present the
  batch to the user (question tool, one per finding: enter / stay out)
  and decide together what enters — the default is nothing: on
  ops-dashboard the deferred sweeps were what reopened the final
  rounds. What enters is one author pass, then the touched lenses once
  more, ruled by him.
- **Simplify or remove:** when a finding shows a loose wire in
  something a previous round added, the disposition to suggest is
  simplify or remove the addition — never a third mechanism on top.
- **Checkpoint fold-in:** the author folds the user's decisions in one
  consolidated pass; the lenses whose material it touched go back into
  the next delta, alongside whatever was already open.

## 5 — The blueprint

The workstream has **one blueprint, one URL, forever** — the file stage 1
published at the workstream root. This stage fills **this wave's entry**:
`waves['wNN-<wave>'].design` in the `BLUEPRINT` object, plus
`workstream.wave` (the current wave) and the wave map in the Overview
(all waves, from `waves.md`). Republish the same file path — the Design
tab lights up, and the wave pills let the reader flip between waves.
The conductor owns the blueprint — it is the **report** of the author's
files, not their projection (house rule in the repo's `CLAUDE.md`: the
blueprint is the report, the files are the record — the altitude test,
the curated lists, the three-paragraph mechanism, the 20–30 minute
ceiling). Ten Design subtabs: **The proposal · Glossary · How it
works · UI · Data · Infra & cost · Code · Security · Alarms · Going to
production** — layered for reading: 30 seconds, 5 minutes, 20 minutes,
then the files as the named authority.

- **"The proposal" opens the tab — the 30-second layer.** One
  full-width architecture diagram (each service a box with what runs
  where written on it; arrows are the data), the lens verdict table
  (the user's rulings, the judge's agreement beside them), the cost at three scales as a chart — then, the
  5-minute layer, the session's decision cards with the rejected option
  in one line each. A reader who stops here knows the system.
- **Every other subtab opens with its own diagram**; the prose
  supports it, never the reverse.
- **The UI tab carries prints**: render each artboard and embed the
  images, with the canvas link beside them — the prints are the
  fast validation pass; the canvas is the deep one.
- **The Code subtab carries the file-tree preview** from `code.md`,
  said as what it is: a guide the implementer may diverge from,
  compared with the real tree at wave close.
- **Decisions permeate the tabs**: each tab's data carries the decision
  cards that belong to that context — the session's, in the tab of the
  document they shaped. The `decided in your place` orange is the
  exception now — the Overview shows the count, and zero is the target.
- Contracts have **no tab**: `contracts.md` is machine input — the
  frozen bridge the planning stands on. Its human face is the
  **acceptance case listing**: the case names from `acceptance.md` are
  the readable contract, rendered where contracts would be.
- Never mermaid; diagrams are HTML/CSS with the shell's primitives.

## 6 — Checkpoint and closing

Present: the blueprint URL, the canvas URL, the wave cut (one line per
wave), the verdict table (from `reviews.md`, his rulings included), the
precision table per lens, the count of `decided in your place` flags,
the deferred batch and what he let in, the ledger entries this wave
added — and **the stage's own
telemetry**: rounds run, agents dispatched, approximate cost, so the
user calibrates the next wave with data, not sensation. Approval is
explicit. On approval: `.state.md` → `stage: plan`, commit the
workstream folder — **push only with the user's explicit approval** —
and suggest `/clear` before stage 3 (house rule: stage transitions, in
the repo's `CLAUDE.md`). On "approved with fixes": the fold-in rule
(§4) — one consolidated author pass, then the touched lenses back into
the delta, new checkpoint. On rejection: the reasons go back to the
author — **never back to stage 1**; whatever is missing becomes
questions to the user, answered in conversation and folded into the
design. Moving the Linear Project forward is **not this skill's job**
at close — stage 3 moves it when it opens.

## Lifecycle

- **Permanent:** `waves.md`, the future waves' READMEs, and everything
  in `01-design/` — `decisions.md`, documents, `research/`, `ui/` (the
  artboards are the source of record; the canvas artifact is the
  viewing surface), and `reviews.md`.
- **Working:** the author's scratch notes, if any — gone at close.

## Boundaries

No issue decomposition (stage 3). No code (stage 4) — and no
executable tests either: `acceptance.md` is the spec; the `.sh` live in
each repo's `smoke/`, written at stage 4 by transcription. The discovery
fence does not reopen silently — unviable in-scope items become declared
decisions. Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is stage 6's job.
