# Stories: Workspace invites (`workspace-invites`)

Mock: `mock/mock.html` · locked v1

Personas: **Manager** (runs a workspace, adds and removes people) · **Invitee** (a person with no account yet)

## Vocabulary

- **invite** — a pending offer to join one workspace, sent to one e-mail address
- **pending** — an invite sent and not yet accepted, expired or cancelled
- **workspace day** — midnight to midnight in the workspace's time zone

## Rules

| ID | Rule | Number | Examples | Source |
|---|---|---|---|---|
| INV-1 | A workspace sends a limited number of invites per workspace day; cancelled invites still count | 10 per day | the 10th is sent, the 11th is refused; 10 sent and 2 cancelled still refuses the next | "no spam, about 10 a day" · D-3, D-7 |
| INV-2 | An invite link stops working after a fixed time | 7 days | sent 19 Nov 09:00, works 26 Nov 08:59, refused 26 Nov 09:00 | accepted: same as the password reset link (A-2) |
| INV-3 | Only a manager sends, sees and cancels invites | role Manager | Dana Reyes (member) sees no invite form and no pending rows | "managers only" · D-5 |

---

## S-001 — Invite a person to the workspace

**Actor:** Manager · **Job:** When someone new joins my team, I want to invite them by e-mail from the Members page, so I can give them access without asking support.

**Journeys:** J1 (main flow) · J2 (extension at s2) · J3 (extension at s2) · J4 (extension at s1)

### Main flow (J1)

1. **s1** opens Members → the invite form and the daily counter show above the list
2. **s2** types an e-mail and sends → the invite is listed as pending · behind: one invite row, one e-mail
3. **s3** the counter drops by one

### Extensions

- **at s2, J2** the workspace already sent 10 invites today → the invite is refused and nothing is written
- **at s2, J3** the e-mail service is down → the invite is not created and the typed e-mail stays in the field
- **at s1, J4** the person is a member, not a manager → no form, no counter, no pending rows

### Acceptance criteria

- **`J1.s2.1`** [S-001] GIVEN Marina Okafor's workspace has sent 3 invites today
  WHEN she sends an invite to joao.lima@example.com
  THEN the Members list shows joao.lima@example.com as "pending · expires 26 Nov" (seen: screen)
  AND one invite row exists for joao.lima@example.com with status pending (seen: row read back)
  AND one e-mail with the invite link reaches joao.lima@example.com (seen: inbox)
  AND the counter reads "6 of 10 invites left today" (seen: screen)
- **`J2.s2.1`** [INV-1] GIVEN Marina Okafor's workspace has sent 10 invites today, 2 of them cancelled
  WHEN she sends an invite to joao.lima@example.com
  THEN the form shows "You reached today's 10 invites. The count resets at midnight." (seen: screen)
  AND no invite row exists for joao.lima@example.com (seen: row read back)
  AND no e-mail reaches joao.lima@example.com (seen: inbox)
- **`J3.s2.1`** [S-001] GIVEN the e-mail service refuses every send
  WHEN Marina Okafor sends an invite to joao.lima@example.com
  THEN the form shows "The invite was not sent. Try again in a minute." and still holds joao.lima@example.com (seen: screen)
  AND no invite row exists for joao.lima@example.com (seen: row read back)
- **`J4.s1.1`** [INV-3] GIVEN Dana Reyes is a member of Marina Okafor's workspace, which has 1 pending invite
  WHEN Dana Reyes opens Members
  THEN the page shows the 2 members and no invite form, no counter and no pending row (seen: screen)
  AND a direct request to send an invite as Dana Reyes is refused (seen: response)

### Error paths

| Path | Case | Where | Criterion |
|---|---|---|---|
| Limit | the 11th invite of the workspace day | J2.s2 | `J2.s2.1` |
| Dependency failure | the e-mail service is down | J3.s2 | `J3.s2.1` |
| Permission | a member opens Members | J4.s1 | `J4.s1.1` |
| Repeat | the same e-mail invited twice while pending | NB-2 | — |

### In

- An invite form and a daily counter on the Members page, for managers
- Pending invites listed with the day they expire

### Not building

- NB-1, NB-2 (see `not-building.md`)

---

## S-002 — Accept an invite

**Actor:** Invitee · **Job:** When I get an invite e-mail, I want to open the link and join, so I can start working in that workspace.

**Journeys:** J5 (main flow) · J6 (extension at s1)

### Main flow (J5)

1. **s1** opens the link from the e-mail → the join page names the workspace
2. **s2** confirms → is a member of the workspace · behind: the invite row becomes accepted, one member row

### Extensions

- **at s1, J6** the link is 7 days old or more → the page says the invite expired and whom to ask

### Acceptance criteria

- **`J5.s2.1`** [S-002] GIVEN joao.lima@example.com holds a pending invite to Marina Okafor's workspace sent 19 Nov 09:00
  WHEN he opens the link on 20 Nov and confirms
  THEN he lands on the workspace home as a member (seen: screen)
  AND the invite row reads accepted and one member row exists for joao.lima@example.com (seen: row read back)
- **`J6.s1.1`** [INV-2] GIVEN joao.lima@example.com holds an invite sent 19 Nov 09:00
  WHEN he opens the link on 26 Nov 09:00
  THEN the page shows "This invite expired. Ask Marina Okafor for a new one." (seen: screen)
  AND no member row exists for joao.lima@example.com (seen: row read back)

### Error paths

| Path | Case | Where | Criterion |
|---|---|---|---|
| Limit | the link at exactly 7 days | J6.s1 | `J6.s1.1` |
| Dependency failure | accepting sends no e-mail and calls no outside service | n/a: nothing outside is called | — |
| Permission | anyone holding the link may accept | n/a: the link is the permission | — |
| Repeat | the link opened again after accepting | NB-3 | — |

### In

- A join page reached from the e-mail link

### Not building

- NB-3 (see `not-building.md`)

---

## Assumptions

- **A-1** — The invite e-mail uses the product's current sender and layout — source: `standards/operations.md:41` — cost if wrong: cheap
- **A-2** — The link expires after 7 days, like the password reset link — source: `apps/api/auth/reset.ts:18` — cost if wrong: cheap
- **A-3** — The workspace day follows the workspace's time zone, not the manager's — source: `apps/api/workspaces/model.ts:9` — cost if wrong: costly

## For the design

- **T-1** — Two managers send the 10th invite at the same moment: which one is refused is a mechanism (a lock or a counter), not a product decision
- **T-2** — How long an expired invite row is kept

## Open

- (none)
