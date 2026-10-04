# Solution — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high) from proposal.md (the
  closed version), notes.md, recon/ and the lock. Budget: about 40 KB.
  It holds the shape of the system: the parts, the screens, the flows,
  the decisions, the security posture, where the architect disagreed
  with the user and how it was settled, and the evolution path. The
  tables, routes and JSON are data-and-contracts.md's; point there,
  never copy.

  Every name is copied from proposal.md "The names". Every mechanism
  line ends with (req: …) (references/design-docs.md).
-->

## In one picture

```mermaid
flowchart LR
  <as proposal.md draws it, with the names of the documents>
```

## The parts

| Part | Repo and path | Runs where | Does | req |
|---|---|---|---|---|
| <invites use case> | <api: internal/invites/> | <api> | <one line> | <J1.s2.1> |

## The screens

<!-- Every screen and state of the locked mock mapped onto the real
     front: the route, the component it extends, the data it shows (the
     contract that serves it), the copy verbatim from the mock. Then what
     the mock fakes and the app does not build. -->

| Screen · state | Frame | Route and component | Data from |
|---|---|---|---|
| <Invites · empty> | `prototype/frames/<file>.png` | <`/settings/invites` · `InvitesPage`> | <`GET /invites`> |

**What the mock fakes:** <one line each, or "nothing">

## The flows

### <flow name> (covers S-00N)

Trigger: <who or what starts it>

1. <one action per step: the part named, what it reads, writes, returns, the concrete value>
2. …

| When | What the system does | What the user sees |
|---|---|---|
| <the provider times out> | <the invite stays pending, one retry layer> | <"not sent yet"> |

## Security posture

<!-- Who can do what and where it is checked, secrets, personal data,
     abuse of the new routes: one line each, at the floor (pack §3 D7) and
     the doctrine. -->

- **Who can call what:** <role → action, checked in the use case>
- **Personal data:** <what is stored, never logged>
- **Secrets:** <where they live>
- **Abuse:** <the cap on an abusable route, or "none: no route can be abused">

## Decisions

> **Decision — <short title>** `(decided in your place)`   <- flag only when it was the user's class
> Context: <the question>
> Options: A) <option — its cost> · B) <option — its cost>
> Chosen: <letter> — <why, the tradeoff said>

## Where the architect disagreed with the user

| He said | The architect proposed | Why | Settled |
|---|---|---|---|
| "<his words>" | <the other way> | <the reason> | <the outcome, his words> |

## What changes if it grows

| Relaxed now | If this happens | Add | Cost |
|---|---|---|---|
| <copied from proposal.md> | | | |

## The implementer decides

- <a choice left to the builder, with the bound the design sets>

## References

- <recon/<topic>.md · research/<topic>.md · the doctrine, path:line>
