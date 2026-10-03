# Changelog — v9

v9 keeps the six stages and their file contracts. What changes is where
the time goes and what is proved by running something. The runs of v8
showed four costs worth attacking:

- **Over-iteration.** Review rounds after the first were mostly
  leftovers of the previous round's fixes, and the execute stage's fix
  loop was the largest block of the clock.
- **Late decisions.** Scope cuts and taste arrived at approval, after
  rounds had reviewed work that was then thrown away.
- **Shared names.** Round 1 of every document stage was dominated by
  one name spelled two ways across documents or briefs.
- **Code that works and that nobody can extend.** Maintainability was
  read once at the end, when it was cheapest to ignore.

The rules that hold at every stage in v9: proof over opinion (whatever
can be checked by running something is checked that way); right size
(every review asks "does this need to exist?" before "is this
complete?"); specialists read knowledge packs of their craft; the user
is asked only what is his; every stage closes with video, slides,
blueprint; the pipeline measures itself.

## Across the stages

| Change | Mechanism | Why |
|---|---|---|
| **The stage report** | every stage closes with three layers read in order: a 1–2 minute video, 8–15 slides, the blueprint (`docs/stage-report.md`) | the reader goes up one layer only when he wants more detail; each layer is whole at its altitude |
| **The video kit** | `claude/video/`: a storyboard JSON rendered to MP4 with no code per video; `video-scribe (Sonnet 5.5, medium)` writes the storyboards; renders queue on one lock | a video per design document, per entry and per stage costs one cheap read and CPU time, off the critical path |
| **Knowledge packs** | reference-only skills (`pack-<craft>`) that agents load before they work: a checklist plus recipes per craft | the bar of each craft is written once and read by every agent of that craft |
| **The bar** | `docs/project-contract.md` rewritten as 21 roles in three levels (required, recommended, full experience), each with what it is, why, and how a stage uses it | a project knows what to provide before the first run instead of finding out at a pre-flight |
| **`/pipeline-setup`** | audits a project against the bar with six scouts, writes `pipeline-readiness.md` with evidence, proposes the cheapest order to close the gaps, applies the generic pieces on a branch | adoption becomes a checklist with templates, not a week of discovery |
| **Local CI** | the project's whole gate runs locally in a clean worktree and posts a commit status that `main` requires; hosted CI keeps the deploy | a hosted queue on every merge was the slowest step of a parallel build |
| **Safe autonomy** | a permissions template (allow, ask, deny) and a PreToolUse hook that denies irreversible commands unless the user approved that exact command | execute and release run without a human between the gates; prefix rules alone are not a boundary |
| **The structure check** | a diff-scoped gate for complexity, size, duplication, import boundaries and new dependencies, with thresholds calibrated from the codebase's own p95/p99 | maintainability becomes a gate of every entry, measured, instead of a reading at the end |

## Discovery

| Change | Mechanism | Why |
|---|---|---|
| The mock comes first | the interview and a clickable prototype advance together; the user validates by using it; stories and journeys are derived from the locked mock | the user approves what he sees, not a document about it |
| One question for the authors' inferences | the inferences the conductor would confirm go as one question ("confirm all" / "all except…"); a doubtful one gets its own | this is how the user already answers, and the four-question budget goes to real decisions |
| Every story carries its own Out | the theme's Out items that touch a story are repeated in it; "no screen" is said | a blind reader of one story never invents what another story ruled out |

## Design

| Change | Mechanism | Why |
|---|---|---|
| Three tiers, picked per part | architects design lean, balanced and hardened in parallel; a sizing judge picks a tier per part on risk × reversibility × cost, two critics attack the pick from opposite sides; the result carries an evolution path | agents drift to over-engineering; a named requirement per mechanism keeps the design the size of the problem |
| Writers in two waves | data model and contracts write first and fix every name; the other documents copy those names and never mint one | the largest class of round-1 findings was one name spelled two ways |
| Propagation finished in the round | before a fix batch, the conductor searches the old term across every document and sends the fix to every hit; the next round starts only when none is left | most later-round findings were fixes that did not reach another document |
| The size sweep in round 1 | the coverage lens asks every column, index, panel, log event and case to name its reader, or it is removed | cuts land before two rounds review what will be removed |
| A video per document | written in the background before round 1 | the user's cuts move from the approval to round 1 |
| Claims checked in the repo | the facts lens checks every sentence about the codebase against the base branch, never against notes | a design that asserts what the repo does not have parks an entry later |
| The round rule asked once | the user picks, once, whether later rounds run by the rule or on his word | removes waits while he is away |

## Plan

| Change | Mechanism | Why |
|---|---|---|
| The foundation's writer goes first | it lists every name the foundation provides; each entry copies the names it uses from that list, and a missing one is a question answered before review | foundation gaps were caught at execution, where each one stalled an entry |
| Only the doctrine's shared files are frozen | entries extend anything else the foundation created, by addition, and say so | most foundation amendments were additions to files that never needed freezing |
| Acceptance lines a verifier can run | each line names the actor, what is observed, the side effect read back, and the check | the verifier turns them into checks before any code, with no guess |
| Gate commands fixed once | in `plan.md`, never repeated per brief | a large share of plan findings were about how each brief spelled the commands |
| Golden paths per brief | each kind of code an entry adds names its exemplar | parallel builders of one kind converge on one shape |
| A size cap | one screen and one server flow, about 2,500 changed lines | one entry fits one builder's context |
| No test pins a stub | foundation tests never assert "not implemented" | those tests went red the moment an entry did its job |

## Execute

| Change | Mechanism | Why |
|---|---|---|
| Acceptance first | the verifier writes the checks from the brief, proves them red on the base and commits them; the builder cannot edit them | the definition of done is fixed before the code and cannot be bent to fit it |
| One builder per entry | back and front by one writer in the entry's worktree, following the golden paths | the back/front seam produced most conflicts and amendments |
| Prove and review in parallel | the verifier proves on the running stack while reviewers that never wrote the code read the diff, including a structure reviewer and a UX reviewer that compares screens with the locked mock | breadth of the first read kept with fewer seats |
| No judge | a finding blocks only with a reproduction or a violated written rule; the rest is deferred or logged | the same ruling every time, and the judge loop is gone from the clock |
| One fix, one delta | the builder fixes once at high effort; only the verifier and the reviewers that blocked re-check; still blocking, the entry parks | the fix loop was the largest block of time, and later rounds were mostly regressions of earlier fixes |
| Deferred work in batches | deferred findings are built at the end in one slice per side | replaces many small finishing slices, each with a full review |

## Release

| Change | Mechanism | Why |
|---|---|---|
| Everything only the user can do, at once | the pre-flight goes out in one message right after the plan, each item with its command ready | long waits came from items discovered mid-release |
| A secret before its consumer | a secret a resource mounts gets its value before the first deploy that creates the resource | a first deploy failed on a secret with no value |
| The verifier on staging | every entry's acceptance checks run again against staging before the production ask | a green local suite can hide a broken deployed screen |
| Test-only fixes from the station | a defect in the checks themselves is fixed and re-run locally against staging, then one PR | one CI and deploy cycle per fix instead of one per attempt |
| No waiting for alarms | an existing alarm's state is read once at the end; only proofs with their own hour are waited for | waits nobody wanted were cancelled by hand |
| The go given in advance | when the user's goal already authorized the production merge, it is quoted and the merge runs on green | one stop fewer, with his words still on the record |

## Close and the weekly retro

| Change | Mechanism | Why |
|---|---|---|
| The structure of main | each close measures `main` before and after the workstream with the project's structure check: duplication, complexity, boundary violations, gate runtime, reverts | every workstream leaves a measured footprint on maintainability |
| The trend and a refactor slice | the weekly compares main with the four-week median; a crossed threshold ranks a refactor slice first on the board | a slow drift no single workstream shows becomes a scheduled demand |
| Files, never folders, to the harvester | the session lists the run records; the harvester reads exactly those | the harvest no longer wanders through thousands of evidence files |
| Plain sentence first | every group on the weekly board opens with what changes in practice | fewer good ideas dropped because they were unclear |
| Settled ground stays settled | an idea the user dropped before is listed as "dropped before" and not asked again | his rulings hold |
| The launch package | the close records the real app journey by journey and renders a launch video for the product's users | the release is shown to the people who use it, not only to the team |
