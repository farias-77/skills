# Golden paths — <project>

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
