# Tests — <workstream>

<!--
  Written by its design-writer (Sonnet 5.5, high). One row per AC of
  00-discovery/stories.md, cited by id, never copied. One primary proof
  at the cheapest layer that really proves it: unit (a pure rule), api
  (a contract with the store read back), journey (behavior on screen).
  A failure is proved by its behavior and its error code, never a
  status number or a JSON field. One walk per journey, one test step
  per AC. review-prep.mjs fails on an AC id this file does not cite.
-->

## How tests run here

<two or three lines from the project's testing standard, path:line>

## S-00N — <story>

| AC | Layer | The proof | Read back | Width |
|---|---|---|---|---|
| `J1.s2.1` | api | <sending an 11th invite is refused with `invite_limit_reached`; the 10th is kept> | <10 rows in `invites`> | — |

## The journey walks

| Journey | Test steps (one per AC) |
|---|---|
| J1 | `J1.s2.1` · `J1.s3.1` |

## The floor this demand touches

| Floor test | Case here |
|---|---|
| <permission or scope> | <a manager of another scope is refused, nothing written> |

## The implementer decides

- <fixtures, the order the tests run in>

## References

- <the project's testing standard, path:line>
