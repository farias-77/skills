# Contracts

Read by the `design-writer (Sonnet 5.5, high)` of
`data-and-contracts.md` and by `design-contracts (Sonnet 5.5, high)`.
A Contract is what lets stage 4 build the backend and the frontend of an
entry in parallel: each builder works from it alone. So it is
complete, or it is a question.

## One Contract per feature

One user action and the routes it calls ("send an invite": `POST
/invites` and the list refresh it triggers), never one section per
route when two routes serve one action. Each section stands alone:
stage 3 copies it whole into a brief.

## What a Contract holds

| Part | Holds |
|---|---|
| Route | method and path; who may call it (the role, and the scope it is limited to) |
| Headers | every header read (auth, idempotency key, locale) and every header written (location, retry-after, a cursor) |
| Request | every field with its type, a realistic value, and one mark: **required** · **optional** (may be absent) · **nullable** (present, may be `null`) |
| Response | per success status, the body with every field marked the same way; a status with no body says "no body" |
| Errors | each with its status, its **error code** (the stable name a client branches on), when it happens, and what the client does |
| Repeat | what a second identical call returns |

Optional and nullable are different promises: an absent field and a
`null` field are read differently by a typed client. Every field
carries exactly one mark.

## Spec-first projects

When the project generates server and client code from an OpenAPI
spec, the Contract section ends with the **OpenAPI fragment** the
contract commit of stage 3 pastes into the spec: the path, its
parameters, its request and response schemas (`required` lists and
`nullable` exactly as the marks say), and its error responses. The
fragment is the source of truth; the tables above are its readable
form and must say the same.

## What the tests cite

A proof in `tests.md` names the behavior and, for a failure, the
**error code** ("refused with `invite_limit_reached`, nothing written"),
never a status number or a JSON field path. The code is the contract's
name for the failure; the status can change without changing the
behavior.

## Data

- Every table: columns with type and rule, the index with the read it
  serves (or "none: <why>"), retention.
- An invariant an AC states as "only one" or "once", or one about
  money, access or ownership, has a database constraint, not only code.
- Migrations expand only, in order, each reversible or marked
  "cannot be undone", with what stands in for it.
- Money in integer cents, time in UTC, the business period in the
  project's time zone, unless the standards say otherwise.
- Contracts only grow: removing a field or changing its meaning waits
  until no client uses it.

## Checked against the code

`design-contracts` reads the Contract against the repo at its base and
the generated code: an existing route keeps its shape for its current
clients; a claim like "the server refuses X" is true of the handler
that will serve it; a name that already exists means the same thing.
