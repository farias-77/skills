## How to verify

| | |
|---|---|
| **Reach** | `<route or URL path on the local stack>`; entry point in the UI: `<menu > item>` |
| **Actor** | `<test actor role>` (from `stack env`); also visible to: `<roles>`; forbidden to: `<roles>` |
| **Precondition** | `<what must exist first, and the factory or seed command that creates it>` |
| **Server** | `<METHOD /path>` · `<job or event name>` |

### States

| State | How to reach it | What the screen shows |
|---|---|---|
| empty | `<steps>` | `<the empty state copy or element>` |
| loading | `<steps; how to slow it, if needed>` | `<skeleton / spinner>` |
| error | `<steps; how to make the server fail locally>` | `<the error copy>` |
| forbidden | log in as `<role>` | `<the forbidden copy or redirect>` |
| success | `<steps>` | `<what appears>` |

### Side effects to read back

| Effect | How to read it |
|---|---|
| row written | `<query or command on the local stack, read-only>` |
| event / message | `<topic, queue or log event name, and how to read it>` |
| e-mail / notification | `<the local mail catcher's URL or the fake's log>` |

### Journeys that already prove it

- `<e2e/journey.spec.ts>` — `<what it covers>`
