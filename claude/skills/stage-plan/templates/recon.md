# Recon — `<area>` — <date>

<!--
  Written by `plan-scout (Sonnet 5.5, low)` from one area of the
  codebase and its docs only; nothing from the cloud, nothing from
  memory. Every line says where it was read (a path, a line). This is
  A: what exists before the demand. The conductor reads it before the
  cut; the writers copy its commands, targets, paths, seams and golden
  paths into the briefs. The area `fronts` uses the second template at
  the bottom of this file.

  Write these headings, in this order. A question the conductor added
  is answered under the heading it belongs to, or under "The
  conductor's questions" at the end; never instead of the template.
  These comments are instructions to you: none of them reaches the file.
-->

**Base:** `<repo>@<branch> <sha>` (the head of the base branch when you read it)

## In one paragraph

<what this area is (a backend module, a frontend app, a pipeline, the infra) and how it is built and tested>

## Commands

<!-- the commands the doctrine names for each role of the pipeline's
     project contract, as this codebase has them -->

| Role | Command | Read at |
|---|---|---|
| the gate | `<command>` | `<file:line>` |
| the fast check | | |
| focused tests (one module, one spec) | | |
| journeys | | |
| stack up · env · down | | |

## Gate rules that bite a plan

<!-- The rules of the gate commands and the test env that decide how a
     foundation and its stubs can pass: a linter that rejects unused
     code (tests included?), a coverage floor and the command that
     measures it, a file-size or structure limit, a test clock (shared?
     forward-only?), the lifetime of fake tokens or sessions against
     that clock, what the per-change gate runs that the whole gate does
     not. Each with the config line that sets it. -->

| Rule | Where it bites | Read at |
|---|---|---|
| <`unused` runs on test files too> | <a helper with no caller fails the gate> | <`.golangci.yml:12`> |
| <coverage ≥ 100 % combined, only in the whole gate> | <stubs uncovered until filled> | |
| <a file over 681 lines fails the structure check> | <one journey file per screen state> | |
| <the test clock only moves forward, one per package> | <cases pinned to instants depend on order> | |
| <fake identity tokens expire 1 h after issue, on that clock> | <a case that moves the clock days ahead gets 401> | |

## Tests today

| Suite | Where | Cases | Duration when stated | Read at |
|---|---|---|---|---|
| unit | | | | |
| integration | | | | |
| journeys | | | | |

Factories and fixtures that exist: <one line each, with the path>

## What the design's entries will extend

| Design names | Exists as | Read at |
|---|---|---|
| table `<name>` | `<path>`, keys … | |
| route `<METHOD /path>` | `<path>` | |
| screen `<name>` | `<path>` | |

## Golden paths

<!-- For each kind of code that the design adds in this area, the
     exemplary module the builder follows. The source is the project's
     golden paths file when the doctrine has one. Otherwise pick the
     existing instance that follows the doctrine's layering, has its
     tests and is the smallest of its kind. Say which rule picked it.
     A kind with no instance here is "none": the foundation creates
     the first one. -->

| Kind | Exemplar | Why this one | Read at |
|---|---|---|---|
| route · use case | `<path>` | golden paths file line / follows the doctrine, has tests, smallest | |
| screen · form | | | |
| job | | | |
| integration test · journey | | | |
| <a kind the design adds> | none — the foundation creates it | | |

## Seams that exist

<!-- Interfaces the design's nodes will call across a boundary, with
     their fakes and contract suites when they exist. A seam with no fake
     is one the foundation must complete. -->

| Interface | Fake | Contract suite | Read at |
|---|---|---|---|
| `<orders.Store>` | `<fake.Store>` · none | `<RunStoreContract>` · none | |

## Hot files

<!-- The files of this area that many changes touch: `git log
     --since=60.days --name-only --format= -- <area> | sort | uniq -c |
     sort -rn | head -15`. A hot file two nodes would edit is made cold
     by the plan (one file per thing plus a generated aggregate) or
     owned by the foundation. -->

| File | Commits in 60 days | What it aggregates |
|---|---|---|
| `<docs/features/team.md>` | <88> | <one row per feature> |

## What does not exist yet

<what the design names that has no file here: the foundation or an entry creates it>

## Shared files this area writes to

<the files the doctrine marks as shared (migrations, the API contract, the generated code, the module registry): the paths an entry must not edit after the foundation>

## What the generators write

<!-- Every generator command of this area (the contract's, the
     database queries', mocks, any `gen` target), run once at the base
     sha in a scratch worktree: `git worktree add --detach <tmp> <sha>`,
     `touch <tmp>/.gen-mark`, the command, then `find <tmp> -type f
     -newer <tmp>/.gen-mark -not -path '*/.git/*'` (every file it
     wrote, changed or not) and `git -C <tmp> status --porcelain` (the
     drift on the base), then `git worktree remove --force <tmp>`. Every
     path it writes goes in F's Owns. "none" when the area has no
     generator; "did not run" with the error when it failed. -->

| Command | Writes (paths, globs when one directory holds them all) | Drift on the base | Read at |
|---|---|---|---|
| `<make gen>` | `<api/gen/*.go>`, `<web/src/api/schema.d.ts>` | <none / the files git status lists> | <scratch worktree at <sha>> |

## Not verified

<what the docs say and the code does not show, or the reverse; one line each>

<!-- ======================= the area `fronts` =======================

# Recon — other fronts — <date>

Read: the designs root's `_coordination.md` when the project keeps one;
every workstream folder's `.state.md` whose stage is not `closed`; the
codebase's branches (`git branch -a --sort=-committerdate`), and, per
running branch, the files it changed against main (`git diff --stat
main...<branch>`). Facts only, each with where it was read.

## Running fronts

| Workstream | Stage | Branch | Files changed (count) | Read at |
|---|---|---|---|---|
| <slug> | <execute> | `<feat/slug>` | <n> | |

## Overlap with this design

<!-- Every path a running front changed that this design's areas will
     touch (from code.md / architecture.md), and every shared file
     (migrations, contract, generated code, registry) a front changed. -->

| Path | Front | What it changed there | Read at |
|---|---|---|---|
| `<api/openapi/paths/orders.yaml>` | <slug> | <adds GET /orders/export> | `git diff main...<branch> -- <path>` |

## Behaviour this design needs from a front

<what this design calls that a running front is building and main does not have yet, with where the design says it; "none">

## Unmerged branches

<!-- Every branch not merged into the base that changed in the last 30
     days (`git branch -a --no-merged <base> --sort=-committerdate`),
     with or without a workstream folder; per branch, the shared files
     it changes (the next migration number above all). -->

| Branch | Last commit | Shared files it changes | Read at |
|---|---|---|---|
| `<origin/feat/slug>` | <date> | <`db/migrations/00005_…`> | `git diff --stat <base>...<branch>` |

## Coordination notes

<the lines of `_coordination.md` that name an area, a file or a window this design touches, quoted with their line; "none"; a base it names that is older than the base branch's head, quoted as such>
-->
