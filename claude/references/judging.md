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

**One round.** Every stage reviews once. A fix is verified by its
diff against the finding (at execute, by the delta), never by
re-reading the file; a fix that did not land goes back once. Nothing opens a second round;
the one exception is at execute: an entry parked on `round-cap` with a
clear fix inside the design gets one resume with a fresh budget
(`stage-execute/references/tech-lead.md`).

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
6. **A fact you could observe by running something** (a timing, a
   library's behaviour, a layout) is neither his question nor a finding
   to rule: a spike settles it, and the result is the ruling.

Every ruling is one line of the workstream's `rulings.md`:

```
2026-10-05 · design D6 · design-security#S-2 · conductor: conservative (scope from the actor) · ruled: conductor · "keeps the lock, reversible"
```

## Discovery (stop 6, the review)

The oracle is what he decided: the notes' lines marked `said` and
`accepted`, the Rules table, `not-building.md`, and the locked mock
when a screen changes. A line marked `assumed` is the conductor's
guess, not his decision. Every finding reaches the conductor already
checked, with its class: a hunter's claim by a
`discovery-finding-verifier`, a story's two blind readings by a
`discovery-reading-comparer`. Detail:
`stage-discovery/references/review.md`.

| The class | Ruling | Goes to |
|---|---|---|
| `writing`: the oracle settles it and the story says otherwise, omits it, or leaves two readings | fix | `discovery-story-writer (Sonnet 5.5, high)`, one batch, no question |
| `gap` with a conservative answer (smaller scope, what the product already does, cheap to undo) | the conductor decides in his place | a new assumption, `ruled: conductor`, shown at the gate as "decided for you" |
| `gap` that changes something he said or an assumption he was shown, is costly or impossible to undo, or touches personal data, money, or a legal or stated constraint | his | one question, as soon as the rulings are written |
| `mechanism`: a lock, a retry, a status code, a storage shape | for the design | the stories' "For the design"; never asked |
| `note` | nothing built changes | `discovery/review/reviews.md` |

**Never ruled in his place:** personal data, money, legal and stated
constraints, something he said contested with a quote. In doubt
between the conductor and him: him.

The panel is `discovery-hole-hunter (Sonnet 5.5, medium)` × 4
(**errors**, **access**, **limits**, **code**) and, per story, two
`discovery-story-reader (Haiku 5.5, high)` in different seats
(builder, tester) that do not see each other. One round; the second
pass reads only the diff of each fix.

## Design (D2 and D6, after his "closed")

| Ruling | When | Goes to |
|---|---|---|
| fix, owner the writer | a document's text: a value, a name, a field, a missing state the solution already fixes | its `design-writer (Sonnet 5.5, high)`, or the `architect (Opus 5.5, high)` for `solution.md`, by `SendMessage`, no question |
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
- **Budgets:** 2 gate fix passes, 1 review fix pass. The delta goes to
  each seat that blocked, plus the reviewer whenever the fix touched a
  test or a gate path (the code-owner paths, `gatePaths`). Still
  blocking after the delta: the entry parks (`round-cap`) and the tech
  lead resolves it by `stage-execute/references/tech-lead.md`; only
  what is his waits for him.
