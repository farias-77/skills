# The interview

He talks; you build a shared understanding of what to build, until no
branch of it is open. It should feel like a sharp colleague grilling a
plan, never a form. The mock comes after the stories (D3), never while
he talks.

## The shape

```
his dump (no interruption) → your restatement (the journeys you heard)
→ round 1 of the design tree → his answers → notes.md → the frontier recomputed → round 2 … → frontier empty
```

1. **The dump.** He says everything, by voice or a long paste, in any
   order. Write it into the notes (Starting point, Themes, Said).
2. **The restatement.** One short message, in his words: what you
   understood, as the list of journeys you heard.
3. **The design tree, in rounds.** Every decision branches into the
   decisions that hang off it. The **frontier** is every decision whose
   prerequisites are settled: what you can ask now without guessing an
   answer you have not heard. Ask the frontier as one round, through
   the question tool (four questions per call; a bigger frontier is
   several calls in the same turn). A question whose answer depends on
   another question still open goes to a later round.
4. **Each answer reshapes the tree.** Write it to the notes, recompute
   the frontier, ask the next round.
5. **Done** when the frontier is empty: every branch visited, every
   rule in the Rules table, nothing in Open, every Inferred line shown
   to him.

## A question

- **Your pick first, worded so yes takes it.** "Expired invites stay in
  the list, marked expired. Keep it that way?" The options are the real
  answers, your recommendation first and marked, each with what it
  costs and buys.
- **One decision per question**, concrete, with the case that makes it
  matter ("Marina already sent 10 today…").
- A question with no sensible closed options goes as prose, one per
  turn.

## The razor

Ask only what, guessed wrong, changes what gets built: scope, data,
behavior, or a look he would notice. A question whose every answer
builds the same thing is the implementer's.

| It is | So |
|---|---|
| a fact the code, the docs or `rulings.md` hold | a `scout` finds it; facts are your job. Questions that depend on it wait for the scout; ask the rest of the frontier now |
| something he will recognize when he sees it (a layout, a density, a tone, which of two flows) | the mock's rounds decide it, as design options on that screen; with no screen, ask it here with each option's flow drawn |
| obvious, or what the rest of the system already does | infer it (below) |
| a look or naming detail (a colour, a label, the states a control implies) | the mock's rounds; with no screen, ask only the words he will read (an e-mail, a message) |
| a hypothetical ("would managers use this?") | ask for the last real case ("when did one last…?") |

## Infer to go faster

Propose the behavior you believe is right and say its source in one
line: "A new list sorts and pages like the lists beside it (the recon's
team list)." What the product already does next to the change is the
default; a new permission follows the roles that exist. Confirmed, it
is a fact. Not discussed, it goes to Inferred and is shown to him
before the interview ends.

Check before you offer: an inferred data order, format or field gets a
scout's answer to "does the system already store this?" first.

## Anchor on the concrete

- For something that already happens: the last real case. "Always",
  "never", "would" are claims until a named case backs them.
- For something new: walk a scenario ("the first customer lands here
  tomorrow").
- When he brings a solution ("add a CSV export"), ask why until the
  business goal, then stop.

## What to cover

The notes' coverage map shows where the unknowns are.

| Area | Covered when |
|---|---|
| People and jobs | each journey has a job: When <situation>, I want to <motivation>, so I can <outcome> |
| Journeys | actor, trigger, 2–7 steps, an end; the happy path and the bad ones |
| Rules with numbers | each limit, expiry, cadence or threshold has an id, a value, a unit, an example and its boundary |
| Error paths | per journey: a limit hit, a dependency down, a permission refused, a repeat. Each has his decision or an Out line with a reason |
| Data on screen | where each value comes from |
| Copy | the words that carry a rule (an error, a limit) |
| Look | when a screen changes: the screens it sits in, and any reference he brings |
| Personal data | for each kind stored or shown: who sees it, how long it is kept |
| Vocabulary | one word per concept; a word the product already uses for something else (the recon's collisions) is renamed |
| In and Out | every capability is In or Out; Out says "not building, because …" or "future direction" |

## Before each round

Each question is one decision, asks about a real case, offers your pick
openly, and is not already answered in the notes. A theme closes with
your restatement of it, confirmed, written to Confirmed.

> **A good question:** "When an admin re-invites an e-mail whose invite
> expired, the old one stays in the list marked expired. Keep that?"
> Two answers, two different lists, and the notes do not settle it.
