# Interview notes — <workstream title> (`<slug>`)

<!--
  The interview's record, written as the conversation happens. Two
  readers: the conductor, to resume from any point, and disc-author,
  which writes the PR-FAQ and the User Stories from this file alone.
  If a fact is not here, the author does not know it. Write in the
  user's language; keep the user's own words where they carry a
  decision or a taste.

  Kept when the stage closes: the record of how the two documents
  came to be, next to them.
-->

## Starting point

- **What the user brought:** <the demand in one paragraph, as first stated>
- **How formed it is:** <idea · sketch · spec> — <what the user has already covered alone>
- **What the user knows well / does not know:** <domains where the blindspot pass ran, and what it taught>
- **References:** <product, site, repo, folder — what to look at in each, and what the user liked>
- **Prior decisions:** <none> | <document · what it decided · imported as Confirmed with its source>

## Coverage map

| Category | State |
|---|---|
| Behavior (every flow, happy and bad paths) | Missing |
| Actors & permissions | Missing |
| Data the user sees and touches (and where each piece comes from) | Missing |
| Integrations & external dependencies | Missing |
| Edge cases (empty, limits, repeats, races) | Missing |
| Constraints (legal, cost, deadline, platform, personal data) | Missing |
| Terminology (every domain word defined) | Missing |
| Boundary (In and Out closed; direction mapped) | Missing |

## Vocabulary

<!-- One line per domain word, in the user's words. The author copies
     this into the stories' vocabulary block. -->

- **<word>** — <definition>

## Themes

<!-- One section per theme, in the order they were discussed. A theme
     is a flow, an actor, a screen, an integration — whatever the
     conversation closed as a unit. Four blocks each; an empty block
     says "(none)". -->

### <theme>

**Said** — the user's words, close to verbatim, where they decide something.

- "<quote>"

**Confirmed** — facts the user confirmed when restated. These become ACs.

- WHEN <condition>, the system does <behavior>.

**Inferred** — what the conductor proposed and the user did not discuss. Marked as a guess; each one is confirmed or rejected at the playback.

- <guess> — because <why it seemed right>

**Out** — what this theme leaves out. Two kinds, always named.

- <capability> — not building: <reason>
- <capability> — future direction (from the evolution question), not scheduled

## Stories

<!-- Written at the playback: the scope the user closed, one line per
     story. The authors write these stories and no other. -->

| Story | What it does | Ruling | The user's words |
|---|---|---|---|
| S-001 | <one line> | confirm · reduce · adjust · cut | "<quote>" |

## Bets

<!-- What would have to be true for the product to work. Each one with
     how it was checked (search, a document, the user's own knowledge)
     and the result. An unchecked bet is written as unchecked. -->

- <assumption> — checked by <how> — <holds · does not hold · unchecked>

## Open

<!-- Questions that passed the razor and are not answered yet. Empty
     before the playback. -->

- (none)
