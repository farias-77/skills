# i-wont-read-all-this

Claude shapes every reply for a reader who skims: the answer first, short numbered steps, at most five items, one decision per message, and no preamble or recap.

Adapted from [i-have-adhd](https://github.com/ayghri/i-have-adhd) by ayghri (MIT). What changes from it:
1. It is on by default instead of invoked.
2. It replies in the reader's language.
3. It brings one decision per message in a debate.
4. Detail goes to a file and is linked, not pasted.
5. It allows small comparison tables (at most 5 rows and 3 columns).

## Use only this skill

1. Copy this folder to `~/.claude/skills/i-wont-read-all-this/`.
2. To have it on in every session, add this line to `~/.claude/CLAUDE.md`:
   ```
   Follow the `i-wont-read-all-this` skill in every reply, from the first one.
   ```
3. Start a new session.

To turn it off for a session, say "normal mode".

## Files

- `SKILL.md`: the rules Claude follows.
