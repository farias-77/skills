# Sizing — <workstream>

<!--
  Written by `sizing-judge (Opus 5.5, high)`: drafted in pick mode,
  rewritten in reconcile mode after the two critics, amended only with
  the user's rulings from the call. ONE PAGE: this is the final design
  every writer builds from, and the deck of the user's call is made from
  it. The detail of each part lives in the tier file the pick names;
  the critics' findings and their rulings live in tiers/critics.md.

  Rules (the right-sizing pack, §3 B and §5 R2/R4):
  - every part has R, V and C and a one-line why that names its
    requirement (`req:`);
  - every part above lean cites the score that forced it;
  - every lean part with R >= 2 has an evolution-path row;
  - an evolution signal has a number AND something that already
    watches it (an alarm, the weekly read, a runbook query); the next
    step is configuration or code that only adds; a move that would
    rewrite data is a one-way door, decided now;
  - picks compose: a part whose pick needs another part's tier says so
    in its why, and that part is at least that tier;
  - up to 10 % over the appetite, the overrun is written on the
    totals line and goes to the user's veto; further over, a question
    for him (accept the hours, or lower a part above lean), never a
    cut of the floor, an AC or a ruling of his;
  - a higher tier priced below a lower one (an inversion) is marked in
    the side-by-side table with one line saying why the two designs
    differ.
-->

Appetite: <h> h · Pick: <h> h · Run cost: +US$ <n>/month · Status: <draft | final | amended YYYY-MM-DD>
No-gos: <one line each>

## The design

```mermaid
<one diagram: the pieces and the effects that leave the process>
```

<one paragraph: what gets built, end to end, and why it is this size>

## The three tiers, side by side

| Part | Lean | Balanced | Hardened |
|---|---|---|---|
| data | <one line · h · $> | | |
| contracts | | | |
| compute | | | |
| integrations | | | |
| security | | | |
| ops | | | |
| ui | | | |
| tests | | | |
| **Total** | <h · $/month> | | |

## The pick, per part

| Part | Tier | R V C | Why (req) |
|---|---|---|---|
| data | lean | 2 3 1 | <one line; the requirement it answers> |
| compute.invite-email | balanced | 3 2 1 | <need 6 → balanced; the failure it closes (req: door:message-sent)> |

## One-way doors

| Door | Decided | His call |
|---|---|---|
| <the data shape of X> | <what was decided> | <yes: Q-n · no: why it is not his> |

## Evolution path

| Part | Now | Signal (number · who watches) | Next | Cost |
|---|---|---|---|---|
| <name search> | <LIKE, no index> | <list p95 > 300 ms · the latency alarm> | <trigram index migration> | <1 h> |

## What the critics changed

<!-- At most six lines: what was cut, what was added, what was kept
     against a critic and why. The whole ruling list is in
     tiers/critics.md. -->

- <overengineering-critic#2: the second dedup in the worker removed — one dedup, in the handler>

## For his call

<!-- Only what is his: cost above the materiality bar, scope, data
     format, contract shape, security posture, an irreversible choice.
     At most four. Each: the question, the options with their cost, the
     pick first and marked. "None" is a complete answer. -->

- **Q-1** <question> — A) <pick: option — cost> · B) <option — cost>
