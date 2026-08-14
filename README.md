# skills

A software delivery pipeline built as [Claude Code](https://claude.com/claude-code)
skills: one conversation carries a piece of work from "we have a demand" to
"it runs in production", and the quality gates are code, not discipline.

**Status: v6, under construction.** This repository is being rebuilt stage by
stage from a private version that has shipped real features for months. Expect
the tree to change shape while that happens.

## What this is

Seven stages, each one a skill the session loads when it gets there:

| Stage | Skill | What it produces |
|-------|-------|------------------|
| 1 — Discovery | `stage-discovery` | the framed demand: what we build, what we don't |
| 2 — Design | `stage-design` | the architecture, decided and reviewed |
| 3 — Planning | `stage-plan` | a graph of issues a worker can execute cold |
| 4 — Implementation | `stage-execute` | merged code, gates passed per issue |
| 5 — Test & Iterate | `stage-execute` | a clean end-to-end round against staging |
| 6 — Release | `stage-close` | production, with a documented rollback |
| 7 — Closure | `stage-close` | the pipeline edits itself with what it learned |

The deterministic parts — the per-issue engine and the e2e round — are
JavaScript workflows, so the gates cannot be skipped by a model in a hurry.

## Install

Clone it, then point a project at it:

```bash
git clone https://github.com/farias-77/skills.git ~/skills
cd /path/to/your/project && mkdir -p .claude
ln -s ~/skills/skills    .claude/skills
ln -s ~/skills/agents    .claude/agents
ln -s ~/skills/workflows .claude/workflows
```

Your project keeps its own `.claude/settings.json` and `CLAUDE.md`.

## Using it as inspiration

This pipeline is opinionated on purpose: it encodes how one team works. Read
it as a worked example, not as a framework — fork the parts that fit your
shop and throw away the rest.

Project-specific knowledge does not live in these skills. It lives in each
repository's own `docs/`, which the skills read on demand.

## License

MIT — see [LICENSE](LICENSE).
