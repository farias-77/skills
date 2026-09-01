---
name: stage-plan
description: Conducts stage 3 (Planning) of the pipeline — dispatches one plan-author per repo in parallel (the frozen contracts make each repo an independent, closed graph; each author self-checks its issues with blind Haiku readers before delivering), runs the review round as a deterministic workflow (three fresh blind cold-readers per issue plus four lenses at the maximum bar, the plan-judge proposing a ruling on every finding), puts every finding with the judge's ruling in front of the user through the question tool — he confirms or overrules each one — loops what he sustains back to the same repo's author, closes with one full final round he reads, publishes the Plan tab in the wave's blueprint, and bootstraps the issues on GitHub only after the user approves. Use after the wave's design is approved, or to resume a planning in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Artifact, AskUserQuestion, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *)
---

# Stage 3: Planning

The design stops being "how it works" and becomes dispatchable work: a
graph of issues that, executed end to end, implements the whole design —
no hole between issues, and no issue that stalls a cold worker for lack
of input. Every issue is written for an agent with **zero conversation
context**: the issue file is the entire brief.

The session is the **conductor**: it dispatches, audits, relays, and owns
the blueprint. It never writes a plan or an issue — each repo has exactly
one writer, its `plan-author`, first draft to last fix.

## Preconditions

`.state.md` says `stage: plan` and names the wave; the wave's
`01-design/` is approved (checkpoint #2 passed). Missing ⇒ halt. Move
the Linear Project to its planning status via the Linear MCP — **the MCP
missing is a halt, here and at every stage boundary**; ask for it to be
set up and stop. (Each stage moves the Project when it opens — closing
does not move it.)

## What this stage produces

```
designs-root/2026-08-15-workspace-invites/
├── blueprint.html             # the same single blueprint — this stage fills
│                              #   waves['wNN-<wave>'].plan and republishes
├── waves.md                   # the cut (stage 2) — this wave's stories and ACs
├── 00-discovery/              # the whole demand (stage 1, untouched here)
└── w01-invite-by-email/
    ├── 01-design/             # approved (stage 2, untouched here)
    └── 02-plan/
        ├── <repo>/plan.md          ← one per repo: the logic, batches, edges, coverage map
        ├── <repo>/issues/NN-*.md   ← one file per issue — the EXACT body the worker receives
        └── reviews.md              ← the round audit — permanent, the conductor's file
```

Plus this wave's **Plan tab** in the workstream's blueprint (same URL as
always), and — only after the user approves — the issues on GitHub.

## 1 — Dispatch the authors, one per repo, in parallel

List the repos the design touches (the contracts and architecture name
them). One `Agent` call **per repo**, all in the same message:
**`plan-author`** (Opus). Parallel is safe by construction — the frozen
`contracts.md` is the bridge; each repo is a **closed, self-sufficient
graph** with **zero cross-repo edges**, so no two authors ever touch the
same file.

Each dispatch hands its author: the wave folder path, the approved
`01-design/` (contracts above all; `decisions.md` is the design as the
user decided it — the author details it, never re-decides it; `acceptance.md` is
the frozen case spec each issue's DoD names its cases from; `code.md`
is the file-tree compass — a guide for slicing, never a rule to
enforce), the workstream's `00-discovery/` and `waves.md` (the cut
defines which story ACs are this wave's — the coverage universe), its
repo's path with `CLAUDE.md` and `docs/`, and the target directory
`02-plan/<repo>/`. The author does the rest — decomposition ruler,
issue writing rules, the blind-reader self-check, and its own checks
live in its agent definition. It returns a structured summary: batches,
issue count, coverage map status, self-check result, declared
decisions, and any questions that need the user — **gathered in one
batch** during authoring, not flagged `(decided in your place)` at the
end; the target for oranges at checkpoint is near zero.

**Keep the author ↔ repo mapping**: every fix for that repo goes back to
the SAME author via SendMessage — that is the single-writer rule, per
repo.

If an author hits a design gap it cannot plan over, the path is the same
as stage 2: **it becomes a question to the user** (relayed by you), and
the answer is folded in as a declared decision — the stage never reopens
the design in silence. A contract that proves wrong is a design amendment
(the conductor relays it to the user, the design doc is amended, every
affected repo's author is notified) — never a local workaround.

## 2 — The review round (a workflow, so it cannot be skipped)

Run [`plan-review`](../../workflows/plan-review.js) —
`Workflow({scriptPath: '<workflows-root>/plan-review.js', args: {...}})`
(invoke by
`scriptPath` pointing at the file under the consuming project's
workflows root — e.g. `.claude/workflows/` — never by `name`: the name
registry does not reliably carry these workflows; field-reported by
ops-tracking w2n3) with `planDir`,
`designDir`, `discoveryDir`, `wavesPath`, `issues`, and `round`.
`issues` is the enumeration of `02-plan/<repo>/issues/*.md` (repo +
absolute path): **every issue on the opening round; on a re-round, only
the issues whose files changed since the last one.** The three
whole-plan lenses run every round regardless — they read everything and
are the regression guard.

It is ONE workflow invocation covering the whole round, in four
phases: the two halves below run concurrently, `plan-reviewer-coherence`
closes the reading with every verdict in hand, and `plan-judge`
proposes a ruling on every finding. **The judge proposes, the user
rules (§3):**

- **Reviewers report at the maximum bar; `plan-judge` (Opus) rules
  every finding** — `sustained` / `deferred` / `dismissed`, with a
  one-line reason — calibrated by `decisions.md`, the round history in
  `reviews.md` and the house taste ledger (pass `tastePath`). **Its
  ruling is a proposal**: the round comes back with every finding
  ruled, and the user confirms or overrules each one before anything
  moves. `open` is the judge's guess at what stays open; his rulings
  decide.
- **Every later round is the delta**: only the issues whose files his
  sustained findings changed get fresh cold reads; the three
  whole-plan lenses reread everything regardless — they are the
  regression guard.
- **When a round comes back with nothing he sustains, ONE full final
  round runs — always, once**: every issue cold-read again by fresh
  readers, every lens, over the final state — mid-review fixes can
  break what had already passed. It reaches him like any round; what
  he sustains is fixed and verified by a delta, and **whether another
  full round runs is decided with him, never automatically**.

**Per issue — the cold-read probe.** Three **`plan-blind-reader`**
agents (Haiku — cheap and deliberately weak) read the same issue blind,
each alone, and return their **understanding** in their own words plus
**exactly five questions** they would ask before starting — always
five, so padding is expected by design. Then **`plan-reviewer-issue`** (Sonnet)
reviews the issue WITH the readings in hand: **real divergence
between the understandings is the ambiguity signal** — if weak
models read the same issue in incompatible ways, a strong one gets no
guarantee either — and **triaging the questions (five per reader) is its job**:
a question answerable by exploring the code during implementation is
noise; a question whose wrong guess would produce wrong work is a real
gap in the issue. The issue lens also runs its own mechanical checks (broken
references, consumes without origin, dishonest verification map). The
bar: if a Haiku can execute it, the worker certainly can.

**Whole plan — the graph lenses.**

| Lens | Judges |
|---|---|
| `plan-reviewer-gaps` | the negative: what NO issue covers — this wave's story ACs without an issue (walks `waves.md` and the stories itself, never trusts the coverage map), issues without an AC, consumes without producer, "Out" without owner |
| `plan-reviewer-flow` | the graph as it will RUN: cycles, edges without a real reason, wasted parallelism, a skeleton owed, two big jobs on the same surface in the same batch |
| `plan-reviewer-coherence` | runs last, with all verdicts: the plans tell the design's story, and the two ends of every contract meet in the middle |
| `plan-judge` | not a lens — proposes a ruling with a reason on every finding of the round (cold reads and lenses alike), after coherence, calibrated by the decisions, the history and the taste ledger |
| **the user** | confirms or overrules the judge on every finding, through the question tool; decides what proceeds and therefore whether another round runs |

Every reviewer answers under the house
[reviewer contract](../../docs/standards/reviewer-contract.md) at the
maximum bar, always: severity says how bad IF real; the judge says
whether it should proceed; the user says whether it does. The workflow
re-dispatches lazy passes and unruled findings on its own.

## 3 — The rulings are the user's; the judge proposes them

Every round comes back with **the judge's ruling and reason on every
finding** — a proposal. Before anything is fixed, put every finding in
front of the user **through the question tool, always** — never as
prose he answers in chat:

- **One question per finding.** The question text carries the context
  he needs to rule without opening a file: the source (lens, or the
  issue and its cold-read divergence) and severity, what the material
  says (the quote), the gap in one line, the fix proposed, and **the
  judge's reason**. Batch them four to a call, in the order the
  workflow returned them.
- **The answers are the judge's three rulings** — `sustained` ·
  `deferred` · `dismissed` — and **the judge's pick comes first, marked
  as his** (label it "— the judge's ruling"). The other two follow. He
  confirms by picking the first, overrules by picking another, and
  writes his reason in "Other" when he wants it recorded in his words.
- **He may stop the round.** "Enough" through "Other" is a ruling: the
  plan is executable as it stands, the remaining findings are recorded
  as unaddressed by his call.

The three rulings mean:

- **sustained** → the author of that repo fixes it in this loop.
- **deferred** → parked to the close; whether it ever enters is decided
  there, with him (below).
- **dismissed** → dies, with the reason recorded — the reasons are what
  teach the lenses, and the judge.

No round runs on the judge's ruling alone: an unruled finding reaches
him as sustained by construction — it is still his to confirm. Every
ruling also goes to the workstream's `rulings.md` (house rule) — the
judge's proposal beside his ruling.

The round is audited in **`02-plan/reviews.md` — permanent**, before
anything is applied:

1. Record the round: one section per lens and a per-issue scoreboard
   (verdict + divergence flag), run ids from the workflow's journal
   (not from your prose), findings **with the judge's ruling and
   reason, and his ruling and reason** ("confirmed", or his words).
2. Send what he sustained to the **author of that repo** via
   SendMessage — it revises its own files (single writer, per repo).
3. **Verify the applied findings on disk** — file and line per
   finding. "Marked fixed, not applied" has happened; the author's
   word is not the check.
4. Run the next round with `issues` = the issues whose files changed
   (the fixes, plus anything a whole-plan fix touched; the workflow's
   `open` is the judge's guess — adjust it to his rulings). When a
   round comes back with nothing he sustains, run **the full final
   round** (every issue again). It reaches him the same way; what he
   sustains loops as a delta, and **the two of you decide whether
   another full round runs**.
5. At close, write the **precision table**: per lens (the issue lens
   included), findings raised · sustained · deferred · dismissed by
   him, across all rounds — and **the judge's line**: rulings
   confirmed, overruled, in which direction. Both are the stage's
   telemetry, and stage 6's input to tighten the lens that cried wolf
   and to recalibrate the judge.

Two rules hold inside the loop:

- **Deferred findings and `detail` findings never enter on their
  own.** At close, present the batch to him (question tool, one per
  finding: enter / stay out) and decide together what enters — the
  default is nothing. What enters is one author pass,
  then the touched issues once more, ruled by him.
- **Simplify or remove:** when a finding shows a loose wire in
  something a previous round added, the fix to suggest is simplify or
  remove the addition — never a third mechanism on top.

## 4 — The blueprint

The workstream has **one blueprint, one URL, forever**. This stage fills
**this wave's entry**: `waves['wNN-<wave>'].plan` in the `BLUEPRINT`
object, and republishes the same file path — the Plan tab lights up
under this wave's pill. The content: the plan's logic as the intro, the
batch map, the issue cards (produces/consumes chips), decisions inline
(`decided in your place` in orange, counted in the Overview), and the
review scoreboard — verdicts with the user's rulings, including the
per-issue cold-read score. The
conductor owns the blueprint — it is the report of the authors' files,
not their projection (house rule: the blueprint is the report, the
files are the record — same altitude as the Design tab). Never mermaid; diagrams are HTML/CSS with the shell's
primitives.

## 5 — Checkpoint, bootstrap, and closing

Present: the blueprint URL, the verdict table (his rulings included),
the precision table per lens, the per-issue cold-read score, the
`decided in your place` count, the deferred batch and what he let in,
and any open questions.
Approval is explicit — and **the bootstrap runs ONLY on explicit
authorization**, never inferred from a positive tone.

On "approved with fixes" or rejection: the affected repos' authors
apply (or reauthor, with the reasons as input), the touched issues run
through the round again, he rules it, and **a new checkpoint
follows**. Every loop ends at
a checkpoint; there is no path from a fix straight to bootstrap.

**The bootstrap** — after the authorization, and not by you: dispatch
one Sonnet `Agent` (general-purpose) with a self-contained brief — the
`plan.md` files and issue files, plus the mechanics in
[references/github-bootstrap.md](references/github-bootstrap.md):
idempotent labels, `gh issue create --body-file`, upsert keyed on the
`plan-id` marker, dependencies via `addBlockedBy` (never in the body).
The agent returns the plan-id → #number map; you verify every issue got
a number, and record the numbers in each `plan.md`. Re-running the brief
is safe — upsert by plan-id never duplicates.

Then: `.state.md` → `stage: execute`, commit the workstream folder —
**push only with the user's explicit approval** — and suggest `/clear`
before stage 4 (house rule: stage transitions). Moving the Linear
Project forward is **not this skill's job**: each stage moves the
Project to its own status when it actually starts — stage 4 will move
it when it opens.

## Lifecycle

- **Permanent:** everything under `02-plan/` — the plans, the issue
  files, and `reviews.md`.
- **Working:** the authors' scratch notes, if any — gone at close.

## Boundaries

No implementation — not even "just the scaffolding to get ahead"
(stage 4). The design fence does not reopen silently — a hole becomes a
question to the user and a declared decision. The plan is amendable, not
sacred: in-flight adjustment (stage 4) navigates by Produces/Consumes —
whoever consumes the corrected element is suspect, the rest untouched.
Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is stage 6's job.
