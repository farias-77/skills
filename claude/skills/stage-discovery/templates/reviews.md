# Discovery review audit: <workstream>

<!--
  Written by the CONDUCTOR, who is the judge. The workflow's return value is
  saved as is in 00-discovery/reviews/round-N.json (the authority); this file
  is the index written from it before any fix is sent. Two rounds: round 1
  whole, round 2 the delta (the stories and lenses the fixes touched). No
  third round.
-->

## Mechanical checks before the round

| Check | Result |
|---|---|
| `proto.mjs walk` on the locked mock | <PASS · or the gaps he accepted at the lock> |
| `proto.mjs trace` (journeys ↔ mock, steps ↔ ACs, rules ↔ ACs) | <PASS · fails listed and sent to the scribe> |

## Round <N> — <date> · run <id> · <whole | delta>

| Lens | Verdict | Findings |
|---|---|---|
| disc-reviewer-acceptance | | |
| disc-reviewer-boundary | | |
| disc-blind-reader (per story) | | |

### Blind walks

| Story | ACs | pass | fail (mock disagrees) | cannot judge | Unread |
|---|---|---|---|---|---|
| S-001 | <n> | <n> | <ids> | <ids> | <yes when the reading was dropped> |

### Findings and rulings

#### [<severity>] <lens>#<n> — <title>  <(merged with <ids>)>

- **Finding:** <gap>
- **Ruling:** sustained · owner <author / user> | deferred | for the design | dismissed — <the reason; the sentence or the frame that decides it>
- **User:** <his answer, verbatim, when the owner was him; "—" otherwise>

### The round's lists

- **To `journey-scribe`:** <ids>
- **To `disc-author-prfaq`:** <ids>
- **To the user, by decision:** <decision → ids>, …
- **For the design:** <ids with the story each came from>
- **Dismissed:** <ids>

### Round close

<findings N · to the authors N · to the user N (as N decisions) · deferred N · for the design N · dismissed N>

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | For the design | Dismissed |
|---|---|---|---|---|---|

### For the design

<the whole list, with the story each came from; stage 2 reads it>

### Residue

<what was still sustained after round 2, with the reason; what he decided about it>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
