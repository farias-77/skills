# The release plan

The plan is the whole stage written down before it runs. Its test: a
reader who knows the project can predict every command the session
will run and every check it will read, and finds nothing in it that
needs the user except the pre-flight and the one "vai?".

## Where it comes from

| Section | Source |
|---|---|
| What ships | `03-execution/audit.md` and `blueprint/execution/execution.json`: the entries merged, the amendments, the residue the user accepted; `origin` re-read |
| Versioned artifacts | the doctrine's delivery standard: what is versioned and released (one repo, or several deployables in one) |
| Pre-flight | the design's `rollout.md`: every step that needs the user; the plan's pre-flight items still open; anything the audit left "with the user" |
| Staging and production | the doctrine's delivery standard: the branches, what the CI does on each, the staging suite, the production checks, the automatic rollback, the command that shows the production diff |
| Rollback | the doctrine's rollback, plus what `data-model.md` says about data changes (an expansion is safe to roll back from; a contraction is not) |
| The watch | the audit's residue deferred to production, each with the hour the design gives it (the first scheduled run, the first alarm evaluation, the first day) |
| Where it stops | the third red on one step; a rollback not safe for data; a pre-flight item found missing |

## The pre-flight

One line per thing only the user can do: what · why the session
cannot · **done** (date) or **delegated** (how the session does it in
his place: the file with the value, the CLI it may use). A delegated
line names where the value lives, never the value. A line neither done
nor delegated parks the release before staging.

## The steps

Each staging and production step as the doctrine defines it: what the
session runs (open a PR, merge, follow a run), what the CI does, and
the read-only check the session reads afterwards with the value
expected. Copied from the doctrine and the design's rollout, never
paraphrased.

## The watch

A row per deferred proof: what · the hour it can be read (absolute,
UTC; the earliest hour the evidence exists) · what it expects · the
command that reads it. A proof more than 48 h after production is
listed as a pendency with an owner.

## Where the session stops

Explicit, so that the user knows it before he leaves: the third red on
one step; a rollback not safe for data (the session stops before that
production merge, not after a red); a pre-flight item found missing.
Nothing else stops the release, and nothing reaches production before
his "vai".
