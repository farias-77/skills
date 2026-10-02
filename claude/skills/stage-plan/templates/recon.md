# Recon — `<area>` — <date>

<!--
  Written by a plan-scout (Sonnet 5.5, low) from one area of the
  codebase and its docs only; nothing from the cloud, nothing from
  memory. Every line says where it was read (a path, a line). This is
  A: what exists before the demand. The conductor reads it before the
  cut; the writers copy its commands, targets, paths and golden paths
  into the briefs.
-->

## In one paragraph

<what this area is (a backend module, a frontend app, the ingestion, the infra) and how it is built and tested>

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

## What does not exist yet

<what the design names that has no file here: the foundation or an entry creates it>

## Shared files this area writes to

<the files the doctrine marks as shared (migrations, the API contract, the generated code, the module registry): the paths an entry must not edit after the foundation>

## Not verified

<what the docs say and the code does not show, or the reverse; one line each>
