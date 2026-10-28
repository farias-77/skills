# stage-design

Stage 2 of the pipeline. From the locked discovery (its stories and
acceptance criteria, and the mock when a screen changed), one solution
sized to the problem, with its evolution path (v1 → v2 → v3). He sees
it as one visual page and debates it until he says it is closed; then
five documents stage 3 cuts into entries without asking, reviewed once
by four lenses. Runs under one `/goal`; every question to him goes
through the question tool. The page becomes the report's Explainer;
video and slides only when he asks.

```
scouts → architect drafts solution.md → guard cuts → the page → debate → solution expanded → five documents → review-prep → four lenses → report → /stage-plan <slug>
```

## Install

This skill needs the pipeline: the agents it dispatches, the visual
builders, the shared references, and a discovery to start from.
Install the whole `claude/` folder (see the repo's README).

Runtime needs: Node 20+ for `scripts/review-prep.mjs`, and `gitleaks`
for the scan before the report is published.

## Agents it dispatches

| Agent | Does |
|---|---|
| `scout (Haiku 5.5, high)` | reads the current system, the standards and the other workstreams into `recon/` |
| `architect (Opus 5.5, high)` | `solution.md`: drafted, edited each round, expanded at the close |
| `overengineering-guard (Opus 5.5, medium)` | cuts what serves no AC and no real risk: the draft, then the documents |
| `artifact-builder (Sonnet 5.5, medium)` | the page he debates on, which becomes the Explainer |
| `design-writer (Sonnet 5.5, high)` × up to 5 | data-and-contracts, tests, operations, security-and-access, screens |
| `design-consistency (Opus 5.5, medium)` | the six files against each other and the mock; screen states |
| `design-security (Opus 5.5, medium)` | scope, personal data, secrets, identities |
| `design-contracts (Sonnet 5.5, high)` | each Contract against the code that exists and will be generated |
| `video-builder (Sonnet 5.5, high)` · `slides-builder (Sonnet 5.5, medium)` | the Video and the Deck, only when he asks |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage, step by step (D0–D7) |
| `references/right-sizing.md` | the bar, the overengineering list, the floor, the versions |
| `references/documents.md` | what each of the six files carries and never carries |
| `references/contracts.md` | the Contract: headers, required · optional · nullable, error codes, the OpenAPI fragment |
| `templates/solution.md` | the architect's file, from draft to closed |
| `templates/data-and-contracts.md` … `templates/screens.md` | the five documents |
| `templates/notes.md` · `templates/reviews.md` | the session's record and rulings |
| `scripts/review-prep.mjs` | the six files exist, every AC is proved, no open question is left, sizes (`--self-test` runs its own cases) |
