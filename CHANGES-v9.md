# v9 — stage 4 (Execute)

Only stage 4 gets faster; the six stages stay. The CTO's main fear is
AI slop, so maintainability becomes a gate of every entry, not a
reading at the end. Sources: `proposals/v9/40-proposal.md` ("2 ·
Build"), `20-build.md`, `30-red-team.md`.

## What changed, per entry (`claude/workflows/exec-entry.js`)

```
v8  build back ∥ front (2 × Opus high, side worktrees) → gate → panel of 6–12 lenses and QA
    → judge (Opus) → fix back ∥ front → gate → delta panel + QA replay → judge → ready
v9  acceptance (verifier, author) → build (1 builder, Opus medium) → gate (Sonnet low)
    → verifier prove ∥ reviewer ∥ structure-reviewer ∥ security ∥ operations
    → mechanical triage → 1 fix (builder, high) → gate → delta (verifier + who blocked) → ready
```

| Change | Why |
|---|---|
| **Acceptance first**: `verifier (Sonnet 5.5, high)` writes Playwright journeys and Go integration tests from the brief's acceptance and proof lines, red on the base for the right reason, committed before any code; the gate's first check (`acceptance-untouched`) rejects any diff to them | the definition of done is fixed before the builder starts and cannot be bent to fit the code; a change in behaviour is a `needs-amendment`, never an edit |
| **One builder** `builder (Opus 5.5, medium)` for back and front in the entry worktree; no side worktrees | the back/front seam produced the side conflicts, the serial fixes and most amendments; two builders were the largest block of agent time |
| The builder reads the **golden paths** (`goldenPathsPath`), reuses existing helpers, keeps functions and files small, and does not end its turn until **`gateCommands`** (fast check, affected tests, structure check) are green | maintainability enforced where the code is written, not found later |
| `exec-gate` now **Sonnet 5.5, low**: runs `gateCommands`, attributes reds (code or machine), reports the surface, keeps the record; red → the builder, 3 tries, then `parked: gate-red` | the gate is mechanical; low effort is enough |
| **Prove ∥ review** on the same head: verifier (prove: evidence, video, side effects, PII canary, failure-mode block on server entries; INCONCLUSIVE = FAIL) ∥ `reviewer (Sonnet 5.5, high)` ∥ **`structure-reviewer (Opus 5.5, medium)`** (new) ∥ `exec-lens-security` (every diff) ∥ `exec-lens-operations` (server or runtime diffs) | keeps the breadth of the first read where 26 of 27 mediums came from (red team O-1, O-3, O-10) with 5 seats instead of 9–14 |
| **No judge**: a finding blocks when `severity ≠ detail` and it has a `repro` or a written `rule`, or the verifier did not PASS; the rest → `deferred`; details → `learnLog`; precision per reviewer counted in code | red team O-2 and O-9: blocking on a reproduction or a violated written rule, the same way every time; the judge loop was a large share of the clock |
| **One fix** at effort high, then a **delta**: the verifier again and only the reviewers that blocked, over their own items; still blocking → `parked: round-cap` (maxRounds 2 = the check and one delta) | the fix loop was 46% of the clock; 45 of 84 delta findings were regressions the fixes caused |
| `mode: 'batch'`: the deferred register built at the end in **one batch slice per side group**, checked by gate + verifier + structure-reviewer only | replaces the parallel finishing slices that each opened a full review |
| `mode: 'resume'` takes a fixes file the session writes (`{ fixes: [{ id, reviewer, fix, repro, rule }] }`) and its `reviewers` | no judge's rulings file to read any more |
| `args.inlineAgents`: agents run from `<agentsDir>/<name>.md` with the frontmatter's model and effort passed through `agent()` | the v9 agents are not installed in the running Claude Code |
| A **video** per ready entry and one for the stage (`video-scribe (Sonnet 5.5, medium)`), and the stage closes with the **stage report** (`claude/docs/stage-report.md`: video, slides, blueprint) | the CTO watches first, reads second, digs third |

## Agents

| Agent | v9 |
|---|---|
| `verifier` (Sonnet 5.5, high) | new |
| `builder` (Opus 5.5, medium; high on the fix) | new, replaces `builder-backend` and `builder-frontend` |
| `reviewer` (Sonnet 5.5, high) | new, takes correctness and the fidelity lens's job |
| `structure-reviewer` (Opus 5.5, medium) | new: golden paths, boundaries, duplication, abstraction, size, names, dead code, tests of behaviour |
| `exec-gate` | kept; Sonnet 5.5 low; no side merges; acceptance-untouched check |
| `exec-lens-security`, `exec-lens-operations` | kept; findings carry `repro` and `rule`; delta re-checks own items only |
| `exec-lens-craft` | kept, once per stage over the whole branch, now with the golden paths |
| deleted | `builder-backend`, `builder-frontend`, `exec-judge`, `exec-lens-fidelity`, `exec-lens-workaround`, `exec-lens-proof`, `exec-lens-visual`, `exec-qa-backend`, `exec-qa-frontend`, `exec-qa-abuse`, `exec-qa-replay` |

## What stayed

| Kept as it was | Where |
|---|---|
| The foundation first; the fan-out by edges under the measured cap; stacked entries | SKILL Steps 1–2 |
| The merge queue: `mode: 'update'` merges the base in, never a rebase; the gate keep-going before merge | SKILL Step 4, exec-entry |
| Foundation amendments (`needs-amendment` → `F.<n>`) | SKILL Step 5 |
| The autonomy rules: `interrupted` relaunched by run id; parks `user` / `gate-red` / `round-cap`; conservative decisions in his classes, for his veto | SKILL Step 3, `judging.md` |
| The ready gate, the record, the evidence redacted; the whole gate once at the end | exec-entry, SKILL Step 7 |
| The maintainability read of the whole branch (`exec-lens-craft`) | SKILL Step 7 |
| The audit, `execution.json` and the PushNotification | SKILL Steps 7–8 |

## Dropped

- `needs-session` (no judge raises recurrences; a shared-file fix is a
  `needs-amendment`).
- The `panel: 'lean' | 'full'` switch (operations now sits on every
  server diff).
- The QA checklists and coverage lines; the adversarial cases that
  paid (double submit, concurrency, provider down, disconnect, a
  person's data in logs) live in the verifier's failure-mode block and
  PII canary.
