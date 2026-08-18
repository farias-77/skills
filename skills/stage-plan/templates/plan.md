---
workstream: <slug>
wave: wNN
repo: <repo>
status: Draft   # Draft → Reviewed → Approved → Bootstrapped
---

# Execution plan — `<repo>`

<!--
Machine input: consumed by the review lenses, the bootstrap agent, and
the blueprint. The user reads the Plan tab. No presentation prose.

Must-haves this template carries:
- the logic: WHY the plan has this shape (skeleton or not — and why;
  where the risk is; the accepted bottleneck)
- batches with intent; edges each with a ONE-LINE reason (longer than a
  line ⇒ not an edge); ZERO cross-repo edges, ever
- the coverage map: every story AC landing in this repo → its issue(s)
- the issue index: bodies live in issues/, one file per issue — this
  file stays short
- NO per-issue file lists: the worker is free to touch what it needs;
  small overlaps (barrel exports, index lines) are accepted and
  resolved at merge
- decisions inline where they apply, house decision-block format
-->

## The logic of the plan

<Why this shape: skeleton or no skeleton (and why), where the risk is
and how it was sliced, the accepted bottleneck, how the foundation was
kept thin.>

## The batches

| Batch | Intent | Issues |
|-------|--------|--------|
| 1 | <foundation: fixtures from the contract, shared types> | 01 · 02 |
| 2 | <the fan: one vertical flow each> | 03 · 04 · 05 |
| 3 | <integration> | 06 |

**Critical path:** `01 → 03 → 06` (<K> issues).

## The edges, with reason

| Issue | Waits for | Because it consumes |
|-------|-----------|---------------------|
| 03 | 01 | the `<X>` types 01 produces |

## Coverage map

Every story AC that lands in this repo. An AC deferred to a later wave
carries its decision block; an issue delivering no AC justifies itself
in its row.

| Story AC | Delivered by |
|----------|--------------|
| `<SLUG>-S-001-AC-1` | 03 |
| `<SLUG>-S-001-AC-2` | 03 · 04 |

## The issues

Bodies in [issues/](issues/) — one file per issue, the exact GitHub
body. GitHub numbers are filled by the bootstrap.

| Issue | File | Title | Batch | GitHub |
|-------|------|-------|-------|--------|
| 01 | `issues/01-fixtures-from-contract.md` | `chore(<scope>): fixtures from the frozen contract` | 1 | |
| 02 | `issues/02-<slug>.md` | `feat(<scope>): <verb> <noun>` | 1 | |
