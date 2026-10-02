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
| Pre-flight | the design's `rollout.md`: every step that needs the user; the plan's pre-flight items still open; anything the audit left "with the user"; every step of the plan the harness's classifier reserves for him (below) |
| Staging and production | the doctrine's delivery standard: the branches, what the CI does on each, the staging suite, the production checks, the automatic rollback, the command that shows the production diff; then the verifier over every entry's acceptance checks on staging |
| Rollback | the doctrine's rollback, plus what `data-model.md` says about data changes (an expansion is safe to roll back from; a contraction is not) |
| The watch | the audit's residue deferred to production, each with the hour the design gives it (the first scheduled run, the first alarm evaluation, the first day) |
| Where it stops | the third red on one step; a rollback not safe for data; a pre-flight item found missing |

## The pre-flight

One line per thing only the user can do: what · why the session
cannot · the ready command · **done** (date) or **delegated** (how the
session does it in his place: the file with the value, the CLI it may
use). A delegated line names where the value lives, never the value. A
line neither done nor delegated parks the release before the staging
merge.

**What the classifier reserves for him is his line, never
"delegated".** Four classes were blocked for the session in the last
runs: an infrastructure apply, writing a secret's value, reading a
credential or a person's data from a store, and dispatching an agent
whose job is a production deploy. Every step of the plan in one of
them is a pre-flight line with its command ready to run with `!` (or
a scratchpad script that pipes the value from where it lives, never
holding it), and the whole list goes to him in one message right
after the plan. Never "delegated" and then found blocked.

**A secret a resource mounts has its value before the first deploy
that creates the resource.** The platform refuses to create a job or
service whose secret volume has no version; it does not wait to fail
in the suite. When the rollout puts the value after the first deploy,
the plan moves it into the pre-flight and notes the rollout's line in
`dreaming-notes.md`. Two releases in a row went red on this.

## The steps

Each staging and production step as the doctrine defines it: what the
session runs (open a PR, merge, follow a run), what the CI does, and
the read-only check the session reads afterwards with the value
expected. Copied from the doctrine and the design's rollout, never
paraphrased.

## The verifier on staging

One row per entry: the acceptance files, the staging URLs and actors
the doctrine names, the evidence folder. The lines stage 4 could not
check locally and staging reaches are named here.

## The watch

A row per deferred proof that has its own hour: what · the hour it
can be read (absolute, UTC; the earliest hour the evidence exists) ·
what it expects · the command that reads it. The first evaluation of
an alarm is not a row: its state is read at the end of production and
the alarm itself watches from then on. A proof more than 48 h after
production is listed as a pendency with an owner.

## Where the session stops

Explicit, so that the user knows it before he leaves: the third red on
one step; a rollback not safe for data (the session stops before that
production merge, not after a red); a pre-flight item found missing.
Nothing else stops the release, and nothing reaches production before
his "vai".
