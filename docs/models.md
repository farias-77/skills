# Models and effort, one table

Every agent of the pipeline runs on **Opus 5.5** or **Sonnet 5.5**,
nothing else. The pick is by role, from the benchmarks and the docs
collected in `claude/skills/pack-model-selection/` (the evidence column
cites it). Three findings carry most of the table:

- **Opus 5.5 at medium writes the most mergeable code** (FrontierCode
  54.6%, the best of any model at any effort); above medium it edits
  out of scope and scores lower. Builders run at medium and go to high
  only on a fix.
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
| `video-scribe` | all | Sonnet 5.5 | high | Templated storyboards; ties Opus medium at equal cost, 30% faster |
| `slides-scribe` | all | Sonnet 5.5 | high | Follows slide templates with minimal editing; same cost as Opus medium |
| `prototyper` | discovery | Opus 5.5 | medium | Best on graphics and polish; leads CursorBench at every cost; `/effort low` on comment rounds |
| `prototype-checker` | discovery | Sonnet 5.5 | high | A mechanical gate plus a checklist: literal reading |
| `journey-scribe` | discovery | Sonnet 5.5 | high | Derives text from a locked source: templated writing |
| `disc-author-prfaq` | discovery | Sonnet 5.5 | high | One page from a template |
| `disc-blind-reader` | discovery | Sonnet 5.5 | low | A blind reader must read literally; low keeps it cheap |
| `disc-reviewer-acceptance` | discovery | Sonnet 5.5 | medium | Checklist critic |
| `disc-reviewer-boundary` | discovery | Sonnet 5.5 | medium | Checklist critic |
| `design-researcher` | design | Sonnet 5.5 | medium | Searches and cites; the citer downgrades what a source does not hold |
| `architect` | design | Opus 5.5 | high | Open-ended design judgment: GDPval 1576 (medium) → 1690 (high) |
| `sizing-judge` | design | Opus 5.5 | high | Weighs risk, reversibility and cost per part: sustained judgment |
| `overengineering-critic` | design | Sonnet 5.5 | high | Checks a pick against a fixed list (right-sizing C1–C17) |
| `risk-critic` | design | Sonnet 5.5 | high | Checks a pick against a fixed list of failure classes |
| `design-writer` | design | Sonnet 5.5 | high | Documents from templates and a fixed design |
| `design-reviewer-code` | design | Opus 5.5 | medium | Judgment critic: Opus more precise at the same cost |
| `design-reviewer-contracts` | design | Opus 5.5 | medium | Judgment critic |
| `design-reviewer-data` | design | Opus 5.5 | medium | Judgment critic |
| `design-reviewer-infra` | design | Opus 5.5 | medium | Judgment critic |
| `design-reviewer-security` | design | Opus 5.5 | medium | Judgment critic on documents (code security runs at high in execute) |
| `design-reviewer-sizing` | design | Opus 5.5 | medium | Judgment: "does this need to exist?" |
| `design-reviewer-alarms` | design | Sonnet 5.5 | medium | Checklist critic (the ops pack) |
| `design-reviewer-consistency` | design | Sonnet 5.5 | medium | Cross-document comparison: literal |
| `design-reviewer-coverage` | design | Sonnet 5.5 | medium | Two lists compared |
| `design-reviewer-facts` | design | Sonnet 5.5 | medium | Claim against source: literal |
| `design-reviewer-ui` | design | Sonnet 5.5 | medium | Checklist critic against the locked mock |
| `design-reviewer-ambiguity` | design | Sonnet 5.5 | low | Literal reading |
| `design-blind-reader` | design | Sonnet 5.5 | low | A blind reader must read literally |
| `plan-scout` | design, plan | Sonnet 5.5 | low | Locates and quotes per repo and area |
| `plan-writer` | plan | Opus 5.5 | medium | Same cost as Sonnet high, equal or better (GDPval +36); sequencing is judgment |
| `plan-reviewer-order` | plan | Sonnet 5.5 | high | The graph against the pack's checklist; the checker settles the mechanical part |
| `plan-reviewer-coverage` | plan | Sonnet 5.5 | high | Every criterion owned once: two lists compared |
| `plan-reviewer-verifiability` | plan | Sonnet 5.5 | high | Each acceptance line against "can a command prove it" |
| `plan-reviewer-ambiguity` | plan | Sonnet 5.5 | high | Literal reading of the briefs |
| `plan-blind-reader` | plan | Sonnet 5.5 | low | A blind reader must read literally |
| `builder` | execute | Opus 5.5 | medium | FrontierCode peaks at Opus medium (54.6%); high only on the fix |
| `exec-gate` | execute | Sonnet 5.5 | medium | Runs a scripted gate and reads logs |
| `verifier` | execute, release | Opus 5.5 | medium | OSWorld: Opus beats Sonnet at every cost; reads screenshots better |
| `reviewer` | execute | Opus 5.5 | medium | Hardest bugs: Opus 8 caught at 67% precision, Sonnet 6 at 41% |
| `structure-reviewer` | execute | Opus 5.5 | medium | Code judgment |
| `ux-reviewer` | execute | Opus 5.5 | medium | Screens against the mock's frames: reads screenshots better |
| `exec-lens-security` | execute | Opus 5.5 | high | More effort pays on security work |
| `exec-lens-operations` | execute | Opus 5.5 | medium | Code judgment |
| `exec-lens-craft` | execute | Opus 5.5 | medium | Code judgment |
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
