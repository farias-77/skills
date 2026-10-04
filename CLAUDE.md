# Pipeline house rules

Rules that cross every stage. Stage skills point here instead of
repeating them; a consuming project loads these rules alongside the
skills.

## Six stages, and what each asks of him

He is asked only what is his. What needs him in person (a key, an
account, a DNS record) is gathered up front in one pre-flight message;
everything else is decided, recorded in `rulings.md` and shown to him
afterwards for a veto.

| Stage | Mode | Where he is in the loop |
|---|---|---|
| 1 discovery | **interview + mock + lock** | he talks; a clickable mock is built and iterated in front of him; he validates through it and locks it. The text (journeys, stories, PR-FAQ) is derived from the locked mock |
| 2 design | **the talk + the debate** | he says what he has in mind; one proposal is presented as a video and slides and debated with him until he says it is closed, which is his approval; the four documents and the review run without him |
| 3 plan | **autonomous** | nowhere: the conductor rules everything, lists its choices at the report for his veto, and gathers what only he can hand over into the pre-flight |
| 4 execute | **pre-flight, then play, then his hands-on** | he hands over the pre-flight and pastes one goal; he is called once, at the end, when everything is merged and green: the session runs the environment, he uses the app and sends adjustments, built in the stage until he says ok. One blocking rule, in code |
| 5 release | **his play authorizes the head** | the play (`merge-from <audited head>` in the guard's allow file) is his "go"; the session merges, deploys, verifies and rolls back on its own, under the guard; it stops only on its written list |
| 6 close | **retro + launch video** | the retro is a file for the weekly; for the people, a launch video and a "what's new" text he forwards |

## Stage transitions: `/clear`, never `/compact`

When a stage closes and the next one begins, suggest the user runs
**`/clear`** — not `/compact`. Everything the next stage needs lives in
the files by contract (`.state.md`, the wave's stage folders, the
blueprint); a generated summary is session memory smuggled past the
source, and it can contradict the files later. If a stage suffers after
a clear, the bug is a missing file in the previous stage — fix the
file, not the context. Re-entry is always by workstream slug: the stage
skill resumes from `.state.md`.

## "Note this for the dreaming"

At any stage, when the user says to note something for the dreaming
("note this for the dreaming", or words to that effect), append it to the
workstream's `dreaming-notes.md` on the spot, marked **`[user]`** —
his words as close to verbatim as the entry allows, plus what he
already wants changed when he says it. These entries are first-class
input to the retro of stage 6 and to the weekly retro, which weighs
them first: he wrote them knowing what he wants.
This is separate from the standing rule that every stage notes its
own frictions as they happen — both feed the same file.

## Every agent is named with its model and effort

In every skill, agent table, README paragraph and message that names
an agent, the name carries the model and the effort in parentheses:
`journey-scribe (Sonnet 5.5, high)`, `the conductor (Opus 5.5,
high)`, `disc-blind-reader (Sonnet 5.5, low)`. Model and effort live
in the agent's frontmatter (`model:`, `effort:`); the parentheses are
how the reader sees the cost of a step without opening the file. Only
Opus 5.5 and Sonnet 5.5 are used. The one table of every agent, with
the evidence for each pick, is [docs/models.md](docs/models.md);
`node scripts/check-models.mjs` fails when a frontmatter, a workflow
or the table disagree.

## Knowledge packs

Each specialist reads the packs of its craft before it works:
`claude/skills/pack-<name>/` (design taste, motion and 3D, interview
and journeys, right-sizing, parallel planning and local CI, Go
backend, React frontend, ops, release, launch video, model
selection). A pack is a checklist plus recipes, never an essay. Packs
set `user-invocable: false`: they stay out of the `/` menu and can
still be preloaded. A registered agent preloads them through `skills:`
in its frontmatter; an agent run inline by a workflow gets each pack's
`SKILL.md` path in its prompt and reads it first; a session loads one
with the Skill tool when it needs it. A pack cites itself by section
(`§3 C1`, `§5 R2`), and agents cite those numbers: keep them.

## The session never reads to look something up; it sends a scout

Every session that conducts a stage is an expensive model in a long
conversation — the conductor at discovery, design, plan and close, the
session at execution and at release. A file
such a session opens itself does not cost one read: it enters the
context and is paid again on every turn that follows. So the rule is
the same at every stage: **when the session needs something it has not
read — what a document says, what a repo already has, what a standard
requires, what a past workstream recorded — it dispatches
`scout` (Sonnet 5.5, low) and works from what comes back.**

The scout locates and quotes; it never summarizes and never concludes.
It returns the literal lines with their `path:line`, where it looked,
and what it did not find — that last part is what lets the session
tell "it is not there" from "the scout missed it". The session opens a
file itself only when it is about to **rule** on that text: judging a
finding, approving a document, writing a decision. Scout to find; the
session to decide.

What the rule does not cover: a file the session is writing or has
just written, a file the user named and asked to be read now, and a
stage's own template. Those the session reads.

## How a question is asked

Every question through the question tool has one shape. The question
text carries the context (what this is about, the quote, the gap, why
it matters) and asks one clear thing. Each option's label is the
answer itself, in the words the user would say; its description is
why that answer is an option: what it costs, what it buys, when it is
the right one. The recommended option comes first and says so. Four
questions to a call, at most. Never a board he answers in prose.

## Every reply in the terminal is built to be followed at a glance

The user reads a lot of pipeline output in a day and skims. A reply
that names agents, options, findings or steps is a table; a sequence
or a pipeline is a flow drawn in a code block; a list is short
topics, one or two lines each; a paragraph is for the one argument
that is prose. A table carries no more columns than the reader needs
to decide. This holds for every stage skill and every message the
conductor writes.

## The user's rulings are the record

The conductor judges every finding by the stage's
`references/judging.md`; there is no judge agent, and at execution
no judge at all.

- **Discovery.** His validation is **the lock**: his word "lock it"
  is the gate, recorded as `<date> · discovery D3 · lock v<N> · ruled:
  locked · "<his words>"` (with an override line when he locks over
  open items). Then one review round, automatic, verified by reading:
  no second round and no delta. Wording goes to the author without a
  question; product, scope and confirmed decisions go to him, one
  question per decision, in one batch.
- **Design.** He is in the loop twice: the talk (what he has in mind)
  and the debate over the one proposal, until he says it is closed;
  each choice of the debate goes through the question tool and into
  `rulings.md`. Then one reviewer, one round, blocking findings only,
  ruled by the conductor: there is no second round. After he closed
  the proposal, a decision of his class is ruled by the conductor
  conservatively, marked `ruled: conductor`, and listed for his veto
  in the close message; a real observation that is declared latitude
  goes to the implementer, as one line in the document's "The
  implementer decides".
- **Plan.** No user in the loop. One review round, automatic: one
  reviewer and the blind readers, filtered. The conductor rules
  everything, his classes included (`ruled: conductor`); execution
  latitude goes to the builder as a line in the brief. Nothing reaches
  him as a question; the report lists every choice for his veto, and
  what only he can hand over goes to the pre-flight.
- **Execution.** Done is the plan's ACs met and the gate green. One
  blocking rule, in code, by the execute stage's `judging.md`: a
  finding of `reviewer (Opus 5.5, high)`, `qa-frontend (Opus 5.5,
  medium)` or `qa-backend (Opus 5.5, medium)` blocks only on an AC not
  met, a reproduced bug, a security hole or a written rule broken,
  with its proof; the entry gets one fix pass. The rest are notes on
  the PR and open no work. What is his (an entry still blocking after
  its fix pass, what needs him in person, the builders' conservative
  calls in his classes) is parked or listed, never asked, and he rules
  it at the audit that closes stage 4. At the hands-on before it he
  uses the app; each adjustment he asks for is built as an entry
  `A.<n>`, and his "ok" closes the hands-on, recorded in `rulings.md`.
- **Release.** His ruling is **the play**: the pre-flight message and
  the play line, recorded verbatim in the trace and in `rulings.md`.
  An answer to a question on the stop list is a ruling too. A fix
  built during the release is an entry through the stage-4 pipeline,
  triaged there the same way.
- **Close.** Nothing is ruled: the retro records what went wrong and
  the ideas it suggests, and his comments go in verbatim. The pipeline
  changes only at the weekly retro, where he rules each group of ideas
  gathered across the week's workstreams (apply, park, drop).

When a ruling is asked, it goes **through the question tool**, in the
house shape: one question per **decision** (findings that resolve by
the same choice are one question); the context in the question itself
(source, severity, quote, gap, fix, the conductor's reason), the
rulings as the answers with the conductor's pick first and marked as
his, four to a call. Wording fixes are applied without a question and
without a veto.

Every ruling is appended, as it happens, to the workstream's
**`rulings.md`** (workstream root; created on the first ruling), one
line each:

```
2025-11-04 · design · design-reviewer#R-2 · proposed: dismissed · ruled: sustained · "the cost line encodes the SLA, it stays"
```

Date · stage and round (or the entry at stage 4) · the finding id ·
what the conductor proposed · what was ruled (`ruled: conductor` when
the conductor ruled in his place) · the reason, his verbatim where he
gave one.
The stage's own audit (`reviews.md`, the lane trace) keeps the detail;
`rulings.md` is the index the retro reads first, next to
`dreaming-notes.md`. A pattern in it — a ruling he keeps overruling, a
class he keeps dismissing, a design card where he chose against the
recommendation — is noted on the spot in the workstream's
**`taste-notes.md`** (workstream root; created on the first note), one
line each, as the pattern rather than the instance. Nothing there is a
rule: the retro carries it, and the weekly retro decides, with him,
what each note becomes — a doctrine line, a skill line, an agent
prompt — or whether it is dropped.

## The blueprint is built, never edited

No agent opens `blueprint.html`. Each stage writes JSON under
`<workstream>/blueprint/` in the shapes `claude/blueprint/schema/`
fixes, and `node claude/blueprint/build.mjs <workstream>` assembles
the shell from the pipeline repo, the data and the strings of the
workstream's language into one self-contained file, validating the
data and refusing with the field named. The shell is the repo's: a
fix there reaches every workstream at its next build, and no
workstream carries its own copy to port. Only the stages that have
data appear on the page; a stage that has not run is a step in the
journey line, never a tab.

The shell's invariants, kept in the repo and never negotiated per
workstream: the page never scrolls sideways (only tables, figures and
wireframes scroll inside their own box); light and dark themes, a
monochrome palette, the theme button on the rail; body text 18 px on
a wide column; every section opens with a plain-language layer
written for the newcomer on the team, and the documents' detail sits
behind a click. A stage that needs a picture writes mermaid in the
data; the page renders it.

The blueprint is written in the language the user talks to you in:
`workstream.json` names it, and `claude/blueprint/strings.<lang>.json`
carries the shell's own words. A new language is a new strings file in
the repo, not a translated copy of the shell.

## The blueprint is the report; the files are the record

The stage documents (`*.md` under the workstream) are written for the
machine: as complete and exact as the next stage needs — every entity,
every query, every alarm, every class of the sweep. **The blueprint is
not their projection.** It is the team reporting to a technical lead
who wants to understand how the thing works and what matters, in
twenty minutes, not three hours. Same tabs, same shell; another
altitude.

- **Natural to read, first of all.** Short sentences, plain words, one
  idea per paragraph. Every section opens with a picture, a diagram,
  a chart or a table, and the prose supports it, never the reverse.
  Nothing dense: a reader who skims the visuals and the first lines
  has the shape of the thing; the text is there for whoever wants
  the next layer. If a paragraph needs a second read, it is a
  diagram or a table that was not drawn.
- **The test for a detail:** it enters the blueprint if the reader
  would decide something differently knowing it. Otherwise it stays in
  the file — and the file is named as the authority ("the exact numbers
  live in `data-and-contracts.md`"), so nobody reads the blueprint as source.
- **The intro of every tab is the report.** Read only the opening
  paragraph and you know what this is, how it is organized, what it
  costs. Then, up front: *what needs your eye here* — the decisions
  taken in the user's place, the tradeoffs assumed, the numbers that
  encode a business rule. The rest is there to be trusted, and says so.
- **Decisions taken in the user's place never leave.** They only
  shrink: the question, the options in one line each, the pick, why —
  three sentences.
- **Lists are curated, never complete.** The entities that explain the
  model, not all of them; the alarms that would wake someone; the
  sweep's verdict and what it found, not the class-by-class checklist;
  the resources that explain the bill. Group what is one idea ("the two
  snapshots", "the content rows"). The counts in section titles count
  what is shown, not what exists.
- **Plain technical language.** "Takes a lock so two cycles never run
  together", not "conditional put on the lock item keyed by run_id".
  Technical names only when they are the name of the thing. Per
  mechanism, three short paragraphs at most: *what happens · when it
  goes wrong · worth a look* — the last one is the review hook.
- **Machine provenance stays out:** reference lists to research files,
  line-by-line JSON comments, projection expressions, per-round
  history. Diagrams earn their place when they replace prose — the
  whole cycle in one picture, yes; one per mechanism, no.
- **Ceiling:** the Design tab reads in 20–30 minutes across its seven
  sections, from the proposal and the debate to the review; the word
  caps of `claude/blueprint/schema/design.md` hold it there.
  Plan and Execution tabs hold the same altitude.

Discovery keeps the PR-FAQ, the stories and the locked journeys with
their frames whole, because they are the demand itself and the user
approved them there; whole behind the
click, with the plain sentence in front.

## Every stage closes with video, slides, blueprint

Three layers of one report, read in this order: the **video** says how
it works in one or two minutes, the **slides** give the details one
idea at a time, the **blueprint** holds everything. He goes up one
layer only when he wants more detail, so each layer is whole at its
altitude and never sends him up for what it should have shown. On a
normal day he watches and reads; the blueprint is for when he needs
it. The stage's close message names the three in that order, nothing
before them. The procedure — `video-scribe (Sonnet 5.5, medium)`,
`slides-scribe (Sonnet 5.5, high)`, the publishing and the links both
ways — is [docs/stage-report.md](docs/stage-report.md). The close is
the exception: no review video and no slides. Its layers are the
**launch film**, made for the product's users and the team from the
real app, portfolio-grade, with a step-by-step tutorial per feature,
delivered on its own launch page; and the retro tab of the blueprint.

## Every stage measures itself, in one shape

Each stage's session writes `<stage-folder>/telemetry.json` as it runs:
a row per step (wall-clock, his minutes), the agents by model and
effort with their hours and tokens, the rounds, the findings by class,
the cost when the harness reports it, and the gaps it could not
measure. The shape is the same at every stage
([docs/telemetry.md](docs/telemetry.md)); the close sums the six files
into `metrics.json` with a script, and the weekly retro compares them.
A value nobody measured is `null`, never estimated.

## The CI is local

The gate runs on this machine, never on a hosted queue. In execute the
session is the queue host and the only process that merges into
`feat/<workstream>`: per ready entry, the base comes in by a merge
(never a rebase), the paths outside the node's Owns and Extends are
listed, the merged tree passes the affected gate, it merges, and the signoff
posts `local-ci/affected` on the merged head. The whole gate runs once
at the end, in a fresh worktree, and only it posts **`local-ci`**, the
one context `main` requires. No agent posts a status; the guard denies
it. Hosted CI keeps the deploy, the environments and the attestations.

## One guard for what cannot be undone

`claude/hooks/guard-irreversible.sh` is the only guard;
`/pipeline-setup` installs it in the project on Bash and every file
tool. It denies the irreversible (destroying infrastructure, deleting
data, force-push, a forged status, edits to itself or the settings),
asks before a secret's value is read or written, and asks before a
merge into a protected branch whose head his play did not authorize.
The merge and the production deploy sit in `allow` because the guard
holds them.
