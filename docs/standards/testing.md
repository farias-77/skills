# The testing standard

**A test's only legitimate input is the acceptance criterion — never
the implementation plan.** A good test survives any refactor that
preserves behavior; a test that breaks on refactor and passes on a bug
is a change-detector, and a change-detector is a defect, not coverage.

The house proves software on a ladder, and each rung answers a
different question:

| Rung | Answers | Runs |
|---|---|---|
| **Unit** | does the logic hold? | every commit, in CI |
| **Integration** | does the real boundary behave? | every commit, in CI |
| **Smoke** (bash vs the staging env) | does what was promised still hold, deployed? | after every deploy; on demand |
| **e2e round** (agent runners vs staging) | does the user's story work end to end? | once per wave, until clean |

## 1. Unit tests

| ID | Rule | Severity |
|---|---|---|
| test.1 | **AC-first, prove it:** the ACs' tests are written BEFORE the implementation, run once, and the RED is **captured verbatim** as evidence — then implement to GREEN. A test that has never failed has proven nothing; each AC is a bug to be proven fixed. | fix |
| test.2 | **The unit is the use case** — handler and domain together, exercised at the use-case boundary. Mock ONLY at the real I/O seam (DB, HTTP, queue, **clock, id, random**) — never the SUT, never a domain collaborator. Module-mocking an internal file is the same defect wearing a tool: fake the seam's interface, not the module. | blocker |
| test.3 | **Change-detector is a defect:** asserting internal calls, fixtures mirroring internal shapes, re-asserting declared config. Verify **state** by default; verify interaction only when the call IS the requirement (the AC says "publishes the event"). | blocker |
| test.4 | **Tautological is a defect:** an expected value recomputed with the SUT's own formula passes even when the SUT is wrong — the silent false negative. Expected values come from an **independent source**: a literal derived from the AC, a worked example computed by hand. | blocker |
| test.5 | **Table-driven** where cases vary only by data (valid / invalid / boundary). Bad paths — sad, tenancy, idempotency — get cases whenever the AC declares them. | fix |
| test.6 | **Coverage: 100% of `src/`, as a physical threshold** in the test config — never regresses. An uncovered line is dead code (delete it) or behavior without an AC (write the case). Coverage is a phantom-scope detector, not a bureaucratic target — and gaming it with assertion-free tests is test.3's defect. | blocker |
| test.7 | **Deterministic, always:** time, ids and randomness arrive injected (the code standard's seams). No sleeps, no real clocks, no test that passes on Tuesday. | fix |

### The size model — what "unit" means operationally

- **Small** — no I/O at all: no network, no disk, no DB. This is the
  unit tree, and the default for everything.
- **Medium** — localhost only: an emulator, an in-process fake server.
  This is the integration tree — used only where a real boundary
  behavior cannot be proven small (a query shape, a serialization
  round-trip). Keep it thin.
- **Large** — a real deployed environment. This NEVER lives in the
  repo's test trees: it is the smoke suite and the e2e round.

## 2. Infra has no tests

Asserting declarative config is change-detection by definition — a
suite that re-states the stack proves only that the stack is the
stack. The infra gate is:

1. `synth` green.
2. **The diff protocol**, before every infra PR: run the diff against
   the staging env and answer in writing, in the PR's Testing done —
   (a) does the diff contain exactly what the issue's Produces
   promises, and nothing else? (b) is there a removal/replace of a
   **stateful** resource the issue does not declare? If yes, STOP —
   that is a halt, not a footnote. (c) any IAM widening, anything going
   public, any external call without a timeout? Paste the annotated
   diff.
3. Smoke against the deployed environment — the behavior the config
   exists to produce, proven where it runs.

## 3. Smoke — the deterministic floor

Bash + curl + jq against the **staging environment**, per endpoint,
success AND failure. Runs in seconds, costs zero tokens, accumulates
wave over wave. It answers "does what was already promised still
hold?" — the e2e round answers "does what we just built work?".
**Smoke green is the precondition of every e2e round.**

```
smoke/
  run.sh                              # the runner — the only entry point
  lib/
    env.sh                            # staging base URL, fixed ids — prod DOES NOT EXIST here
    auth.sh                           # test-account login, token cached per run
    common.sh                         # req(), assert_status(), assert_field(), reporting
    db.sh                             # direct store reads for side-effect asserts
  <resource>/                         # one folder per domain resource
    post-create-lead.sh
    post-create-lead-no-auth-401.sh
    get-list-leads-pagination.sh
```

| ID | Rule | Severity |
|---|---|---|
| smoke.1 | **1 file = 1 case = 1 behavior.** Name: `<method>-<behavior>[-<expected-result>].sh` — hyphens only. A failure case carries its expectation in the name (`-no-auth-401`). The folder's listing IS the executable documentation of the resource's contract. | fix |
| smoke.2 | **Self-contained, order-independent, self-cleaning:** a case creates the data it needs (prefixed `smoke-`), never depends on another case having run, and **deletes what it created on exit — including on failure** (trap-based cleanup). The environment is as clean after the run as before it. | blocker |
| smoke.3 | **The suite is physically incapable of touching prod:** `env.sh` knows only the staging URL. No `--prod` flag, no environment variable that could point it elsewhere — by construction, not by discipline. | blocker |
| smoke.4 | **The design writes the spec, the worker transcribes it.** Every case comes from the design's `acceptance.md` — one line per case: name, request, expected status and code, the side effect checked **directly in the store** (`lib/db.sh`, never via a read endpoint), the cleanup. The assert IS the contract: implementation proving it wrong is a declared design amendment, never a silent test edit; what legitimately varies at transcription is body mechanics only (auth, seeds, URLs). Cases are copied into the issue's DoD at planning; an issue that changes an endpoint adjusts its cases; an issue that removes an endpoint DELETES them. A dead case does not hibernate. | fix |
| smoke.5 | **`lib/` is the only shared code, and it stays small** — four files of curl+jq+auth+store helpers. Case never calls case; folder never imports folder. The day `lib/` outgrows "helpers", it became the problem. | fix |
| smoke.6 | **Elegance is a requirement:** a typical case is ≤ ~12 lines, zero comments — the file NAME documents the case, the body proves it. Longer means a missing `lib/` helper or a case testing two things. | detail |
| smoke.7 | **Distillation:** an e2e case that stabilizes becomes a smoke case in the fix issue's DoD. Today's judgment call is tomorrow's deterministic regression. | fix |

**The runner** (`./smoke/run.sh [resource[/case.sh]]`) prints a
formatted, human-readable report — per-case pass/fail with duration,
failures showing expected × received, a final count — and exits
non-zero on any failure. It does NOT run in CI (it needs the deployed
environment and credentials); it runs after every deploy and on
demand.

## 4. The e2e round

Agent runners against the staging environment — one per user story of
the wave, in parallel, **all-or-nothing**: one failing case dirties
the whole round, and after fixes the ENTIRE round runs again. A dead
runner or an empty report is not a pass — it is a re-run.

| ID | Rule | Severity |
|---|---|---|
| e2e.1 | Every scope covers the happy path AND the adversarial set: malformed input, replay, cross-tenant access, limits, auth bypass, **idempotency (firing twice demands effect once)**. | — |
| e2e.2 | On every 4xx/5xx, the **exact error code is checked against the contract** — the right HTTP status with the wrong code is a FAILED case. | — |
| e2e.3 | Evidence is **verbatim** per case — the request/response or assert, never a paraphrase. | — |
| e2e.4 | Runners **clean up what they create** (prefix `e2e-`, deletion before exit). Shared-environment hygiene is part of the case, not a courtesy. | — |
| e2e.5 | A scenario premise is validated **against the design** before it becomes a case — behavior that is degraded BY DESIGN is not a bug; the scenarios file carries a "by-design behaviors" section. | — |
| e2e.6 | **The front has no assertive e2e suite.** Frontend behavior is proven on a human gate: the runner navigates the real staging app as a CAMERA, capturing screenshots of the key screens and states as evidence. What stays assertive on a front: HTTP smoke (routes, assets served) and the API data it consumes — data, never pixels. | — |

## 5. Who enforces this

The implementer births the tests (test.1 is its working method); the
`exec-reviewer-tests` lens audits every diff against this file; the
verification step re-runs everything from scratch — declared evidence
is never trusted evidence; CI holds the coverage threshold physically.
One file — an edit here changes every prompt on the next run.
