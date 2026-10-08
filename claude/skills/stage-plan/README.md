# stage-plan

Stage 3 of the pipeline: turns a closed design into a build graph and
one brief per node, on its own, under one `/goal`. It asks the user
nothing; he sees its report at the end and may veto what was decided in
his place.

```
recon ──► cut (C + entries + E-int) ──► briefs ∥ pre-flight ──► one review round ──► report ──► /stage-execute
```

## Install

This skill needs the pipeline around it: the agents `scout`, `planner`,
`plan-writer`, `plan-reviewer`, `blind-reader`, `blind-judge`,
`video-builder` and `slides-builder` in `claude/agents/`, the workflow
`claude/workflows/plan-review-workflow.js`, and the shared
`claude/references/judging.md`. Copy `claude/` into the project's
`.claude/` (or symlink this folder into `~/.claude/skills/stage-plan`
with the rest of the pipeline beside it), then run
`/stage-plan <workstream-slug>`.

## Files

| File | What |
|---|---|
| `SKILL.md` | the stage, step by step |
| `references/cut.md` | the rules of the cut, the shape, the anti-patterns |
| `references/contract-commit.md` | what goes in C and how it is proved |
| `references/coordination.md` | talking to the other fronts' sessions; what counts as additive |
| `templates/plan.graph.json` | the graph the planner writes and the checker reads |
| `templates/plan.md` · `brief.md` · `preflight.md` · `reviews.md` | the stage's documents |
| `scripts/plan-graph.mjs` | the checker: ACs carried once, the 12-AC cap, owners, edges, briefs equal to the graph |
| `scripts/selftest.sh` · `scripts/fixtures/` | the checker's self-test (`bash scripts/selftest.sh`) |
