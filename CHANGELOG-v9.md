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
| **The video kit** | `claude/video/`: a storyboard JSON rendered to MP4 with no code per video; `video-scribe (Sonnet 5.5, high)` writes the storyboards; renders queue on one lock | a video per design document, per entry and per stage costs one cheap read and CPU time, off the critical path |
| **Knowledge packs** | reference-only skills (`pack-<craft>`) that agents load before they work: a checklist plus recipes per craft | the bar of each craft is written once and read by every agent of that craft |
| **The bar** | `docs/project-contract.md` rewritten as 22 roles in three levels (required, recommended, full experience), each with what it is, why, and how a stage uses it | a project knows what to provide before the first run instead of finding out at a pre-flight |
| **`/pipeline-setup`** | audits a project against the bar with six scouts, writes `pipeline-readiness.md` with evidence, proposes the cheapest order to close the gaps, applies the generic pieces on a branch | adoption becomes a checklist with templates, not a week of discovery |
| **Local CI** | the execute queue tests each merged tree locally and posts `local-ci/affected`; the whole gate runs once at the end in a clean worktree and posts `local-ci`, the only context `main` requires; hosted CI keeps the deploy | a hosted queue on every merge was the slowest step of a parallel build |
| **Safe autonomy** | a permissions template (allow, ask, deny) and one PreToolUse guard (`claude/hooks/guard-irreversible.sh`, on Bash and every file tool) that denies irreversible commands unless the user approved that exact command, and asks before a merge whose head his play did not authorize | execute and release run without a human between the gates; prefix rules alone are not a boundary |
| **Models by role** | only Opus 5.5 and Sonnet 5.5, picked per role from benchmarks; one table in `docs/models.md`, checked against every agent by `scripts/check-models.mjs` | the cost of each step is visible and the pick has its evidence |
| **The structure check** | a diff-scoped gate for complexity, size, duplication, import boundaries and new dependencies, with thresholds calibrated from the codebase's own p95/p99 | maintainability becomes a gate of every entry, measured, instead of a reading at the end |

## Discovery

| Change | Mechanism | Why |
|---|---|---|
| The interview builds a mock | while the owner talks, `prototyper` builds a clickable mock of the product: every screen and state, the app's real look, realistic data, a faked store whose side effects show in a backstage pane, a journey panel that plays each journey step by step; he validates by using it | the user approves what he sees and clicks, not a document about it |
| A lock gate before the lock | `prototype-checker` walks every journey and every state mechanically (Playwright) and runs the design-taste checklist on the screenshots; he locks only a mock that passes, or overrides on the record | the lock is a proof, not an impression |
| Text derived from the locked mock | `journey-scribe` derives the journeys (YAML a test can run), the use cases and the acceptance criteria (`J1.s2.1 [RULE] GIVEN/WHEN/THEN`, each outcome with where it is observed), with a mechanical trace from every step to its criteria; a one-page PR-FAQ | nothing in the text is new after the lock, and every later stage cites the same ids |
| One round plus a delta | the acceptance and boundary lenses, and one blind reader per story walking the mock with that story only; the conductor judges and his product questions go out in one batch | the mock already settled most of what review rounds used to argue |
| A tool for the mock | `claude/skills/stage-discovery/scripts/proto.mjs`: walk, frames, look, lock, trace, model; the lock commits the reference frame per state and per journey step, the full matrix is regenerated on demand | the mock is checked and frozen by running it |
| Removed | the stories-first authoring and the story-by-story playback; `disc-author-stories`, `disc-reviewer-walkthrough`, `disc-reviewer-ambiguity` | superseded by the mock, the mechanical walk and the derivation |

## Design

| Change | Mechanism | Why |
|---|---|---|
| Three tiers, picked per part | a breadboard fixes the parts and effects; three architects design lean, balanced and hardened in parallel; a sizing judge picks a tier per part (and sub-part) on risk × reversibility × cost; an overengineering critic and a risk critic attack the pick from opposite sides; `sizing.md` carries the evolution path | agents drift to over-engineering; care goes only where a one-way door or a real risk sits |
| One short call | one deck with the tiers side by side and at most one question call of four, only on cost, scope, security posture and one-way doors; the stage closes on his approval of the report | he decides the size once, early, and nothing else waits for him |
| A requirement per mechanism | every mechanism line ends with `(req: …)`: an acceptance criterion (`J1.s2.1`), a rule, a doctrine line, a floor item, a door or a signal; the sizing lens flags any line without one | a mechanism nobody needs is a defect, found by a sweep |
| Writers in two waves | data model and contracts write first and fix every name; each document carries the tier and evolution path of its parts | the largest class of round-1 findings was one name spelled two ways |
| Two automatic rounds | round 1 whole, round 2 over the delta, then stop; the lenses report only correctness, coverage of the lock, contradictions and one-way doors | later rounds were mostly leftovers of earlier fixes |
| Claims checked in the repo | the facts lens checks every sentence about the codebase against the base branch, never against notes | a design that asserts what the repo does not have parks an entry later |
| One video for the stage | the per-document videos are gone; the stage report's video explains how it works and why it is this size | ten renders per design cost more than they returned |

## Plan

| Change | Mechanism | Why |
|---|---|---|
| The foundation's writer goes first | it lists every name the foundation provides; each entry copies the names it uses from that list, and a missing one is a question answered before review | foundation gaps were caught at execution, where each one stalled an entry |
| Only the doctrine's shared files are frozen | entries extend anything else the foundation created, by addition, and say so | most foundation amendments were additions to files that never needed freezing |
| Acceptance lines a verifier can run | each line names the actor, what is observed, the side effect read back, and the check | the verifier turns them into checks before any code, with no guess |
| Autonomous, with a checked graph | the conductor rules everything and lists its choices for veto; `plan.graph.json` is checked by `scripts/plan-graph.mjs` (cycles, owners, coverage of every criterion, depth) and cut for width: a thin foundation, lanes nobody waits for, slices, one integration node; edges only where a proof needs another node's real behaviour | the critical path of past runs was a chain of entries waiting on each other |
| Gate commands copied verbatim | fixed once in `plan.md` and copied into each brief as written | the builder runs exactly what the queue runs |
| Golden paths per brief | each kind of code an entry adds names its exemplar | parallel builders of one kind converge on one shape |
| A size cap | one screen and one server flow, about 2,500 changed lines | one entry fits one builder's context |
| No test pins a stub | foundation tests never assert "not implemented" | those tests went red the moment an entry did its job |

## Execute

| Change | Mechanism | Why |
|---|---|---|
| Pre-flight, then play | the plan's pre-flight is handed over once, then one `/goal`; the session calls him only at the end | he is not interrupted between the play and done |
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
| The play is the go | one message carries the pre-flight and the play line (`merge-from <audited head>` in the guard's allow file); from there the session merges, deploys, verifies and rolls back alone, and stops only on its written list | release runs from play to done, and the guard holds what an allow rule would skip |
| Progressive production | where the platform allows: a candidate at 0% smoked on its tag, the traffic shift, a bake against the previous revision; otherwise straight plus a smoke run; rollback triggers written before the play fire on their own | a defect reaches a fraction of users for minutes |

## Close and the weekly retro

| Change | Mechanism | Why |
|---|---|---|
| The structure of main | each close measures `main` before and after the workstream with the project's structure check: duplication, complexity, boundary violations, gate runtime, reverts | every workstream leaves a measured footprint on maintainability |
| The trend and a refactor slice | the weekly compares main with the four-week median; a crossed threshold ranks a refactor slice first on the board | a slow drift no single workstream shows becomes a scheduled demand |
| Files, never folders, to the harvester | the session lists the run records; the harvester reads exactly those | the harvest no longer wanders through thousands of evidence files |
| Plain sentence first | every group on the weekly board opens with what changes in practice | fewer good ideas dropped because they were unclear |
| Settled ground stays settled | an idea the user dropped before is listed as "dropped before" and not asked again | his rulings hold |
| The launch package | the close records the real app journey by journey and renders a launch video for the product's users | the release is shown to the people who use it, not only to the team |
