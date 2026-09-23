# Judging the design review round

The conductor judges. The lenses report at the maximum bar: told to
find problems, they always find problems. That is by design, and it is
why the round does not close on their word. It closes on yours. You
have what a judge agent never had: the session, the user's words, the
cards in `notes.md`. Use it, and never rule on a finding's text alone:
open the sentence it quotes, and the repo it names when it names one.

## Merge first

Ten lenses and a referee per flow read the same documents, so one
defect arrives as several findings (the same orphan item seen by data,
code, contracts and coverage). Before ruling, group the findings whose
fix is the same edit and rule the group once: one ruling, one owner,
the ids of the merged findings listed in the reason. The user answers
one question per decision, never one per lens.

## The ruler

The design razor: **a finding is sustained when an implementer reading
only the design could not place the piece, would build it two ways,
or would decide a hard class alone.** A gap every competent build
fills the same way is not a gap; it is a preference.

Some defects always proceed: two documents that disagree (a name, a
value, a key, a shape, a count) · a flow step two blind readers build
as different products · a story with no flow and no screen · an alarm
that would ring on a quiet day, or that depends on where a window sits
on the clock · an acceptance case that proves infra by a test under
`infra/` · a claim about the outside world with no research behind it
· a contract whose failure side is missing · a card contradicted by
what the documents say.

## The three rulings

- **sustained** — a real hole: written as it stands, the implementer
  builds the wrong thing, two things, or has to take a decision that
  was not his. It becomes a document fix, by its owner.
- **deferred** — a right observation that does not change what gets
  built: a tightening worth doing once. Applied in the same writer
  batch as the sustained ones, at its simplest form.
- **dismissed** — preference wearing severity, a divergence that leads
  to the same build, a mechanism the latitude list already hands to
  the implementer, a card contested by taste rather than by defect, a
  cost below the materiality bar, or a plain misread. It dies **with
  the sentence that forecloses it quoted** in the reason; "already
  clear" without the quote is not a dismissal, it is a sustain you did
  not want to write.

## Never dismissed

These classes are the user's whether or not the build changes; the
razor does not apply to them. Rule `sustained`, owner `user`, or at
most `deferred`, never `dismissed`:

- **personal data**: retention, who can see it, consent, export or
  deletion;
- **money** above the materiality bar: a bill line, a retention that
  moves the envelope, a resource tier;
- **legal** and stated constraints;
- **security posture**: a secret's home, who holds a credential, a
  door left open, a risk accepted;
- **a card contested with a contradiction** shown in the documents or
  the research;
- **a contradiction between two documents** (it may be the writer's
  to fix, but it is never dismissed);
- **a workaround, a temporary step or a speculative abstraction** the
  code lens reports: sustained, owner `user` when removing it changes
  the design, `writer` otherwise; never latitude. The only exception
  is a temporary step the user asked for explicitly, quoted in the
  notes.

> In the first end-to-end run, a jest test under `infra/tests/` passed
> nine lenses and two rounds, and the `HOUR()` in an alarm's metric
> math passed the alarms lens and reached production. Both are on the
> "always proceed" list above for that reason.

## Three tests, in order

1. **Is it true?** The quoted material says that, and the gap follows.
   A lens that claims a repo fact is checked in the repo.
2. **Does it bite?** Name what gets built wrong, or left unbuilt, if
   this stands. No named consequence, no sustain; unless the class is
   in the list above.
3. **Is it already decided?** A card in `notes.md` is contested only
   by defect or contradiction, never by taste. A line in a document's
   "The implementer decides" is not a gap unless it is a hard class.

## The owner of a sustained finding

- **`writer`** — the fix changes how something is written and decides
  nothing: a value the notes already fix, a name that differs between
  two documents, a missing failure row the flow implies, a step split
  in two, a reference to research that exists. The writer of that
  document applies it; the user is not asked. When the fix touches
  two documents, both writers get it, and the consistency lens reads
  the result next round.
- **`implementer`** — a real observation whose answer the design does
  not owe: a retry count within a stated budget, a hook versus a
  second call, the order of two writes that are both idempotent. The
  writer adds one line to that document's "The implementer decides".
  Never a hard class.
- **`user`** — the fix changes behavior, a data format, a contract's
  shape, the security posture, a cost above the bar, the sequence, or
  contests a card; or the text admits two readings that are two
  products. The user rules it, one question per decision.

In doubt between `writer` and `user`, `user`: the cost of a wrong
`user` is one question; the cost of a wrong `writer` is a product
decision nobody took. A fix that is mechanical given a card the user
already took is not a doubt: it is the writer's.

## Calibrations

- **A referee's `different-product` is evidence, not a verdict.** Read
  the step. If it admits both builds, sustain, owner `user` when the
  two are different products and `writer` when one is plainly what
  the card meant. If one reader misread a plain sentence, dismiss
  with the sentence quoted.
- **The materiality bar for cost**: above a few dollars a month or a
  tenth of the envelope, the user's; below it, a `detail` you decide
  and note. "Estamos falando de centavos" is a ruling already taken.
- **Mechanics the latitude names are the implementer's.** A lens that
  reports an item listed under "The implementer decides" is dismissed
  with the line quoted, unless the item is a hard class.
- **In a delta round, a finding on text no fix touched gets the razor
  at full strength.** Round 1 read that text and passed it.
- **Name a recurrence.** When `reviews.md` shows the same class
  sustained before and the fix did not move the document, say so, and
  take it to the user instead of the writer.

## What you write

In `reviews.md`, before any fix is sent: per finding (or merged
group), the id, lens, severity, title, ruling, owner, reason with the
quote. Then the lists the round produced: to the writers (by
document), to the user (by decision), to latitude (by document),
dismissed. `design-review.json` is filled from this file at the close,
so the user reads every dismissal in the blueprint and reopens any at
the approval.
