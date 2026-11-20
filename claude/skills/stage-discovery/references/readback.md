# The readback

Stop 2. One message, right after he stops talking and the scouts have
answered. It replaces most of the interview: everything you can
settle from his words and the code is said out loud here, so he
corrects instead of answering.

A default he never heard is one he could not reject. So every gap you
filled is on this message or in the notes, with its source.

## Sort every gap first

For each thing his words leave open, before you write:

| The gap | Becomes |
|---|---|
| a fact the code or the standards book holds | nothing to show: it is a fact. A scout's quote goes in the notes |
| the product already does it one way next to the change, and undoing it later is cheap | an assumption, one line, with its source |
| there is one sensible default and undoing it is cheap | an assumption, one line, with your reason as the source |
| undoing it later is expensive (a migration, data already written, a contract others build on) or impossible | a question, even with a clear favourite |
| two answers build two different products and nothing in the code favours one | a question |

Write each assumption to the notes' Assumptions list as `assumed`
with its source and its cost if wrong (`cheap` or `costly`). An
assumption with no source ("it seemed right") is a question.

## The message

The readback template in [messages.md](messages.md), in his language:

1. **Understood**: two to four short sentences, in his words: who
   uses it, what they can do that they cannot today, why. Add
   anything the scouts found that changes what he asked for (it
   already exists, it clashes with another workstream, there is a
   cheaper path), said plainly.
2. **Will assume**: the assumptions, most costly first, at most five
   on screen, each one line with its source in a few words. When
   there are more, the last line says how many cheap ones are in
   `notes.md`.
3. **Only you decide**: how many questions follow, and their topics
   in a few words. Never the questions themselves: one arrives at a
   time.

Close on the one thing he can do: correct anything, or say to go on.
The message ends the turn. The question tool's dialog can hide the
text above it, so the first question never goes out in the same turn.

## What his reply means

- He corrects a line: fix the notes (`said`, his words), re-sort
  anything that depended on it, and tell him in one line what
  changed.
- He says to go on and names nothing: the Understood block is
  confirmed; the assumptions stay `assumed`. They are listed again at
  the gate as "decided for you".
- He accepts one assumption by name: that one becomes `accepted`.

## The shortcut

When the sort leaves no question, the third block says so ("nothing
here is yours to decide") and the close asks him to correct or go on.
On his go, skip stop 3 and write the stories. A small, clear demand
passes through this stage with that one reply and the approval.

## The size, said here

The door sized the demand before you knew much. Now you know more.
When the readback shows a different size (a screen that changes after
all, a second kind of user, several independent parts), say the new
size in the Understood block and write it to `.state.md`. For a large
and foggy demand, the readback proposes the cut into parts instead of
assumptions ([SKILL.md](../SKILL.md), The three sizes).
