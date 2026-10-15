# check

`/check` answers, at a glance, whether a session needs you or is
running on its own. Made for working with many sessions open at once:
switch to a tab, type `/check`, read the first line.

```
| 🔴 | NEEDS YOU |            | 🟢 | RUNNING ON ITS OWN |
|----|-----------|            |----|--------------------|
| 👉 | merge PR #29 |         | ⚙️ | E-14 in the cloud · back ~15:40 |
```

| Emoji | State |
|---|---|
| 🔴 | needs you: a question, a decision, an approval, a click, a command, or a wait only you can end |
| 🟢 | running on its own, or waiting on something that comes back by itself (its background work, cloud sessions, another session, a limit reset) |
| ✅ | done; you can close it |

Below the state line comes only what the state needs: the steps to
take (🔴), the next milestone (🟢), what was left in place (✅).

## Install

Copy this folder into your skills (`~/.claude/skills/check` for every
session, or a project's `.claude/skills/`). It pairs with
`i-wont-read-all-this`, whose style shapes the lines below the state.

## Files

| File | What |
|---|---|
| `SKILL.md` | the three states, the test for a wait, the answer's shape |
