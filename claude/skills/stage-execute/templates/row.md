# Row <N.k> — <workstream> — lane `<repo>`

<!--
  Written by the WORKER, opened before the branch is cut and completed
  line by line as the loop advances (the checkpoint a resumed session
  reads). Permanent. MUST have when closed: the branch and its base,
  the PR, the rounds as numbers with the lenses that ran, the proof
  line with the file, the choices, the departures with the rule each
  leaves, the notes that ride, the stops, the attempts. Timestamps
  from `date -u`. Nothing here is prose for a person: the report and
  the blueprint say it plainly; this is the record.
-->

- **Row:** <N.k> · story `<S-nnn>` · wave <wNN> · goal `02-plan/goals/<repo>/<wNN>.md` §<N.k>
- **Opened:** <YYYY-MM-DD HH:MM UTC>
- **Branch:** `feat/<workstream>/<N.k>-<slug>` from `feat/<workstream>` @ `<sha>` | from `<N.j>`'s branch @ `<sha>` (stacked: <why>)
- **Builder:** exec-builder (Opus 5, high) · attempts: 1 | 2 (brief rewritten: <why>) | 3 (parked)

## Rounds

| Round | Lenses | Findings | Sustained | Deferred | Dismissed | To the master | File |
|---|---|---|---|---|---|---|---|
| 1 | 5 | | | | | | `reviews/<repo>/<N.k>/r1.md` |
| 2 | 5 \| 3 (strings and tests only) | | | | | | `reviews/<repo>/<N.k>/r2.md` |

## PR

- **PR:** #<n> · <url> · into `feat/<workstream>` | into `<N.j>`'s branch
- **CI:** green at `<sha>` (<date>) · red attempts: <n>, <what>
- **Merged:** <date> · `<merge sha>` · deploy: `<stack>` green (<date>) · diff read: no removal | <removal, parked>

## Proof

- **Run:** `<the command, as in the goal>`
- **Expect:** <as in the goal>
- **Got:** <the summary line as printed> · `03-execution/<wNN>/proof/<N.k>-<name>.txt`
- **See / Where:** <screen, themes, width> · artboard <name> · screenshots `03-execution/<wNN>/proof/<N.k>-*.png` · matches: <what was checked>
- **First deploy of the wave on this stack:** yes (proved alone) | no

## Choices (the documents were silent)

- <what was chosen, the alternative rejected, in one line>

## Departures from the standard

- <the rule left (`standards/<file>.md` §), what was done instead, why the system got simpler>

## Notes that ride

- <finding id · lens · one line · owner at the audit>

## Stops

- <date · what stopped (a red, a quota, a harness death) · how it ended>

## Closed

<YYYY-MM-DD HH:MM UTC> · message sent: `row <N.k> merged · …`

---

<!-- The PR body, pasted as sent: -->

## PR body

```
<story> · row <N.k> of wave <wNN> · goal §<N.k>

Rounds: r1 <f>·<s>·<d>·<x> (5 lenses) · r2 <f>·<s>·<d>·<x> (<5|3> lenses)
Proof: <run> → <got> (03-execution/<wNN>/proof/<N.k>-<name>.txt)
Choices: <one line each>
Departures: <one line each, with the rule>
Notes: <one line each>

<attribution trailer>
```
