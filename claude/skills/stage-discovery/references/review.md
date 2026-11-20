# The review

Stop 6. One adversarial round on the stories, before he approves,
never after. He does nothing here unless a finding is his.

The round exists to find what the interview missed while it is still
cheap: a path nobody decided, a criterion a stranger reads another
way, a story that contradicts the code. It is built so it cannot turn
into a loop: every finding is checked against what he decided before
you see it, the same hole found twice arrives as one place, and the
second pass reads only what changed.

## The panel

`<kit>/workflows/discovery-review-workflow.js`, sized by the demand.
None of these agents wrote the stories.

| Agent (model, effort) | Sees | Says |
|---|---|---|
| `discovery-story-reader` (Haiku 5.5, high), two per story: one as builder, one as tester | one story, the vocabulary and the rules it cites; nothing else, and not each other | per criterion: its own reading, one case it would accept, the nearest case it would refuse, and every place it had to guess |
| `discovery-hole-hunter` (Sonnet 5.5, medium), one per hunt | the stories, `not-building.md`, the notes, the recon and the code | what is missing or contradicted, each with the line it rests on |
| `discovery-reading-comparer` (Sonnet 5.5, medium), one per story | the two blind reports of that story side by side, and the oracle | only the criteria where the story leaves two readings or a guess, each with the quote that settles it; the rest as agreed |
| `discovery-finding-verifier` (Sonnet 5.5, medium), one per hunter claim | one claim and the files | confirmed or refuted, with the quote that settles it |

| Hunt | Looks for |
|---|---|
| `errors` | a journey with a limit, a failure, or a repeat nobody decided; a handled path with no criterion |
| `access` | who can do and see what: a role the stories never name, personal data with no reader or no lifetime |
| `limits` | a number without its boundary or example, zero and many, time, and the predictable next request that is neither built nor in `not-building.md` |
| `code` | where the stories contradict what exists: a role, a field, a word or a screen the code already uses another way |

| Size | Panel |
|---|---|
| small (clear idea, no screen) | one `discovery-hole-hunter` on the hunt `whole` (the four hunts in one pass), then the verifier |
| feature | two `discovery-story-reader`s per story and the four hunters in parallel; then one comparer per story and one verifier per hunter claim |

Two readers, because one reader mostly repeats the text. The signal is
the disagreement: a builder and a tester who each commit to a concrete
case, and then differ, show exactly where stage 4 would loop. The
comparer adds the third side: two readers who agree with each other
and not with what he decided. It is one agent per story, not one per
criterion: a verifier per criterion cost forty agents a round and
confirmed the same gap several times.

## Running it

```
node <discovery.mjs> check <workstream>      must pass first
node <discovery.mjs> split <workstream>      prints the index
```

Run the workflow by `scriptPath` with `args`: `workstream` (absolute),
`size`, `index` (the JSON `split` printed, as a value), `code` (the
repo paths the recon named), `rules` (the absolute path of
[stories.md](stories.md)), and `inlineAgents: true` with `agentsDir:
<kit>/agents`. Start the wait with the "running without you" template
and the 🟢 line. The Workflow tool writes the whole result to a file
and shows a shortened copy; save the whole one with
`node <discovery.mjs> round <workstream> <that file>`. It writes
`discovery/review/round-1.json` (the detail) and
`discovery/review/round-1.md` (what you rule from: the confirmed
findings by place, one line each, then the mechanisms, then the
refuted), and prints the counts.

A result with `valid: false` is fixed at its cause (an agent that
returned nothing, an index that does not match) and run again before
anything is ruled.

## Ruling

The oracle is what he decided: the notes' `said` and `accepted`
lines, the Rules table, `not-building.md`, and the locked mock when
there is one. The shared scale (`blocks` · `note`) and the ruling
line are in `<kit>/references/judging.md`.

Rule from `round-1.md`, one place at a time: the hunts and the
readers do not see each other, so one hole often arrives several
times under the same criterion or rule. Rule the place once, and open
the JSON only for a finding whose line is not enough. For each place:

| The class | You rule | It goes to |
|---|---|---|
| `writing`: the oracle settles it and the story says otherwise, omits it, or leaves two readings | fix | the `discovery-story-writer`, one batch, no question |
| `gap`, with a conservative answer: smaller scope, what the product already does, cheap to undo | you decide, in his place | a new assumption (`assumed`, its source "review"), a line in `rulings.md` with `ruled: conductor`, shown at the gate as "decided for you" |
| `gap` that changes something he said or an assumption he was shown at the readback, is costly or impossible to undo, or touches personal data, money or a legal or stated constraint | his | one question, in the shape of [interview.md](interview.md), asked as soon as the rulings are written |
| `gap` whose conservative answer would be a visible defect, or with two conservative answers that disagree | yours when the notes or the product point to one answer (say which line); otherwise his | as the two rows above |
| `mechanism`: the answer is a lock, a retry, a status code, a storage shape. The workflow lists these apart, under "For the design" | for the design | the stories' "For the design" list, the similar ones as one line |
| `note` | nothing built changes | `discovery/review/reviews.md`, no work |

In doubt between yours and his: his. A wrong question costs him one
answer; a wrong default is a product decision nobody took.

Write every ruling in `discovery/review/reviews.md` (the finding id,
the ruling, the quote that supports it) before any fix moves, and one
line per ruling in `rulings.md`.

A refuted finding needs nothing from you: the verifier's quote closes
it. Read the refuted list once for anything about personal data,
money or a constraint he stated; those you check yourself.

**His questions go out now**, one at a time, before he is shown the
screen: an answer that arrives after the lock costs a second lock.
The fixes below run while he answers.

## Fixes, and the second pass

1. `node <discovery.mjs> mark <workstream>` records the text as it
   is. Then send the writer its batch by `SendMessage`: per fix, the
   finding id, the quote, the oracle line.
2. `node <discovery.mjs> check <workstream>` passes.
3. `node <discovery.mjs> diff <workstream>` prints each item that
   changed, before and after. Run the workflow again with `mode:
   "delta"` and `fixes`: per fix, the finding and the changed items
   that answer it, as its `diff`. Each verifier reads only that diff:
   did the fix land, and did the new text open a hole? Save the result
   with `round <workstream> <file> --name delta-1`.
4. A fix that did not land goes back to the writer once. What is
   still wrong after that is his, at the gate.
5. With a screen: send the `discovery-mock-designer` one round with
   the `diff` output, the rulings that touch the screen and his
   answers. The mock was drawn from the stories as they were before
   the review; he is shown it after this round
   ([mock.md](mock.md)).

Nothing opens a second round. New findings on text that did not
change are not looked for.

## What he hears

The funnel (found · confirmed · ruled in your place · yours) goes in
the next message he gets anyway: the one that carries his first
review question, the mock's link, or the gate. It is never a message
of its own.
