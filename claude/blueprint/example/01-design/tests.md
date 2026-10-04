# Tests — Workspace invites

## How tests run here

API tests run against a real database in the test stack; journeys run in the browser.

## S-001 — Send an invite

| AC | Layer | The proof | Read back |
|---|---|---|---|
| `J1.s2.1` | api | `POST /invites` with a valid e-mail returns 201 | one `invites` row, `pending` |
| `J1.s2.2` | journey | a member's e-mail shows the hint | no row, no e-mail |

## S-002 — Accept an invite

| AC | Layer | The proof | Read back |
|---|---|---|---|
| `J2.s1.1` | api | `POST /invites/accept` with a valid token returns 200 | the member exists, invite `accepted` |
| `J2.s1.2` | unit | a token past seven days is refused | — |

## The implementer decides

- The fixtures and the order the tests run in.

## References

- the doctrine's testing standard
