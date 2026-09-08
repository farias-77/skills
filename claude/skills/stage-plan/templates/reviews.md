# Plan review audit — <workstream>

<!--
  Written by the CONDUCTOR, never the author, with no scribe agent:
  the workflow's return value is saved as is in 02-plan/reviews/round-N.json
  (the authority), and this file is the index written from it in one
  pass, the user's rulings appended as they happen. Permanent. MUST
  have, per round: every lens that ran with verdict, run id (from the
  workflow journal, not prose) and verified list; the goals read
  blind, with the rows where the two readers built or proved
  different things; every finding with the judge's ruling, owner and
  reason, and, for the user's, the conductor's ruling in his place.
  Two whole rounds, always: round 1's non-dismissed findings and
  suggestions applied, round 2 over the result, its output applied
  and final.
-->

## Round <N> — <date> · run <id> · whole

| Lens | Verdict | Run id | Findings |
|---|---|---|---|
| plan-reviewer-coverage | | | |
| plan-reviewer-verifiability | | | |
| plan-reviewer-order | | | |

### Blind reads

| Goal | Keys compared | Different product | Unread |
|---|---|---|---|
| <wave> | <n> | <keys, or none> | <yes when a reader was dropped> |

### Findings and rulings

#### [<severity>] <lens>#<n> — <title>

- **Finding:** <gap>
- **Judge:** <ruling> · owner <author / user / worker> — <its reason, one line>
- **Ruling (user):** <sustained / deferred / dismissed — "confirmed", or his reason; "—" when the owner was not him>

### Round close

<applied N (author N · user N · worker N · deferred-applied N) · dismissed N · parked for the close N · next: round 2 | final>

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | Dismissed |
|---|---|---|---|---|

### The judge

<rulings proposed N · confirmed N · overruled N (N toward sustained, N toward dismissed) · owner changed N>

### Residue

<what round 2 returned and was applied, with the line proof; what was sent back to the author twice and left unapplied; what the user vetoed or changed at the close, with his words>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
