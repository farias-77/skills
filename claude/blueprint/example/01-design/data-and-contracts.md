# Data and contracts — Workspace invites

## Data

### `invites`

| Column | Type | Rule | req |
|---|---|---|---|
| `id` | uuid, pk | — | — |
| `workspace_id` | uuid | not null | J1.s2.1 |
| `email` | text | not null; unique with `workspace_id` while `pending` | J1.s2.1 |
| `token_hash` | bytea | not null, unique | J2.s1.1 |
| `status` | enum `pending`, `accepted` | not null | J2.s1.1 |
| `expires_at` | timestamptz | not null | J2.s1.2 |

Indexes: the unique pair above, which also serves the pending list · Retention: kept.

## Migrations

1. Add table `invites` and its unique index — reversible: drop the table.

## Contract — Send an invite

| Route | Request | Response | Errors |
|---|---|---|---|
| `POST /invites` | `{ "email": "ana@example.com" }` | `201 { "id": "inv_8f2c", "status": "pending" }` | `422 email_invalid · 409 already_member · 401 · 403` |
| `GET /invites` | — | `200 { "items": [{ "id": "inv_8f2c", "email": "ana@example.com", "status": "pending" }] }` | `401 · 403` |

- **Auth:** an admin of the workspace; another workspace's admin gets 403.
- **Repeat:** a second `POST` with the same e-mail resends the pending invite and returns it with 201.

## Contract — Accept an invite

| Route | Request | Response | Errors |
|---|---|---|---|
| `POST /invites/accept` | `{ "token": "…" }` | `200 { "workspaceId": "ws_12" }` | `410 invite_expired` |

- **Auth:** the token is the key; a signed-in session is created on success.

## Events

None.

## The implementer decides

- The order of fields in the responses.

## References

- the doctrine's contract rules
