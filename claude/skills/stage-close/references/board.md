# The board — step 3 of stage 6

The board is `05-close/dreaming/ledger.md`: every friction the
harvest brought, as an entry with the session's suggestion and the
recurrence verdict, organized for one reading. The session judges;
no agent classes a lesson, and no agent rules one.

## The sections, in reading order

| Section | Ids | What goes there |
|---|---|---|
| A · `[user]` entries | `U-n` | what he dictated along the way ("note this for the dreaming"); he wrote them knowing what he wants, so the suggestion is the edit he asked for and the reading confirms it |
| B · pipeline candidates | `P-n` | the session's lessons for the pipeline repo, ranked by what each would have saved this demand (rounds, tokens, hours, a stop, a defect in prod) |
| C · taste | `T-n` | every `taste-notes.md` line as an entry: the pattern, the instances behind it; what it becomes is his call at the stop, asked as a question |
| D · venture and repo | `V-n`, `R-n` | lessons for the venture's own docs or a product repo's `docs/`; never an issue on the public repo; each becomes a pendency with an owner in the closure |
| E · suggested discards | `X-n` | incidents, not classes: one line each with why; rescuable by a word from him |
| Parked from the previous workstream | their original id, marked `parked` | re-presented in the section their class puts them in, with the recurrence checked again |

## The suggestion on every entry

| Field | What the session writes |
|---|---|
| What happened | the pattern in one or two sentences, and where it bit (stage, the file and line of the evidence, the quote) |
| Class or incident | the ruler: does this bite again wherever the pattern appears? Yes ⇒ a class; no ⇒ a suggested discard with one line of why |
| Destination | `pipeline` (the file in the pipeline repo: a skill, a reference, an agent, a workflow, the blueprint, a standard, the house rules) · `venture` · `repo` |
| The edit it would make | for a pipeline candidate: the line that would enter, or the mechanism in three lines; concrete enough that the other session can act on the issue without reading the ledger |
| Recurrence | the checker's verdict (below) |
| Ruling | `—` until the stop; then `issue #n` · `join #n` · `discard` · `park`, with his words when he gave them |

A lens's precision is an entry when it is off: found many, sustained
few (the discovery's acceptance lens at 2 of 13 in the first run);
the entry names the lens file and suggests the calibration line. A
ruling pattern is an entry when it repeats: a class he keeps
dismissing, a recommendation he keeps choosing against.

## Recurrence

[`close-recurrence.js`](../../../workflows/close-recurrence.js):
`parallel` over the pipeline candidates (sections A and B, and the
parked ones whose class is pipeline), `agentType: 'close-checker'`, a
structured verdict each. The checker reads the pipeline repo's
issues in all states (`gh issue list --state all --label dreaming`,
then the search by words), the destination file's current text, and
the git log for a commit that closed a same-class issue. "Same
class" is a semantic judgment, which is why an agent and not a grep.

| Verdict | Meaning | What the board does with it |
|---|---|---|
| `new` | no issue and no commit covers this class | the default ruling is `issue` |
| `open #n` | an open issue of the same class exists | the default ruling is `join #n`: a comment on it, no new issue |
| `closed #n`, rule not in the text | the issue was closed but the destination no longer carries the rule (reverted, rewritten) | the default ruling is `issue`, the entry says "reopens the class of #n" |
| `closed #n`, rule in the text | the rule is there and the friction happened anyway: **the rule did not hold** | never a default: a question to him at the stop, with the issue and the quote |

Every verdict is saved verbatim to `dreaming/recurrence.json` and
rides on the entry with the issue number and the quote.

## The reading

The board is read on the Close tab of the blueprint, built from
`close.json`; the ledger is the file behind it. The tab shows the
counts first (entries, defaults to issue, joins, discards, parks,
recurrences, questions waiting), then the sections in order, each
entry as one row: id · title · what happened · the edit · recurrence
· the default ruling. What the session cannot rule alone is marked
"question" and asked when he arrives.
