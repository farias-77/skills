# Migrations in a release

A rollback must only move traffic. So a release only ever expands the
schema; a contract (drop, rename, type change, NOT NULL on what the
previous release reads) ships in a later release, with its own word
from him.

## Expand now, contract later

```
R1  code that tolerates the new shape + the expand migration
R2  features use the new shape; backfill in batches
R3  code stops touching the old shape → the next release drops it, named in its /goal
```

| Expands (fine in any release) | Contracts (a later release, his word) |
|---|---|
| new table; nullable column; column with a constant default | `DROP` table or column |
| `CREATE INDEX CONCURRENTLY` | `RENAME` |
| `CHECK (...) NOT VALID`, `VALIDATE` in the next migration | a type change |
| a new enum value | `NOT NULL` on a column the previous release reads |

Every migration sets a short `lock_timeout` (fail fast, retry) and a
`statement_timeout` sized to its slowest statement. A file with
`CONCURRENTLY` opts out of the migration tool's transaction (goose:
`-- +goose NO TRANSACTION`). A linter such as Squawk catches most of
this in CI (`ban-drop-column`, `renaming-column`,
`changing-column-type`, `adding-required-field`,
`require-lock-timeout`, `require-statement-timeout`).

## The risk on real data

Every migration that touches an existing table gets a line in
`plan.md` with the risk on production's data and how it was checked:

| Migration | The real-data risk |
|---|---|
| a unique index | duplicates already there |
| `NOT NULL`, or a `CHECK` validated | nulls or violating rows already there |
| any DDL on a large table | a long lock blocking reads and writes |
| a backfill | its duration, and rows the code does not expect |

The agents' identity has no database role. The check is a read-only
count he runs (a `!` command handed with the execute's ok question) or
a read-only CI job; its result goes in `plan.md` with the date.

## When a migration fails

- **Staging:** a red like any other: one `X.n`.
- **Production:** the old revision keeps serving. It is a **stop**:
  never run it again yourself, never roll the schema back; read the
  error and ask him with the evidence.
