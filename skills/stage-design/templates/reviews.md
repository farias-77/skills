# Design review audit — <workstream>

<!--
  Written by the CONDUCTOR, never the author. Permanent: the proof the
  review happened (the blueprint has no Review tab), and the record of
  the rulings. MUST have, per round: every lens that ran with verdict,
  run id (from the workflow journal, not prose) and verified list; the
  flows read blind, with the keys where the two readers built
  different products; every finding with the judge's ruling, owner and
  reason, and, for the user's, his ruling and reason ("confirmed", or
  his words). Written before anything is applied. The budget is two
  whole rounds; a third only on the user's explicit call, recorded
  here with his words.
-->

## Round <N> — <date> · run <id> · whole

| Lens | Verdict | Run id | Findings |
|---|---|---|---|
| design-reviewer-data | | | |
| design-reviewer-code | | | |
| design-reviewer-infra | | | |
| design-reviewer-security | | | |
| design-reviewer-contracts | | | |
| design-reviewer-alarms | | | |
| design-reviewer-coverage | | | |
| design-reviewer-facts | | | |
| design-reviewer-ui | | | |
| design-reviewer-coherence | | | |

### Blind reads

| Flow | Keys compared | Different product | Unread |
|---|---|---|---|
| <flow heading> | <n> | <keys, or none> | <yes when a reader was dropped> |

### Findings and rulings

#### [<severity>] <lens>#<n> — <title>

- **Finding:** <gap>
- **Judge:** <ruling> · owner <author / user / implementer> — <its reason, one line>
- **Ruling (user):** <sustained / deferred / dismissed — "confirmed", or his reason; "—" when the owner was not him>

### Round close

<sustained N (author N · user N · implementer N) · deferred N · dismissed N · next: round 2 | applied without re-review | closed>

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | Dismissed |
|---|---|---|---|---|

### The judge

<rulings proposed N · confirmed N · overruled N (N toward sustained, N toward dismissed) · owner changed N>

### Residue

<what stayed sustained after round 2 and was applied without re-review, with the line proof; what the user accepted as is, with his words>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
