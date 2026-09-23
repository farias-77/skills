# Release plan — <workstream>

<!--
  Written by the SESSION from the audit, the execution record, the
  design's rollout and the doctrine's delivery standard. Every step and
  check is copied from those, never paraphrased. Timestamps from
  `date -u`.
-->

- **Written:** <YYYY-MM-DD HH:MM UTC>
- **The ask ("vai?"):** <his words, verbatim, with the hour> | not yet asked

## What ships

| Entry | What it delivers | Merged at |
|---|---|---|
| <E-nn> | <one line> | `<sha>` |

- **Amendments:** <F.n, one line each> | none
- **Residue he accepted at the audit:** <one line each, with what it touches in production> | none

## Versioned artifacts

| Artifact | Last version | Bump (from the commits) | Expected |
|---|---|---|---|
| `<artifact>` | `vX.Y.Z` \| none | major \| minor \| patch | `vX.Y.Z` |

## Pre-flight — only he can do these

| # | What | Why the session cannot | Status |
|---|---|---|---|
| 1 | <what> | <why> | **done** <date> \| **delegated:** <how, where the value lives> |

## Staging

| # | The session | The CI | Check (read-only) → expected |
|---|---|---|---|
| 1 | PR `feat/<workstream>` → `<staging branch>`, merge on green | deploys staging, runs the staging suite | `<command>` → `<value>` |

## Production (after "vai")

| # | The session | The CI | Check (read-only) → expected |
|---|---|---|---|
| 1 | merge the release PR `<staging branch>` → `main` | deploys the same artifact, runs its checks, rolls back on red | `<command>` → `<value>` |

**Rollback:** <the doctrine's automatic rollback, one line> · safe for data: yes | **no: <why>**

## The watch

| # | What | Readable at (UTC) | Expects | Read by |
|---|---|---|---|---|
| 1 | <what> | <YYYY-MM-DD HH:MM> | <value> | `<command>` |

## Where the session stops

- The third red on one step.
- A rollback not safe for data: <which, why> — stops before the production merge. | none
- A pre-flight item found missing.
