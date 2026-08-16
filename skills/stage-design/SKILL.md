---
name: stage-design
description: Conducts stage 2 (Design) of the pipeline — dispatches the design-author (a Fable agent that researches every external tool and internal service with dedicated deep-research workflows, then writes the complete design grounded on referenced facts, UI included), runs the ten-reviewer round as a deterministic workflow, loops findings back to the same author via SendMessage until zero blockers, and publishes the Design tabs in the wave's blueprint. Use after the wave's discovery is approved, or to resume a design in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, Artifact, AskUserQuestion, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(rm *)
---

# Stage 2: Design

The wave stops being "what we build" and becomes "how it works". A single
author designs the whole thing; ten specialist reviewers try to break it;
the user reviews the result in the blueprint — after, not during.

The session is the **conductor** here: it dispatches, audits, and relays.
It never writes a design document — the author is the only writer, first
draft to last fix. That single-writer rule is what keeps the fix loop
honest: a finding is only "fixed" when the author changed the file.

## Preconditions

`.state.md` says `stage: design`; the wave's `00-discovery/` has the
approved `pr-faq.md` and `user-stories.md`. Missing ⇒ halt, back to
stage 1. Move the Linear Project to its design status via the Linear
MCP — **Linear is the main tracking surface: the MCP missing is a halt,
here and at every stage boundary**, not a note; ask for it to be set up
and stop.

## 1 — Dispatch the author

One `Agent` call: **`design-author`** (Fable — this is the stage where
the capability step pays for itself). The dispatch hands it the frozen
inputs: the wave folder path, the discovery documents, the wave map, the
consuming project's `CLAUDE.md` and `docs/`, and the discovery's answer
to "does a UI already exist, or do we build it?".

The author does the rest — **including the research**: one dedicated
deep-research workflow **per target** — one for tool A, another for tool
B, another for internal service C — **never a single global research**;
nothing inferred, every design claim carries a reference to its target's
research file. It writes all of `01-design/` (architecture, data-model,
contracts, ui, security, infra, observability, rollout), declares
decisions inline where they apply, and returns a structured summary.

**The UI is designed IN Claude Design — that is the standard of work,
not an option.** The author composes the screens from the product's real
component library and publishes them as cards to the venture's Claude
Design project via DesignSync (creating the project if it does not exist
yet); the blueprint's UI tab carries the project link, which is where
the user validates the visuals. DesignSync not authorized ⇒ that is a
setup halt to report, never a silent local-only fallback.

If the author hits a gap in the discovery, the path is always the same:
**it becomes a question to the user** (relayed by you) and the design
continues with the answer — the stage never goes back to stage 1. A big
hole is still a stage-1 *failure* worth recording: note it in
`dreaming-notes.md` so stage 7 fixes the discovery skill, but the
resolution here is asking, not reopening.

## 2 — The review round (a workflow, so it cannot be skipped)

Run [`design-review`](../../workflows/design-review.js) —
`Workflow({name: 'design-review', args: {designDir, discoveryDir}})`.
The workflow is the guarantee: it dispatches **all ten reviewers**, every
round, with structured outputs — there is no code path that runs a
subset. Nine run in parallel; `design-coherence` runs last with the nine
verdicts in hand.

| Reviewer | Specialist in | Judges (holistically — reads everything, reports its lens) |
|---|---|---|
| `design-data` | data | entities, keys, access patterns, growth, query cost |
| `design-code` | code organization | patterns, decoupling, testability, performance, named extension points |
| `design-infra` | infrastructure | service configs at their best, nothing open that should not be, cost at three scales, IAM, deploy order/cutover/rollback |
| `design-security` | security | known breach-opening patterns, secrets, exposure, isolation, the fixed class sweep |
| `design-contracts` | contracts | every API/event makes sense; the data each side needs actually arrives; evolution |
| `design-alarms` | observability | alarms that make sense — no over-alarming, no daily false rings at low traffic, action written |
| `design-coverage` | completeness | everything the discovery asked is designed; every AC is satisfiable by this design |
| `design-facts` | evidence | every claim about an external tool or existing service traces to a research file; inference is not dressed as fact |
| `design-ui` | UI | the UI plan matches how the product looks and behaves today; every story state has a home |
| `design-coherence` | cross-cutting | contradictions across the whole — runs last, with all verdicts |

**Every reviewer reads the ENTIRE design** — the lens is the filter on
what it reports, never on what it reads. All of them receive the
discovery documents too (coverage needs the ACs; everyone benefits).

Reviewer contract (same as stage 1): verdict `pass` / `pass with fixes` /
`fail`; findings with `blocker` / `fix` / `detail`; a verbatim quote
proving the read; **zero findings is valid here** — a design scope can be
genuinely solid, and forced findings burn the user's trust in real
ones — but only with the "Verified" enumeration; without it the workflow
re-dispatches the reviewer. A declared decision block is not a finding —
at most the reviewer contests the argument.

## 3 — Audit, dispositions, and the fix loop

The round is audited in **`01-design/reviews.md` — permanent** (the
Review tab left the blueprint; this file is the proof the review
happened, and it survives the stage):

1. Record the round: one section per reviewer — verdict, run id (from
   the workflow's journal, not from your prose), what it verified,
   findings.
2. Give **every finding a disposition**: `fixed` / `to-user` /
   `rejected` (with the reason; rejecting a blocker requires the
   user's explicit sign-off).
3. Send the `fixed` findings to the **same author** via SendMessage — it
   revises the docs (single writer). `to-user` items go into the
   checkpoint message.
4. Run the workflow again — **all ten, always**; fixing data moves
   contracts, fixing contracts moves code. Repeat until a round returns
   **zero blockers**.

## 4 — The blueprint

Fill the `design` key of the wave's `blueprint.html` (the conductor owns
the blueprint — it is a projection of the docs, not a doc) and republish
the same file path. Nine Design subtabs: **Glossary · How it works · UI ·
Data · Infra & cost · Code · Security · Alarms · Going to production**.

- **Decisions permeate the tabs**: each tab's data carries the decision
  cards that belong to that context; the ones `decided in your place`
  get the orange highlight, and the Overview shows the count so the
  user knows how many to look for.
- Contracts have **no tab**: `contracts.md` is machine input — the
  frozen bridge the planning stands on — reviewed by `design-contracts`,
  consulted by whoever needs it.
- Never mermaid; diagrams are HTML/CSS with the shell's primitives.

## 5 — Checkpoint and closing

Present: the blueprint URL, the verdict table (all ten, from
`reviews.md`), the `decided in your place` count, and any `to-user`
items. Approval is explicit. On approval: `.state.md` → `stage: plan`,
move the Linear Project (via the MCP — its absence halts, as at every
stage boundary), commit the workstream
folder — **push only with the user's explicit approval** — and
suggest `/clear` before stage 3 (house rule: stage transitions, in the
repo's `CLAUDE.md`). On "approved with fixes": author applies, full
round again, close. On rejection: the reasons go back to the author —
**never back to stage 1**; whatever is missing becomes questions to the
user, answered in conversation and folded into the design.

## Lifecycle

- **Permanent:** everything in `01-design/` — documents, `research/`,
  `ui-screens/`, and `reviews.md`. (`ui-screens/` is the local SOURCE of
  the screens published to Claude Design: DesignSync uploads files from
  disk, so the screens live here in git — versioned with the wave — and
  render there as the cards the user validates. Same content, two
  homes: the repo is the source of record, the project is the viewing
  surface.)
- **Working:** the author's scratch notes, if any — gone at close.

## Boundaries

No issue decomposition (stage 3). No code (stage 4). The discovery fence
does not reopen silently — unviable in-scope items become declared
decisions. Frictions worth learning from go to the workstream's
`dreaming-notes.md` on the spot; judging them is stage 7's job.
