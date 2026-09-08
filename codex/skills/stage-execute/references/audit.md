# The audit

When the last wave is merged into `feat/<workstream>`, the user reads
the whole demand once, with you, in this session. Nobody judged the
waves from outside while they were built; that is by design, so
nothing leaks back and forth. You consolidate what needs his eye, he
rules item by item, what he sends back you build as a fix wave, and
the stage closes when nothing is left to send back.

Here you stop deciding alone. At the audit every item is his: you
recommend, he rules. Write the consolidation before you ask anything,
ask one batch at a time, and record every answer before the next
batch.

## 1. Consolidate

Read every wave's `report.md`, the wave PR bodies, every
`reviews/<N.k>/round-2.md` (the notes that rode), and the trace lines
marked `departure`, `chosen`, `improvement` and `stop`. Read the code
of every departure in the branch before writing about it: the report
says what the builder argued; you say what the code does.

Write `03-execution/audit.md` from
[templates/audit.md](../templates/audit.md): the numbers of the demand,
then four lists, one item each with wave, story, PR, file and lines,
what was written and what you found: `D.n` departures from the
standard, `C.n` choices where the documents were silent, `N.n` notes
still open, `S.n` stops and their resolution. Each item ends with your
recommendation, keep, fix or revert, in one sentence. Improvements
applied inside the standard are listed, not asked; he can veto any in
one question at the end.

Check the branch: `feat/<workstream>` of every repo at the sha the
last report names, alpha at that sha (the repo's diff against alpha
empty), the whole suite's last output green. A mismatch is an item
`S.n` of its own.

## 2. Serve the blueprint

`blueprint.html` is the report he reads first. Fill
`BLUEPRINT.audit` (shape in the shell's comment) from `audit.md`, check
every wave's `execution` entry is there, then serve the workstream
folder locally and give him the address:

```
python3 -m http.server 8765 --directory <designs-root>/<workstream>
```

`http://localhost:8765/blueprint.html`. Keep the server running until
the audit closes; a republished URL on the Claude side comes at the
release stage.

## 3. Ask, four at a time

In the session, in this order: departures, choices, open notes,
stops. Four items per message, each one whole: the id and title, wave
and story, the PR, the quoted lines, what the builder argued, what
you found, and the three answers, your recommendation first and
marked as yours:

```
D.1 — <title> · w02 · 2.3 · PR #41 · app/src/services/accounts.ts:88-104
  the standard (arch.2): …   what was built: …   the builder argued: …   reading the code: …
  1. keep (my recommendation) · 2. fix — say what changes · 3. revert to the standard
```

He answers in his words. Every answer is one line in the workstream's
`rulings.md` (date · `execute audit` · the item id · your pick · his
ruling · his reason verbatim) before the next four are asked. A
pattern across answers, a class he keeps reverting or a lens whose
notes he keeps dismissing, is one line in `taste-notes.md`. The last
question is the improvements list, "keep all" first. A departure he
keeps is not a standard change yet: the close stage makes it one.

## 4. The fix wave

When at least one item was ruled fix or revert: write the rows `A.1`,
`A.2`… under `## Fixes` in `audit.md`, in the goal's row format
(repo, what changes, the design or standard pointer, the "ready when"
as a command or observation, dependencies), set `.state.md` to
`phase: fix · wave: wNN-audit`, and build it as one more wave
([wave.md](wave.md), "The fix wave"): its own branch from
`feat/<workstream>`, the story cycle per row, the whole suite, the PR
merged into the workstream branch, its own folder and report. Then
read that report and take its items through step 3 again; a fix that
did not close its row is asked again as one item. Two fix waves are
the budget; if a third is needed, say so and let him decide between a
third wave and closing with the residue recorded.

## 5. Close the stage

Nothing left ruled fix or revert: write the Close section of
`audit.md` (rulings per list, what goes to the close stage as a
standard candidate, the residue he accepted), fill `BLUEPRINT.audit`
with the rulings, stop the local server, set `.state.md` to
`stage: release · chair: fable`, commit the workstream folder (push
only if he says so), and tell him stage 4 is closed: the workstream
branch consolidated, verified in alpha and audited, and the release
runs in the Claude chair with `/stage-release <workstream-slug>`.
