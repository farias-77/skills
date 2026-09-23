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
the unknowns that would change what gets built are gone; the
conductor is Opus 5.5 (medium). Screens are not drawn here: they are
the design's. The conductor plays the understanding back as stories
and **the owner confirms every story by hand**, one question each:
confirm, reduce, adjust, or cut; what leaves the playback is only what
gets built. Two authors (Sonnet 5, high) then write the PR-FAQ and the
user stories from the notes, in parallel: what gets built, what stays
out, every acceptance criterion with an ID. A whole review round runs,
cheap by design (Sonnet and Haiku): three lenses read the documents
while, per story, two
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

**2 · Design** — a defined scope in, how the whole demand gets built
on the system as it is out. The shape is the consuming project's
doctrine; the design applies it and never reopens it. **Recon first**:
scouts (Haiku 4.5, max) read the system as it is today (feature maps,
docs, the modules the stories touch) and a **deep-research workflow
per external tool** (Sonnet 5, high: planner, blind searchers,
synthesizer, critic, citer) reads its documentation into a sourced
file. Then the conductor (Opus 5.5, high) asks whether the human
already has a shape in mind: if he does, he talks first and the
conductor builds on it, saying where it would go another way and at
what cost; if not, the conductor arrives with the proposal. Either way
it walks eleven subjects (the shape, architecture, data, contracts,
screens, security, infra, observability, rollout, code, acceptance),
every one thought even when nothing changes in it, under the
**construction razor**: extend what exists when the responsibility
exists, a new piece in its owning module when it is new, fix instead
of a parallel path, never a workaround or a temporary step unless the
human asks for it, never speculation. They iterate to a final version,
one card per real fork, `notes.md` holding one version of every
decision. **Ten writers (Sonnet 5, high) write the ten documents in
parallel** from the same notes and research, deciding nothing (a gap
is a question back), each also writing its blueprint JSON, and round 1
runs at once: ten lenses (Sonnet 5, high) — data, code (which blocks
every workaround), infra, security, contracts, alarms, coverage,
facts, UI and consistency — beside, per flow, two **blind readers**
(Haiku 4.5, high) and a referee (Sonnet 5, low) reporting where they
would build different things. **The conductor judges** every finding
by the design razor with a closed list of classes never dismissed;
wording goes to the writer without a question, decisions go to the
human one question per decision, latitude to the implementer. The
human then says whether a second or a third round runs, each over the
delta only. The blueprint's Design tab is read by the human at the
close, where his adjustments are noted and applied in a batch. The
wave cut is stage 3's.

**3 · Plan** — the design becomes a cut built **as parallel as the
machine allows**. One scout (Haiku 4.5, max) per area of the codebase
writes what exists today; the conductor (Opus 5.5, high) arrives with
the cut and the human shapes it. First the **foundation**: everything
two builders would fight over — every migration of the demand, the
whole contract with its generated code, the new modules registered,
the shared pieces, the factories — laid down once, so no later piece
ever touches a shared file. Then the **graph of entries**: one story,
or a small group that proves only together, built vertically (back,
front, tests) in its own worktree with its own local stack; an **edge**
only where an entry's proof needs another entry's behavior (data is
seeded by the factories, never an edge); everything free runs at once,
up to a **concurrency cap** measured on the machine. Every entry is
proved by commands on the local stack (`run`/`expect`, and a
screenshot against its artboard for a screen); nothing needs alpha or
prod. One writer (Sonnet 5, high) per entry writes the **brief** its
builder will receive, deciding nothing; three lenses (Sonnet 5, high)
— coverage, verifiability, order — and, per brief, two blind readers
(Haiku 4.5, high) with a referee (Sonnet 5, low) review it; round 2
runs automatically over the delta, a third only on the human's word.
The pre-flight (what only he can hand over) is handed at the close.

**4 · Execute** — the plan becomes merged, reviewed code, with no
human in the loop until the end. **One session** (Opus 5.5, high)
receives one goal, "build the whole plan", and orchestrates without
writing or reviewing code: the foundation first, then every entry whose
edges are merged, in parallel up to the plan's cap, each in its own
worktree and local stack, through the **exec-entry** workflow.
`builder-backend` and `builder-frontend` (Opus 5.5, high) build the two
sides at once in their own worktrees, tests and journeys first; the
**gate** (`exec-gate`, Sonnet 5, high) merges them and runs `make
verify`, sending every red back to the side that owns it; a **panel
that never wrote the code** reads the diff — seven lenses (fidelity,
workaround, craft, proof, security, operations, and visual when there
is a screen) and two QA that use the running stack and try to break it,
all Opus 5.5, medium — and a **judge** (`exec-judge`, Opus 5.5, medium)
rules every finding; the builders fix, the gate runs, the panel reads
only the delta, three rounds at most. **No code enters without
review**: every build, fix, conflict resolution and foundation
amendment passes the gate and the panel. The session merges what comes
back ready through a serial queue (rebase, gate, merge), writes
foundation amendments when an entry needs a shared file changed, and
parks what is the user's. When everything is merged and green it calls
him once for the **audit**: the parked, the choices the builders made
where the documents were silent, the latitude the judge granted, the
precision of every reviewer. `main` is stage 5's.

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
