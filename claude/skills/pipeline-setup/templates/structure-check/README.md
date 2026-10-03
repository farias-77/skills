# structure-check

The structure check role of the pipeline's bar
(`docs/project-contract.md`, role 7): what a diff adds, measured for
complexity, size, duplication, import boundaries and new dependencies.

| File | What it is |
|---|---|
| `structure-check.sh` | the command; finds or installs the pinned tools, then runs the script |
| `structure_check.py` | the logic: `check`, `calibrate`, `summary`, `compare` |
| `tsfuncs.mjs` | per-function complexity and length for TS/JS from the TypeScript parser (lizard loses function boundaries in TSX) |
| `structure-check.json` | the config: languages, test and excluded paths, thresholds, duplication, boundaries, dependencies |

Copy the folder into the project (for example `tools/structure-check/`)
and name the command in the doctrine.

## Use

```
structure-check.sh [--json] [--allow-deps a,b] <repo> <baseRef> <headRef>   # the gate: exit 1 on a violation
structure-check.sh --calibrate <repo> <ref> [--write]                       # thresholds from the codebase
structure-check.sh --summary <repo> <ref>                                   # whole-tree numbers (JSON)
structure-check.sh --compare <repo> <refA> <refB>                           # two refs side by side (markdown)
```

## Calibrate first

The example thresholds in `structure-check.json` are placeholders.
Calibrate on the project's `main`:

```
structure-check.sh --calibrate . origin/main --write
```

It measures every function and file of each class (language × product
or test) and writes **warn = p95** and **fail = p99**, plus the
codebase's own duplication rate. Why two lines: p95 alone flags one
function in twenty of accepted code, so every large diff would fail;
p99 fails only the outliers. Re-calibrate between workstreams, never
during one, and commit the config with the sha it was measured at.

## What fails

| Check | Fails when | Warns when |
|---|---|---|
| complexity | a function the diff creates or changes goes over the p99 CCN of its class (one already over at base only warns) | over p95 |
| function size | the same, for non-blank lines | over p95 |
| file size | a changed file crosses the p99 file length | over p95 |
| duplication | the share of added product lines inside a jscpd clone exceeds the codebase's rate | the same for tests |
| boundary | an added line matches a `boundaries` rule's `forbid` in a file matching its `files` | — |
| dependency | a new direct dependency or an unpinned version in `package.json`, `go.mod`, `requirements*.txt`, unless allowed | a bump, a new indirect, another manifest changed |

Write one `boundaries` rule per fence the doctrine already states, with
the doctrine line in `rule`. Before relying on a rule, run it over the
whole tree (`--summary` reports `boundary_violations`): a rule that
fires on today's code is wrong or the code is, and that is a decision
for the team, not for the gate.

## Blind spots

- Structure only: nothing here says the code is correct.
- CCN is cyclomatic, not cognitive; JSX `&&` and ternaries count.
- Duplication finds token clones, not a second implementation of a
  helper under another name; on a small diff the share is coarse.
- Boundaries are regexes over added lines; a moved import is not seen.
- A function is "changed" when an added line falls inside it; functions
  are matched to their base version by name and ordinal.
