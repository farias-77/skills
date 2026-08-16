# Rollout — <wave>

<!--
  The way in and out of production. MUST have: deploy order across repos
  (producer first, with the why); the cutover as numbered steps — each
  with where it runs, the command, and the check that confirms it worked
  before moving on; the gates that stop and wait for the user; rollback
  per step with the time it takes (steps, not a paragraph of hope); and
  the propagation window on every absence-sensitive check (first-read
  validity, re-check interval, when it becomes failure — a positive read
  inside the window is inconclusive, not a rejection).
-->

## Deploy order

1. <repo> — <why it goes first (producer/consumer)>

## Cutover

### 1. <step> `(gate: needs the user)` <!-- flag only on gate steps -->

- **Where:** <machine/CI/console>
- **Run:** `<command>`
- **Confirmed when:** <the observable check before moving on>

## Rollback

| From step | How to go back | Takes |
|---|---|---|
| <N> | <the steps, not hope> | <minutes> |

## References

- <research file · URL · internal code path>
