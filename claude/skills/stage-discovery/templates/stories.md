# Stories: <feature name> (`<slug>`)

<!--
  Written by discovery-story-writer from notes.md. The rules of this file are
  references/stories.md. The headings, the id formats and the criterion's
  shape are read by discovery.mjs check: keep them exactly.
  Nothing here is new: what he neither said nor accepted is under Assumptions.
-->

Mock: `mock/mock.html` · <not built yet | open | locked v<N>> | none: no screen changes

Personas: **<persona>** (<who, in one line>) · **<persona>** (<…>)

## Vocabulary

- **<word>** — <definition, from the notes>

## Rules

| ID | Rule | Number | Examples | Source |
|---|---|---|---|---|
| <PREFIX-1> | <the rule in one sentence> | <value + unit> | <the boundary, with real values> | "<his words>" · D-<n> |

---

## S-001 — <the job as a verb phrase>

**Actor:** <persona> · **Job:** When <situation>, I want to <motivation>, so I can <outcome>.

**Journeys:** J1 (main flow) · J2 (extension at s2)

### Main flow (J1)

1. **s1** <do> → <what the person sees>
2. **s2** <do> → <what the person sees> · behind: <what is written or sent>

### Extensions

- **at s2, J2** <the condition> → <what happens, and what does not>

### Acceptance criteria

- **`J1.s2.1`** [S-001] GIVEN <the state before, with named fixtures>
  WHEN <exactly one event>
  THEN <an outcome with its literal value> (seen: screen)
  AND <one more outcome> (seen: row read back)
- **`J2.s2.1`** [<PREFIX-1>] GIVEN <the state at the rule's boundary>
  WHEN <the event>
  THEN <the refusal, in the exact words shown> (seen: screen)
  AND <what is not written> (seen: row read back)

### Error paths

| Path | Case | Where | Criterion |
|---|---|---|---|
| Limit | <the case> | <J2.s2> | `J2.s2.1` |
| Dependency failure | <the case> | <J3.s2> | `<id>` |
| Permission | <the case> | <NB-n> | — |
| Repeat | <the case> | n/a: <why it cannot happen here> | — |

### In

- <what this story builds, one line each>

### Not building

- NB-1 (see `not-building.md`)

---

## Assumptions

- **A-1** — <what is assumed, stated as fact> — source: <`path:line` | the product does this next to it | review> — cost if wrong: cheap

## For the design

- **T-1** — <a question whose answer is a mechanism>

## Open

- (none)
