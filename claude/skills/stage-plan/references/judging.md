# Ruling the plan review

At plan the conductor rules **everything**: the stage runs with nobody
to ask. One round, no delta. You have what the reviewers do not: the
cut and why, the recon, the checker's output. Never rule on a finding's
text alone: open the brief it quotes, and the design section or recon
answer it contradicts.

## What the checker settles

`plan-graph.mjs` ran green before the round. A finding that restates
one of its checks (an AC owned twice, two owners of a file, a cycle, a
missing Contract on a two-sided node, a brief that differs from the
graph) is checked against its output: if the checker is right, dismiss
with its line quoted; if the finding is right, the graph is wrong and
the planner fixes it.

## Merge first

One defect can arrive from the reviewer and a blind reader. Group the
findings whose fix is the same edit and rule the group once.

## The razor

**Sustained when a builder with only its brief, the design and the
codebase would have to ask something, would build two different things,
or would run into something missing** (a name nothing provides, a file
it must write and does not own, a behaviour with no edge and no fake);
**or when the graph is narrower than the needs force** (an edge a fake
or a factory could replace, an item in F that one entry alone uses).
Otherwise **dismissed**, with the sentence that forecloses it quoted.

Never dismissed: a `contradicts` from a blind reader that holds when you
read both texts; an AC no brief can prove; a Contract that differs from
`data-and-contracts.md`; a name used and not provided; a real need with
no edge; a shared file a running front changes left outside F.

## The owner

- **`writer`** — the fix changes a brief and decides nothing: a value
  copied from the design, a test path, a Contract field, a term made
  the same as the graph's. The brief's writer applies it.
- **`planner`** — the fix changes the cut: an edge, a node, an item in
  or out of F, an owner, a name, a front's merge point. The planner
  changes `plan.graph.json` and `plan.md` and runs the checker green;
  then the writers of the briefs it touches apply what moved.

A finding that shows the **design** is wrong is not fixed in a brief:
a dated amendment request in `01-design/notes.md`, a line in
`dreaming-notes.md`, and the node marked blocked in `plan.md` if it
cannot be built as designed. A product question the design did not
settle: the reading the locked mock shows, else the more conservative
one, under "Decided in his place".

## What you write

`reviews.md`, before any fix leaves: per finding (or merged group) the
id, the brief, the ruling, the owner and why. Every ruling goes to
`rulings.md` as one line (`ruled: conductor`). After the fixes: what
changed and where you read it, line by line, and the checker's line.
