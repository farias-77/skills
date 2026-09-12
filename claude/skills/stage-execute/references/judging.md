# Judging the row's review rounds

The worker judges. The lenses report at the maximum bar: told to find
problems, they find problems, and that is by design. The round closes
on the worker's ruling, not on their word. The worker has what the
lenses do not: the goal whole, the design, the recon, the repo's
history, the branch. Never rule on a finding's text alone: open the
lines it quotes, run the command it doubts, read the design section
it invokes.

## Merge first

Five lenses read the same diff, so one defect arrives as several
findings (the same missing check seen by code, proof and operations).
Group the findings whose fix is the same edit and rule the group
once: one ruling, one owner, the merged ids in the reason. The
builder gets one list, never five.

## The ruler

The execution razor: **a finding is sustained when the diff, merged
as it is, would put in alpha a behavior the goal and the design do
not say, leave a contract or a rule unproved by a test, loosen a
proof to fit the product, expose a credential or a person, or fail
in a way nobody would see.** The goal is the brief and the design is
the law; the standards are the bar. What the builder chose where the
documents were silent is a choice, listed, not a finding — unless
the choice changes what a consumer receives.

Some defects always proceed: a behavior the goal does not name ·
a contract field, route or event that differs from `contracts.md` ·
a business rule with no test fixing its limit · a test expectation
or a smoke assertion changed to fit the output · a `run` that does
not print its `expect` · a real credential, a real person's data, an
account id in code, logs, fixtures or docs · a deletion of stored
data the goal does not name · an external call with no timeout · an
error swallowed without a log or an alarm · config that branches on
the stage in code · a dependency added that the runtime cannot load.

## The three rulings

- **sustained** — a real defect under the razor. The builder fixes
  it in this round's fix pass, or it parks.
- **deferred** — a right observation below the razor that costs one
  edit: a name, a log field, a dead import, a tighter assert. Applied
  with the sustained ones at its simplest form; the label records
  that it did not bite.
- **dismissed** — preference wearing severity, a mechanism nothing
  forces (an abstraction for the next story, a flag for later, a
  retry the design did not ask for), rigor the demand has not asked
  for, a departure the row file already records with its reason, a
  finding that misread the goal, or plain wrong. It dies **with the
  sentence that forecloses it quoted** in the reason (from the goal,
  the design, the standard or the code); "already fine" without the
  quote is not a dismissal.

## Never dismissed

Rule `sustained` or at most `deferred`, never `dismissed`:

- a test expectation or a smoke assertion changed in the diff, in
  any direction, without the row's reason written next to it;
- a credential, a token, a person's e-mail or name, an account id,
  in anything committed (a fixture included) — an identifier of an
  external source is a `detail` only when the lens shows nothing it
  grants, and a ruling already in `rulings.md` is not reopened;
- a stateful deletion (a table, a bucket, an index, rows) the goal
  does not name;
- a departure from a frozen contract, however small;
- a proof that does not print what the goal's `expect` says;
- a change to a file outside the row's `touches` that the row file
  does not explain.

> In the first end-to-end run four smoke fixes entered without a lens
> and one of them loosened an assert; a fix at the top of a PR stack
> hid that the PR below was red; a rebase resolved "without
> conflicts" left a duplicated import; a dependency the runtime could
> not load took down three lambdas and was only seen at the wave. The
> lists above carry each of those.

## Three tests, in order

1. **Is it true?** Open the quoted lines; the gap follows from them.
   A lens that claims a repo fact is checked in the repo; a lens that
   claims a design fact is checked in the design.
2. **Does it bite?** Name what would be wrong in alpha, in the
   contract, in the proof or in the record if this stands. No named
   consequence, no sustain — unless the class is in the list above.
3. **Is it already decided?** A choice the goal leaves to the worker
   ("The worker decides") is not a gap; a departure the design
   records as latitude is not a finding; a ruling in `rulings.md`
   is not reopened.

## The owner of a sustained finding

- **`builder`** — the fix changes code, tests or docs on this branch
  and decides nothing the plan owes: the builder applies it in the
  fix pass; round 2 checks it landed.
- **`note`** — real, but not this row's to fix now: a rule the
  standard leaves open, a cost the design accepted, a debt with a
  named owner. One line in the PR body under "Notes" and in the row
  file; the audit rules it with the user.
- **`master`** — the fix would change what the row builds, a
  contract, a wave's proof, or delete stored data; the goal
  contradicts the repo or the design. One `parked` line to the
  master with the finding quoted; the row is parked or the master
  answers in one line from the plan.

In doubt between `builder` and `note`, `builder`. In doubt between
`note` and `master`, `master`.

## Calibrations

- **A lens's "the standard says" is checked against the standard
  file**, not believed; a rule quoted wrong is dismissed with the
  right sentence.
- **A departure from the standard the builder recorded** (with the
  rule it leaves and why the system got simpler) is a `note`, never
  a `builder` fix by a lens's taste; the audit rules it.
- **Coverage is the rule's, not the file's:** a business rule without
  a test fixing its limit is sustained; a percentage below a number
  on a file with no rule is a `detail`.
- **In round 2, a finding on text no fix touched gets the razor at
  full strength.** Round 1 read it and passed it.
- **A lens that fails or returns nothing** is re-dispatched once by
  the workflow; a round with a lens still invalid is recorded so and
  judged on the four that ran, and the row file says which lens was
  missing.
- **A recurrence** — the same class sustained on a previous row of
  this lane — is named in the ruling and goes to the row file's notes
  so the audit sees the pattern.

## What you write

`reviews/<repo>/<N.k>/r<n>.md`, before any fix is sent: per finding
(or merged group) the id, lens, severity, title, ruling, owner, reason
with the quote; then the lists: to the builder (the fix pass), notes,
to the master, dismissed. The row file carries the numbers per round
and the notes; the PR body carries the numbers and the notes;
`lanes/<repo>.json` carries the numbers. Nothing here goes to
`rulings.md`: at execution the worker rules alone inside the two
rounds, and the user rules the residue at the audit.
