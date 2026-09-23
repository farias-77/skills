# Pipeline house rules

Rules that cross every stage. Stage skills point here instead of
repeating them; a consuming project loads these rules alongside the
skills.

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
("anote no dreaming note", or words to that effect), append it to the
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
`disc-author-stories (Sonnet 5, high)`, `the conductor (Opus 5,
high)`, `disc-blind-reader (Haiku 4.5, low)`. Model and effort live
in the agent's frontmatter (`model:`, `effort:`); the parentheses are
how the reader sees the cost of a step without opening the file.

## The session never reads to look something up; it sends a scout

Every session that conducts a stage is an expensive model in a long
conversation — the conductor at discovery, design, plan and close, the
session at execution and at release. A file
such a session opens itself does not cost one read: it enters the
context and is paid again on every turn that follows. So the rule is
the same at every stage: **when the session needs something it has not
read — what a document says, what a repo already has, what a standard
requires, what a past workstream recorded — it dispatches
`scout` (Haiku 4.5, max) and works from what comes back.**

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

At discovery, at design and at plan the conductor judges every
finding by the stage's `references/judging.md`; there is no judge
agent. The ruling names the owner of each sustained finding: wording
goes to the author (at design and plan: the document's or the goal's
writer) without a question; product, scope, cost, data format,
contract shape, security posture, the sequence and confirmed
decisions go to him; at design a real observation that is declared
latitude goes to the implementer, as one line in the document's "The
implementer decides" section, and at plan to the worker, as one line
in the goal's "The worker decides" section. He rules what is his,
except at plan: there the conductor rules the user-owned findings
against the cut he approved when the wave's walk and required rows
stay as they are (marked `ruled: conductor` in `rulings.md`) and
lists them at the close for veto; only a finding that would change
what a wave accepts reaches him as a question. The budget at
discovery is three rounds at most, the user asked after each; at
design, round 1 is whole and automatic and rounds 2 and 3 run only on
his word and only over the delta, three at most; at plan, round 1 is
whole and automatic, round 2 runs automatically over the delta, and a
third only on his explicit call. His validation of every story
(confirm / reduce / adjust / cut) is a ruling too, recorded the same
way.
**The rulings are asked through the question tool, always**, in the
house shape: one question per **decision** at every stage (findings
that resolve by the same choice are one question); the context in
the question itself (source, severity, quote, gap, fix, the
conductor's reason), the rulings as the answers with the conductor's
pick first and marked as his, four to a call. Wording fixes are applied without a question and without a
veto: the user reads the blueprint at the approval and reports there
whatever he wants changed. At execution the judge agent of each entry
(`exec-judge`) rules every finding of its rounds by the execute stage's
`judging.md`; what is his (a question the judge raised, an entry still
sustained after three rounds) is parked, never asked, and the user
rules it with the builders' choices at the audit that closes stage 4;
a ruling he gives there is a ruling too. At release his one ruling is his answer to "vai?" on the release PR,
recorded verbatim in the trace and in `rulings.md`; a fix built during
the release is an entry through the stage-4 pipeline, judged there by
`exec-judge`. At the close nothing is ruled: the retro records what
went wrong and the ideas it suggests, and his comments go in verbatim.
The pipeline changes only at the weekly retro, where he rules each
group of ideas gathered across the week's workstreams (apply, park,
drop).
Every ruling is appended, as it happens, to the workstream's
**`rulings.md`** (workstream root; created on the first ruling), one
line each:

```
2026-09-01 · design r3 · design-reviewer-infra#2 · judge: dismissed · ruled: sustained · "the cost line encodes the SLA, it stays"
```

Date · stage and round (or the PR at stage 4) · the finding id · what
the judge proposed · what he ruled · his reason, verbatim where he
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
  live in `data-model.md`"), so nobody reads the blueprint as source.
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
- **Ceiling:** a wave's Design tab reads in 20–30 minutes — roughly
  6–8 thousand words across its nine subtabs; a subtab in two or three.
  Plan and Execution tabs hold the same altitude.

Discovery keeps the PR-FAQ and the stories whole, because they are
the demand itself and the user approves them there; whole behind the
click, with the plain sentence in front.
