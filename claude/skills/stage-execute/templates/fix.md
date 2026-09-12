# Fix <wNN>-<n> | A.<n> — <workstream> — lane `<repo>` — row <N.k>

<!--
  Written by the MASTER: a red walk step (fixes/<wNN>-<n>.md) or an
  audit ruling (fixes/A-<n>.md), for the worker that owns the lane.
  The master proposes the smallest change it sees; the worker builds
  it through the row loop as row <N.k>.f<n> (walk) or A.<n> (audit),
  with a builder and the five lenses like any row. The worker never
  needs anything not in this file.
-->

- **From:** walk <wNN> step <s> | audit item <id> ("<his words>")
- **Row it changes:** <N.k> · goal `02-plan/goals/<repo>/<wNN>.md` §<N.k> · PR #<n> merged at `<sha>`
- **Build as:** row `<N.k>.f<n>` | `A.<n>` · branch `feat/<workstream>/<N.k>.f<n>-<slug>` from `feat/<workstream>` (from `<N.k>`'s branch when its PR is still open)

## What was seen

- **Step / item:** `<run as written>` → **expected:** <expect> → **got:** <the output line> · `03-execution/<wNN>/proof/walk-<s>.txt`
- **Read in the code / logs:** <file:line, the log line, the query result — what the master saw>

## The smallest change

<one paragraph: what to change, where, and what must not change; a test expectation that changes says why here>

## Proof after the fix

- **Run:** `<the row's run, or the walk step>` · **Expect:** <as the goal or the wave says>
- The master walks step <s> again when `row <N.k>.f<n> merged` arrives.
