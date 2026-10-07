# Choosing the route

## The three routes

| Route | When | His touches |
|---|---|---|
| **short** | one behavior that fits one entry: at most ~6 ACs (half the plan's cap: no plan and no design review stand behind it), ~45 min of builder; no big new screen; no new table (a nullable column is fine); nothing irreversible | the idea · the authorization + `/goal` · his ok |
| **hotfix** | production is broken, or data is wrong, now | the idea (with the staging delegation) · the authorization + `/goal` · his staging check unless delegated |
| **full** | several new rules, a new screen, new data, an integration with something outside, or doubt about **what** to build | the whole discovery |

When in doubt between short and full, go full.

## Examples on each side of the line

| Short | Full |
|---|---|
| "Show each manager's last access on the Team screen": one column, a relative date | "Managers see a usage dashboard": a new screen, new aggregations |
| "Export the notices as CSV": one button, one endpoint | "Export the notices and email them every Monday to each region": a scheduled job, email to real people |
| "Sort the list by due date by default" | "Let each user choose and save their own sort and filters": new data per user |
| "Accept a phone with a country code in the form": a validation rule | "Sign in with a phone number": identity, a provider, security |

| Hotfix | Not a hotfix |
|---|---|
| "Expired notices still count as unread since v1.4.0" | "Expired notices should disappear after 30 days" (a new rule: short or full) |
| "The import stopped this morning; leads are not arriving" | "Import from a second source" |

## `repo: legacy`

Not a route: a short route or a hotfix in one of the old repos still
live, which are frozen except for what operations cannot wait for.

| Allowed in a legacy repo | Not allowed |
|---|---|
| operations stopped, or data wrong | a new screen |
| a security hole | a new business rule |
| a data fix operations asked for | a "quick" new field |
| a change forced from outside (an external API, a certificate, DNS) | refactoring |
| what the cutover itself needs (export, redirect, dual-write) | "while I am here" |
| a small operations request that cannot wait (he allows it; the parity line the same day) | |

What changes: the repo's own doctrine, CI and deploy;
`authorize.sh legacy <repo> <branch>`; a 15-minute watch by the session
after the deploy; one ok from him before production when the repo has
no staging; and, the same day, one parity line in the platform's
feature map for that domain. Details: `stage-release/references/release.md`.

## Saying it

One line, the route and the reasons that decided it:

- "short route: one behavior, 2 ACs, one nullable column, nothing irreversible"
- "full route: a new screen and a weekly email to real people"
- "hotfix, repo: legacy: the listing in the old tracking API stopped; no staging, so I ask you before production"
