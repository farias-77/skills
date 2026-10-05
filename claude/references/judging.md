# Judging findings

One file for every stage that reviews. The conductor reads its stage's
section before it rules; the reviewing agents report in the shape
below. There is no judge agent: the conductor rules discovery, design
and plan, and at execute one rule in code triages.

## The scale, everywhere

| Severity | When |
|---|---|
| **blocks** | as written, someone would build or judge the wrong thing, or the thing does not work; it names its basis and carries its proof |
| **note** | right, and changes nothing that gets built. At most **5 notes per lens** (or per seat at execute); the rest are dropped with a log line, never silently |

Every finding carries: the **quote** (the literal text judged, or the
word "nothing"), the **gap** (what is wrong or missing, through that
lens), and the **fix** (the concrete change, or the closed question).
A clean pass is valid only with its "Verified" list: what was checked,
where it looked. A lens that returns nothing and verified nothing is
sent again once; twice, the round is invalid.

**Overengineering.** A cut or a "speculative code" finding blocks only
with a concrete quote of what serves no AC and no real risk. "Could be
simpler" is a note: it never blocks, never starts a round, never loops.
The design that works stands.

**One round.** Every stage reviews once. The fixes are verified by
reading the changed lines (and at execute by the delta); a fix that did
not land goes back once. Nothing opens a second round.

## Ruling, everywhere

1. **Merge first.** One defect reported by several sources (a lens and
   a blind judge on one AC) is one finding; the findings one edit fixes
   are ruled together.
2. **Write the ruling before any fix moves**, in the stage's
   `reviews.md`.
3. **Pick the owner** by the stage's table below.
4. **His class with a conservative option is yours:** product,
   scope, data format, contract shape, security posture. Keep the
   lock, stay reversible, add no cost; record it `ruled: conductor` in
   `rulings.md` and list it for his veto in the close message. Only a
   **locked AC changed, a new recurring cost, or something
   irreversible** becomes a question to him, one per decision, through
   the question tool.
5. **Dismissed** findings die with the quote, frame or line that closes
   them.

Every ruling is one line of the workstream's `rulings.md`:

```
2026-10-05 · design D6 · design-security#S-2 · conductor: conservative (scope from the actor) · ruled: conductor · "keeps the lock, reversible"
```

## Discovery (D5, after the lock)

The oracle is the **locked mock**: what does it do? (`proto.mjs look`
on the locked version, never memory.) Detail and calibrations:
`stage-discovery/references/playback.md`.

| Ruling | When | Goes to |
|---|---|---|
| fix, owner `story-writer (Sonnet 5.5, high)` | the fix changes how something is written and decides nothing: an AC rewritten to what the mock does, a THEN given its place, two ACs on one rule merged | the writer, one batch, no question |
| his, at the playback | the fix changes what the mock does (an amendment), scope, personal data, money, a stated constraint, or contests what he confirmed | one question per decision, inside the story's playback call |
| for the design | the answer is a mechanism: a lock, a retry, a status code, a storage shape, a threshold | `reviews.md` "For the design"; never asked |
| dismissed | taste, wording, a divergence that builds the same thing, a misread | with its quote |

**Never dismissed:** personal data, money, legal and stated
constraints, a confirmed fact contested with a quote, a story that
contradicts the mock. In doubt between the writer and him: him.

The lenses are `disc-lens (Sonnet 5.5, medium)` × 3 (**in-out**,
**coverage**, **acceptance**); the double-blind is two
`blind-reader (Sonnet 5.5, low)` and a `blind-judge (Sonnet 5.5,
medium)` per story, whose kinds are **diverge**, **contradicts** and
**undecidable**. A `contradicts` is evidence, not a verdict: run the
reader's steps yourself.

## Design (D2 and D6, after his "closed")

| Ruling | When | Goes to |
|---|---|---|
| fix, owner the writer | a document's text: a value, a name, a field, a missing state the proposal already fixes | its `design-writer (Sonnet 5.5, high)`, or the `architect (Opus 5.5, high)` for `solution.md` and the proposal, by `SendMessage`, no question |
| conductor, conservative | his class with an option that keeps the lock, is reversible and costs nothing new | you; `ruled: conductor`; the notes' Veto list |
| his question | a locked AC changes, a recurring cost appears, or it cannot be undone | one question per decision, one batch |
| latitude | a real choice the design may leave open | one line in the document's "The implementer decides" (never a hard class: where it runs and what happens when the other side fails, a stored entity's key, format and retention, a contract's shape, who can do what, which alarms wake whom) |
| dismissed | with its quote | — |

The guard's rebuttals at D2: the architect keeps a mechanism only by
naming the AC or the real risk it serves; a rebuttal without one goes
back once (`stage-design/references/right-sizing.md` §3).

## Plan (P3)

The conductor rules every finding; nothing reaches him as a question.

| Finding about | Owner |
|---|---|
| the cut: a false edge, a fat C, a layer posing as an entry, the 12-AC cap | `planner (Opus 5.5, high)`, apply mode, the checker green |
| a brief's text: a divergence, a missing value the design fixes | that brief's `plan-writer (Sonnet 5.5, high)` |
| a detail the design left open that changes nothing built | the builder: one line in the brief's "The builder decides" |
| a gap the design should have decided | you: the conservative option, `ruled: conductor`, listed for veto |

One round: `plan-reviewer (Opus 5.5, medium)` ∥ the double-blind per
brief, read by the same kinds as discovery.

## Execute (in code, per entry)

`exec-entry-workflow.js` triages; nobody rules by hand.

- A finding of `reviewer (Opus 5.5, high)`, `qa-frontend (Opus 5.5,
  medium)` or `qa-backend (Opus 5.5, medium)` **blocks** only with a
  basis of `ac` (not met or not proved), `bug` (reproduced), `security`
  or `rule` (a written standard broken), **and** its proof at the level
  the basis needs. Everything else is a note: at most 5 per seat,
  carried to the PR, never opening work.
- **The proof ladder:** 1 said it · 2 pointed at the line · 3 showed
  the case can happen · 4 ran it (a command, a test, a request) and
  quoted what came back · 5 reproduced it in the running app as its
  actor. `ac` and `bug` block from 4, `security` from 3, `rule` from 2.
  A missing or hollow proof reaches 4 by breaking the behaviour and
  running the test: still green.
- **`inconclusive` is not green.** A seat that could not run what its
  check needed says what and why; the entry parks `inconclusive`.
- **C, the contract commit:** only `security` blocks.
- **Speculative code** blocks only with the quote of what serves no AC
  and no real risk.
- **Budgets:** 2 gate fix passes, 1 review fix pass. The delta goes to
  each seat that blocked, plus the reviewer whenever the fix touched a
  test or a gate path (the code-owner paths, `gatePaths`). Still
  blocking after the delta: the entry parks (`round-cap`) and the tech
  lead resolves it by `stage-execute/references/tech-lead.md`; only
  what is his waits for him.
