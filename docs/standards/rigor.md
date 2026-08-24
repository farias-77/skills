# Rigor tiers

How much review machinery a wave earns is a property of the wave, not
of the pipeline: an internal console and a payment path do not carry
the same cost of being wrong. Every wave declares a tier in `waves.md`
(a `rigor:` line in its section); the design-author proposes it at the
wave cut with one line of why, and the user confirms it at the design
checkpoint. A wave with no declared tier is `standard`.

## Choosing

- **full** — being wrong is expensive or irreversible: money movement,
  security surface, irreversible data migration, contracts third
  parties depend on.
- **standard** — the default: real features, real users, reversible
  mistakes.
- **light** — internal tooling, experiments, features the user wants in
  hand fast; a defect embarrasses nobody and rolls back in minutes.

The tier is per wave, so a workstream mixes them: the ingestion spine
`standard`, the internal console that reads it `light`.

## What each tier sets

| | full | standard | light |
|---|---|---|---|
| Design — opening round | all ten | all ten | all ten |
| Design — later full rounds (post-fold-in, closing) | all ten | all ten | five core: data, code, security, contracts, coherence |
| Plan — blind readers per issue | 3 | 3 | 1 |
| Execute — `impl-issue` caps | as coded | as coded | as coded |
| Extra full design rounds past the cap | user may demand them | no | no |

**The opening round is always all ten, in every tier.** The first look
is where unknown-unknowns surface, and no tier may narrow it — the
evidence is ops-tracking w2n3: on an internal tool, the opening round
found six blockers in lenses outside the core set (alarms, infra,
facts). The tier's savings come from the loop — delta rounds and the
closing guard — never from the breadth of the first look.

## What never scales down

The exit rules themselves, the conductor's on-disk verification, the
security and coherence lenses (present in every tier), the e2e round,
and release's verify-against-the-source. The tier buys **fewer eyes,
never a lower bar** for what the remaining eyes may accept.
