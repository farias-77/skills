# The release plan

The plan is the whole stage written down before the play. His play
authorizes what the plan says and nothing else, so the plan is
complete before he is asked to press it.

**The test:** a reader who knows the project can predict every
command the session will run and every check it will read. That
reader also finds nothing in the plan that needs the user except the
pre-flight, the play and the stop list.

## Where it comes from

| Section | Source |
|---|---|
| What ships | `03-execution/audit.md` and `blueprint/execution/execution.json`: the entries merged, the amendments, the residue he accepted |
| Versioned artifacts | the doctrine's delivery standard: what is versioned and released (one repo, or several deployables in one) |
| Permissions | the checks of `permissions.md`: the guard, the allow rules the steps need, branch protection |
| Pre-flight | the design's `operations.md`: every step that needs him, the plan's open pre-flight items, anything the audit left "with the user", every step the classifier reserves for him (below), and the guard's verbatim lines |
| Steps | the doctrine's delivery standard: what deploys staging and production, the read-only check of each, the production diff command |
| The smoke | the doctrine's journey command and the journeys stage 4 left: the read-only ones, the URL and the actors per environment |
| Rollout mode | `rollout.md` of this skill and the doctrine's role 19: progressive where the platform has it, straight otherwise |
| Rollback triggers | `rollout.md` defaults, overridden by the doctrine's values and the design's `operations.md` |
| Migrations | `data-and-contracts.md` and the migrations in the diff: each classified expand or contract |
| Toggles | the design's rollout: each release toggle and ops kill switch |
| The watch | the 15 minutes and the triggers it reads; the alarms the release touches |
| The later proofs | the audit's residue deferred to production with its own hour (first scheduled run, first real data) |
| The stop list | SKILL.md, plus anything this release adds (a rollback not safe for data, named) |

## The pre-flight and the play

Each pre-flight line has these columns:

- what;
- why the session cannot do it;
- the ready command;
- **done** (date) or **delegated** (how the session does it in his
  place: where the value lives, never the value).

A line neither done nor delegated parks the release before the merge
into `main`.

**What the classifier reserves for him is always his line, never
"delegated".** There are four classes:

- an infrastructure apply;
- writing a secret's value;
- reading a credential or a person's data from a store;
- dispatching an agent whose job is a production deploy.

Each is a line with its `!` command ready (or a scratchpad script that
pipes the value from where it lives). The whole list goes to him in
one message. Finding these one at a time, by being blocked, cost a
past release most of a day.

**A secret a resource mounts has its value before the first deploy
that creates the resource.** The platform refuses to create a service
or job whose secret has no version; it does not wait to fail in a
test. When the rollout puts the value after the first deploy, the
plan moves it into the pre-flight and notes the rollout's line in
`dreaming-notes.md`.

**The guard's verbatim lines.** A command the plan needs that the
guard denies is rare: a state move the design calls for, or a
one-time cleanup in staging. It goes to him as a line to append to
`.claude/hooks/irreversible.allow`, exactly as the session will run
it. The guard matches it verbatim (whitespace collapsed).

**The play line** is last: `merge-from <audited head>` (or
`merge-head`, see `permissions.md`). It goes with the date and the
slug in a comment.

## The steps

Each step as the doctrine defines it, in three parts:

- what the session runs (open a PR, merge, dispatch or follow a
  workflow, run a command the settings allow);
- what the CI does;
- the read-only check the session reads afterwards, with the value
  expected.

Copy them from the doctrine and the design's rollout, never
paraphrase them. Every command the session will run in production
appears here verbatim, because "outside the plan" is decided against
this list.

## The rollback

There is one line per artifact (service revision, job image, front
release):

- the command that restores the previous one;
- what the session records before serving (the previous revision,
  digest and release id);
- **safe for data: yes / no**, and why;
- **rehearsed: yes / no**. A path never run runs once on staging at
  step 3, back and forward.

"Not safe for data" (the release writes in a shape the previous
revision cannot read) puts the release on the stop list *before* the
production deploy, not after a red.

## The rollback triggers

The table of `rollout.md`, with this project's thresholds (the
doctrine's values override the defaults), the metric query or
command that reads each one, and the action. They are written here
before the play, so that firing them needs no one.

## The migrations

One row per migration in the release:

- the file;
- what it does;
- **expand** or **contract**;
- the lock and statement timeouts it sets;
- whether the previous revision works after it.

A contract in this release is a stop-list item, unless the doctrine
and the design both say no deployed code reads the old shape. Even
then it gets its own question. A migration that rewrites a large
table names its expected duration.

## The toggles

One row per release toggle or kill switch:

- the name;
- where it lives;
- Off = the old behavior (confirmed);
- the state at release;
- who flips it and when (a step of this plan, or "not in this
  release");
- its removal task.

## The smoke

The release does not re-test the feature: stage 4 proved it and he
used it. The smoke only proves each environment serves it. List the
**read-only journeys**: the ones that write nothing, or write only as
a test actor into data the doctrine says is safe in that environment.
Write the one smoke command verbatim (health, the sha served, those
journeys run by the project's journey command against a URL), and per
environment the URL and the test actors the doctrine names (never a
production actor, never a token).

## The later proofs

A row per deferred proof with its own hour:

- what;
- the hour it can be read (absolute, UTC: the earliest hour the
  evidence exists);
- what it expects;
- the command that reads it.

An alarm's first evaluation is not a row: the watch reads it. A proof
more than 48 h after production is a pendency with an owner.

## Where the session stops

The stop list of SKILL.md (it includes the new production deploy
after a production rollback), plus what this release names (the
rollback not safe for data, the contract migration), and the second
red, which stops and reports. Nothing else stops the release, and nothing runs
before the play.
