# The audit — how stage 4 closes with the user

The user was not in the room. The audit is where he reads what was
decided in his place and rules it. The session writes `audit.md` from
[templates/audit.md](../templates/audit.md) **before asking anything**,
from `board.md`, `parked.md`, the `entries/*/run.json` returns and the
code on `feat/<workstream>`, in the order he reads:

1. **The demand in numbers.** Entries, amendments, rounds, findings
   (found · sustained · deferred · latitude · dismissed · user), the
   gate's last line on the top of the branch.
2. **Parked.** Every line of `parked.md`, first: what did not merge and
   why, with the evidence.
3. **Choices.** What the builders chose where the documents were
   silent, grouped by what they touch; the ones that change what a
   caller or a person receives first.
4. **Latitude.** What the judge left to the builders, one line each.
5. **Precision per lens and QA**, summed over the entries.

Each choice and latitude item carries: where (entry, file:line), the
nearest sentence of the documents, what was built, what the code shows
now (read, not reported), the recommendation (keep, fix) and why.

Then the Execution tab of the blueprint, built and published, and the
PushNotification. He rules parked items and choices through the
question tool, four per call, parked first; each ruling goes next to
its item and to `rulings.md`. A "fix" becomes a fix entry run through
exec-entry and merged. When he approves, the stage closes.
