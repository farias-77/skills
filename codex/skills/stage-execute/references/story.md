# The story

One row of the goal (`N.k`): one story in one repo. It goes from the
goal to a merged PR on the wave branch through five steps, in order.
Every step writes one line in `trace.md`.

## 1. Build

Spawn a builder ([team.md](team.md)) with the row's section of the
goal verbatim, the design pointers it names, the repo path, the story
branch name `feat/wNN-<repo>/<N.k>-<slug>` cut from `feat/wNN-<repo>`,
and the attribution trailer. The builder writes the unit tests first,
then the code, then the smoke cases the row's "ready when" names,
runs lint, build, tests and synth, commits in conventional atomic
commits, pushes the branch, and reports: the commit list, the choices
made where the documents were silent, the evidence of its own runs.

The builder is Luna at max effort. It is escalated to Astra at low
effort only after it failed the story twice ([team.md](team.md));
read its report as a claim and check the runner's lines it pastes
against the branch before the lenses run.

## 2. Review, twice

Round 1: the five lenses in parallel on the whole diff of the story
branch against the wave branch. You rule every finding
([review.md](review.md)) and write `reviews/<N.k>/round-1.md`. Send
the builder the sustained and deferred findings with your ruling and
the fix each names; it applies them and reports the changed lines.

Round 2: the five lenses in parallel on the delta since round 1, with
round 1's findings and rulings in their assignment. You rule again,
write `round-2.md`. What is still sustained rides as a note on the PR
and in the report. There is no round 3.

## 3. Prove in alpha

If the row deploys (API, infra, seed): run the repo's diff against
alpha, read every deletion, deploy the story branch to alpha, run the
smoke folder the row's "ready when" names, the bad paths included.
Save the runner's output in `proof/<N.k>-smoke.txt`.

If the row is a front: run the dev server against the alpha API and
render the screens the row names in both themes and at 390 px; save
the screenshots in `proof/<N.k>-<screen>-<theme>.png`.

Red: the builder fixes on the story branch, the five lenses read the
fix delta once, you rule, redeploy, run again. Two red runs on one
story stop the story; the third is a wave stop.

## 4. The PR

`gh pr create` from the story branch into `feat/wNN-<repo>`, title
conventional (`feat(<scope>): <what>`), body from
[templates/pr-story.md](../templates/pr-story.md): what it delivers,
the commit list, the review numbers per round, the notes, the proof
lines, the choices where the documents were silent. Owner from
`git remote -v`. Wait for CI; red CI is a builder fix and one lens
pass on the delta; the third red CI run stops the story.

## 5. Merge

Rebase merge (`gh pr merge --rebase`), then read the PR state back:
the merge counts only when it says `MERGED`. A conflict is resolved by
intention: read both sides' commits before choosing a line. Remove the
story worktree if one was used. Append the story's row to `report.md`
and its line to the Status column of `waves.md`.

## Parallel stories

Two rows the goal marks `∥` run steps 1 and 2 at the same time, each
its own builder and lenses. Step 3 runs one at a time per repo. The
first one merged is rebased under the second before its PR.
