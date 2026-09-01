# Taste — the house ledger of the user's calls

The pipeline is built **with** the user: at stage 2 the conductor
proposes each design decision as a card with a recommendation and he
rules; at stages 2, 3 and 4 he is the judge of every review finding.
This file is where the pipeline learns what he chooses, so that the
next proposal — a design card, a suggested ruling — already comes the
way he would take it. Every conductor reads it before recommending
anything to him, and the judges of stages 2, 3 and 4 read it before
ruling.

Two sources feed it, both confirmed by him before they are written:

- **A session divergence** (stage 2) — a card where his choice
  differed from the recommendation. The entry is the pattern, never
  the instance.
- **A ruling that is a pattern** (stages 2 and 3; at stage 4, a note
  he dismissed at the checkpoint) — a finding he dismissed, or
  sustained against the judge, for a reason that will hold again. Lenses do not read this file (the reviewer contract
  forbids pre-softening); it calibrates the judges' proposals and the
  conductor's suggestions, and stage 6 uses it with `rulings.md` and
  the precision tables to tighten a lens that keeps raising what he
  keeps dismissing — or a judge he keeps overruling.

One entry per line, dated, with the workstream that taught it. Keep
the entry as a rule he would recognize as his: what he prefers, over
what, until what changes it. An entry proven wrong by a later ruling
is edited, not appended to.

## Architecture

<!-- e.g. 2026-09-01 · ops-dashboard · A Lambda on a schedule over Step Functions until a flow needs a human wait or a multi-day timer. -->

## Data

## Contracts

## UI

## Security

## Infra and cost

## Alarms

## Rollout

## Code

## Acceptance

## Review rulings — design (stage 2)

<!-- what he dismisses on sight — e.g. 2026-09-01 · ops-dashboard · Concurrency caps on an internal tool with one operator: dismissed, the arithmetic never bites. -->

## Review rulings — plan (stage 3)

## Review rulings — execution (stage 4)
