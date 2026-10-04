# Operations — Workspace invites

## Migration and rollout

| Step | What | Gate before the next step | Needs a person |
|---|---|---|---|
| 1 | apply the migration that adds `invites` | the table exists in staging | no |
| 2 | deploy the API and the web app, flag off | — | no |
| 3 | turn `invites_enabled` on | one invite sent and accepted in staging | yes |

## Flags

| Flag | Guards | Default | Removed when |
|---|---|---|---|
| `invites_enabled` | the invite button and its routes | off | a week after release with no alarm |

## Alarms that would wake someone

| Alarm | Fires when | Wakes | First action |
|---|---|---|---|
| `invites-send-failed` | more than 5 failed sends in 10 min | on-call | check the provider's status page |

## Rollback

- Step 3: turn the flag off.
- Step 1: drop the table once nothing reads it. A sent e-mail cannot be unsent.

## Run cost

Under a dollar a month: inside the provider's current plan.

## The implementer decides

- The exact script of each step.

## References

- the doctrine's rollout rules
