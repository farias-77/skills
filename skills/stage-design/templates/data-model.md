# Data model — <wave>

<!--
  What is stored and how it is reached. MUST have: every entity with an
  example record (realistic values, not <placeholders>), EVERY access
  pattern mapped to the key/index that serves it, the growth math (a
  number, not an adjective), the query table for every screen/flow, and
  the three-scale growth story. An access pattern with no key path is a
  design bug — do not write around it, fix the model.
-->

## Entities

### <Entity>

<one line: what it represents and who owns its lifecycle>

```jsonc
// example record — realistic values
{ }
```

- **Found by:** <access pattern> → <key/index that serves it>
- **Grows:** <the math: N per user per day, bounded by X, TTL/archival story>

## Queries the screens and flows make

| Screen / flow | Query | Served by | Cost note |
|---|---|---|---|
| <where> | <what it asks> | <key/index> | <reads touched> |

## Growth at scale

| Scale | What changes | What holds |
|---|---|---|
| current | | |
| 10× | | |
| 100× | | |

## References

- <research file · URL · internal code path>
