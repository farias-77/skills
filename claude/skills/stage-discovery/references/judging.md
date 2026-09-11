# Judging the review round

The conductor judges. The reviewers report at the maximum bar: told to
find problems, they always find problems. That is by design, and it is
why the round does not close on their word. It closes on yours. You
have what a judge agent never had: the interview, the user's words,
what he already decided. Use it, and never rule on a finding's text
alone: open the sentence it quotes.

## Merge first

Four lenses and a referee per story read the same documents, so one
defect arrives as several findings. Before ruling, group the findings
whose fix is the same edit (the same sentence, value, AC or Out item,
seen by walkthrough, acceptance, boundary, wireframe and ambiguity) and
rule the group once: one ruling, one owner, the ids of the merged
findings listed in the reason. The user answers one question per
decision, never one per lens.

## The ruler

The discovery razor: **a finding is sustained when a wrong guess at
its answer would change what gets built** (scope, data, behavior). A
gap every plausible answer fills the same way is not a gap; it is a
preference.

Some defects always proceed: a contradiction between the two
documents · an acceptance criterion a stranger could not judge · an
item neither In nor Out · two blind readers who would ship different
products from one sentence · a screen with no story or a story with a
screen no wireframe shows · money, legal, or a stated constraint
violated.

## The four rulings

- **sustained** — a real hole: written as it stands, two competent
  engineers build different things, or the demand's owner would not
  recognize what got built. It becomes a document fix, by its owner.
- **deferred** — a right observation that does not change what gets
  built: polish, a tightening worth doing once. Applied with the
  sustained ones in the same author batch, at its simplest form.
- **for the design** — the answer is a mechanism the design stage
  decides: lock contention, retry and DLQ policy, HTTP status codes,
  storage shape, alarm thresholds, where a job runs. Not a discovery
  gap, and not garbage: it is written to the "For the design" list of
  `reviews.md`, with the story it came from, and stage 2 reads that
  list at its macro shape. Never dismissed, never asked here.
- **dismissed** — preference wearing severity, wording taste, a
  divergence that leads to the same build, direction (the evolution
  answers) mistaken for commitment, format preference (a confirmed
  bad-path row asked to become a numbered AC), a plain misread of a
  sentence the story forecloses, or plain wrong. It dies **with the
  sentence that forecloses it quoted** in the reason; "already clear"
  without the quote is not a dismissal, it is a sustain you did not
  want to write.

## Never dismissed

These classes are the user's whether or not the build changes; the
razor does not apply to them. Rule `sustained`, owner `user`, or at
most `deferred`, never `dismissed`:

- **personal data**: retention (keep forever is a decision), who can
  see it, the consent basis, export or deletion;
- **money**: anything that changes a bill or a price;
- **legal** and stated constraints;
- **security posture**: a secret's home, who holds a credential;
- **a confirmed fact contested** by a lens with a contradiction;
- **a contradiction between the two documents**.

> In the first end-to-end run, "retention period for ingested session
> records never stated" and "consent basis for orphan-session e-mails
> not addressed" were dismissed as "every reading gives the same
> build". Both were the user's to decide. That is the mistake this
> list exists for.

## Three tests, in order

1. **Is it true?** The quoted material says that, and the gap follows.
2. **Does it bite?** Name what gets built wrong, or left unbuilt, if
   this stands. No named consequence, no sustain; unless the class is
   in the list above.
3. **Is it already decided?** A fact the user confirmed is contested
   only by contradiction, never by taste. Taste requirements close in
   the user's words by rule; do not sustain precision the stage does
   not owe.

## The owner of a sustained finding

- **`author`** — the fix changes how something is written and decides
  nothing: splitting an AC in two, adding the missing value the
  documents already imply elsewhere, naming an Out item the interview
  already settled, aligning two sentences that say the same thing
  differently, a wireframe label that names the wrong thing. The
  author of that file applies it; the user is not asked.
- **`user`** — the fix changes the product's behavior, adds or removes
  scope, changes cost, touches personal data, contests a fact the user
  confirmed, or chooses between two readings the text admits and the
  two are different products. The user rules it, grouped by decision.

In doubt between `author` and `user`, `user`: the cost of a wrong
`user` is one question; the cost of a wrong `author` is a product
decision nobody took. A fix that is mechanical given what the user
already decided is not a doubt: it is the author's.

## Calibrations

- **A referee's `different-product` is evidence, not a verdict.** Read
  the sentence. If it admits both readings, sustain, owner `user`, and
  put both builds in the reason. If one reader misread a sentence that
  is plain, dismiss with the sentence quoted.
- **Mechanics are not readings.** Two readers who differ on a lock, a
  retry count or a status code did not find an ambiguity in the
  story; that is for the design.
- **A finding raised for the first time on text no fix touched, in a
  later round, gets the razor at full strength.** The earlier round
  read that text and passed it.
- **Name a recurrence.** When `reviews.md` shows the same class
  sustained before and the fix did not move the document, say so, and
  take it to the user instead of the author.

## What you write

In `reviews.md`, before any fix is sent: per finding (or merged
group), the id, lens, severity, title, ruling, owner, reason with the
quote. Then the four lists the round produced: to the authors (by
file), to the user (by decision), for the design, dismissed. The
blueprint's review block is filled from this file at the close, so the
user can read every dismissal there and reopen any at the approval.
