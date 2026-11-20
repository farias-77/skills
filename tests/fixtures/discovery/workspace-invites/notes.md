# Notes: Workspace invites (`workspace-invites`)

## Starting point

- **Request:** "managers should invite people themselves instead of writing to support"
- **Origin:** typed in the session
- **Size:** feature · one screen changes, two roles, one outside service (e-mail)
- **Screen:** Members
- **Languages of the copy:** en · **Widths that matter:** desktop, phone

## Said

- "today a manager writes to support and we add the person by hand, it takes a day"
- "managers should invite people themselves instead of writing to support"
- "by e-mail, from the Members page, that is where they already look"
- "no spam, about 10 a day is plenty for any team we have"
- "managers only, a member has no business inviting anyone"
- "the link should not live forever"

## Recon

- **Next to the change today:** `discovery/recon/today.md`
- **Design system (when a screen changes):** tokens `packages/ui/tokens.css` · components `packages/ui/src/` · app shell `apps/web/src/shell/` · the screen's source `apps/web/src/members/` · screenshots `discovery/recon/screens/`
- **Other workstreams on the same area:** none
- **Words the product already uses for something else:** none

## Coverage

| Area | State |
|---|---|
| Why, and for whom | clear |
| Journeys (trigger, steps, end) | clear |
| Rules with numbers (limit, expiry, cadence) and their boundary | clear |
| Error paths (limit, dependency down, permission, repeat) | clear |
| Who can do and see what | clear |
| Data shown and where it comes from | clear |
| Personal data (who sees it, how long it is kept) | partial |
| Words that carry a rule (a refusal, an e-mail) | clear |
| Constraints (legal, cost, deadline, platform) | n/a |
| In and not building | clear |

## Vocabulary

- **invite** — a pending offer to join one workspace, sent to one e-mail address · avoid: invitation, request
- **pending** — an invite sent and not yet accepted, expired or cancelled · avoid: open, waiting
- **workspace day** — midnight to midnight in the workspace's time zone · avoid: today (alone), 24 hours

## Decisions

| ID | Decision | After | Answer | Provenance | His words, or the source |
|---|---|---|---|---|---|
| D-1 | Where the manager invites from | — | the Members page, above the list | said | "from the Members page, that is where they already look" |
| D-2 | One person at a time or many | D-1 | one at a time | accepted | proposed: the largest team he named has 14 people; a bulk form needs its own error handling |
| D-3 | How many invites a workspace sends | — | 10 per workspace day | said | "no spam, about 10 a day is plenty for any team we have" |
| D-4 | What "a day" means for the limit | D-3 | the workspace day (its time zone), resets at midnight | assumed | `apps/api/workspaces/model.ts:9` holds a time zone per workspace; shown at the readback, not answered |
| D-5 | Who sends, sees and cancels invites | — | managers only | said | "managers only, a member has no business inviting anyone" |
| D-6 | How long the link works | — | 7 days | accepted | proposed: same as the password reset link (`apps/api/auth/reset.ts:18`); he said "yes, same as the reset" |
| D-7 | Does a cancelled invite give its slot back | D-3 | no, a cancelled invite still counts that day | said | "no, otherwise they cancel and resend all day, it still counts" |
| D-8 | The e-mail service is down when she sends | — | nothing is created, the form keeps the e-mail and says to try again | accepted | proposed: an invite with no e-mail is a pending row nobody can accept |
| D-9 | A second invite to an e-mail with a pending one | — | not building; the form refuses it | accepted | proposed: resending comes later, once he sees how often invites expire |

## Rules

| ID | Rule | Number | Examples | Provenance | Source |
|---|---|---|---|---|---|
| INV-1 | A workspace sends a limited number of invites per workspace day; cancelled invites still count | 10 per day | the 10th is sent, the 11th is refused; 10 sent and 2 cancelled still refuses the next | said | "about 10 a day" · D-3, D-7 |
| INV-2 | An invite link stops working after a fixed time | 7 days | sent 19 Nov 09:00, works 26 Nov 08:59, refused 26 Nov 09:00 | accepted | D-6 |
| INV-3 | Only a manager sends, sees and cancels invites | role Manager | Dana Reyes (member) sees no invite form and no pending rows | said | "managers only" · D-5 |

## Journeys

### J1 — A manager invites a person

- **Actor / job:** Manager · When someone new joins my team, I want to invite them by e-mail from the Members page, so I can give them access without asking support.
- **Steps:** s1 opens Members → the invite form and the daily counter show above the list · s2 types an e-mail and sends → the invite is listed as pending · s3 the counter drops by one
- **Behind:** s2: one invite row, one e-mail
- **Error paths:** limit → J2 · dependency → J3 · permission → J4 · repeat → NB-2

### J2 — The daily limit is reached

- **Steps:** at J1.s2, the workspace already sent 10 invites today → refused, nothing written. Words: "You reached today's 10 invites. The count resets at midnight."

### J3 — The e-mail service is down

- **Steps:** at J1.s2, the send fails → no invite row, the typed e-mail stays in the field. Words: "The invite was not sent. Try again in a minute."

### J4 — A member opens Members

- **Steps:** at J1.s1, the person is a member → no form, no counter, no pending rows; a direct request is refused

### J5 — An invitee accepts

- **Actor / job:** Invitee · When I get an invite e-mail, I want to open the link and join, so I can start working in that workspace.
- **Steps:** s1 opens the link → the join page names the workspace · s2 confirms → is a member, lands on the workspace home
- **Behind:** s2: the invite row becomes accepted, one member row
- **Error paths:** limit → J6 · dependency → n/a: nothing outside is called · permission → n/a: the link is the permission · repeat → NB-3

### J6 — The link expired

- **Steps:** at J5.s1, the link is 7 days old or more → "This invite expired. Ask Marina Okafor for a new one."

## Assumptions

- **A-3** — The workspace day follows the workspace's time zone, not the manager's — source: `apps/api/workspaces/model.ts:9` — cost if wrong: costly — assumed
- **A-1** — The invite e-mail uses the product's current sender and layout — source: `standards/operations.md:41` — cost if wrong: cheap — assumed
- **A-2** — The link expires after 7 days, like the password reset link — source: `apps/api/auth/reset.ts:18` — cost if wrong: cheap — accepted

## Not building

- Inviting many people at once (a pasted list or a file) — not building: one at a time covers the team sizes he named — accepted
- A second invite to an e-mail that already has a pending one — not building: the form refuses it; resending comes later — accepted
- Reusing a link after it was accepted — not building: the link opens the sign-in page, as every other old link does — assumed
- Resending or extending a pending invite — later: he wants to see how often invites expire first — said

## Deferred

- (none)

## For the design

- Two managers send the 10th invite at the same moment: which one is refused
- How long an expired invite row is kept

## Mock log

| Build | Date | What changed | From |
|---|---|---|---|
| 1 | 19 Nov | first build | the stories |
| 2 | 19 Nov | the counter moved next to the Send button; the refusal says when the count resets | "the counter is far from where I click" · "say when it comes back" |

## Lock

- **Locked:** v1 · 19 Nov · "that is it, the counter is right"
