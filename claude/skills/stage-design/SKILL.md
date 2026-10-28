---
name: stage-design
description: Stage 2 of the pipeline, under one /goal. Takes the locked discovery and produces one solution sized to the problem, with its evolution path (v1 → v2 → v3), shown to him as one visual page and debated until he says it is closed; then five documents the plan cuts without asking, reviewed once by four lenses. Use after a discovery closes, or to resume a design by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, ListAgents, AskUserQuestion, Artifact, Skill, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cp *), Bash(rm *), Bash(git *), Bash(node *), Bash(gitleaks *), Bash(make gitleaks *), Bash(realpath *)
---

# Stage 2 · Design

Design decides **how** the system carries what discovery locked: the
stories, their acceptance criteria (ACs) and, when a screen changes, the
mock. Agents left alone overengineer, and every page this stage adds is
a page stage 4 builds and carries. So: one solution, a guard whose only
job is to cut, one page he reads instead of a document, one review
round.

## The bar

The stage is done when every line holds:

1. `solution.md` is **one** solution the size of the problem, with the
   evolution path (v1 → v2 → v3) and the signal that triggers each step.
2. He closed it in his own words, from the page, in rounds he chose.
3. The five documents let stage 3 cut entries without asking: every AC
   has its layer and proof; every Contract field is marked required ·
   optional · nullable; every cloud resource has an owner.
4. Nothing in the documents serves no AC and no real risk.
5. One review round ran; every finding is ruled and every fix verified.
6. The report's Explainer is final and published.

## The flow

```
/stage-design <slug> → opening: D0 scouts (background) + the /goal
  D0 reading → D1 his idea → D2 solution drafted → guard cuts → you rule
  → D3 the page + one question ◄ him
  → D4 rounds until "closed" ◄ him → the architect expands solution.md
  → D5 five documents → review-prep → D6 four lenses → you rule → fixes
  → D7 report → /clear, /stage-plan <slug>
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| D0 reading | `scout` (Haiku 5.5, high) × N, background | `recon/<topic>.md` |
| D1 his idea | you (Opus 5.5, medium) | `notes.md`: His idea, What exists today, No-gos |
| D2 solution | `architect` (Opus 5.5, high) → `overengineering-guard` (Opus 5.5, medium) | `solution.md` (draft), `reviews/guard-proposal.md` |
| D3 the page | `artifact-builder` (Sonnet 5.5, medium) | `report/design/explainer.html` on the link, Design running |
| D4 debate | you + him + the same `architect` and `artifact-builder` by `SendMessage` | `solution.md` closed and expanded, the page updated |
| D5 documents | `design-writer` (Sonnet 5.5, high) × up to 5 | the five documents, `review-prep.mjs` green |
| D6 review | `design-consistency` ∥ `design-security` (Opus 5.5, medium) ∥ `design-contracts` (Sonnet 5.5, high) ∥ `overengineering-guard` | `reviews.md`, fixes verified |
| D7 report | the same `artifact-builder`; video and slides only when he asks | the Design tab, final |

## What you read

| File | When |
|---|---|
| [references/right-sizing.md](references/right-sizing.md) | at the opening: how you rule the solution, the cuts and the review |
| [references/documents.md](references/documents.md) | before D5 |
| [references/contracts.md](references/contracts.md) | before you rule a contracts finding |
| `<kit>/references/judging.md` | before D6: the scale (blocks · note) and the owners |
| `00-discovery/stories.md`, `solution.md`, the five documents | whole: you rule on them |

## Files

```
<designs-root>/<slug>/
├── .state.md            stage: design, step, kit, mode, architect id, page builder id, writer ids, report url
├── rulings.md · dreaming-notes.md
├── report/design/       explainer.html (from D3), video.mp4 and deck/ when asked
├── 00-discovery/        the lock (read only)
└── 01-design/
    ├── notes.md         your record (template: templates/notes.md)
    ├── recon/           <topic>.md, one per scout
    ├── solution.md      the architect's: draft → closed → expanded (template: templates/solution.md)
    ├── data-and-contracts.md · tests.md · operations.md · security-and-access.md · screens.md
    ├── reviews/         guard-proposal.md, one return per lens as it came
    └── reviews.md       your rulings (template: templates/reviews.md)
```

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..` is the kit; write
   it in `.state.md` as `kit:`. **Preconditions:** `.state.md` says
   `stage: design`; `00-discovery/` has `stories.md` and the notes'
   "For the design", and `prototype/LOCK.json` when `.state.md` says
   `screen: yes`. Missing: stop, back to stage 1. With `screen: no`,
   `screens.md` is the line `None: no screen changes`.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open: the
   pulls, who else is working.
3. **D0 starts now**, in the background.
4. **The goal.** One message with the scouts' status and the command
   to paste:

```
/goal Conduct the design of <slug> with the stage-design skill to its close.
Done when: the solution is closed in my words; the five documents passed one round
of the four lenses and review-prep; the Design tab of the workstream's link has its
final explainer and the tabs I picked; the last message lists what you decided in
my place and the next command. Every question to me goes through the question tool.
```

**His attention.** When another workstream holds him in a discovery or
a debate (the coordination file), D3 waits for it and says so once;
D0–D2 run anyway.

Without the `Artifact` tool (a headless or cloud session) the stage
runs in **local mode**: the page stays in `report/design/` and the
messages give its path. Without the question tool, the questions go as
numbered text, your pick first.

## D0 · Reading

Read `stories.md` whole. Create `01-design/notes.md` from the
template. Then one `scout` per question, all in parallel, each writing
its answer (quotes with `path:line`, the base as `<repo>@<branch>
<sha>`) to `recon/<topic>.md`:

- the standards book (the folder the project's `CLAUDE.md` names):
  `architecture.md` (the map, the golden paths, the infrastructure) and
  the rules of `engineering.md`, `security.md` and `operations.md` the
  lock touches; with no book, one line to him proposing `/standards
  setup`, and the scouts read the code instead;
- per area the lock touches: what exists today (routes, tables,
  screens, jobs) and the exemplary module of each kind of code it will
  need;
- the frontend's components and tokens, for the screens;
- other workstreams: the coordination file, each `.state.md`, the files
  they share with this one.

Write the notes' "What exists today" (one line per fact, its source)
and "No-gos" (the stories' Out lines).

## D1 · His idea

His answer is already in `00-discovery/notes.md` "For the design" (the
playback's design question). Copy it verbatim to the notes' "His idea".
You may disagree with it only on a ground: an AC it does not meet, a
floor item, a cost, a one-way door, a standard. Write the ground in the
notes; the architect weighs it.

## D2 · The solution, drafted and cut

Dispatch `architect` in propose mode with: the workstream path, the
lock, `notes.md`, `recon/`,
[references/right-sizing.md](references/right-sizing.md),
[templates/solution.md](templates/solution.md), the standards' path,
the repos with their base branch, the language, the date. Keep its
agent id in `.state.md`: every later turn is a `SendMessage`, so it
remembers why it chose.

Then `overengineering-guard` in proposal mode reads `solution.md`, with
`references/right-sizing.md`, `notes.md`, `stories.md`, `recon/` and
the standards in its brief; save its return to
`reviews/guard-proposal.md`. Send the cuts to the architect: it applies
each or rebuts it with the AC or real risk the mechanism serves. Read
`solution.md` whole and rule each rebuttal (right-sizing §3 E): a
rebuttal without a requirement goes back once.

## D3 · The page and the first question

Dispatch `artifact-builder` in the background, with `solution.md`,
`notes.md`, `stories.md`, the output path `report/design/explainer.html`
and this brief: **the solution as visual as possible**, understood by
skimming. The system as a **mind map**, starting from the project's
`architecture.md`: the parts, the code patterns they follow and the
infrastructure they run on, every connection drawn, what this demand
adds or changes highlighted; data moving through each main flow,
step by step, then where it fails and what the user sees; a v1 → v2 → v3
selector with each version's signal; where the architect disagrees with
him, side by side; what the guard cut; the open choices last. Motion
wherever something moves through the system, never as decoration. Text
only as short labels. Keep its agent id in `.state.md`.

Publish the page to the workstream's link (Design, running) once its
look check came back clean. Then one message: the link and the solution
in one sentence. Then **one question call**: each open choice and each
disagreement as its own question, the architect's pick first; and
"Is the solution closed?" with **Closed** · **I have points** (he
writes them in Other).

## D4 · The rounds, until "closed"

Each round:

1. His points, numbered, his words quoted, in the notes' "The debate".
2. An instruction ("drop the queue") is applied as given. A question
   for the architect ("why not a cron?") goes to it and comes back to
   him in one line. A choice goes through the question tool, the
   architect's pick first. A fact a short run would show (a timing, a
   library's behaviour) is never his question: the architect spikes it
   and the result goes into the solution.
3. One `SendMessage` to the architect with every ruled point and his
   words: it edits `solution.md` in place and adds a row to "Changes
   per round".
4. One `SendMessage` to the page's builder with that row: it redraws
   only what changed. Republish once its look check is clean.
5. The question again: the changes in a short table, **Closed** · **I
   have points**.

Every ruling is a line in `rulings.md`; one against the architect's
pick is also a `[taste]` line in `dreaming-notes.md`. A design that
needs a change to the project's standards is his to decide, always as
a question. When one story is left, propose the short route in one
line; on his yes, write `brief.md` from
`<kit>/skills/lets-cook/templates/brief.md` and load `lets-cook`.

A solution that needs a pattern or a rule the book does not have (a
new kind of code, a new resource kind) is a `[standards]` line in
`dreaming-notes.md`; the close carries it to the weekly retro.

**Closed.** `SendMessage` the architect in close mode: it sets `Status:
closed` with the date and his words, and expands `solution.md` in place
for the builders (below). When the debate grew the solution by
something he did not ask for, the guard reads only that delta; a cut
applied after his close goes to the notes' "Veto list".

## D5 · The five documents

[references/documents.md](references/documents.md) fixes what each
carries. In one message, one `design-writer` per document in write
mode: the document it owns, the workstream path, `solution.md`,
`notes.md`, `recon/`, the lock, its template,
[references/documents.md](references/documents.md) (and
[references/contracts.md](references/contracts.md) for
`data-and-contracts`), the standards' path, the language. Keep each id
in `.state.md`. A document with nothing to carry is one line you
write, `None: <why>`, with no writer.

**The writers' questions** come back in their reports. Merge the ones
that are one choice and answer each once, in the notes' "Questions
answered", then to every writer it touches:

| The question is… | You |
|---|---|
| answered by the solution, the notes or the standards | answer it |
| his class (product, scope, data format, contract shape, security posture) with a conservative option: keeps the lock, reversible, no new cost | decide it, `ruled: conductor` in `rulings.md`, a line in the Veto list |
| changes a locked AC, adds a recurring cost, or cannot be undone | ask him, one question per decision, in one call |

A new domain name: add it to the solution's names table yourself, with
one `Edit`, then send it. A name of code (a component, a helper) is
the implementer's.

Then `node ${CLAUDE_SKILL_DIR}/scripts/review-prep.mjs <workstream>`:
a missing document, a missing "The implementer decides", an AC that
`tests.md` does not cite, or an `(open: Q-n)` left goes back to its
writer. A size warning goes to `dreaming-notes.md` and never stops the
stage.

## D6 · The review, one round

In one message, in parallel, each with the six files (`solution.md`
and the five documents), the lock, `notes.md` and the repos, plus its
own paths: consistency `references/documents.md` and
`<kit>/skills/stage-discovery/scripts/proto.mjs`; security and the
guard `references/right-sizing.md` and the security standard;
contracts `references/contracts.md`.

| Lens | Asks |
|---|---|
| `design-consistency` | does any file contradict another or the mock? does every screen in `screens.md` cover the states the mock reaches? |
| `design-security` | scope, another user's data, personal data, secrets, identities, the floor cases |
| `design-contracts` | does each Contract hold against the code that exists and the code that will be generated? every field marked? |
| `overengineering-guard` (lens mode) | what in the documents serves no AC and no real risk? |

Save each return, as it came, in `reviews/`. **Rule** every finding in
`reviews.md` before any fix moves, by `<kit>/references/judging.md`:

- owner the writer (or the architect, for `solution.md`) → fixed
  without asking him, by `SendMessage`;
- his class with a conservative option → you decide, `ruled:
  conductor`, Veto list;
- a locked AC, a recurring cost, something that cannot be undone → one
  question per decision, in one call;
- real latitude → one line in the file's "The implementer decides";
- dismissed → with the quote that closes it.

The guard's finding blocks only with a concrete quote of what serves no
AC and no real risk; "could be simpler" is a note. Stage the files
(`git add`) before the fixes go out; verify each fix by `git diff --
<file>` against its finding, opening the file only when they disagree,
then `review-prep.mjs` again.

## D7 · The report and the close

Send the page's builder the closed `solution.md` and its "Changes per
round": the page shows the solution as closed, his decisions marked
settled, the cuts kept. Meanwhile ask him the close's question (also
make: Video · Deck, none is a valid answer) and dispatch what he picks,
as `<kit>/../docs/stage-report.md` describes:

| Tab | Builder | Brief |
|---|---|---|
| Explainer (always) | the same `artifact-builder` | the D3 page, final |
| Video (when asked) | `video-builder` (Sonnet 5.5, high) | the system's figure first, the main flow, the versions; 60 s at most |
| Deck (when asked) | `slides-builder` (Sonnet 5.5, medium) | the decisions (those against the recommendation first), the risks accepted, what the guard cut, the versions |

While they work, remove what the stage created (scratch folders, a
stack brought up for a spike). When they return, check every number on
a slide against `solution.md` or the notes, run `gitleaks dir
<workstream>` (a finding stops the publish), and publish to the
workstream's link labelled "design closed".

Then `.state.md` → `stage: plan`, commit the workstream folder (push
on his word), and one message: the link · the solution in one sentence
· the review (found · sustained · dismissed) · decided in your place
(the Veto list, one line each, to veto before the next stage) · the
next play:

```
/clear
/stage-plan <slug>
```

A veto he sends before the next stage is applied by its writer, and
only the affected tab is rebuilt.

## Resuming

`/stage-design <slug>`: the opening's steps 1–2, then `.state.md` and
`notes.md`. Continue from the first step whose output is missing: no
`recon/` → D0; no `solution.md` → D2; no page on the link → D3; status
not closed → D4; a document missing → D5; no rulings in `reviews.md` →
D6; otherwise D7. The agents of an earlier session are gone: a fresh
one reads its file (and `solution.md` with "Changes per round") before
acting, and never rewrites a finished file.
