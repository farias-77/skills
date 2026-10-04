# Models and effort, one table

Every agent of the pipeline runs on **Opus 5.5** or **Sonnet 5.5**,
nothing else. The pick is by role, from the benchmarks and the docs
collected in `claude/skills/pack-model-selection/` (the evidence column
cites it). Three findings carry most of the table:

- **Opus 5.5 at medium writes the most mergeable code** (FrontierCode
  54.6%, the best of any model at any effort); above medium it edits
  out of scope and scores lower. Builders run at medium, the fix pass
  too.
- **Opus 5.5 medium and Sonnet 5.5 high cost about the same**; Opus is
  more precise on judgment (67% vs 41% on the hardest bugs), Sonnet
  reads literally and runs faster. Judgment goes to Opus, literal
  reading and templated writing to Sonnet.
- **Sonnet 5.5 never above high**: its max scores below its xhigh, and
  xhigh costs 2–4× high for a few points.

This file is the source. `node scripts/check-models.mjs` reads every
`claude/agents/*.md` frontmatter and fails on a model outside the two,
an agent missing here, or a model or effort that differs from its row.
To change a pick, change the row and the agent's frontmatter together.

## The agents

| Agent | Stage | Model | Effort | Evidence |
|---|---|---|---|---|
| `scout` | all | Sonnet 5.5 | low | Lookups, not writing: literal, fast, < $0.4 a task |
| `video-scribe` | all | Sonnet 5.5 | medium | Templated storyboards from a fixed source; medium holds the template at lower cost |
| `slides-scribe` | all | Sonnet 5.5 | high | Follows slide templates with minimal editing; same cost as Opus medium |
| `prototyper` | discovery | Opus 5.5 | medium | Best on graphics and polish; leads CursorBench at every cost; `/effort low` on comment rounds |
| `journey-scribe` | discovery | Sonnet 5.5 | high | Derives text from a locked source: templated writing |
| `disc-author-prfaq` | discovery | Sonnet 5.5 | high | One page from a template |
| `disc-blind-reader` | discovery | Sonnet 5.5 | low | A blind reader must read literally; low keeps it cheap |
| `disc-reviewer` | discovery | Sonnet 5.5 | medium | Checklist critic: judgeable ACs, the In/Out fence, one AC per rule and behavior |
| `design-researcher` | design | Sonnet 5.5 | medium | Searches and cites; the citer downgrades what a source does not hold |
| `architect` | design | Opus 5.5 | high | Open-ended design judgment: GDPval 1576 (medium) → 1690 (high) |
| `overengineering-critic` | design | Opus 5.5 | medium | Cuts what serves no AC and no real risk: judgment on "does this need to exist?" |
| `design-writer` | design | Sonnet 5.5 | high | Documents from templates and a fixed design |
| `design-reviewer` | design | Opus 5.5 | medium | One round over the four documents: AC coverage, consistency, security posture; Opus more precise at the same cost |
| `planner` | plan | Opus 5.5 | high | Cuts the whole graph; the judgment of the stage |
| `plan-writer` | plan | Sonnet 5.5 | high | One brief from a fixed graph; copies, decides nothing |
| `plan-reviewer` | plan | Opus 5.5 | medium | One reader of the cut and every brief: buildable, edges real, foundation thin, fronts |
| `plan-blind-reader` | plan | Sonnet 5.5 | low | A blind reader must read literally |
| `builder` | execute | Opus 5.5 | medium | FrontierCode peaks at Opus medium (54.6%); the fix pass too: it applies proven items |
| `exec-gate` | execute | Sonnet 5.5 | low | Runs the gate commands once and reads logs: no judgment |
| `reviewer` | execute | Opus 5.5 | high | One reader carries the whole closed scope; hardest bugs: Opus caught them at 67% precision, Sonnet at 41% |
| `qa-frontend` | execute | Opus 5.5 | medium | Drives the screens in a browser: Opus beats Sonnet on OSWorld at every cost |
| `qa-backend` | execute | Opus 5.5 | medium | Calls the API and reads the store: judgment on what a customer would hit |
| `verifier` | release | Opus 5.5 | medium | OSWorld: Opus beats Sonnet at every cost; reads screenshots better |
| `release-scribe` | release | Sonnet 5.5 | medium | Tags and notes from a fixed record |
| `close-harvester` | close | Sonnet 5.5 | medium | Collects items and numbers from the files |
| `launch-director` | close | Opus 5.5 | high | Films as code (Remotion, three.js); best on graphics; reads its own frames |
| `footage-recorder` | close | Sonnet 5.5 | medium | Drives a scripted recording |

## The sessions

A stage's conductor is the session itself, so its model is the one the
session runs on; the skill states it and the session sets it with
`/model` and `/effort`.

| Session | Model, effort | Evidence |
|---|---|---|
| discovery conductor | Opus 5.5, medium; `/effort high` on the turns that rule | Long human conversation: Opus wins on knowledge work, long context and facts at the same cost |
| design, plan conductors | Opus 5.5, high | Autonomous: almost every turn designs, cuts or rules, so the ruling effort is the default |
| execute session | Opus 5.5, high | Orchestrates the queue and rules what comes back from many runs at once |
| release, close sessions | Opus 5.5, medium | Reads results and runs a written plan |
| `/pipeline-setup` session | Opus 5.5, medium | Rates each role from the scouts' quotes |
