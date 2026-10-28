# Interview notes: <workstream title> (`<slug>`)

<!--
  The interview's record, written by the conductor as the conversation
  happens, every turn. Three readers: the conductor, to resume from any
  point; story-writer, which writes the stories from it at the end of the
  interview; prototype-builder, which builds the mock from the stories and
  it when a screen changes.
  If a fact is not here (or, later, in the locked mock), they do not know it. Write in
  English; quote his own words where they carry a decision or a taste.
-->

## Starting point

- **What he brought:** <the demand in one paragraph, as first stated (the voice dump, condensed)>
- **How formed it is:** <idea · sketch · spec> · <what he has already covered alone>
- **References:** <product, site, screen, repo folder: what to look at, what he liked>
- **Prior decisions:** <none> | <document · what it decided · imported as Confirmed with its source>
- **Screens:** <which screens change> | none (no mock)
- **Languages of the copy:** <en, pt-BR, …> · **Widths that matter:** <phone, desktop>

## Recon

<!-- What the scouts and the screenshot pass brought (D0). Paths, not content. -->

- **Feature maps read:** <path> · <path>
- **Current screens:** `00-discovery/recon/screens/<name>.png` · …
- **Design system (only when a screen changes):** <tokens path · components path · app shell path · source of the screens the change sits in> | <none found: shell defaults, gap noted>
- **How the system behaves next to the change:** <recon/<topic>.md> (what is inferred from)
- **Other workstreams touching these areas:** <workstream · what it changes> | none
- **Term collisions:** <word · what it already means in the product · path:line> | none (each one is in the Vocabulary's "avoid")

## Coverage map

| Category | State |
|---|---|
| People and jobs (who, in what situation) | Missing |
| Journeys (trigger → steps → end, happy and bad) | Missing |
| Rules with numbers (limits, expiry, cadence, thresholds) | Missing |
| Data on screen (and where each value comes from) | Missing |
| States per screen (only with a screen; settled in the mock's rounds) | Missing |
| Error paths (limit, dependency down, permission, repeat) | Missing |
| Personal data (who sees it, how long it is kept) | Missing |
| Copy (the words that carry a rule; the rest in the mock's rounds) | Missing |
| Look (only with a screen: where it sits, references he brings) | Missing |
| Constraints (legal, cost, deadline, platform, personal data) | Missing |
| Vocabulary (every domain word defined) | Missing |
| Boundary (In and Out closed; direction mapped) | Missing |

## Vocabulary

- **<word>** — <definition> · avoid: <the words not to use for it>

## Rules

<!-- Every number that encodes a rule, one id each. The ACs cite them; a mock,
     when there is one, enforces them. An example per rule ("the one where…"), and its
     boundaries. -->

<!-- Proof, only when a screen changes: `mock` when a journey step of the mock
     can show it; `[build]` when a one-file mock cannot (real time, a server's refusal, a reload, a second session):
     he confirms the [build] marking, the rule counts as covered by the
     build, and its one AC carries [build]. -->

| ID | Rule | Number | Source | Examples | Proof |
|---|---|---|---|---|---|
| <PREFIX-1> | <rule> | <value + unit> | "<his words>" | <the one where…> | mock |

## Journeys

<!-- The sketch the stories are written from. One line per step; the step ids
     are the AC ids' anchors. A journey is ready when its actor, trigger,
     steps and end are here. -->

### J1 — <title>

- **Actor / job:** <persona> · When <situation>, I want to <motivation>, so I can <outcome>.
- **Steps:** s1 <do> → <lands on> · s2 <do> → <lands on> · …
- **Behind:** <rows, e-mails, events per step>
- **Error paths:** <limit · dependency down · permission · repeat: each → a journey, a frame, or Out>
- **Status:** sketched · in the stories · in mock v<N>

## Themes

<!-- One section per theme, in the order discussed. Four blocks each; an
     empty block says "(none)". -->

### <theme>

**Said** — his words, close to verbatim, where they decide something.

- "<quote>"

**Confirmed** — facts he confirmed when restated. The ACs check them; a mock shows them.

- WHEN <condition>, the system does <behavior>.

**Inferred** — what the conductor proposed and he did not discuss, with its source (the rest of the system, or common sense). Each one is confirmed or rejected before the interview ends.

- <guess> — because <why it seemed right>

**Out** — what this theme leaves out. Two kinds, always named.

- <capability> — not building: <reason>
- <capability> — future direction, not scheduled

## Mock log

<!-- Only when a screen changes: one row per published version. -->

| Version | Date | What changed | From |
|---|---|---|---|
| v1 | <date> | first build: J1, J2 | the stories |
| v2 | <date> | <change> | <round n · comment <id> · chat> |

## Open

<!-- Questions that passed the razor and are not answered yet. Empty before
     the stories are written. -->

- (none)

## Lock

<!-- Only when a screen changes: written at D3's lock, and again at each
     amendment of the playback. -->

- **Version:** v<N> · **Date:** <date> · **Words:** "<his words that said it was ready, or his answer that locked an amendment>"
- **Walk:** <passed> | <gaps carried in LOCK.json: where · what>
- **[build] rules he confirmed:** <ids> | none

## For the design

<!-- The last playback call's answer, verbatim. Stage 2 opens on it. -->

- **His answer:** <Nothing in mind, propose> | <I have an idea: "…"> | <I have a constraint: "…">
