# Proposal — <workstream>

<!--
  Written by the architect (Opus 5.5, high), one agent for the whole
  stage. Edited in place: one version of each decision; each change is
  a row of "Changes per round". Read in ten minutes, about 15 KB: the
  columns, the JSON and the test cases are the documents' job.
  The bar is references/right-sizing.md: the simplest design that
  meets every AC and the floor, with the primitives already running.
-->

Status: <draft | round <n> | closed <YYYY-MM-DD> — "<his words>">
Base: <repo>@<branch> <sha> (from recon/)

## The problem

<two or three sentences: what the stories ask for, in his words where he gave them>

## The solution in one picture

```mermaid
flowchart LR
  <the parts, where each runs, the arrows labelled: writes, reads, calls, sends>
```

<one paragraph: how it works, end to end>

## The parts

| Part | Where it runs | Does | Why it exists (req) |
|---|---|---|---|
| <part> | <repo, module> | <one line> | <J1.s2.1> |

## The main flows

### <flow> (covers S-00N)

1. <one action per step, the part named, the value said>

When it fails: <the failure that matters and what the user sees, one line each>

## The versions

<!-- references/right-sizing.md §3 B. v1 is what gets built. -->

| Version | What it is | Signal to move (with a number) | Who watches it | Cost |
|---|---|---|---|---|
| v1 | <built now> | — | — | <estimate> |
| v2 | <what it adds> | <the signal> | <the alarm, query or weekly read> | <cost> |

## The floor this demand touches

- <floor item or standards rule> — <how v1 meets it>

## Where I disagree with you

<!-- Only on a concrete reason: an AC his idea fails, a floor item, a
     cost, a one-way door, a standard. "None." is complete. "Settled"
     is filled during the debate, with his words. -->

| You said | I propose | Why | Settled |
|---|---|---|---|

## The names

<!-- Every domain name the documents copy, spelled once: tables,
     columns that carry a rule, enum values, routes, error codes,
     events, flags, alarms, modules, screens. -->

| Kind | Name | Note |
|---|---|---|

## Premises

- <what the proposal leans on> — <confirmed: path:line or the fetched page | not confirmed: what changes if false>

## The guard's cuts

| Cut | Applied or rebutted | Why (the AC, floor item or risk, for a rebuttal) |
|---|---|---|

## Changes per round

| Round | What changed | Because (his point, quoted) | A part added or removed? |
|---|---|---|---|
