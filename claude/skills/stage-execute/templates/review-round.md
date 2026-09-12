# Review — row <N.k> — round <n> — <whole | delta since `<sha>`>

<!--
  Written by the WORKER from the workflow's return value (saved as is
  in reviews/<repo>/<N.k>/r<n>.json, the authority), before any fix is
  sent. Permanent. MUST have: every lens with verdict, run id and
  verified list; every finding with the worker's ruling, owner and
  reason, the foreclosing sentence quoted on every dismissal; then the
  lists the round produced. Round 1 reads the whole diff; round 2
  reads the delta with the fixes listed; there is no round 3.
-->

- **Diff:** `git diff <base>...<branch>` | `git diff <since>...<branch>` · <files> files · +<n> −<n>
- **Lenses:** 5 | 3 (delta is strings and tests only: <which files>)
- **Run:** <workflow run id> · <date -u>

| Lens | Verdict | Findings | Verified (count) | Invalid |
|---|---|---|---|---|
| exec-lens-fidelity | | | | |
| exec-lens-code | | | | |
| exec-lens-proof | | | | |
| exec-lens-security | | | | |
| exec-lens-operations | | | | |

## Findings and rulings

#### [<severity>] <lens>#<n> — <title>

- **Says:** "<the quoted lines, file:line>"
- **Gap:** <one line>
- **Fix proposed:** <one line>
- **Merged with:** <ids, or —>
- **Ruling:** sustained | deferred | dismissed · **owner:** builder | note | master
- **Reason:** <one line; on a dismissal, the foreclosing sentence quoted and where it is>

## Lists

- **To the builder (the fix pass):** <id → the fix as sent, one line each>
- **Notes that ride:** <id → one line>
- **To the master:** <id → the parked line sent, or none>
- **Dismissed:** <id → the quote>
