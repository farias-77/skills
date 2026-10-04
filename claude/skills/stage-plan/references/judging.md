# Judging the plan review round

The conductor judges, and at plan the conductor rules **everything**:
the stage runs with nobody to ask. The lenses report at the maximum
bar; told to find problems, they always find problems. That is by
design, and it is why the round closes on your word, not theirs. You
have what a judge agent never had: the graph you cut and why, the
recon, the checker's output. Use it, and never rule on a finding's
text alone: open the brief it quotes, the recon it contradicts, the
code it names when it names a file.

## What the checker already settles

`scripts/plan-graph.mjs` ran green before the round (it gates P4). A
cycle, an orphan or doubled AC, a file with two owners, a shared file
outside the foundation, a used name with no producer, an edge whose
class is not `ui` or `side-effect`, a depth over target, a size over
the cap, a brief whose Owns, Extends, Uses, Provides or Acceptance
disagree with the graph, and a Uses row whose Producer is not the
graph's are all **its** findings, and it found none.
A lens finding that restates one of them is checked against the
checker's output: if the checker is right, dismiss with its line
quoted; if the lens is right, the graph JSON is wrong (a path missing
from `owns`, a name missing from `uses`), and that is a sustained
finding against the graph, fixed by you, with the checker run again.

What the checker cannot settle is what the lenses are for: whether an
edge's class is **true** (does a fake really not stand in?), whether F
is **thin** (does every item in it serve two nodes?), whether a
slice's ownership matches what its acceptance makes it write, whether
an acceptance line is checkable, and whether two builders would build
the same thing.

## Merge first

Three lenses and a referee per brief read the same material, so one
defect arrives as several findings. Before ruling, group the findings
whose fix is the same edit and rule the group once, the merged ids
listed in the reason.

## The razor

**A finding is sustained when a builder reading only its brief, the
design and the codebase could not build the node one way, or
could not turn an acceptance line into one test; it would run
into something missing (a behaviour with no edge, a name nothing
provides, an AC no node carries, a file it must write that it does
not own, a frozen file); or the graph is narrower or deeper than the
needs force (an edge a fake or a factory could replace, a serial step
that is not shared work).** The plan is not a build contract; what
the builder can decide without changing what the node delivers is
latitude.

## The three rulings

- **sustained** — a real hole under the razor. It becomes a brief fix,
  a graph change, or a line in the builder's section, by owner.
- **deferred** — a right observation below the razor. Applied with the
  sustained ones, at its simplest form; the label records that it did
  not bite.
- **dismissed** — preference wearing severity, rigor the demand has not
  asked for, an edge proposed where a factory or a fake stands in, an
  item the builder's section already grants, a detail the builder finds
  by exploring the code, or plain wrong. It dies **with the sentence
  that forecloses it quoted**.

## Never dismissed

Rule `sustained` or at most `deferred`, never `dismissed`:

- an AC or an acceptance case with no node, or carried twice;
- an acceptance line a test cannot check, or one that needs a
  deployed environment or a person;
- a name a node uses that nothing provides before it;
- a pre-flight item a node needs and `preflight.md` does not carry, or
  an item with no `!` command and no console path;
- a file two nodes write outside a declared Extends; a shared file
  outside F;
- a foundation test that pins a stub;
- an edge whose need a fake or a factory covers (it costs width), and
  a real behaviour need with no edge (it breaks at stage 4);
- a contradiction between a brief and `plan.md`, between two briefs
  over one name, or between a brief and `plan.graph.json`.

## Three tests, in order

1. **Is it true?** The quoted brief says that, and the gap follows. A
   codebase claim is checked against `recon/` and, in doubt, the code.
2. **Does it bite?** Name what gets built wrong, proved wrong, left
   unbuilt, or waited for if this stands. No named consequence, no
   sustain, unless the class is in the list above.
3. **Is it already decided?** A choice under "Decided in his place" is
   contested only by a defect, never by taste.

## The owner of a sustained finding

- **`writer`** — the fix changes how something is written and decides
  nothing: a pointer, a case name, an acceptance line made checkable
  with what the design says, a golden path from the recon, a factory
  named, a term that differs between two briefs. The writer of each
  brief it touches applies it.
- **`conductor`** — the fix changes the cut: a node added, split,
  grouped or cut; an edge added, removed, re-classed or stacked; an
  item moved into or out of F; an ownership moved; a need re-resolved.
  You make it in `plan.graph.json` and `plan.md` in one pass, dated
  under "Amendments", run the checker until it is green, then send the
  writers what changed in their briefs. Recorded in `rulings.md` as
  `ruled: conductor` and listed at the close for his veto.
- **`builder`** — real, but execution: the order of two writes, a
  helper's home inside its module, a fixture's values inside the
  factory's shape. One line in that brief's "The builder decides",
  with its bound. Never a class from the list above.

Nothing is owned by the user at plan. When a finding is a product
question the design did not settle (two readings that are two
products), you pick the reading the locked mock and the journeys show;
when they do not show it, the more conservative one (less built, fewer
irreversible effects), and the pick goes under "Decided in his place".
A finding that shows the **design** is wrong is not fixed in a brief:
it is a dated amendment request in `notes.md` and a line in
`dreaming-notes.md`; the brief follows the design as it stands, or the
node is marked blocked in `plan.md` if it cannot.

## Calibrations

- **A referee's `different-product` is evidence, not a verdict.** Read
  the brief. If it admits both builds, sustain (`writer` when one build
  is plainly meant; `conductor` when you must pick). If one reader
  misread a plain sentence, dismiss with the sentence quoted.
- **An edge is a cost; a missing edge is a break.** A lens that adds an
  edge shows the behaviour the proof needs and why a fake cannot stand
  in. A lens that removes one shows the fake or the factory.
- **Width is the goal.** A finding that makes the graph narrower or
  deeper with no defect behind it is dismissed. A finding that makes it
  wider without breaking a proof is sustained.
- **A command is not the brief's.** The gate commands live once in
  `plan.md`; the brief copies them. A finding about their spelling in a
  brief is dismissed with `plan.md`'s line quoted, unless the copy
  differs from it (then it is the writer's).
- **In a delta round, a finding on text no fix touched gets the razor
  at full strength.** Round 1 read that text and passed it. A finding
  on a line a round-1 graph change made stale (an old owner, a moved
  case still pointed at) is residue, not taste: sustain it, and note
  in `dreaming-notes.md` why the propagation check did not catch it.
- **Name a recurrence.** When `reviews.md` shows the same class
  sustained before and the fix did not move the brief, note it in
  `taste-notes.md` and `dreaming-notes.md`; the residue carries it.

## What you write

In `reviews.md`, before any fix is sent: per finding (or merged
group), the id, lens, severity, title, ruling, owner, reason with the
quote. Then the lists the round produced: to the writers (by brief),
graph changes you made (each with the checker's line after it), to the
builder (by brief), dismissed. Every `conductor` ruling also goes to
`rulings.md` as one line. `plan-review.json` is filled from these at
the close, so he reads every ruling you took in his place.
