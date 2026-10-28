# Standards · <project>

<!-- Read first by every pipeline stage and every reviewer. Seeded by the
kit's `standards` skill; the project owns every line and changes it only
by pull request. Rule ids are never changed and never reused. -->

The rules this project is built, reviewed and run by. Every stage reads
the files below, and every review finding cites a rule by its id.

## The files

| File | Covers | Ids | Owner |
|---|---|---|---|
| `architecture.md` | the system map: context, modules and layers, golden paths, infrastructure, data, integrations, how it grows | `ARC-n` | `<CODEOWNERS entry>` |
| `engineering.md` | how code is written: structure, naming, errors, logs, configuration, APIs, data and migrations, concurrency, dependencies, git | `ENG-n` | `<CODEOWNERS entry>` |
| `testing.md` | what proves what: the layers, the floor, determinism, journeys, actors and fixtures | `TST-n` | `<CODEOWNERS entry>` |
| `security.md` | access and scope, personal data, secrets, input, abuse, the floor cases | `SEC-n` | `<CODEOWNERS entry>` |
| `design-system.md` | tokens, components, patterns, content, surfaces, accessibility | `DS-n` | `<CODEOWNERS entry>` |
| `operations.md` | environments, delivery, release, flags, migrations in production, rollback, alarms, backups, incidents, production access | `OPS-n` | `<CODEOWNERS entry>` |
| `features/<domain>.md` | one feature map per domain: rules, screens, routes, tables, jobs, how to drive it | `<DOMAIN>-n` | `<CODEOWNERS entry>` |

Every rule of the project lives in this folder, in English. A file the
project does not need is one line in its place: `None: <why>`.

## The two pages

| Page | Drawn from | Link |
|---|---|---|
| `Architecture - <project>` | `architecture.md` | `<url>` |
| `Design System - <project>` | `design-system.md` and the exported tokens | `<url>` |

The `standards` skill rebuilds a page when its source file changes.

## How to read it

| Stage | Reads |
|---|---|
| discovery | `design-system.md`, the feature maps |
| design | `architecture.md`, `engineering.md`, `security.md`, `operations.md` |
| plan | the golden paths in `architecture.md`, the gate commands in `CLAUDE.md` |
| execute | `engineering.md`, `testing.md`, `security.md`, `design-system.md`; updates `architecture.md` and the feature maps in the same diff |
| release | `operations.md` |
| weekly retro | the whole book and the week's citations |

## How a rule changes

1. Open a pull request against this folder. Its description gives the
   why and the evidence: a finding id, a `path:line`, an incident.
2. The owner named above for that file approves it.
3. A new rule takes the next free id of its file.
4. Ids are never renumbered and never reused.
5. A dropped rule stays in place with its id, marked
   `(retired YYYY-MM-DD: <why>)`.
6. The pipeline proposes changes here; a person merges them.

## Proposals waiting

The `standards` skill adds one row per proposal harvested from the
workstreams. A row leaves the table when its pull request merges or
is declined.

| Date | File | Proposed rule | Evidence | Status |
|---|---|---|---|---|
