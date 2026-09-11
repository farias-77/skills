# Design review audit — <workstream>

<!--
  Written by the CONDUCTOR, with no scribe agent: the workflow's
  return value is saved as is in reviews/round-N.json (the authority),
  and this file is the index written from it in one pass, the rulings
  appended as they happen. Permanent: the proof the review happened
  and the record of the rulings; design-review.json is filled from it
  at the close. MUST have, per round: every lens that ran with verdict,
  run id (from the workflow journal, not prose) and verified list; the
  flows read blind, with the keys where the two readers built
  different products; every finding with the conductor's ruling, owner
  and reason (the foreclosing sentence quoted on every dismissal), and,
  for the user's, his ruling and words. Written before anything is
  applied. Round 1 is whole; rounds 2 and 3 are delta only, on the
  user's word, recorded here with his words.
-->

## Round <N> — <date> · run <id> · whole | delta over <docs, flows>

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
| design-reviewer-consistency | | | |
| design-reviewer-ambiguity | | — | |

### Blind reads

| Flow | Keys compared | Different product | Unread |
|---|---|---|---|
| <flow heading> | <n> | <keys, or none> | <yes when a reader was dropped> |

### Findings and rulings

#### [<severity>] <lens>#<n> — <title>

- **Finding:** <gap>
- **Merged with:** <ids, or —>
- **Ruling:** <sustained / deferred / dismissed> · owner <writer / user / implementer / —> — <reason; the sentence quoted on a dismissal>
- **User:** <his ruling and words when the owner was him; "—" otherwise>

### The lists

- **To the writers** (by document): …
- **To the user** (by decision): …
- **To latitude** (by document): …
- **Dismissed**: …

### Round close

<sustained N (writer N · user N · implementer N) · deferred N · dismissed N · the user's word on another round>

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | Dismissed |
|---|---|---|---|---|

### Residue

<what stayed sustained after the last round and was applied without re-review, with the line proof; what the user accepted as is, with his words>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
