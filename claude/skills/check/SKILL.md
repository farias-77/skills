---
name: check
description: 'Answers "/check" with one glanceable line: does this session need the reader, or is it running on its own? Three states, one emoji each: 🔴 needs you, 🟢 running on its own, ✅ done. Then, only when there is something for the reader, what to do in i-wont-read-all-this style. For a reader who keeps many sessions open and switches between them. Runs in the calling session; no agent, no tool call unless a fact must be checked.'
argument-hint: "(no arguments)"
license: MIT
---

# Check: does this session need me?

The reader has many sessions open and jumps between them. `/check`
answers one thing at a glance: **do I need to act here?** The answer
is the state line first, then only what the reader needs.

## The three states

Pick exactly one:

| Emoji | State | When |
|---|---|---|
| 🔴 | **Needs you** | Nothing moves until the reader acts: a question to answer, a decision, an approval, a click (a merge, a permission prompt), a command to run, a paste, a login. Also a wait that will not end without them: a peer or a job that needs their decision to go on. |
| 🟢 | **Running on its own** | Work is moving, or waiting on something that comes back by itself: background commands, subagents, workflows, cloud sessions, a CI run, another session's answer, a usage-limit reset, a scheduled wakeup. |
| ✅ | **Done** | The task is finished, nothing runs, nothing waits. The reader can close the session. |

The test for a wait: does it come back without the reader? Yes is 🟢;
no is 🔴. A session that would be ✅ but has a pending question is 🔴.

## The answer

Reply in the reader's language. The first thing is a two-row table:
the emoji and the state in capitals, then one row with what it is
about.

```
| 🔴 | NEEDS YOU |
|----|-----------|
| 👉 | <the one thing, in a few words> |
```

| State | Second row |
|---|---|
| 🔴 | `👉` + the action: "merge PR #29", "answer the question above", "run the command in your clipboard" |
| 🟢 | `⚙️` + what is running or awaited, and its next milestone: "E-14 building in the cloud · back ~15:40" |
| ✅ | `🏁` + what was delivered, in a few words |

In Portuguese the labels are exactly: 🔴 `PRECISO DE VOCÊ`,
🟢 `CONDUZINDO SOZINHO`, ✅ `TERMINEI · PODE FECHAR`.

Below the table, by the `i-wont-read-all-this` style, and only what
the state needs:

- 🔴: what to do, step by step, the shortest path. Anything to copy
  goes to the clipboard first, and the answer says so. If it is a
  choice, the options and your pick. Then one line on what happens
  after they act.
- 🟢: at most three lines: what runs or what it waits on, when it
  should end, what comes next. "Nothing for you."
- ✅: what is left in place (branches, open PRs, notes for later), if
  anything, in one line. "Can close."

## Rules

- **Be honest about the state.** A session that asked a question and
  has had no answer is 🔴, even if it then said it would wait. A
  background job that already failed and needs a decision is 🔴, not
  🟢.
- **Check before claiming 🟢.** When the last news of a background
  job, cloud session or peer is old, look at it once (its output, its
  log, its branch) before saying it is moving. If you cannot tell, say
  so on the second row.
- **No recap.** Do not retell the session. One state, one line, then
  only the action or the next milestone.
- `/check` changes nothing: it does not answer pending questions on
  the reader's behalf, start work, or stop work.
