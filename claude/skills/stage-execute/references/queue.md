# The merge queue and local CI

The tech lead is the only one that merges into `feat/<slug>`; only the
project's **signoff command** posts `local-ci` (house rules, "The CI is
local").

## The queue: one entry at a time, the critical path first

```
for each ready entry
  1 base in       feat moved since the entry's gate? merge feat into story/<slug>/<id> (never a rebase)
                  a text conflict → exec-entry update · a generated file → the base's version + the generator
  2 migrations    make restamp when one of the entry's migrations is older than feat's last
  3 affected gate on the entry head (skipped when nothing moved since its green gate)
                  red → exec-entry resume (gate-fix budget; the reviewer reads the delta)
  4 merge         git merge --no-ff into feat, the notes in the body, push
                  the entry's stack down, its worktree removed, its local branch deleted, now
  5 record        board.md, plan.md Status; start what it unblocked
```

1. **Base in.** `git merge --no-ff feat/<slug>` on the entry branch.
   Skip steps 1 to 3 when the entry's head is the head of its green gate
   and already contains `feat` (`git merge-base --is-ancestor feat/<slug>
   <head>`): the merged tree is the tested tree. Write "gate skipped:
   base unchanged since <sha>" on the board.
2. **Migrations** are named by timestamp; each entry owns its own. One
   that lands older than the newest on `feat` is restamped by the
   project's command (`make restamp`), committed as a mechanical commit,
   and the affected gate runs again.
3. **The affected gate** is the project's (`make test-affected
   base=feat/<slug>`) on the merged head, in the entry's worktree.
4. **Paths outside Owns ∪ Extends** go in the merge body with the run's
   reason; they do not block (the reviewer read them).
5. **The merge body** carries the entry's notes; notes never open work.

## Another workstream lands on main

Between two queue merges: `git merge main` into `feat/<slug>`, `make
restamp`, the affected gate, push. Lockfiles are regenerated, never
merged by hand.

## The PR and local CI

When the queue is empty (every entry merged, or parked and already
decided by him):

1. **Open the PR** `feat/<slug> → main` as a draft, as the bot identity
   (`gh pr create --draft`). Body: the entries (a cloud entry with its
   session url), the notes, what stayed out and why.
2. **Mark the PR ready** when his hands-on starts. While the workstream
   iterates (his `A.n` rounds, the `X.n` fixes), each push is checked
   by the affected gate only, as in the queue.
3. **Run the whole gate once, at the end**: after his final ok, on the
   final head of `feat`, on this machine (or in the cloud, `cloud.md`),
   in the background:

   ```
   <the signoff command> <the head of feat/<slug>>
   bash claude/scripts/local-ci.sh --repo <product repo> --ref feat/<slug>   # the fallback
   ```

   It runs the project's whole gate (`make verify`) in a fresh worktree
   with its own stack, and posts `local-ci = success` on that sha, as the
   bot, only on exit 0. A red posts nothing and prints the failing lines.
4. **A red there** opens an `X.n` (below), verified with the affected
   gate; then the whole gate runs once more on the new head. `main`
   requires `local-ci` on the head that merges, so the last run is
   always on the final head.

## Local CI red

| Red | What happens |
|---|---|
| a test **outside** the diff | run local-ci once more. Green: flaky; an `X.n` fixes it, as below. A flaky seen for the first time in this workstream is this workstream's: fixed, never deleted |
| anything else | one `X.n` per failing area (failures with no file in common run in parallel): exec-entry `fix`, the reviewer reading it, then the queue (the affected gate) and the whole gate once more on the new head |
| red twice on the same area | the tech lead decides: a smaller fix, a re-cut, or it goes to him with the evidence |

Never a retry setting, a quarantine tag or a skip to get green.
