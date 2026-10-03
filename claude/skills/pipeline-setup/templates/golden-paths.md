# Golden paths — <project>

<!--
The file the builder reads before it writes and the structure-reviewer
measures a diff against. One section per kind of unit; each names ONE
exemplar that exists in the code today and says what to copy from it.

How to fill it:
- Pick the exemplar by a rule, and write the rule: the most recent module
  that passes the gate with no structure warning; the one the doctrine
  cites; the one the team points new people at. Never the biggest.
- Name files, not folders, when the kind is a file (an endpoint, a
  migration). Name the folder and its key files when the kind is a module.
- Say what to copy in one to five lines: the layering, the naming, the
  error handling, the test shape. Not a tutorial: a pointer and a reason.
- A kind the codebase does not have yet: write "none — the plan's
  foundation builds the first one in the doctrine's full shape".
- Keep it under ~150 lines. Re-read it at every weekly retro; when an
  exemplar drifts, replace it.
The examples below show the shape for a Go + TypeScript project. Delete
the kinds the project does not have; add the ones it does.
-->

Read from the code at `<sha>`. Doctrine paths are relative to
`<doctrine folder>/`. The structure check fails a diff on the numeric
rules below (`<structure-check.json path>`).

## Every unit

- **Reuse before you write.** Search `<shared folders>` first. Copying
  shared code instead of extending it is a blocker (`<doctrine>:<line>`).
- **Size.** Product functions: complexity ≤ `<p95>`, ≤ `<p95>` lines;
  the gate fails above `<p99>` / `<p99>`. Tests: `<p95>` / `<p99>`.
  These are the codebase's own p95 / p99, from `--calibrate` at `<sha>`.
- **No new dependency without a ruling**, pinned exact
  (`<doctrine>:<line>`).
- **Fences.** `<one line per import boundary the structure check enforces>`.

## <n> · <kind of unit>

| | |
|---|---|
| **Exemplar** | `<path>` (and `<key file>`, `<key file>`) |
| **Picked because** | `<the rule that picked it>` |
| **Copy** | `<what to copy: layering, names, errors, wiring>` |
| **Its test** | `<path of the test that is the exemplar for this kind>` |
| **Not this** | `<the tempting older module that does it the old way, and why not>` |

<!-- Example kinds, delete or adapt:

## 1 · Server module
Exemplar: `backend/internal/<module>/` — `module.go`, `app/<use_case>.go`,
`domain/<rule>.go`, `http/<operation>.go`, `store/<repo>.go`.
Copy: the module's only public API is `module.go`; one file per use case;
the domain is pure (no I/O, no clock); errors wrapped with context.

## 2 · HTTP endpoint
Exemplar: `backend/internal/<module>/http/<operation>.go` (~25 lines).
Copy: actor from the context → the use case → the generated response type.

## 3 · Background job
Exemplar: `<path>` — idempotent by key, bounded retries, one log event per run.

## 4 · Migration
Exemplar: `migrations/<nnnn>_<name>.sql` — expand only; the contract step
ships in a later release.

## 5 · Screen
Exemplar: `frontend/src/features/<feature>/` — `index.ts` is the only
import point; route component → data hook → presentational components;
every state (empty, loading, error, forbidden) rendered.

## 6 · Component
Exemplar: `frontend/src/shared/ui/<Component>.tsx` — tokens only, no raw
colors; props typed; one story or sample.

## 7 · Tests, one per layer
- unit: `<path>`
- integration (server, real database): `<path>`
- browser journey: `e2e/<journey>.spec.ts` — actor login, steps by role
  and label, the side effect read back.
-->
