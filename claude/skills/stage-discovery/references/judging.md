# Judging the review round

The conductor judges. The reviewers report at the maximum bar: told to
find problems, they always find problems. That is by design, and it is
why the round does not close on their word. It closes on yours. You
have what no agent has: the interview, his words, what he locked. Use
it, and never rule on a finding's text alone: open the sentence it
quotes, and when it is about behavior, open the frame.

## The oracle is the locked mock

Discovery's documents are derived from a mock he clicked and locked.
So the first question for any finding about behavior is: **what does
the locked mock do?** Answer it with `proto.mjs look` on the locked
version, never from memory.

- The documents say what the mock does → the documents are right; a
  lens that wants other behavior is asking for an amendment, which is
  his (owner `user`), or is wrong.
- The documents say something the mock does not do → the derivation is
  wrong; owner `author`, the fix is to say what the mock does.
- The mock is silent (no state, no step covers the case) → a gap in
  what he locked; owner `user`: either a new state in the mock (an
  amendment) or an Out line.

## Merge first

Two lenses and a reader per story read the same documents and the same
mock, so one defect arrives as several findings. Before ruling, group
the findings whose fix is the same edit (the same AC, value, Out item,
or the same missing state) and rule the group once: one ruling, one
owner, the merged ids listed in the reason. He answers one question
per decision, never one per lens.

## The ruler

The discovery razor: **a finding is sustained when a wrong guess at its
answer would change what gets built** (scope, data, behavior, a look he
would notice). A gap every plausible answer fills the same way is a
preference.

Some defects always proceed: an AC that disagrees with the locked mock ·
an AC a stranger could not judge · a capability neither In nor Out · a
contradiction between the PR-FAQ and the stories · money, legal, or a
stated constraint violated.

## The four rulings

- **sustained** — a real hole: as written, two competent engineers build
  different things, or he would not recognize what got built as what he
  locked. It becomes a fix, by its owner.
- **deferred** — a right observation that does not change what gets
  built: polish, a tightening worth doing once. Applied with the
  sustained ones in the same author batch, at its simplest form.
- **for the design** — the answer is a mechanism the design stage
  decides: a lock, a retry policy, an HTTP status, a storage shape, an
  alarm threshold, where a job runs. Written to the "For the design"
  list of `reviews.md` with its story; stage 2 reads it. Never
  dismissed, never asked here.
- **dismissed** — preference wearing severity, wording taste, a
  divergence that leads to the same build, direction (the evolution
  answers) mistaken for commitment, a format preference, a misread of
  a sentence or a frame that settles it, or plain wrong. It dies **with
  the sentence or the frame token that forecloses it quoted** in the
  reason; "already clear" without the quote is not a dismissal.

## Never dismissed

These classes are his whether or not the build changes; the razor does
not apply. Rule `sustained`, owner `user`, or at most `deferred`, never
`dismissed`:

- **personal data**: retention (keep forever is a decision), who can
  see it, the consent basis, export or deletion;
- **money**: anything that changes a bill or a price;
- **legal** and stated constraints;
- **security posture**: a secret's home, who holds a credential;
- **a confirmed fact contested** by a lens with a contradiction;
- **a contradiction between the PR-FAQ and the stories**, or between a
  document and the locked mock.

> A mock that stores people's data looks finished long before anyone
> asked how long the data is kept. "Every reading gives the same build"
> is never the answer to a retention question: it is his to decide.

## Three tests, in order

1. **Is it true?** The quoted material says that, the frame shows that,
   and the gap follows.
2. **Does it bite?** Name what gets built wrong, or left unbuilt, if
   this stands. No named consequence, no sustain; unless the class is
   in the list above.
3. **Is it already decided?** What he locked is contested only by a
   contradiction or a never-dismissed class, never by taste.

## The owner of a sustained finding

- **`author`** — the fix changes how something is written and decides
  nothing: an AC rewritten to say what the mock does, a THEN given its
  "observed" place, a value the mock shows added, an Out item the
  notes already settle. The file's author applies it (journey-scribe
  for journeys and stories, disc-author-prfaq for the PR-FAQ); he is
  not asked.
- **`user`** — the fix changes what the mock does or would have to do
  (an amendment), adds or removes scope, changes cost, touches personal
  data, or contests something he confirmed. He rules it, grouped by
  decision, in the one batch of the round.

In doubt between `author` and `user`, `user`: a wrong `user` costs one
question; a wrong `author` is a product decision nobody took.

## Calibrations

- **A blind reader's `fail` is evidence, not a verdict.** Run the
  reader's `how` yourself with `proto.mjs look`. If the mock does what
  the AC says and the reader drove it wrong, dismiss with the frame and
  the actions quoted. If the mock does something else, the AC is wrong:
  owner `author`, fix it to the mock.
- **A blind reader's `cannot-judge` usually means the AC lacks its
  "observed" place or a concrete value.** Owner `author`. When the
  reader could not reach the state at all from the story's words, the
  story is missing its GIVEN; same owner.
- **Mechanics are not behavior.** A lens that wants a lock, a retry
  count or a status code named found nothing for discovery; that is for
  the design.
- **Round 2 reads only the delta.** A finding raised in round 2 on text
  no fix touched gets the razor at full strength: round 1 read it and
  passed it.
- **Name a recurrence.** When `reviews.md` shows the same class
  sustained in round 1 and the fix did not move the document, say so,
  and take it to him instead of the author.

## What you write

In `reviews.md`, before any fix is sent: per finding (or merged group)
the id, lens, severity, title, ruling, owner, and the reason with the
quote or the frame. Then the round's lists: to the authors (by file),
to the user (by decision), for the design, dismissed. The blueprint's
review block is filled from this file at the close, so he can read
every dismissal there and reopen any at the approval.
