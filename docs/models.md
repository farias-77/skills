# Models and effort, one table

Every agent of the pipeline runs on **Opus 5.5** or **Sonnet 5.5**,
nothing else. Three findings carry most of the table:

- **Opus 5.5 at medium writes the most mergeable code** (FrontierCode
  54.6%, the best of any model at any effort); above medium it edits
  out of scope and scores lower. Builders run at medium.
- **Opus 5.5 medium and Sonnet 5.5 high cost about the same**; Opus is
  more precise on judgment (67% vs 41% on the hardest bugs), Sonnet
  reads literally and runs faster. Judgment goes to Opus, literal
  reading and templated writing to Sonnet.
- **Sonnet 5.5 never above high**: its max scores below its xhigh, and
  xhigh costs 2–4× high for a few points. Subagents default to Sonnet.

This file is the source. `node scripts/check-models.mjs` reads every
`claude/agents/*.md` frontmatter and the workflows' agent maps, and
fails on a model outside the two, an agent missing here, a model or
effort that differs from its row, or a workflow file not named
`<name>-workflow.js`. To change a pick, change the row and the agent's
frontmatter together.

## The agents

| Agent | Stage | Model | Effort | Evidence |
|---|---|---|---|---|
| `scout` | all | Sonnet 5.5 | low | Lookups, not writing: literal, fast, < $0.4 a task |
| `video-builder` | every stage's report, the close's users' video | Sonnet 5.5 | high | One film from a fixed brief on a motion library, scored from its own frames; composition and scale are visual judgment, so high |
| `slides-builder` | every stage's report | Sonnet 5.5 | medium | A deck from a layout guide and the stage's files; medium follows a fixed guide well |
| `artifact-builder` | discovery, design, a release incident | Sonnet 5.5 | medium | One explainer page from the draw-it-for-me references |
| `blind-reader` | discovery, plan | Sonnet 5.5 | low | A blind reader must read literally; low keeps it cheap |
| `blind-judge` | discovery, plan | Sonnet 5.5 | medium | Compares two readings key by key; reports only where the text failed |
| `prototype-builder` | discovery | Sonnet 5.5 | medium | Applies one edit order at a time to the live mock; each edit is small and the conductor reviews it live |
| `story-writer` | discovery | Sonnet 5.5 | high | Derives journeys, stories and ACs from a locked source: templated writing |
| `disc-lens` | discovery | Sonnet 5.5 | medium | One checklist lens per call (in-out, coverage, acceptance) |
| `architect` | design | Opus 5.5 | high | Open-ended design judgment: GDPval 1576 (medium) → 1690 (high) |
| `overengineering-guard` | design | Opus 5.5 | medium | Cuts what serves no AC and no real risk: judgment on "does this need to exist?" |
| `design-writer` | design | Sonnet 5.5 | high | One document from a template and the closed proposal |
| `design-consistency` | design | Opus 5.5 | medium | Contradictions across six documents and the mock: judgment over a long context |
| `design-security` | design | Opus 5.5 | medium | Security and data posture: a miss here is expensive |
| `design-contracts` | design | Sonnet 5.5 | high | Each Contract against the code that exists: literal comparison |
| `planner` | plan | Opus 5.5 | high | Cuts the whole graph; the judgment of the stage |
| `plan-writer` | plan | Sonnet 5.5 | high | One brief from a fixed graph; copies, decides nothing |
| `plan-reviewer` | plan | Opus 5.5 | medium | One reader of the cut and every brief: buildable, edges real, the contract commit thin |
| `builder-backend` | execute | Opus 5.5 | medium | FrontierCode peaks at Opus medium (54.6%); the fix pass too |
| `builder-frontend` | execute | Opus 5.5 | medium | The same; the screens with taste, faithful to the locked mock |
| `exec-gate` | execute | Sonnet 5.5 | low | Runs the gate commands once and reads logs: no judgment |
| `reviewer` | execute | Opus 5.5 | high | One reader carries the whole closed scope; hardest bugs: Opus caught them at 67% precision, Sonnet at 41% |
| `qa-frontend` | execute | Opus 5.5 | medium | Drives the screens in a browser: Opus beats Sonnet on OSWorld at every cost |
| `qa-backend` | execute | Opus 5.5 | medium | Calls the API and reads the store: judgment on what a customer would hit |

## The sessions

A stage's conductor is the session itself, so its model is the one the
session runs on. Every main session runs on **Opus 5.5, high**: at the
open, a session on anything else gets one line recommending the
switch and goes on without waiting.

| Session | Model, effort | Evidence |
|---|---|---|
| `/lets-cook`, every `/stage-*`, `/weekly-retro`, `/pipeline-setup` | Opus 5.5, high | Long contexts where almost every turn rules, cuts or orchestrates; one setting for every stage keeps the play simple |
