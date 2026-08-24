---
name: stage-design
description: Conducts stage 2 (Design) of the pipeline — dispatches the design-author (an Opus agent that cuts the demand into waves, researches every target with dedicated deep-research workflows, writes the complete design grounded on referenced facts, and authors and publishes the UI as the wave's design canvas), runs the review rounds as a deterministic workflow (full to open and to close, delta in between), loops findings back to the same author, closes the review under the pre-registered exit rules, and fills this wave's Design tabs in the workstream's single blueprint. Use after the discovery is approved, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Artifact, AskUserQuestion, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(rm *)
---

# Stage 2: Design

The demand stops being "what we build" and becomes "how it works" — and
gets its build order: the architect cuts it into waves and designs the
current one. A single author designs the whole thing; ten specialist
reviewers try to break it; the user reviews the result in the blueprint
and the design canvas — after, not during.

The session is the **conductor** here: it dispatches, audits, relays,
publishes. It never writes a design file — the author is the only
writer, first draft to last fix. That single-writer rule is what keeps
the fix loop honest: a finding is only "fixed" when the author changed
the file.

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
├── waves.md                   # the cut — the architect's map of the whole demand
├── 00-discovery/              # the whole demand (stage 1, untouched here)
├── w01-invite-by-email/       # the current wave — the pipeline runs here
│   └── 01-design/
│       ├── research/          # one file per researched target
│       ├── ui/                # the screens: <Screen>.dc.html + canvas.json
│       ├── *.md               # architecture · data-model · contracts · ui · security · infra · observability · rollout
│       └── reviews.md         # the round audit — permanent
└── w02-resend-and-revoke/
    └── README.md              # seed: what that wave delivers — its design starts here
```

Plus the wave's **design canvas** (a separate artifact — the screens,
editable) and the **Design tabs** of the blueprint, under this wave.

## 1 — Dispatch the author

One `Agent` call: **`design-author`** (Opus — the single writer carries
the whole design, so the capability sits here rather than in the
reviewers, which read one lens each). The dispatch hands it: the
workstream folder path (discovery inside), the consuming project's
`CLAUDE.md`, and the repo map. The author does the rest — its
definition carries the method:

- **The wave cut is its first act** — the architect's call, no
  checkpoint of its own: `waves.md` at the workstream root (every story
  and AC of the discovery in exactly one wave), the current wave's
  folders, README seeds for the next ones. Each wave carries a
  proposed **rigor tier** (`rigor:` in `waves.md` — the
  [rigor standard](../../docs/standards/rigor.md)), one line of why.
  The cut and the tiers are presented — and contestable — with the
  rest of the design at the checkpoint.
- **Research per target** (one deep-research workflow each, never a
  global sweep), **the living docs of every touched repo** as input,
  the eight documents, and the **UI artboards** in `01-design/ui/` —
  which the author itself publishes as the wave's **design canvas**
  (one artifact per wave, the link recorded in `ui.md`).
- It designs under the house
  [architecture standard](../../docs/standards/architecture.md).

If the author hits a discovery gap, the path is always the same: **it
becomes a question to the user** (relayed by you) and the design
continues with the answer — the stage never goes back to stage 1.

## 2 — The review round (a workflow, so it cannot be skipped)

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

Rounds come in two shapes:

- **Full — the opening round is all ten lenses in EVERY tier** (the
  first look is where unknown-unknowns surface; no tier narrows it).
  Later full rounds carry the wave's rigor tier: all ten on `full` and
  `standard`, the five core on `light`, via `lenses` — the
  [rigor standard](../../docs/standards/rigor.md). At most three
  rounds are full: the
  **opening round** (round 1), the **one round after a checkpoint
  fold-in**, and the **closing round** (the regression guard, §3). A
  fourth full round requires the user's explicit say-so.
- **Delta — pass `lenses: [...]`:** only the lenses whose findings were
  applied since the last round, **plus coherence (always)**, with a
  `scope` note naming what changed. Every intermediate round is a delta
  round. The evidence is w01-ingestion-spine: 17 full rounds in which
  every blocker from round 12 on was a loose wire in a previous round's
  addition — the full re-run was auditing its own fix surface, at ten
  reviewers a round.

| Reviewer | Specialist in | Judges (holistically — reads everything, reports its lens) |
|---|---|---|
| `design-reviewer-data` | data | entities, keys, access patterns, growth, query cost |
| `design-reviewer-code` | code organization | patterns, decoupling, extension points — and the architecture standard |
| `design-reviewer-infra` | infrastructure | configs at their best, exposure, IAM, cost at three scales vs real prices, rollout |
| `design-reviewer-security` | security | breach-opening patterns, secrets, isolation, the fixed class sweep |
| `design-reviewer-contracts` | contracts | every API/event defined whole — success AND error; the data each side needs arrives |
| `design-reviewer-alarms` | observability | alarms that make sense — the four fields, no over-alarming, no low-traffic false rings |
| `design-reviewer-coverage` | completeness | the cut covers the whole discovery; this wave's slice is fully designed |
| `design-reviewer-facts` | evidence | every claim about an external tool or existing service traces to research |
| `design-reviewer-ui` | UI | the artboards fit the product as it is today; every story state has a home |
| `design-reviewer-coherence` | cross-cutting | contradictions across the whole — runs last, with all verdicts |

Every reviewer answers under the house
[reviewer contract](../../docs/standards/reviewer-contract.md); the
workflow re-dispatches lazy passes on its own.

## 3 — Audit, dispositions, and the fix loop

The round is audited in **`01-design/reviews.md` — permanent**:

1. Record the round: one section per reviewer — verdict, run id (from
   the workflow's journal, not from your prose), what it verified,
   findings.
2. Give **every finding a disposition**: `fixed` / `to-user` /
   `rejected` (with the reason; rejecting a blocker requires the user's
   explicit sign-off).
3. Send the `fixed` findings to the **same author** via SendMessage — it
   revises the files (single writer). `to-user` items go into the
   checkpoint message.
4. Run the next round under the **exit rules** below. (A fix that
   touches a screen also republishes the canvas — the author does it as
   part of the fix.)

### Exit rules — pre-registered, from round 1

Deciding the exit mid-review, tired, is what these rules exist to
prevent. They are the protocol, not a fallback:

- **A round returns blockers** → the author applies, the conductor
  verifies **on disk** (file + line per finding — "marked fixed, not
  applied" has happened), then a **delta round** over the touched
  lenses confirms the blockers closed.
- **A round returns zero blockers** → the loop ends: the remaining
  `fix` items are applied in a mini-pass and verified on disk, then the
  **closing full round** runs as the regression guard. If the round
  that returned zero blockers was itself full (opening or post-fold-in),
  it already is the guard — mini-pass, disk verification, close.
- **The closing round returns zero blockers** — or **≤1 blocker that is
  a loose wire in a previous round's addition** (applied as a mini-pass,
  verified on disk) → **the review closes.** Never a round beyond it.
- **`detail` findings are never applied per round.** They batch into a
  single author sweep at close.
- **Simplify or remove:** when a finding shows a loose wire in
  something a previous round added, the disposition is to simplify or
  remove the addition — never a third mechanism on top.
- **Checkpoint fold-in:** the author folds the user's decisions in one
  consolidated pass, then **one** full round; these same rules govern
  it.

## 4 — The blueprint

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
ceiling). Nine Design subtabs: **Glossary · How it works · UI ·
Data · Infra & cost · Code · Security · Alarms · Going to production**.

- **The UI tab carries prints**: render each artboard and embed the
  images, with the canvas link beside them — the prints are the
  fast validation pass; the canvas is the deep one.
- **Decisions permeate the tabs**: each tab's data carries the decision
  cards that belong to that context; the ones `decided in your place`
  get the orange highlight, and the Overview shows the count.
- Contracts have **no tab**: `contracts.md` is machine input — the
  frozen bridge the planning stands on.
- Never mermaid; diagrams are HTML/CSS with the shell's primitives.

## 5 — Checkpoint and closing

Present: the blueprint URL, the canvas URL, the wave cut (one line per
wave, each with its proposed rigor tier — confirming the tiers is part
of the approval), the verdict table (from `reviews.md`), the count of
`decided in your place` flags, and any `to-user` items. Approval is explicit. On
approval: `.state.md` → `stage: plan`, commit the workstream folder —
**push only with the user's explicit approval** — and suggest `/clear`
before stage 3 (house rule: stage transitions, in the repo's
`CLAUDE.md`). On "approved with fixes": the fold-in rule (§3) —
one consolidated author pass, one full round under the exit rules, new
checkpoint. On rejection: the reasons go back to the
author — **never back to stage 1**; whatever is missing becomes
questions to the user, answered in conversation and folded into the
design. Moving the Linear Project forward is **not this skill's job**
at close — stage 3 moves it when it opens.

## Lifecycle

- **Permanent:** `waves.md`, the future waves' READMEs, and everything
  in `01-design/` — documents, `research/`, `ui/` (the artboards are
  the source of record; the canvas artifact is the viewing surface),
  and `reviews.md`.
- **Working:** the author's scratch notes, if any — gone at close.

## Boundaries

No issue decomposition (stage 3). No code (stage 4). The discovery
fence does not reopen silently — unviable in-scope items become declared
decisions. Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is stage 6's job.
