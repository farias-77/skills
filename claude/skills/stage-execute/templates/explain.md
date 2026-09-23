# <workstream> — what was built, explained

<!--
  Written by the SESSION at the end of stage 4, for a technician who
  joined the team this week and has to explain this demand to someone
  else without opening the design. Opens with "For the intern" — plain
  words, one analogy per component, the guards with the why of each,
  what differs between alpha and prod — before any technical section.
  Source: the code on the feature branch, the feature maps and the
  audit; file names and short excerpts only.
-->

## For the intern

**The problem this demand solves.** <two or three sentences: what a person could not do before, and can now>

**Who does what.** One line per component, with an analogy:

| Component | Its job | Think of it as |
|---|---|---|
| `<name>` | <what it does, plainly> | <an analogy from outside software> |

**The guards, and why each exists.**

| Guard | What it stops | Why we needed it |
|---|---|---|
| <a lock, a timeout, an alarm, a condition> | <the failure it prevents> | <the sentence that forced it: an AC, a decision, a rule> |

**Alpha and prod.** <what is different in alpha (a stub, a disabled schedule, no alarms) and what only exists in prod, one line each>

## The tree

```
<repo>/
├── <the folders this demand added or changed, one comment each>
```

## How a request travels

<the flow of the demand's main path, as a numbered list or a mermaid diagram: what enters, which component touches it, what is written, what is returned>

## Where the numbers come from

<the counts a person sees (a total, a status, a date) and the table or query each one reads>

## What to look at when it goes wrong

<the log group, the alarm, the query, the runbook line — one per failure the guards above name>
