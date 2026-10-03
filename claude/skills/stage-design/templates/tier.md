# Tier <lean | balanced | hardened> — <workstream>

<!--
  Written by one `architect (Opus 5.5, high)`, told its tier, in
  parallel with the other two and blind to them. Every part of
  tiers/breadboard.md is designed here, at this tier, with its cost in
  hours and dollars. The sizing judge reads the three files side by
  side and picks a tier PER PART, so the parts must line up with the
  breadboard one for one (same names, same sub-parts, same E-n).

  The tiers:
  - lean: the most basic and fastest design that is still reliable.
    It meets EVERY acceptance criterion and the whole floor (the
    right-sizing pack, §3 D). A lean that fails an AC is a strawman and
    the workflow sends it back.
  - balanced: lean plus the cheapest additions that close every failure
    scored R = 3 (data lost or wrong, money, PII, a silent failure,
    legal). Each addition names the failure it closes.
  - hardened: maximum safety. Each addition still names the failure it
    closes; "best practice" is not a failure.

  MUST have, per part: the design (every mechanism line ending in its
  `(req: …)`), build hours, run cost per month, risks covered, risks
  accepted, and "no choice" when the part is the same in every tier.
  Primitives the project already runs come before a new component; a
  new component names why the existing one does not work.
-->

Tier: <lean> · Breadboard: `tiers/breadboard.md` · Appetite: <h> h
Total: build <h> h · run +US$ <n>/month · Meets every AC: <yes | no: which> · Floor: <met | not met: which>

## In one paragraph

<what this tier builds, end to end, in plain words; what it leaves to a
human or to the next tier>

## Per part

### data

- **Design:** <the tables, columns, constraints, indexes; one line per mechanism, each ending `(req: …)`>
- **Build:** <h> h
- **Run:** +US$ <n>/month — <what drives it; the price source>
- **Risks covered:** <failure — closed by what>
- **Risks accepted:** <failure — who sees it, how likely, how it is noticed>
- **No choice:** <no | yes: the same in every tier because …>

### contracts

### compute

<!-- one ### per sub-part when the breadboard split it: ### compute.invite-email -->

### integrations

### security

### ops

<!-- alarms (each on a state, with an action), metrics, runbook lines,
     the budget alert; the ops pack is the bar -->

### ui

<!-- how the locked mock becomes the app at this tier: the components it
     reuses, the states it wires, what the mock fakes that this tier
     makes real -->

### tests

<!-- the layers the doctrine assigns; the journeys become tests; what
     this tier adds beyond the doctrine's floor names the failure -->

## The effects at this tier

| Effect | If it half-succeeds | This tier's answer | Retry lives in | Dedup lives in |
|---|---|---|---|---|
| E-1 | <the provider accepted, the response timed out> | <one retry layer, a key …> | <one place> | <one place, or "none: a duplicate is harmless because …"> |

## One-way doors this tier walks through

<!-- data shape, a public contract, identity, third-party state, money,
     deletion, a message sent: each door this design opens, and what
     moving off it later would cost -->

- <door> — <what it fixes for good> — <cost to undo>

## What the next tier up would add

<!-- lean and balanced only: the additions this tier leaves out, each
     with the failure it would close and its cost. The judge turns the
     ones worth watching into evolution-path rows. -->

| Addition | Closes | Cost |
|---|---|---|

## Premises

- <a fact this design assumes and the recon did not confirm, or "none">
