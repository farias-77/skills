# structure-check

The structure check role of the pipeline's bar
(`docs/project-contract.md`, role 17): what a diff adds, measured for
complexity, size, duplication, import boundaries and new dependencies.

| File | What it is |
|---|---|
| `structure-check.sh` | the command; installs the pinned tools from the manifests below once, then runs the script |
| `structure_check.py` | the logic: `check`, `calibrate`, `summary`, `compare`, `measure` |
| `tsfuncs.mjs` | per-function complexity and length for TS/JS from the TypeScript parser (lizard loses function boundaries in TSX) |
| `structure-check.json` | the config: languages, test and excluded paths, thresholds, duplication, boundaries, dependencies |
| `requirements.txt`, `package.json` | the tools' manifests, versions pinned exactly: lizard (pip), jscpd and typescript (npm) |

Copy the folder into the project (for example `tools/structure-check/`)
and name the command in the commands table. The scripts carry no comments;
this file is their documentation.

## Use

```
structure-check.sh [--json] [--allow-deps a,b] <repo> <baseRef> <headRef>   # the gate: exit 1 on a violation
structure-check.sh --calibrate <repo> <ref> [--write]                       # thresholds from the codebase
structure-check.sh --summary <repo> <ref>                                   # whole-tree numbers (JSON)
structure-check.sh --compare <repo> <refA> <refB>                           # two refs side by side (markdown)
structure-check.sh --measure <repo> <ref> <path>...                         # paths present at ref and under p95
```

Exit 0 means no violation, 1 a violation, 2 a usage or tool error. The
check reads only what `git diff base head` adds, from a detached
worktree of head that is removed on exit; uncommitted changes are not
read. A dependency the user ruled on passes with `--allow-deps name`
(or `ALLOW_DEPS=name`). `STRUCTURE_CONFIG` points at another config;
`STRUCTURE_NICE` sets the niceness (default 10).

## The tools are declared, not fetched ad hoc

The versions live in `requirements.txt` and `package.json`, beside the
script. The first run installs them into
`$STRUCTURE_TOOLS/<hash of the manifests>` (default
`~/.cache/structure-check/`), so a version bump is a reviewed change to
a manifest and installs fresh. Commit a lock for the npm tools
(`npm install --package-lock-only` in this folder); with it the
install is `npm ci`. `LIZARD`, `JSCPD` and `TS_LIB` point at tools
installed some other way.

## In hosted CI: history and a base

The check diffs against a base, so the CI job needs the history and
the base ref:

- the checkout fetches history (`actions/checkout` with
  `fetch-depth: 0`, or a fetch of the base branch);
- the job passes the base explicitly, for example
  `origin/${{ github.base_ref }}` on a pull request;
- the tool cache is restored by the manifests' hash
  (`hashFiles('<this folder>/requirements.txt', '<this folder>/package*.json')`),
  so a run does not download the tools again.

A shallow checkout without the base exits 2.

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

`--measure` checks named paths against the calibrated warn line: each
path must exist at the ref (`git ls-tree`), and no function or file in
it may sit over p95. Golden-path exemplars are checked this way.

## What fails

| Check | Fails when | Warns when |
|---|---|---|
| complexity | a function the diff creates or changes goes over the p99 CCN of its class (one already over at base only warns) | over p95 |
| function size | the same, for non-blank lines | over p95 |
| file size | a changed file crosses the p99 file length | over p95 |
| duplication | the share of added product lines inside a jscpd clone exceeds the codebase's rate | the same for tests |
| boundary | an added line matches a `boundaries` rule's `forbid` in a file matching its `files` | — |
| dependency | a new direct dependency or an unpinned version in `package.json`, `go.mod`, `requirements*.txt`, unless allowed | a bump, a new indirect, another manifest changed |

## Boundaries

Write one `boundaries` rule per fence the standards already state, with
the standards line in `rule`. `files` and `forbid` are regular
expressions; `except` exempts paths.

A group captured by `files` is available in `forbid` as `{{name}}` (a
named group) or `{{1}}` (by number), escaped as a literal. That makes
"a module imports another module only through its root" one rule
instead of one per module:

```json
{
  "id": "module-only-through-its-root",
  "files": "^backend/internal/(?P<module>[^/]+)/",
  "forbid": "\"[^\"]*/internal/(?!{{module}}[/\"])[^/\"]+/[^\"]+\"",
  "rule": "<standards file>:<line>"
}
```

A file under `internal/billing/` may import `internal/billing/...` and
`internal/orders`, never `internal/orders/domain`. A shared package
every module may reach into is one more alternative in the lookahead
(`(?!{{module}}[/\"]|platform/)`).

Before relying on a rule, run it over the whole tree (`--summary`
reports `boundary_violations`): a rule that fires on today's code is
wrong or the code is, and that is a decision for the team, not for the
gate.

## How it measures

- **CCN** is 1 plus each `if`, ternary, `case`, loop, `catch`, `&&`,
  `||` and `??` (and their assignment forms) in the function's own
  body; nested functions are measured on their own.
- **NLOC** is the non-blank, non-comment lines of the function's whole
  span, nested functions included: the length a reader scrolls.
- A test-framework `describe` callback is a container, not a function:
  the tests inside it are measured.
- A function is "changed" when an added line falls inside it; it is
  matched to its base version by name and ordinal.

## Blind spots

- Structure only: nothing here says the code is correct.
- CCN is cyclomatic, not cognitive; JSX `&&` and ternaries count.
- Duplication finds token clones, not a second implementation of a
  helper under another name; on a small diff the share is coarse.
- Boundaries are regexes over added lines; a moved import is not seen.
