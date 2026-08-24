---
name: stage-plan
description: Conducts stage 3 (Planning) of the pipeline — dispatches one plan-author per repo in parallel (the frozen contracts make each repo an independent, closed graph), runs the review round as a deterministic workflow (blind cold-readers per issue — count set by the wave's rigor tier — plus four lenses), loops findings back to the same repo's author, publishes the Plan tab in the wave's blueprint, and bootstraps the issues on GitHub only after the user approves. Use after the wave's design is approved, or to resume a planning in progress.
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
`01-design/` (contracts above all), the workstream's `00-discovery/` and
`waves.md` (the cut defines which story ACs are this wave's — the
coverage universe), its repo's path with `CLAUDE.md` and `docs/`, and
the target directory `02-plan/<repo>/`. The author does the
rest — decomposition ruler, issue writing rules, and self-checks live in
its agent definition. It returns a structured summary: batches, issue
count, coverage map status, declared decisions, and any questions that
need the user.

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
`Workflow({name: 'plan-review', args: {...}})` with `planDir`,
`designDir`, `discoveryDir`, `wavesPath`, `issues`, `readers` (3 on a
`full`/`standard` wave, 1 on `light` — the
[rigor standard](../../docs/standards/rigor.md)), and `round`.
`issues` is the enumeration of `02-plan/<repo>/issues/*.md` (repo +
absolute path): **every issue on the opening round; on a re-round, only
the issues whose files changed since the last one.** The three
whole-plan lenses run every round regardless — they read everything and
are the regression guard.

It is ONE workflow invocation covering the whole round, in three
phases: the two halves below run concurrently, and `plan-reviewer-coherence`
closes with every verdict in hand.

**Per issue — the cold-read probe.** The tier's blind
**`plan-blind-reader`** agents (Haiku — cheap and deliberately weak;
three on `full`/`standard`, one on `light`) read the same issue blind,
each alone, and return their **understanding** in their own words plus
**exactly five questions** they would ask before starting — always
five, so padding is expected by design. Then **`plan-reviewer-issue`** (Sonnet)
judges the issue WITH the readings in hand: **real divergence
between the understandings is the ambiguity signal** — if weak
models read the same issue in incompatible ways, a strong one gets no
guarantee either — and **triaging the questions (five per reader) is its job**:
a question answerable by exploring the code during implementation is
noise; a question whose wrong guess would produce wrong work is a real
gap in the issue. The judge also runs its own mechanical checks (broken
references, consumes without origin, dishonest verification map). The
bar: if a Haiku can execute it, the worker certainly can.

**Whole plan — the graph lenses.**

| Lens | Judges |
|---|---|
| `plan-reviewer-gaps` | the negative: what NO issue covers — this wave's story ACs without an issue (walks `waves.md` and the stories itself, never trusts the coverage map), issues without an AC, consumes without producer, "Out" without owner |
| `plan-reviewer-flow` | the graph as it will RUN: cycles, edges without a real reason, wasted parallelism, a skeleton owed, two big jobs on the same surface in the same batch |
| `plan-reviewer-coherence` | runs last, with all verdicts: the plans tell the design's story, and the two ends of every contract meet in the middle |

Every reviewer answers under the house
[reviewer contract](../../docs/standards/reviewer-contract.md); the
workflow re-dispatches lazy passes on its own.

## 3 — Audit, dispositions, and the fix loop

The round is audited in **`02-plan/reviews.md` — permanent**: one
section per lens and a per-issue scoreboard (verdict + divergence flag),
run ids from the workflow's journal. Every finding gets a disposition:
`fixed` / `to-user` / `rejected` (with the reason; rejecting a blocker
requires the user's explicit sign-off).

`fixed` findings go to the **author of that repo** via SendMessage — it
revises its own files (single writer, per repo). Then run the next
round under the **pre-registered exit rules** (the same shape as
stage-design §3): a re-round carries only the issues whose files
changed, plus the three whole-plan lenses (always); a round that
returns **zero blockers closes the review** — the remaining `fix`
items are applied in a mini-pass and verified on disk by the conductor
(file + line per finding), with no further round; `detail` findings
batch into one author sweep at close, never a round of their own.

## 4 — The blueprint

The workstream has **one blueprint, one URL, forever**. This stage fills
**this wave's entry**: `waves['wNN-<wave>'].plan` in the `BLUEPRINT`
object, and republishes the same file path — the Plan tab lights up
under this wave's pill. The content: the plan's logic as the intro, the
batch map, the issue cards (produces/consumes chips), decisions inline
(`decided in your place` in orange, counted in the Overview), and the
review scoreboard — including the per-issue cold-read score. The
conductor owns the blueprint — it is the report of the authors' files,
not their projection (house rule: the blueprint is the report, the
files are the record — same altitude as the Design tab). Never mermaid; diagrams are HTML/CSS with the shell's
primitives.

## 5 — Checkpoint, bootstrap, and closing

Present: the blueprint URL, the verdict table, the per-issue cold-read
score, the `decided in your place` count, and any `to-user` items.
Approval is explicit — and **the bootstrap runs ONLY on explicit
authorization**, never inferred from a positive tone.

On "approved with fixes" or rejection: the affected repos' authors
apply (or reauthor, with the reasons as input), the round runs again —
full, as always — and **a new checkpoint follows**. Every loop ends at
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
