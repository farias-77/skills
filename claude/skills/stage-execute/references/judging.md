# Triage of an entry's findings

There is no judge. The exec-entry workflow sorts every finding by the
rule below, in code, the same way every time; the reviewers are told
the rule, so they prove what they are sure of. The session applies
the same rule to the findings of the coherence pass and of the
maintainability read (`exec-lens-craft`).

## Every finding carries

| Field | What it is |
|---|---|
| `severity` | `blocker`, `fix` or `detail`, given by the reviewer |
| `repro` | a failing test (written in a throwaway worktree, never committed), a command and its output, or the steps on the screen and what they showed; empty when none |
| `rule` | the written rule it breaks, `path:line` with the sentence quoted: the doctrine, the brief, the design, the golden paths, or the existing code it duplicates; empty when none |

## The rule

```
blocks    severity ≠ detail  AND  (repro ≠ "" OR rule ≠ "")
          or the verifier's verdict is FAIL or INCONCLUSIVE (INCONCLUSIVE counts as FAIL)
deferred  severity ≠ detail, with neither repro nor rule
learnLog  every detail
```

- **Blocking** items go back to the builder (effort high) once,
  together, with their proof. Then the delta: the verifier runs the
  acceptance checks again, and only the reviewers that blocked
  re-check their own items over the delta, under the same rule.
  Anything still blocking parks the entry (`round-cap`).
- **Deferred** items do not hold the entry. They go to `deferred.md`
  and are built at the end of the stage in one batch slice per side
  group, checked by the gate, the verifier and `structure-reviewer
  (Opus 5.5, medium)` only.
- **The learn log** is never built in this stage. The close and the
  weekly retro turn recurring lines into a lint, a hook, a doctrine
  line or a golden-path example — never another reviewer.

## What the builder decides, and what parks

- Where the documents are silent, the builder chooses the simplest
  thing consistent with the codebase and lists it in `choices`.
- In his classes — the bar (a protected quality config), money,
  anything outside the repository, anything irreversible, the security
  posture — the builder decides conservatively (the bar stays, the
  stricter option, nothing outside the repo, nothing irreversible,
  nothing that spends more) and lists it in `decided` with
  "conservative, for his veto at the audit".
- **`parked: user`** only for what needs him in person: a credential,
  an account, an action outside the repository only he can take.
- **`needs-amendment`** for a shared file the entry must change, and
  for an acceptance check that contradicts the brief or the design: a
  change in behaviour is a question to the session, never an edit to
  an acceptance file.

## Precision

Per reviewer, per run: `found`, `blocking`, `deferred`, `learn`, and
of the blocking ones how many carried a `repro` and how many only a
`rule`; in the delta, how many of its items closed. The verifier's
verdicts are counted apart (PASS, FAIL, INCONCLUSIVE). The session
sums them across entries for the audit; the close compares them across
workstreams to learn which reviewer pays for itself.
