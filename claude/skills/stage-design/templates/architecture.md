# Architecture — <workstream>

<!--
  What happens, end to end, and where each piece runs. MUST have: every
  component listed once with one line of responsibility and where it
  runs; every flow the stories imply, written in the fixed flow format
  below (the blind readers build from it: one build per numbered step
  and per failure row, so a step that leaves room produces two
  different builds and a finding); every mechanism that guards a rule
  (a lock, idempotency, a retry, a cutoff) named where it applies; the
  extension points with the line of what does NOT change; a diagram
  per non-trivial flow (blueprint HTML primitives kept as data
  strings). Decisions declared inline where they apply.
-->

## Components

| Component | Runs where | Responsibility (one line) |
|---|---|---|
| <name> | <service, runtime, region> | <what it owns> |

## Flows

<!-- One `### ` heading per flow. Steps are numbered lines, one action
     each, each owned by a named component, with the concrete values
     (what is read, what is written, what is returned). The failure
     table has one row per way the flow fails: what fails, what the
     system does, what the caller sees. Keep the format exact; the
     review workflow splits this section at the headings and keys the
     steps and rows by position. -->

### <flow name> (covers S-00N)

Trigger: <the business event that starts it>

1. <step — owned by <component>: reads X, writes Y, returns Z>
2. <step>
3. <what the user or caller sees at the end>

| Fails when | The system does | The caller sees |
|---|---|---|
| <wrong input · repeat · dependency down · no permission · timeout> | <concrete behavior> | <status, message, screen state> |

<!-- diagram as a blueprint-primitive HTML string, when the flow earns one -->

## Extension points

- <what enters, by implementing what; the line of what does NOT change>

## The implementer decides

<!-- The latitude the user granted for this document, copied from
     notes.md and completed by the writer with what transcription
     left open on purpose. One line each. Never a hard class: where a
     piece runs, who calls whom, what happens when the other side
     fails. -->

- <item>

## References

- <research file · URL · internal code path>
