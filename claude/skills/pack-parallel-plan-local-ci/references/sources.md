# Parallel plan and local CI: sources

Public sources only. Secondary sources are marked.

- https://github.com/mattpocock/skills — `to-tickets` and its docs page: tracer bullets, "single fresh context window", the frontier, expand–contract, the layer-sliced post-mortem. `implement-spec` and its docs page: integration branch, worktree per implementer, merge the tip before done, review only at the end, "Worktrees don't remove collisions".
- https://cursor.com/blog/scaling-agents (2026-01-14) and https://cursor.com/blog/self-driving-codebases (2026-02-05) — locks, optimistic concurrency, risk-averse peers, planners and workers, the integrator bottleneck, one large machine per run.
- https://www.anthropic.com/engineering/building-c-compiler (2026-02-05) — `current_tasks/` claims, 16 agents on one bug, GCC as an oracle to split the work.
- https://cognition.com/blog/multi-agents-working (2026-04-22) — "writes stay single-threaded".
- https://stripe.dev/blog ("Minions", parts 1–2, 2026-02) — devboxes in 10 s, deterministic plus agent nodes, at most two CI rounds.
- https://builders.ramp.com/post/why-we-built-our-background-agent and the Ramp case study on https://modal.com — full stack per sandbox, images rebuilt every 30 min.
- https://code.claude.com/docs/en/ (cloud-environments, claude-code-on-the-web, claude-projects, worktrees, agent-teams, agents, hooks) — VM, cache, flags, ownership, the Stop cap of 8.
- https://world.hey.com/dhh (post of 2024-04-29 on local CI), https://rubyonrails.org/2025/10/22/rails-8-1, https://github.com/rails/rails/pull/54693 — local CI, its numbers and scope, `bin/ci` as the final check.
- https://github.com/basecamp/gh-signoff (v0.4.1) — what signoff does and does not do.
- https://docs.github.com — protected branches (expected-source app), merge queue (merged-result guarantee), OIDC and environments (deploys stay hosted).
- https://slsa.dev/spec/v1.0/requirements and https://slsa.dev/spec/v1.0/levels — L2 needs a hosted build platform.
- https://bazel.build/remote/caching — only CI writes the cache.
- https://nektosact.com/not_supported.html — what `act` ignores.
- https://git-scm.com/docs/git-push — `--no-verify`.
- https://docs.dagger.io — Dagger.
- Secondary: https://lobste.rs/s/pdhon6 and https://news.ycombinator.com/item?id=43677174 — critiques of local CI.
- https://martinfowler.com/bliki/ContractTest.html (2011) — keeping doubles honest; https://martinfowler.com/bliki/ParallelChange.html (2014) — expand–contract.
- Brun, Holmes, Ernst, Notkin, FSE 2011, https://www.cs.ubc.ca/~rtholmes/papers/fse_2011_brun.pdf — 17% of merges had textual conflicts, and 33% of clean merges hid build or test conflicts.
- Graham 1966, Bell System Technical Journal 45(9), on scheduling anomalies; secondary: https://en.wikipedia.org/wiki/List_scheduling, for the 2 − 1/m bound.
- arXiv preprints, 2026: https://arxiv.org/abs/2607.04697 (cross-agent conflicts 41.7% against 19.8%); https://arxiv.org/abs/2608.00947 (Claim Plane: claims serialize execution); https://arxiv.org/abs/2601.13295 (CooperBench: 30% lower success when agents work together).
- https://guides.rubyonrails.org/v2.3/migrations.html — sequential numbers "clash", and timestamps fix it.
- https://github.com/pressly/goose (README, hybrid versioning); https://playwright.dev/docs/best-practices (isolation); `go help test` (cache, `-count=1`).
