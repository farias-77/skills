# The code standard

How code is written in this house. **Intentional code**: every construct
exists for a declared reason — the simplest design that satisfies the
requirement AND the extension points the design named. Nothing
speculative, nothing cargo-cult, nothing defensive against the
impossible.

**One ruler, two prompts.** This file is the implementer's target (the
code is born right) and the reviewer's checklist (the review confirms).
Same text on both sides kills the back-and-forth. Enforcement is **on
the diff** (a pre-existing violation in untouched code is reported,
never blocks) and **against the design's declared seams** — never
against personal taste. Severities are the house
[reviewer contract](reviewer-contract.md): `blocker` / `fix` /
`detail` (cap of 5 details per review). Every finding cites the rule
id, `file:line`, and the concrete refactor — never "improve this".

The stack this standard governs: **TypeScript everywhere** — React on
the front, Node services on the APIs, CDK for infrastructure. Mobile
joins the standard when it arrives.

## 1. Typing — evidence-based TypeScript

The type system is an evidence ledger: a type is a claim about what you
KNOW. Slop is code that fabricates evidence it does not have, or
discards evidence it does.

| ID | Rule | Severity |
|---|---|---|
| typing.1 | `strict` mode on, always. No `any` — not in code, not laundered through an alias. | blocker |
| typing.2 | `unknown` enters only at a boundary and is **parsed** into a strong type right there; the interior trusts types. No `unknown` parameters or returns in interior contracts. | blocker |
| typing.3 | **No fabricated evidence:** chained assertions (`x as unknown as T`) are forbidden — and a single non-const assertion is a defect too when a parse or type guard could prove the type instead. Needing one almost always means the boundary parse is missing (typing.2): fix the boundary, don't assert. | blocker |
| typing.4 | **No discarded evidence:** don't widen a known value into a broad annotation and assert it back later. Preserve inference; use `satisfies` when a shape check is wanted without widening. | fix |
| typing.5 | No ad hoc `typeof`/`in` narrowing in the interior — that is boundary parsing leaking inward. Narrow once, at the edge, into a named type. | fix |
| typing.6 | Dictionary types carry real value types — no `Record<string, unknown>` masquerading as a contract. | fix |
## 2. Architecture in code

The dependency rule is the heart — everything else gets easier when
this is right.

| ID | Rule | Severity |
|---|---|---|
| arch.1 | Dependencies point **inward**: domain → application → infrastructure. An inner layer never imports an outer one. The domain does not know DynamoDB, queues, or HTTP exist. | blocker |
| arch.2 | Business logic never imports an infra SDK directly (AWS SDK, payment provider, AI provider) — only through a port/adapter. Swapping a provider is injecting another adapter, not rewriting rules. | blocker |
| arch.3 | Zero circular dependencies between modules. | blocker |
| arch.4 | Every external dependency — DB, queue, API, **clock, id generation, randomness** — is a **seam**: an interface. Deterministic time/id/random in tests; no flakiness. | fix |
| arch.5 | Dependency injection is **manual**, via constructor/args. No DI framework, no hidden global singleton, no importing a concrete instance mid-logic. | fix |

## 3. Modularity & organization

| ID    | Rule                                                                                                                                                                                                                                                                                 | Severity |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| mod.1 | One module, **one reason to change**. Two reasons ⇒ two modules.                                                                                                                                                                                                                     | fix      |
| mod.2 | Explicit boundary: **one public entry** per module. Nobody reaches into another module's internals by shortcut.                                                                                                                                                                      | fix      |
| mod.3 | Organize by **feature / bounded context**, not by loose technical layer (a giant `utils/` is the smell).                                                                                                                                                                             | fix      |
| mod.4 | A module's types live with the module — in their own file, never inlined among the logic. Tests live in the repo's dedicated tests tree, mirroring the source layout (the [repo structure standard](repo-structure.md) defines both trees). | detail   |
| mod.5 | Size as a guide, not a gate: a cohesive function stays around 40–50 lines; past that it probably does two things.                                                                                                                                                                    | detail   |

## 4. Extensibility — intentional, never speculative

| ID | Rule | Severity |
|---|---|---|
| ext.1 | Open/closed **at the variation points the design declared**: a new variation is a new unit added, not a central `switch` edited. | fix |
| ext.2 | **Anti-speculation:** no abstraction, parameter, or flag "for the future" without a real consumer today. Extensible where the design named a seam; YAGNI everywhere else. | fix |
| ext.3 | Composition over inheritance. No deep hierarchies; a small interface beats a fat base class. | fix |

## 5. Contracts, boundaries & errors

| ID | Rule | Severity |
|---|---|---|
| ctr.1 | Every seam has an explicit typed contract (event, request/response, public signature). Nothing un-refined crosses a boundary. | blocker |
| ctr.2 | Contract changes are **additive / backward-compatible**. Breaking requires a version bump and deprecation. | blocker |
| ctr.3 | **Idempotency is physical**, not documented: the key/condition derives only from the event's own fields — never from a value recomputed at delivery time (a regenerated timestamp means the existence condition never collides, and the "idempotent" write duplicates on every retry). | blocker |
| ctr.4 | **Parse at the edge**: untrusted input is validated and refined into a strong type at the boundary; the interior trusts the type. | fix |
| ctr.5 | Errors are **typed** and handled at the right level. Zero swallowing `catch`; zero generic errors hiding the cause. What crosses an API boundary follows the house [error envelope](error-envelope.md). | fix |

## 6. Security in code

Security is part of craft, not a separate phase. Multi-tenant systems:
the security boundary is the tenant predicate.

| ID | Rule | Severity |
|---|---|---|
| sec.1 | Every data access carries the tenant predicate **derived from the verified token** — never from client input. | blocker |
| sec.2 | Cache keys include the tenant. Runtime container reuse never leaks data across tenants. | blocker |
| sec.3 | Zero secrets in code or logs. Secrets via the secret store / environment; **PII never in logs**. | blocker |
| sec.4 | Least privilege: IAM/permissions scoped to exactly what the unit uses — never `*`. | fix |
| sec.5 | Untrusted input is treated as hostile at the edge (the e2e round's adversarial cases confirm it resists). | fix |

## 7. Performance — intentional, measured

| ID | Rule | Severity |
|---|---|---|
| perf.1 | No N+1 against I/O (DB/network). Batch/query modeled on the declared access pattern. | fix |
| perf.2 | Payloads bounded and paginated. Nothing unbounded crosses a boundary. | fix |
| perf.3 | The latency budget the design declared is respected; heavy parse/allocation stays out of the hot path. | fix |
| perf.4 | **Never optimize without measuring.** An optimization that costs readability needs a number that justifies it. | fix |
| perf.5 | Lean cold start: small bundle, no heavy framework, lazy-init what is expensive. | detail |

## 8. Readability & naming

The final test: a senior reading the diff understands **why** every
block exists, without asking.

| ID | Rule | Severity |
|---|---|---|
| read.1 | **Nothing exists by accident**: zero dead code, zero commented-out code, zero unused parameters, zero single-use abstraction. | fix |
| read.2 | Names reveal **domain intent**, not mechanism or shape: `notifySalesRep`, not `handleEvent2`; `pendingInvites`, not `inviteArray` or `dataObject`. | fix |
| read.3 | Match the repo's idiom (surgical changes). Don't restyle someone else's code in passing. | fix |
| read.4 | Linear, explicit flow beats cleverness. Early return beats deep nesting. | detail |
| read.5 | Strings that become cloud **resource properties** (names, descriptions, tags, role paths) stay in printable ASCII — providers reject exotic charsets at deploy time, and no synth/CI gate catches it. House typography (em-dash, curly quotes) is for prose, never for resource strings. | blocker |

### Simplification thresholds

Mechanical triggers — when the pattern appears in the diff, the
simpler form is the standard, not a suggestion:

| Pattern in the diff | Standard form |
|---|---|
| Nesting ≥ 3 levels | guard clauses / early returns |
| Function ≥ 50 lines | split by intent |
| Duplicated logic ≥ 5 lines | extract once, name it |
| Boolean flag parameter | two functions, or an options object with named intent |
| Generic names (`data`, `info`, `helper`, `util`, `manager`) | rename to the domain word |

Simplest-that-solves-it wins — but never under-build against the ACs:
simplicity is about form, scope is the issue's.

## 9. Comments — rare, and only as a last resort

The source of truth is **readable code + the repo's `docs/`**. A
comment exists ONLY when both alternatives failed: the knowledge does
not fit the docs, AND the code cannot be rewritten to carry it. If the
code needs a comment to be understood, the defect is in the code —
rename, extract, and restructure until it isn't.

| ID | Rule | Severity |
|---|---|---|
| cmt.1 | Comments narrating what the line does, inflated docstrings, changelogs in comments, multi-line block explanations of the approach, "explanation of the fix" for the reviewer — a defect, always. | fix |
| cmt.2 | The ONLY legitimate uses: a non-obvious **why** behind a decision · a **workaround** for an external bug (with link) · a **subtle invariant** or contract constant the code cannot express. One line each; a legitimate comment that needs a paragraph belongs in `docs/`. | detail |
| cmt.3 | `TODO` only with an issue and an owner. A **deliberate scope cut** is marked inline with its ceiling and upgrade trigger ("handles up to N; past that, move to a queue — see #issue"); a cut marker with no trigger is rot. | fix |
| cmt.4 | Density target: the cleanest neighboring file in the repo. A diff whose comment density stands out upward is a finding — even if each comment looks harmless alone. | fix |

## 10. Dependencies

| ID | Rule | Severity |
|---|---|---|
| dep.1 | Every new dependency is a **declared decision** — what it buys, what it weighs, why not 30 lines of our own. | fix |
| dep.2 | No framework where a function does. The default answer to "which library?" is "none". | fix |
| dep.3 | Versions pinned; the lockfile is the truth. | fix |

## 11. The front — React

| ID   | Rule                                                                                                                                                                                                   | Severity |
| ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- |
| fe.1 | Functions + hooks only. No class components.                                                                                                                                                           | blocker  |
| fe.2 | Feature folders: what belongs to ONE feature — its components, hooks, types — lives together under it. What two or more features share is promoted to the shared layer (`components/` for UI primitives, `hooks/`, `lib/`) and imported from there — reuse is never sacrificed to colocation, and nothing shared is duplicated into a feature to keep it "self-contained". | fix      |
| fe.3 | State lives at the lowest level that needs it; **derive, don't duplicate** — a value computable from existing state is computed, never stored twice.                                                   | fix      |
| fe.4 | The component tree mirrors the design's screens: real product components and tokens, never re-invented primitives beside the design system.                                                            | fix      |

## 12. Infrastructure as code — CDK

Declarative and modular — the infra reads as a description of what
exists, not a program that builds it. The house pattern is **three
layers with fixed file naming**, and every value lives in exactly one
of them:

```
infra/
├── bin/infra.ts                       # entry: iterates the stages, instantiates the stacks
└── lib/
    ├── config/                        # ALL values live here — nowhere else
    │   ├── environment.config.ts      # stages: name, account, region
    │   ├── <resource>.config.ts       # dynamodb, lambda, apigw, iam, eventbridge, ...
    │   └── external.config.ts         # names of OTHER services' resources this one imports
    ├── constructs/
    │   └── <resource>.construct.ts    # one per resource kind: reads its config, materializes
    └── stacks/
        ├── data.stack.ts              # the stateful world (tables, buckets)
        ├── service.stack.ts           # the compute world (functions, gateway, wiring)
        └── monitoring.stack.ts        # alarms and dashboards (when the design declares them)
```

| ID | Rule | Severity |
|---|---|---|
| cdk.1 | **Config declares, construct materializes, stack composes** — and never across: a literal in a construct or a resource declared directly in a stack is a layer violation. File naming is fixed: `<name>.config.ts` · `<name>.construct.ts` · `<name>.stack.ts`. | fix |
| cdk.2 | **All values in `config/`, typed and per-stage**: resource names as enums, props extending the CDK prop types, one typed object keyed by stage. Code branches on config, never on the stage name. | fix |
| cdk.3 | **Stages share a base; a stage overrides only what truly differs** (removal policy, capacity, external endpoints). Duplicating the whole config per stage lets alpha and prod drift apart silently — the diff between stages should read as the list of deliberate differences. | fix |
| cdk.4 | **One construct per resource kind**, exposing what it built as typed members (`tables`, `functions`) for the stack to wire. Cross-stack hand-off via typed props; another service's resources are imported via `from*()` with names from `external.config.ts` — never re-declared. | fix |
| cdk.5 | **Data and service live in separate stacks.** The stateful world changes rarely and must survive; the compute world redeploys freely. One stack for both couples a routine deploy to your data's lifecycle. | fix |
| cdk.6 | Physical resource names carry the stage suffix (`<name>-<stage>`); construct ids are deterministic (`<Name>-<stage>`) — a rename is a replace, and a replace of something stateful is a data event. | fix |
| cdk.7 | Stateful resources declare their removal policy **explicitly, per stage**: retain in prod, destroy in alpha is the house posture — and any deletion/replace of a stateful resource is a declared decision, never a side effect. | blocker |
| cdk.8 | Nothing imperative at synth time: no network calls, no lookups that make synth non-deterministic. | blocker |
| cdk.9 | Infra code follows this whole standard — it is TypeScript. What it does NOT have is tests: asserting declarative config is change-detection by definition. The gate is synth + the diff protocol (see the [testing standard](testing.md)). | — |

## 13. Classes — where they win, not as dogma

**Use a class when:**
- An **entity / value object** with an invariant in the constructor —
  invalid state cannot be constructed.
- A **port + adapter**: `interface` in the domain,
  `class ... implements` in infra. The biggest decoupling win.
- A **service with dependencies** injected via constructor (easy to
  fake in tests).

**Never for:** handlers (a thin function wiring dependencies is
cleaner) · React (hooks + functions; classes are legacy there) · deep
inheritance or DI frameworks — composition and manual DI, always.

## 14. Enforcement

- **On the diff, not the repo**: only what the change touched can
  block. Pre-existing violations are findings flagged `preexisting`,
  outside the verdict.
- **Against the design's declaration**: extensibility and seams are
  judged against the design's named variation points — a design
  missing the declaration is its own finding, never a taste call.
- **Who applies it**: the implementer writes toward it; the
  `exec-reviewer-code` lens audits sections 1–5 and 7–13 on every diff;
  `exec-reviewer-security` owns section 6's severity; `exec-judge`
  rules the findings. One file — an edit here changes every prompt on
  the next run.
