# Messages

He runs several sessions at once and skims. Two kinds of message
reach him from this stage.

- **Fixed moments** use a template: the same fields in the same order
  every time, so he learns the shape once and then reads only the
  values. There are six, below.
- **Everything else** follows the `i-wont-read-all-this` skill: the
  action first, short numbered steps, at most five items, one
  decision per message.

Write every message in his language. The templates below show the
fields; translate the labels, keep the order and the alignment. Each
template is one code block so the columns line up.

## The status line

The last line of a message, in three moments only:

| Moment | State |
|---|---|
| you go off to work and he will wait (stories, mock, review running) | 🟢 running on its own |
| you come back from that work and need him | 🔴 needs you |
| the workstream is delivered and this session is never needed again | ✅ done |

During a live back-and-forth (the dump, the interview, the mock
rounds) there is no status line: he is right there answering.

Get the line from the script and paste it as printed. The script
writes the same line to `.state.md`, which is what a coordinator
session reads:

```
node <discovery.mjs> state <workstream> --stop 5 --state needs-you --about "the mock is ready, walk the tour" --lang <his language>
→ 🔴 NEEDS YOU · the mock is ready, walk the tour · ●●●●●○○ 5/7
```

`--about` is a few words in his language: what he does next (🔴), what
is running and what he will be called for (🟢), or what was delivered
and that the environment is clean (✅). The labels for his language
are the `check` skill's; "you can close" exists only on ✅. A session
with anything running or waiting never says it can be closed.

Check before you claim 🟢: an agent that already failed and needs a
decision is 🔴.

When a wait ends and he is needed, also send a push notification
where the tool exists, with the status line's middle part as the
message.

## Anything he must copy

A link, a command, an id: put it on his clipboard with the clipboard
command his `CLAUDE.md` names, and also print it in a code block in
the same message. Several sessions compete for the clipboard; the
printed copy is the fallback. Write "(also in your clipboard)" only
after the clipboard command ran and exited 0; otherwise leave the
line out.

## 1 · Opening (stop 0 → 1)

```
DISCOVERY · <slug>

Request   "<the demand in his words, one line>"
Origin    <tracker id · who asked · when> | typed here
Size      <small | feature | large> · <a screen changes | no screen> · <what else is known>

Tell me everything you have in mind. In any order.
```

## 2 · Readback (stop 2)

```
UNDERSTOOD
  <two to four short sentences>

WILL ASSUME (say no to any)
  1  <assumption>            source: <a few words>
  2  <assumption>            source: <a few words>
  <+ N cheap ones in notes.md>

ONLY YOU DECIDE · <N questions next: topic, topic, topic> | nothing here is yours to decide

<Correct anything, or say "go on".>
```

## 3 · Running without you (the start of a wait)

```
RUNNING WITHOUT YOU

Agent            Task                     State
<agent>          <task>                   <done | running | queued>
<agent>          <task>                   <…>

I call you when <the one thing he will be needed for>.

<status line, 🟢>
```

## 4 · Back (the end of a wait, or a resumed session)

```
BACK · <slug>

Done      <what finished, in counts: interview (9 decisions) · 6 stories>
Decided   <the two or three decisions that shape the rest>
Waiting   <the one thing he does now>

Link      <url>
          (also in your clipboard)

<status line, 🔴>
```

## 5 · Gate (stop 7)

```
DISCOVERY READY · <slug>

You decide    <N things, asked next> | nothing
Decided       <N in your place, listed on the page>
Delivered     <N stories · N criteria · screen locked | N cases>
Review        <N found · N confirmed · N ruled in your place · N yours>

Link          <url>
              (also in your clipboard)

<status line, 🔴>
```

## 6 · Approved (the close)

```
DISCOVERY APPROVED · <slug>

Frozen    <N stories · N criteria · N rules>
Next      /clear
          /stage-design <slug>
          (also in your clipboard)

<status line, 🔴: "Discovery approved · next: /clear, then /stage-design <slug>">
```

## Interview questions

Not a template message: each one goes through the question tool, in
the shape [interview.md](interview.md) gives.
