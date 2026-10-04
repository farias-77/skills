# The blocking rule

There is no judge. The exec-entry workflow sorts every finding of the
reviewer and the QAs by one rule, in code, the same way every time.
The agents are told the rule, so they prove what must not merge and
leave the rest as notes.

```
blocks   severity = blocking
         AND basis ∈ { ac, bug, security, rule }
         AND proof ≠ ""
note     everything else
```

| Basis | Blocks when the proof shows |
|---|---|
| `ac` | an AC of the brief not met: the AC id and what the code or the screen does instead |
| `bug` | a concrete reproduction: the input, the steps or the command, and what happened |
| `security` | a hole: another user's data reached, a permission bypassed, a secret exposed, input unvalidated or injected |
| `rule` | a written rule of the project broken: `path:line` of the doctrine, the golden paths or the brief, the sentence quoted |

- **Blocking** items go to one fix pass of the builder(s), together,
  with their proof. Then the gate, then the delta: only the agents that
  raised blocking items re-check those items. Anything still blocking
  parks the entry (`round-cap`). There is no second fix pass.
- **Notes** go to the entry's `notes.md` and the merge commit's body.
  They never open work in this stage: no register, no finishing entry.
  The close and the weekly retro read them.
- A finding marked `blocking` without a blocking basis or a proof is a
  note; the workflow logs it and counts it (`downgraded`).
- **How the tests are cut never blocks.** The testing guidance is the
  builder's judgment; a test at a costly layer or a duplicate is a
  note at most. Only an AC with no proof at all blocks, as `ac`.

The visual check is not a finding of any agent: he makes it himself,
using the app at the hands-on that ends the stage.

## What the builder decides, and what parks

- Where the documents are silent, the builder chooses the simplest
  thing consistent with the codebase and lists it in `choices`.
- In his classes (the bar, money, anything outside the repository,
  anything irreversible, the security posture) it decides
  conservatively and lists it in `decided`, for his veto at the audit.
- **`parked: user`** only for what needs him in person: a credential,
  an account, an action outside the repository only he can take.
- **`blocked`** only for a true impossibility: a missing secret, a
  contradiction in the plan.

## The tally

Per agent, per run: `found`, `blocking`, `notes`, `downgraded`, and in
the delta `closed`. The session sums them for the audit; the close
compares them across workstreams.
