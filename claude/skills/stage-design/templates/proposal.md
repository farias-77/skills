# Proposal — <workstream>

<!--
  Written by the ARCHITECT (Opus 5.5, high), one agent for the whole
  stage: at D2 from the lock, the notes and the recon; at each D4 round
  from the conductor's message with his ruled points. Edited in place:
  one version of each decision, the change dated under "Changes per
  round". The four documents of D5 are written from this file: every
  decision and every name they use is here.

  Size: what a person reads in ten minutes, about 15 KB. The detail
  (the JSON, the columns, the cases) is the documents', not this
  file's.

  The bar is "basics done well" (pack-right-sizing §1): the simplest
  design that meets every acceptance criterion and the whole floor
  (§3 D), with the primitives the project already runs. Every
  mechanism names what forces it (an AC, a floor item, a doctrine
  line, a one-way door, his words). Nothing is built for a guessed
  need: a "not now" is a row of the evolution path.
-->

Status: <draft | round <n> | closed <YYYY-MM-DD> — "<his words>">
Base: <repo>@<branch> <sha> (from recon/)

## The problem

<two or three sentences: what the lock asks for, in the user's words where he gave them>

## The solution in one picture

```mermaid
flowchart LR
  <the parts, where each runs, the arrows labelled: writes, reads, calls, sends>
```

<one paragraph: how it works, end to end>

## The parts

| Part | Where it runs | Does | Why it exists (req) |
|---|---|---|---|
| <invites use case> | <api, module invites> | <one line> | <J1.s2.1> |

## The main flows

### <flow name> (covers S-00N)

1. <one action per step, the part named, the value said>
2. …

When it fails: <the failure that matters and what the user sees; one line each>

## The bar: done well, and relaxed

- **Done well:** <each floor item this demand touches, and how it is met: one line each>
- **Relaxed:** <what a bigger design would add and this one does not; each has a row below>

## What changes if it grows

| Relaxed now | If this happens (the signal, with its number) | Add | Cost |
|---|---|---|---|
| <list by scan, no index> | <list p95 over 300 ms> | <an index on status> | <1 h> |

## Where I disagree with you

<!-- Only where a clear reason makes another way better: an AC his idea
     fails, a floor item, a cost, a one-way door, the doctrine. Never a
     preference. "None" is a complete section. The last column is
     filled in D4 with his words. -->

| You said | I propose | Why | Settled |
|---|---|---|---|
| "<his words>" | <the other way> | <the reason, concrete> | <open · his words and the outcome> |

## The names

<!-- Every name the documents will copy, spelled once: tables, columns
     that carry a rule, enum values, routes, error codes, events, flags,
     alarms, modules, screens. A writer who needs a name not listed asks;
     it is added here first. -->

| Kind | Name | Note |
|---|---|---|
| table | `<invites>` | <one line> |
| route | `<POST /invites>` | <one line> |

## Premises

- <what the proposal leans on> — <confirmed: source | not confirmed: what changes if false>

## The critic's cuts

| Cut | Applied or rebutted | Why |
|---|---|---|
| <the mechanism> | <applied · rebutted> | <for a rebuttal: the AC, floor item or risk it serves> |

## Changes per round

| Round | Date | What changed | Because |
|---|---|---|---|
| 1 | <date> | <one line> | <his point, quoted> |
