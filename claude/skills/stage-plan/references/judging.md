# Judging the plan review round

The conductor judges. The lenses report at the maximum bar: told to
find problems, they always find problems. That is by design, and it is
why the round does not close on their word. It closes on yours. You
have what a judge agent never had: the cut as the user approved it,
his words, the recon. Use it, and never rule on a finding's text
alone: open the row it quotes, the recon it contradicts, the repo it
names when it names one.

## Merge first

Three lenses and a referee per goal read the same goals, so one defect
arrives as several findings (the same missing edge seen by order,
verifiability and the referee). Before ruling, group the findings
whose fix is the same edit and rule the group once: one ruling, one
owner, the ids of the merged findings listed in the reason. The user
answers one question per decision, never one per lens.

## The ruler

The plan razor: **a finding is sustained when a worker reading only
its goal, the design and the repo could not build a row one way,
could not prove it with the command written, or would run into
something missing: a consume with no producer and no frozen shape to
seed, an AC with no row, a case with no owner, a walk step the master
cannot run.** The plan is not a build contract; the worker explores
the code and decides the execution. What the worker can decide
without changing what exists in alpha at the wave is latitude, not a
gap.

Some defects always proceed: a story AC or an acceptance case no row
delivers · a `run` that is not a command in that repo, or an `expect`
it cannot print · a proof that needs a human eye before the close of
stage 4, or prod · a row proved on seeded data whose real producer is
in no wave's walk · a consume whose producer runs in a later wave
and whose shape is not frozen in the design · two blind readers who
built or proved different products from one row · a row that
re-decides the design or builds a mechanism the design did not · two
`∥` rows or two lanes that collide on one stack, one schema or one
screen without the collision listed · a wave whose walk does not
cross lanes.

## The three rulings

- **sustained** — a real hole under the razor. It becomes a goal fix,
  a question to the user, or a line in the worker's section, by
  owner.
- **deferred** — a right observation below the razor: a tighter
  pointer, a count worth checking, a proof worth adding once. Applied
  with the sustained ones, at its simplest form; the label records
  that it did not bite.
- **dismissed** — preference wearing severity (an order the lens
  likes better with no consume behind it), rigor the demand has not
  asked for, a row contested without a defect, an item the worker's
  section already grants, a detail the worker finds by exploring the
  code, an edge proposed where the shape is frozen and the proof
  seeds it, or plain wrong. It dies **with the sentence that
  forecloses it quoted** in the reason; "already clear" without the
  quote is not a dismissal.

## Never dismissed

These classes proceed whether or not the build changes. Rule
`sustained` or at most `deferred`, never `dismissed`:

- a story AC or an acceptance case with no row;
- a proof that is not a command, or needs prod, or needs a person
  before the close of stage 4;
- a pre-flight item (a credential, a text, an account) a row needs
  and the list does not carry: the user leaves nothing behind;
- a collision between lanes on a shared alpha stack that the wave
  does not schedule;
- a contradiction between a goal and `waves.md`, or between two
  goals over one contract (it may be the writer's to fix, but it is
  never dismissed);
- a change to what a wave accepts, contested with a defect shown.

> In the first end-to-end run the whole suite was written as the
> proof of every row and did not fit the clock (233 cases, about an
> hour), the two waves ran in series when nothing structural forced
> it, and the plan-author's questions were six repo facts nobody had
> looked up. The row's proof is its folder, the suite is the wave's,
> an edge exists only when a proof needs it, and the recon is read
> first: those are on the lists above for that reason.

## Three tests, in order

1. **Is it true?** The quoted row says that, and the gap follows. A
   lens that claims a repo fact is checked against `recon/` and, in
   doubt, the repo.
2. **Does it bite?** Name what gets built wrong, proved wrong, or
   left unbuilt if this stands. No named consequence, no sustain;
   unless the class is in the list above.
3. **Is it already decided?** A wave the user approved is contested
   only by defect, never by taste. A line in a goal's "The worker
   decides" is not a gap unless it belongs to a hard class.

## The owner of a sustained finding

- **`writer`** — the fix changes how something is written and decides
  nothing: a pointer, a count the recon fixes, a `run` made exact,
  an `expect` with its number, an edge the proof plainly implies, a
  term that differs between two goals, propagation to the goal that
  consumes it. The writer of that goal applies it; the user is not
  asked. When the fix touches two goals, both writers get it.
- **`worker`** — a real observation whose answer the plan does not
  owe: the order of two writes inside a row, a helper's home, a
  fixture's shape inside the frozen contract. One line in that
  goal's "The worker decides", with its bound. Never a hard class.
- **`user`** — the fix changes a row of `waves.md` (add, split,
  merge, move, re-pair), adds or removes an edge, changes a wave's
  walk or its required rows, contests the cut, or the text admits
  two readings that are two products. When the wave's walk and
  required rows stay as they are, you rule it yourself against the
  cut he approved (`ruled: conductor`, listed at the close for veto);
  when what a wave accepts would change, it is his, one question per
  decision.

In doubt between `writer` and `user`, `user`. A fix that is
mechanical given a wave he already approved is not a doubt: it is
the writer's, or yours.

## Calibrations

- **A referee's `different-product` is evidence, not a verdict.**
  Read the row. If it admits both builds, sustain, owner `user` when
  the two are different products and `writer` when one is plainly
  what the cut meant. If one reader misread a plain sentence, dismiss
  with the sentence quoted.
- **An edge is a cost.** A lens that adds an edge must show the proof
  that needs it. "Consumes" alone is not an edge when the shape is
  frozen; the walk proves the junction.
- **A folder count is checked, not believed.** `acceptance.md`
  assigns the cases; the recon counts what exists; the goal names
  the number. Two of the three disagreeing is a `writer` fix with
  the right number, never a question.
- **In a delta round, a finding on text no fix touched gets the
  razor at full strength.** Round 1 read that text and passed it.
- **Name a recurrence.** When `reviews.md` shows the same class
  sustained before and the fix did not move the goal, say so, and
  take it to the user instead of the writer.

## What you write

In `reviews.md`, before any fix is sent: per finding (or merged
group), the id, lens, severity, title, ruling, owner, reason with the
quote. Then the lists the round produced: to the writers (by goal),
to the user (by decision), ruled by you in his place (by decision),
to the worker (by goal), dismissed. `plan-review.json` is filled from
this file at the close, so the user reads every dismissal and every
ruling you took in the blueprint and reopens any at the approval.
