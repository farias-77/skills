# Release plan · <slug>

<!-- Written at execute, while he uses the app, and finished before his ok.
     The release /goal is filled from this file. Timestamps from `date -u`. -->

- **Head he said ok to:** `feat/<slug>` @ `<sha>` · <date>
- **Version:** vX.Y.Z (<minor: a front · patch: short route, hotfix>)

## Ships

| Story | What changes for its user |
|---|---|
| <S-n> | <one line> |

## Migrations

| File | Expand or contract | Existing table? | Real-data risk · how it was checked |
|---|---|---|---|
| `<file>` | expand | <yes: table> \| no | <risk> · <the count he ran, result, date> \| none |

## Goes live for real people

<emails, notifications, jobs that act on real data, a toggle turned on; one line each> | nothing

## Known irreversible steps (authorized in the /goal)

<one line each, with when it runs> | none

## Toggles

| Toggle | Starts | Turned on by |
|---|---|---|
| <name> | off | <its own PR \| this release> |

## Smoke additions

<read-only journeys this front adds to the smoke, if the CI's list does not cover them> | none
