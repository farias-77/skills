---
name: stage-execute
description: Conducts the audit that closes stage 4 (Execute) — the Codex chair built every wave into the workstream branch and proved it in alpha; this session reads its reports, PRs and reviews, consolidates everything that needs the user's eye (departures from the standard, choices where the documents were silent, notes the review rounds left, stops), the user rules each item through the question tool, and what he sends back goes to the Codex chair as a fix wave; the stage closes when the workstream branch is consolidated, verified and audited. Runs in Claude Code with a Fable session. Use when a workstream's .state.md says stage execute and phase audit, or to resume an audit in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Artifact, Bash(mkdir *), Bash(date *), Bash(ls *), Bash(cat *), Bash(git *), Bash(gh *)
---

# Stage 4: Execute — the audit

The Codex chair builds; this chair judges what it built. Every wave of
the plan is merged into the workstream branch `feat/<workstream>` of
every repo, deployed to alpha, the whole smoke suite green, one report
per wave written. Nobody from this side has looked yet: that is by
design, so the user reads the whole demand once, with everything in
front of him, instead of leaking judgment wave by wave. This session
consolidates what needs his eye, he rules item by item, and what he
sends back the Codex chair builds as a fix wave. The stage closes when
nothing is left to send back.

The session is the conductor. It reads, consolidates, asks, records
the rulings and moves the state. It writes one file, `audit.md`, and
never a line of code: a fix is built by the Codex chair, through the
same story cycle every other line of code went through.

## Two modes

**Autonomous mode** (steps 1 and 4). Read everything, write the
consolidation, verify the branch, move the state, without asking
permission for any of it. Say in one line what you are about to do
and close with a recap that stands on its own.

**Session mode** (steps 2 and 3). The user is in the room and his
rulings are the work. One item per question, through the question
tool, the judge's pick first. Never rule in his place here: at plan
the conductor ruled against an approved cut; here the cut is the
code, and only he says what he keeps. Open discussion in prose.

## The pattern

```
1. Read       every wave's report.md, the wave PRs, reviews/, proof/; the trace.
              Consolidate into 03-execution/audit.md: the four lists and the numbers.
2. Rule       one question per item: departures, choices, open notes, stops.
              Keep · fix · revert; his reason to rulings.md; patterns to taste-notes.md.
3. Fix wave   the items ruled fix or revert become rows A.k in audit.md's Fixes;
              .state.md → phase: fix · chair: codex; the user opens the Codex chair.
              When it comes back (phase: audit), read only the fix wave's report; rule again.
4. Close      nothing left to send back: the branch verified, blueprint republished,
              .state.md → stage: release, commit, /clear.
```

## Preconditions

`.state.md` says `stage: execute`, `phase: audit`, `chair: fable`.
Every wave of `waves.md` has its Status filled; every repo's
`feat/<workstream>` carries every wave PR merged; each wave has its
`03-execution/wNN-<slug>/report.md` complete and `proof/` filled.
Missing ⇒ the Codex chair did not finish; tell the user which wave
and stop.

```
<workstream>/
├── .state.md                      # stage: execute · phase: audit · chair: fable
├── rulings.md · taste-notes.md    # every ruling of the audit appended here
├── waves.md                       # read-only here
└── 03-execution/
    ├── audit.md                   # this stage's one file (templates/audit.md)
    ├── wNN-<slug>/                # the Codex chair's: trace, report, reviews, proof
    └── wNN-audit/                 # the fix wave's, when there is one
```

## Step 1 — read and consolidate

Read every wave's `report.md` whole, then the wave PRs (`gh pr list
--base feat/<workstream> --state merged` per repo, the bodies), the
`reviews/<N.k>/round-2.md` files (the notes that rode), and the trace
lines marked `departure`, `chosen`, `improvement` and `stop`. Open the
`proof/` folders: the whole-suite outputs and the screenshots are the
evidence the reports summarize. Read the code of every departure, in
the branch, before writing about it.

Write `03-execution/audit.md` from [templates/audit.md](templates/audit.md):
the numbers of the demand (waves, stories, review rounds, findings
per lens and how many survived, fix passes, suite runs, tokens), then
the four lists, one item each with its wave, story, PR, the file and
lines, what the Codex chair wrote and what you found reading the code.
Items are numbered `D.n` (departures), `C.n` (choices where the
documents were silent), `N.n` (notes still open), `S.n` (stops and
their resolution). Improvements applied inside the standard are
listed, not asked: he can veto any in one question at the end.

Verify the branch before the session: `feat/<workstream>` of every
repo at the sha the last report names, alpha at that sha (the repo's
diff against alpha empty), the whole suite's last output green. A
mismatch is an item `S.n` of its own.

## Step 2 — the session

Present the blueprint URL (republish it first: the Codex chair wrote
the execution entries but cannot publish) and `audit.md`'s numbers in
one message. Then the items, through the question tool, four to a
call, in this order: departures, then choices, then open notes, then
stops. Each question carries the item whole: wave and story, the PR,
the quoted lines, what the Codex chair argued, what you found. The
answers are always the same three: **keep** (it stays as built; a
departure kept becomes a candidate standard change for the close
stage), **fix** (his words become the row: what changes, how it is
proved), **revert** (back to the goal or the standard as written).
Your recommendation is the first option and marked as yours.

Every answer is one line in `rulings.md` (house format: date ·
`execute audit` · the item id · your pick · his ruling · his reason
verbatim). A pattern across answers (a class he keeps reverting, a
lens whose notes he keeps dismissing) is one line in
`taste-notes.md`. Last question: the improvements list, "keep all"
first.

## Step 3 — the fix wave

When at least one item was ruled fix or revert: write them as rows
`A.1`, `A.2`… under `## Fixes` in `audit.md`, in the goal's row
format (repo, what changes in the code, the design or standard
pointer, the "ready when" as a command or observation, what it
depends on). Set `.state.md` to `phase: fix · chair: codex · wave:
wNN-audit`, commit the workstream folder, and tell the user to open
the Codex chair with `$stage-execute <workstream-slug>`. Suggest
`/clear`.

When the Codex chair returns (`phase: audit` again, a
`03-execution/wNN-audit/report.md`): read that report and its PRs
only, verify the branch again, and take its items through step 2. A
fix wave that comes back with new departures or open notes is asked
about like any other; a fix that did not close its row is asked
again as one item. Two fix waves are the budget; if a third is
needed, say so and let him decide between a third wave and closing
with the residue recorded.

## Step 4 — close

Nothing left ruled fix or revert: write the close of `audit.md` (the
rulings count per list, what was kept as a departure for the close
stage, the residue he accepted), republish the blueprint with the
audit entry (`BLUEPRINT.audit`, shape in the shell's comment), set
`.state.md` to `stage: release · chair: fable`, commit the workstream
folder (push only with the user's explicit approval) and suggest
`/clear`.

## How to write

Say what you mean. Literal sentences, the quoted lines, the file and
the line numbers. An item names what was done and what the standard
or the goal said, side by side, and nothing about intentions. His
words in quotation marks where he decides.

## Files

- **Working:** none.
- **Permanent:** `03-execution/audit.md`, `rulings.md`,
  `taste-notes.md`, `blueprint.html`, `.state.md`.

## Resuming

Read `.state.md`. `phase: fix` means the Codex chair is working: stop
and say so. `phase: audit` with no `audit.md` means step 1; with an
`audit.md` whose items have no ruling, step 2 from the first unruled
item (`rulings.md` says which were asked); with rulings and no Fixes
section written, step 3; with a `wNN-audit` report not yet read, step
2 over it. Never from memory.

## Boundaries

No code, no branch, no deploy from this chair. No ruling in the
user's place. No re-decision of the design: an item that contests a
decision in `decisions.md` is a fix toward the decision, or a note for
the close stage, never a new design. A departure kept is not a
standard change yet; the close stage makes it one.
