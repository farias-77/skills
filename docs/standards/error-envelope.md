# The error envelope standard

One error shape across every API of the house. The payoff: the front
renders any service's error without per-service adapters, smoke and
e2e assert exact codes everywhere the same way, and a caller learns
ONE error grammar for the whole platform.

## The shape

Every non-2xx response body IS this envelope — no naked strings, no
ad hoc shapes, no exceptions:

```jsonc
{
  "error": {
    "code": "LEAD_EMAIL_INVALID",   // stable machine key, SCREAMING_SNAKE
    "message": "This email doesn't look valid — check it and try again.",
    "details": [                     // optional: structured field errors
      { "field": "email", "code": "INVALID_FORMAT" }
    ],
    "request_id": "req_01J8..."      // correlation id, always present
  }
}
```

## The rules

| ID | Rule |
|---|---|
| env.1 | **One shape, whole surface.** Every error a service can return — validation, auth, not-found, conflict, rate-limit, downstream failure — wears this envelope. A service with two error shapes has one bug. |
| env.2 | **The status is the class; the `code` is the reason.** One status can carry many codes; a code maps to exactly one status. Tests assert the CODE (the testing standard's e2e.2) — the right status with the wrong code is a failing case. |
| env.3 | **`message` is user-facing, written at design time.** It is authored in the contract (stage 2 demands it per error case) and the front renders it **as-is** — so it speaks the product's language and the user's vocabulary, never the system's ("This email doesn't look valid", never "schema validation failed at $.email"). |
| env.4 | **Nothing internal leaks.** Unexpected failures collapse to `INTERNAL_ERROR` with a generic message and the `request_id` for correlation — stack traces, SDK errors, table names, and internal state never cross the boundary. |
| env.5 | **Codes are contract, and contract evolution is additive** (the code standard's ctr.2): adding a code is safe; renaming or removing one is a breaking change with all its ceremony. |
| env.6 | **The front branches on `code`, renders `message`.** Client logic never parses message text — the message can be reworded freely; the code cannot. |

## Where it is enforced

The contract document defines each endpoint's error surface in this
envelope (the `design-reviewer-contracts` lens refuses anything else);
the code standard's ctr.5 makes it the shape typed errors serialize
to; smoke and e2e assert the codes; the front consumes it by env.6.
One shape, four gates.
