# skills

An opinionated, stage-gated development pipeline for AI agent teams —
built as [Claude Code](https://claude.com/claude-code) skills, agents,
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
per stage). The demand travels through six stages; each stage is a
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
  agent is a file in `agents/` with five fixed sections. Even stage 4
  is one session: the maestro launches the per-issue and e2e engines
  as background workflows and merges what they prove.
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
the unknowns that would change what gets built are gone. One author
then writes the PR-FAQ and the user stories from the notes: what gets
built, what stays out, every acceptance criterion with an ID. **The
owner validates every story by hand**, one question each, and closes
the scope story by story: confirm, reduce, adjust, or cut; what
leaves discovery is only what gets built. A whole review
round runs, cheap by design (Sonnet and Haiku): three lenses read the
documents while, per story, two **blind readers** describe what each
would build and a referee reports where they built different products;
a **judge** rules every finding by the discovery razor — a wrong guess
would change what gets built — and marks who decides the fix: the
author alone when it is wording, the owner when it is product, scope,
cost or a confirmed fact. The round runs again, whole, once. In the
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

**3 · Plan** — the design becomes a sequence, built with the user in
a session: waves that are each a **verifiable checkpoint in alpha**
(one feature branch per repo, the whole smoke suite green, a PR to
main open), rows inside each wave (one story in one repo, with a
"ready when" a person can observe), the order and what runs in
parallel. One Fable author writes the **goal** of every wave: the
whole brief the execution chair receives, pointing at the design and
never re-deciding it. A whole review round runs: three lenses
(coverage, verifiability, order) beside two blind readers and a
referee per goal (would two engineers build the same wave and prove
it the same way?); a judge rules every finding and marks who owns the
fix — the author for wording, the human for the sequence, the worker
for execution latitude. Two rounds at most. The goals are files; the
execution chair reads them wave by wave.

## On cost

This pipeline is expensive to run today, and that was a deliberate
non-concern. Every diff is read whole by four reviewers plus an
independent verifier; discovery and design run two whole rounds; ambiguity is hunted by dispatching multiple readers at
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
skills/        one folder per stage — SKILL.md + templates + references
agents/        every agent, named <stage>-<role>[-<lens>], five fixed sections
workflows/     the deterministic review rounds and engines (plain JS, single-file)
docs/
  standards/   the single-source rulers everything points at
```

## Installing into a project

Shared across projects by symlink — each project keeps its own
settings, MCP config, and machine tuning; the pipeline stays one
source:

```bash
git clone https://github.com/farias-77/skills.git ~/skills
cd <your-project>/.claude
ln -s ~/skills/skills skills
ln -s ~/skills/agents agents
ln -s ~/skills/workflows workflows
ln -s ~/skills/docs docs
```

What the pipeline expects from its surroundings:

- **Claude Code**, with the `gh` CLI authenticated — GitHub is the
  source of record.
- Project specifics — environments, credentials, deploy targets, the
  build-guard slot count — live in **your** project's `CLAUDE.md`,
  never in these files.

## Glossary

| Term | Meaning |
|---|---|
| **workstream** | one demand, end to end — one folder, one blueprint, one conducting session |
| **wave** | a shippable slice of the demand; wave 1 is the smallest thing useful end to end |
| **blueprint** | the workstream's single review artifact — one URL, tabs per stage, pills per wave |
| **conductor** | whoever dispatches and audits without doing the work — the stage's session (stage 4 calls it the maestro) |
| **lens** | a reviewer scoped to one failure mode |
| **judge** | the agent that rules every finding — sustained/deferred/dismissed, with the reason; reviewers report at the maximum bar. At discovery, design and plan the judge also names who owns the fix (author, human, or at design the implementer and at plan the worker) and the human rules what is his; at execution the judge rules alone inside a two-round budget |
| **blind reader** | an agent that reads alone, so divergence from its sibling exposes ambiguity |
| **andon** | stop before building on a broken premise — a cheap halt beats wrong work |
| **dreaming** | the closing session where frictions become edits to the pipeline itself — the session suggests, the human rules every lesson |

## License

[MIT](LICENSE). Take what serves you.
