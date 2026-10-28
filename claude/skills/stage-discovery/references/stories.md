# Stories and acceptance criteria

The source of truth for how stories and ACs are written. The
`story-writer` reads it before it writes, `disc-lens` before it judges,
and the session before it rules. The stories come from the notes and,
once a screen's mock is locked, from the mock too. Nothing in a story
is new: what the writer had to guess is listed as Inferred.

## One AC per rule

**One AC per rule or behavior he decided, never one per step, state or
copy string.** Every AC becomes a test downstream: the count is the
cost. The locked frames cover the states, the layout and the copy; a
string that carries a rule (a refusal, an e-mail's content) is a THEN
line of its rule's AC. A small feature has a few ACs per story; past
ten in one story, look for two that check the same thing.

A behavior is something the product does when someone acts: it writes,
sends, refuses, keeps, or must not do something.

## A story

One story per job: the journeys with the same actor and job. The happy
journey is the main flow; each other journey is an extension at the
step where it branches. A story carries its actor and job, its
journeys, its main flow and extensions, its ACs, its error-path table,
and its In and Out.

**Each story stands alone**: a blind reader gets one story plus the
vocabulary and must judge every AC from it (and the mock). So an Out
line that touches the story is repeated in it, and a story cites only
its own AC ids; another story's criterion is named in words.

## An AC

```
- **`J1.s2.1`** [INV-1] GIVEN Marina Okafor's workspace has 10 invites sent today
  WHEN she sends an 11th invite to joao.lima@example.com
  THEN the form shows `invite.limit` ("You reached today's 10 invites" · "Você chegou aos 10 convites de hoje") (observed: screen)
  AND the invites list still holds 10 pending invites (observed: row read back)
  AND no e-mail goes to joao.lima@example.com (observed: inbox)
```

| Part | Rule |
|---|---|
| id | `<journey>.<step>.<n>`: the step where the behavior shows first (the notes' steps; after the anchor, the locked step). `frame:<token>.<n>` for a behavior only a debug-only frame shows. Frozen after the anchor, or after the write when no screen changes |
| `[ ]` | the rule ids it checks (the notes' Rules table), or the story id when no numbered rule covers it. A rule id sits in one AC only |
| GIVEN | the state before the event, with named fixtures; a state, never clicks |
| WHEN | exactly one event, declarative |
| THEN / AND | one observable outcome per line, each with where it is observed: screen (role and accessible name, or copy key with every language's string) · inbox · row read back · event · log · alarm · file |
| values | concrete: fixture names, numbers with units |
| must not | effects that must not happen are stated ("no e-mail goes to…", "the count stays 1") |
| boundary | a rule with a number gets one AC, at its boundary (the 11th refused, the 10th kept) |
| `[build]` | only when a screen changes, after the rule ids, when the notes' Proof says `[build]`: a rule a one-file mock cannot show (real time, a server's refusal, a reload, a second session). Same shape, observed in the built product |

## The four error paths

Every story has a table: **limit** (boundary or invalid input),
**dependency failure**, **permission**, **repeat** (double submit, two
tabs, a retry). Each row points to the step or frame with the AC that
proves it (the refusal, and what is not written), or to an Out line
with a reason. A path another story proves names that criterion in
words, with `—` in the AC column. A path that cannot happen here (a
read-only list has no repeat) is `n/a: <why>`. A row with none of these
goes to Inferred or Open.

## Inferred and Open

- **Inferred** (`I-1`, `I-2`…): every fact written that neither the
  notes nor the mock hold, with the AC it landed in. Fixture names and
  e-mails are invented by rule and are not Inferred. The text states it
  as fact so the document reads as one; the list lets him reject it.
- **Open**: what the writer could not settle, such as a boundary the
  notes do not give.

Both go to the playback and are empty before the stage closes.

## Good ACs read like this

- Each line is something a tester can see: a message on screen, a row,
  an e-mail in an inbox.
- The event is what the person does ("she sends an 11th invite"), not
  how a script drives the page.
- The outcome is what the product does, not which function it calls.
- Every story goes through its limit, its failure, its permission and
  its repeat.
- A duplicate submit is checked in the inbox and in the rows, not only
  on screen.

## The mechanical proof

```
node <proto.mjs> trace <mock> 00-discovery/journeys 00-discovery/stories.md --notes 00-discovery/notes.md
```

proves that every journey has its YAML with the mock's steps and frames,
every AC resolves to a step or a frame, every rule has exactly one AC,
and no story cites another's AC id. With no mock, the same checks run
against the notes' Journeys:
`node <proto.mjs> trace none - 00-discovery/stories.md --notes 00-discovery/notes.md`.
It must pass before the review.
