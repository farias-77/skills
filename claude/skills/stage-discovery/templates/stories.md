# Stories: <feature name> (`<slug>`)

<!--
  Derived from the LOCKED mock by journey-scribe. Nothing here is new: every
  use case is a family of locked journeys, every acceptance criterion is a
  rule or a behavior the mock shows, every value is one the mock shows or
  the notes confirmed.
  What the scribe had to guess goes to Inferred; what it could not settle
  goes to Open. Both MUST be empty to close the stage.

  IDs:
  - A story is a use case: S-001, S-002…, one per job, with its journeys.
  - One AC per rule and one per behavior he said, never one per step, per
    state or per copy string: the locked frames cover the states, the
    layout and the copy. A step with no rule or behavior of its own has no
    AC. A rule id sits in one AC only.
  - An AC id anchors on the locked step where the behavior shows first:
    <journey>.<step>.<n> (J1.s2.1). It never changes after the lock; later
    stages cite it.
  - In [ ] after the id: the rule ids the AC checks (the notes' Rules
    table), or the story id when it checks behavior no numbered rule covers.
  - An AC on a behavior only a debug-only frame shows (an error with a
    retry he asked for) is frame:<token>.<n> (frame:invites.error.1). A
    state alone (loading, empty) gets no AC.
  - [build] after the rule ids marks an AC only the build can prove (a
    rule the notes' Rules table marks [build]: real time, a server's
    refusal, a count that changes on reload). It keeps the shape and says
    where it is observed in the built product; the blind readers skip it.
  - A story block cites only its own AC ids. Another story's criterion is
    named in words ("the publish criterion of S-001"), never by id: a
    blind reader reads one block and would take the id for its own.

  An AC (the format `proto.mjs trace` reads):
  - **`J1.s2.1`** [INV-1] GIVEN <the state before the step, no clicks>
    WHEN <exactly one event, declarative>
    THEN <an outcome that makes the behavior> (observed: <where>)
    AND <one more outcome per line> (observed: <where>)
  "observed" is one of: screen (role + accessible name, or the copy key
  with both strings) · inbox · row read back · event · log · alarm · file.
  Values are concrete: fixture names, numbers with their units, copy keys
  where the copy is the point. No selectors, no internals, no "quickly" or
  "correctly". Effects that must not happen are stated ("the inbox still
  holds 1 e-mail"). A rule with a number gets ONE AC at the boundary the
  mock shows (the 11th refused, the 10th kept).

  Each story block stands alone: a blind reader gets ONE block plus the
  vocabulary and must be able to judge every AC against the mock.
-->

Locked mock: **v<N>** · `00-discovery/prototype/LOCK.json` · frames in `00-discovery/prototype/frames/`

Personas: **<persona>** (<who, in one line>), …

## Vocabulary

- **<word>** — <definition, from the notes; the mock's labels use this word>

## Rules

<!-- Copied from the notes' Rules table: every number that encodes a rule. -->

| ID | Rule | Number | Source |
|---|---|---|---|
| <PREFIX-1> | <the rule in one sentence> | <value + unit> | <his words, or the document he named> |

---

## S-001 — <use case name, a verb phrase>

**Actor:** <persona> · **Job:** When <situation>, I want to <motivation>, so I can <outcome>.

**Journeys:** J1 (main flow) · J2 (extension at s2) · J3 (extension at s2)

### Main flow (J1)

1. **s1** <do> → <frame title>
2. **s2** <do> → <frame title> · behind: <the effects in a few words>

### Extensions

- **at s2, J2** <the condition> → <what happens, and what does not>
- **at s2, J3** <the condition> → <what happens>

### Acceptance criteria

- **`J1.s2.1`** [<RULE-1>] GIVEN <state>
  WHEN <event>
  THEN <outcome> (observed: screen)
  AND <outcome> (observed: row read back)
  AND <outcome> (observed: inbox)
- **`J2.s2.1`** [S-001] GIVEN <state>
  WHEN <event>
  THEN <the behavior he said, with no numbered rule> (observed: screen)
- **`frame:<token>.1`** [<RULE-2>] GIVEN <the state forced from the debug bar>
  WHEN <event>
  THEN <the behavior only that frame shows> (observed: screen)
- **`frame:<token>.2`** [<RULE-3>] [build] GIVEN <state>
  WHEN <event the mock cannot play: a reload, a second user, the server>
  THEN <outcome> (observed: <where, in the built product>)

### Bad paths

<!-- The four categories, each mapped to a journey step or a frame. A
     category with neither is a gap: it goes to Inferred or Open. -->

| Category | Case | Where in the mock |
|---|---|---|
| Boundary input | <case> | <J4.s1, or frame token> |
| Repeat / concurrency | <case> | <…> |
| Dependency failure | <case> | <…> |
| Permission | <case> | <…, or "Out: <reason>"> |

### In and Out

- **In:** <what this story builds, one line each>
- **Out:** <capability> — not building: <reason> | future direction, not scheduled

---

## Inferred

<!-- Every fact the scribe wrote that neither the locked mock nor the notes
     contain: id, the guess, where it landed. The conductor asks him with
     the review's decisions. MUST be empty to close. -->

- **I-1** — <the guess> — in <AC id>

## Open questions

(none)
