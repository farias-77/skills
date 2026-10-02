---
name: stage-plan
description: Conducts stage 3 (Plan) — takes an approved design and cuts, with the user, how the whole demand gets built as fast as the machine allows. One scout (Sonnet 5.5, low) per area of the codebase the design touches writes what exists today and the golden path (the exemplary module) for each kind of code the design adds, and one measures how many stacks the machine holds; the conductor (Opus 5.5, medium) arrives with the cut: the foundation (every migration, the whole contract with its generated code, the modules registered, the shared pieces and factories, the first exemplar of each new kind; after it only the doctrine's shared files are frozen) and the graph of entries (a story or a small group, built vertically by one builder, within a size cap; an edge only where an entry's proof needs another entry's behavior), sized, the critical path marked; the user shapes and approves it and decides every open rule of doctrine or test; then the foundation's writer (Sonnet 5.5, high) fixes every name first, and one writer per entry writes, against it, the brief its builder and verifier receive (checkable acceptance with its side effects, golden paths, what it uses from the foundation, what it extends), deciding nothing; a review round of three lenses (Sonnet 5.5, high), two blind readers (Sonnet 5.5, low) and a referee (Sonnet 5.5, low) per brief, judged by the conductor; round 2 automatic over the delta, a third only on the user's word; the blueprint's Plan tab read by the user at the close, the pre-flight handed over. Runs in Claude Code with an Opus 5.5 session at medium effort. Use after a design is approved, or to resume a plan in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, SendMessage, Workflow, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git status *), Bash(git diff *), Bash(git add *), Bash(git commit *), Bash(node *)
---

# Stage 3: Plan

A definition of how it works comes in: the design of the whole
demand. A cut comes out: **from A to B, as parallel as the machine
allows**. A is what exists in the codebase today; B is what the
design says exists at the end. The plan re-decides nothing of the
design: it says what is laid down first, what is then built at the
same time, what waits for what, and how each piece is proved by a
command.

Three words:

| Word | What it is | At stage 4 |
|---|---|---|
| **foundation** | everything the entries would otherwise fight over, laid down once: every migration of the demand (expansion only), the whole API contract and its generated code, the new modules registered, the shared pieces the design names, the factories the proofs seed with, the first exemplar of each kind of code the codebase does not have yet. One entry, built and merged first | built alone, before any entry |
| **entry** | one story, or a small group of stories that share a screen or a flow and only prove together. Built **vertically**: back and front and tests, by one builder in its own worktree with its own stack, within the size cap. Proved by its **acceptance**: lines a verifier turns into checks before any code, each naming what is observed and the side effect read back | a verifier writes the checks, then one builder, one branch, one merge |
| **edge** | entry B waits for entry A only when B's **proof** needs A's behavior (a button A builds, a state A's action produces). Data is not an edge: the foundation's factories seed it. Everything with no edge runs at once, up to the concurrency cap | the session starts an entry the moment its edges are merged, or `ready` and not yet merged (the entry stacks on that branch) |

The foundation is what makes the fan-out possible. After it, no entry
edits a migration, the contract, the generated code or the module
registry: those are the doctrine's shared files, the ones two parallel
entries would collide on, and they are **frozen**. An entry that finds
one must change stops; the change is a foundation amendment at stage
4, small and serial, and the entries in flight take it in by a merge.
**Nothing else is frozen.** A token, a shared component, a fake, a
domain type, a test helper that the foundation created is extended by
the entry that needs more of it: by addition, or by a correction that
brings it to what the design says, never by a rename or a removal. The
brief declares it under "Extends", and the merge brings it to the
others. The plan never widens the doctrine's list of shared files. (Of
the 16 amendments in the landings and the ingestion, 8 touched no
shared file: tokens, a component's props, a shared icon, an enum's
missing values, a fake's mode, an exported rule.)

The session is the conductor, **Opus 5.5 at medium effort**. It runs
the cut with the user, writes `02-plan/plan.md` as the session closes,
dispatches scouts and writers, runs the review, judges every finding,
builds the blueprint, and hands over the pre-flight. It writes
`plan.md`, `reviews.md`, `rulings.md`, `taste-notes.md` and the
conductor's blueprint JSON; every brief is written by its writer,
first draft to last fix. A finding is only fixed when the writer
changed the file.

## Two modes

**Session mode** (step 2 and the reading of 6). The user is in the
room to shape the cut and approve it. You arrive with the proposal; he
does not have to think it up. Closed choices go through the question
tool in the house shape; open discussion goes in prose. A fact the
recon did not bring is fetched by a `scout`. Every reply in the
terminal is built to be followed at a glance: a table for parallel
things, a flow drawn in a code block for a sequence, short topics for
lists.

**Autonomous mode** (steps 1, 3 to 5 and the file work of 6). The
user is waiting, not answering. Dispatch, run the workflows, judge,
write the audit, build the blueprint, update the state, without
asking permission for any of it. Every reply that dispatches or waits
on an agent carries a status table (agent · task · state), the state
read from the harness, never assumed. Say in one line what you are
about to do, and close with a recap that stands on its own. Do not
end a turn on a plan or a promise; do the work.

## The pattern

```
0. Open     Opus 5.5, effort medium; read the design whole and the discovery's stories
1. Recon    one plan-scout (Sonnet 5.5, low) per area of the codebase the design touches, in
            parallel → 02-plan/recon/<area>.md: what exists today (modules, routes, tables, screens,
            factories, the commands and the suites with their size) and the golden path of each
            kind of code the design adds; one more for the machine → recon/machine.md: how many
            stacks it holds at once under the screen suite
2. The cut  SESSION. from A to B in one line; the foundation with its exemplars; the entries with
            their size (L is the cap) and their edges, drawn as a graph with the critical path; the
            gate commands; the measured cap; the pre-flight with every open decision; approval
            through the question tool; adjustments in a visible list, applied on "apply"
            → 02-plan/plan.md
3. Write    3a: the foundation's plan-writer (Sonnet 5.5, high) alone → F.md with "Provides", every
            name fixed; you answer its questions. 3b: one plan-writer per entry, in parallel, against
            F.md: acceptance, golden paths, uses from the foundation, extends; plus
            blueprint/plan/briefs/<id>.json; zero decisions; a need F lacks comes back as a question,
            and you add it to F before the review
4. Round 1  whole and automatic: plan-review workflow (three lenses Sonnet 5.5 high; per brief two
            blind readers Sonnet 5.5 low + a referee Sonnet 5.5 low); you judge every finding by
            references/judging.md; wording → writers; the cut → you, against what he approved;
            after each fix batch, the changed names searched across every brief
5. Round 2  automatic, delta only (the briefs that changed + the fixes; only the lenses that had
            a sustained finding); a third round only on the user's word
6. Close    plan-report.json + plan-review.json + plan.json, the blueprint built and published;
            the user reads the Plan tab and sends adjustments in a batch, applied on "apply"; the
            pre-flight handed over; approval; the stage report; close commit last; state → execute;
            /clear
```

The user is interrupted at: the cut (2), a question a writer raised
that only he can answer (end of 3), a finding that would change the
cut (4 or 5), and the close (6). Everything else runs without him. A
gap a writer finds in the foundation is not a stop: you add it to F
when the graph keeps its shape (`ruled: conductor`, listed at the
close for veto). Round 2 runs without asking: the plan is mechanical
and he is waiting, not answering.

## The team

| Agent | Model, effort | Does |
|---|---|---|
| the conductor | Opus 5.5, medium | the cut, the answers to the writers, the judging, the close |
| `plan-scout` × 1 per area, + 1 for the machine | Sonnet 5.5, low | reads one area of the codebase and its docs, writes `recon/<area>.md`: facts and where they are, and the golden path of each kind of code the design adds; the machine's scout measures the stacks it holds under the screen suite, writes `recon/machine.md` |
| `plan-writer` × 1 for the foundation, then × 1 per entry | Sonnet 5.5, high | one brief each: the foundation's first, then the entries' in parallel against it; asks, never decides |
| `plan-reviewer-{coverage, verifiability, order}` | Sonnet 5.5, high | three lenses, each reads everything |
| `plan-blind-reader` × 2 per brief | Sonnet 5.5, low | builds and proves one brief alone, reading only that file, in the brief's language |
| `plan-reviewer-ambiguity` | Sonnet 5.5, low | compares the two builds key by key |

## Preconditions

`.state.md` says `stage: plan`; `01-design/` has the approved design
with `notes.md`; `blueprint/design/` has the design JSON. Missing:
halt, back to stage 2.

```
designs-root/2026-08-15-workspace-invites/
├── .state.md                  # stage: plan
├── blueprint.html             # built, never edited (house rule)
├── blueprint/                 # the discovery and design JSON, plus:
│   └── plan/                  # plan.json · plan-report.json · plan-review.json (you)
│       └── briefs/            # <id>.json, one per entry and F for the foundation (writers)
├── rulings.md · taste-notes.md · dreaming-notes.md
├── 00-discovery/ · 01-design/ # untouched here
└── 02-plan/
    ├── plan.md                # the cut: A → B, the foundation, the entries, the graph; your file
    ├── recon/                 # <area>.md, one per area, by the scouts
    ├── briefs/<id>.md         # one per entry, F.md for the foundation — the builder's brief
    ├── reviews/               # round-N.json: each round's return value, as it came
    └── reviews.md             # the round audit: your file
```

## Step 0 — open

If the session is not on **Opus 5.5 at medium effort**, ask the user to
switch (`/model`) and wait. Then read, before speaking again: the
design whole (`notes.md`, `architecture.md`, `contracts.md`,
`data-model.md`, `ui.md`, `acceptance.md` above all), the discovery's
stories, and the consuming project's `CLAUDE.md`. Not the codebase:
the scouts read it.

## Step 1 — recon

Autonomous mode. One `Agent` dispatch of **`plan-scout`** per area
of the codebase the design touches (`code.md` and `architecture.md`
name them: each backend module, each frontend app, the ingestion, the
infra), all in one message, each with the area's path, the design
folder and the template ([templates/recon.md](templates/recon.md)).
A scout writes `02-plan/recon/<area>.md`: the modules, routes,
tables, screens and jobs that exist, the factories and fixtures, the
commands the doctrine names for the gate, the fast check and the
focused tests, the suites with their
size and duration when the docs say, what the design names that
does not exist yet, and the **golden paths**: for each kind of code
the design adds in that area (a route, a use case, a job, a screen, a
form, a test), the exemplary module a builder follows, taken from the
project's golden paths file or, without one, the instance that follows
the doctrine, has its tests and is the smallest; "none" when the kind
is new. Facts only, each with where it was read. In the
same message, one more `plan-scout` with the area `machine`: it brings
up 1, 2, 3… isolated stacks, runs the screen suite in all of them at
once, reads the load, and writes `02-plan/recon/machine.md` with the
measured cap (the most stacks at once before the median load passes
1.5 × the cores or a green spec turns red).

Read every file when the scouts return. This is A: where the demand
starts from. The concurrency cap is the measured cap of
`machine.md`, never a count of cores or memory.

## Step 2 — the cut

Session mode. Arrive with the whole proposal; the user shapes it and
approves it. The order of the conversation:

| Move | You bring | The user |
|---|---|---|
| A → B | one line: where the codebase is (from recon), where the design ends | confirms |
| the foundation | the list: migrations, contract routes, modules, shared pieces, factories, the exemplars of the new kinds; its proof; the files frozen after it | adds, cuts |
| the entries | a table: entry · stories · what it builds back and front · its size · its acceptance in one line | splits, groups, cuts |
| the graph | the edges, each with the behavior the proof needs; the graph drawn with the critical path; the steps it takes | contests an edge |
| the cap, the gate and the pre-flight | how many entries at once, from `recon/machine.md`; the gate commands every entry closes on; what the entries need from him; every open decision of doctrine or test | confirms, decides, hands over |

**How the foundation is found.** Everything two entries would both
edit: every new or changed table and column of `data-model.md` as
migrations (expansion only), with its enum values and its grants;
every new or changed route of `contracts.md` in the API contract, with
every input it reads (headers, parameters) and the generated code (the
route exists and answers "not implemented" until its entry lands);
every new module registered in the composition; every shared piece
the design names (a component two screens use, a helper two use cases
use); one factory per entity the proofs seed, the fakes, and the test
targets per project and width. Nothing behavioral: no use case, no
screen. Its proof is the whole gate green on an empty implementation,
and **no test pins a stub**: nothing asserts the "not implemented"
answer of an operation an entry builds, because that test turns red
the day the entry lands (in the ingestion it sent E-01, E-08, X.8 and
X.10 back as `needs-amendment`).

**The foundation lays the first exemplar of each new kind.** Where
the recon's golden paths say "none" for a kind the design adds (a new
kind of module, a page, a job), the foundation builds the first one
in the full shape the doctrine prescribes: its layers, its file split,
its wiring and its test layout, with no business behavior. Its brief
lists it under "Exemplars". Every entry of that kind follows it, so
the parallel builders write one shape, not one each.

**The foundation serves every entry.** Walk each entry against it:
(a) every field the entry's screen shows, and every input its route
reads, is in the contract; (b) every route response the entry
implements can be assembled from the reads the foundation's modules
expose; (c) every config value and secret the entry reads is in the
foundation's config and in the test environment; (d) every journey
that spends or changes state has its own target (an actor, a record)
per project and width of the screen test runner, reset whenever the
environment is brought up; (e) every route has a time budget, with the
terms each entry adds, below the server's write timeout with room.
At the cut you walk it at the level of `plan.md`; at step 3 each entry
writer walks it for its own entry, name by name, in the brief's "Uses
from the foundation" against F.md's "Provides". What is missing goes
into the foundation then; at stage 4 it would be an amendment that
stops the entry that needs it.

**How the entries are found.** One entry per story. Group two or
three stories into one entry only when they share a screen or a flow
and neither proves alone. An entry is vertical: the use case, the
route implementation, the screen, the tests, built by **one builder in
one context**. Every entry names what it builds, the design sections it
follows, the ACs it carries, what it touches, what it extends, and the
feature map rows it updates; when two entries would update the same
row, one owns it.

**The size cap.** Size is S · M · L, and **L is the cap**: one screen
with its states and one server flow (a use case with its route or its
job), at most eight story ACs, about 2,500 changed lines with tests.
An entry over it splits into thinner vertical slices, each still end
to end. (The merged entries measured 1,100 to 4,200 changed lines; the
two whole landing pages, at 4,200 each, took four review rounds,
against three for the 1,100 and 1,500 line entries.)

**How the edges are found.** Ask, for each entry: does its proof need
another entry's **behavior**? A test that needs a customer in the
database seeds one with a factory: no edge. A test that clicks "mark
ready" needs the entry that builds that button: an edge. An edge is
written with the behavior consumed. Fewer edges is faster; an edge
the proof does not need is a queue for nothing. An edge held by one
journey only does not hold its entry: the journey moves to the entry
that merges last and the edge is dropped, or the edge is marked
**stacked** — the entry starts on the other entry's branch the moment
that one is `ready`, never waiting for its merge (stage 4 starts every
entry that way once its `after` entries are `ready`).

**The critical path.** The longest chain of sizes from the
foundation to the last merge is the critical path, marked in the
graph; stage 4 starts and merges it first.

**Ask for the approval through the question tool.** The foundation
and the graph in one question each, "Approve" first; where the cut has
a real fork (one entry or two, an edge or a seed), the alternatives
are the other answers, one line of cost each; otherwise "Change" is
the only other answer and he says what in "Other". Adjustments he
sends go to a visible list and are applied when he says "apply". When
he approves, write `02-plan/plan.md` from
[templates/plan.md](templates/plan.md), whole, in one pass, the forks
recorded as cards with the recommendation beside the choice. A fork
where he chose against the recommendation goes to `taste-notes.md` on
the spot, as the pattern.

Six rules inside the proposal:

- **Every entry is proved by acceptance a verifier can check, on the
  local stack.** At stage 4 a verifier writes one check per acceptance
  line before any code and runs it red against the base. So each line
  names the actor, what they do, what they observe, and the side
  effect read back (the row, the mail in the fake inbox, the log
  line). A screen line names its journey, both themes, 390 px, and the
  artboard in `ui.md`. "Works" is not a line. Each route and each
  permission has a bad path among the lines. Nothing needs a deployed
  environment: deploying is stage 5's.
- **The gate commands are fixed once.** `plan.md` names, from the
  recon, the ordered commands every entry closes on (the fast check,
  the affected tests against the feature branch, the structure check);
  stage 4 hands them to every builder. No brief repeats them. (In the
  landings, 17 of the 43 finding groups across the two rounds were about
  those commands and what they print, written six times over.)
- **After the foundation, no entry touches a frozen file.** Migrations,
  the contract, the generated code and the module registry are the
  foundation's. An entry that needs one of them changed is a
  foundation amendment, never an edit inside the entry. Every other
  file the foundation created is extended, as "Extends" declares.
- **The plan covers the whole demand, and nothing else.** Every story
  of the discovery lands in exactly one entry; the PR-FAQ's "What we
  are NOT building" and the stories' "Out of this story" never do. The
  design's latitude stays latitude.
- **The user leaves nothing behind.** Everything an entry would need
  from him (a credential, a text, an account, a third-party contract)
  is listed as the pre-flight and handed over at the close. An entry
  with a pre-flight item is marked; stage 4 parks it if the item is
  missing and finishes everything else.
- **The ruler is closed before stage 4.** Every rule of doctrine or of
  test the entries lean on and the doctrine leaves open (the themes and
  widths the screen proofs run at, the panel's size, a test
  convention, a pattern the design assumes and the doctrine does not
  write) is listed in the pre-flight as a decision, and the user
  decides it at the close. A rule decided mid-execution is re-work on
  every entry in flight.

> **Example of a graph question** — header `graph`, question: "After
> the foundation: E-01 clients, E-02 menu, E-03 place an order and
> E-04 the baker's panel run at once (the order and the panel seed
> customers and breads with factories); E-05 the ready e-mail waits
> for E-04 (its test clicks 'mark ready'). Cap 4: two steps after the
> foundation." Answers: "Approve" · "Fold E-05 into E-04 (one entry,
> one step less, a bigger diff)" · "Change".

## Step 3 — write

The foundation's names come first, so that no entry writer guesses
them. (In the ingestion, most of round 2 came from round-1 fixes to
the foundation's harness and store names, mirrored into seven briefs;
in the landings, 9 of the 26 answers to the writers added pieces to
the foundation after the entry briefs had been written.)

**3a — the foundation.** One `Agent` dispatch of **`plan-writer`** for
`F`, in write mode, with: the workstream path, `plan.md`, the recon,
the design folder, the discovery, the brief template, the blueprint
schema (`${CLAUDE_SKILL_DIR}/../../blueprint/schema/plan.md`), the
consuming project's `CLAUDE.md` and the language. It writes
`02-plan/briefs/F.md`, with "Provides" (every name F creates, exactly
as the entries will import or call it) and "Exemplars", and
`blueprint/plan/briefs/F.json`, and returns its questions. Answer them
and send the answers in one message; wait until F.md has no open mark.

**3b — the entries.** One `Agent` dispatch of **`plan-writer`** per
entry, all in one message, with the same inputs plus `F.md`. Each
writes its brief and its JSON: the acceptance lines, the golden paths
from the recon (or F's exemplar), "Uses from the foundation" copied
verbatim from F.md's "Provides" with the producer of each name, and
"Extends". A name the entry needs that F does not provide, or a duty
no brief produces, is a question, never a guess.

**Answering.** A writer decides nothing: a value the cut and the
design do not fix is a question. Answer from `plan.md`, the design and
the recon what they settle, the simplest option that keeps the
approved graph as it stands. A gap in the foundation that an entry
writer raised is added to F by F's writer in one batch, and you rule
it yourself when the graph keeps its shape: it is the walk of "The
foundation serves every entry" doing its job, not a new decision. An
answer that would change an entry or an edge is not yours: ask the
user through the question tool. Every answer you gave goes to
`rulings.md` marked `ruled: conductor` and is listed at the close for
veto. Send the answers to each writer in one message.

When the writers return, check every brief by its sections: every
entry has its brief; every acceptance line names its observation and
its side effect; every kind of code it adds has a golden path; every
"Uses" line names a producer; the size is within the cap; "Questions"
is empty. Anything missing goes back to its writer in one message
before the review starts.

## Step 4 — round 1

Autonomous mode. Run the `plan-review` workflow by `scriptPath`
(never by name): `${CLAUDE_SKILL_DIR}/../../workflows/plan-review.js`,
with `planDir`, `designDir`, `discoveryDir`, `reconDir`, `root` (the
codebase path), `round: 1`, `language`, and `briefs`: one
`{id, path}` per brief file. The workflow passes paths; the readers
open only their brief.

| Lens | Question |
|---|---|
| `plan-reviewer-coverage` (Sonnet 5.5, high) | every story AC and every acceptance case lands in exactly one acceptance line of one entry; every table, route, module and factory the design names is in the foundation; every new kind has its exemplar; every screen has its entry; nothing is built that nothing forces |
| `plan-reviewer-verifiability` (Sonnet 5.5, high) | every acceptance line can be checked on the local stack: actor, action, observation, side effect read back; bad paths included; every kind of code has a golden path that exists; every entry within the size cap; the gate commands exist; nothing needs a deployed environment or a person |
| `plan-reviewer-order` (Sonnet 5.5, high) | every edge is a behavior the proof needs, every such need has its edge, an edge held by one journey is stacked or moved, the graph has no cycle; after the foundation no entry touches a frozen file; every "Uses" name is in F.md's "Provides" or in the producing entry's brief; entries that run at once do not collide on a file outside a declared "Extends"; no foundation test pins a stub; the cap is the measured one |
| 2 × `plan-blind-reader` (Sonnet 5.5, low) → `plan-reviewer-ambiguity` (Sonnet 5.5, low), per brief | would two builders build the same entry from this brief alone, and would two verifiers check the same acceptance? |

Every reviewer answers under the house reviewer contract
(`docs/standards/reviewer-contract.md` in the pipeline repo). The
workflow returns `{ round, mode, valid, findings, lenses, unread }`; a
round in which no brief was read is invalid: fix the cause, run it
again.

Record before acting: save the return value as it came in
`02-plan/reviews/round-N.json`, and write `02-plan/reviews.md`
([template](templates/reviews.md)) from it in one `Write`.

**Judge.** You rule every finding by
[references/judging.md](references/judging.md): merge by fix first,
then sustained / deferred / dismissed, with the owner of each
sustained one: `writer`, `user` or `builder`. Write the rulings to
`reviews.md` before any fix moves.

- **`writer`**: a pointer, a case name, an acceptance line made
  checkable with what the design already fixes, propagation between
  two briefs. One apply batch per writer, in one message; the report
  carries the mentions table and the final lines; a fix without pasted
  lines is not done.
- **Propagation, before the batch leaves.** For every name, value or
  key a fix changes (F's above all), search every brief and `plan.md`
  for it (`Grep`, no reading); every hit the fix makes wrong goes to
  its writer in the same batch. A fix that reaches one brief and not
  the others comes back as round 2's finding (the landings' H-2 was
  round 1's G-1 again, in the two briefs the ruling had not named).
- **`builder`**: real, but execution: one line in that brief's "The
  builder decides", with its bound.
- **`user`**: an entry changes (add, split, group, cut), an edge is
  added or removed, the foundation changes, the cut is contested, two
  readings that are two products. You rule these yourself against the
  cut he approved when the graph and the foundation stay as they are
  (`ruled: conductor`, listed at the close for veto); a change you
  make to `plan.md` is dated under "Amendments" before it reaches a
  writer. A finding that would change the graph or the foundation is
  his: one question per decision, the house shape, your pick first.

## Step 5 — round 2, and a third

Round 2 runs without asking, over the delta: the workflow receives
`changed` (the briefs whose text changed), `fixes` (what was applied)
and `lenses` (only the lenses that had a finding sustained in round 1;
a lens with nothing sustained read that text and passed it). Those
lenses check that each fix landed and did not break its surroundings;
the blind readers reopen only the briefs whose acceptance or builds
changed.
Judge and apply it the same way. Then tell the user, with the two
rounds in a table (findings, sustained by owner, dismissed, what
changed), that the plan is at the close; **a third round runs only on
his word**, delta again. What is still sustained after the last round
is applied by the writers with proof by line and verified on disk by
you; the residue is written, not chased.

## Step 6 — close

Write the conductor's JSON under `blueprint/plan/`: `plan.json` from
`plan.md` (A → B, the foundation, the entries with their edges and
proofs — an entry's proof is its acceptance, one `{run, expect}` per
line: the check it becomes and what it observes —, the cap, the cut's
cards, the pre-flight), `plan-review.json`
from `reviews.md` and `rulings.md`, and `plan-report.json`, the plain
layer the tab opens with, in the intern's voice (schema above). Then
`node "${CLAUDE_SKILL_DIR}/../../blueprint/build.mjs" <workstream>` and
publish `blueprint.html`. The build refuses with the field named: an
entry with no proof, an edge to nothing, a cycle, a story no entry
carries, a brief missing, a text over its word cap.

Present: the blueprint URL, the graph with the critical path, the entry table, the round
table, the decisions you took in his place (the writers' questions you
answered, the user-owned findings you ruled), one line each, the
residue, the taste notes added, the stage's telemetry (agents,
approximate cost), and the **pre-flight**: every item the entries need
from him, as a checklist. **This is where the user reads the plan.**
He sends adjustments as they come; you note each in a visible list and
dispatch nothing until he says "apply"; then one batch per writer (a
change to `plan.md` is yours, dated under "Amendments"), verify on
disk, rebuild, republish, and ask again. The pre-flight is handed over
here: every item checked and every open decision decided (through the
question tool, recorded in `plan.md` and `rulings.md`), or the entry
it blocks marked in `plan.md` so stage 4 parks it. Approval is explicit; silence does not close the
stage. On approval, and only after he says there is nothing else:
the stage report: follow claude/docs/stage-report.md (video, slides, blueprint);
then `.state.md` to `stage: execute`, the close commit of the workstream
folder (push only with his explicit approval), and suggest `/clear`
before stage 4.

## How to write, in every file and every question

Say what you mean. Literal sentences, concrete values, no metaphor.
One idea per sentence. The user's words, in quotation marks, where
they decide something. A card names its options by what they cost.
An acceptance line names what is observed and the side effect read
back; a screen names its artboard.
In the terminal: a table for parallel things, a flow in a code block
for a sequence, short topics for lists.

## Files

- **Permanent:** everything in `02-plan/`, `blueprint/plan/`,
  `blueprint.html`, `rulings.md`, `taste-notes.md`, `.state.md`.
- **Nothing is deleted at the close.** `recon/` is the A the dreaming
  compares against what stage 4 found.

## During execution

The plan is amendable, not sacred. When an entry changes while being
built (a proof proves wrong, a simpler cut appears, the contract needs
a field), stage 4 edits the entry in `plan.md` and its brief in place
and writes the amendment, dated, under "Amendments", in the user's
words where he gave them. A change to a frozen file is a foundation
amendment, recorded the same way; an addition to any other file the
foundation created is the entry's own work, never an amendment. The Status column is stage 4's to
fill, entry by entry. Nothing comes back to this stage for it.

## Resuming

Everything is in files. Read `.state.md`, then `recon/` (absent means
the scouts did not run), `plan.md` (absent means the cut was not
approved), `02-plan/briefs/` (no `F.md` means 3a did not finish; the
entry writers wait for it), `reviews.md` if they exist. Continue
from the first step whose output is missing. A writer that died is
redispatched with the list of what is on disk; it never rewrites a
finished file. Never from memory of a previous session.

## Boundaries

No code, no tests, no branches, no deploy (stage 4). No re-decision
of the design: an entry that cannot be built as designed becomes a
question to the user and, answered, a dated amendment in `notes.md`,
never a local workaround in a brief. The discovery fence does not
reopen: a story lands in an entry or the user cuts it in the
discovery, with the record there. Frictions worth learning from go to
the workstream's `dreaming-notes.md` on the spot; judging them is
stage 6's job.
