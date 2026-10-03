---
name: pack-parallel-plan-local-ci
description: Cutting an approved design into a wide build graph that many coding agents run at once, and designing or running the local gate that says "green" before a merge; read it when writing or reviewing a plan, a foundation entry, entry briefs, or the merge queue and its sign-off.
user-invocable: false
---

# Pack: parallel plan and local CI

## When this pack applies

Use this pack in two situations:

- You are cutting an approved design into a build graph that many
  coding agents run at once: the plan, the foundation entry F and the
  entry briefs.
- You are writing or running the gate that says "green" before a
  merge, and that gate runs on the agents' own machine (local, a big
  cloud box, or cloud sessions) instead of in hosted CI.

The project's doctrine names the commands for each role (gate, fast
check, affected tests, generator, migrations), the shared files, the
branches and the measured parallelism cap; `make verify`, `make gen`
and `test-affected` here are illustrations.

## Principles

1. **Interfaces make the graph wide; tickets do not.** An entry that
   needs another entry's behavior proves itself against F's interface
   plus a fake that has passed a contract test. *Why:* in practice,
   every long critical path is a chain of waits for real behavior.
2. **The serial head is thin.** F holds only what two entries would
   both write. *Why:* a fat F holds the stage while the other slots
   sit idle.
3. **One writer per vertical slice, and the slice fits one fresh
   context.** *Why:* Pocock's tracer bullets; Cognition's "writes stay
   single-threaded"; large entries take more review rounds than small
   ones.
4. **Make hot files cold instead of locking them.** One file per thing,
   plus a generated aggregate. *Why:* under locks, Cursor's 20 agents
   fell to "the effective throughput of two or three"; in a 2026
   preprint, file claims "serialized 96.7% of executions".
5. **Fix every name that crosses an entry boundary before entry writers
   start, and let a compiler check it.** *Why:* a name missing from a
   frozen file is the largest class of mid-stage amendments.
6. **A test creates the data it spends.** *Why:* seed data shared
   across test projects breaks under parallel runs.
7. **A planner owns the graph; workers never coordinate with each
   other.** *Why:* Cursor's flat peers "became risk-averse"; splitting
   planners from workers scaled to hundreds of agents.
8. **Schedule the critical path first, up to the measured cap.**
   *Why:* any list schedule finishes within 2 − 1/m of the optimal
   makespan (Graham); longest remaining path first is the usual
   priority.
9. **The gate is a command, not a place.** *Why:* Rails 8.1's `bin/ci`
   is meant "to be run either locally or in the cloud".
10. **A green is trusted for who ran it and on which tree.** *Why:*
    "any person or integration with write permissions" can set a GitHub
    status unless the check is pinned to one app; SLSA L2 excludes "an
    individual's workstation".

## The checklist

**Graph (the plan)**
1. Every edge names the behavior it consumes, and why an F interface
   plus a fake cannot stand in. Only two reasons qualify: a journey
   drives the other entry's UI, or a check reads that entry's real
   side effect.
2. No edge exists for data (a factory provides it) or for an interface
   F declares (a fake provides it).
3. A journey that crosses entries lives in the entry that merges last,
   or in one integration entry `X-int` of size S. It never holds a whole
   entry back.
4. After F, the graph is at most 2 edges deep, and the first step is at
   least as wide as the measured cap (inference).
5. The critical path is marked, and it is at most F + 2 × L.
6. Each entry is at most L: one screen with its states, one server
   flow, at most 8 ACs, about 2,500 changed lines (inference; the
   project's doctrine may set its own ceiling).
7. Each entry declares `Owns`, the globs it creates or edits. Two
   entries with no edge between them own disjoint paths. Shared
   additions go only to append-safe files, listed under `Extends`.
8. No entry is a horizontal layer ("the backend of X", "the types",
   "the adapters").
9. `plan-lint` is green: no cycle, every `Uses` has a producer, and no
   `Owns` overlap exists without an edge.

**Foundation**
10. F0, the serial part, holds only: migrations; the contract and its
    generated code; the registry and wiring; config and the test env;
    the cross-entry interfaces, each with its fake and contract suite;
    the factories; one exemplar skeleton per new kind of code.
11. F0 is at most one L of hand-written code (inference). Harness
    extras, docs and extra fake modes go to a parallel lane `F-x`, or
    to the first entry that needs them.
12. Every `Uses` name appears in F's `Provides`, with its producer.
    `uses-check` is a generated file that imports every such name; it
    compiles on F's branch before any entry starts.
13. Each cross-entry interface has a contract suite. It runs against
    the fake in F0, and against the real implementation in the
    producing entry (Fowler's ContractTest: a failure "implies you need
    to update your test doubles").
14. No F test asserts a stub's "not implemented" or 501.
15. The walk holds: every screen field and every route input is in the
    contract; every config key and secret is in the loader and the test
    env; each route's deadlines sum to less than the write timeout,
    with a margin; every test owns its data.
16. Factories return fresh records with unique keys, and no journey
    mutates a pre-seeded record (Playwright: "Each test should be
    completely isolated from another test").
17. Every open rule of the test setup (themes, widths, workers,
    conventions) is decided before the build stage starts.

**Hot files**
18. The contract is one file per path, bundled by the generator
    (inference). Two entries that add routes never touch the same lines.
19. Migrations either all go in F0, or each entry adds its own under a
    timestamp version and the queue renumbers them (goose's "hybrid
    versioning": `create` without `-s`, `fix` in the queue).
20. The feature map and the docs are per-entry fragments that the queue
    assembles (the changesets pattern), or one row per file.
21. Generated files are never merged by hand. The queue regenerates
    them and fails on any diff.
22. The queue refuses a merge that touches a path outside
    `Owns ∪ Extends`.

**Local CI**
23. The builder, the queue and the hosted CI share one entry point. The
    hosted CI runs no step the gate command lacks.
24. The builder loop is a Stop hook: guard, lint, check, affected tests
    against the feature branch, scan-evidence. It never runs the full
    gate. Rails calls `bin/ci` "your final check"; "for everyday
    dev/test, use targeted" tests.
25. The queue lands one entry at a time: (1) merge the base in, never
    rebase; (2) test the **merged** tree with the affected suites;
    (3) merge with `--no-ff`. That merged-result check is all a merge
    queue guarantees; Brun et al. found 33% of merges git reported as
    clean were build or test conflicts.
26. The full gate (`make -k verify`) runs once per stage, in a fresh
    worktree at the feature branch's top, with the stack recreated.
27. Only the queue host posts the `verify` status, through a GitHub
    App. Branch protection pins that app as the expected source. No
    agent environment holds the app key or any token that can write
    statuses.
28. The sign-off record holds the sha, tree hash, command, exit code,
    duration, log digest, host and tool versions. A re-run is skipped
    only when the tree hash is identical. Only the queue writes these
    records (Bazel: only "your CI system" should write the cache).
29. These stay remote: OIDC-federated deploys (the token is issued to a
    hosted workflow); environment secrets and approvals; infrastructure
    applies; the staging suite and the production smoke; image
    provenance (SLSA L2); dependency-update PRs; a 2–3 min trust check
    on PRs to the staging and production branches.
30. Integration tests that read a database bypass the test cache (Go:
    `-count=1`); a test cache keys on binary, flags, files and env,
    never on database state.
31. Heavy suites take a load slot (`flock`), and the cap comes from
    measured pressure (`/proc/pressure` on Linux), not from core count.
32. Stop hooks plan for the documented cap of 8 blocks
    (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`), not a smaller assumed number.

## Anti-patterns

- **Slicing by layer.** Pocock cites a 26-ticket layer stack that took
  "roughly twenty agent runs per closed ticket, about three quarters of
  them rework".
- **A fat foundation.** One builder works through well over a hundred
  files while every slot idles.
- **Freezing everything F created.** Tokens, props, enum values and a
  fake's modes are additions, not contracts; freezing them breeds
  amendments.
- **Peer locks or claim files on code.** Cursor's agents "would hold
  locks for too long, or forget to release them". Anthropic's C
  compiler made claim files work only because its tasks were disjoint
  failing tests; when 16 agents met one bug, they "overwrite each
  other's changes".
- **An integrator agent every change passes through.** Cursor dropped
  it as "more bottlenecks than it solved"; a scripted serial queue is
  fine.
- **An edge, or a fan-in, on implementations.** An entry waiting hours
  for adapters whose types F already closed, lacking only fakes and
  contract suites.
- **Parallel builders naming one thing twice.** Pocock reports
  `blockedSince` and `blockedOn` for the same string. Fix the names in
  F. Across agent PRs, textual conflicts run 41.7% between different
  agents and 19.8% within one (arXiv preprint).
- **Stub-pinning tests and mid-stage rule changes.** Either one sends
  finished entries back, or costs hours on the critical path.
- **A broad review mid-graph, or over-decomposition.** Mid-graph,
  "every unbuilt ticket reads as a failure"; over-decomposition looks
  like "twelve tickets for a three-line change".
- **A green that is only a claim.** "Tests pass" in an agent message,
  or a status posted with a token any agent shell can read.
  gh-signoff "doesn't run any tests"; it posts what its caller says.
- **`act` as CI parity.** It ignores `concurrency`, `permissions` and
  `environment`, and has no OIDC. Use it only to debug a workflow file.
- **Pre-push hooks as the trust anchor.** `--no-verify` and
  `LEFTHOOK=0` bypass them; they are a convenience.
- **The full gate on every entry.** Affected suites per entry; the
  full gate once per stage.

## Core recipes

**From a design to a graph of maximal width**

```
1 units     one per story; group 2–3 only if they share a screen/flow and cannot prove alone
2 needs     per unit: Needs (names and behaviors from others) and Provides
3 classify  each Need →
              shared file (migration, contract, registry, config)          → F0
              data (a customer, an order)                                  → factory in F0 · no edge
              behavior behind an interface (adapter, domain service)       → interface + fake + contract suite in F0 · no edge
              UI behavior a journey drives (a button another entry builds) → edge, stacked; or the journey moves to the last merger
              end to end across ≥ 3 units                                  → X-int (S) after them
4 size      S/M/L; split any L on the critical path into thinner vertical slices; shared part → F0
5 levels    bottom(n) = size(n) + max bottom(successors); critical path = max from F
6 widen     each edge on the critical path: fake it (step 3) or stack it; recompute
7 accept    depth after F ≤ 2 · first-step width ≥ cap · no Owns overlap without an edge
8 schedule  ready set by bottom level, descending, up to the measured cap;
            an entry starts on its producer's branch once that one is `ready` (stacked)
```

**F0, in order:** migrations → contract + generator → composition →
seams (type, fake, contract suite) → factories → exemplars →
`uses-check` → proof (fast check and affected tests green on the empty
implementation). Entries start the moment F0 is green; F's review
fixes reach them by merge and never rename anything.

**Rules that prevent amendments**

| Class | Rule | Mechanical check |
|---|---|---|
| Name missing from a frozen file | F's writer goes first, with `Provides`; entries copy `Uses` verbatim | `uses-check` compiles |
| Addition to a non-frozen F file | freeze only migrations, contract, generated code and registry; extend the rest by addition | queue path guard; duplicate-symbol lint |
| Shared seed or per-project target | each test creates what it spends | lint: no fixed seed ids in journeys |
| Stub pinned by an F test | no test pins a stub | grep of F's tests for `ErrNotImplemented\|501` is empty |
| Duty with no owner | every `Uses` line has a producer | `plan-lint` |
| Deadline budget | per-route sum below the write timeout minus a margin | a table in F plus a test at the limit |
| Rule changed mid-stage | the ruler is closed before the build; a new ruling waits until the critical entry is `ready` | the pre-flight has no open item |

**Local CI:** the builder's Stop hook runs targeted checks and
proves nothing; the queue host proves each merged tree and, once per
stage, runs the full gate and posts the app-pinned `verify`; hosted CI
keeps deploys, secrets and a short trust check. Replacing a hosted
full gate with a signed local one is a doctrine change: the user rules
on it.

The F0 pass step by step, the contract-suite shape, the where-runs-what table, the
sign-off script and the caching rules are in
[references/recipes.md](references/recipes.md); tools and versions in
[references/tooling.md](references/tooling.md); sources in
[references/sources.md](references/sources.md).
