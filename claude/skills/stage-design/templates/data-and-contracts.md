# Data and contracts — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high) from proposal.md (the
  closed version), notes.md, recon/ and the lock. Budget: about 40 KB.

  This is THE CONTRACT. Stage 3 copies one "Contract — <feature>"
  section into the brief of each entry that has a back and a front
  side, and stage 4 then runs the two builders in parallel against it.
  So each section stands alone: the route, who can call it, the request
  and response JSON with every field and a realistic value, and every
  error with its status and code. A builder must need nothing else
  from this file to build its side.

  One Contract section per entry-sized feature: one user action and
  the routes it calls (send an invite; accept an invite), never one
  section per route when two routes serve one action.

  Every name is copied from proposal.md "The names". A change after
  the design closed is an amendment, never a silent edit.
-->

## Data

### `<table>`

| Column | Type | Rule | req |
|---|---|---|---|
| `<id>` | <uuid, pk> | — | — |
| `<status>` | <enum `pending`, `accepted`, `expired`> | <not null> | <J1.s2.1> |

Indexes: <each with the read it serves, or "none: <why>"> · Retention: <how long, or "kept">

## Migrations

<!-- Expand only: the order, each step reversible. A step that cannot
     be undone says so. -->

1. <add table `<table>`> — reversible: <yes · how>

## Contract — <feature: send an invite>

| Route | Request | Response | Errors |
|---|---|---|---|
| `<POST /invites>` | `<{ "email": "ana@example.com" }>` | `<201 { "id": "inv_…", "status": "pending" }>` | `<422 email_invalid · 409 already_member · 401 · 403>` |

- **Auth:** <who can call; what happens across tenants>
- **Request:**

```json
{ "email": "ana@example.com" }
```

- **Response `201`:**

```json
{ "id": "inv_8f2c", "email": "ana@example.com", "status": "pending", "expiresAt": "2026-10-11T12:00:00Z" }
```

- **Errors:**

| Status | Code | When | The client does |
|---|---|---|---|
| 422 | `email_invalid` | <the e-mail is empty or malformed> | <marks the field> |

- **Repeat:** <what a second identical call returns>

## Events

<!-- Only when the design publishes or consumes one: name, producer,
     consumers, delivery, the JSON. Otherwise "None." -->

## The implementer decides

- <field order, validation message wording, helper names: one line each with its bound>

## References

- <the doctrine's contract and migration rules, path:line · recon/<topic>.md>
