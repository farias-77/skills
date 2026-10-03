# Parallel plan and local CI: recipes

Copyable patterns behind the checklist in [../SKILL.md](../SKILL.md).
Command names (`make verify`, `make check`, `make gen`,
`test-affected`) illustrate the roles the project's doctrine fills.

## F0, the contract-and-stubs pass, in order

1. **Migrations.** Expansion only, with enums, indexes and grants.
2. **Contract.** Every route or operation, with every input and output
   field, then the generator (`make gen`). Handlers answer "not
   implemented", and no test asserts that answer.
3. **Composition.** Modules registered, config loaded, every secret
   faked in the test env.
4. **Seams.** For each "interface" Need: the type, an in-memory fake and
   a contract suite.
5. **Factories.** One per entity, with unique keys on every call. A
   test-actor helper (for example `actors.New(t, role)`) gives each test
   its own actor.
6. **Exemplars.** One skeleton per new kind of code: layers, file split,
   wiring and test layout, with no behavior.
7. **`uses-check`.** Generated from every brief's `Uses`. Once it
   compiles, the names are fixed.
8. **Proof.** The fast check and the affected tests are green on the
   empty implementation. Entries start the moment F0 is green. F's
   review fixes reach them by merge and never rename anything.

## The contract suite F0 writes

F0 writes the suite; the fake passes it in F0; the real implementation
must pass it in the producing entry. Example in Go:

```go
func RunExporterContract(t *testing.T, newImpl func(t *testing.T) Exporter) {
    t.Run("splits windows over 30 days", func(t *testing.T) { /* … */ })
    t.Run("halves the bucket on 429",   func(t *testing.T) { /* … */ })
}
```

The fake's test calls `RunExporterContract(t, newFake)`; the producing
entry's test calls it with the real adapter. A failure on the real side
means the fake lied, and the fake changes in the same PR.

## Local CI: what runs where

| Where | When | Runs | Trust |
|---|---|---|---|
| Builder worktree, Stop hook | every stop | guard, lint, check, `test-affected`, scan-evidence | none: it only lets the builder stop |
| Queue host | each story → feature-branch merge | merge the base in; `make gen` + `git diff --exit-code`; path guard; affected suites on the merged tree | a queue record |
| Queue host, fresh worktree | once, at the feature branch's top | `make -k verify` | the App posts `verify` on that sha |
| Hosted CI (GitHub Actions) | PR → staging / production branch | trust check (guard, gen diff, lint) + the required app-sourced `verify` | hosted |
| Hosted CI | push to staging / production branch | images by tree hash, OIDC deploy, migrate, staging suite / production smoke | hosted, OIDC |
| Hosted CI, nightly | production branch | full `make verify` in a clean room; alarms on drift | hosted |

For scale, Rails 8.1 reports HEY's suite at over 10 min in the
cloud and "1m 23s" locally, in a claim scoped to "small-to-mid-sized
applications". If the project's doctrine runs the full gate in hosted
CI on every PR, replacing that with a signed local verify changes
doctrine, and the user rules on it.

## The sign-off script (queue host only)

Verifies HEAD in a fresh worktree and posts `verify` as the GitHub App.
`GATE` is the project's full-gate command.

```bash
#!/usr/bin/env bash
# signoff — queue host only. Verify HEAD in a fresh worktree; post `verify` as the GitHub App.
set -euo pipefail
GATE=${GATE:-make -k verify}
[[ -z "$(git status --porcelain)" ]] || { echo "dirty tree"; exit 1; }
sha=$(git rev-parse HEAD); tree=$(git rev-parse 'HEAD^{tree}'); rec=~/.verify/passed/$tree
if [[ -f $rec ]]; then state=success; else
  wt=$(mktemp -d); git worktree add -q --detach "$wt" "$sha"; start=$SECONDS
  set +e; (cd "$wt" && $GATE) >"$wt.log" 2>&1; rc=$?; set -e
  git worktree remove --force "$wt"; state=failure
  if (( rc == 0 )); then state=success; mkdir -p ~/.verify/passed
    printf 'sha=%s cmd=%q rc=%s secs=%s log=%s host=%s %s %s\n' "$sha" "$GATE" "$rc" $((SECONDS-start)) \
      "$(sha256sum "$wt.log" | cut -c1-16)" "$(hostname)" "$(go env GOVERSION 2>/dev/null)" "$(node -v 2>/dev/null)" >"$rec"; fi
fi
GH_TOKEN=$(./app-token) gh api "repos/{owner}/{repo}/statuses/$sha" \
  -f state=$state -f context=verify -f description="$GATE · tree ${tree:0:12}"
[[ $state == success ]]
```

`app-token` mints an installation token from the App's private key, and
that key lives only on the queue host. GitHub's rule for a pinned
check: "If the status is set by any other person or integration,
merging won't be allowed."

## Caching

- **Verified trees.** Kept in `~/.verify/passed/<tree>` and written only
  by the queue. A merge whose tree is already verified does not run
  again (the same idea as keying by `git patch-id`).
- **Images.** Keyed by tree hash.
- **Go.** `GOCACHE` is shared by every worktree. Integration packages run
  with `-count=1`.
- **pnpm, BuildKit, Playwright.** pnpm's store is global, installed with
  `--frozen-lockfile`. BuildKit's cache is shared, and the Playwright
  image is pinned.
- **Cloud sessions.**
  - Keep the setup script under about 5 min so the snapshot caches it
    (it lasts about 7 days and holds files, not processes).
  - Start the stack in a SessionStart hook.
  - On 4 vCPUs, run only the affected suites. The full suite runs once,
    on the queue host (inference).
