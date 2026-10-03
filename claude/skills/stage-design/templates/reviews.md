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
  different products; every finding (or merged group) as ONE ROW with
  the conductor's ruling, owner and reason (the foreclosing sentence
  quoted on every dismissal); the finding's own text (title, says,
  gap, fix) stays in reviews/round-N.json and is never copied here;
  and,
  for a finding of the user's class, the conductor's conservative
  ruling marked `ruled: conductor` (listed at the close for his veto).
  Written before anything is applied. Round 1 is whole and round 2 is
  delta only, both automatic; there is no round 3: what is still
  sustained after round 2 is applied with line proof and is residue.
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
| design-reviewer-sizing | | | |
| design-reviewer-ambiguity | | — | |

### Blind reads

| Flow | Keys compared | Different product | Unread |
|---|---|---|---|
| <flow heading> | <n> | <keys, or none> | <yes when a reader was dropped> |

### Findings and rulings

<!-- One row per finding or merged group (the workflow's `clusters` are
     the candidates). The short lens name is enough: data#1. -->

| Finding(s) | Severity | Class | Ruling | Owner | Reason |
|---|---|---|---|---|---|
| <data#1 + coverage#1> | <blocker / fix / detail> | <correctness / coverage / contradiction / door / size> | <sustained / deferred / dismissed> | <writer / implementer / his class / —> | <one or two sentences; the sentence quoted on a dismissal; for his class: `ruled: conductor`, the conservative pick and why> |

### The lists

- **To the writers** (by document): …
- **His class, ruled by the conductor** (by decision, for veto): …
- **To latitude** (by document): …
- **Dismissed**: …

### Round close

<sustained N (writer N · his class N · implementer N) · deferred N · dismissed N · round 2 runs (round 1) | the review closes (round 2)>

## Close

### Precision per lens

| Lens | Findings | Sustained | Deferred | Dismissed |
|---|---|---|---|---|

### Residue

<what stayed sustained after round 2 and was applied without re-review, with the line proof>

### Taste notes added

<one line each, as written to the workstream's taste-notes.md>
