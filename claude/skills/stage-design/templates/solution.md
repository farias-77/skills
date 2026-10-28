# Solution — <workstream>

<!--
  Written by the architect, one agent for the whole stage. Drafted at D2,
  edited in place through the debate (one version of each decision; each
  change is a row of "Changes per round"), expanded at the close for the
  builders. He reads the page drawn from it, not this file.
  The bar is references/right-sizing.md: the simplest design that meets
  every AC and the floor, with the primitives already running. The
  tables, routes and JSON are data-and-contracts.md's; the screens are
  screens.md's; access is security-and-access.md's. Point there, never
  copy. Rules: references/documents.md.
-->

Status: <draft | round <n> | closed <YYYY-MM-DD> — "<his words>">
Base: <repo>@<branch> <sha> (from recon/)

## The problem

<two or three sentences: what the stories ask for, in his words where he gave them>

## In one picture

```mermaid
flowchart LR
  <the parts, where each runs, the arrows labelled: writes, reads, calls, sends>
```

<one paragraph: how it works, end to end>

## The parts

| Part | Repo and path | Runs where | Does | req |
|---|---|---|---|---|
| <part> | <repo, module path> | <service, job, browser> | <one line> | <J1.s2.1> |

## The flows

### <flow> (covers S-00N)

Trigger: <who or what starts it>

1. <one action per step: the part, what it reads, writes, returns, the concrete value>

| When | The system does | The user sees |
|---|---|---|
| <the dependency times out> | <…> | <…> |

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

- <what the solution leans on> — <confirmed: path:line or the fetched page | not confirmed: what changes if false>

## The guard's cuts

| Cut | Applied or rebutted | Why (the AC, floor item or risk, for a rebuttal) |
|---|---|---|

## Changes per round

| Round | What changed | Because (his point, quoted) | A part added or removed? |
|---|---|---|---|

## Decisions

<!-- Filled at the close: each choice the debate settled, in the
     documents' Decision block. -->

> **Decision — <title>**
> Context: <the question>
> Options: A) <option — its cost> · B) <option — its cost>
> Chosen: <letter> — <why; his words when he chose>

## The implementer decides

- <a choice left to the builder, with its bound>

## References

- <recon/<topic>.md · the standards, path:line · a fetched page>
