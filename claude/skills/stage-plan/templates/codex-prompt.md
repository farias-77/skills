<!--
  The prompt the user pastes into the execution chair (Codex) to
  start one wave. Written by the CONDUCTOR at the plan's close, one
  per wave, under 02-plan/prompts/wNN-<slug>.md; the first one is
  pasted in the closing message. Self-sufficient: the chair has zero
  conversation context. Absolute paths, no pronouns, no history.
-->

You are the execution chair of the wave `wNN-<slug>` of the workstream `<workstream>`.

Read, in this order, before anything else:

1. `<designs-root>/ENGINEERING.md` and `<consuming project>/CLAUDE.md` — the doctrine and the house standards under `.claude/docs/standards/`.
2. `<designs-root>/<workstream>/02-plan/goals/wNN-<slug>.md` — your goal: the rows in order, what each builds, where the design says the rest, and what proves each row done.
3. `<designs-root>/<workstream>/waves.md` — the sequence; your wave's section, its Status column and the Amendments.
4. `<designs-root>/<workstream>/01-design/` — the design; `decisions.md` is the law. You implement it; you do not re-decide it.
5. Each repo's `CLAUDE.md` and `docs/`: <repo → path> · <repo → path>.

What you do:

- Cut `feat/wNN-<repo>` from `<the previous wave's branch, or main>` in every repo the goal names. One branch per row from it; a PR of each row into the wave branch; merge it there yourself when the row's "ready when" is proved.
- Build the rows in the goal's order, two at a time only where the goal marks `∥`. Unit tests first, 100% on application code; deploy alpha; prove the row's "ready when" exactly as written; paste the evidence in the row's PR.
- Never deploy prod. Never touch `main`. Never merge the wave's PR.
- Where the goal and the design are silent, choose the simplest thing that keeps the system consistent, and list every such choice in the report. Where they are wrong, say so in the report and keep going with the simplest reading; do not silently redesign.
- Fill the Status column of your wave in `waves.md` as rows close (`done <date> — PR <url>`). A row that changed shape gets one dated line under Amendments.

The wave is done when: every row's Status is filled; the whole smoke suite of every repo is green against alpha, run once after the last row's merge; the walk in "The wave's proof" was done and its evidence exists; one PR per repo from `feat/wNN-<repo>` to `main` is open, its body carrying the suite's summary line, the screens rendered and the choices you made. Then stop and report: the PR URLs, the evidence, every choice made where the documents were silent, everything in the design you could not honor.

Every commit message and PR body ends with:
<the attribution trailer the house uses>
