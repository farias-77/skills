# Plan review — <workstream>

<!--
  Written by THE CONDUCTOR (Opus 5.5, high) from 02-plan/reviews/round-1.json
  (the workflow's return, the authority), in one pass, the rulings
  written before any fix leaves. One round: the fixes are applied and
  verified by reading, never re-reviewed. Nobody is asked.

  These comments are instructions to you: none of them reaches
  reviews.md (the plan's checker refuses an HTML comment).
-->

## Round 1 — <date> · run <id>

**Checker before the round:** `<✓ graph holds · width n · depth n · critical F → … (weight n)>`

| Lens | Verdict | Findings | Dropped by the filter | Unread |
|---|---|---|---|---|
| plan-reviewer | | | — | — |
| plan-blind-reader | | | <n> | <briefs, or none> |

## Findings and rulings

| Id | Brief | Finding | Ruling | Owner | Why |
|---|---|---|---|---|---|
| <plan-reviewer#1> | <E-02> | <the false edge to E-01> | sustained | planner | <factory.Order seeds the order> |
| <plan-blind-reader#1> | <E-01> | <the 422 code of a past day is missing> | sustained | writer | <data-and-contracts.md §Orders gives `day_in_past`> |
| <plan-reviewer#2> | — | <…> | dismissed | — | <the sentence that forecloses it, quoted> |

## Applied and verified

| Id | What changed | Verified (file:line) |
|---|---|---|
| <plan-reviewer#1> | <edge dropped; checker green> | `plan.graph.json:42` · `<✓ graph holds …>` |

## Close

sustained <n> (writer <n> · planner <n>) · dismissed <n> · unread <briefs, or none> · the checker with --briefs: `<summary line>`
