# Tests — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high) from proposal.md,
  stories.md and the doctrine's testing standard. Budget: about 40 KB,
  and usually far less.

  One row per acceptance criterion of 00-discovery/stories.md, cited by
  id (`J1.s2.1`, `frame:<token>.<n>`), never copied: the GIVEN / WHEN /
  THEN live once, in stories.md. Each AC gets ONE primary proof, in the
  lowest layer that proves it:

  - unit: a rule inside one module (a date, a status move, a limit);
  - api: a route's behavior with the store read back (success, an
    error, a permission);
  - journey: what the user sees across screens, in the browser.

  Stay coarse: no matrices, no second proof of the same AC, no case
  per theme or width unless an AC asks for it. scripts/review-prep.mjs
  lists every AC id this file does not cite.
-->

## How tests run here

<two or three lines from the doctrine's testing standard, path:line: where each layer lives, the command, what green means>

## S-00N — <story name>

| AC | Layer | The proof | Read back |
|---|---|---|---|
| `J1.s2.1` | api | <`POST /invites` with a valid e-mail returns 201> | <one `invites` row, status `pending`> |
| `J1.s2.2` | journey | <the hint shows under the field> | <no row written> |

## The implementer decides

- <fixtures, request bodies, the order the tests run in>

## References

- <the doctrine's testing standard, path:line>
