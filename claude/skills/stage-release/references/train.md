# The train — from the goal to production

Five steps, in this order, every one a trace line as it ends. The
order between repos is the design's `rollout.md`; without one,
producer-first (APIs → agents → fronts). Two lanes by the flag the
venture declares in each repo's `CLAUDE.md`: **Lane A** where merge
and deploy are separate acts (backends, agents); **Lane B** where the
hosting builds prod from `main` (a front on Amplify), so the merge is
the deploy and happens in the train, after its producers are live.

## 1. Integrate

Per repo, in order:

- `git fetch`; if `main` moved since the branch was cut, rebase
  `feat/<workstream>` onto `main`, conflicts by intention (the git
  standard), then lint, build and unit tests on the rebased branch
  (P-12) before anything else; push.
- Open the PR `feat/<workstream>` → `main`. Body: the waves and their
  stories, the wave PRs, the audit, the blueprint URL, the attribution
  trailer. Title as the repo's `git.md` says.
- CI is an external wait: `gh pr checks <n> --watch` in a background
  Bash, and end the turn; the exit wakes the session. Red CI on the
  integration PR is a red confirmation (step 2's fix loop), never a
  retry.
- **Lane A:** rebase merge, then re-read the state as `MERGED` (git.6)
  and record the `main` sha. **Lane B:** stop here; the PR stays open
  and green until its train step.
- A conflict or a red stops the train at that repo: the consumers
  behind it do not integrate until it does.

## 2. Confirm from `main`

Per Lane A repo, on `main` at the merge sha (a Lane B repo confirms
on its branch head, since its `main` is the deploy):

1. **Is anything different?** `git diff <audited head> <merge sha>
   --stat` and the repo's alpha diff from `main` (`diff:alpha` or what
   the recon names), every line read. Both empty ⇒ **the audit's green
   stands** (P-17): the trace line says "tree identical to `<sha>`,
   alpha diff empty, suite of <date> stands". Either not empty ⇒
   `deploy:alpha` from `main` (the inheritance pre-check first: a
   stateful deletion the integration does not explain is another
   workstream's and stops this repo) and the **whole suite**, output
   to `04-release/proof/suite-<repo>.txt`.
2. A red suite is a fix: row `R.n` from `main` ([fix.md](fix.md)),
   merged into `main`, then this step again. Two cycles; the third red
   stops the stage (SKILL.md "where it stops").

## 3. Version

Run [`release-version`](../../../workflows/release-version.js) by
`scriptPath` with the repos and their integrated shas (Lane B: the
branch head; its final sha exists only after the merge, and the tag
waits for it). One `release-scribe` (Sonnet 5, high) per repo, in
parallel, returns the last tag, the bump, the version and the notes
file it wrote under `04-release/notes/<repo>.md`, plus every commit
that did not parse as conventional. The version the plan expected and
the one derived differ ⇒ a trace line, the derived one wins.

## 4. Rollback, tags, Releases

- `04-release/rollback/<repo>.md` from
  [templates/rollback.md](../templates/rollback.md), per repo, before
  any tag: the version to return to (the last tag, or the state before
  this demand when there is none), the exact way back as commands, the
  data considerations, how the way back is verified. A way back that
  is not code-only is a stop: the plan named it; the session stops
  here and calls him, prod untouched.
- Tags on the integrated shas (`git tag -a vX.Y.Z <sha>`), pushed;
  `gh release create` with the notes file. **A tag is what goes up,
  never retroactive**: prod deploys from the tag. Lane B: tag after the
  merge, on the merge sha, before its checks.

## 5. Cutover

One repo at a time, in the rollout's order, the user absent:

- **Lane A:** `git checkout vX.Y.Z` → the repo's `deploy:prod` under
  its guard (the stacks the rollout names for this step, not more) →
  the rollout's checks for this step, read-only, each command's output
  saved to `04-release/proof/train-<step>.txt`, compared with the
  expected value word for word.
- **Lane B:** merge the prepared PR (rebase merge, state re-read) →
  the hosting's build awaited as an external wait → tag the merge sha,
  Release → the live checks (routes served, the version stamped).
- A step whose rollout line says `(gate: needs the user)` was a
  pre-flight line; the session does what the delegation said and
  reads the same check. Missing delegation ⇒ this is a red.
- **Red step:** the documented rollback of that repo, executed and
  verified by the same checks, trace line; then row `R.n`
  ([fix.md](fix.md)) from `main`, merged, a patch tag, and the step
  again from the tag. Two fix cycles per step; the third red stops the
  stage with prod verified in the rolled-back state.
- **Prod stays clean:** no suite, no test data, no test account, no
  write that exists to prove something. A check that must write to
  prove itself was an alpha check, already paid in step 2.

When the last repo's checks are green the train is closed: a trace
line with every repo's version and sha in prod, and the watch begins.
