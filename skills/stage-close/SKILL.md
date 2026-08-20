---
name: stage-close
description: Conducts stage 6 (Closure & Dreaming) of the pipeline — verifies the shipped wave's quiet window, writes the closure record, sweeps the boards, and runs the autonomous dreaming pass — every collected friction becomes a class or a discard, pipeline-class lessons become direct revertible edits to the skills within a declared boundary, and the next wave opens (or the workstream closes). Use after the release closes, or to resume a closure in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Artifact, AskUserQuestion, ScheduleWakeup, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *), Bash(rm *)
---

# Stage 6: Closure & Dreaming

The wave is live. This stage does two things nothing else does: it
**archives the wave as a complete record**, and it **makes the
pipeline better than it was when the wave started** — the frictions
every stage noted on the spot become edits to the skills themselves.
It is the most autonomous stage of the pipeline: one human gate, at
the end, over the full report.

## Preconditions

`.state.md` says `stage: close` and names the wave; the release trace
shows the prod train completed. Missing ⇒ halt, back to stage 5. The
Linear Project moves to its closing status via the Linear MCP — **the
MCP missing is a halt**. (Each stage moves the Project when it opens.)

## What this stage produces

```
designs-root/2026-08-15-workspace-invites/
└── w01-invite-by-email/
    └── 05-close/
        ├── closure.md             # the wave's final record — what shipped, what didn't, who owns what's left
        └── dreaming/
            └── ledger.md          # every note judged: class, destination, action or discard — with reasons
```

Plus: the pipeline repo's own commits (the dreaming's applied
lessons, one per change, revertible), the boards swept, and the next
wave opened — or the workstream Done.

## 1 — The quiet window

Prod has been live since the release; before closing, verify it is
**quietly** live: the alarms silent over the window the rollout
defined, no error-rate drift, nothing in the release's `pending`
still burning. Noise here is not this stage's to fix — it is a fix
issue routed back through the machinery; the closure waits.

## 2 — Closure

Write `05-close/closure.md` from
[templates/closure.md](templates/closure.md): what shipped (versions,
the wave's stories), what was deliberately left out and why, the
pendencies with named owners, and the numbers that tell the wave's
story (issues, rounds, halts). Sweep the boards: every issue of the
wave closed or explicitly re-homed, the Linear Project to its final
state for this wave. The blueprint gets the wave's final touch —
shipped, dated, same URL forever.

## 3 — Dreaming — the pipeline learns, inside a boundary

The input already exists: the workstream's `dreaming-notes.md`, fed
on the spot by every stage — every failure, every halt, every
surprise. The pass:

1. **Ledger.** Every note becomes an entry in
   `05-close/dreaming/ledger.md`: what happened, where it bit, the
   evidence. No note is skipped — a note that goes nowhere is
   recorded as a discard, never silently dropped.
2. **Classes, not incidents.** The hard ruler: a lesson must
   generalize — "this will bite again, anywhere this pattern
   appears". Case-specific misfortune is discarded with one line of
   why. When in doubt, it is an incident.
3. **Triage by destination** — the pipeline repo is shared across
   ventures, so every class is routed before it is written:
   - **Pipeline-class** → a direct edit to THIS repo's skills,
     agents, workflows, or standards;
   - **Venture-class** → the venture's own `CLAUDE.md`/docs — never
     into the public pipeline;
   - **Repo-class** → a gotcha in that product repo's `docs/` (the
     docs standard's self-healing, exercised from here).
4. **The autonomy boundary.** Behavior adjustments — an agent's
   prompt, a skill's rule, a standard's line — are applied
   **directly**: one commit per change, revertible, the motivating
   ledger entry in the commit message. **Escalates to the user,
   always:** topology (who conducts what), model/cost choices, human
   gates (adding, removing, or moving one), anything touching prod,
   product decisions, and recurrence rules. An escalation is a ledger
   entry with a proposal, not an edit.
5. **Transparency is the gate.** The final report — the full ledger,
   the applied edits with their commits, the discards with reasons,
   the escalations awaiting the user — is this stage's single human
   checkpoint. The edits are already live; the report is what makes
   them auditable and cheap to revert.

The editing itself obeys the house: surgical diffs, the standards'
own rules applied to editing the standards, and **push only with the
user's explicit approval** — the commits wait locally with everything
else.

## 4 — The wave loop

Read `waves.md`:

- **A next wave exists** ⇒ `.state.md` → `stage: design · wave: wNN+1`
  — its design starts from the README seed the cut created; commit the
  workstream folder and suggest `/clear`: the session continues into
  stage 2 of the new wave, with the shipped wave as living context in
  the repos' docs.
- **That was the last wave** ⇒ the workstream is **Done**: the Linear
  Project closed, the folder committed, the blueprint final. Say so
  plainly — done is done.

## Gates

| Gate | Rule |
|---|---|
| Quiet window | closure only over a verified-quiet prod; noise routes back as a fix issue |
| Every note judged | ledger covers 100% of dreaming-notes — action, escalation, or reasoned discard |
| Class, not incident | what does not generalize does not edit anything |
| Destination triage | venture- and repo-class lessons never land in the public pipeline repo |
| The boundary | behavior edits direct and revertible; topology/cost/gates/prod/product/recurrence escalate |
| One commit per lesson | every applied edit is independently revertible, motivated in its message |
| Transparency | the report is the gate — nothing learned in silence |

## Lifecycle

- **Permanent:** everything under `05-close/`, and the workstream's
  `dreaming-notes.md` (consumed, kept — it is the ledger's source).
- **Working:** nothing — this stage's scratch is its output.

## Boundaries

No new features, no fixes beyond routing what the quiet window
surfaces. The dreaming edits process, never product. This is the last
stage: what it does not close, it re-homes with a named owner — a
workstream never ends with unowned loose ends.
