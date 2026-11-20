# Notes: <workstream title> (`<slug>`)

<!--
  The interview's record, written by the conductor every turn, in English.
  Readers: the conductor, to resume from any point; discovery-story-writer, which
  writes the stories from it; discovery-mock-designer; the review panel, as the
  oracle of what he decided. A fact that is not here, they do not know.
  Every line that is a decision carries its provenance:
    said      his words, quoted
    accepted  the conductor proposed it and he said yes to that one item
    assumed   the conductor proposed it and he has not answered that item
  A yes to a list accepts nothing in it.
-->

## Starting point

- **Request:** "<the demand in his words, one line>"
- **Origin:** <tracker id · who asked · when> | typed in the session
- **Size:** <small | feature | large> · <why, in a few words> · <stepped up on <date>: why>
- **Screen:** <which screen changes> | none
- **Languages of the copy:** <en, …> · **Widths that matter:** <desktop, phone>

## Said

<!-- The dump, as he said it. Dictation noise removed, meaning and wording kept. -->

- "<quote>"

## Recon

<!-- Paths, not content: what each scout wrote. -->

- **Next to the change today:** `discovery/recon/<topic>.md`
- **Design system (when a screen changes):** tokens `<path>` · components `<path>` · app shell `<path>` · the screen's source `<path>` · screenshots `discovery/recon/screens/`
- **Other workstreams on the same area:** <slug · what it changes> | none
- **Words the product already uses for something else:** <word · its meaning there · path:line> | none

## Coverage

<!-- The conductor's checklist, never shown to him as a form. State: missing · partial · clear · n/a. -->

| Area | State |
|---|---|
| Why, and for whom | missing |
| Journeys (trigger, steps, end) | missing |
| Rules with numbers (limit, expiry, cadence) and their boundary | missing |
| Error paths (limit, dependency down, permission, repeat) | missing |
| Who can do and see what | missing |
| Data shown and where it comes from | missing |
| Personal data (who sees it, how long it is kept) | missing |
| Words that carry a rule (a refusal, an e-mail) | missing |
| Constraints (legal, cost, deadline, platform) | missing |
| In and not building | missing |

## Vocabulary

- **<word>** — <definition> · avoid: <the words not to use for it>

## Decisions

<!-- The tree. A decision that depends on another names it in "After". Open ones have an empty Answer. -->

| ID | Decision | After | Answer | Provenance | His words, or the source |
|---|---|---|---|---|---|
| D-1 | <what is being decided> | — | <the answer> | said | "<quote>" |
| D-2 | <…> | D-1 | <…> | accepted | proposed: <the reason given> |

## Rules

<!-- Every rule and every behavior he decided. With a number: the example is at the boundary and its values come from him or a system of record. With no number: "—" in Number, and the example is one case that passes and the nearest that does not. -->

| ID | Rule | Number | Examples | Provenance | Source |
|---|---|---|---|---|---|
| <PREFIX-1> | <the rule in one sentence> | <value + unit> | <the 10th is sent, the 11th is refused> | said | "<quote>" · D-3 |

## Journeys

### J1 — <title>

- **Actor / job:** <persona> · When <situation>, I want to <motivation>, so I can <outcome>.
- **Steps:** s1 <do> → <result> · s2 <do> → <result>
- **Behind:** <rows, e-mails, events per step>
- **Error paths:** limit → <J2 | NB-n | n/a: why> · dependency → <…> · permission → <…> · repeat → <…>

## Assumptions

<!-- Most costly first. Each one is shown to him: at the readback, and again at the gate as "decided for you". -->

- **A-1** — <what is assumed> — source: <path:line, or "the product does this next to it", or "review"> — cost if wrong: cheap | costly — assumed

## Not building

- <capability> — not building: <reason> | later: <reason> — <said | accepted | assumed>

## Deferred

<!-- Important and unasked: he ran out of time, or said "you decide". Each becomes an assumption shown at the gate. -->

- (none)

## For the design

<!-- Questions whose answer is a mechanism. Never asked to him. -->

- (none)

## Mock log

<!-- Only when a screen changes: one row per build he saw. -->

| Build | Date | What changed | From |
|---|---|---|---|
| 1 | <date> | first build | the stories |

## Lock

- **Locked:** v<N> · <date> · "<his words>"
