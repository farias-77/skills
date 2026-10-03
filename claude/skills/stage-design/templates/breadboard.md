# Breadboard — <workstream>

<!--
  Written by `architect (Opus 5.5, high)` in breadboard mode, the first
  step of the design-tiers workflow, BEFORE any tier. The three tier
  architects design against this file, so their parts and effects line
  up one for one and the sizing judge can pick a tier per part and know
  the picks compose. It fixes WHAT must happen, never HOW: no table, no
  queue, no retry is chosen here. MUST have: every place and state of
  the locked mock; one server line per acceptance criterion; every
  effect that leaves the process, circled with an id; the parts and
  their sub-parts. Ids (E-n, part names) are copied by every tier file,
  sizing.md and the documents; they never change after this file.
-->

Appetite: <h> h (from notes.md) · No-gos: <from notes.md, one line each>
Lock: `00-discovery/prototype/` version <v> · journeys <n> · stories <S-001 … S-0NN>

## Places (from the locked mock)

| Place (screen · state) | Frame | Affordances | Connects to |
|---|---|---|---|
| <screen · empty> | `prototype/frames/<file>` | <what the user can do here> | <place it leads to> |

## Server lines (one per acceptance criterion)

| AC | Journey step | entry → use case → writes → effects |
|---|---|---|
| <S-001/AC-1> | <J-id/n> | <route or event → use case → what it writes → E-n> |

## Effects that leave the process

<!-- Every effect another system, a person or the future sees: an
     external call, a message sent, money, a deletion, third-party
     state, an event, a file. These are the doors and the retries; the
     tiers differ mostly here. -->

| Effect | What | Kind | Human in the loop? | Outcome can be unknown? | Can be rebuilt later? |
|---|---|---|---|---|---|
| E-1 | <send the invite e-mail> | message sent | yes: the user can resend | yes: the provider may time out after accepting | n/a |

## Parts

<!-- The eight parts, always: data, contracts, compute, integrations,
     security, ops, ui, tests. Split a part into named sub-parts only
     when two pieces of it carry different risk (compute.invite-email,
     compute.csv-import); each sub-part is scored on its own. A part
     the demand does not touch says "untouched: <why>" and every tier
     marks it "no choice". -->

| Part | Sub-parts | Carries (effects, ACs) | What exists today it extends |
|---|---|---|---|
| data | — | <S-001/AC-1, S-002/AC-3> | <table · path:line from recon> |
| contracts | | | |
| compute | <compute.a, compute.b> | <E-1, E-2> | |
| integrations | | | |
| security | | | |
| ops | | | |
| ui | | | |
| tests | | | |

## Premises not confirmed

<!-- A fact the tiers lean on that the recon did not confirm. The
     conductor sends a researcher before the tiers run, or the tiers
     carry it as "assumed". -->

- <premise> — <what the recon found, or nothing>
