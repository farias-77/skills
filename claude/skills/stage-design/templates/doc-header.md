<!--
  The header block every design document carries right under its title,
  before anything else. The writer copies the rows from sizing.md, the
  pick and the evolution path, for the parts this document carries; it
  never rescores, rewords or drops a row. design-reviewer-sizing
  (Opus 5.5, medium) compares the block with sizing.md row by row, and
  every mechanism below it with the tier the block declares.

  Which parts each document carries:
  | Document      | Parts                                  |
  |---------------|----------------------------------------|
  | architecture  | compute, integrations                  |
  | data-model    | data                                   |
  | contracts     | contracts                              |
  | ui            | ui                                     |
  | security      | security                               |
  | infra         | compute, integrations, ops (resources) |
  | observability | ops                                    |
  | rollout       | data (migrations), ops (first run)     |
  | code          | every part it lays out, tier only      |
  | acceptance    | tests                                  |

  A sub-part (compute.invite-email) is a row of its own. A part the
  demand does not touch is one row: "untouched — <why>".
-->

## Size and evolution

Tier per part, as `sizing.md` picked them (status <final | amended YYYY-MM-DD>):

| Part | Tier | Why (req) |
|---|---|---|
| <compute.invite-email> | <balanced> | <R3 V2 C1 — a message sent (req: door:message-sent)> |

Evolution path for these parts:

| Part | Now | Signal (number · who watches) | Next | Cost |
|---|---|---|---|---|
| <part> | <what is built now> | <the number · the alarm, read or query that watches it> | <the next step> | <h, or config> |

<!-- No row for a part: "none: <why nothing here moves up>". -->
