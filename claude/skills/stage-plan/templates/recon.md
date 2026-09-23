# Recon — `<area>` — <date>

<!--
  Written by a plan-scout (Haiku 4.5, max) from one area of the
  codebase and its docs only; nothing from the cloud, nothing from
  memory. Every line says where it was read (a path, a line). This is
  A: what exists before the demand. The conductor reads it before the
  cut; the writers copy its commands, targets and paths into the briefs.
-->

## In one paragraph

<what this area is (a backend module, a frontend app, the ingestion, the infra) and how it is built and tested>

## Commands

| What | Command | Read at |
|---|---|---|
| the whole gate | `make verify` | `Makefile:12` |
| fast loop | `make check` | |
| unit / integration of one module | `make test-integration pkg=<module>` | |
| journeys | `pnpm --filter <app> test:e2e <spec>` | |
| the local stack | `make up` · `make env` · `make down` | |

## Tests today

| Suite | Where | Cases | Duration when stated | Read at |
|---|---|---|---|---|
| unit | `internal/<module>/…_test.go` | | | |
| integration | `tests/integration/<module>/` | | | |
| journeys | `frontend/<app>/e2e/journeys/` | | | |

Factories and fixtures that exist: <one line each, with the path>

## What the design's entries will extend

| Design names | Exists as | Read at |
|---|---|---|
| table `orders` | `database/migrations/0007_orders.sql`, keys … | |
| route `GET /orders` | `internal/orders/http/list.go` | |
| screen `Orders` | `frontend/tracking/src/features/orders/pages/…` | |

## What does not exist yet

<what the design names that has no file here: the foundation or an entry creates it>

## Shared files this area writes to

<the migrations folder, openapi.yaml, the generated code, the composition root: the paths an entry must not edit after the foundation>

## Not verified

<what the docs say and the code does not show, or the reverse; one line each>
