# Architecture — <wave>

<!--
  What happens, end to end. MUST have: every flow the stories imply (bad
  paths as branches, not footnotes), each step owned by a named
  component, every component listed once with one line of responsibility,
  and a diagram per non-trivial flow (blueprint HTML primitives kept as
  data strings). Decisions declared inline where they apply.
-->

## Components

| Component | Responsibility (one line) |
|---|---|
| <name> | <what it owns> |

## Flows

### <flow name> (covers S-00N)

Trigger: <the business event that starts it>

1. <step> — owned by <component>
2. <step> — <IF bad path: what happens, as a branch>
3. <what the user/caller sees at the end>

<!-- diagram as a blueprint-primitive HTML string, when the flow earns one -->

## References

- <research file · URL · internal code path>
