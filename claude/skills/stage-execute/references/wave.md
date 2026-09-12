# The gate — what the master does with one wave

A wave is accepted by the master walking alpha with the commands the
plan wrote, on a frozen alpha, at a tagged sha. The lanes never stop
for it. The master is woken by messages; between two messages it
does nothing.

## What wakes the master, and what it does

| Line from a worker | The master |
|---|---|
| `row <N.k> merged · …` | appends the Status line in `waves.md` (`date · row · PR · proof line`); nothing else |
| `lane <repo> ready for <wNN> · suite … · <file>` | records it in `<wNN>/trace.md`; when every lane the wave requires is ready, opens the gate |
| `parked <N.k> · <why> · <file>` | appends to `parked.md` with the row it blocks; when the item is his to settle at once (a count, a pointer, an order the plan left open) answers in one line instead |
| `red in alpha <repo> · <what> · fixing as <N.k>.f1` | a trace line; if the red touches a stack under walk, the walk waits for the fix's merge |
| `freeze <stack> · suite <repo>` / `unfreeze <stack>` (a lane sharing a stack) | a trace line; a walk on that stack waits for the unfreeze |
| `note for the dreaming · <line>` | appends to `dreaming-notes.md` |

Anything else in a message is answered in one line pointing at the
file that settles it, or parked.

## The gate, in order

1. **Freeze.** `freeze.md`: one line per stack the wave's walk
   touches — `<stack> · walk <wNN> · <date -u>`. One line to every
   worker: `frozen <stacks> · walk <wNN> · 03-execution/freeze.md`.
   A merge already in flight finishes; nothing new lands.
2. **Tag.** In each repo the wave requires: `git fetch`, check that
   `feat/<workstream>` is at the sha the lane reported, `git tag
   <wNN>` there and push the tag. Alpha is that sha, and the trace
   says so.
3. **Walk.** Every step of the wave's walk in `waves.md`, in order,
   as written. `run` is typed as is and the whole output saved to
   `<wNN>/proof/walk-<step>.txt`; `expect` compared word for word.
   `see` is the screen against the alpha API, both themes, 390 px,
   screenshots to `<wNN>/proof/walk-<step>-<theme>-<width>.png`, and
   the trace says what matched the artboard. A step that needs data
   from a lane's proof (a run id, an item key) takes it from that
   lane's proof file, never from memory. `date -u` on every line of
   `trace.md`.
4. **Green.** In this order, each a file before the next: `trace.md`
   complete; `report.md` from the template (the wave in one
   paragraph; the rows table with PRs, rounds and proof; the wave's
   proof; departures; choices; open notes; stops; improvements);
   `explain.md` from the template, opening with "For the intern";
   the Status lines in `waves.md` for the gate; `blueprint/execution/
   waves/<wNN>.json`; `node claude/blueprint/build.mjs <workstream>`
   (the build refuses a wave with no walk result: fix the JSON, not
   the shell); commit the designs repo (`03-execution/`, `waves.md`,
   `blueprint/`, `blueprint.html`); remove the freeze lines; one line
   to every worker: `gate <wNN> green · tag <wNN> · unfrozen <stacks> ·
   03-execution/<wNN>/report.md`.
5. **Shadow.** The whole suite of each repo the wave touched, in the
   background, detached as the recon says; the freeze kept on those
   stacks until each ends (`<stack> · shadow <wNN>`); the results in
   `<wNN>/proof/shadow-<repo>.txt` and one line in the trace. Green:
   unfreeze, one line to the workers. Red: a fix row through
   `fixes/`, the freeze kept on that stack, and the **next gate does
   not open** until the shadow is green; every lane keeps building.

## A red step

- `fixes/<wNN>-<n>.md` from the template: the step as written, the
  output as printed, the row the step points at (the goal section,
  the lane), what the master read in the code or the logs, the
  smallest fix it sees. It proposes; the worker builds.
- One line to the lane that owns the row: `fix <wNN>-<n> · lane <repo>
  · row <N.k> · 03-execution/fixes/<wNN>-<n>.md`. The worker builds it
  as `<N.k>.f<n>` through the row loop; a fix that touches a test
  expectation goes through a lens like any other.
- The wave stays open in the trace (`walk red at step <s>, fix
  <wNN>-<n> sent`). When `row <N.k>.f<n> merged` arrives, walk again
  from the first red step (the green steps before it hold, alpha did
  not move: the stack is frozen); then continue at 4.
- A red step that no row explains — the two lanes disagree on a
  contract, the design is wrong in alpha — is parked, with the two
  proofs quoted, and the wave stays open. The other waves go on
  where they do not depend on it.

## What the master decides alone, and what parks

`waves.md` says it per wave. The default, when the wave is silent:

| Decides alone | Parks (one line in `parked.md`, the lane goes on) |
|---|---|
| a count, a pointer, a path, the order of two independent rows | a change to what a story delivers |
| which of two equivalent commands proves a step | a contract's shape (a field, a route, an event) |
| a fix row's number and its target row | a stateful deletion no goal explains, in a deploy diff or in a row |
| a dated amendment to a row's proof when the command was wrong and the goal's intent is plain | a pre-flight item missing (a credential, a text, an account) |
| the retry of a suite that died on the harness (memory, network), once | the third red of a row |

An amendment is a dated line under "Amendments" in `waves.md` and
the row edited in place, in the goal too (the master is the only
one who edits a goal, and only for a proof or a pointer; never for
what the row builds).

## The end of the waves

When the last wave is green, every fix row is merged, every shadow is
green and every lane has sent its last row: `exec-report.json`, the
build, the commit, then one `PushNotification`: `<slug>: all waves
green (wNN…) · parked: <n> (<one line each>) · blueprint <url>`. End
the turn. The user comes back to this session and the audit begins
([audit.md](audit.md)). No worker is closed before the audit ends:
its session builds the audit's fix rows.
