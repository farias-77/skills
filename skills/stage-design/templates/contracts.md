# Contracts — <wave>

<!--
  THE FROZEN BRIDGE: after approval, repos are planned and built in
  parallel against this file and meet in the middle. MUST have, per
  endpoint: route, auth (who can call), request AND response with example
  payloads (realistic values — each repo builds its fixtures from these),
  EVERY error case with status + actionable body, idempotency story for
  every mutation, pagination for every list. Per event: name, schema,
  producer, consumers, delivery semantics. Plus the evolution rules.
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

## References

- <research file · URL · internal code path>
