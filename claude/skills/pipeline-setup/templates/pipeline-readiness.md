# Pipeline readiness — <project>

Audited at `<sha>` on `<date>` against the pipeline's bar
(`docs/project-contract.md` in the pipeline repo) by `/pipeline-setup`.
✓ present · ~ partial · ✗ missing · n/a does not apply.

| Layout | |
|---|---|
| Sessions open in | `<session root(s)>` — Claude Code loads `.claude/settings.json` from there |
| Product repository | `<path>` · default branch `<branch>` at `<sha>` |
| Doctrine | `<folder>` in `<the product repository, or the root repository at its path>` |
| Remote | `<GitHub owner/repo, or "non-GitHub: <kind>">` |
| Scouts read | a detached worktree at `<sha>`, not the working tree |

| Level | ✓ | ~ | ✗ | n/a |
|---|---|---|---|---|
| Required (1–13, 22, 23) | <n> | <n> | <n> | <n> |
| Recommended (14–17, 24) | <n> | <n> | <n> | <n> |
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
| 13 | Local-CI signoff main accepts (two contexts) | | | |
| 22 | Mock toolchain (station): Node, playwright-core, Chromium | | `<probe output>` | |
| 23 | The smoke: journey command against a URL, read-only journeys marked | | | |

## Recommended

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 14 | Verify map in feature maps | | | |
| 15 | Design tokens and components exported | | | |
| 16 | Observability as code | | | |
| 17 | Parallelism capacity, measured | | | |
| 24 | Gate sized to the change: one primary width per entry, evidence off, server suites once, non-UI files select no screen tests | | | |

## For the full experience

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 18 | Autonomous release permissions | | | |
| 19 | Progressive delivery | | | |
| 20 | Cloud environment for entries: setup script under ~5 min, SessionStart stack-up on `CLAUDE_CODE_REMOTE`, test-only env vars, permissions, network allowlist, browsers, the pipeline vendored | | | |
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
| <a doctrine ruling: `local-ci` becomes the check `main` requires> | <the doctrine names another required check; the lines it changes: `file:line`> | <the doctrine edit, then the protection command below> |
| <require the `local-ci` context on `main`> | <branch protection is a security posture> | `<! gh api ...>` |

## Applied

Branch `<branch>` from `<base sha>`:

| Commit | Gap (#) | Files | Checked by |
|---|---|---|---|
| `<sha>` | <#> | `<paths>` | <the command that proved it> |

Doctrine, in `<the doctrine's repository>`, branch `<branch>`:

| Commit | Gap (#) | Doctrine lines | Why |
|---|---|---|---|
| `<sha>` | <#> | `<file:line>` | <the reason the commit message gives> |

Rules removed as dead (their target not found by the runner's dry run):
`<rules>`, or "none".

**Final proof:** `<the whole-gate command>` at `<branch tip sha>`:
`<its last output line, verbatim>`.
