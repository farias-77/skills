# Stories and acceptance criteria

Read by `story-writer (Sonnet 5.5, high)` before it writes, by
`disc-lens (Sonnet 5.5, medium)` before it judges, and by the
conductor before it rules. The stories are written from the
conversation (`notes.md`) and the locked mock. The mock is the source:
nothing in a story is new.

## The rule that sizes everything

**One AC per rule or behavior he said. Never one per step, per state
or per copy string.** Every AC becomes a test and a check downstream;
the count is the cost. The locked frames already cover the states, the
layout and the copy. A step with no rule or behavior of its own has no
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
one story plus the vocabulary and must judge every AC against the mock.
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
| id | `<journey>.<step>.<n>`, the step where the behavior shows first; `frame:<token>.<n>` for a behavior only a debug-only frame shows. Frozen at the lock |
| `[ ]` | the rule ids it checks (the notes' Rules table), or the story id when no numbered rule covers it. A rule id sits in one AC only |
| GIVEN | the state before the event, never clicks; fixtures named |
| WHEN | exactly one event, declarative: no selectors |
| THEN / AND | one observable outcome per line, each with where it is observed: screen (role + accessible name, or copy key with every language's string) · inbox · row read back · event · log · alarm · file |
| values | concrete: fixture names, numbers with units. Never "quickly", "correctly", "appropriate" |
| must not | effects that must not happen are stated ("no e-mail goes to…", "the count stays 1") |
| boundary | a rule with a number gets ONE AC, at the boundary the mock shows (the 11th refused, the 10th kept), never one per side |
| `[build]` | after the rule ids, when the rule's Proof column in the notes says `[build]`: a rule a one-file mock cannot show (real time, a server's refusal, a reload, a second session). Same shape, observed in the built product. Never on an AC the mock can show |

## The four error paths

Every story has a table: limit (boundary input), dependency failure,
permission, repeat (double submit, two tabs, a retry). Each row points
to a journey step, a frame, or an Out line with a reason. A row with
none of them is a gap: it goes to Inferred or Open, never silence.

## Inferred and Open

- **Inferred** (`I-1`, `I-2`…): every fact written that neither the
  mock nor the notes contain: the guess and the AC it landed in. The
  text says it as if true, so the document reads as one; the list lets
  him reject it. An empty list after honest writing is rare.
- **Open**: what the writer could not settle. A boundary the mock does
  not show goes here, never invented.

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
