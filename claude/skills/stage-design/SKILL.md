---
name: stage-design
description: Conducts stage 2 (Design) of the pipeline, under one /goal. Takes the locked discovery (the mock, its stories and ACs) and produces one proposal sized to the problem, with its evolution path (v1 → v2 → v3), debated with the user until he says it is closed, then six documents the plan cuts without asking. Scouts (Haiku 5.5, medium) read the system; an architect (Opus 5.5, high) proposes and later writes solution.md; an overengineering-guard (Opus 5.5, medium) cuts what serves no AC and no real risk; he watches a deck and a short video and debates through the question tool; five design-writers (Sonnet 5.5, high) write the other documents; four lenses review once; the stage closes with its report (video, deck, explainer). The session runs on Opus 5.5, high. Use after a discovery closes, or to resume a design by its slug.
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, AskUserQuestion, Artifact, Skill, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cp *), Bash(rm *), Bash(git *), Bash(node *), Bash(gitleaks *), Bash(make gitleaks *), Bash(realpath *)
---

# Stage 2: Design

The lock comes in: the mock he clicked, its stories, its acceptance
criteria (ACs). Out comes **one** way the system carries it, sized to
the problem, agreed with him, and written in six documents stage 3
cuts into entries without asking anyone. Agents left alone
overengineer; every page this stage adds is a page stage 4 builds and
carries. So: one proposal, a guard whose only job is to cut, one review
round.

## The bar

1. **One** proposal the size of the problem, with the evolution path
   (v1 → v2 → v3) and the signal that triggers each step.
2. He understands it from the video and the deck in 15 minutes or
   less, and aims to close it in one to three rounds; there is no cap.
3. Six documents stage 3 cuts without asking: every AC with its layer
   and proof; every Contract field marked required · optional ·
   nullable; every cloud resource with an owner.
4. Nothing in the documents that serves no AC and no real risk.
5. One review round; only blocking findings hold anything.

## How the stage runs

The opening hands him **one `/goal`**; from then on the stage runs to
its close on its own. Everything you ask him goes through the question
tool, so the goal never blocks on a plain reply. He is in the loop for
the debate (D3–D4) and, rarely, for a D6 decision that changes a locked
AC, adds a recurring cost or cannot be undone.

## The flow

```
/stage-design <slug> → opening: D0 scouts in background + the /goal
D0 reading → D1 his idea → D2 architect → guard → your ruling
→ D3 deck first, then video ≤ 60 s → D4 debate until "closed"
→ D5 six documents → review-prep → D6 four lenses → your ruling → fixes
→ D7 report ∥ cleanup → close: /clear + /stage-plan <slug>
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| D0 reading | `scout (Haiku 5.5, medium)` × N | `recon/<topic>.md`, each written by its scout |
| D1 his idea | you (Opus 5.5, high) | `notes.md` · His idea |
| D2 proposal | `architect (Opus 5.5, high)` → `overengineering-guard (Opus 5.5, medium)` | `proposal.md` |
| D3 present | `slides-builder (Sonnet 5.5, medium)` first; `video-builder (Sonnet 5.5, high)` beside it | deck + video on the front's link (Design, running) |
| D4 debate | you + **him** + the same `architect` by `SendMessage` | `proposal.md` closed, his words |
| D5 documents | `architect` (solution) ∥ `design-writer (Sonnet 5.5, high)` × up to 5 | six documents, `review-prep.mjs` green |
| D6 review | `design-consistency (Opus 5.5, medium)` ∥ `design-security (Opus 5.5, medium)` ∥ `design-contracts (Sonnet 5.5, high)` ∥ `overengineering-guard (Opus 5.5, medium)` | `reviews.md`, fixes verified |
| D7 report | `slides-builder` ∥ `artifact-builder (Sonnet 5.5, medium)`; `video-builder (Sonnet 5.5, high)` only if the system's figure changed | the Design tab of the front's link |

## What you read

| File | When |
|---|---|
| [references/right-sizing.md](references/right-sizing.md) | at the opening: how you rule the proposal, the cuts and the review |
| [references/documents.md](references/documents.md) | before D5 |
| [references/contracts.md](references/contracts.md) | before you rule a contracts finding |
| `claude/references/judging.md` | before D6: the shared scale (blocks · note) and owners |
| `00-discovery/stories.md`, `proposal.md`, the six documents | whole: you rule on them |

## Files

```
<designs-root>/<slug>/
├── .state.md                 stage: design, step, kit, mode, architect id, writer ids, report url
├── rulings.md · dreaming-notes.md
├── report/design/            video.mp4, deck/, explainer.html
├── 00-discovery/             the lock (read only)
└── 01-design/
    ├── notes.md              your record ([template](templates/notes.md))
    ├── recon/                <topic>.md, one per scout
    ├── proposal.md           the architect's
    ├── solution.md · data-and-contracts.md · tests.md · operations.md · security-and-access.md · screens.md
    ├── reviews/              guard-proposal.md, and one return per lens as it came
    └── reviews.md            your rulings ([template](templates/reviews.md))
```

## Opening

1. **The kit**: `realpath ${CLAUDE_SKILL_DIR}/../..`, written in
   `.state.md` as `kit:`. **Preconditions**: `.state.md` says
   `stage: design`; `00-discovery/` has `prototype/LOCK.json`, `stories.md` and
   the notes' "For the design". Missing: stop, back to stage 1.
2. **The house rules**: read `<kit>/../CLAUDE.md` and run its Open:
   the canary.
3. **D0 starts now**, in the background, before the goal (below).
4. **The goal.** One message with the scouts' status and the command
   to paste, written in his language:

```
/goal Conduct the design of <slug> with the stage-design skill to its close.
Done when: the proposal is closed in my words; the six documents passed one round
of the four lenses and review-prep; the Design tab of the front's link has its
video, deck and explainer; the last message lists what you decided in my place
and the next command. Every question to me goes through the question tool.
```

The design debate holds his attention: when another front is in its
discovery or its debate (the coordination file), D3 waits for it and
says so once; D0–D2 run anyway.

Missing tools: no `Artifact` (headless or cloud) → **local mode**: the
deck and video stay in `report/design/` and the messages give their
paths; no question tool → the questions as text, same shape, your pick
first.

## D0 · Reading

Read `stories.md` whole. Create `01-design/notes.md` from the
template. Then one `scout (Haiku 5.5, medium)` per question, all in
parallel, each writing its answer (quotes with `path:line`, the base as
`<repo>@<branch> <sha>`) to `recon/<topic>.md`:

- per area the lock touches: what exists today (routes, tables,
  screens, jobs) and the exemplary module of each kind of code it will
  need;
- the front's components and tokens, for the screens;
- the project's standards for anything the lock adds (a table, a
  route, a job, a screen, an alarm);
- the feature maps of those areas;
- other fronts: the coordination file, each `.state.md`, the files
  they share with this one.

Write the notes' "What exists today" (one line per fact, its source)
and "No-gos" (the stories' Out lines).

## D1 · His idea

His answer is already in `00-discovery/notes.md` "For the design" (the
last playback question). Copy it, verbatim, to the notes' "His idea".
You may disagree with it, only with a ground: an AC it does not meet, a
floor item, a cost, a one-way door, a standard. Write the ground in the
notes; the architect weighs it.

## D2 · The proposal

Dispatch `architect (Opus 5.5, high)` in propose mode with: the
workstream path, the lock, `notes.md`, `recon/`,
[references/right-sizing.md](references/right-sizing.md), the
template ([templates/proposal.md](templates/proposal.md)), the
standards' path, the repos with their base branch, the language, the
date. Keep its agent id in `.state.md`: every later turn is a
`SendMessage`, so it remembers why it chose. It researches an outside
premise (a vendor's API, a limit, a price) itself, with the source
cited.

Then `overengineering-guard (Opus 5.5, medium)` in proposal mode reads
`proposal.md` and cuts, with these paths in its brief:
`references/right-sizing.md`, `notes.md`, `stories.md`, `recon/` and
the standards; save its return to `reviews/guard-proposal.md`.
Send the cuts to the architect: it applies each or rebuts it with the
AC or real risk the mechanism serves. Read `proposal.md` whole and rule
each rebuttal (right-sizing §3 E): a rebuttal without a requirement
goes back once.

## D3 · Present

In one message, both in the background:

- `slides-builder (Sonnet 5.5, medium)`: the deck from `proposal.md`:
  the problem, the system in one figure, the main flow, the versions,
  where the architect disagrees with him and why, what the guard cut;
  the **last slide is the open points**. It is published first, to the
  front's link, Design tab, marked running.
- `video-builder (Sonnet 5.5, high)`: **60 s at most**, 720p, 24 fps:
  the system's figure first, the main flow, the versions. It jumps the
  render queue: it is the one video someone waits for live.

When the deck is published, ask through the question tool, the deck's
link and the video's ETA in the question ("the video arrives in ~N
min"): **Closed** (recommended when nothing is open) · **I have
points** (he writes them in Other).

## D4 · The debate, until "closed"

Each round:

1. His points, numbered, his words quoted, in the notes' "The debate".
2. An instruction ("drop the queue") is applied as given. A question
   for the architect ("why not a cron?") goes to it and comes back to
   him in one line. A choice goes through the question tool, the
   architect's pick first and marked. A fact a short run would show (a
   timing, a library's behaviour, a layout) is never his question: the
   architect spikes it and the result goes into the proposal.
3. One `SendMessage` to the architect with every ruled point and his
   words: it edits `proposal.md` in place and adds a row to "Changes
   per round".
4. `slides-builder` updates only the slides that changed and returns
   their ids; republish only those. The video is not redone.
5. The question again: the changes in a short table, **Closed** · **I
   have points**.

Every ruling is a line in `rulings.md`; one against the architect's
pick is also a `[taste]` line in `dreaming-notes.md`. A design that
needs a change to the project's standards is his to decide, always as
a question. When one story is left, propose the short route in one
line; on his yes, write `brief.md` from
`<kit>/skills/lets-cook/templates/brief.md` and load `lets-cook`.

When he says closed: `SendMessage` the architect to set `Status:
closed` with the date and his words. If the proposal grew during the
debate by something he did not ask for, the guard reads only that
delta; a cut applied after his close goes to the notes' "Veto list".

## D5 · The documents

[references/documents.md](references/documents.md) fixes what each
carries. In one message, in parallel:

- `SendMessage` the architect in solution mode: it writes
  `solution.md` from the closed proposal;
- one `design-writer (Sonnet 5.5, high)` per remaining document, write
  mode: the document it owns, the workstream path, `proposal.md`,
  `notes.md`, `recon/`, the lock, its template,
  [references/documents.md](references/documents.md) (and
  [references/contracts.md](references/contracts.md) for
  `data-and-contracts`), the standards' path, the language. Keep each
  id in `.state.md`.

**The writers' questions** come back in their reports. Merge the ones
that are one choice and answer each once, in the notes' "Questions
answered", then to every writer it touches:

| The question is… | You |
|---|---|
| answered by the proposal, the notes or the standards | answer it |
| his class (product, scope, data format, contract shape, security posture) with a conservative option: keeps the lock, reversible, no new cost | decide it, `ruled: conductor` in `rulings.md`, a line in the Veto list |
| changes a locked AC, adds a recurring cost, or cannot be undone | ask him, one question per decision, in one batch |

A new domain name: add it to the proposal's names table yourself, with
one `Edit`, then send it. A name of code (a component, a helper) is
the implementer's.

Then `node ${CLAUDE_SKILL_DIR}/scripts/review-prep.mjs <workstream>`:
a missing document, a missing "The implementer decides", an AC that
`tests.md` does not cite, or an `(open: Q-n)` left goes back to its
writer. A size warning goes to `dreaming-notes.md` and never stops the
stage.

## D6 · The review: four lenses, one round

In one message, in parallel, each with the six documents, the lock,
`proposal.md`, `notes.md` and the repos, plus its own paths:
consistency `references/documents.md` and `<kit>/skills/stage-discovery/scripts/proto.mjs`;
security and the guard `references/right-sizing.md` and the security
standard; contracts `references/contracts.md`:

| Lens | Asks |
|---|---|
| `design-consistency (Opus 5.5, medium)` | does any document contradict another, the proposal or the mock? does every screen in `screens.md` cover the states the mock reaches? |
| `design-security (Opus 5.5, medium)` | scope, another user's data, personal data, secrets, identities, the floor cases |
| `design-contracts (Sonnet 5.5, high)` | does each Contract hold against the code that exists and the code that will be generated? every field marked? |
| `overengineering-guard (Opus 5.5, medium)` | what in the documents serves no AC and no real risk? |

Save each return, as it came, in `reviews/`.

**Rule** every finding in `reviews.md` before any fix moves, by
`claude/references/judging.md`:

- owner the writer (or the architect, for `solution.md`) → fixed
  without asking him, by `SendMessage`;
- his class with a conservative option → you decide, `ruled:
  conductor`, Veto list;
- a locked AC, a recurring cost, something that cannot be undone → one
  question per decision, in one batch;
- real latitude → one line in the document's "The implementer decides";
- dismissed → with the quote that closes it.

The guard's finding blocks only with a concrete quote of what serves no
AC and no real risk; "could be simpler" is a note and never starts
anything. Stage the documents (`git add`) before the fixes go out;
verify each fix by `git diff -- <file>` against the finding, opening
the file only when they disagree, then `review-prep.mjs` again.

## D7 · The report, the cleanup, the close

**The report is finished before the stage closes.** In one message, in
the background, as `claude/docs/stage-report.md` describes:

| Tab | Builder | Brief |
|---|---|---|
| Video | `video-builder (Sonnet 5.5, high)` | D3's video stays, **unless** a "Changes per round" row added or removed a part: then re-render it from the closed proposal |
| Deck | `slides-builder (Sonnet 5.5, medium)` | the final deck: the decisions (those against the recommendation first), the risks accepted, what the guard cut, the versions |
| Explainer | `artifact-builder (Sonnet 5.5, medium)` | the architecture, interactive: the layers, the data moving through them, a v1 → v2 → v3 selector |

While they work, clean what this stage created (scratch folders, a
stack brought up for a check). When they return: every number on a
slide is checked against a document or the notes; `gitleaks dir
<workstream>` is clean (a finding stops the publish); publish to the
front's link with the label "design closed".

Then `.state.md` to `stage: plan`, commit the workstream folder (push
only on his word), and one message:

| | |
|---|---|
| The link | the front's report, Design tab |
| The design | the solution in one sentence · documents · review (found · sustained · dismissed) |
| Decided in your place | the Veto list, one line each (to veto, answer before the next stage) |
| Next | `/clear`, then `/stage-plan <slug>` |

A veto he sends before the next stage is applied by its writer, and
only the affected tab is rebuilt.

## Resuming

`/stage-design <slug>`: the opening's steps 1–2, then `.state.md` and
`notes.md`. Continue from the first step whose output is missing: no
`recon/` → D0; no `proposal.md` → D2; no deck on the link → D3;
`proposal.md` not closed → D4; a document missing → D5; no
`reviews.md` rulings → D6; otherwise D7. The architect and the writers
of an earlier session are gone: a fresh one reads its file (and
`proposal.md` with "Changes per round") before acting, and never
rewrites a finished file.

## How to write

Literal sentences, one idea each, concrete values, his words quoted
where they decide something.
