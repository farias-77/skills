# The interview

The aim: he talks, you extract what to build, and nothing about
**what** to build is left open when the interview ends. It should feel
like a sharp colleague interviewing him, never a form. No mock is built
while he talks: when a screen changes, the mock comes after the
stories (SKILL D3).

## The shape of a conversation

```
voice dump (he talks, no interruption) → restate in one short message (the journeys heard)
→ batches of ≤ 4 questions through the question tool → each answer: notes.md
→ the frontier recomputed → … → nothing passes the razor → the stories (D2)
```

- **The voice dump first.** He says everything, by voice or a long
  paste, in any order. Write it into the notes (Starting point, Themes,
  Said). Restate it in one short message: what you understood, in his
  words, as the list of journeys you heard.
- **Batches.** At most four questions per call, in the house shape. A
  question with no sensible closed options is asked in prose, one per
  turn.
- **The frontier.** Ask only the decisions whose prerequisites are
  settled. Recompute after every batch.

## The razor

A question is asked only when a wrong guess at its answer would change
what gets built: scope, data, behavior, or a look he would notice.
A question every answer of which builds the same thing is not asked;
the implementer decides it.

| Never ask | Instead |
|---|---|
| a fact the code, the docs or `rulings.md` hold | a `scout (Haiku 5.5, medium)` finds it |
| something he will recognize when he sees it (a layout, a density, a tone, which of two flows) | left to the mock's rounds (D3), as variants (three at most) in the debug bar; with no screen, asked here, a flow drawing per option |
| the obvious ("should the button say Save?"), or what the rest of the system already does | said in one line with its source; it goes to Confirmed as `inferred from <source>` unless he objects |
| a look or naming item: a colour, a contrast, a file name, a label, the states a control already implies | left to the mock's rounds; he sees it there and says if he minds. With no screen, only the words he will read (an e-mail, a message) are asked |
| a hypothetical ("would managers use this?") | the last real case ("when did one last…?") |
| two questions in one | split it, or drop the weaker |

## Infer to go faster

Propose the behavior you believe is right: "I assume an expired invite
stays in the list, marked expired; confirm?". Confirmed, it is a fact.
Not discussed, it goes to the notes' Inferred block and is asked before
the interview ends. Never inferred silently.

**Infer from the system.** What the product already does next to the
change (the recon's feature maps) is the default: a new list sorts,
pages and empties like the lists beside it; a new permission follows
the roles that exist. Say the inference in one line with its source;
ask only where the rest of the system gives no answer.

**Check before you ask.** An inferred data order, format or field gets
a scout's answer to "does the system already store this?" before it
becomes an option.

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
| Copy | the words that carry a rule (an error, a limit); the rest is settled in the mock's rounds, or here when no screen changes |
| Look | only when a screen changes: the screens it sits in, and any reference he brings |
| Personal data | for each kind stored or shown: who sees it, how long it is kept |
| Vocabulary | one word per concept, with what to avoid; a term that already means something else in the product (the recon's collisions) is renamed |
| In and Out | every capability is In or Out; Out says "not building, because …" or "future direction" |

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

Your rewrite of his words, confirmed, is what goes to Confirmed.
