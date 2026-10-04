# Interview notes: <workstream title> (`<slug>`)

<!--
  The interview's record, written by the conductor as the conversation
  happens, every turn. Three readers: the conductor, to resume from any
  point; prototyper, which builds the mock from it; journey-scribe and
  disc-author-prfaq, which derive the documents from it and the locked mock.
  If a fact is not here or in the mock, they do not know it. Write in the
  user's language; keep his own words where they carry a decision or a taste.
-->

## Starting point

- **What he brought:** <the demand in one paragraph, as first stated (the voice dump, condensed)>
- **How formed it is:** <idea · sketch · spec> · <what he has already covered alone>
- **References:** <product, site, screen, repo folder: what to look at, what he liked>
- **Prior decisions:** <none> | <document · what it decided · imported as Confirmed with its source>
- **Languages of the copy:** <en, pt-BR, …> · **Widths that matter:** <phone, desktop>
- **Timebox:** <behavior locked by …; beyond v8 or one day, lock behavior and park polish>

## Recon

<!-- What the scouts and the screenshot pass brought (D0). Paths, not content. -->

- **Feature maps read:** <path> · <path>
- **Current screens:** `00-discovery/recon/screens/<name>.png` · …
- **Tokens and components:** <tokens.css path · components list path> | <none exported: shell defaults, gap noted>
- **Other fronts touching these areas:** <workstream · what it changes> | none
- **Term collisions:** <word · what it already means in the product · path:line> | none (each one is in the Vocabulary's "avoid")

## Coverage map

| Category | State |
|---|---|
| People and jobs (who, in what situation) | Missing |
| Journeys (trigger → steps → end, happy and bad) | Missing |
| Rules with numbers (limits, expiry, cadence, thresholds) | Missing |
| Data on screen (and where each value comes from) | Missing |
| States per screen (empty, loading, error, permission, success) | Missing |
| Copy (every string, every language) | Missing |
| Look (tokens, references, what he liked) | Missing |
| Constraints (legal, cost, deadline, platform, personal data) | Missing |
| Vocabulary (every domain word defined) | Missing |
| Boundary (In and Out closed; direction mapped) | Missing |

## Vocabulary

- **<word>** — <definition> · avoid: <the words not to use for it>

## Rules

<!-- Every number that encodes a rule, one id each. The mock enforces them;
     the ACs cite them. An example per rule ("the one where…"), and its
     boundaries. -->

<!-- Proof: `mock` when a journey step can show it; `[build]` when a one-file
     mock cannot (real time, a server's refusal, a reload, a second session):
     he confirms the [build] marking, the rule counts as covered by the
     build, and its one AC carries [build]. -->

| ID | Rule | Number | Source | Examples | Proof |
|---|---|---|---|---|---|
| <PREFIX-1> | <rule> | <value + unit> | "<his words>" | <the one where…> | mock |

## Journeys

<!-- The sketch the prototyper builds from. One line per step. A journey is
     ready for the mock when its actor, trigger, steps and end are here. -->

### J1 — <title>

- **Actor / job:** <persona> · When <situation>, I want to <motivation>, so I can <outcome>.
- **Steps:** s1 <do> → <lands on> · s2 <do> → <lands on> · …
- **Behind:** <rows, e-mails, events per step>
- **Bad paths:** <boundary input · repeat · dependency down · permission: each → a journey, a frame, or Out>
- **Status:** sketched · in mock v<N> · walked on v<N>

## Themes

<!-- One section per theme, in the order discussed. Four blocks each; an
     empty block says "(none)". -->

### <theme>

**Said** — his words, close to verbatim, where they decide something.

- "<quote>"

**Confirmed** — facts he confirmed when restated. The mock shows them; the ACs check them.

- WHEN <condition>, the system does <behavior>.

**Inferred** — what the conductor proposed and he did not discuss. Each one is visible in the mock and confirmed or rejected before the lock.

- <guess> — because <why it seemed right>

**Out** — what this theme leaves out. Two kinds, always named.

- <capability> — not building: <reason>
- <capability> — future direction, not scheduled

## Mock log

<!-- One row per published version. -->

| Version | Date | What changed | From |
|---|---|---|---|
| v1 | <date> | first build: J1, J2 | interview |
| v2 | <date> | <change> | <verdict J1.s2 · comment · chat> |

## Bets

- <assumption> — checked by <search · document · his knowledge> — <holds · does not hold · unchecked>

## Open

<!-- Questions that passed the razor and are not answered yet. Empty before
     the lock. -->

- (none)

## Lock

<!-- Written at D3. -->

- **Version:** v<N> · **Date:** <date> · **His words:** "<verbatim>"
- **Walk:** <passed> | <overridden: the gaps, and his words>
- **Walked:** <step verdicts in the artifact> | <local mode: walks/verdicts.json, from his chat answers>
