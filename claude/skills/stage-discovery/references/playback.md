# Ruling the review, then the playback

The shared scale and owners are in `claude/references/judging.md`;
this file is what is particular to discovery.

## The oracle is the locked mock

For any finding about behavior, the first question is **what does the
locked mock do?** Answer it with `proto.mjs look` on the locked
version, never from memory.

| The story… | Then |
|---|---|
| says what the mock does | the story is right; a finding that wants other behavior is asking for an amendment (his) or is wrong |
| says something the mock does not do | the writing is wrong: owner `story-writer`, fixed to what the mock does |
| meets a case the mock is silent on | a gap in what he locked: his, at the playback (a new state in the mock, or an Out line) |

## Ruling each finding

Merge first: one defect arrives from several sources (a lens and a
blind judge on the same AC). Group the findings one edit fixes and rule
the group once.

| Ruling | When | Goes to |
|---|---|---|
| **fix, owner `story-writer`** | the fix changes how something is written and decides nothing: an AC rewritten to what the mock does, a THEN given its observed place, a value the mock shows, two ACs on one rule merged | the writer, in one batch, without asking him |
| **his, at the playback** | the fix changes what the mock does (an amendment), adds or removes scope, touches personal data, money or a stated constraint, or contests something he confirmed | one question per decision, inside the story's playback call |
| **for the design** | the answer is a mechanism: a lock, a retry policy, a status code, a storage shape, a threshold, where a job runs | `reviews.md` "For the design"; never asked here |
| **dismissed** | taste, wording, a divergence that builds the same thing, a misread | dies with the sentence or frame token that forecloses it, quoted |

In doubt between the writer and him: him. A wrong question costs one
answer; a wrong fix is a product decision nobody took.

**Never dismissed:** personal data (retention, who sees it), money,
legal and stated constraints, a confirmed fact contested with a quote,
a story that contradicts the mock.

Calibrations:

- A blind `contradicts` is evidence, not a verdict: run the reader's
  `how` yourself. The mock does what the AC says and the reader drove
  it wrong → dismissed, the frame quoted. The mock does otherwise →
  the AC is wrong, owner `story-writer`.
- A blind `diverge` (two readers, two readings) is almost always the
  writer's: the AC lacks its observed place, a value, or its GIVEN. It
  is his only when both readings are things the mock shows and he never
  chose between them.
- A finding that asks for a new AC for a state, a label or a copy
  string is dismissed: the frames cover it. Two ACs on one rule:
  sustained, merged.
- A finding that names a lock, a retry count or a status code found
  nothing for discovery: for the design.

A fix that did not land goes back once; what is still wrong after that
goes to the playback as his.

## The playback

Story by story, through the question tool, four stories per call. Each
question is one story:

- **The question text:** the story's title and job in one line; its ACs
  one line each (the id and the behavior in plain words, never the
  GIVEN/WHEN/THEN); the review's decisions on that story that are his,
  each with the conductor's pick and why; the writer's Inferred entries
  on that story.
- **The options:**
  1. **Confirm** (recommended, when nothing of his is open) — the story
     and the picks stand.
  2. **Adjust** — he writes in "Other" what changes.
  3. **Cut** — the story leaves the scope; an Out line takes its place.

  When a decision of his on that story has a real alternative, the
  options are the decision's answers instead, the pick first ("Confirm,
  one read per manager (recommended)" · "Confirm, one read per tab").

**An adjust that changes behavior is an amendment.** In order: an edit
order to the `prototype-builder` (the mock changes and is republished),
`proto.mjs lock` again with his answer as the lock words, the
`story-writer` re-derives only that story, `trace` green. His answer is
the lock; nothing waits for another "ok".

**The last call carries the design question**, one question beside
the stories:

| Option | Means for stage 2 |
|---|---|
| **Nothing in mind, propose** (recommended) | the architect proposes freely |
| **I have an idea** (Other) | his words go to the architect as his idea |
| **I have a constraint** (Other) | his words go to the architect as a constraint |

Write the answer, verbatim, to the notes' "For the design" block.
