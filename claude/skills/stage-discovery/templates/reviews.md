# Discovery review: <workstream>

<!--
  Written by the conductor, who rules. The workflow's return is saved as
  is in 00-discovery/reviews/round-1.json (the authority); this file is
  the index, written before any fix is sent. One round; the fixes are
  verified by reading. Scale: blocks · note.
-->

## Before the round

| Check | Result |
|---|---|
| `proto.mjs walk` at the lock | <PASS · or the gaps in LOCK.json> |
| `proto.mjs trace` | <PASS> · ACs <N>, per story <S-001: n, …> |

## The round — <date> · run <id>

| Source | Valid | Findings | Dropped |
|---|---|---|---|
| disc-lens in-out | | | |
| disc-lens coverage | | | |
| disc-lens acceptance | | | |
| blind (per story) | <stories read / total; unread: …> | | |

## Rulings

| Id (merged) | Severity | Ruling | Owner | Reason (the quote or the frame) |
|---|---|---|---|---|
| <disc-lens/coverage#2, blind/S-003#1> | blocks | fix | story-writer | <…> |

## To the playback (his)

| Story | Decision | Conductor's pick | Why |
|---|---|---|---|

## For the design

- <S-00N · the mechanism to decide · the finding id>

## Fixes verified

| Id | Line now | Verified |
|---|---|---|
