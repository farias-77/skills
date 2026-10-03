# Pipeline readiness — <project>

Audited at `<sha>` on `<date>` against the pipeline's bar
(`docs/project-contract.md` in the pipeline repo) by `/pipeline-setup`.
✓ present · ~ partial · ✗ missing · n/a does not apply.

| Level | ✓ | ~ | ✗ | n/a |
|---|---|---|---|---|
| Required (1–12) | <n> | <n> | <n> | <n> |
| Recommended (13–17) | <n> | <n> | <n> | <n> |
| Full experience (18–21) | <n> | <n> | <n> | <n> |

**Verdict:** <one sentence: which stages can run today, and the first
gap that halts one>.

## Required

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 1 | Doctrine folder and index | <✓/~/✗> | `<path:line>` — "<literal quote>" | <what is missing, or —> |
| 2 | Golden paths file | | | |
| 3 | The gate, run locally | | | |
| 4 | Fast check · focused · affected tests | | | |
| 5 | Stack up / env / down per worktree, actors | | | |
| 6 | Evidence command | | | |
| 7 | Structure check and comparison | | | |
| 8 | Shared files list | | | |
| 9 | Feature maps | | | |
| 10 | Browser-drivable app | | | |
| 11 | Release roles | | | |
| 12 | Permission settings and guard hook | | | |

## Recommended

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 13 | Local-CI signoff main accepts | | | |
| 14 | Verify map in feature maps | | | |
| 15 | Design tokens and components exported | | | |
| 16 | Observability as code | | | |
| 17 | Parallelism capacity, measured | | | |

## For the full experience

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 18 | Autonomous release permissions | | | |
| 19 | Progressive delivery | | | |
| 20 | Cloud runner | | | |
| 21 | Video toolchain (station) | | `<probe output>` | |

## Probes

```
<the probe commands and their output, verbatim>
```

## Where the scouts looked

<per group: the folders and terms searched; what they did not find>

## The plan — cheapest first

| Step | Gap (#) | Fix | Cost | Template | Applied by |
|---|---|---|---|---|---|
| 1 | <#> | <one line> | S · M · L | `<template>` or — | setup · the team · a demand |

Cost: **S** a template copied and filled, under an hour · **M** adapted
to the stack, a few hours · **L** engineering work, carried as a
demand of its own through the pipeline.

## What only the user can do

| Action | Why it is his | Ready command |
|---|---|---|
| <require the `local-ci` context on `main`> | <branch protection is a security posture> | `<! gh api ...>` |

## Applied

Branch `<branch>` from `<base sha>`:

| Commit | Gap (#) | Files | Checked by |
|---|---|---|---|
| `<sha>` | <#> | `<paths>` | <the command that proved it> |
