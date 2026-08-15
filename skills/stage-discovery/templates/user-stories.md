# User Stories — <feature name> (`<SLUG>`)

<!--
  One block per story. Story IDs are S-001, S-002... and AC IDs are
  <SLUG>-S-001-AC-1 — these IDs are referenced by every later stage
  (planning issues, tests, the e2e round), so they never change after
  approval.

  ACs are written in EARS form: "WHEN <condition>, the system SHALL
  <behavior>" (state-driven: "WHILE <state>..."; unwanted behavior:
  "IF <error condition>, THEN the system SHALL..."). One check per AC —
  a criterion hiding two checks becomes two ACs. Every AC is judgeable by
  a stranger without asking anyone: binary, observable, with concrete
  values ("within 5 seconds", not "quickly").

  Bad paths are enumerated per story against the fixed taxonomy — a
  category with no defined behavior is an interview that is not done:
  - boundary inputs (empty, zero, max, malformed)
  - repeat/concurrency (double submit, same action twice, two actors at once)
  - dependency failure (the service behind the step is down or slow)
  - permission (the actor who must NOT be able to do this)
-->

## S-001 — <short story name>

**As a** <persona>, **I want** <capability>, **so that** <outcome>.

### Acceptance criteria

- **`<SLUG>-S-001-AC-1`** — WHEN <condition>, the system SHALL <observable behavior, concrete values>.
- **`<SLUG>-S-001-AC-2`** — IF <error condition>, THEN the system SHALL <defined failure behavior>.

### Bad paths

| Category | Case | Defined behavior |
|---|---|---|
| Boundary input | <e.g. email field empty> | <what the system does> |
| Repeat / concurrency | <e.g. same invite sent twice> | <what the system does> |
| Dependency failure | <e.g. email provider down> | <what the system does> |
| Permission | <e.g. non-admin tries to invite> | <what the system does> |

### Out of this story

<!-- What this story deliberately does not cover — with the story or wave
     that covers it, if any. -->

- <capability> — <where it lives instead>

---

## Open questions

<!-- MUST be empty to approve. A question here is an interview round that
     has not happened yet — take it back to the founder, do not guess. -->

(none)
