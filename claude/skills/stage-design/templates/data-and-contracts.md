# Data and contracts — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high). Rules:
  references/documents.md and references/contracts.md. Each Contract
  section stands alone: stage 3 copies it whole into a brief, and the
  backend and frontend builders work from it in parallel.
-->

## Data

### `<table>`

| Column | Type | Rule | req |
|---|---|---|---|

Indexes: <each with the read it serves, or "none: <why>"> · Retention: <how long>

## Migrations

1. <expand step> — reversible: <yes, how | no: what stands in>

## Contract — <feature>

- **Route:** `<METHOD /path>` · **Who:** <role, and the scope it is limited to>
- **Headers read:** <Authorization, Idempotency-Key, …> · **Headers written:** <Location, …>

**Request**

| Field | Type | Mark | Example |
|---|---|---|---|
| `email` | string | required | `ana@example.com` |

**Response `<status>`** <or: no body>

| Field | Type | Mark | Example |
|---|---|---|---|
| `expiresAt` | string (UTC) | nullable | `2026-10-12T12:00:00Z` |

**Errors**

| Status | Code | When | The client does |
|---|---|---|---|

**Repeat:** <what a second identical call returns>

<!-- Spec-first project: the OpenAPI fragment the contract commit pastes. -->

```yaml
<paths fragment>
```

## Events

None. <or: name, producer, consumers, delivery, the payload>

## The implementer decides

- <field order, validation message wording: one line each with its bound>

## References

- <the standards' contract and migration rules, path:line · recon/<topic>.md>
