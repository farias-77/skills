# Contracts — <workstream>

<!--
  THE FROZEN BRIDGE: after approval, repos are planned and built in
  parallel against this file and meet in the middle. MUST have, per
  endpoint: route, auth (who can call), request AND response with example
  payloads (realistic values — each repo builds its fixtures from these),
  EVERY error case with status + actionable body, idempotency story for
  every mutation, pagination for every list — and the Cases line: the
  named acceptance cases this endpoint owes, one per promised behavior
  (success + each declared error). The design names them, the plan
  copies them into the brief, the builder writes the tests — the tests
  are the executable mirror of this contract, and the list born here is
  what makes the mirror auditable name by name. Per event:
  name, schema, producer, consumers, delivery semantics. Plus the
  evolution rules.
  Changes after approval are amendments (a decision block with the
  reason) — never silent edits.
-->

## Endpoints

### `<METHOD> /<route>`

- **Auth:** <who can call; what happens cross-tenant>
- **Request:**

```jsonc
{ }
```

- **Response `200`:**

```jsonc
{ }
```

- **Errors:** `<status>` <when> — body `{ }` <what the client does with it>
- **Idempotency:** <what the second identical call returns, and why>
- **Pagination:** <page size, cursor semantics, ordering — for lists>
- **Cases:** `<behavior>` · `<behavior>-<expected-error>` <one named case per promised behavior — success + each error above, as named in acceptance.md>

## Events

### `<event.name>`

- **Producer:** <service> · **Consumers:** <services>
- **Delivery:** <at-least-once? ordering? retry story>
- **Schema:**

```jsonc
{ }
```

## Evolution rules

- <how a field is added without breaking the other side; versioning; who owns the schema>

## The implementer decides

<!-- The latitude the user granted for this document (notes.md)
     plus what transcription left open on purpose. One line each.
     Never a hard class. -->

- <item>

## References

- <research file · URL · internal code path>
