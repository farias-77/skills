# Decisions — <workstream> — the design session's record

<!--
  Written by the CONDUCTOR during the design session, as the session
  happens. The one design file the author never edits. Every entry is
  the user's call, taken live, in the fixed decision-block format so
  the blueprint renders it as a card, with the conductor's
  recommendation kept beside the choice: a divergence is greppable and
  becomes a line in taste-notes.md.

  This file is the whole design in decisions, for the WHOLE demand
  (every story with v1 status in or reduced). Layer 1 is the macro
  shape; layer 2 is one section per document, all ten, in writing
  order. Each layer-2 section ends with a Latitude list: what the user
  said the implementer decides. The author transcribes both and never
  reopens a call; reviewers contest a decision only on defect and do
  not report an item the latitude list names, unless it is a hard
  class (see the stage skill). A decision the session skipped is a
  question from the author back to the user, never the author's to
  take.
-->

## What we are building (one sentence)

<the demand in one sentence, in the user's words where he gave them>

## The macro shape

<!-- One decision block per layer-1 agenda item that applies: data
     (what is stored, where, and what is NOT stored) · compute (what
     runs where) · messaging (event or sync, per boundary) · identity
     and access · repos (new or existing) · build vs buy · cost
     envelope (the accepted monthly ceiling at three scales) · alarm
     philosophy (what wakes someone, given who answers) · environment
     and rollout macro (alpha, profiles, names, test credentials) ·
     extension points (where the direction the discovery recorded
     will land, and what does not change when it does). An infra card
     shows the whole kit the mechanism drags in: resources, rollout
     steps, runbooks, acceptance cases. -->

> **Decision — <title>**
> Context: <the question that had to be answered>
> Options: A) <option — its cost> · B) <option — its cost>
> Recommended: <letter>
> Chosen: <letter> — <why, the tradeoff said out loud>

## The mechanisms

<!-- Layer 2: one subsection per document, all ten, in writing order.
     A card for every choice the user would want made differently or
     that encodes a rule, a cost or a risk; the rest is transcription
     and stays with the author. Same block format. Each subsection
     ends with its Latitude list. -->

### architecture

> **Decision — <title>**
> ...

Latitude: <what the implementer decides here, one line each; "none" when the user left nothing open>

### data-model

Latitude:

### contracts

Latitude:

### ui

Latitude:

### security

Latitude:

### infra

Latitude:

### observability

Latitude:

### rollout

Latitude:

### code

Latitude:

### acceptance

Latitude:

## Questions answered after the session

<!-- The author's batch: a decision the session did not take, asked
     and answered here, same block format. "You decide" answers keep
     the (decided in your place) flag on the author's inline block. -->
