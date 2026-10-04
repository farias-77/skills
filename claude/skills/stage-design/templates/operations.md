# Operations — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high) from proposal.md,
  notes.md, recon/ and the doctrine. Budget: about 40 KB, and usually
  far less. Stage 5 (release) reads it for the pre-flight, the rollout
  order, the toggles, the alarms it watches and the rollback triggers.

  Only what this demand adds or changes. An alarm exists only for a
  main-path failure with an action (pack-right-sizing §2 8). A section
  with nothing to add says "None." and why in one line.
-->

## Migration and rollout

| Step | What | Gate before the next step | Needs a person |
|---|---|---|---|
| 1 | <apply migration `<name>` (expand)> | <the table exists in staging> | <no> |

## Flags

| Flag | Guards | Default | Removed when |
|---|---|---|---|
| `<invites_enabled>` | <the invite button and its route> | <off> | <a week after release with no alarm> |

## Alarms that would wake someone

| Alarm | Fires when | Wakes | First action |
|---|---|---|---|
| `<invites-send-failed>` | <more than 5 failed sends in 10 min> | <on-call> | <check the provider's status page> |

## Rollback

<!-- Per step above: how it is undone. What cannot be undone (a sent
     e-mail, a dropped column) is named, with what stands in for it. -->

- Step <n>: <how to undo>

## Run cost

<one or two lines: what this adds to the monthly bill today, and what drives it>

## The implementer decides

- <script details, dashboard panels with no alarm: one line each>

## References

- <the doctrine's rollout and alarm rules, path:line>
