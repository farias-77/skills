# Report — <workstream> — <wNN> <wave name>

<!--
  Written by the MASTER when the gate closes green, from the row files
  of the lanes the wave required, the trace and the proof folder.
  Permanent; stage 5 and the dreaming read it. MUST have: the wave in
  one paragraph; the rows table; the wave's proof with files; what
  needs the user's eye at the audit (departures, choices, open notes,
  stops), each pointing at its row file; the improvements. Numbers
  from the files, never from memory; timestamps from `date -u`.
-->

## The wave in one paragraph

<what exists in alpha now that did not before, said as what a person can do; the tag; the sha per repo; the suites' last lines>

## Rows

| # | Repo | Delivers | PR | r1 (f · s · d · x) | r2 (f · s · d · x) | Proof in alpha | Attempts | Closed |
|---|---|---|---|---|---|---|---|---|
| <N.k> | `<repo>` | <one line> | [#<n>](<url>) | | | `<folder>` <n>/<n> · `proof/<file>` | 1 | <date> |
| <N.k>.f1 | `<repo>` | fix: <what> | in #<n> | | — | | 1 | <date> |

f = findings · s = sustained · d = deferred · x = dismissed. Stacks: <#a → #b → #c, or none>.

## The wave's proof

- **Tag:** `<wNN>` at `<repo>@<sha>` · `<repo>@<sha>` (<date>) · alpha at these shas: `<deploy output line>`
- **Suites before the gate:** `<repo>` <passed>/<failed>/<skipped> (<file>) · …
- **The walk** (`trace.md`, `proof/walk-*`): <steps> steps · red at <step, or none> → fix <wNN>-<n> (row <N.k>.f<n>) → green (<date>)
- **Shadow suite:** `<repo>` <passed>/<failed>/<skipped> (<file>) · …
- **Not exercised here:** <what waits for prod or for a later wave, one line each>

## What needs your eye at the audit

### Departures from the standard

- <N.k> · <the rule left> · <what was done> · <why simpler> · `rows/<repo>/<N.k>.md`

### Choices where the documents were silent

- <N.k> · <the choice, the alternative rejected> · `rows/<repo>/<N.k>.md`

### Notes still open

- <N.k> · <lens#id> · <one line> · owner: <user | standard | next wave>

### Stops and how they ended

- <date> · <N.k> · <what stopped> · <how it ended> · `rows/<repo>/<N.k>.md`

### Parked at this wave

- <N.k> · <why> · `parked.md`

## Improvements applied inside the standard

- <N.k> · <what got simpler or was reused, one line>
