# Discovery review audit: <workstream>

<!--
  Written by the CONDUCTOR, who is the judge. The workflow's return value is
  saved as is in 00-discovery/reviews/round-1.json (the authority); this file
  is the index written from it before any fix is sent. One round, whole: no
  delta. The conductor verifies the fixes by reading them.
-->

## Mechanical checks before the round

| Check | Result |
|---|---|
| `proto.mjs walk` on the locked mock | <PASS · or the gaps he accepted at the lock> |
| `proto.mjs trace` (journeys ↔ mock, ACs ↔ steps and frames, one AC per rule) | <PASS · fails listed and sent to the scribe> · <ACs: N, per story: …> |

## The round — <date> · run <id>

| Source | Verdict | Findings |
|---|---|---|
| disc-reviewer | | |
| disc-blind-reader (per story) | | |

### Blind walks

| Story | ACs judged | contradicts (mock disagrees) | undecidable | Unread |
|---|---|---|---|---|
| S-001 | <n> | <ids> | <ids> | <yes when the reading was dropped> |

Dropped by the filter: <n, with the reasons from `dropped`>

### Findings and rulings

#### [<severity>] <source>#<n> — <title>  <(merged with <ids>)>

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

### Fixes verified

| Finding | Changed line (file:line) | Closed |
|---|---|---|
| <id> | <the line as it now reads> | <yes · no: back to the author once · residue> |

## Close

### Precision per source

| Source | Findings | Sustained | Deferred | For the design | Dismissed |
|---|---|---|---|---|---|

### For the design

<the whole list, with the story each came from; stage 2 reads it>

### Residue

<what was still wrong after the fixes were verified, with the reason; what he decided about it>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
