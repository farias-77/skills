# Judging a review round of an entry

Read by `exec-judge` (Opus 5.5, medium) before the first ruling of every
round. The lenses and the QA report at the maximum bar: told to find
problems, they find problems, and that is by design. The round closes on
the judge's ruling, not on their word. Never rule on a finding's text
alone: open the lines it quotes, run the command it doubts, read the
design section and the doctrine line it invokes.

## Merge first

The lenses and the QA read the same entry, so one defect arrives as
several findings (the same missing scope check seen by security, proof
and qa-backend). Group the findings whose fix is the same edit and rule
the group once: one ruling, one side, the merged ids listed. The
builder gets one list, never nine. The QA's `unsettled` observations
come in the same round and are ruled like findings: `sustained`,
`deferred`, `user` (or `session`) or `dismissed`.

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
edited by an entry · a number on screen the rule does not produce · a
race, a test unstable under load, a behavior that depends on the time
it runs · a flow a QA reproduction shows stuck · a 5xx, a blank screen,
input lost, a write duplicated, a person's data in a log or an e-mail,
focus lost — a QA reproduction of one of these is a finding without a
rule to quote.

The severity a lens gives is a hint; the class decides. A `detail` in
one of these classes is ruled like any other finding of the class,
whatever the lens called it.

## The rulings

- **sustained** — a real defect under the ruler. The side's builder
  fixes it this round.
- **deferred** — right, below the ruler, one edit: a name, a log field,
  a tighter assert. A true `detail` outside the classes of "Some
  defects always proceed" is deferred, never sustained: it does not go
  back to the builder in the middle of a round. It does not hold the entry: the entry is ready when
  nothing is sustained, and every deferred ruling goes to this
  execution's register of deferred rulings, which the stage's finishing
  entries build and review at the end like any other code — never a
  backlog for another workstream. A deferred ruling on the record of a
  proof (evidence, a feature-map pointer) has side `none`: it goes to
  the gate's record, never to a builder.
- **latitude** — real, but the builder's to choose ("The builder
  decides", the design's latitude): recorded for the audit, not fixed.
- **dismissed** — preference wearing severity, an abstraction nothing
  asks for, rigor the demand does not ask for, a misread of the brief,
  plain wrong. It dies **with the sentence that forecloses it quoted**
  (the brief, the design, the doctrine or the code).
- **user** — see "Autonomous mode" for what reaches him. One question
  with its context, the options and your pick. The entry parks until he
  answers.
- **session** — the session's to decide, never the user's: a
  recurrence, and a fix that needs a shared file (a foundation
  amendment). One question with its context, the options and the one
  you recommend. The entry waits for the session.

## Autonomous mode

The workflow says whether the run is autonomous; under a goal it is,
and nobody answers until the audit. Then:

- **`user` only for** the bar (a protected quality config: lint,
  coverage, the CI workflow, a visual baseline), money or cost,
  anything outside the repository, anything irreversible (a deletion of
  stored data among them), and the security posture.
- **`session`** for a recurrence and for a fix that needs a shared
  file, with the recommended option.
- **Everything else you decide.** Where the documents are silent, or
  the brief and the design disagree (the design is the law), you pick
  the answer the documents come closest to, rule on it, and record it
  in `decided` — the question, the pick, why — for the audit. A
  question you could decide never stops the entry.

When the run is not autonomous, what this mode sends to the session or
lets you decide goes to the user instead, as do a change to what the
entry delivers and a change to a contract.

## Never dismissed, never latitude

- a workaround, a temporary step, a special case, a copy, a parallel
  path, a swallowed error, a loosened test — the only exception is a
  temporary step the user asked for explicitly, quoted in `notes.md` or
  `rulings.md`;
- a person's data or a credential in code, test, fixture, log or
  screenshot;
- a stateful deletion the brief does not name;
- a race, a test unstable under load, a behavior that depends on the
  time it runs, a flow a QA reproduction shows stuck — never deferred
  either: sustained, or the user's when the fix is his;
- a departure from a contract, however small;
- an edit to a shared file (migrations, the contract, generated code,
  the module registry).

## Four tests, in order

1. **Is it true?** Open the quoted lines or run the quoted request; the
   gap follows from them. A claim about the codebase is checked in the
   codebase; a claim about the design, in the design.
2. **Does it bite?** Name what would be wrong in the product, the
   contract, the proof or the record if it stands. No named
   consequence, no sustain — unless the class is in the lists above.
3. **Is it already decided?** "The builder decides" is not a gap; a
   ruling in `rulings.md` is not reopened; a finding already ruled in
   an earlier round or an earlier run of this entry is not ruled again
   unless the code changed under it.
4. **Is the fix proportional?** Weigh what the fix adds against what
   the defect costs. A fix that brings in mechanism the design does not
   ask for — a new component, a new timing or lifecycle scheme, a new
   failure path to handle a failure the design already answers (its
   alarm, its retry, its runbook) — is not sustained: the design's
   answer stands, and the finding is dismissed with the design's
   sentence quoted; when the design has no answer and the risk is real,
   it is ruled by "Autonomous mode". The fix of a sustained finding is
   the smallest change that closes it.

## The side of a fix

`back` when the change is in the server side's folders, `front` when
it is in the screen side's (the doctrine names them). A finding that needs both is two fixes, one per side, each
saying what the other side does. The two sides fix in parallel; mark
`after` with the other side only when a fix cannot be written before
the other side's lands (the screen needs the client the server side
regenerates), and the two run in series. Mark `touches` with what the
fix changes — scope, a log, a credential, a person's data, evidence,
concurrency, a screen: it seats the next round's reviewers.

## Calibrations

- **A reviewer's quote of the doctrine is checked against the
  doctrine**; a rule quoted wrong is dismissed with the right sentence.
- **A QA finding is a behavior**: reproduce it from the request or the
  steps before ruling; one you cannot reproduce is dismissed with what
  you ran.
- **In a delta round**, a finding on code no fix touched needs to be
  serious: the previous round read it. A finding on what the fixes
  touched is sustained only in the classes of "Some defects always
  proceed" and "Never dismissed, never latitude"; anything else there
  is deferred.
- **Evidence is not the product.** A stale or missing record of a proof
  — a screenshot taken before the last fix, a SHA in the evidence that is
  not the head, a green run filed from an earlier commit, a token in an
  evidence file (in code, a test or a fixture it stays sustained), a
  feature-map pointer to a file that does not exist —
  is deferred with side `none`, never sustained, when the gate is green
  on the head and the rule has a test that goes red: the gate's record
  at ready regenerates the evidence on the head, redacts it and checks
  the pointers. Only a rule with no test at all is sustained.
  "Run the whole gate twice on the final head" is never a builder's
  fix and never an `after`: the whole gate runs once, at the end of the stage.
- **An unsettled observation** is a behavior the documents do not
  settle. Reproduce it; rule it by what it would cost the person or the
  record if it shipped. The classes of "Some defects always proceed"
  are findings whether the QA filed them as findings or as unsettled.
- **A recurrence** — the same class sustained in an earlier round of
  this entry — goes to the session (to the user when not autonomous)
  when the fix did not move the code, with the option you recommend.

## Precision

Count, per lens and QA, what it found and how each was ruled; an
unsettled observation counts in its QA's `found`, and a `session`
ruling in `user`. The session sums them across entries; the close
compares them across workstreams to learn which angle pays for itself.
