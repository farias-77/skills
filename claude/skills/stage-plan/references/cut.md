# The cut

How a closed design becomes a graph that stage 4 runs as wide as it
can. The planner cuts by these rules; the plan-reviewer and the
conductor judge by them; `plan-graph.mjs` holds the mechanical ones.

## The rules

| Rule | How |
|---|---|
| One entry = one whole behaviour | a group of ACs someone sees work, data to screen. Never a layer ("the backend of X", "the types") |
| Size | at most 12 ACs, about 45 minutes of builder. Over 10 the checker warns; over 12 it fails |
| The contract commit `C` first | see `contract-commit.md`. Thin, no QA, never parks |
| A new app or module | `C` carries its skeleton; `E-01` builds on it. There is no foundation entry |
| Edges | only where nothing can be faked: a journey drives another entry's screen (`ui`), or a check reads its real effect (`side-effect`). Data is a factory, an interface is a fake |
| Front ∥ back | inside the entry, on the Contract the brief copies from the design |
| Migrations | each entry owns its tables and its own migration file, named by timestamp; the merge queue restamps one that lands older than `feat`'s last |
| Generated files | only `C` writes them; a conflict later is "take the base, run the generator" |
| Hot files | one file per route; a registry as one line per entry, additive |
| `E-int` | last, only for the journeys that cross entries |
| Other fronts | additive only, or wait for their merge (`coordination.md`) |
| No stacking | a child starts when its parent has merged into `feat` |

## The shape

```
C ──► E-01 ∥ E-02 ∥ E-03 ∥ … ∥ E-nn ──► E-int
```

A deeper graph needs an edge that nothing can fake, named.

## Resolving a need

| An entry needs | Resolved by | Edge? |
|---|---|---|
| a file two entries would write (spec, generated code, shared table) | `C` | no |
| a record to work on | a factory in `C` | no |
| a behaviour behind an interface | the interface and a fake in `C` | no |
| another entry's screen that a journey drives | move the AC to that entry or to `E-int`; else an edge `ui` | only if nothing can fake it |
| another entry's real effect a check reads | move the check to `E-int`; else an edge `side-effect` | only if nothing can fake it |

## Anti-patterns

| Pattern | Why it costs | Instead |
|---|---|---|
| a fat `C` | one builder works while every other slot idles | only what two entries use; the rest goes with its entry |
| a layer posing as an entry | nobody can see it work; the review has nothing to judge | cut by behaviour |
| freezing what `C` created | every token, prop or enum value becomes an amendment | freeze only the spec and the generated code; the rest grows by addition |
| an entry over the cap on the critical path | it sets the stage's length | split it into two behaviours |
| an edge for data | a factory seeds it | drop the edge |
| a test that pins a stub ("not implemented") | the entry that fills it breaks a green test | no test asserts a stub |

## Example

"Announcements": `C` = five routes in the spec, the two tables three
entries use, the generator run, compile stubs. Then E-01 publish (8 ACs)
∥ E-02 list by region (9) ∥ E-03 read and count (10) ∥ E-04 expire and
archive (6) ∥ E-05 the unread badge (7), and E-int with the two journeys
that cross them. A first cut with "read, count and badge" at 17 ACs
failed the cap; the badge became E-05.
