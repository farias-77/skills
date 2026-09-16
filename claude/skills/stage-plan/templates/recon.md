# Recon — `<repo>` — <date>

<!--
  Written by a plan-scout (Haiku 4.5, max) from the repo and its docs
  only; nothing from the cloud, nothing from memory. Every line says
  where it was read (a path, a line). This is A: what exists before
  the demand. The conductor reads it before the cut; the writers copy
  its commands and counts into the goals.
-->

## In one paragraph

<what the repo is, how it deploys, what is in alpha today>

## Commands

| What | Command | Read at |
|---|---|---|
| deploy alpha | `npm run deploy:alpha` | `package.json:12` |
| one smoke folder | `bash smoke/run.sh <folder>` | `docs/testing.md:40` |
| whole suite | `bash smoke/run.sh` | `docs/testing.md:44` |
| unit tests · build | | |
| dev server (front) | | |

## Smoke layout

| Folder | Cases | What it proves | Read at |
|---|---|---|---|
| `smoke/users/` | 14 | | |

Whole suite: <N> cases, about <t> when the docs say; the folders that write fixtures: <list>.

## Branches and PRs

<the convention the docs fix: branch names, where PRs go, what CI runs>

## What the design's rows will extend

| Design names | Exists as | Read at |
|---|---|---|
| table `recordings` | `infra/lib/data-stack.ts:88`, keys `person_id` / `recording_key` | |
| route `GET /tracking/accounts` | `app/routes/accounts.ts` | |
| screen `Person` | `src/features/production/PersonLevel.tsx` | |

## What does not exist yet

<what the design names that has no file here: the rows that create it start from nothing>

## Stacks in alpha

<the CDK stacks and what shares them; another repo that reads this alpha (the front reading this API)>

## Not verified

<what the docs say and the code does not show, or the reverse; one line each>
