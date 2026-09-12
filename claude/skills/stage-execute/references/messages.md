# The messages between sessions

Every message between the master and a worker is **one line that
points at a file**. The file is the record; the line is the wake-up.
Sessions find each other with `ListAgents` by the names `team.md`
gives (`<slug>-master`, `<slug>-<repo>`), and send with `SendMessage`.
A worker treats a line from the master as the user's own instruction
(SKILL.md, "Two roles"); the master treats a line from a worker as a
fact to record.

## Worker → master

| Line | When |
|---|---|
| `row <N.k> merged · <repo> · PR #<n> · <proof line> · 03-execution/rows/<repo>/<N.k>.md` | the row's proof is green in alpha and the file is complete |
| `lane <repo> ready for <wNN> · suite <passed>/<failed>/<skipped> · <proof file>` | the last required row of the wave is merged and proved and the whole suite ended green |
| `parked <N.k> · <why, five words> · 03-execution/rows/<repo>/<N.k>.md` | a third red, a contract or design contradiction, a stateful deletion, a missing pre-flight item |
| `red in alpha <repo> · <what> · fixing as <N.k>.f<n>` | a merged row's proof went red; informational, the fix is already in the loop |
| `freeze <stack> · suite <repo>` / `unfreeze <stack>` | a lane that shares a stack starts or ends its whole suite |
| `lane <repo> done · last row <N.k> · 03-execution/rows/<repo>/` | the lane's last row is merged (the master needs this for the end) |
| `note for the dreaming · <one line>` | a friction worth learning from |

## Master → worker

| Line | When |
|---|---|
| `frozen <stacks> · walk <wNN> · 03-execution/freeze.md` | the gate opens; no merge on those stacks |
| `unfrozen <stacks> · 03-execution/freeze.md` | the walk or the shadow ended; merges resume |
| `gate <wNN> green · tag <wNN> · 03-execution/<wNN>/report.md` | the wave was accepted |
| `fix <wNN>-<n> · lane <repo> · row <N.k> · 03-execution/fixes/<wNN>-<n>.md` | a red walk step; the worker builds it as `<N.k>.f<n>` next |
| `fix A.<n> · lane <repo> · 03-execution/fixes/A-<n>.md` | an audit ruling; built as row `A.<n>` next |
| `answer <N.k> · <one line> · <file>` | a parked question the master could settle from the plan |
| `amend <N.k> · waves.md Amendments <date>` | a row's proof or pointer changed; the worker re-reads its goal section |
| `stage closed` | the audit's Close is written; the worker ends |

## Master → user

Exactly one, at the end of the waves, as a `PushNotification`:
`<slug>: all waves green (w01, w02) · parked: <n> · <blueprint url>`;
with parked items, one clause each after the count. Nothing before
it. The audit's questions are asked in the session, not pushed.

## Rules

- One line. A second sentence means the file was not written.
- The path is from the workstream root, always the same shape.
- A worker that receives a line it cannot act on (a lane it does not
  own, a row it does not have) answers `not mine · <line>` and goes
  on; the master re-routes.
- A message is never the record: nothing is decided in a message
  that is not in a file the line names.
