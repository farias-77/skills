# Trace — <workstream> — <wNN> <wave name>

<!--
  Written by the MASTER, one line per event, as it happens, timestamps
  from `date -u`, never estimated. Permanent. The gate's record: what
  woke the master, what it did, what it read. A resumed master reads
  the last line and knows where the wave is.
-->

| UTC | Event | Detail | File |
|---|---|---|---|
| <YYYY-MM-DD HH:MM> | lane ready | `<repo>` · suite <p>/<f>/<s> | `<proof file>` |
| | gate opened | lanes required: <repos> | `freeze.md` |
| | frozen | <stacks> · sent to <workers> | |
| | tag | `<wNN>` at `<repo>@<sha>` | |
| | walk step <n> | `<run>` → <got> · green \| red | `proof/walk-<n>.txt` |
| | fix sent | `<wNN>-<n>` → lane `<repo>` row <N.k> | `fixes/<wNN>-<n>.md` |
| | fix merged | row <N.k>.f<n> · PR #<n> | `rows/<repo>/<N.k>.f<n>.md` |
| | walk step <n> again | green | |
| | gate green | report, explain, Status, blueprint, commit `<sha>` | `report.md` |
| | unfrozen | <stacks> · sent to <workers> | |
| | shadow | `<repo>` <p>/<f>/<s> (<minutes> min) | `proof/shadow-<repo>.txt` |
| | parked | <N.k> · <why> | `parked.md` |
| | stop | <what died, what was retried> | |
