# The issues — step 5 of stage 6

What leaves this stage for the pipeline repo is an issue per ruled
lesson, nothing else. The pipeline is edited in its own session,
issue by issue; the commit that applies a lesson closes its issue
(`Closes #n`), and that is how the repo's history stays the index of
what the pipeline learned.

## One issue per `issue` ruling

```
gh issue create --repo <owner>/<pipeline repo> \
  --title "dreaming(<stage>): <the class in one line>" \
  --label dreaming --label "stage:<stage>" --label "kind:<kind>" \
  --body-file <the body rendered from .github/ISSUE_TEMPLATE/dreaming.md>
```

| Field | What goes there |
|---|---|
| `<stage>` | `discovery` · `design` · `plan` · `execute` · `release` · `close` · `house` (the house rules, the README, the standards) |
| `<kind>` | `skill` · `agent` · `workflow` · `blueprint` · `standard` · `house` — the kind of file the edit lands in |
| Where it bites | the path in the pipeline repo (`claude/skills/stage-design/references/judging.md`), the agent, the workflow |
| What happened | the pattern, in the pipeline's vocabulary |
| Why it will bite again | one sentence: where the pattern reappears |
| Suggested edit | the line that would enter, or the mechanism in three lines |
| Related | `#n` of the same class when the checker found one |
| Ruling | what was decided, the month, and his words when they carry no private detail |

Labels are created when missing (`gh label create dreaming`,
`stage:<stage>`, `kind:<kind>`), once, with a one-line description.
The issue's URL and number go into the ledger entry, `close.json`
and the `rulings.md` line.

## A `join #n` ruling

A comment on the existing issue, not a new one:

```
gh issue comment <n> --repo <owner>/<pipeline repo> --body-file <the comment>
```

The comment says the month it was seen again, the stage, and the
entry's suggestion when it adds to the issue's; sanitized the same
way. The ledger entry records `join #n`.

## Sanitization — the repo is public

The issue carries the pipeline file, the pattern and the edit, in
the pipeline's own words. It never carries:

| Never | Instead |
|---|---|
| a product repo's name, a stack, a table, a route | "the producer repo", "the shared table", "one route" |
| a vendor, a client, a person, an account, an e-mail | "the source system", "the user", "the team" |
| the workstream's slug or title | the month (`2026-09`) and the entry id (`P-3`); the ledger links both |
| an artifact URL, a dashboard, a console link | nothing; the ledger has it |
| a business number, a bill, a count of customers, a date of an incident in prod | "under the budget", "an order of magnitude", "the first day" |
| a parameter name or value, a key, an invite code, a password, a token | "the parameter", "the credential" — even when a commit message printed it |

The session reads the rendered body once against this table before
creating the issue; a body it cannot sanitize without losing the
lesson is a `park` with the reason in the ledger, never a leak.

## Sequence

Issues are created in board order (A, then B, then the parked ones),
one at a time, each traced with its number. A creation the harness
refuses is retried once; refused twice, the body is saved to
`05-close/dreaming/issues/<id>.md` and the entry becomes a pendency
with the user as owner, its command in `sweep.sh`.
