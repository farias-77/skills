# The interview

Read by the conductor (Opus 5.5, high) before the first question.
The aim: he talks, the mock shows what he said within minutes, and
nothing about **what** to build is left open at the lock. It should
feel like a sharp colleague interviewing him, never a form.

## The shape of a conversation

```
voice dump (he talks, no interruption) → restate in one short message (the journeys heard)
→ batches of ≤ 4 questions through the question tool → each answer: notes.md + an edit order
→ the frontier recomputed → … → nothing passes the razor → the lock
```

- **The voice dump first.** He says everything, by voice or a long
  paste, in any order. Write it into the notes (Starting point, Themes,
  Said). Restate it in one short message: what you understood, in his
  words, as the list of journeys you heard.
- **Batches.** At most four questions per call, in the house shape:
  the question carries the context (the quote, the gap, why a wrong
  guess changes the build) and asks one thing; each option's label is
  the answer in his words; your recommendation comes first and says
  so. A question with no sensible closed options is asked in prose, one
  per turn.
- **The frontier.** Ask only the decisions whose prerequisites are
  settled. Recompute after every batch.

## The razor

A question is asked only when a wrong guess at its answer would change
what gets built: scope, data, behavior, or a look he would notice.
A question every answer of which builds the same thing is not asked;
the implementer decides it.

| Never ask | Instead |
|---|---|
| a fact the code, the docs or `rulings.md` hold | a `scout (Sonnet 5.5, low)` finds it |
| something he will recognize when he sees it (a layout, a density, a tone, which of two flows) | put it in the mock, as variants (three at most) in the debug bar |
| the obvious ("should the button say Save?") | the mock answers it |
| a hypothetical ("would managers use this?") | the last real case ("when did one last…?") |
| two questions in one | split it, or drop the weaker |

## Infer to go faster

Propose the behavior you believe is right: "I assume an expired invite
stays in the list, marked expired; confirm?". Confirmed, it is a fact.
Not discussed, it goes to the notes' Inferred block, is visible in the
mock, and is asked before the lock. Never inferred silently.

## Anchor on the concrete

- For something that already happens: the last real case, never what
  users "would" do. "Always", "never", "would" and "might" are fluff
  until a named case backs them; otherwise they go to Bets, unchecked.
- For something new: walk a scenario ("the first customer lands here
  tomorrow").
- When he brings a solution ("add a CSV export"), ask why until the
  business goal, then stop.

## What to cover

The coverage map in `notes.md` tracks it; it says where the unknowns
are, it is not the goal.

| Area | Done when |
|---|---|
| People and jobs | each journey has a job story: When <situation>, I want to <motivation>, so I can <outcome> |
| Journeys | actor, trigger, 2–7 steps, an end with an exit; happy and bad |
| Rules with numbers | each limit, expiry, cadence or threshold has an id, a value, a unit, an example ("the one where…") and its boundary |
| Error paths | per journey: a limit hit, a dependency down, a permission refused, a repeat or double submit. Each has his decision, or an Out line with a reason |
| Data on screen | where each value comes from |
| Copy | every string, in every language the product ships |
| Look | the references he likes, and what in them |
| Personal data | for each kind stored or shown: who sees it, how long it is kept |
| Vocabulary | one word per concept, with what to avoid; a term that already means something else in the product (the recon's collisions) is renamed |
| In and Out | every capability is In or Out; Out says "not building, because …" or "future direction" |

The error paths are the line that stories most often miss: nothing in
that row reaches the design without his decision.

## Self-check before every question

Rewrite or drop a question that is two questions, smuggles its answer
(proposing openly is fine), asks a vague hypothetical, is already
answered in the notes, or ladders "why" past the business goal.

> **Passes:** "When an admin re-invites an e-mail whose invite expired,
> does the old one disappear or stay marked expired?" Two answers, two
> different lists; the notes do not settle it.
>
> **Fails:** "Should the button be blue?" He will see the button.

## Restate before closing a theme

Your rewrite of his words, confirmed, is what goes to Confirmed. A rule,
a number, a scope line or the data shown is restated and confirmed
before it is ordered into the mock; look, copy and layout go straight
to the builder.
