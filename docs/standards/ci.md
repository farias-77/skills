# The CI standard

Every repo runs the same pipeline for its type. An agent debugging a
red check in any repo sees the same jobs, the same names, the same
commands — and a green CI means the same thing everywhere.

## The one principle

**CI runs the canonical npm scripts and nothing else.** No CI-only
logic, no gate that exists only in YAML: anything CI checks, an agent
reproduces locally with the exact same command (`npm run lint`,
`npm test`, `npm run synth`). The guard passes through on `$CI`, so
the scripts are identical on both sides. If CI is red and local is
green, the difference is environment — never a hidden step.

## The jobs, per repo type

One workflow: `.github/workflows/ci.yml`, triggered on every
`pull_request` (which covers PRs into feature branches AND into main)
— never on direct pushes, because direct pushes don't exist (below).

| Repo type | Jobs | Each runs |
|---|---|---|
| **API / agent** | `app` | `npm ci` → `npm run lint` → `npm run build` → `npm test` → `npm run test:integration` (in `app/`) |
| | `infra` | `npm ci` → `npm run build` → `npm run synth` (in `infra/`) |
| **Front** | `app` | `npm ci` → `npm run lint` → `npm run build` (at the root) |

The coverage threshold is enforced by the test config (the testing
standard's test.6), not by CI arithmetic — `npm test` simply fails
when coverage drops. Lint runs with zero warnings tolerated.

### Skeleton (API repo)

```yaml
name: ci
on: pull_request
concurrency:
  group: ci-${{ github.ref }}
  cancel-in-progress: true
jobs:
  app:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: app } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm, cache-dependency-path: app/package-lock.json }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test
      - run: npm run test:integration
  infra:
    runs-on: ubuntu-latest
    defaults: { run: { working-directory: infra } }
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version-file: .nvmrc, cache: npm, cache-dependency-path: infra/package-lock.json }
      - run: npm ci
      - run: npm run build
      - run: npm run synth
```

`concurrency` cancels superseded runs on the same branch — a fix
pushed mid-run never waits behind the commit it replaced. The Node
version is pinned once per repo (`.nvmrc`), read by CI and by humans
alike.

## What CI does NOT do

- **No smoke, no e2e** — both need the deployed staging environment
  and credentials; they belong to the pipeline's environment phase,
  not to CI.
- **No deploys** — deploys are conducted (staging by the pipeline's
  environment conductor, prod only at the release stage). CI proves
  the code; it never touches an environment.
- **No infra tests** — the infra job ends at synth; the diff protocol
  lives in the PR (testing standard §2).

## Branch protection

On every repo, `main` and the active feature branches are protected:

| Rule | Setting |
|---|---|
| Direct pushes | blocked — everything lands via PR |
| Required checks | every job of the type's pipeline (`app`, `infra`) green before merge |
| Force pushes / deletions | blocked |
| Merge method | rebase (linear history — the git standard) |

The feature branch is protected the moment it is created (the repo
conductor's first act), so issue PRs get the same gate as main.

## CD — the named seam

Today, deploys are conducted by the pipeline; CD is coming. When it
arrives it enters as its own workflow (`cd.yml`) beside this one, and
the boundary is already drawn: **CI proves the code, CD moves it** —
CD triggers on merge, promotes through environments, and never
re-defines a gate CI owns. Nothing in this standard anticipates its
mechanics; this section is the seam it plugs into.

## The contract with the pipeline

The impl-issue workflow treats CI as a bounded gate: it checks the
PR's mergeability BEFORE waiting (a conflicting PR never triggers
CI — no merge ref exists), treats "no checks reported" right after a
push as the registration race it is (wait, don't fail), and reads
failure only from an explicitly failing check. A red check sends the
diff back through the implementer and the full lens round — CI is a
gate, never a fix surface: nobody patches on the PR page.
