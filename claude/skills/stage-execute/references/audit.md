# The audit — how stage 4 closes with the user

The user was not in the room. The audit is where he reads what was
decided in his place and rules it. The session writes `audit.md` from
[templates/audit.md](../templates/audit.md) **before asking anything**,
from `board.md`, `parked.md`, the `entries/*/run-*.json` returns, the
entries' `notes.md`, the code on `feat/<workstream>` and `rulings.md`,
in the order he reads:

1. **The demand in numbers.** Entries merged and parked, builder
   passes, minutes per entry (median and the slowest, with its slowest
   step), findings (found · blocking · notes), the whole gate's last
   line on the top of the branch and the signoff posted on that sha.
2. **Parked.** Every line of `parked.md`, first: what did not merge and
   why, with its blocking items and evidence.
3. **Decided in his place.** Every `decided` item of the returns and
   every answer the session gave (`ruled: session`), one line each
   with the option taken and the one left.
4. **Choices.** What the builder chose where the documents were
   silent; the ones that change what a caller or a person receives
   first.
5. **Outside Owns.** Every file an entry changed outside its Owns and
   Extends, with the builder's reason.
6. **The tally per agent**, summed over the entries (found · blocking ·
   notes · downgraded · closed at the delta).

Each decided and choice item carries: where (entry, `file:line`), the
nearest sentence of the documents, what was built, the recommendation
(keep, fix) and why.

Then the stage report, with the screens beside the locked mock, and the
PushNotification. He rules parked items, choices and any screen that
drifts from the mock through the question tool, four per call, parked
first; each ruling goes next to its item and to `rulings.md`. A "fix"
becomes one fix entry `X.<n>` run through exec-entry and merged. When
he approves, the stage closes.
