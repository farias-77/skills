# Judging the design review

The conductor judges. There is no judge agent and there is no second
round. One reviewer, `design-reviewer (Opus 5.5, medium)`, reads the
four documents once and returns blocking findings only, each with a
quote. You have what it does not: the debate in your head, his words
in `notes.md`, the closed `proposal.md`. Never rule on a finding's
text alone: open the sentence it quotes.

The pull of a review is toward more: a sustained "gap" tends to come
back as a new mechanism. The proposal was cut by the critic and closed
by him; the review is there to catch a hole, not to grow the design.
Every fix at its smallest.

## The ruler

**A finding is sustained when a builder reading only these documents
could not place the piece, would build it two ways, would build
something other than the lock or the closed proposal, or would decide
a hard class alone.** A gap every competent build fills the same way
is a preference. A finding is kept only when it names the failure, who
sees it and the AC, floor item or rule it rests on (the right-sizing
pack, §3 E1).

These always proceed:

- an AC of `stories.md` that `tests.md` does not prove;
- two documents that disagree (a name, a value, a shape, a count), or a
  document that disagrees with `proposal.md`;
- a screen or state of the locked mock that no document places, or
  that a document changes;
- a contract with no failure side, or an auth rule missing;
- a floor item missed (personal data in a log, a secret outside the
  secret manager, authorization outside the use case, a failure that
  ends silently).

## The two rulings

- **sustained**: written as it stands, the builder builds the wrong
  thing, two things, or decides what was not his. It becomes a fix.
- **dismissed**: preference wearing severity, a divergence that leads
  to the same build, hardening the closed proposal did not ask for, an
  item the document's "The implementer decides" already hands to the
  builder, or a misread. It dies **with the sentence that forecloses
  it quoted**.

A fix that adds a mechanism passes the pack's list C first and names
its requirement; a fix that adds a mechanism nothing forces is
dismissed, whatever the finding says. A risk worth watching, not worth
building, becomes a row of the evolution path in `solution.md`.

## Never dismissed

These are his, whether or not the build changes: personal data, money
above a few dollars a month, legal, the security posture, a
contradiction between two documents. Rule them sustained; when the fix
is a choice, take it in his place, conservatively (the option that
keeps the lock and the floor and stays reversible, at the smallest
cost), mark it `ruled: conductor` in `rulings.md`, and put it on the
veto list of the close.

## Who fixes

- **You**, with `Edit`, a fix of one or two lines that decides
  nothing: a name that differs from `proposal.md`, a missing AC row
  whose proof is plain, a value the sources fix.
- **The writer** of that document (`SendMessage`, apply mode), a larger
  fix, with the lines to change; it reports the final lines.
- **The implementer**: an observation whose answer the design does not
  owe; one line in that document's "The implementer decides". Never a
  hard class.

A fix that renames, revalues or removes something runs
`propagation-check.mjs` with the old term before and after: every hit
is changed, or stays only as a negation. Verify every fix on disk and
paste the line into `reviews.md`'s Proof column.

## What you write

In `reviews.md`, before any fix moves: one row per finding with its
ruling, who fixes it and the reason (the quote on a dismissal). The
finding's own text stays in `reviews/review.json`. `design-review.json`
is filled from this file at the close.
