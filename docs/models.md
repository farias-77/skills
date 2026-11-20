# Models and effort, one table

Every agent of the pipeline runs on **Opus 5.5** or **Sonnet 5.5**,
and on **Haiku 5.5** only for a role where a blinded A/B on real past
dispatches showed it ties (no worse on the blind verdict, no worse on
false greens): today `scout`, `discovery-scout`, `discovery-story-reader`, `blind-reader` and `exec-gate`. The
evidence is in each row. Three findings carry most of the table:

- **Opus 5.5 at medium writes the most mergeable code** (FrontierCode
  54.6%, the best of any model at any effort); above medium it edits
  out of scope and scores lower. Builders run at medium.
- **Opus 5.5 medium and Sonnet 5.5 high cost about the same**; Opus is
  more precise on judgment (67% vs 41% on the hardest bugs), Sonnet
  reads literally and runs faster. Judgment goes to Opus, literal
  reading and templated writing to Sonnet.
- **Sonnet 5.5 never above high**: its max scores below its xhigh, and
  xhigh costs 2–4× high for a few points. Subagents default to Sonnet.

This file is the reference table for people; each agent's frontmatter
is the source. To change a pick, change the agent's frontmatter and
the row together.

## The agents

| Agent | Stage | Model | Effort | Evidence |
|---|---|---|---|---|
| `scout` | all | Haiku 5.5 | high | Lookups, not writing. Blinded A/B on 15 real past lookups (2026-10-07): Haiku medium won 20 of 30 pairs against Sonnet low, 0 false greens against 2, about 8× cheaper. Raised to high by him (27/10/2026) |
| `video-builder` | every stage's report, the close's users' video | Sonnet 5.5 | high | One film from a fixed brief on a motion library, scored from its own frames; composition and scale are visual judgment, so high |
| `slides-builder` | every stage's report | Sonnet 5.5 | medium | A deck from a layout guide and the stage's files; medium follows a fixed guide well |
| `artifact-builder` | discovery, design, a release incident | Sonnet 5.5 | medium | One explainer page from the draw-it-for-me references |
| `discovery-scout` | discovery | Haiku 5.5 | high | The stage's own scout: one recon topic per call (today, standards, neighbors, words, design-system). Same evidence as `scout` |
| `discovery-story-reader` | discovery | Haiku 5.5 | high | Two per story, one as builder and one as tester, each committing to a case that passes and one that fails; the signal is where the two differ. The earlier A/B on stories had Haiku high win 3 of 8 pairs and pass a known defect twice; he chose Haiku high (27/10/2026); a verifier compares both readings with what was decided |
| `blind-reader` | plan | Haiku 5.5 | high | Reads one brief blind. Haiku high won 9 of 10 blinded pairs against Sonnet low (1 tie), 0 false greens |
| `blind-judge` | plan | Sonnet 5.5 | medium | Compares two readings key by key; reports only where the text failed |
| `discovery-mock-designer` | discovery | Opus 5.5 | medium | Designs the guided mock from the project's design system and checks its own screenshots against the real screen: visual judgment. To be compared with Sonnet 5.5 high on real mocks |
| `discovery-story-writer` | discovery | Sonnet 5.5 | high | Writes stories and criteria from the interview notes to a format a script checks: templated writing |
| `discovery-hole-hunter` | discovery | Sonnet 5.5 | medium | One hunt per call (errors, access, limits, code) |
| `discovery-reading-comparer` | discovery | Sonnet 5.5 | medium | One story per call: the two blind reports side by side against what he decided |
| `discovery-finding-verifier` | discovery | Sonnet 5.5 | medium | One hunter claim per call against what he decided; returns confirmed or refuted with the quote |
| `architect` | design | Opus 5.5 | high | Open-ended design judgment: GDPval 1576 (medium) → 1690 (high) |
| `overengineering-guard` | design | Opus 5.5 | medium | Cuts what serves no AC and no real risk: judgment on "does this need to exist?" |
| `design-writer` | design | Sonnet 5.5 | high | One document from a template and the closed solution |
| `design-consistency` | design | Opus 5.5 | medium | Contradictions across six documents and the mock: judgment over a long context |
| `design-security` | design | Opus 5.5 | medium | Security and data posture: a miss here is expensive |
| `design-contracts` | design | Sonnet 5.5 | high | Each Contract against the code that exists: literal comparison |
| `planner` | plan | Opus 5.5 | high | Cuts the whole graph; the judgment of the stage |
| `plan-writer` | plan | Sonnet 5.5 | high | One brief from a fixed graph; copies, decides nothing |
| `plan-reviewer` | plan | Opus 5.5 | medium | One reader of the cut and every brief: buildable, edges real, the contract commit thin |
| `builder-backend` | execute | Opus 5.5 | medium | FrontierCode peaks at Opus medium (54.6%); the fix pass too |
| `builder-frontend` | execute | Opus 5.5 | medium | The same; the screens with taste, faithful to the locked mock |
| `exec-gate` | execute | Haiku 5.5 | medium | Runs the gate commands once and reads logs: no judgment. Haiku 5.5, medium won the A/B against Sonnet 5.5, low (11/0/5, 0 false greens against 5); switched 28/10/2026 without the extra live check, and the weekly retro watches the gate's signals |
| `reviewer` | execute | Opus 5.5 | high | One reader carries the whole closed scope; hardest bugs: Opus caught them at 67% precision, Sonnet at 41% |
| `qa-frontend` | execute | Opus 5.5 | medium | Drives the screens in a browser: Opus beats Sonnet on OSWorld at every cost |
| `qa-backend` | execute | Opus 5.5 | medium | Calls the API and reads the store: judgment on what a customer would hit |
| `standards-writer` | standards | Sonnet 5.5 | high | One file of a project's standards book from a template, the recon and his answers: templated writing that must check every claim against the repo |

## Per-call overrides

A workflow may run an agent on another model for one kind of text,
in both of its modes; the agent file keeps the row above.

| Workflow | Agent | Model | Effort | Evidence |
|---|---|---|---|---|
| `plan-review-workflow.js` | `blind-reader` | Haiku 5.5 | high | Plan briefs: Haiku high won 9 of 10 blinded pairs against Sonnet low (1 tie), 0 false greens on both sides |

## The sessions

A stage's conductor is the session itself, so its model is the one the
session runs on. At the open, a session on another model or effort
than its row gets one line recommending the switch and goes on without
waiting.

| Session | Model, effort | Evidence |
|---|---|---|
| every `/stage-*`, `/standards` | Opus 5.5, medium | Chosen by him for discovery, design and plan (27–28/10/2026) and extended to execute, release and close: Opus 5.5 medium is about Opus 5 at high; the heavy judgment sits in the agents (the architect, the planner, the reviewer at high), and the session stays faster and cheaper |
| `/lets-cook`, `/weekly-retro` | Opus 5.5, high | The route and the week's rulings are the two places where one session's judgment sets everything after it |
