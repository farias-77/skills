# The contract commit (C)

The one short commit every entry builds on. About 30 minutes of
builder, one review for security only, no QA. It never parks: a red is
resumed until green.

## What goes in

| Item | Only when |
|---|---|
| the API spec: every route the entries serve, every field, every error | always (spec-first) |
| the generated code from the spec | always: only `C` runs the generator |
| the DDL of a table | two or more entries use it; additive only |
| compile stubs | the server or the client does not compile without a handler per operation; each stub answers "not implemented" and no test asserts that |
| shared factories and test actors | two or more entries seed the same record |
| the skeleton of a new app or module | the module does not exist: registration, the folders, the shape of the reference module |

Nothing behavioural. A table, a factory or a helper one entry alone uses
goes with that entry.

## The proof

1. The fast check is green with every stub in place.
2. The generator leaves no diff (`make gen` then `git diff --exit-code`,
   or the project's equivalent).
3. The migrations apply from an empty database.

## What the review blocks

Only a security hole (a route spec'd without auth, a secret, a grant too
wide). Everything else is a note for the entry that fills the stub.
