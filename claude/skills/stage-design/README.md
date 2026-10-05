# stage-design

Stage 2 of the pipeline. From the locked discovery (the mock, its
stories and acceptance criteria), one proposal sized to the problem,
with its evolution path (v1 → v2 → v3), debated with the user until he
says it is closed; then six documents stage 3 cuts into entries
without asking, reviewed once by four lenses. Runs under one `/goal`;
every question to him goes through the question tool. The stage ends
with its report (video, deck, explainer) and the command for stage 3.

```
scouts → architect → guard → deck + video → debate → six documents → review-prep → four lenses → report → /stage-plan <slug>
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
| `scout (Sonnet 5.5, low)` | reads the current system, the standards and the other fronts into `recon/` |
| `architect (Opus 5.5, high)` | one proposal and its versions; the debate's edits; `solution.md` |
| `overengineering-guard (Opus 5.5, medium)` | cuts what serves no AC and no real risk: the proposal, then the documents |
| `design-writer (Sonnet 5.5, high)` × up to 5 | data-and-contracts, tests, operations, security-and-access, screens |
| `design-consistency (Opus 5.5, medium)` | documents vs each other, the proposal and the mock; screen states |
| `design-security (Opus 5.5, medium)` | scope, personal data, secrets, identities |
| `design-contracts (Sonnet 5.5, high)` | each Contract against the code that exists and will be generated |
| `video-builder` · `slides-builder` · `artifact-builder` (Sonnet 5.5, medium) | the deck and video of the debate, and the report's three tabs |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage, step by step (D0–D7) |
| `references/right-sizing.md` | the bar, the overengineering list, the floor, the versions |
| `references/documents.md` | what each of the six documents carries and never carries |
| `references/contracts.md` | the Contract: headers, required · optional · nullable, error codes, the OpenAPI fragment |
| `templates/proposal.md` | the architect's proposal |
| `templates/solution.md` … `templates/screens.md` | the six documents |
| `templates/notes.md` · `templates/reviews.md` | the conductor's record and rulings |
| `scripts/review-prep.mjs` | the six documents exist, every AC is proved, no open question is left, sizes (`--self-test` runs its own cases) |
