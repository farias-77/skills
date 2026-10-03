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

## Fixes from the first end-to-end run

The first run of v9 on a real project, headless, stage by stage, found
what the builders' self-tests could not. Each fix is generic: it holds
for any project that meets the bar.

| Area | Fix | What the run showed |
|---|---|---|
| Setup (F1–F15) | step 0 finds where the pipeline's sessions open and installs the settings and the guard there; a doctrine kept in another repository gets its own branch; no GitHub query for another remote; scouts read a detached worktree at the audited sha; `pipeline-readiness.md` is committed on the setup branch; calibration before golden paths, exemplars checked at the sha and under p95; requiring `local-ci` on `main` is a doctrine ruling when the doctrine names another check; dead settings targets pruned by a dry run; the rubric accepts maps per domain and inline runbooks; templates carry no comments; `local-ci.sh` stops its stack on exit, shares its cache across worktrees and runs the whole gate on an empty selection; the structure check pins its tools and takes capture groups; the final step runs the whole gate once and greps that no placeholder survives | the settings were installed where no session loaded them, the readiness file was left in the user's tree, and an empty affected selection passed the signoff with nothing run |
| Discovery: local mode | without the Artifact tools the mock is shot locally, his verdicts go to `walks/verdicts.json`, the lock records `url: "local"` and the report stays local; the question tool has a text fallback; the review workflow is copied when its path is refused | a headless or cloud run had no way to publish, ask or run the workflow |
| Discovery: the toolkit | actors and a clock in the mock's debug bar, never in a reference frame; `proto.mjs` gains shots, waits for a logged-in app, takes secrets from the environment, refuses step ids out of order, structures the lock's gaps and cuts the stories for the review; `[build]` acceptance criteria are judged against the build | reference frames carried mock controls, ids drifted before the lock, and the review pasted whole files into its arguments |
| Design: cuts | the code document fixes the code's names in wave 1; the host table covers local mode, no model switch and waiting without sleep; scouts quote per file and the conductor saves their answers; the review embeds the flows and the delta by script, round 2 seats only consistency and the lenses that had a sustained blocker; a 10 % appetite band needs no question, and over it a question never cuts a criterion, the floor or his ruling; inversions between tiers are named to the judge | round 2 re-read what had not changed, and small overruns stopped the stage for a question |
| Plan: cuts | stage 4's contract is quoted at the open; scouts go out before the long read; the recon carries the gate rules that bite and the unmerged branches; the foundation's names come first so the slice writers start while it finishes; the AC count is a warning scaled by the discovery's grain; renamed names propagate by script; round 2 re-reads blind only the briefs whose build or acceptance changed; no HTML comment reaches a plan file | a fixed AC cap split nodes that were the right size, and round 2 re-read briefs nobody had changed |
| Video: the cache | `stills.mjs` runs from the kit's folder, so Remotion's ~220 MB browser cache never lands in a report folder; `.remotion/` is ignored; the launch render waits 180 s for a footage frame and keeps the film when the vertical cut fails | the cache was committed twice under a stage's report folder, and a loaded machine lost the vertical cut |

## Pass 2

| Change | Mechanism | Why |
|---|---|---|
| The launch film gets a link | the close makes web copies under the artifact asset cap (`scripts/web-copy.sh`), publishes a launch page with the `assets` capability and uploads them; the masters stay local files; without the Artifact tool the delivery is the local files | the film (~50 MB) fits neither the blueprint (10 MB) nor one artifact file |
| The close's report | the launch film plus the retro tab; no slides, no review video | the film is for the people, the retro for the weekly |
| One telemetry shape | every stage writes `<stage-folder>/telemetry.json` with the same fields (`docs/telemetry.md`); the close sums them with `telemetry-sum.mjs` into `metrics.json` | each stage measured itself in its own format, so the delivery metrics were partly guessed |
| Generators owned by the foundation | the plan's scouts run each generator once in a scratch worktree and list every path it writes; the foundation owns them all | the foundation asked for an amendment to its own generated files |
| Smooth footage under load | `record.mjs --slow <rate>` slows the page's CSS animations and compresses the take back to real speed; the recorder checks the motion fps, not the whole take's | a loaded machine captured transitions at a few frames a second |
| The 9:16 cut | the hero stack stays inside the phone frame; the step window and its caption use the lower band; titles end before the stack at 16:9 | cards ran off the edge and the bottom quarter stayed empty |

## Pass 3

| Change | Mechanism | Why |
|---|---|---|
| Machine reds and closed amendments | `exec-gate` tags a failure `machine` only for a timeout under load or a known infrastructure flake; a red that is only the machine's runs the gate again after a load wait, at most twice, then parks with reason `machine`; a mixed red sends only the code failures to the builder; the run takes `closedAmendments` and a builder asking twice for a closed one returns `repeats closed <id>` | a load timeout went to a builder that changed nothing, then the builder asked again for an amendment already applied |
| Acceptance cites the criteria | a case in `acceptance.md` names its criterion by id (`J1.s2.1`) and carries only what the test adds (layer, setup, frame, the row read back, cleanup); the criterion's text lives in `stories.md` | the acceptance document copied every criterion and was the largest document of the design |
| A size budget for the design | `review-prep.mjs` warns when one document passes 40 KB or the set passes 320 KB (`--doc-budget-kb`, `--total-budget-kb`); a warning never stops the round | a design for about four days of build reached half a megabyte of documents |
| The cut ignores the machine | the parallel-plan pack drops "the first step at least as wide as the measured cap"; the cap throttles the run, never the cut | the pack contradicted the plan stage, which cuts as wide as the needs allow |
| The plan pins its checker | the plan's close writes `plan-graph.mjs`'s git blob into `plan.graph.json`'s `checker`; stage 4 runs that version for an amendment, or reads a newer checker's new rules as notes, never as reds | the checker changed during a run and re-judged a plan that had closed green |
| Two-root projects | when the product repository has no `CLAUDE.md`, the session root's `CLAUDE.md` and the doctrine's contract table are the source of the roles; the bar says so | the execute stage looked for a `CLAUDE.md` the layout never has |
| The foundation's own amendment | an amendment to the foundation's own Owns widens its node and brief, restarts it with its acceptance kept, and lists the amendment as closed in `closedAmendments` | the foundation stopped for files its own generators wrote |

## Pass 4 (the execute E2E stopped by the user's call; lessons closed)
| Change | Why |
|---|---|
| stage-execute: the load threshold carries the outside load read before the first run, and one run always goes (d8b715f) | on a shared machine at load 12–20 the threshold (nproc) never opened, so the root entries could never start in parallel |
| stage-plan: F's brief names the self-test that keeps its not-yet-called helpers in use, and who removes it | a reviewer blocked that test in stage 4 because no written rule named it, which cost the foundation one more run |
