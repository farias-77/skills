# Release: the path to production

The project's `operations.md` (its standards book) names the real workflows,
commands and URLs; this file is the shape they follow.

## The trunk

```
feat/<slug> ──PR (local-ci, his ok)──► main ──push──► staging deploy + smoke
                                                      │ green
                     git tag -a vX.Y.Z ──push──► production: the SAME image
                                                 → smoke → 15-min watch
                                                 → GitHub release (green)
                                                 → rollback to the previous tag (red)
```

1. `main` is always releasable: a workstream merges only when finished.
2. Staging runs on every push to `main`. The image is keyed by the
   hash of what builds it, so a commit that does not touch it reuses
   the image, and every sha of `main` gets a green staging.
3. Production is a tag on a `main` commit whose staging is green. It
   promotes that image; nothing is rebuilt.
4. The GitHub release is created by the CI after the watch is green,
   from the tag's annotation. The list of releases is what is in
   production. Agents never create one.

## His go

His go is the route's `/goal`: the release's, or the lets-cook one on
the short route, the hotfix and a legacy repo. It names the merge, the
fixes (`fix/<slug>/*`, and a `revert/*` PR on a hotfix) and, outside a
legacy repo, one `v*` tag.

- The merge into `main` is `gh pr merge <n> --merge --match-head-commit
  <head>`, right after "Up to date before a shared merge".
- The tag is pushed the same way, on a commit in `origin/main`.
- When Claude Code refuses either (its classifier may ask for a human),
  the session sends him the PR link, or the tag and the reason, and the
  merge or the push is his click; that wait is his.

## Taking turns on main

Workstreams coordinate by talking (`SendMessage` to the session named in
`_coordination.md`), and GitHub's state is the tiebreaker.

1. Only one workstream sits between its merge and its green staging. A
   staging deploy running on `main` means someone is there: wait on a
   wakeup, then look again.
2. Before merging, message the sessions in release: "merging <slug>".
   After the green staging: "main is free".
3. **Waiting is not idle.** When another workstream lands on `main`, merge
   `main` into `feat/<slug>` right away and let the gate run while you
   wait (in the cloud when the project has a cloud environment).
4. A peer silent for 15 minutes: the conservative choice is to wait
   for the running staging to finish, never merge over it.
5. The tag needs no turn: the production workflow runs one tag at a
   time and waits for the previous tag's watch.

## The smoke and the watch (CI jobs, not session work)

| | Checks |
|---|---|
| smoke | health and readiness; the sha served; the migrations applied; the read-only journeys; a browser on each frontend's entry routes: zero page errors, a root that is not empty |
| watch, 15 min | every minute: server errors of the new revision, restarts and out-of-memory, readiness, the entry routes answering. It sends its own probes, so low traffic is never read as healthy |
| rollback | traffic and job images back to the previous tag's image, frontends rebuilt from that tag, a smoke. Never the old tag's infrastructure code, never a down migration: the schema only expands, so the old code runs on it |

Alarms go to him by email, P1 and P2 alike. The rollback workflow can
also be run by hand (`gh workflow run rollback.yml -f tag=<tag>`): it
is reversible, so agents may run it. `gh run rerun` is allowed for an
environment red, never on a production run whose `migrate` failed.

## The hotfix

Production is broken or data is wrong now. It enters through
`/lets-cook`, with the same checks and less ceremony.

```
hotfix/<slug> from main → a test that reproduces it: red, then green
→ entry gate green → `reviewer (Opus 5.5, high)` with the security pass ∥ the QAs by surface (Opus 5.5, medium) → PR ready: local-ci once, on the final head
→ up to date (house rule) → merge → staging + smoke → his check on staging, unless he delegated it in the interview
→ patch tag → production, the same image → smoke + watch → GitHub release
```

1. It always branches from `main`.
2. **It goes first.** Message the release sessions: "hotfix merging
   first". A workstream that has not merged yet waits, then merges `main`
   into its `feat` again.
3. A workstream already merged whose release stopped red, or that has been
   silent 60 minutes: the hotfix reverts it through a `revert/<that
   slug>` PR, with one line in
   `_coordination.md`. A revert, never a release branch.
4. If production was rolled back by the watch, the rollback already
   mitigated it; the hotfix is the fix, never a skipped check.

## Legacy repos (`repo: legacy`)

An old repo still live, frozen except for what operations cannot wait
for. A short route or a hotfix runs there with:

- the repo's own doctrine, CI and deploy;
- the house rule "Up to date before a shared merge" against the
  repo's own base, right before the merge;
- through staging when the repo has one; **without staging, one ok
  from him before production**;
- after the deploy, a 15-minute watch by the session itself (health and
  the service's errors, read on wakeups);
- the same day, one parity line in the domain's feature map of the new
  platform: "built in legacy, not in the platform".
