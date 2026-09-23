# Judging the plan review round

The conductor judges. The lenses report at the maximum bar: told to
find problems, they always find problems. That is by design, and it is
why the round does not close on their word. It closes on yours. You
have what a judge agent never had: the cut as the user approved it,
his words, the recon. Use it, and never rule on a finding's text
alone: open the brief it quotes, the recon it contradicts, the code it
names when it names a file.

## Merge first

Three lenses and a referee per brief read the same briefs, so one
defect arrives as several findings (the same missing edge seen by
order, verifiability and the referee). Before ruling, group the findings
whose fix is the same edit and rule the group once: one ruling, one
owner, the ids of the merged findings listed in the reason. The user
answers one question per decision, never one per lens.

## The ruler

The plan razor: **a finding is sustained when a builder reading only
its brief, the design and the codebase could not build the entry one
way, could not prove it with the commands written, or would run into
something missing: a behavior it needs from another entry with no
edge, an AC with no entry, a case with no owner, a shared file it
would have to edit.** The plan is not a build contract; the builder
explores the code and decides the execution. What the builder can
decide without changing what the entry delivers is latitude, not a
gap.

Some defects always proceed: a story AC or an acceptance case no
entry carries · a `run` that is not a target or spec in the codebase,
or an `expect` it cannot print · a proof that needs a deployed environment or a
person · a proof that needs another entry's behavior with no edge · a
cycle · an entry that edits a migration, the contract, the generated
code or the module registry · two entries that run at once and touch
the same file · two blind readers who built or proved different
products from one brief · an entry that re-decides the design or
builds a mechanism the design did not.

## The three rulings

- **sustained** — a real hole under the razor. It becomes a brief
  fix, a question to the user, or a line in the builder's section, by
  owner.
- **deferred** — a right observation below the razor: a tighter
  pointer, a count worth checking, a proof worth adding once. Applied
  with the sustained ones, at its simplest form; the label records
  that it did not bite.
- **dismissed** — preference wearing severity (an order the lens
  likes better with no behavior behind it), rigor the demand has not
  asked for, an entry contested without a defect, an item the
  builder's section already grants, a detail the builder finds by
  exploring the code, an edge proposed where a factory seeds the data,
  or plain wrong. It dies **with the sentence that
  forecloses it quoted** in the reason; "already clear" without the
  quote is not a dismissal.

## Never dismissed

These classes proceed whether or not the build changes. Rule
`sustained` or at most `deferred`, never `dismissed`:

- a story AC or an acceptance case with no entry;
- a proof that is not a command, or needs a deployed environment or a person;
- a pre-flight item (a credential, a text, an account) an entry needs
  and the list does not carry: the user leaves nothing behind;
- an entry touching a shared file, or two parallel entries touching
  the same file;
- a contradiction between a brief and `plan.md`, or between two
  briefs over one contract (it may be the writer's to fix, but it is
  never dismissed);
- a change to the graph or the foundation, contested with a defect
  shown.

> Earlier plans ran lanes per repo with waves walked in alpha: the
> lanes waited on each other, the walks froze deploys, and edges were
> added where a frozen shape could have been seeded. An edge exists
> only when a proof needs a behavior, shared files belong to the
> foundation, and the recon is read first: those are on the lists
> above for that reason.

## Three tests, in order

1. **Is it true?** The quoted brief says that, and the gap follows. A
   lens that claims a codebase fact is checked against `recon/` and, in
   doubt, the code.
2. **Does it bite?** Name what gets built wrong, proved wrong, or
   left unbuilt if this stands. No named consequence, no sustain;
   unless the class is in the list above.
3. **Is it already decided?** A cut the user approved is contested
   only by defect, never by taste. A line in a brief's "The builder
   decides" is not a gap unless it belongs to a hard class.

## The owner of a sustained finding

- **`writer`** — the fix changes how something is written and decides
  nothing: a pointer, a case name the design fixes, a `run` made exact
  with the recon, an `expect` with its cases, a factory named, a term
  that differs between two briefs. The writer of that brief applies
  it; the user is not asked. When the fix touches two briefs, both
  writers get it.
- **`builder`** — a real observation whose answer the plan does not
  owe: the order of two writes inside the entry, a helper's home
  inside its module, a fixture's values inside the factory's shape.
  One line in that brief's "The builder decides", with its bound.
  Never a hard class.
- **`user`** — the fix changes an entry of `plan.md` (add, split,
  group, cut), adds or removes an edge, changes the foundation,
  contests the cut, or the text admits two readings that are two
  products. When the graph and the foundation stay as they are (a
  missing edge the proof plainly implies, a factory added to the
  foundation's list), you rule it yourself against the cut he approved
  (`ruled: conductor`, listed at the close for veto); when the graph
  or the foundation would change shape, it is his, one question per
  decision.

In doubt between `writer` and `user`, `user`. A fix that is
mechanical given a cut he already approved is not a doubt: it is the
writer's, or yours.

## Calibrations

- **A referee's `different-product` is evidence, not a verdict.**
  Read the brief. If it admits both builds, sustain, owner `user` when
  the two are different products and `writer` when one is plainly
  what the cut meant. If one reader misread a plain sentence, dismiss
  with the sentence quoted.
- **An edge is a cost.** A lens that adds an edge must show the
  behavior the proof needs. Data is not a behavior: a factory seeds it.
- **A case name is checked, not believed.** `acceptance.md` names the
  cases; the recon shows what exists; the brief names what it proves.
  Two of the three disagreeing is a `writer` fix, never a question.
- **In a delta round, a finding on text no fix touched gets the
  razor at full strength.** Round 1 read that text and passed it.
- **Name a recurrence.** When `reviews.md` shows the same class
  sustained before and the fix did not move the brief, say so, and
  take it to the user instead of the writer.

## What you write

In `reviews.md`, before any fix is sent: per finding (or merged
group), the id, lens, severity, title, ruling, owner, reason with the
quote. Then the lists the round produced: to the writers (by brief),
to the user (by decision), ruled by you in his place (by decision),
to the builder (by brief), dismissed. `plan-review.json` is filled from
this file at the close, so the user reads every dismissal and every
ruling you took in the blueprint and reopens any at the approval.
