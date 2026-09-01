# The git standard

History is a record of intentions, not a diary of keystrokes. Every
commit tells what changed and why; every branch name tells what it
carries; every merge is deliberate.

## Commits

| ID | Rule |
|---|---|
| git.1 | **Conventional Commits, always:** `<type>(<scope>): <imperative summary>` — types `feat` · `fix` · `chore` · `refactor` · `docs` · `test`. The summary describes the change, not the activity ("add invite expiry", never "work on invites"). |
| git.2 | **Atomic:** every commit compiles and passes on its own. A vertical change lands in readable steps — contract, tests, implementation, wiring — each one green. |
| git.3 | The body carries the **why** when it is not obvious from the diff; the footer links the work (`Closes #N` on the PR's final state). No decorative bodies. |
| git.4 | Commit messages are written in English, like everything in the repos. |

## Branches

| Branch | Named | Cut from |
|---|---|---|
| Feature branch (one per repo per wave) | `feature/<workstream>-wNN` | `main` |
| Issue branch | `issue/<NN>-<slug>` | the feature branch |
| Chore (hygiene, tooling) | `chore/<slug>` | wherever it lands |
| Hotfix | `hotfix/<slug>` | **`origin/main`, always** — never a local checkout, which may be sitting on another branch's world |

`main` never receives work directly — everything lands via PR under
branch protection (the CI standard). The feature branch is the wave's
integration surface: issue PRs merge into it, and it only reaches
`main` after the wave's e2e round is clean.

## Merges

| ID | Rule |
|---|---|
| git.5 | **Rebase merges, linear history.** No merge commits, no squash — the atomic commits ARE the story; squashing erases it. |
| git.6 | **A merge only counts when re-read:** after merging, confirm the PR state is actually `MERGED` — a merge command can exit clean with the PR still open (stale base). Acting on the exit code alone has marked unmerged work as done. |
| git.7 | **Conflicts are resolved by intention, not by text.** Both sides of a conflict are the team's work: read each side's commit message and issue before choosing a line — resolving mechanically silently erases a colleague. Never abort a conflicted merge to "deal with it later": unwinding just moves the bomb to the next merge. |
| git.8 | **Who merges is who conducts:** an issue PR is merged by the repo's conductor after the full gate (lenses and judge, verification, CI) — never by the agent that wrote it. |

## Hygiene

- Worktrees for parallel issue work — the main clone stays untouched;
  a worktree is removed when its issue closes, success or failure.
- No force-push on shared branches, ever (protection enforces it).
- Nothing generated gets committed: build output, coverage reports and
  lockfile churn outside the change's scope stay out of the diff.
