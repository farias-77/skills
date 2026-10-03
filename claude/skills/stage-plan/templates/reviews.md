# Plan review audit — <workstream>

<!--
  Written by THE CONDUCTOR (Opus 5.5, high), with no scribe agent: the workflow's
  return value is saved as is in 02-plan/reviews/round-N.json (the
  authority), and this file is the index written from it in one pass,
  the rulings appended as they happen. Permanent: the proof the review
  happened and the record of the rulings; plan-review.json is filled
  from it at the close. MUST have, per round: every lens that ran with
  verdict, run id (from the workflow journal, not prose) and verified
  list; the briefs read blind, with the keys where the two readers
  built or proved different things; every finding with the conductor's
  ruling, owner and reason (the foreclosing sentence quoted on every
  dismissal); every graph change with the checker's summary line after
  it. Written before anything is applied. Round 1 is whole; round 2 is
  delta and automatic; then the stage stops: what is still sustained is
  applied without re-review and written as residue. Nobody is asked:
  every ruling is the conductor's, and those that change the cut are
  listed for his veto.
-->

## Round <N> — <date> · run <id> · whole | delta over <briefs>

**Checker before the round:** `<✓ graph holds · width n · depth n · critical F → … (weight n)>`

| Lens | Verdict | Run id | Findings |
|---|---|---|---|
| plan-reviewer-coverage | | | |
| plan-reviewer-verifiability | | | |
| plan-reviewer-order | | | |
| plan-reviewer-ambiguity | | — | |

### Blind reads

| Brief | Keys compared | Different product | Unread |
|---|---|---|---|
| <E-nn> | <n> | <keys, or none> | <yes when a reader was dropped> |

### Findings and rulings

#### [<severity>] <lens>#<n> — <title>

- **Finding:** <gap>
- **Merged with:** <ids, or —>
- **Ruling:** <sustained / deferred / dismissed> · owner <writer / conductor / builder / —> — <reason; the sentence quoted on a dismissal>
- **Graph:** <for a conductor ruling: what changed in plan.graph.json and plan.md, and the checker's line after it; "—" otherwise>

### The lists

- **To the writers** (by brief): …
- **Graph changes** (by decision, `ruled: conductor`, listed at the close for veto): …
- **To the builder** (by brief): …
- **Dismissed**: …

### Round close

<sustained N (writer N · conductor N · builder N) · deferred N · dismissed N · round 2 automatic | the stage stops here>

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | Dismissed |
|---|---|---|---|---|

### Residue

<what stayed sustained after round 2 and was applied without re-review, with the line proof; what he vetoed after the report, with his words>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
