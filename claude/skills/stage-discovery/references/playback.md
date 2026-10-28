# Ruling the review, then the playback

The shared scale and owners are in `claude/references/judging.md`;
this file is what is particular to discovery.

## The oracle

For any finding about behavior, the first question is **what did he
decide?** With a locked mock, that is what the mock does: answer it
with `proto.mjs look` on the locked version, never from memory. With no
screen, it is the notes: the Confirmed lines, the Rules table and Out.

| The story… | Then |
|---|---|
| says what the oracle says | the story is right; a finding that wants other behavior is asking for an amendment (his) or is wrong |
| says something the oracle does not say | the writing is wrong: owner `story-writer`, fixed to the oracle |
| meets a case the oracle is silent on | a gap in what he decided: his, at the playback (a new state in the mock, a new Confirmed line, or an Out line) |

## Ruling each finding

Merge first: one defect arrives from several sources (a lens and a
blind judge on the same AC). Group the findings one edit fixes and rule
the group once.

| Ruling | When | Goes to |
|---|---|---|
| **fix, owner `story-writer`** | the fix changes how something is written and decides nothing: an AC rewritten to the oracle, a THEN given its observed place, a value the oracle holds, two ACs on one rule merged | the writer, in one batch, without asking him |
| **his, at the playback** | the fix changes the behavior he decided (an amendment), adds or removes scope, touches personal data, money or a stated constraint, or contests something he confirmed | one question per decision, in the playback's question call |
| **for the design** | the answer is a mechanism: a lock, a retry policy, a status code, a storage shape, a threshold, where a job runs | `reviews.md` "For the design"; never asked here |
| **dismissed** | taste, wording, a divergence that builds the same thing, a misread | dies with the sentence or frame token that forecloses it, quoted |

In doubt between the writer and him: him. A wrong question costs one
answer; a wrong fix is a product decision nobody took.

**Never dismissed:** personal data (retention, who sees it), money,
legal and stated constraints, a confirmed fact contested with a quote,
a story that contradicts the oracle.

Calibrations:

- A blind `contradicts` is evidence, not a verdict: run the reader's
  `how` yourself. The mock does what the AC says and the reader drove
  it wrong → dismissed, the frame quoted. The mock does otherwise →
  the AC is wrong, owner `story-writer`.
- A blind `diverge` (two readers, two readings) is almost always the
  writer's: the AC lacks its observed place, a value, or its GIVEN. It
  is his only when both readings are things the oracle allows and he
  never chose between them.
- A finding that asks for a new AC for a state, a label or a copy
  string is dismissed: the frames cover it. Two ACs on one rule:
  sustained, merged.
- A finding that names a lock, a retry count or a status code found
  nothing for discovery: for the design.

A fix that did not land goes back once; what is still wrong after that
goes to the playback as his.

## The playback

One message, then one question call. He does not read the stories: the
message is how he checks that what was understood is what he wants.

**1. The message: what was understood, in a plain text.** In his
language, plain words, no ids, no GIVEN/WHEN/THEN, no list of stories.
Everything he needs to know, nothing he does not: if a line would not
change his answer, it is not there. In this order:

- **What we will build**, two or three sentences: who uses it, what
  they can do that they cannot today, and why.
- **The flow**, drawn in a code block: the main path and where it
  branches when something fails.

```
manager invites ──► e-mail arrives ──► person accepts ──► joins the team
                         │ link expired (7 days) ──► "ask for a new invite"
```

- **The rules as understood**, one short line each, with the real
  numbers and the actor: "a manager sends at most 10 invites a day; the
  11th is refused on the spot". Every rule of the Rules table, the
  error paths (limit, failure, permission, repeat) and what is written
  or not when they happen. Merge what reads as one rule; never pad.
- **What stays out**, one line.
- **What we assumed**, one line each: the writer's and your Inferred
  entries he never discussed, so he can catch a wrong guess.
- **What is his to decide**, numbered: the review's findings that are
  his, each with your pick and why in one line. "None" when none.
- **See it**: with a mock, the review steps to follow ("the mock,
  Ctrl+→ through steps 1 to 48"); in local mode, the shots' PNG paths.

**2. The question call**, one call:

- One question per decision of his from the list, its options the
  decision's answers, your pick first.
- One question **"Is this what we build?"**: **Confirm** (recommended
  when nothing of his is open) · **Adjust** (he writes in "Other" what
  changes).
- The design question, beside them:

| Option | Means for stage 2 |
|---|---|
| **Nothing in mind, propose** (recommended) | the architect proposes freely |
| **I have an idea** (Other) | his words go to the architect as his idea |
| **I have a constraint** (Other) | his words go to the architect as a constraint |

Write the design answer, verbatim, to the notes' "For the design" block.

**An adjust that changes behavior is an amendment.** With a mock, in
order: a round order to the `prototype-builder` (the mock changes and
is republished), `proto.mjs lock` again with his answer as the lock
words, the `story-writer` re-derives only the stories it touches,
`trace` green. With no screen: his answer becomes a Confirmed line in
the notes, and the `story-writer` re-derives only the stories it
touches. Then one short message with only what changed, and the
"Is this what we build?" question again. His Confirm closes the
playback; nothing waits for another "ok".
