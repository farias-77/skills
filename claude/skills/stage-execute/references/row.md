# The row loop — what a worker does with one row

One row is one story in one repo, on one branch, built by one builder,
read by five lenses, merged by one PR, proved by one command in alpha.
The worker runs this loop for every row of its lane in the order the
goal lists them, and never waits for another lane. The loop ends when
the row file is complete and the master has its line.

## 1. Open the row

- `03-execution/rows/<repo>/<N.k>.md` from
  [templates/row.md](../templates/row.md), the header filled (row,
  story, wave, goal section, `date -u`). This file is the checkpoint:
  every step below writes its line here as it ends, so a session that
  dies resumes from it.
- The branch: `git fetch`; `feat/<workstream>/<N.k>-<slug>` from the
  top of `feat/<workstream>`. When the goal says `after: <N.j>` and
  the PR of `<N.j>` has not merged yet (a freeze, a suite), cut from
  `<N.j>`'s branch instead and open the PR against it: a stack. Write
  which in the row file.
- The brief for the builder is the goal's `### N.k` section, as is,
  plus the paths: the goal file, the design folder, the recon, the
  repo, the branch, the wave's proof folder, the attribution trailer.
  The worker adds nothing the goal does not say and answers no
  question the goal does not answer: a value the goal and the design
  do not fix is the builder's simplest consistent choice, listed in
  its report under "choices".

## 2. Build and round 1

Run [`exec-row`](../../../workflows/exec-row.js) by `scriptPath`,
never by name, with `mode: 'build'`, the paths above, `row`, `branch`,
`base` (the branch the PR will target), `lenses: all`. The workflow
dispatches one `exec-builder` (Opus 5, high): tests first, then the
code, small conventional commits, one concern each; lint, build and
tests green on the branch; synth for both stages when there is
infra; pushed. It returns the commits, the checks and its choices.
Then the five lenses (Sonnet 5, high) read `git diff <base>...<branch>`
in parallel, each with the goal section and its own material, and
return findings under the reviewer contract. The workflow returns
`{ mode, build, round: 1, findings, lenses }`.

Save the return value as it came in `reviews/<repo>/<N.k>/r1.json`.

## 3. Judge

By [judging.md](judging.md): merge by fix, then sustained / deferred /
dismissed with the owner: `builder` (fixed now), `note` (rides), or
`master` (parked, one line). Write `reviews/<repo>/<N.k>/r1.md` from
the template before any fix moves: per finding the id, lens,
severity, ruling, owner, reason with the quote. A builder's choice the
lenses did not contest is not a finding: it goes to the row file as
a choice.

## 4. Fix and round 2

Run `exec-row` with `mode: 'fix'`, the same paths, `since` (the head
sha after round 1) and `fixes: [{ id, fix }]` — the sustained and
deferred findings, each as the concrete change the lens proposed or
the worker rewrote. The builder applies them on the same branch, one
commit per finding where the fix is separable, lint, build and tests
green, pushed. Then the lenses read only `git diff <since>...<branch>`
and check that each fix landed and did not break its surroundings;
a finding on text no fix touched needs the razor at full strength.
`lenses: all` again, or `lenses: text` (fidelity, code, proof) when
the delta touches only user-visible strings and tests: the row file
says which and why. Judge the same way. There is no round 3: what
is still sustained after round 2 is applied by the builder once more
without a lens only when it is a one-line change the worker verifies
on disk; everything else rides as a note.

**One class has no latitude:** a change to a test expectation or a
smoke assertion always goes through a lens, however small; the worker
never applies one itself.

## 5. The PR

`gh pr create` into `feat/<workstream>` (into `<N.j>`'s branch when
stacked). Title as the repo's `git.md` says. Body from the row
template's PR section: the story and the row, the rounds as numbers
(findings · sustained · deferred · dismissed), the choices, the notes
that ride, the proof line to be filled after the merge, the
attribution trailer. Wait for CI. Red CI: back to the builder as a
first red; the second is a new brief; the third parks.

## 6. Merge, deploy, prove

- Read `03-execution/freeze.md`. This repo's stack listed: do not
  merge; go to 1 with the next row (stacked on this one when it needs
  it) and come back when the master's `unfrozen` line arrives.
- Merge as `git.md` says. The merge deploys through CI; wait for the
  deploy to end (this is the one wait in the loop). Read the deploy
  output whole: a diff with a removal the goal does not name is a
  parked line, not a shrug.
- The first row of a wave that deploys on this stack runs its proof
  alone, before any other row is merged on top: smoke of the smoke.
  Later rows may stack their PRs and prove once on the union when the
  plan marks them `∥`.
- Run the row's `run` exactly as written; save the output to
  `03-execution/<wNN>/proof/<N.k>-<name>.txt`; compare with `expect`
  word for word, count for count. `see`: the screen against the alpha
  API, both themes, 390 px, the screenshot saved to the proof folder
  at the path the goal names; the row file says what was seen and the
  artboard it matches.
- Red in alpha: a fix row `<N.k>.f1` from the top of the lane branch,
  through this whole loop (build, lenses, PR, merge, proof); never a
  rollback, never a force push, never a fix committed straight to the
  lane branch.

## 7. Close the row

- The row file complete: branch, PR, the rounds, the proof line with
  the file, the choices, the departures from the standard (each with
  the rule it leaves and why the system got simpler), the notes that
  ride, the stops, the attempts (1, 2 or 3).
- `blueprint/execution/lanes/<repo>.json` updated with this row
  ([schema](../../../blueprint/schema/execution.md)); the file is the
  lane's, rewritten whole each time.
- One line to the master: `row <N.k> merged · <repo> · PR #<n> ·
  <proof line> · 03-execution/rows/<repo>/<N.k>.md`.
- Next row. When this was the last row a wave requires from this
  lane: the suite (SKILL.md step 2) first, then the next row's build.

## What a worker never does

Edits `waves.md`, `rulings.md`, the goals, the blueprint outside its
lane file, or commits the designs repo. Deploys a row branch. Merges
on a frozen stack. Applies a test-expectation change without a lens.
Asks the user. Waits for the master to go on with its lane.
