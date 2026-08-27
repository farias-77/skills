---
name: stage-design
description: Conducts stage 2 (Design) of the pipeline — runs the design session with the user (one tradeoff card per macro decision, recorded in decisions.md as law), dispatches the design-author (an Opus agent that details the session's decisions into the complete design, researches every target, and publishes the UI as the wave's design canvas), runs the review rounds as a deterministic workflow (ten lenses at the maximum bar, the design-judge ruling every finding by the declared scrutiny, delta rounds until nothing is sustained, then one full final round), and fills this wave's Design tabs in the workstream's single blueprint. Use after the discovery is approved, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Artifact, AskUserQuestion, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(rm *)
---

# Stage 2: Design

The demand stops being "what we build" and becomes "how it works" — and
gets its build order. The macro decisions are taken **with the user**,
live, in the design session that opens the stage; a single author
details them into the complete design; ten specialist reviewers try to
break it at the maximum bar; a judge rules what proceeds. The user
decides at the start and reviews the result in the blueprint and the
canvas — the fait accompli is the failure mode this shape exists to
kill.

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
│       ├── decisions.md       # the design session's record — the law; the conductor's file
│       ├── research/          # one file per researched target
│       ├── ui/                # the screens: <Screen>.dc.html + canvas.json
│       ├── *.md               # architecture · data-model · contracts · ui · security · infra · observability · rollout · code · acceptance
│       └── reviews.md         # the round audit — permanent
└── w02-resend-and-revoke/
    └── README.md              # seed: what that wave delivers — its design starts here
```

Plus the wave's **design canvas** (a separate artifact — the screens,
editable) and the **Design tabs** of the blueprint, under this wave.

## 1 — The design session (you and the user; no fan-out)

The macro decisions are the user's, taken live — this session is where
overengineering dies first, and it is the stage's highest-leverage
hour. Before it, read the discovery, the consuming project's
`CLAUDE.md` and the touched repos; dispatch a single surgical research
agent only when a fact (a price, a service limit) would change a
decision — the full per-target research belongs to the author, after,
scoped to what was decided.

Walk the fixed agenda, one tradeoff card per item, presented in
conversation: the options in one line each with their cost said out
loud, your recommendation, the user's call.

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
11. **The review scrutiny** — the ruler the judge applies to every finding: revenue path · operational dependency · internal tool.

Record every call in `wNN-<wave>/01-design/decisions.md`
([template](templates/decisions.md)) — **the one design file the
conductor writes**, the declared exception to the single-writer rule:
it is the session's record and the law of the design. The author
details it and never edits it; reviewers contest it only on defect
(the reviewer contract's clause); the judge calibrates by its ruler.
The session closes with the user's explicit ok on the recorded
decisions — in conversation, no artifact.

## 2 — Dispatch the author

One `Agent` call: **`design-author`** (Opus — the single writer carries
the whole design, so the capability sits here rather than in the
reviewers, which read one lens each). The dispatch hands it: the
workstream folder path (discovery inside), **`decisions.md` — the law
it details, never redesigns**, the consuming project's `CLAUDE.md`, and
the repo map. The author does the rest — its definition carries the
method:

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
- It designs under the house
  [architecture standard](../../docs/standards/architecture.md),
  simplicity clause included: every step up in complexity names what
  forces it — and simplicity is never plainness.

If the author hits a discovery gap or an untenable decision, the path
is always the same: **it becomes a question to the user** (relayed by
you, in one batch where possible) and the design continues with the
answer — the stage never goes back to stage 1, and the author never
silently re-decides.

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

**One mode, every wave, every time — the judge closes rounds, not the
lenses:**

- **Round 1 is the full ten** — the first look is where
  unknown-unknowns surface, so nothing narrows it.
- **Reviewers report at the maximum bar; `design-judge` (Opus) rules
  every finding** — `sustained` / `deferred` / `dismissed` — against
  the scrutiny ruler declared in `decisions.md`. The workflow's `open`
  list comes back **already judged**: a lens stays open only for a
  sustained blocker/fix; deferred and dismissed findings hold
  nothing open.
- **Every later round is the delta**: pass `lenses: [...]` = the
  previous round's `open`, plus a `scope` note naming what changed.
- **When `open` comes back empty, the close is ONE full final round**:
  every lens, once, over the final state — mid-review fixes can break
  what had already passed. The judge rules it by the same ruler; a
  final round with nothing sustained is the close. Anything sustained
  there loops as a delta, and the final round runs again after.

The evidence for the shape is w01-ingestion-spine: 17 full rounds of
ten reviewers, in which every blocker from round 12 on was a loose wire
in a previous round's own addition. Told to find errors, reviewers
always find errors — that is by design, not a defect; the judge is what
turns it from an infinite loop into a calibrated one, and what makes
the final full round affordable: noise below the ruler dies at
judgment instead of forcing round 18.

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
| `design-judge` | the ruling | not a lens — judges every finding by the declared ruler, after coherence; decides what proceeds and therefore whether another round runs |

Every reviewer answers under the house
[reviewer contract](../../docs/standards/reviewer-contract.md) — the
maximum bar included: severity says how bad IF real, the judge says
whether it proceeds. The workflow re-dispatches lazy passes and unruled
findings on its own (an unruled finding counts as sustained —
fail-safe).

## 4 — Audit, rulings, and the fix loop

The round is audited in **`01-design/reviews.md` — permanent**:

1. Record the round: one section per reviewer — verdict, run id (from
   the workflow's journal, not from your prose), what it verified,
   findings **with the judge's ruling and reason on each**.
2. The rulings ARE the dispositions: `sustained` → fix now ·
   `deferred` → the close batch · `dismissed` → dies, reason recorded. Two
   overrides remain yours: a sustained finding that actually contests a
   user decision goes **to-user** in the checkpoint, and overruling the
   judge in either direction is the user's call, never silently yours.
3. Send the sustained findings to the **same author** via SendMessage —
   it revises the files (single writer).
4. **Verify the applied findings on disk** — file and line per
   finding. "Marked fixed, not applied" has happened twice; the
   author's word is not the check. (A fix that touches a screen also
   republishes the canvas — the author does it as part of the fix.)
5. Run the next round with `lenses` = the round's `open` list. When
   `open` comes back empty, run **the full final round** (no `lenses`
   arg); the close is a final round the judge clears.

Two rules hold inside the loop:

- **`deferred` rulings are never applied per round.** They batch into a
  single author sweep at close.
- **Simplify or remove:** when a finding shows a loose wire in
  something a previous round added, the disposition is to simplify or
  remove the addition — never a third mechanism on top.
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
  where written on it; arrows are the data), the lens verdict table,
  the cost at three scales as a chart — then, the 5-minute layer, the
  session's decision cards with the rejected option in one line each.
  A reader who stops here knows the system.
- **Every other subtab opens with its own diagram**; the prose
  supports it, never the reverse.
- **The UI tab carries prints**: render each artboard and embed the
  images, with the canvas link beside them — the prints are the
  fast validation pass; the canvas is the deep one.
- **The Code subtab carries the file-tree preview** from `code.md`,
  said as what it is: a guide the implementer may diverge from,
  compared with the real tree at wave close.
- **Decisions permeate the tabs**: each tab's data carries the decision
  cards that belong to that context. With the session upstream, the
  `decided in your place` orange is the exception now — the Overview
  shows the count, and near zero is the target.
- Contracts have **no tab**: `contracts.md` is machine input — the
  frozen bridge the planning stands on. Its human face is the
  **acceptance case listing**: the case names from `acceptance.md` are
  the readable contract, rendered where contracts would be.
- Never mermaid; diagrams are HTML/CSS with the shell's primitives.

## 6 — Checkpoint and closing

Present: the blueprint URL, the canvas URL, the wave cut (one line per
wave), the verdict table (from `reviews.md`, rulings included), the
count of `decided in your place` flags, any `to-user` items — and **the
stage's own telemetry**: rounds run, agents dispatched, approximate
cost, so the user calibrates the next wave with data, not sensation. Approval is explicit. On
approval: `.state.md` → `stage: plan`, commit the workstream folder —
**push only with the user's explicit approval** — and suggest `/clear`
before stage 3 (house rule: stage transitions, in the repo's
`CLAUDE.md`). On "approved with fixes": the fold-in rule (§4) — one
consolidated author pass, then the touched lenses back into the delta,
new checkpoint. On rejection: the reasons go back to the
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
