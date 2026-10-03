# The audit — how stage 4 closes with the user

The user was not in the room. The audit is where he reads what was
decided in his place and rules it. The session writes `audit.md` from
[templates/audit.md](../templates/audit.md) **before asking anything**,
from `board.md`, `parked.md`, the `entries/*/run-*.json` returns and the
code on `feat/<workstream>`, `deferred.md`, `learn-log.md` and `rulings.md`, in the
order he reads:

1. **The demand in numbers.** Entries, amendments, batch slices,
   checks (the whole check and the deltas), findings (found ·
   blocking · deferred · learn log), the verifier's verdicts (PASS ·
   FAIL · INCONCLUSIVE), the whole gate's last line on the top of the
   branch and the signoff posted on that sha.
2. **Parked.** Every line of `parked.md`, first: what did not merge and
   why, with the evidence.
3. **Decided in his place.** Every `decided` item of the returns
   (what the builder settled conservatively in his classes) and every
   answer the session gave (`ruled: session`), one line each with the
   option taken and the one left.
4. **Choices.** What the builder chose where the documents were
   silent, grouped by what they touch; the ones that change what a
   caller or a person receives first.
5. **Acceptance.** The acceptance lines that could not be a check
   (`cannotCheck`), and any check revised by an amendment, one line
   each.
6. **Precision per reviewer**, summed over the entries (found ·
   blocking, with a repro or only a rule · deferred · learn log ·
   closed at the delta), and the deferred register: done, skipped with
   the reason.
7. **The proof's numbers**, from the returns' `verdicts`: PASS, FAIL
   and INCONCLUSIVE per entry, the PII canary's hits, the failure-mode
   cases that failed and were fixed, and the escapes known so far (a
   defect found after its entry merged that an acceptance check or a
   failure-mode case should have caught). Stage 6 carries them to the
   retro and adds the escapes found later.

Each decided and choice item carries: where (entry, file:line), the
nearest sentence of the documents, what was built, what the code shows
now (read, not reported), the recommendation (keep, fix) and why.

Then the stage report (the video, the slides, the Execution tab of the
blueprint, built and published) and the PushNotification. He rules parked items and choices through the
question tool, four per call, parked first; each ruling goes next to
its item and to `rulings.md`. A "fix" becomes a fix entry run through
exec-entry and merged. When he approves, the stage closes.
