# skills

An opinionated, stage-gated development pipeline for AI agent teams —
built as [Claude Code](https://claude.com/claude-code) skills, agents
and workflows, extracted from production use at a real software
company and published as-is.

**This is not a framework.** It is one team's working pipeline, made
public because the ideas travel even where the specifics don't. It
does not try to be configurable — it is deliberately opinionated, and
the intention is that you read it, steal what fits, and shape your
own; not that you adopt it wholesale. The best way to use it: **fork
it and keep editing** — bend every rule toward what serves your team,
with this model as your starting base, never as absolute truth. Even
here it isn't treated as one: the closing stage exists precisely to
keep rewriting these files as reality pushes back.

## How it works

One demand becomes a **workstream**: one folder, one conducting Claude
Code session, one **blueprint** (a single self-contained HTML artifact
the human reviews on — same URL from discovery to done, growing a tab
per stage; built from JSON the stages write, never edited by an
agent). The demand travels through six stages; each stage is a
skill that conducts the session, and each ends at an **explicit human
checkpoint** — the pipeline runs autonomously between gates, never
through them.

```mermaid
flowchart LR
  D1["1 · Discovery"] --> D2["2 · Design"]
  D2 --> D3["3 · Plan"]
  D3 --> D4["4 · Execute"]
  D4 --> D5["5 · Release"]
  D5 --> D6["6 · Close"]
  D6 -. "next wave" .-> D2
```

Underneath, four mechanics carry everything:

- **The session conducts; agents work.** The session dispatches,
  routes, audits, and talks to the human — it never writes the
  deliverables. Authors write, reviewers report, the human rules; every
  agent is a file under `claude/agents/` with five fixed sections.
- **State is 100% external.** The workstream folder, GitHub as the
  source of record, the board as a projection. Any agent — even a
  conductor mid-stage — can die and be re-dispatched: it re-derives
  everything from the source and continues. Nothing lives in memory.
- **Reviews are workflows, not discipline.** Every review round is a
  deterministic script in `workflows/` — all reviewers, every round,
  structured outputs, lazy passes re-dispatched automatically. There
  is no code path that runs a subset, so skipping review is not a
  temptation an agent can act on.
- **Every reviewer answers one contract.**
  [reviewer-contract.md](docs/standards/reviewer-contract.md): verdict
  derived arithmetically from the worst finding, verbatim proof of
  reading, and the rule that a clean pass without a verification trail
  is invalid.

## The six stages

**1 · Discovery** — the engineering team interviewing the demand's
owner, one fluid conversation with notes written as it happens, until
the unknowns that would change what gets built are gone. When the
demand has a front, the conductor (Opus 5, high) draws a wireframe
per screen during the interview: grey boxes, real labels, the states;
it stays as a deliverable the design starts from. Two authors
(Sonnet 5, high) then write the PR-FAQ and the user stories from the
notes, in parallel: what gets built, what stays out, every acceptance
criterion with an ID. **The owner validates every story by hand**, one
question each, and closes the scope story by story: confirm, reduce,
adjust, or cut; what leaves discovery is only what gets built. A
whole review round runs, cheap by design (Sonnet and Haiku): four
lenses read the documents and the wireframes while, per story, two
**blind readers** describe what each would build and a referee reports
where they built different products. The **conductor judges** every
finding by the discovery razor — a wrong guess would change what gets
built — with a closed list of classes that are never dismissed
(personal data, money, legal, security, a contradiction) and a
"for the design" list for the mechanics that are stage 2's; wording
goes to the authors without a question, decisions go to the owner
grouped by decision. Up to three rounds, the owner choosing after each
whether to run another. In the
ideal world, this stage isn't run *for* the business team but *by*
it — the skill interviews whoever owns the demand, and engineering
only enters at stage 2 with the ambiguity already wrung out.

**2 · Design** — a defined scope in, how the whole demand works out.
The design is built **with the human**, in a session the conductor
(Fable 5.1, high) runs from a fixed script: the macro shape first
(boundary and repos, data, compute, how the blocks talk, identity,
build vs buy, the cost envelope, the alarm philosophy, rollout,
extension points), then the ten subjects one by one — architecture,
data, contracts (the frozen bridge everything downstream stands on),
screens, security, infra, observability, rollout, code, acceptance —
the conductor proposing the house and industry patterns, the human
shaping, one card per real fork, every decision written to `notes.md`
as it happens, every subject closing with what the implementer is
free to decide. Then a **deep-research workflow per topic**
(Sonnet 5, high: planner, blind searchers, synthesizer, critic,
citer) writes a sourced file per external API, price list or repo,
and the conductor plays every subject back with the research in it
before a line is written. **Ten writers (Sonnet 5, high) write the ten
documents in parallel** from the same notes and research, deciding
nothing (a gap is a question back), each also writing its blueprint
JSON. A whole review round runs: ten lenses (Sonnet 5, high) —
data, code, infra, security, contracts, alarms, coverage, facts, UI
and consistency, the one that reads the ten documents as one system
— beside, per flow, two **blind readers** (Haiku 4.5, high) and a
referee (Sonnet 5, low) reporting where they would build different
things. **The conductor judges** every finding by the design razor
(could the implementer place this and build it one way?) with a
closed list of classes never dismissed; wording goes to the writer
without a question, decisions go to the human one question per
decision, latitude to the implementer. The human then says whether a
second or a third round runs, each over the delta only. The
blueprint's Design tab is built from the JSON and read by the human
at the close, where his adjustments are noted and applied in a batch.
The wave cut is stage 3's.

**3 · Plan** — the design becomes a sequence: **from A to B, and
the steps between**. One scout (Sonnet 5, high) per repo writes what
exists today; the conductor (Fable 5.1, high) arrives with the cut
and the human shapes it: **rows** (one story in one repo, proved by a
command and its expected output, or a screen and its artboard),
**lanes** (the rows of one repo in order; an edge only where a proof
needs another row running in alpha, because a contract the design
froze is proved on seeded data) and **waves** (acceptance gates, not
phases: the rows that must be merged, the walk the master runs in
alpha with commands, each repo's whole suite green before; lanes never
stop for a wave). The human approves wave by wave. Then one writer
(Sonnet 5, high) per lane × wave writes the worker's **goal** in
parallel, deciding nothing. A review round runs: three lenses (Sonnet
5, high: coverage, verifiability, order) beside two blind readers
(Haiku 4.5, high) and a referee (Sonnet 5, low) per goal; **the
conductor judges** by the plan razor and rules the sequence findings
in the human's place when the wave's gate stays as approved, listing
them at the close for veto. Round 2 runs automatically over the
delta; a third only on his word. The Plan tab is built from JSON and
read at the close; the pre-flight (everything the rows need from him)
is handed over there, and `team.md` names the sessions of stage 4 so
his absence blocks nothing.

**4 · Execute** — the plan becomes proven branches, with no human in
the loop until the end. The session that invokes the skill is the
**master** (Fable 5.1, high): its first message prints the sessions to
open, one **worker** (Opus 5, high) per lane, and the user gives the
master one goal and leaves. Each worker builds its lane row by row
from the first day and never waits for anyone: one `exec-builder`
(Opus 5, high) writes the row on its branch, tests first; five lenses
(Sonnet 5, high; fidelity, code, proof, security, operations), which
never wrote the code, read the whole diff; the worker rules every
finding by `references/judging.md`; the builder fixes and the five
read the delta; what is left rides as a PR note. The PR merges into
`feat/<workstream>` when a lock file says the stack is free, the
merge deploys, and the row's proof from the plan is run in alpha. A
second red is a new brief, a third parks the row and the lane goes
on. After the last row a wave requires, the repo's whole suite runs
once in the background and the worker tells the master in one line.
The master never polls: woken by that line, when every lane the wave
requires is ready it freezes the stacks, tags `wNN`, walks alpha with
the plan's commands, saves the evidence, writes the report and the
"for the intern" explanation, and sends a red step back as a fix row
to the lane that owns it. What is the user's (a story's delivery, a
contract, a stateful deletion, a missing pre-flight item) is parked,
never asked. When the last wave is green the master calls him once;
the **audit** in the same session (parked, departures, choices, open
notes, stops; four questions per call; fixes as rows `A.n`, two
passes at most) closes the stage on a consolidated, verified, audited
branch per repo. The Execution tab is built from the lanes' and the
master's JSON. `main` is stage 5's.

**5 · Release** — the audited branch goes to production on one
goal. The session (Fable 5.1, high) writes the release plan: what
ships, the pre-flight only the human can do (done or delegated before
the goal), the train step by step with the command and the read-only
check of each, the versions, the rollback per repo, the proofs the
audit deferred to production with their hour, and where it stops.
He reads it, adjusts in prose, gives the goal, and leaves. Then one
integration PR per repo into `main` in the rollout's order (a front
whose hosting builds prod from `main` merges in the train, after its
producers); the confirmation from `main` reruns the whole suite only
when the tree or the alpha diff changed; one release-scribe (Sonnet
5, high) per repo derives the version from the conventional commits
and writes the notes; the rollback is written before any tag; tags
on the integrated shas; one repo at a time from the tag under the
rollout's checks, read-only. A red step runs the documented rollback
and builds the fix as a row `R.n` in the same session through the
stage-4 row workflow (exec-builder Opus 5 high, five lenses Sonnet 5
high); the third red stops and calls him. The watch reads every
deferred proof at its hour and the stage does not close before; a
regression there is a hotfix by the same row, a patch tag, the
affected stack only. One notification at the end. The Release tab is
built from the session's JSON.

**6 · Close** — the demand is archived and the pipeline is told
what it taught, with one stop for the human. One harvester (Sonnet 5,
high) per source of the record returns the numbers and every friction
with its evidence; the session (Fable 5.1, high) writes the closure
(what shipped, what did not, who owns what is left, the numbers
against the previous workstream's close), sweeps the repos and GitHub
so the next demand starts clean, and builds the **dreaming** board:
every friction, ruling pattern, taste note and audit departure as an
entry with the class it sees, the destination and the edit it would
make, each pipeline candidate checked against the pipeline repo's
issues by one checker (Sonnet 5, high). The human reads the Close tab
once; the session's suggestion is the default ruling, he vetoes or
changes in prose, is asked only about a rule that did not hold, a
taste note and a class conflict, and says apply. Then one issue per
ruled lesson on the pipeline repo, from its issue template and
sanitized for a public repo; **the pipeline is never edited here** —
it changes in its own session, issue by issue. Nothing waits on
production: what hurts later is a new demand.

## On cost

This pipeline is expensive to run today, and that was a deliberate
non-concern. Every row's diff is read whole by five reviewers, then its delta once;
discovery and design run up to three rounds on the human's word, plan runs round 2 automatically and a third on his word; ambiguity is hunted by dispatching multiple readers at
the same document. That redundancy is exactly
where the quality comes from — and it is priced in tokens.

We optimized for the trendline, not the invoice: models keep getting
better and cheaper, and a pipeline built around abundant intelligence
ages well along that curve. Where the ratio hurts you today, the
levers are obvious — smaller models on the evidence lenses, fewer
readers, narrower rounds — but they are yours to pull, not defaults
we chose.

## Layout

```
claude/                 the pipeline — the six stages, Claude Code
  skills/               one folder per stage — SKILL.md + templates + references
  agents/               every agent, named <stage>-<role>[-<lens>], five fixed sections
  workflows/            the deterministic review rounds (plain JS, single-file)
  blueprint/            the blueprint shell, its build, the strings per language, the JSON schemas, an example
codex/                  placeholder — nothing runs in Codex today
docs/
  standards/            the single-source rulers everything points at
```

## Installing into a project

Shared across projects by symlink — each project keeps its own
settings, MCP config, and machine tuning; the pipeline stays one
source:

```bash
git clone https://github.com/farias-77/skills.git ~/skills

cd <your-project>/.claude
ln -s ~/skills/claude/skills skills
ln -s ~/skills/claude/agents agents
ln -s ~/skills/claude/workflows workflows
ln -s ~/skills/docs docs
```

What the pipeline expects from its surroundings:

- **Claude Code**, with the `gh` CLI authenticated — GitHub is the
  source of record.
- The Workflow tool only launches a script it can read from the
  working directory or an added directory, and it resolves the
  symlink: add the clone to the project's settings
  (`permissions.additionalDirectories: ["~/skills"]` in
  `.claude/settings.local.json`), or the review workflows refuse to
  start.
- Project specifics — environments, credentials, deploy targets, the
  build-guard slot count — live in **your** project's `CLAUDE.md`,
  never in these files.

## Glossary

| Term | Meaning |
|---|---|
| **workstream** | one demand, end to end — one folder, one blueprint, one conducting session |
| **wave** | a shippable slice of the demand; wave 1 is the smallest thing useful end to end |
| **blueprint** | the workstream's single review artifact — one URL, tabs per stage, pills per wave |
| **conductor** | whoever dispatches and audits without doing the work — the stage's session |
| **lens** | a reviewer scoped to one failure mode |
| **judge** | whoever rules every finding — sustained/deferred/dismissed, with the reason; reviewers report at the maximum bar. At discovery, design and plan the conductor judges by the stage's `references/judging.md` (at plan it also rules the sequence findings in the user's place against the approved cut); at execution the worker session of the lane rules alone inside the row's two rounds, and the user rules the residue at the audit; at release the session rules alone inside a fix row's two rounds, and the user's one ruling is the goal on the plan; at the close the session's suggestion on every board entry is the default and the user rules by reading, asked only about a rule that did not hold, a taste note and a class conflict. |
| **blind reader** | an agent that reads alone, so divergence from its sibling exposes ambiguity |
| **andon** | stop before building on a broken premise — a cheap halt beats wrong work |
| **dreaming** | the board at the close where every friction of the demand becomes an entry with a suggested edit to the pipeline; the session suggests, the human rules by reading, and each ruled lesson becomes an issue on the pipeline repo — never an edit made there |

## License

[MIT](LICENSE). Take what serves you.
