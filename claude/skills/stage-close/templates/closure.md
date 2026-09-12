# Closure — <workstream>

<!--
The workstream's final record — written once, at the close, from the
harvest and release.json, and never edited after. A reader a year
from now understands what this demand was without opening anything
else. In the workstream's language. Every number from a file; a
number nobody measured is "not measured", never a guess.
-->

<Two or three sentences: what the demand was, in plain words; opened
on, in production on; how many stages, repos, waves.>

## What shipped

| Repo | Version in prod | What it does now that it did not |
|---|---|---|
| `<repo>` | **vN.N.N** (<the tags on the way: v1.0.0 at the train · v1.0.1 …>) | <one line> |

| Wave | Stories | Where it lives |
|---|---|---|
| wNN · <name> | <ids and titles> | `<repo>` `main` (PRs #a–#b); proof in `03-execution/<wNN>/` |
| release | <fix rows R.n, hotfixes> | `<repo>` `main`; trace in `04-release/trace.md` |

<The first day in prod in one paragraph: what the watch read, what
ran on its own.>

Record of the demand: blueprint at <URL> (closed and dated at this
stage).

## What deliberately did not ship

<!-- every cut with the decision that cut it; never a silent absence -->

- **<what>** — <cut at (stage, the id) · by (his words, or the ruling)>.

## Pendencies, each with an owner

| # | Pendency | Where it lives now | Owner |
|---|---|---|---|
| 1 | <what> | `<file>` · <an issue, a runbook, a memory> | <who> |

## The demand in numbers

<!-- from close.json → numbers; the previous column from the previous
workstream's close.json, or "—" with the line below saying there is
none -->

| | This workstream | Previous (<slug>) |
|---|---|---|
| calendar | <opened → prod, days> | |
| waves · rows · fix rows | | |
| review rounds (discovery · design · plan) | | |
| findings found · sustained · deferred · dismissed | | |
| fix passes · suite runs · stops | | |
| departures kept · reverted | | |
| choices where the documents were silent | | |
| audit items · fix rows | | |
| release fix rows · hotfixes · watch read · owned | | |
| the user's rulings | | |
| dreaming entries · issues opened | | |
| tokens (approx., where measured) | | |

What the numbers say, without adjectives:

- **<the number that moved>** — <why, in one line>.
