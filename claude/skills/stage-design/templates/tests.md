# Tests — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high) from proposal.md,
  stories.md and the doctrine's testing standard. Budget: about 40 KB,
  and usually far less.

  One row per acceptance criterion of 00-discovery/stories.md, cited by
  id (`J1.s2.1`, `frame:<token>.<n>`), never copied: the GIVEN / WHEN /
  THEN live once, in stories.md.

  The aim: the build verifies that it works, without testing the same
  thing several times and without evidence scaffolding. Guidance, not
  a gate; use judgment. Prefer ONE primary proof per AC, at the
  cheapest layer that really proves it:

  - unit: a pure rule inside one module (a date, a status move, a
    limit, a price tier);
  - api: an HTTP contract with the store read back (success, an error,
    a permission);
  - journey: a behaviour on screen, across screens, in the browser.

  Variations of a rule (tiers, borders, languages, roles) usually fit
  as rows of the unit or api proof rather than one journey each. A row
  is width-aware (Width column: the doctrine's tag, such as @phone)
  when the behaviour depends on the width; otherwise "—". A proof pins
  copy or markup only when the copy is the AC. When a case really
  needs a second proof (a risky flow worth an api test and a journey),
  say so in the row's proof with the reason; otherwise one row owns
  each behaviour.
  scripts/review-prep.mjs lists every AC id this file does not cite.
-->

## How tests run here

<two or three lines from the doctrine's testing standard, path:line: where each layer lives, the command, what green means>

## S-00N — <story name>

| AC | Layer | The proof | Read back | Width |
|---|---|---|---|---|
| `J1.s2.1` | api | <`POST /invites` with a valid e-mail returns 201; the invalid and duplicate e-mails as rows of the same table> | <one `invites` row, status `pending`> | — |
| `J1.s2.2` | journey | <the person sends an invite and sees it pending in the list> | <one `invites` row> | — |

## The implementer decides

- <fixtures, request bodies, the order the tests run in>

## References

- <the doctrine's testing standard, path:line>
