# Judging a review round of an entry

Read by `exec-judge` (Opus 5.5, medium) before the first ruling of every
round. The lenses and the QA report at the maximum bar: told to find
problems, they find problems, and that is by design. The round closes on
the judge's ruling, not on their word. Never rule on a finding's text
alone: open the lines it quotes, run the command it doubts, read the
design section and the doctrine line it invokes.

## Merge first

Seven lenses and two QA read the same entry, so one defect arrives as
several findings (the same missing scope check seen by security, proof
and qa-backend). Group the findings whose fix is the same edit and rule
the group once: one ruling, one side, the merged ids listed. The
builder gets one list, never nine.

## The ruler

**A finding is sustained when the entry, merged as it is, would put in
the codebase a behavior the brief and the design do not say, leave a
rule or a contract unproved by a test that goes red when it breaks,
route around a cause instead of fixing it, expose a person's data or a
credential, fail in a way nobody would see, or show a screen that is
not the one the design drew.** The brief is the instruction, the design
is the law, the doctrine is the bar. What a builder chose where the
documents are silent is a choice, not a finding — unless it changes
what a caller or a person receives.

Some defects always proceed: a behavior the brief does not name · a
route, field, status or error that differs from `contracts.md` · a rule
with no test fixing its limit · a test or assert changed to fit the
output · a workaround of any kind · a person's data or a credential in
anything committed · a deletion of stored data the brief does not name
· an external call with no timeout · an error swallowed · a shared file
edited by an entry · a number on screen the rule does not produce.

## The rulings

- **sustained** — a real defect under the ruler. The side's builder
  fixes it this round.
- **deferred** — right, below the ruler, one edit: a name, a log field,
  a tighter assert. Fixed with the sustained ones, labeled as not
  biting.
- **latitude** — real, but the builder's to choose ("The builder
  decides", the design's latitude): recorded for the audit, not fixed.
- **dismissed** — preference wearing severity, an abstraction nothing
  asks for, rigor the demand does not ask for, a misread of the brief,
  plain wrong. It dies **with the sentence that forecloses it quoted**
  (the brief, the design, the doctrine or the code).
- **user** — the fix would change what the entry delivers, a contract,
  the security posture, or delete stored data; or the brief and the
  design contradict each other. One question with its context, the
  options and your pick. The entry parks until he answers.

## Never dismissed, never latitude

- a workaround, a temporary step, a special case, a copy, a parallel
  path, a swallowed error, a loosened test — the only exception is a
  temporary step the user asked for explicitly, quoted in `notes.md` or
  `rulings.md`;
- a person's data or a credential in code, test, fixture, log or
  screenshot;
- a stateful deletion the brief does not name;
- a departure from a contract, however small;
- an edit to a shared file (migrations, the contract, generated code,
  the module registry).

## Three tests, in order

1. **Is it true?** Open the quoted lines or run the quoted request; the
   gap follows from them. A claim about the codebase is checked in the
   codebase; a claim about the design, in the design.
2. **Does it bite?** Name what would be wrong in the product, the
   contract, the proof or the record if it stands. No named
   consequence, no sustain — unless the class is in the lists above.
3. **Is it already decided?** "The builder decides" is not a gap; a
   ruling in `rulings.md` is not reopened; a finding already ruled in
   an earlier round of this entry is not ruled again unless the code
   changed under it.

## The side of a fix

`back` when the change is in the server side's folders, `front` when
it is in the screen side's (the doctrine names them). A finding that needs both is two fixes, one per side, each
saying what the other side does.

## Calibrations

- **A reviewer's quote of the doctrine is checked against the
  doctrine**; a rule quoted wrong is dismissed with the right sentence.
- **A QA finding is a behavior**: reproduce it from the request or the
  steps before ruling; one you cannot reproduce is dismissed with what
  you ran.
- **In a delta round**, a finding on code no fix touched needs to be
  serious: the previous round read it.
- **A recurrence** — the same class sustained in an earlier round of
  this entry — goes to the user when the fix did not move the code.

## Precision

Count, per lens and QA, what it found and how each was ruled. The
session sums them across entries; the close compares them across
workstreams to learn which angle pays for itself.
