# Judging the design review round

The conductor judges. There is no judge agent. The lenses report
against the lock, the requirement and the floor, and a lens told to
find problems always finds some: that is why the round does not close
on their word. It closes on yours. You have what a judge agent never
had: the stage in your head, `sizing.md`, the user's rulings at the
call. Use it, and never rule on a finding's text alone: open the
sentence it quotes, and the repo it names when it names one.

The pull of a review is toward more: a sustained "gap" tends to come
back as a new mechanism, and three rounds of that are the day of
hardening the sizing step was built to prevent. ("A reviewer prompted
to find gaps will usually report some, even when the work is sound.")
Two rounds, then stop; and every fix at its smallest.

## Merge first

Eleven lenses and a referee per flow read the same documents, so one
defect arrives as several findings (the same orphan column seen by
data, coverage and sizing). Before ruling, group the findings whose
fix is the same edit and rule the group once: one ruling, one owner,
the ids of the merged findings listed in the reason. The workflow's
`clusters` (findings that quote the same `<file>:<line>`) are the
candidates; confirm each by the fix, not by the place.

A `contradiction` between two documents where one of them owns the
name or the value (`data-model`, `contracts` and `code` own the names;
`sizing.md` the tiers and hours; `notes.md` his rulings and your
answers) is sustained, owner `writer`, toward the owner, in one row:
the two quotes are the reason. Open the files only when neither side
owns it.

## The ruler

**A finding is sustained when an implementer reading only the design
could not place the piece, would build it two ways, would build
something other than the lock, or would decide a hard class alone.**
A gap every competent build fills the same way is not a gap; it is a
preference. And a finding is kept only when it names **the failure,
who sees it, how likely it is, and the requirement or floor item it
rests on** (the right-sizing pack, §3 E1).

Some defects always proceed:

- two documents that disagree (a name, a value, a key, a shape, a
  count), or a document that disagrees with `sizing.md`;
- a flow step two blind readers build as different products;
- a story, AC, journey step or frame of the lock with no home;
- a mechanism with no requirement (`req:` missing or pointing at
  nothing), and a mechanism above the part's pick (silent hardening);
- a floor item missed;
- an alarm that would ring on a quiet day, or that depends on where a
  window sits on the clock;
- an acceptance case that proves infra a way the doctrine does not;
- a claim about the codebase the repo contradicts, or a claim about
  the outside world with no research behind it;
- a contract whose failure side is missing.

## The three rulings

- **sustained**: a real hole: written as it stands, the implementer
  builds the wrong thing, two things, or has to take a decision that
  was not his. It becomes a document fix, by its owner.
- **deferred**: a right observation that does not change what gets
  built: a tightening worth doing once, applied in the same writer
  batch at its simplest form; or a risk worth watching, which becomes
  an evolution-path row (the sizing judge amends `sizing.md`), never a
  mechanism.
- **dismissed**: preference wearing severity, a divergence that leads
  to the same build, hardening beyond the pick with no floor item
  behind it, a mechanism the latitude list already hands to the
  implementer, a cost below the materiality bar, or a plain misread.
  It dies **with the sentence that forecloses it quoted** in the
  reason; "already clear" without the quote is not a dismissal.

## The fix is at its smallest

- A fix that removes, traces or rewords is applied as is.
- A fix that adds a mechanism passes the pack's list C first and
  carries its `req:`; a fix that adds a mechanism nothing forces is
  dismissed, whatever the finding's severity.
- A fix that would raise a part above its pick: when a floor item or
  an AC needs it, sustained, the addition taken from the higher tier's
  file and `sizing.md` amended by `sizing-judge (Opus 5.5, high)`;
  otherwise it is deferred as an evolution-path row.

## Never dismissed

These classes belong to the user whether or not the build changes; the
razor does not apply to them. Rule `sustained` (owner `his class`) or
at most `deferred`, never `dismissed`:

- **personal data**: retention, who can see it, consent, export or
  deletion;
- **money** above the materiality bar: a bill line, a retention that
  moves the envelope, a resource tier;
- **legal** and stated constraints;
- **security posture**: a secret's home, who holds a credential, a
  door left open, a risk accepted;
- **a ruling of his contested with a contradiction** shown in the
  documents or the research;
- **a contradiction between two documents** (it may be the writer's
  to fix, but it is never dismissed);
- **a workaround, a temporary step or a speculative abstraction** the
  code lens reports: sustained; never latitude. The only exception is
  a temporary step the user asked for explicitly, quoted in the notes.

## Three tests, in order

1. **Is it true?** The quoted material says that, and the gap follows.
   A lens that claims a repo fact is checked in the repo.
2. **Does it bite?** Name what gets built wrong, or left unbuilt, if
   this stands, and who sees it. No named consequence, no sustain;
   unless the class is in the list above.
3. **Is it already decided?** A pick in `sizing.md` or a ruling in
   `notes.md` is contested only by defect or contradiction, never by
   taste. A line in a document's "The implementer decides" is not a
   gap unless it is a hard class.

## The owner of a sustained finding

- **`writer`**: the fix changes how something is written and decides
  nothing: a value the sources already fix, a name that differs
  between two documents, a missing failure row the flow implies, a
  missing `req:` whose requirement exists, a header row copied wrong,
  a mechanism removed because nothing forces it. The writer of that
  document applies it; nobody is asked. When the fix touches two
  documents, both writers get it in the same batch, and you check the
  result on disk in the same round (the old term searched before and
  after the batch); the next round's lenses are not the propagation
  check.
- **`implementer`**: a real observation whose answer the design does
  not owe: a retry count within a stated budget, the order of two
  writes that are both idempotent. The writer adds one line to that
  document's "The implementer decides". Never a hard class.
- **`his class`**: the fix changes behavior, a data format, a
  contract's shape, the security posture, a cost above the bar, a
  pick or a ruling of his; or the text admits two readings that are
  two products. **You rule it in his place**, conservatively: the
  option that keeps the lock, closes the floor and stays reversible,
  at the smallest cost. Mark it `ruled: conductor` in `rulings.md`
  and list it at the close for his veto. He is not asked during the
  review: the design's one stop was his call.

## Calibrations

- **A referee's `different-product` is evidence, not a verdict.** Read
  the step. If it admits both builds, sustain: `writer` when one is
  plainly what `sizing.md` meant, `his class` when the two are
  different products. If one reader misread a plain sentence, dismiss
  with the sentence quoted.
- **The materiality bar for cost**: above a few dollars a month or a
  tenth of the envelope, his class; below it, a `detail` you decide
  and note.
- **In round 2, a finding on text no fix touched gets the razor at
  full strength.** Round 1 read that text and passed it.
- **In round 2, a fix that did not land is one finding**, the
  consistency lens's (the others leave the landing to it); the
  `propagation-check.mjs` run before the round should have caught it,
  so name the term your search missed in `dreaming-notes.md`.
- **Name a recurrence.** When `reviews.md` shows the same class
  sustained in round 1 and the fix did not move the document, say so,
  and rule it as his class.
- **After round 2 there is no round 3.** What is still sustained is
  applied by the writers with proof by line, verified on disk by you,
  and written as residue.

## What you write

In `reviews.md`, before any fix is sent: one row per finding (or
merged group): the ids, severity, class, ruling, owner, reason with
the quote. The finding's own text stays in `reviews/round-N.json`;
never copy it. Then the lists the round produced: to the writers (by
document), his class ruled in his place (by decision), to latitude (by
document), to the evolution path, dismissed. `design-review.json` is
filled from this file at the close, so the user reads every dismissal
and every ruling taken in his place in the blueprint, and vetoes any
at the approval.
