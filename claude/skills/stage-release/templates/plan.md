# Release plan — <workstream>

<!--
  Written by the SESSION before the play, from the audit, the execution
  record, the design's `operations.md` and `data-and-contracts.md`
  and the doctrine's delivery standard. Every command is copied, never
  paraphrased: "outside the plan" is decided against this file.
  Timestamps from `date -u`.
-->

- **Written:** <YYYY-MM-DD HH:MM UTC>
- **Audited head:** `feat/<workstream>` @ `<sha>`
- **The play:** <his words, verbatim, with the hour> | not yet given
- **Rollout mode:** progressive (<the platform's mechanism>) | straight (<why: no traffic control, first deploy>)

## What ships

| Entry | What it delivers | Merged at |
|---|---|---|
| <E-nn> | <one line> | `<sha>` |

- **Amendments:** <F.n, one line each> | none
- **Residue he accepted at the audit:** <one line each, with what it touches in production> | none

## Versioned artifacts

| Artifact | Paths | Tag prefix | Last version |
|---|---|---|---|
| `<artifact>` | `<paths>` | `<prefix>` | `vX.Y.Z` \| none |

## Permissions (read at step 0)

| Check | Read | State |
|---|---|---|
| guard registered on PreToolUse | `.claude/settings.json` | ok \| missing → halt |
| guard self-test | `.claude/hooks/guard-irreversible.sh --self-test` | <n>/<n> |
| allow rules for the plan's merge, deploy and migration commands | `.claude/settings.json` | ok \| under ask: <commands> (each prompts him) |
| `main` requires the local-CI signoff | branch protection | ok \| not enforced |

## Pre-flight — only he can do these

| # | What | Why the session cannot | Ready command | Status |
|---|---|---|---|---|
| 1 | <what> | <why; "the classifier reserves it" for an apply, a secret's value, a credential or person's data read, a production-deploy agent> | `! <command>` \| `! bash <scratchpad script>` | **done** <date> \| **delegated:** <how, where the value lives> |
| <n> | **the play** | the allow file is his | `! printf 'merge-from %s  # release <slug> <date>\n' <sha> >> .claude/hooks/irreversible.allow` | given <date> |

Sent to him in one message (and one PushNotification) at <YYYY-MM-DD HH:MM UTC>.

## Steps

| # | Env | The session runs | The CI does | Check (read-only) → expected |
|---|---|---|---|---|
| 1 | — | the production diff: `<command>` | — | no delete or replace on a stateful resource; counts `<n> add · <n> change` |
| 2 | main | PR `feat/<workstream>` → `main`; `gh pr merge <n> --merge --match-head-commit <head>` | the required checks; the signoff on the head | `main` @ the merge sha |
| 3 | staging | <follow / dispatch / command> | <deploys staging> | `<command>` → serves `<sha>`; migrations at `<version>` |
| 4 | staging | the smoke: `<smoke command>` against staging | — | green |
| 5 | prod | <candidate at 0% + tag \| deploy> | <…> | `<command>` → `<value>` |
| 6 | prod | the smoke against production, then the watch, 15 min | — | green; no trigger |
| … | | | | |

## The smoke

- **Command:** `<the project's journey command, the read-only journeys, against a URL>`
- **Read-only journeys:** `<journey>`, … — <why each writes nothing in that environment>

| Environment | URL | Test actors |
|---|---|---|
| staging | <url> | <the doctrine's staging actors> |
| production (tag, then live) | <url> | <the doctrine's production-safe actor> \| none: health and the sha only |

## Rollback

| Artifact | Restore command | Recorded before serving | Safe for data | Rehearsed |
|---|---|---|---|---|
| `<service>` | `<command>` | previous revision | yes \| **no: <why>** | yes \| no → runs once on staging at step 3 |

**Owner of the traffic split:** <the workflow \| the infrastructure code \| the session>

## Rollback triggers (automatic)

| Trigger | Threshold | Read by | Action |
|---|---|---|---|
| candidate smoke | any red, digest ≠ release | the smoke | never promote |
| 5xx ratio, new vs previous, same window | > <2>× and > <1>%, ≥ 100 requests | `<query>` | traffic → previous |
| p95 latency | > <1.5>× over the watch | `<query>` | traffic → previous |
| start failures, memory kills | any | `<query>` | traffic → previous |
| alarm the release touches | firing | `<command>` | traffic → previous |
| job on the new image | failed | `<command>` | job → previous image |
| migration | failed | the deploy run | stop and report |

## Migrations

| File | What it does | Expand / contract | Timeouts | Previous revision works after it |
|---|---|---|---|---|
| `<file>` | <one line> | expand | lock `<1s>`, statement `<…>` | yes |

## Toggles

| Toggle | Where | Off = old behavior | At release | Flipped by, when | Removal task |
|---|---|---|---|---|---|
| `<name>` | `<file>` | yes | off \| on | <this plan, step n \| not in this release> | <where it is tracked> |

## The watch

15 minutes after production serves, read once: the triggers above and these alarms: `<alarm>`, … (known red on a first deploy: <alarm> \| none)

## The later proofs

<!-- Only proofs with their own hour (the first scheduled run, the first real data). An alarm's first evaluation is read by the watch, not here. -->

| # | What | Readable at (UTC) | Expects | Read by |
|---|---|---|---|---|
| 1 | <what> | <YYYY-MM-DD HH:MM> | <value> | `<command>` |

## Where the session stops

Asks, before what cannot be undone:

- A contract migration · a rollback not safe for data: <which> | none
- A delete or replace on a stateful resource in the production diff
- Anything the guard asks · anything outside this plan

Stops and reports: a failed migration · the second red · a pre-flight item found missing
