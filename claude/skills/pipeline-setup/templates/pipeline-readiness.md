# Pipeline readiness — <project>

Audited at `<sha>` on `<date>` against the pipeline's bar
(`docs/project-contract.md` in the pipeline repo) by `/pipeline-setup`.
✓ present · ~ partial · ✗ missing · n/a does not apply.

| Layout | |
|---|---|
| Sessions open in | `<session root(s)>` — Claude Code loads `.claude/settings.json` from there |
| Product repository | `<path>` · default branch `<branch>` at `<sha>` |
| Standards | `<folder>` in `<the product repository, or the root repository at its path>` |
| Remote | `<GitHub owner/repo, or "non-GitHub: <kind>">` |
| Scouts read | a detached worktree at `<sha>`, not the working tree |

| Level | ✓ | ~ | ✗ | n/a |
|---|---|---|---|---|
| Required (1–16) | <n> | <n> | <n> | <n> |
| Recommended (17–19) | <n> | <n> | <n> | <n> |
| Full experience (20) | <n> | <n> | <n> | <n> |

**Verdict:** <one sentence: which stages can run today, and the first
gap that halts one>.

## Required

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 1 | Standards and the commands table | <✓/~/✗> | `<path:line>` — "<literal quote>" | <what is missing, or —> |
| 2 | Golden paths | | | |
| 3 | The fast check | | | |
| 4 | The entry gate, sized to the change | | | |
| 5 | The whole gate, run locally | | | |
| 6 | The signoff command and `local-ci` required on `main` | | | |
| 7 | Gate paths and the floor | | | |
| 8 | A stack per worktree, test actors, the sweep | | | |
| 9 | Shared files and migrations | | | |
| 10 | Feature maps, with how to drive each feature | | | |
| 11 | A browser-drivable app | | | |
| 12 | Delivery: staging, production on a tag, watch, rollback | | | |
| 13 | The smoke and the staging actors | | | |
| 14 | Permissions, the guard and the authorization, in every session root | | | |
| 15 | Agent identities | | | |
| 16 | The station's toolchain | | `<probe output>` | |

## Recommended

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 17 | The house lint and the structure check | | | |
| 18 | Design tokens and components, exported | | | |
| 19 | Observability as code | | | |

## Full experience

| # | Role | | Evidence | Gap |
|---|---|---|---|---|
| 20 | A cloud environment for entries | | | |

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
| <require `local-ci` on `main`'s ruleset> | <branch protection is a security posture> | `<! gh api ...>` |
| <create the bot identity and its token for the signoff command> | <an identity and a secret> | `<the steps>` |

## Applied

Branch `<branch>` from `<base sha>`:

| Commit | Gap (#) | Files | Checked by |
|---|---|---|---|
| `<sha>` | <#> | `<paths>` | <the command that proved it> |

Standards, in `<the standards's repository>`, branch `<branch>`:

| Commit | Gap (#) | Standards lines | Why |
|---|---|---|---|
| `<sha>` | <#> | `<file:line>` | <the reason the commit message gives> |

Rules removed as dead (their target not found by the runner's dry run):
`<rules>`, or "none".

**Final proof:** `<the whole-gate command>` at `<branch tip sha>`:
`<its last output line, verbatim>`.
