# The repo structure standard

Every repo follows exactly the same shape for its type. The payoff is
compound: a cold agent lands in ANY repo and already knows where
everything lives, every issue can say `src/services/` and mean the
same thing in every service, and the standards enforce themselves —
a reviewer greps the same paths everywhere. The tree is the index.

## The API repo

```
<api-repo>/
├── CLAUDE.md                     # the agent's front door: commands, map, gotchas
├── docs/                         # the living docs tree — see the docs standard
├── app/                          # the service
│   ├── src/
│   │   ├── handlers/             # entry points: routing/event wiring — thin, no logic
│   │   ├── services/             # the use cases — business logic lives here
│   │   ├── repositories/         # data access — the DB adapters
│   │   ├── schemas/              # boundary parsing (untrusted input → strong types)
│   │   ├── models/               # domain types — one file per concept
│   │   ├── config/               # env validation, constants
│   │   └── utils/                # small cross-cutting helpers (errors, logger, ids) — watched for bloat
│   ├── tests/
│   │   ├── unit/                 # mirrors src/ — the small tests (no I/O)
│   │   └── integration/          # the medium tests (localhost/emulator only) — thin
│   └── package.json
├── infra/                        # the CDK tree — bin/ + lib/{config,constructs,stacks}
│   └── package.json              #   (layout and rules in the code standard, §12)
├── smoke/                        # the bash suite vs staging — run.sh + lib/ + <resource>/
│                                 #   (layout and rules in the testing standard, §3)
└── scripts/
    └── guard.sh                  # the heavy-command gate (below)
```

The layering maps the code standard's dependency rule: `handlers` →
`services` → `repositories`, dependencies pointing inward; `schemas`
parse at the edge; `models` know nothing about anything.
`smoke/` lives at the root, not inside `app/` — it tests the
**deployed service**, not the app code, and runs with no app
dependencies installed.

## The front repo

The app lives at the root (Vite); there is no `infra/` — hosting is
platform-configured — and **no unit-test tree**: front behavior is
proven on the human gate (the dev server, then the staging preview,
with screenshots as evidence) plus HTTP smoke; component unit tests
are not part of the pipeline.

```
<front-repo>/
├── CLAUDE.md
├── docs/
├── src/
│   ├── features/<feature>/       # a feature's components, hooks, types — together
│   ├── components/               # shared UI primitives — the design system
│   ├── hooks/                    # shared hooks
│   ├── lib/                      # shared client logic (api clients, formatting)
│   ├── pages/                    # route-level composition
│   └── config/
├── package.json
└── scripts/
    └── guard.sh
```

What is one feature's stays under `features/<feature>`; what two
features share is promoted to the shared layer and imported — never
duplicated inward (the code standard's fe.2).

## The agent repo

An AI-agent service follows the API shape — `app/` + `infra/` +
`docs/` + `smoke/` — with its runtime specifics (prompts, tools,
evaluation fixtures) under `app/src/` and described in its
`CLAUDE.md`.

## File naming

| What | Convention |
|---|---|
| Files | `kebab-case.ts`, suffixed by kind: `project.service.ts` · `project.repository.ts` · `project.handler.ts` · `project.schema.ts` |
| Tests | mirror the source name: `tests/unit/services/project.service.test.ts` |
| Infra | `<name>.config.ts` · `<name>.construct.ts` · `<name>.stack.ts` (code standard §12) |
| Smoke | `<method>-<behavior>[-<expected>].sh`, hyphens only (testing standard §3) |
| Variables / Types / DB fields | `camelCase` / `PascalCase` / `snake_case` |

## The canonical npm scripts

Same names in every repo — an agent never guesses a command:

| Script | Where | Does |
|---|---|---|
| `test` | `app/` | unit suite, coverage threshold on |
| `test:integration` | `app/` | the medium tree |
| `lint` | `app/`, front root | linter + formatter check, zero warnings |
| `build` | `app/`, front root, `infra/` | typecheck/compile |
| `synth` | `infra/` | CDK synth |
| `diff:alpha` | `infra/` | CDK diff against staging — the diff protocol's input |
| `deploy:alpha` / `deploy:prod` | `infra/` | deploy per stage — `deploy:prod` exists for stage 6, nothing else ever calls it |

**Every heavy script routes through the guard** — test, build, synth,
deploy, anything that spawns compilers or bundlers:

```json
"test": "../scripts/guard.sh jest",
"synth": "../scripts/guard.sh cdk synth"
```

## `scripts/guard.sh` — the heavy-command gate

The machine-protection gate lives INSIDE the npm scripts — the only
sanctioned entry points — so no agent can bypass it by forgetting:

```bash
#!/usr/bin/env bash
# Queue heavy commands: N slots, wait — never crash the machine.
[ -n "$CI" ] && exec "$@"
for slot in /tmp/build-1.lock /tmp/build-2.lock; do
  exec 9>"$slot"
  flock -n 9 && exec "$@"
  exec 9>&-
done
exec flock -w 3600 /tmp/build-1.lock "$@"
```

- **Queues instead of killing**: a heavy command that finds all slots
  busy WAITS — waiting on the guard is normal machine queueing, never
  a failure to report.
- CI passes straight through (`$CI`); the guard is a local-machine
  concern.
- The slot count is machine tuning, not repo policy — the venture's
  own configuration decides how many slots its machine sustains.
- The rules that ride with it, for every agent that executes: heavy
  work ONLY via npm scripts (never call compilers/test runners
  directly, never via npx — that bypasses the guard), and never leave
  a watcher running.

## `CLAUDE.md` — the front door

One per repo, kept current by the docs true-up issue: the commands
(the canonical scripts and any repo quirk), a one-screen architecture
map, the conventions, and the gotchas an agent would otherwise learn
the hard way. It is the index that points into `docs/` — never a
second copy of it.
