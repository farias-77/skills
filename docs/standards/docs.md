# The docs standard

The source of truth of this house is **readable code + the repo's
`docs/`** (comments are the exception — the code standard). Every repo
keeps a living docs tree that answers, at any moment, everything worth
knowing about the service — written for the **cold reader**: an agent
or human who has never seen this repo and has to work on it today.

The bar: after reading `docs/`, the cold reader knows what the service
is, what it promises, what it stores, how it behaves, and how it is
operated — without opening the code to find out, and without finding a
single claim the code contradicts.

## The tree — the full map of what is worth knowing

```
docs/
├── README.md                  # the index: 1 line per entry — name, what it answers
├── architecture.md            # what this service IS: purpose and boundary (what it
│                              #   owns / what it does not), the layer map, each flow
│                              #   end to end (trigger → steps → effects), the critical
│                              #   patterns (transactional writes, fire-and-forget,
│                              #   caching), and the dependency map: what it consumes,
│                              #   who consumes it, and what happens when each side fails
├── data.md                    # what it stores: per table — keys, GSIs, item shapes,
│                              #   the ACCESS PATTERNS (each query → the index that
│                              #   serves it), denormalizations with their staleness
│                              #   window, growth expectations, external tables read
├── contracts/
│   ├── README.md              # conventions crossing every resource: the auth model,
│   │                          #   the error envelope (per the house standard),
│   │                          #   pagination and idempotency conventions
│   ├── <resource>.md          # ONE file per domain resource — every endpoint of it:
│   │                          #   route, auth, request/response with realistic
│   │                          #   examples, every error, idempotency, pagination
│   └── events.md              # events published (schema, when emitted, consumers) and
│                              #   consumed (source, handler, idempotency story)
├── domain/
│   └── <resource>.md          # the business rules: invariants, state machines, the
│                              #   semantics an endpoint list cannot carry ("archiving
│                              #   is per-user preference, not project state")
└── operations/
    ├── deploy.md              # commands, stack order, particularities
    ├── environments.md        # staging × prod differences, quirks, where test
    │                          #   accounts are described (never a secret value)
    └── alarms.md              # per alarm, the four fields: what it catches · what
                               #   normal looks like · when it rings without a bug ·
                               #   what to do — the runbook lives inline
```

A front repo keeps the same tree with `contracts/` describing what it
CONSUMES (APIs, golden shapes) and `domain/` per feature when there is
something to say.

## The rules

| ID | Rule |
|---|---|
| docs.1 | **The grain is the RESOURCE, not the endpoint.** In docs the resource is a file (reading is continuous; endpoints are its sections); in smoke the resource is a folder (each case is an isolated executable). Same domain names in the three places: `src/` ↔ `docs/contracts/<resource>.md` ↔ `smoke/<resource>/`. |
| docs.2 | **Born minimal, grows by promotion.** A new repo starts with `README + architecture.md + contracts/ + operations/deploy.md`; `data.md`, `domain/` and the rest are born the day there is something to say. A file passing ~150 lines or mixing two subjects is promoted to a folder with its own README. NEVER an empty file or folder "for later". |
| docs.3 | **Every folder has a README index** — one line per file: name, what it answers. Navigation is walking: `docs/README.md` → folder → file. Path + title IS the index; grep is a shortcut, never the map. |
| docs.4 | **`contracts/` and `smoke/` are mirrors** — declared ↔ proved. An endpoint documented without its smoke cases, or a case without its doc, is a finding when the issue's DoD promised them. |
| docs.5 | **Living, not frozen.** `docs/` describes the repo AS IT IS today — no changelog, no "this used to be". The dated decision record of a feature lives in the workstream's design folder, immutable; the two never duplicate each other. |
| docs.6 | **Every claim is checkable against the code today.** A doc line the code contradicts is a bug — in the doc or in the code, but a bug either way, and finding one is a reviewer's finding, not a shrug. |
| docs.7 | **Gotchas are first-class.** The hard-earned surprises — the stale cache window, the cursor that 500s on bad input, the scan the key design cannot avoid — live in the file that owns the subject, stated plainly. What an agent would otherwise learn the hard way IS documentation. |
| docs.8 | **Self-healing, never big-bang.** Each issue updates the tree where it touched (part of its DoD); the wave's docs true-up issue reconciles the whole tree against the repo's final state — index lines, promotions, cross-references. No documentation crusades. |
| docs.9 | **`CLAUDE.md` points, `docs/` holds.** The repo's CLAUDE.md is the front door — commands, one-screen map, conventions, top gotchas — and links into the tree. Content is never maintained in both places. |

## Who guarantees it (three points, none optional)

| Where | The guarantee |
|---|---|
| **Every issue's DoD** | `docs/` updated where behavior changed, OR "no docs impact" stated in the PR evidence — a fixed item |
| **`exec-reviewer-plan`** (every diff) | behavior or contract changed with no diff in `docs/` = finding |
| **`exec-reviewer-pr`** (the final review) | the updated doc MATCHES the diff — it exists AND tells the truth |

Plus the wave's **docs true-up issue** (planned by stage 3, executed
last), which trues the whole tree up — the per-issue touches keep the
docs correct; the true-up keeps them coherent.
