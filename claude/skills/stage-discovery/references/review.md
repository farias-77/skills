# The review

Stop 6. One adversarial round on the stories, before he approves,
never after. He does nothing here unless a finding is his.

The round exists to find what the interview missed while it is still
cheap: a path nobody decided, a criterion a stranger reads another
way, a story that contradicts the code. It is built so it cannot turn
into a loop: every finding is verified before you see it, and the
second pass reads only what changed.

## The panel

`<kit>/workflows/discovery-review-workflow.js`, sized by the demand.
None of these agents wrote the stories.

| Agent (model, effort) | Sees | Says |
|---|---|---|
| `discovery-story-reader` (Haiku 5.5, high), two per story: one as builder, one as tester | one story, the vocabulary and the rules it cites; nothing else, and not each other | per criterion: its own reading, one case it would accept, the nearest case it would refuse, and every place it had to guess |
| `discovery-hole-hunter` (Sonnet 5.5, medium), one per hunt | the stories, `not-building.md`, the notes, the recon and the code | what is missing or contradicted, each with the line it rests on |
| `discovery-finding-verifier` (Sonnet 5.5, medium), one per claim | one claim and the files. For a criterion: the two blind readings side by side, and the oracle | confirmed or refuted, with the quote that settles it |

| Hunt | Looks for |
|---|---|
| `errors` | a journey with a limit, a failure, or a repeat nobody decided; a handled path with no criterion |
| `access` | who can do and see what: a role the stories never name, personal data with no reader or no lifetime |
| `limits` | a number without its boundary or example, zero and many, time, and the predictable next request that is neither built nor in `not-building.md` |
| `code` | where the stories contradict what exists: a role, a field, a word or a screen the code already uses another way |

| Size | Panel |
|---|---|
| small (clear idea, no screen) | one `discovery-hole-hunter` on the hunt `whole` (the four hunts in one pass), then the verifier |
| feature | two `discovery-story-reader`s per story and the four hunters in parallel, then the verifier |

Two readers, because one reader mostly repeats the text. The signal is
the disagreement: a builder and a tester who each commit to a concrete
case, and then differ, show exactly where stage 4 would loop. The
verifier adds the third side: two readers who agree with each other
and not with what he decided.

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
and the 🟢 line. Save the result as `discovery/review/round-1.json`.

A result with `valid: false` is fixed at its cause (an agent that
returned nothing, an index that does not match) and run again before
anything is ruled.

## Ruling

The oracle is what he decided: the notes' `said` and `accepted`
lines, the Rules table, `not-building.md`, and the locked mock when
there is one. The shared scale (`blocks` · `note`) and the ruling
line are in `<kit>/references/judging.md`.

Merge first: one defect often arrives from two sources. Rule the
group once. Then, for each confirmed finding:

| The verifier says | You rule | It goes to |
|---|---|---|
| `writing`: the oracle settles it and the story says otherwise, omits it, or leaves two readings | fix | the `discovery-story-writer`, one batch, no question |
| `gap`, with a conservative answer: smaller scope, what the product already does, cheap to undo | you decide, in his place | a new assumption (`assumed`, its source "review"), a line in `rulings.md` with `ruled: conductor`, shown at the gate as "decided for you" |
| `gap` that changes something he said, is costly or impossible to undo, or touches personal data, money or a legal or stated constraint | his | one question, in the shape of [interview.md](interview.md), asked before the gate |
| `mechanism`: the answer is a lock, a retry, a status code, a storage shape | for the design | the stories' "For the design" list |
| `note` | nothing built changes | `discovery/review/reviews.md`, no work |

In doubt between yours and his: his. A wrong question costs him one
answer; a wrong default is a product decision nobody took.

Write every ruling in `discovery/review/reviews.md` (the finding id,
the ruling, the quote that supports it) before any fix moves, and one
line per ruling in `rulings.md`.

A refuted finding needs nothing from you: the verifier's quote closes
it. Read the refuted list once for anything about personal data,
money or a constraint he stated; those you check yourself.

## Fixes, and the second pass

1. Stage the files (`git add`), then send the writer its batch by
   `SendMessage`: per fix, the finding id, the quote, the oracle line.
2. `node <discovery.mjs> check <workstream>` passes.
3. Run the workflow again with `mode: "delta"` and `fixes`: per fix,
   the finding and the `git diff` of the lines it changed. Each
   verifier reads only that diff: did the fix land, and did the new
   text open a hole?
4. A fix that did not land goes back to the writer once. What is
   still wrong after that is his, at the gate.

Nothing opens a second round. New findings on text that did not
change are not looked for.

## What he hears

When the round and the fixes are done, the "back" template with the
counts as a funnel (found · confirmed · ruled in your place · yours)
and the 🔴 line. Then his questions, one at a time, and the gate.
