# Discovery review audit — <workstream>

<!--
  Written by the CONDUCTOR, who is the judge: the workflow's return
  value is saved as is in 00-discovery/reviews/round-N.json (the
  authority) and this file is the index written from it, one round at
  a time, before any fix is sent. Per round: every lens with verdict,
  run id and verified list; the stories read blind and the keys where
  the readers built different products; every finding (or merged
  group) with the ruling, the owner and the reason quoting the
  sentence that decides it; the four lists the round produced. Up to
  three rounds; the user is asked after each whether to run another.
-->

## Round <N> — <date> · run <id> · whole

| Lens | Verdict | Run id | Findings |
|---|---|---|---|
| disc-reviewer-walkthrough | | | |
| disc-reviewer-acceptance | | | |
| disc-reviewer-boundary | | | |
| disc-reviewer-ambiguity (referees) | | | |

### Blind reads

| Story | Keys compared | Different product | Unread |
|---|---|---|---|
| S-001 | <n> | <keys, or none> | <yes when a reader was dropped> |

### Findings and rulings

#### [<severity>] <lens>#<n> — <title>  <(merged with <ids>)>

- **Finding:** <gap>
- **Ruling:** sustained · owner <author / user> | deferred | for the design | dismissed — <the reason; the sentence that decides it, quoted>
- **User:** <his answer, verbatim, when the owner was him; "—" otherwise>

### The round's lists

- **To `disc-author-prfaq`:** <ids>
- **To `disc-author-stories`:** <ids>
- **To the user, by decision:** <decision → ids>, …
- **For the design:** <ids with the story each came from>
- **Dismissed:** <ids>

### Round close

<findings N · to the authors N · to the user N (as N decisions) · deferred N · for the design N · dismissed N · another round: yes | no — "<the user's words>">

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | For the design | Dismissed |
|---|---|---|---|---|---|

### For the design

<the whole list, with the story each came from — stage 2 reads this at its macro shape>

### Residue

<what was still sustained when the user closed the rounds, with the reason; what he decided about it at the approval>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
