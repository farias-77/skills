# Stories and acceptance criteria

Read by `story-writer (Sonnet 5.5, high)` before it writes, by
`disc-lens (Sonnet 5.5, medium)` before it judges, and by the
conductor before it rules. The stories are written at the end of the
interview, from the conversation (`notes.md`). When a screen changes,
they are then anchored on the locked mock, which becomes their source
too. Nothing in a story is new: what the writer had to guess is
Inferred.

## The rule that sizes everything

**One AC per rule or behavior he said. Never one per step, per state
or per copy string.** Every AC becomes a test and a check downstream;
the count is the cost. The locked frames already cover the states, the
layout and the copy. Before a mock exists, and when no screen changes,
a string that carries a rule (a refusal, an empty result, an e-mail's
content) is a THEN line of its behavior's AC, never an AC of its own. A step with no rule or behavior of its own has no
AC. A small feature has a few ACs per story; past ten in one story,
look for two that check the same thing.

A behavior is something the product does when someone acts: writes,
sends, refuses, keeps, must not do.

## A story

One story per job: the journeys with the same actor and job. The happy
journey is the main flow; each other journey is an extension at the
step where it branches. A story carries its actor and job story, its
journeys, its main flow and extensions, its ACs, its error-path table,
and its In and Out. **Each story stands alone**: a blind reader gets
one story plus the vocabulary and must judge every AC against the mock,
or from the text alone when there is none.
So an Out line that touches the story is repeated in it, and a story
cites only its own AC ids (another story's criterion is named in words).

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
| id | `<journey>.<step>.<n>`, the step where the behavior shows first (the notes' journey steps; with a mock, the locked step after the anchor); `frame:<token>.<n>` for a behavior only a debug-only frame shows. Frozen after the anchor, or after the write when no screen changes |
| `[ ]` | the rule ids it checks (the notes' Rules table), or the story id when no numbered rule covers it. A rule id sits in one AC only; the story id may sit in several |
| GIVEN | the state before the event, never clicks; fixtures named |
| WHEN | exactly one event, declarative: no selectors |
| THEN / AND | one observable outcome per line, each with where it is observed: screen (role + accessible name, or copy key with every language's string) · inbox · row read back · event · log · alarm · file |
| values | concrete: fixture names, numbers with units. Never "quickly", "correctly", "appropriate" |
| must not | effects that must not happen are stated ("no e-mail goes to…", "the count stays 1") |
| boundary | a rule with a number gets ONE AC, at its boundary (the 11th refused, the 10th kept), never one per side |
| `[build]` | only when a screen changes: after the rule ids, when the rule's Proof column in the notes says `[build]`: a rule a one-file mock cannot show (real time, a server's refusal, a reload, a second session). Same shape, observed in the built product. Never on an AC the mock can show. With no screen, no AC carries it: the build proves every AC and the blind readers read them all |

## The four error paths

Every story has a table: limit (boundary or invalid input), dependency
failure, permission, repeat (double submit, two tabs, a retry). Each row
points to a journey step or a frame with the AC that proves it (the
refusal and what is not written), or to an Out line with a reason. A
path another story proves names that criterion in words ("the
subleader criterion of S-003") with `—` in the AC column. A path that
cannot happen in this story (a read-only list has no repeat)
is `n/a: <why>`, never an invented Out line. A row with none of them is
a gap: it goes to Inferred or Open, never silence.

## Inferred and Open

- **Inferred** (`I-1`, `I-2`…): every fact written that neither the
  notes nor the mock contain (fixture names and e-mails are invented by
  rule and are never Inferred): the guess and the AC it landed in. The
  text says it as if true, so the document reads as one; the list lets
  him reject it. An empty list after honest writing is rare.
- **Open**: what the writer could not settle. A boundary the notes do
  not settle goes here, never invented.

Both are asked at the playback and empty before the stage closes.

## Anti-patterns

- An AC per step, per state, per copy string: a small board with a
  hundred ACs.
- Unverifiable lines: "handles errors gracefully", "loads quickly".
- UI scripts: "When I click #submit-btn and wait 2 s".
- Internals: "Then `sendEmail` is called once".
- A happy-path-only story: no limit, no failure, no permission, no
  repeat.
- A duplicate submit checked on screen but not in the inbox.
- An id from another story inside this one.

## The mechanical proof

`node proto.mjs trace <mock> 00-discovery/journeys 00-discovery/stories.md --notes 00-discovery/notes.md`
proves: every journey has its YAML with the mock's steps and frames,
every AC resolves to a step or a frame, every rule has exactly one AC,
and no story cites another's AC id. It must pass before the review.

Before a mock exists, and when no screen changes, the same checks run
against the notes' Journeys section, with no YAML and no frame ACs:
`node proto.mjs trace none - 00-discovery/stories.md --notes 00-discovery/notes.md`.
The writer runs it at the end of every write.
