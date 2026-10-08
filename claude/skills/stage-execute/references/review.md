# Review

For `reviewer (Opus 5.5, high)`: one reader of every diff that enters,
entries, A.n rounds, X.n fixes and hotfixes alike. The scope is closed:
what is below, and nothing else.

## The six classes that block

A finding blocks only inside one of these, with a proof. Outside them
it is a note. Where the project's standards give the rule an id, cite
it.

| Class | Basis | Blocks when | Proof |
|---|---|---|---|
| 1 · Does not work, or is not proved | `ac` | an AC does not happen, or has no proof that would fail if it broke (it would pass if every imported function returned `undefined`: a weak assert alone, only mocks or an absence, the test's own setup asserted, a constant pinned, a fixture asserting a fixture), or the diff breaks a behaviour that existed | the AC id and what happens instead |
| 2 · Security | `security` | a hole from the checklist below | the steps or the command and what it showed |
| 3 · The gate weakened to pass | `rule` | a looser assert, baseline or threshold; a lint, coverage or gate target changed; a failing test deleted with no replacement named | the line, and the rule id |
| 4 · A workaround | `rule` or `bug` | the symptom treated: a special case for the test's data, a sleep, retry or longer timeout hiding a race, an error swallowed | the line, and the reproduction or the rule |
| 5 · Speculative | `rule` | an abstraction, parameter, flag, layer or service with no consumer in the diff or the codebase, and no extension point the design names | **the quote of the code that serves no AC and no real risk** |
| 6 · Contract and data | `rule` | a field removed or its meaning changed while a client uses it; a migration the running code cannot run on; an invariant with no database constraint; money not in integer cents; time not in UTC | the line, and the rule |

A concrete reproduction of anything else that breaks is `bug`.

**"Could be simpler" never blocks** and never opens a round. Taste,
naming, a refactor you would like: a note at most.

## The security checklist (every diff)

- authentication and permission on every route and action the diff adds
  or changes;
- another user's data: an id from the request used without a scope
  check; scope must come from the verified actor;
- a secret, token or password in code, a log, an error, a fixture;
- a person's data in a log, a fixture, a seed, a test's output;
- input reaching storage, a screen, an e-mail or a shell unvalidated;
- injection: SQL, HTML, a shell command, a header or a log line built
  from input;
- IAM, grants and roles wider than the change uses.

## Writing a finding

`severity` (`blocks` | `note`) · `basis` (`ac`, `bug`, `security`,
`rule`, `other`) · `title` · `where` (`file:line`) · `says` (the lines,
verbatim, or "nothing" for something missing) · `fix` (the smallest
change) · `proof` (as the table says; a rule from memory is not a rule)
· `level` (the proof ladder in `claude/references/judging.md`: `ac` and
`bug` block from 4, ran it; `security` from 3) · `side` (`back`,
`front`, `both`).

What you could not run goes in `inconclusive` only when an AC needs it
(your response contract); anything else is a note at most, never a guess.

The triage is code: `blocks` with a blocking basis and a proof at its
level blocks;
everything else is a note on the PR. **At most five notes**, the ones
that matter most. An entry has one fix pass: block only what must not
merge.

## The delta

After the fix pass you see either your own open items (each closed, or
open again with its id in the title) or, with no items of yours, a
fix that touched tests or gate files: block only if it weakens a proof
or the gate. Nothing new beside it.

## The contract commit

Only a security hole blocks; the rest are notes for the entries that
fill the stubs.
