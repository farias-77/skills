# The wave

One wave is one checkpoint: one feature branch per repo, deployed to
alpha, the whole smoke suite green, one PR per repo merged into the
workstream branch `feat/<workstream>`. Waves chain through that
branch: the next one is cut from it, with every earlier wave inside.

## Open

1. Read the goal whole (`02-plan/goals/wNN-<slug>.md`), the wave's
   section of `waves.md` (rows, Parallel, Out, Stays with the user),
   and the parts of `01-design/` the goal points at. Read each repo's
   `CLAUDE.md`, or `AGENTS.md` where it exists, and the `docs/` pages
   the goal names. The standards under `.codex/docs/standards/` are
   the ruler for everything you and your agents write.
2. In every repo the goal names: `git fetch`. On the first wave, cut
   `feat/<workstream>` from `main` and push it. Then cut
   `feat/wNN-<repo>` from `feat/<workstream>` and push it. If the wave
   branch exists, it is a resume: read `trace.md` and the open and
   merged PRs on it before doing anything.
3. Create `03-execution/wNN-<slug>/` with `trace.md` and `report.md`
   from the templates, and `proof/`. First trace line: the wave
   opened, the branches, the base sha per repo.
4. `.state.md`: `stage: execute`, `chair: codex`, `wave: wNN-<slug>`.

## Build

The rows of the goal, in its order; pairs the goal marks `∥` together.
Each row goes through [story.md](story.md). You decide how many
builders run at once; the goal's deploy order and its "Depends on"
column are the only constraints. Two stories in the same repo can be
built in parallel on their own branches, but their alpha proofs run
one at a time, because alpha is one stage per repo.

A front row has no alpha: it is proved on the dev server against the
alpha API, in both themes and at 390 px, with screenshots in `proof/`.

## Prove

When the last row is merged into the wave branch:

1. Deploy the wave branch of every repo that deploys, in the goal's
   order. Before each deploy, run the repo's diff against alpha
   (`diff:alpha` or what its `CLAUDE.md` names) and read every
   deletion. The diff should be empty or explained by this wave.
2. Run the whole smoke suite of every repo against alpha
   (`./smoke/run.sh` at the repo root, or what its `CLAUDE.md`
   names). Save the runner's output in `proof/smoke-<repo>.txt`.
3. Do the walk in the goal's "The wave's proof" and save its evidence
   in `proof/`: screenshots of the screens, the resource listings, the
   responses.

Red means a fix story: a row named `N.f<k>` in the trace, built
through the story cycle whole (builder, two review rounds, alpha),
then the affected repo redeployed and the whole suite run again.
Three red suite runs in one wave stop the wave.

## Close

1. One PR per repo from `feat/wNN-<repo>` to `feat/<workstream>`,
   body from [templates/pr-wave.md](../templates/pr-wave.md). CI
   green, rebase merge, the state read back as `MERGED`. The
   workstream branch now carries every wave so far.
2. `waves.md`: fill the Status column of every row
   (`done <date> — PR <url>`) and of the wave; a row that changed
   shape gets one dated line under Amendments.
3. `report.md` complete: every section of the template filled from
   the trace, the reviews and the proof.
4. `blueprint.html`: fill `waves['wNN-<slug>'].execution` following
   the shape in the shell's comment, in the language of the page.
   Numbers from `report.md`; the smoke output and the central proof
   verbatim but trimmed. The Claude chair republishes the URL later.
5. Commit the workstream folder (the `designs` repo) with a
   conventional message. Push only if the user said so.
6. `.state.md`: `wave:` moves to the next wave of `waves.md`.

Then open the next wave from the workstream branch. When there is no
next wave: deploy `feat/<workstream>` of every repo to alpha in the
last goal's order (the diff should be empty), run the whole suite once
more, set `.state.md` to `phase: audit · chair: fable`, commit, and
stop. Tell the user the workstream branch is consolidated and verified
and that the audit runs in the Claude chair with
`/stage-execute <workstream-slug>`.

## The fix wave

The audit writes what it wants changed as rows `A.1`, `A.2`… in the
Fixes section of `03-execution/audit.md`, in the goal's row format,
and sets `.state.md` to `phase: fix · chair: codex · wave: wNN-audit`.
That section is the goal of one more wave: branch `feat/wNN-audit-<repo>`
from `feat/<workstream>`, the story cycle per row, the wave's proof
(the whole suite), the PR merged into the workstream branch, its own
`03-execution/wNN-audit/` folder and report. At its close, `phase:
audit` again. Two fix waves are the budget; a third request is the
user's call, not yours.

## Stop

Stop and report to the user only when:

- the third red run of the whole smoke suite in one wave;
- a story needs something from "Stays with the user" that has no
  placeholder the goal allows;
- a deploy diff shows a stateful resource deletion this wave does not
  explain (another workstream's inheritance);
- the third red CI run on one PR;
- the goal or the design contradicts a repo in a way that changes
  what the wave delivers.

Everything else is yours to decide, recorded in the report. The
report to the user says the wave, the story, what was tried, what you
need. Then wait.

## Resume

A new session reads `.state.md`, the wave's `trace.md`, the branches
and PRs on GitHub (`gh pr list --base feat/wNN-<repo> --state all`),
and `reviews/`. A story with a merged PR is done. A story with an open
PR continues from the step the trace names. A story branch with
commits and no PR continues from the review round the trace names, or
from round 1. Nothing is rebuilt from memory.
