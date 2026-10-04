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
is asked only what is his; every stage closes with a report in layers
(slides and the blueprint, a short video where it shows what slides
cannot); the pipeline measures itself.

## Across the stages

| Change | Mechanism | Why |
|---|---|---|
| **The stage report** | every stage closes with layers read in order: a short video (discovery, design and plan only), 8–15 slides, the blueprint; the close has the launch film and the Retro tab (`docs/stage-report.md`) | the reader goes up one layer only when he wants more detail; each layer is whole at its altitude |
| **The video kit** | `claude/video/`: a storyboard JSON rendered to MP4 with no code per video; `video-scribe (Sonnet 5.5, medium)` writes the storyboards; renders queue on one lock | a video of the mock, the proposal and the graph costs one cheap read and CPU time |
| **Knowledge packs** | reference-only skills (`pack-<craft>`) that agents load before they work: a checklist plus recipes per craft | the bar of each craft is written once and read by every agent of that craft |
| **The bar** | `docs/project-contract.md` rewritten as 23 roles in three levels (required, recommended, full experience), each with what it is, why, and how a stage uses it | a project knows what to provide before the first run instead of finding out at a pre-flight |
| **`/pipeline-setup`** | audits a project against the bar with six scouts, writes `pipeline-readiness.md` with evidence, proposes the cheapest order to close the gaps, applies the generic pieces on a branch | adoption becomes a checklist with templates, not a week of discovery |
| **Local CI** | the execute queue tests each merged tree locally and posts `local-ci/affected`; the whole gate runs once at the end in a clean worktree and posts `local-ci`, the only context `main` requires; hosted CI keeps the deploy | a hosted queue on every merge was the slowest step of a parallel build |
| **Safe autonomy** | a permissions template (allow, ask, deny) and one PreToolUse guard (`claude/hooks/guard-irreversible.sh`, on Bash and every file tool) that denies irreversible commands unless the user approved that exact command, and asks before a merge whose head his play did not authorize | execute and release run without a human between the gates; prefix rules alone are not a boundary |
| **Models by role** | only Opus 5.5 and Sonnet 5.5, picked per role from benchmarks; one table in `docs/models.md`, checked against every agent by `scripts/check-models.mjs` | the cost of each step is visible and the pick has its evidence |
| **The structure check** | a diff-scoped gate for complexity, size, duplication, import boundaries and new dependencies, with thresholds calibrated from the codebase's own p95/p99 | maintainability becomes a gate of every entry, measured, instead of a reading at the end |

## Discovery

| Change | Mechanism | Why |
|---|---|---|
| The interview builds a mock | while the owner talks, `prototyper` builds a clickable mock of the product: every screen and state, the app's real look, realistic data, a faked store whose side effects show in a backstage pane, a journey panel that plays each journey step by step; he validates by using it | the user approves what he sees and clicks, not a document about it |
| His word is the lock | he says "lock it" and that is the gate; `proto.mjs lock` walks every journey and every state once more and freezes the frames; open items are listed once and he answers them or locks over them, on the record | the lock is his, and the walk keeps it a proof |
| Text derived from the locked mock | `journey-scribe` derives the journeys (YAML a test can run), the use cases and the acceptance criteria (`J1.s2.1 [RULE] GIVEN/WHEN/THEN`, one per rule and one per behavior, each outcome with where it is observed), with a mechanical trace from every step to its criteria; a one-page PR-FAQ | nothing in the text is new after the lock, and every later stage cites the same ids |
| One round, no delta | `disc-reviewer (Sonnet 5.5, medium)` and one `disc-blind-reader (Sonnet 5.5, low)` per story walking the mock with that story only, filtered; the conductor judges, verifies the fixes by reading, and his product questions go out in one batch | the mock already settled most of what review rounds used to argue |
| A tool for the mock | `claude/skills/stage-discovery/scripts/proto.mjs`: walk, frames, look, lock, trace, model; the lock commits the reference frame per state and per journey step, the full matrix is regenerated on demand | the mock is checked and frozen by running it |
| Removed | the stories-first authoring and the story-by-story playback; `disc-author-stories`, `disc-reviewer-walkthrough`, `disc-reviewer-ambiguity`; later (pass 5/6) `prototype-checker`, `disc-reviewer-acceptance`, `disc-reviewer-boundary` | superseded by the mock, his lock, the walk and the derivation |

## Design

The table below is the first v9 design; pass 5/6 replaced it (one proposal, the debate, four documents, one reviewer).

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

The table below is the first v9 plan; pass 5/6 replaced its review and its roster (one planner, one round, no user in the loop).

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
| Done is the ACs and the gate | an entry is done when the brief's ACs are met and the gate is green; nothing else blocks | everything else that blocked was paperwork or taste, and each block cost a builder pass and a gate |
| The builder writes its tests | one test per AC, beside the code, by the builder; while it builds it runs only the fast checks | the suites ran three times per pass (builder, gate, replay) |
| The gate is the only place the suites run | `exec-gate (Sonnet 5.5, low)` runs the gate commands once per pass and tags each failure `code` or `machine` | the builder's green is checked once, cheaply |
| Two builders only with a contract | back ∥ front when the brief carries a Contract section (routes, JSON, errors); otherwise one builder | two sides without a fixed contract took many passes to meet |
| One reviewer, closed scope | `reviewer (Opus 5.5, high)`: the ACs, bugs and races, a security checklist, operations, a written rule; plus `qa-frontend` and `qa-backend` (Opus 5.5, medium) using the running app | a panel of lenses found much and most of it was not the product |
| One blocking rule, in code | blocks only on an AC not met, a reproduced bug, a security hole or a written rule broken, with its proof; the rest are notes on the PR | the same ruling every time; notes open no work |
| One fix pass, then stop | two builder passes per entry at most; still blocking after the delta, the entry parks and is reported | the fix loop was the largest block of time |
| His eye on the screens, once | the stage report puts each real screen beside its locked frame; he checks them at the end | an agent comparing screens with the mock blocked on taste |

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

## Pass 5/6 (stages 1–4 rebuilt)

The measured runs showed the same cost at every stage: volume. Agents
left alone overengineer, a panel of lenses finds much that is not the
product, and every round after the first re-reads leftovers. Pass 5/6
rebuilds discovery, design, plan and execute around one producer, one
reviewer and one round, and puts the user where only he can decide.

### Discovery

| Change | Why |
|---|---|
| His "lock it" is the gate; `proto.mjs lock` walks every journey and state once more and freezes the frames; open items are answered or locked over, on the record | a checker agent before the lock duplicated the walk and argued taste |
| One AC per rule and per behavior, never one per step or per frame state | the AC count tracked the mock's frames, not the product's rules |
| One review round, verified by reading, no delta: `disc-reviewer (Sonnet 5.5, medium)` (judgeable ACs, the In/Out fence, one AC per rule and behavior) ∥ one `disc-blind-reader (Sonnet 5.5, low)` per story, filtered | the mock settles what the rounds used to argue |
| The report's video is 60–90 s of the mock in use; the slides add the stories | he re-watches what he approved; the detail is a layer up |
| Removed: `prototype-checker`, `disc-reviewer-acceptance`, `disc-reviewer-boundary` (replaced by `disc-reviewer`) | one reader with a checklist does their work |

### Design

| Change | Why |
|---|---|
| D0–D6: scouts read the system; the talk ("do you have something in mind?"); one `architect (Opus 5.5, high)` writes one proposal at the "basics done well" bar, with where it disagrees with him and the evolution path; `overengineering-critic (Opus 5.5, medium)` cuts what serves no AC and no real risk | three tiers and a sizing judge produced three designs to throw two away |
| The debate: the proposal as a video and slides, iterated with him until he says it is closed, the slides re-rendered each round; closing it is his approval | he decides the shape once, early, with the reasons in front of him |
| Four documents, about 40 KB each, written in parallel by `design-writer (Sonnet 5.5, high)`: `solution.md`, `data-and-contracts.md` (a Contract per feature), `tests.md` (one primary proof per AC), `operations.md`; `review-prep.mjs` warns over 40 KB per document or 160 KB in all | ten documents reached half a megabyte for a few days of build |
| One reviewer, one round, blocking only: `design-reviewer (Opus 5.5, medium)` checks AC coverage, consistency (documents, proposal, mock) and the security posture | twelve lenses and two rounds re-read their own fixes |
| The Design tab built from the four documents, the proposal and the debate; `tests.json` proves every AC once | the tab follows what the stage now produces |
| Removed: `sizing-judge`, `risk-critic`, the twelve `design-reviewer-<lens>`, `design-blind-reader`, the tiers, `sizing.md` and the old documents (`architecture.md`, `data-model.md`, `contracts.md`, `ui.md`, `acceptance.md`, `rollout.md`, `observability.md`, `infra.md`) | folded into the proposal, the critic, the four documents and the one reviewer |

### Plan

| Change | Why |
|---|---|
| No user in the loop: the conductor rules everything, records each choice for veto, and gathers what only he can hand over into the pre-flight; stage 4 waits for his play | plan is mechanical once the design is closed |
| P0–P4: `scout (Sonnet 5.5, low)` × N over the system and the other running fronts; one `planner (Opus 5.5, high)` cuts the whole graph; `plan-writer (Sonnet 5.5, high)` writes every brief at once; one round (`plan-reviewer (Opus 5.5, medium)` ∥ one `plan-blind-reader (Sonnet 5.5, low)` per brief, filtered) | the judgment sits in one agent; the writers copy |
| Compute is infinite: a thin foundation, every entry one whole behaviour, front ∥ back on the design's Contract, hot files made cold, an edge only where nothing can be faked, one integration entry at the end, merge points with the other fronts | the machine throttles stage 4, never the cut |
| Removed: `plan-scout` (the shared `scout`), the four `plan-reviewer-<lens>`, round 2, the machine scout | one reader of the cut and the briefs does their work |

### Execute (stage 4 lean)

Two measured stage-4 runs: two small web features took 55 hours; 61% of
agent time went to suites run three times per pass and to waiting on
the machine's load; a panel of 6–10 lenses and a judge produced 454
rulings, 216 of them deferred into finishing entries that went through
the panel again (56% of the time outside the plan); half the blocking
findings were evidence paperwork.

| Change | Why |
|---|---|
| exec-entry: build → gate → reviewer ∥ QAs → at most one fix pass → the delta by the agents that blocked; a budget of two builder passes, 30–60 minutes per entry, every step stamped with its minutes | the entry never loops |
| The roster: `builder (Opus 5.5, medium)`, `exec-gate (Sonnet 5.5, low)`, `reviewer (Opus 5.5, high)`, `qa-frontend (Opus 5.5, medium)`, `qa-backend (Opus 5.5, medium)` | one reader per question a customer would ask |
| Removed from stage 4: the verifier as author and prover (it stays at release), `structure-reviewer`, `ux-reviewer`, the security, operations and craft lenses, acceptance-first, foundation amendments, the deferred register, batch and finishing entries, the maintainability read, the evidence record | each one opened work outside the plan or re-ran the suites |
| A builder may change a file outside its Owns and lists it; the reviewer reads it | amendments to the foundation cost hours each |
| The plan's brief carries a Contract section when a node has both sides | it is what lets two builders run in parallel |
| `scripts/exec-entry-dry-run.mjs`: the workflow with mocked agents over the paths that matter | the flow is checked before a real run |
| The plan closes on its own; stage 4 waits for his play and caps its runs at the plan's widest wave, held by the machine's load | no approval step and no machine scout between the plan and the play |
| `video-scribe (Sonnet 5.5, medium)` at every stage | templated storyboards from a fixed source hold at medium |

## Pass 7 (the end of execute, release, close and the weekly retro)

Stage 4 owns working; the stages after it stop re-proving it, and the
retros get short.

### Execute: his hands-on

| Change | Why |
|---|---|
| After every entry merged and the whole gate is green, the session brings the environment up (the project's stack with its seed) and gives him the local URLs and the test actors' logins; he uses the app and says what to change in plain words | the visual check is his, on the real thing, not screenshots beside the mock in a report |
| Each adjustment is an entry `A.<n>` on exec-entry's fast path (`mode: 'adjust'`): `builder (Opus 5.5, medium)` → `exec-gate (Sonnet 5.5, low)` → the merge queue; no QA, and `reviewer (Opus 5.5, high)` only when the change touches authentication, permissions or personal data (the session marks it, or the gate's `surface.sensitive`); adjustments whose files do not overlap run in parallel | it is his own request on a screen he is looking at; the security checklist still holds |
| His "ok" closes the hands-on; then the stage report and the audit | stage 5 assumes everything is implemented and working |

### Release

| Change | Why |
|---|---|
| No re-test of the feature: the verifier's proof per entry on staging and the re-QA are gone; each environment gets a smoke of the read-only journeys (health, the sha served, the journeys run by the project's journey command against its URL) | stage 4 proved it and he used it |
| Production (progressive where the platform allows), its smoke, then a 15-minute watch of errors and latency against the previous revision, with automatic rollback on the plan's triggers; the alarms' first evaluation is read in the watch | one bounded wait instead of a bake and a separate alarms step |
| A red smoke or a rollback gets one fix, `R.n`, through the stage-4 pipeline, under the same play; a second red stops and reports | no loop and no question for a fix the pipeline already reviewed |
| After a production rollback the fix is built and smoked on staging, but the new production deploy asks him first; the build refuses a production step after a rollback with no new `go` | the stop list he accepted names it: production already failed once on this release |
| The session asks only before what cannot be undone (a contract migration, a rollback not safe for data, a stateful delete, the guard, anything outside the plan) and before a new production deploy after a rollback; a failed migration, the second red and a missing pre-flight item stop and report | the stop list is the irreversible list plus the deploy after a rollback |
| The smoke is a role of the bar (role 23: the project's journey command over the read-only journeys against a URL), audited by `/pipeline-setup` | the release cannot smoke an environment the project gives no command for |
| Removed: `verifier` | nothing else used it |

### The stage reports

| Change | Why |
|---|---|
| Execute makes no video: no video per entry and none for the stage; his hands-on with the running app is the validation, and nothing is recorded while he uses it; slides and blueprint stay | a video of what he has just used himself tells him nothing |
| Release makes no video; slides and blueprint stay | the record and the slides say what went live |
| The videos that stay: discovery (the mock in use, 60–90 s), design (the proposal, at the start of the debate and at the end), plan (the graph, 60–90 s); the close keeps the launch film and the Retro tab | each shows what the slides cannot |
| A stage with a video waits for its render before it closes | the video is made only when the stage is really done |
| `video-scribe` loses its execute-entry and stage-record modes; the blueprint's bar has no Watch step on the Execution and Release tabs (an older record with a video still builds and plays it) | — |

### Close and the weekly retro

| Change | Why |
|---|---|
| The launch film is one format, 16:9; the 9:16 cut is gone from the kit (`launch-vertical`, `--vertical`), the director, the launch page and the delivery | one film to make, check and forward |
| The retro has a fixed short format: the numbers from every stage's `telemetry.json` beside the previous workstream's, went well ×3, got stuck ×3 with where the time went (`telemetry-sum.mjs` now lists the slowest steps), ideas ≤3; `retro.json` and the Close tab follow it | a long retro was read by nobody |
| One `close-harvester (Sonnet 5.5, medium)` reads the frictions, `dreaming-notes.md` and `rulings.md`; the `close-harvest` workflow and its five sources are gone | the numbers come from telemetry by script, not from readers |
| The ideas stay in the workstream (`05-close/retro.md`); nothing is opened on the skills repo | the record is the workstream's |
| The weekly retro runs over the workstreams closed that week: one `weekly-reader (Opus 5.5, medium)` reads each one's record and finds what went wrong and the patterns across; he rules each proposal (apply, park, drop) | the week's view is where a pattern shows |

## Tests sized to real use

| Change | Why |
|---|---|
| One rule for the tests, in `builder (Opus 5.5, medium)` and in the design's `tests.md` (template and `design-writer (Sonnet 5.5, high)`): test only what makes a difference in real use, and make sure it really works. Each AC gets one primary proof at the cheapest layer that proves it (a pure rule → unit, an HTTP contract → API, a behaviour on screen → one journey); a rule's variations are rows of the unit or API table; a test is width-aware only when the behaviour depends on the width; no copy or markup pins unless the copy is the AC; no evidence or mutation scaffolding; no second test of what another owns | in one measured project the browser suite took 77% of the final gate and about 18 hours of one execute stage, much of it pure rules and HTTP contracts driven through the browser, duplicates and markup pins |
| `reviewer (Opus 5.5, high)`, `qa-frontend (Opus 5.5, medium)` and `qa-backend (Opus 5.5, medium)`: a test at the wrong layer or duplicating another is a note, never blocking; an AC with no proof still blocks | the rule is the builder's; a fix pass is spent only on what must not merge |
| Role 24 of the bar, a gate sized to the change (recommended): the per-entry gate runs the check and the affected tests at one primary width plus the width-tagged specs, evidence off (`EVIDENCE=1` turns it on), the server suites once; non-UI files select no screen tests, the lockfile the whole suite only on a runtime or test-runner dependency, selection by import graph with a whole-suite fallback; the whole gate at the end runs every width, visual, the full server suites and evidence. `/pipeline-setup` audits it (group B) and proposes the fix | the same project ran every test at two widths, let a build or ignore file select the whole suite, took screenshots in every gate and ran the server suites twice per gate |
| `exec-gate (Sonnet 5.5, low)` and stage 4 run the per-entry gate as given and the whole gate once at the end; the plan's gate commands name the width and the evidence flag. A project below role 24 still runs, only slower | the cost moves to the one run that needs it |

## Common sense over hard rules for tests

| Change | Why |
|---|---|
| The testing rule becomes guidance with judgment in `builder (Opus 5.5, medium)`, the design's `tests.md` and `design-writer (Sonnet 5.5, high)`, `reviewer (Opus 5.5, high)`, `exec-gate (Sonnet 5.5, low)`, stage 4 and role 24: prefer one primary proof per AC at the cheapest layer that really proves it; use judgment when a case needs more. Nothing about how the tests are cut blocks an entry; only an AC with no proof at all does | a hard rule blocks the cases where more is needed; the aim is that it works, not a test count |
| The builder verifies that it works: when the change is on a screen or an endpoint, it runs it once against the local stack (opens the page or calls the endpoint) and reports what it saw in one line (`tried`) | the tests prove the paths the builder thought of; one real try catches what they miss |
| The QAs try to break it when that makes sense: exec-entry runs `qa-frontend (Opus 5.5, medium)` when screen behaviour changed (logic, forms, routes, state, permissions), not for a pure visual, copy or asset tweak (the builder's `screenChange`), and `qa-backend (Opus 5.5, medium)` when the API, data or permissions changed; in doubt, it runs; the session may override. The decision is in the result: `qa: { frontend, backend: run \| skipped, why }`. A QA with nothing worth breaking returns `pass` quickly; the QAs never add tests or judge them | a visual tweak has nothing for a QA to break; the record shows why each one ran or not |
