# Decisions — <workstream> — the design session's record

<!--
  Written by the CONDUCTOR during the design session — the one design
  file the author never edits (the declared exception to the
  single-writer rule). Every entry is the user's call, taken live, in
  the fixed decision-block format so the blueprint renders them as
  cards. This file is law: the author details these choices and never
  reopens them; reviewers contest them only on defect; the judge
  calibrates by the ruler below. A macro topic the session skipped is
  a gap — the author will have to decide it in the user's place.
-->

## The ruler

> **Decision — review scrutiny**
> Context: what scrutiny this system merits — the judge rules every review finding by this
> Options: A) revenue path — full scrutiny · B) operational dependency — real defects and the floor · C) internal tool — the floor only
> Chosen: <letter> — <why. The floor (security, data loss, contracts, broken ACs, money) never scales down.>

## The cut

> **Decision — wave cut**
> Context: how the demand is sliced into waves
> Options: A) <cut — its cost> · B) <cut — its cost>
> Chosen: <letter> — <wave 1 ships X · wave 2 ships Y — the why>

## The macro shape

<!-- One decision block per session agenda item that applies: data
     (what is stored, where — and what is NOT stored) · compute (what
     runs where) · messaging (event vs sync, per boundary) · identity
     and access · repos (new or existing) · build vs buy · cost
     envelope (the accepted monthly ceiling at three scales) · alarm
     philosophy (what wakes someone, given who answers) · environment
     and rollout macro (alpha, profiles, names, test credentials). -->

> **Decision — <title>**
> Context: <the question that had to be answered>
> Options: A) <option — its cost> · B) <option — its cost>
> Chosen: <letter> — <why, the tradeoff said out loud>
