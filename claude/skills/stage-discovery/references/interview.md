# The interview

Stops 1 to 3: he talks, you read back, you ask. The split that holds
the whole stage: **facts are your job, decisions are his.** A fact is
anything the code, the standards book, a past workstream or a scout
can answer. A decision is a choice between things the product could
do, where he would be unhappy to find the other one built.

A good interview feels like a sharp colleague who read the code before
the meeting: few questions, each one about a real case, none he could
have answered by pointing at a file.

## Stop 1 · He talks

Open with the opening template
([messages.md](messages.md)) and let him say everything, in any order:
text, dictation, a screenshot, a pasted request. While he talks:

- Write his words to `notes.md` (Starting point, Said) as he said
  them. Dictation comes with noise; keep the meaning and the phrases
  that carry a decision or a taste.
- Dispatch scouts for every fact his words raise (SKILL.md, Recon).
  They read while you listen.
- Ask nothing yet, except "anything else?" once, when he stops. A
  specific question now cuts the dump short and you lose what he was
  about to say.

When the dump lacks the why (he brought a solution: "add a CSV
export"), ask for it in one plain message with no options: "What
happens today that made you want this?" Options steer; until you know
the why, his own words carry more than your menu.

## Stop 2 · The readback

By [readback.md](readback.md): what you understood, what you will
assume, what only he can decide. It is one message and it ends the
turn. Everything that is not his to decide is settled there, so the
interview starts already short.

## Stop 3 · The questions

### What earns a question

Ask only when all three hold:

1. Two answers would build two different things (scope, a rule, a
   number, data shown or stored, who can do what).
2. Neither his words, the code, the standards book nor a scout
   settles it.
3. He can answer it: it is about his product and his users, not about
   a mechanism.

Everything else has another home:

| It is | It goes to |
|---|---|
| a fact | a scout; the questions that depend on it wait for the answer |
| what the product already does next to the change | an assumption with its source ([readback.md](readback.md)) |
| how it should look: a layout, a density, which of two arrangements | the mock; with no screen, the cases |
| a mechanism: a lock, a retry, a status code, a storage shape | "For the design" in the notes; stage 2 owns it |
| cheap to undo and with one sensible default | an assumption |
| expensive or impossible to undo | a question, even when you are fairly sure |

### The order

Every decision opens the decisions that hang off it. Keep the tree in
the notes' Decisions table and ask only what is unlocked: a question
whose answer depends on one he has not given yet waits. Among the
unlocked ones, take the one where a wrong guess costs the most and you
know the least. Purpose and scope come before rules; rules before
their exceptions.

The notes' coverage map is your checklist, never a form he fills in.
Use it to notice what nobody mentioned (the error paths, personal
data, who sees what), not to walk him through categories.

### One question, in the question tool

One question per call, one call per turn. He answers with the arrows
or writes his own words in the field the tool adds.

| Part | How |
|---|---|
| `header` | the topic in one or two words ("Daily limit") |
| `question` | self-contained, because the dialog may be the only thing on his screen. First the situation in two or three short lines: a real case with a name and a number, and what the product does there today with where you saw it. Then the ask, one sentence ending in a question mark |
| options | two or three real answers. Your pick first, its label ending in "(Recommended)" in his language. The tool adds the free-text option itself |
| each `description` | what that answer costs and buys in the build, in one line, checked before you ask: "One message to write. No queue." A migration, a recurring cost or something that cannot be undone is said here |

A question that needs a wall of context is two questions, or is
missing a scout's answer. Cut it until the situation fits three lines.

> **header** Daily limit
> **question** A manager already sent 10 invites today and tries an
> 11th. Nothing in the product has a daily limit today, so there is no
> pattern to copy. What happens to that invite?
> **Block and say when it resets (Recommended)** One message to write.
> No queue.
> **Queue it for tomorrow** A job, a new status and a screen for the
> queue.

Write the question and its options in his language; the notes stay in
English.

### Keeping him talking, not agreeing

A row of "yes to my pick" answers tells you little. Three habits keep
the answers real:

- **Ask about the last real case before a hypothetical.** "When did a
  manager last need to add ten people in one day?" beats "would
  managers want bulk invites?". "Always", "never" and "would" are
  claims until a named case backs them.
- **Change the shape.** After two questions he answered with your
  pick, make the next one a scenario with no obvious favourite, or a
  plain open message when the choices cannot be named yet.
- **Push on a thin answer.** When an answer leaves the boundary open
  ("some limit, I guess"), ask for the number and its edge in the
  next question: the 10th is sent, the 11th is refused.

When he answers in his own words, start the next question with one
line of what you wrote down ("Noted: cancelled invites still
count."), so a mishearing is caught one turn later, not at the gate.
When he picked an option, there is nothing to repeat.

When an answer opens a branch the readback did not announce, say so
in that same first line ("Your answer opens one more."). When the
next question is the last, say it is the last.

### The notes, every turn

After every answer, before the next question, write to `notes.md`:
the decision in the Decisions table, a rule with a number in the
Rules table with an example at its boundary, a journey step in
Journeys. A dead session then loses nothing.

Every line carries where it came from:

| Provenance | Means |
|---|---|
| `said` | his words, quoted |
| `accepted` | you proposed it, and he said yes to that one item |
| `assumed` | you proposed it and he has not answered that item |

A yes to a list accepts nothing in it: he did not weigh each line.
Those lines stay `assumed` and are shown again at the gate. Only what
he said or accepted is written as his.

### Examples with real values

Every rule with a number leaves the interview with one example at its
boundary and the literal result he expects ("sent 19 Nov 09:00, still
works 26 Nov 08:59, refused at 09:00"). The values come from him or
from a system of record a scout read. When he cannot say what should
happen in an example, that is a question, not an example.

### When to stop

Stop when the next question would not change the document: every
unlocked decision has his answer or is an assumption he has seen, and
the coverage map shows nothing costly still missing. There is no
quota in either direction; three questions is a normal interview and
so is twelve.

- What was important and went unasked (he ran out of time, he said
  "you decide") goes to the notes' Deferred list and comes back at
  the gate as "decided for you".
- "You decide" on something expensive or irreversible gets one more
  line from you naming the cost, then his word stands.
- When the answers show the demand is bigger than it was sized (a
  second screen, a migration, a new kind of user), stop and say so in
  one message, step the size up in `.state.md`, and carry on at the
  new size. A demand grows while it runs; it never shrinks without
  his word.

Close the interview in one line ("That was the last one. Writing the
stories now.") and go to stop 4 in the same turn.
