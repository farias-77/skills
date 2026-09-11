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
The design is built **with the human**: the macro shape first (data,
compute, messaging, identity, repos, build vs buy, the cost envelope,
the alarm philosophy, rollout, extension points), then the ten
documents one by one — architecture, data, contracts (the frozen
bridge everything downstream stands on), UI, security, infra,
observability, rollout, code, acceptance — one tradeoff card per
decision, the conductor recommending, the human choosing, and every
document ending with what the implementer is free to decide. One
Fable author transcribes the decisions into the files, with dedicated
research per external target and the UI as artboards on a design
canvas. A whole review round runs: nine Opus lenses beside, per flow,
two **blind readers** and a referee reporting where they would build
different things; a **judge** rules every finding by the design razor
(could the implementer place this and build it one way?) and marks who
owns the fix — the author for wording, the human for product, data,
contracts, security and cost, the implementer for declared latitude.
Two rounds at most; the residue is written down, not chased. The wave
cut is stage 3's.

**3 · Plan** — the design becomes a sequence. The conductor proposes
the cut and the human approves or rejects it, wave by wave; the rest
is mechanical: waves that are each a **verifiable checkpoint in alpha**
(one feature branch per repo, the whole smoke suite green, merged
into the workstream branch), rows inside each wave (one story in one repo, with a
"ready when" a person can observe), the order and what runs in
parallel. One Fable author writes the **goal** of every wave: the
whole brief the execution chair receives, pointing at the design and
never re-deciding it. A whole review round runs: three lenses
(coverage, verifiability, order) beside two blind readers and a
referee per goal (would two engineers build the same wave and prove
it the same way?); a judge rules every finding and marks who owns the
fix — the author for wording, the human for the sequence, the worker
for execution latitude; what would be the human's is ruled by the
conductor against the approved cut and listed at the close for veto.
Two rounds at most. The goals are files: the brief the execution chair
reads.

**4 · Execute** — the plan becomes proven branches. The session
conducts, and the human is not in the loop until the last wave. Per
story, a builder writes the tests first and the code on its own branch;
five lenses (fidelity to the goal, the code standard, the proof, the
attack, operations) read the diff in parallel, the conductor rules
every finding, the builder fixes, the five read the delta, the
conductor rules again, and what is left rides as a note. The story is
deployed to alpha and its smoke folder proved before its PR is merged
into the wave branch. When the wave's stories are in, the whole suite
runs green against alpha, the walk the goal describes is done with
evidence saved, the wave PR is merged into the workstream branch
`feat/<workstream>`, the report is written, and the next wave starts
from there. Improvements inside the standard are applied and listed;
departures from the standard are applied only when the system gets
simpler, and listed with the rule they leave. When the last wave is
in, the same session runs the **audit** with the human: the
departures, choices, open notes and stops asked one question each,
ruled keep, fix or revert; what he sends back is built as a fix wave.
Stage 4 ends with the workstream branch consolidated, verified in
alpha and audited; `main` is stage 5's. *The stage-4 skill is being
rebuilt after the first end-to-end run; this paragraph is its
contract.*

**5 · Release** — the audited branch goes to production, in the
Claude chair, behind two explicit human gates. The entry gate shows
what ships and what the audit left; then one integration PR per repo
into `main`, producer-first, fronts whose hosting auto-builds prod
prepared and merged last; alpha redeployed from `main` and the whole
suite green (a regression goes back to stage 4 as a fix, two
cycles at most); the version derived from the conventional commits;
the prod-go gate with a written rollback per repo; the cutover one
repo at a time, the human confirming each step, verification
read-only, tags never retroactive. The Release tab is the report.

**6 · Close** — the demand is archived and the pipeline learns. The
closure record says what shipped, what did not, who owns what is
left, and the demand's numbers against the previous one; the repos
and GitHub are swept so the next demand starts clean. Then the
**dreaming**, a working session: every friction the stages noted on
the spot, every ruling, every departure the human kept at the audit,
becomes an entry on a board with evidence and a suggested edit to a
standard, a skill or an agent; the human rules each entry, and only
ruled lessons become one revertible `learn()` commit each. Nothing
waits on production: what hurts later reopens the demand as a fix.

## On cost

This pipeline is expensive to run today, and that was a deliberate
non-concern. Every story's diff is read whole by five reviewers, twice;
discovery, design and plan run two whole rounds; ambiguity is hunted by dispatching multiple readers at
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
| **judge** | whoever rules every finding — sustained/deferred/dismissed, with the reason; reviewers report at the maximum bar. At discovery it is the conductor itself; at design and plan a judge agent proposes. The ruling names who owns the fix (author, human, or at design the implementer and at plan the worker) and the human rules what is his; at execution the conductor rules alone inside the story's review budget, and the residue rides as PR notes the human rules at the audit that closes stage 4 |
| **blind reader** | an agent that reads alone, so divergence from its sibling exposes ambiguity |
| **andon** | stop before building on a broken premise — a cheap halt beats wrong work |
| **dreaming** | the closing session where frictions become edits to the pipeline itself — the session suggests, the human rules every lesson |

## License

[MIT](LICENSE). Take what serves you.
