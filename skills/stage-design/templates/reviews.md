# Design review audit — <wave>

<!--
  Written by the CONDUCTOR, never the author. Permanent — this file is
  the proof the review happened (the blueprint has no Review tab), and
  the record of the USER's rulings: the judge proposes, he rules.
  MUST have, per round: every reviewer that ran with verdict + run id
  (from the workflow journal, not prose) + verified list; every finding
  with the judge's ruling and reason AND his ruling — sustained /
  deferred / dismissed — with his reason ("confirmed", or his words).
  Written before anything is applied. The close carries the precision
  table per lens, the judge's confirmed/overruled line, and the
  deferred batch's fate — all decided with him.
-->

## Round <N> — <date> · run <id> · full | delta (<lenses>)

| Reviewer | Verdict | Run id | Findings |
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

### Findings and rulings

#### [<severity>] <reviewer>#<n> — <title>

- **Finding:** <gap>
- **Judge:** <ruling — its reason, one line>
- **Ruling (user):** sustained / deferred / dismissed — <"confirmed", or his reason>

### Round close

<sustained N (blockers N) · deferred N · dismissed N · next: delta on <lenses> | full final round | closed by the user>

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | Dismissed |
|---|---|---|---|---|

### The judge

<rulings proposed N · confirmed N · overruled N (N toward sustained, N toward dismissed)>

### Deferred batch

<what the user let in (one author pass, touched lenses once more) · what stays out>

### Taste ledger entries added

<one line each, as written to docs/standards/taste.md>
