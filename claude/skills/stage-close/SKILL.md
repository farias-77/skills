---
name: stage-close
description: Conducts stage 6 (Close) — archives the workstream and turns what it taught into issues on the pipeline repo, with one stop for the user. The session (Fable 5.1, high) harvests the demand's whole record through one close-harvester (Sonnet 5, high) per source, writes the closure record with the numbers against the previous workstream, sweeps the repos and GitHub so the next demand starts clean, builds the dreaming board (every friction with its evidence, the class it sees, the destination and the edit it would make) and checks every pipeline candidate against the repo's issues with one close-checker (Sonnet 5, high) each; the user reads the Close tab once, vetoes or changes in prose, and says apply; the session then opens one issue per ruled lesson from the repo's template, never editing the pipeline itself, closes the record and presents the commits for push. Use when a workstream's .state.md says stage close, or to resume a close in progress.
disable-model-invocation: false
argument-hint: "<workstream-slug>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, Workflow, AskUserQuestion, Artifact, PushNotification, Bash
---

# Stage 6: Close

The demand is in production. This stage does two things nothing else
does: it **archives the workstream as a complete record** and leaves
the repos ready for the next demand; and it **turns what the demand
taught into issues on the pipeline repo**, so the pipeline gets better
in its own session, issue by issue, never here. There is no waiting
period: what hurts in production later reopens the demand as a
hotfix, it does not hold the close.

**One stop, at the board.** Everything before it is reading and
record; everything after it is applying what the user ruled. The
session harvests, writes the closure, sweeps, builds the board with a
suggestion on every entry, and stops once: the user reads the Close
tab, changes what he wants in prose, and says "apply". Then the issues
are opened, the record closed, and the commits presented for push.

| Word | What it is here |
|---|---|
| **the harvest** | one reader per source of the record, returning the numbers and every friction with its evidence; the session judges what they brought, it does not read 900 lines itself |
| **the closure** | `05-close/closure.md`: what shipped, what did not, the pendencies with owners, the numbers against the previous workstream |
| **the sweep** | the repos and GitHub left clean: branches gone, PRs closed, clones on `main`, alpha reseeded; what the harness blocks is a line the user runs, listed before the stop |
| **the board** | `05-close/dreaming/ledger.md`: every friction as an entry with the session's suggestion (class, destination, the edit) and the recurrence verdict; the user rules each entry by reading, and "apply" is the ruling on the whole |
| **an issue** | the only thing that leaves this stage for the pipeline repo: one per ruled lesson, from the repo's template, sanitized for a public repo; the pipeline is edited in another session, issue by issue |

The session conducts directly. The agents it dispatches are the
harvesters (one per source, Sonnet 5, high) and the checkers (one per
pipeline candidate, Sonnet 5, high); no judge, no editor. Every reply
that dispatches or waits on an agent carries a status table (agent ·
task · state), the state read from the harness. Say in one line what
you are about to do; end no turn on a plan or a promise.

## The pattern

```
0. Entry     preconditions → 05-close/trace.md opened → the previous workstream's close.json found (or none)
1. Harvest   close-harvest workflow: one close-harvester per source → numbers + frictions with evidence, structured
2. Closure   05-close/closure.md from the harvest (shipped, cut, pendencies, numbers vs previous) · the sweep,
             what the harness blocks → 05-close/sweep.sh and a line for the user
3. Board     the session classes every friction (class or incident · destination · the edit it would make)
             close-recurrence workflow: one close-checker per pipeline candidate → new · open #n · closed #n
             ledger.md written · close.json written · the blueprint built and republished
4. The stop  he reads the Close tab; adjustments noted in a visible list; questions only for a recurrence,
             a taste note and a class conflict; "apply" is the ruling on the whole board
5. Issues    one `gh issue create` per ruled lesson from .github/ISSUE_TEMPLATE/dreaming.md; a join is a comment
             on the existing issue; numbers into the ledger, close.json and rulings.md
6. Done      close.json closed → build → republished at the same URL → .state.md closed → commit → push on his ok
```

## Preconditions

`.state.md` says `stage: close · chair: fable`; `04-release/trace.md`
shows the train completed and the watch read (or its pendencies given
an owner); `blueprint/release/release.json` has its `close`. Missing
⇒ halt, back to stage 5 with the line named.

```
<workstream>/
├── .state.md                     # stage: close · chair: fable → closed
├── rulings.md                    # + one line per ruling given at the board
├── blueprint/close/close.json    # the Close tab's data, rewritten whole at every trace line
└── 05-close/
    ├── trace.md                  # every step as it ran, one line each, date -u
    ├── harvest/<source>.json     # what each harvester returned, verbatim
    ├── closure.md                # the final record
    ├── sweep.sh                  # only when the harness blocked a sweep command: what he runs
    └── dreaming/
        ├── ledger.md             # the board, closed with every ruling and every issue number
        └── recurrence.json       # what each checker returned, verbatim
```

Plus, outside the folder: the issues on the pipeline repo, one per
ruled lesson, labelled `dreaming`; the repos swept; the blueprint
final at the same URL.

## Step 0 — entry

Open `05-close/trace.md` from [templates/trace.md](templates/trace.md).
Find the previous workstream: the newest sibling folder under the
designs root whose `blueprint/close/close.json` exists; none ⇒ the
numbers table has one column and says so. Read `.state.md` for the
blueprint URL and the pipeline repo's `nameWithOwner` from the
consuming project's config (never guessed: `gh repo view` inside the
skills clone).

## Step 1 — the harvest

[references/harvest.md](references/harvest.md). Run
[`close-harvest`](../../workflows/close-harvest.js) with the five
sources as paths: the document stages' reviews and `rulings.md`; the
execution's traces, reports and audit; the release's plan, trace,
rows and watch; `dreaming-notes.md` and `taste-notes.md`; the previous
workstream's ledger (its `parked` entries only). Each harvester
returns the numbers its source carries, the precision per lens where
the source has a review, and every friction with where it was seen
and the quote. Save each answer to `harvest/<source>.json`. A source
whose harvester failed twice is read by the session itself, and the
trace says so.

## Step 2 — the closure and the sweep

[references/closure.md](references/closure.md). Write
`05-close/closure.md` from [templates/closure.md](templates/closure.md):
what shipped (from `release.json`'s close), what was deliberately left
out with the decision that cut it, the pendencies with owners (the
release's residue, the audit's, the sweep's), and the numbers: the
harvest's counts summed against the previous `close.json`, one line
per number that moved saying why. Then the sweep, per repo: every PR
of the demand `MERGED` or `CLOSED` (re-read); the story, row, wave,
fix and workstream branches deleted on the origin and locally; the
clone on `main`, no stray worktree; alpha at `main` with the smoke
fixtures reseeded by the repo's own command. A command the harness
refuses goes to `05-close/sweep.sh` and becomes a `delegated` sweep
line the user runs before or at the stop; a repo left in any other
state is a pendency with an owner, never a silence.

## Step 3 — the board

[references/board.md](references/board.md). For every friction the
harvest brought, the session decides: **class or incident** (a lesson
generalizes: "this bites again wherever this pattern appears"; what
does not is a suggested discard, one line of why, rescuable);
**destination** (pipeline → an issue on the pipeline repo; venture →
a pendency with an owner in the closure, never a public issue; repo →
the same); and, for a pipeline candidate, **the edit it would make**:
the file in the pipeline repo, the line or the mechanism. The `[user]`
entries lead: he dictated them knowing what he wants. Each taste note
is an entry of its own. The previous workstream's parked entries
return as entries marked so. Then
[`close-recurrence`](../../workflows/close-recurrence.js): one
close-checker per pipeline candidate reads the pipeline repo's issues
(all states) and text and answers `new`, `open #n` (same class, still
open) or `closed #n` (same class, closed — and whether the text still
carries the rule). Write `dreaming/ledger.md` from
[templates/ledger.md](templates/ledger.md), `close.json`
([schema](../../blueprint/schema/close.md)), build, republish at the
URL in `.state.md` (a `read` first; not found ⇒ a new publish and the
URL replaced, noted in the trace). Print the board's counts and the
open sweep lines as a table and end the turn.

## Step 4 — the stop

[references/gate.md](references/gate.md). He reads the Close tab.
**The session's suggestion on every entry is the default ruling**,
listed for veto: he sends in prose what he vetoes or changes ("P-3
differently: …", "discard X-5", "park U-2"), the session notes each
in a visible list, applies nothing yet, and re-prints. Only three
kinds reach him as a question through the question tool, in the
house shape: a **recurrence** (`closed #n` with the rule still in the
text: the rule did not hold, a conversation, never a silent re-open);
a **taste note** (his taste — what it becomes is his call: a
standard, a skill line, an agent line, or dropped); a **class
conflict** the session could not settle. When he says "apply", every
entry has its ruling: `issue` · `join #n` · `discard` · `park`. Each
ruling is one line in `rulings.md`, his words verbatim where he gave
them. An open sweep line at "apply" becomes a pendency with him as
owner.

## Step 5 — the issues

[references/issues.md](references/issues.md). One `gh issue create`
per `issue` ruling on the pipeline repo, the body from the repo's
`.github/ISSUE_TEMPLATE/dreaming.md`, the title
`dreaming(<stage>): <the class in one line>`, labels `dreaming`,
`stage:<stage>`, `kind:<skill|agent|workflow|blueprint|standard|house>`
(created if missing). A `join #n` is a comment on that issue: the
month it was seen again and the entry's suggestion, sanitized the
same way. **The repo is public**: the issue names the pipeline file,
the pattern and the edit in the pipeline's vocabulary, and never a
product repo, a vendor, a person, an artifact URL, a business number,
a parameter or a key; the raw evidence stays in the ledger, which is
private, and the ledger carries the issue number. The session edits
nothing in the pipeline repo, ever.

## Step 6 — done

`close.json` with its `close` and `closed`; build; republish;
`.state.md` → `stage: closed` with one line saying what is live where,
what is pending with whom and how many issues the dreaming opened.
Commit the workstream folder (push only with his explicit approval).
Then **one `PushNotification`** and the report from
[templates/report.md](templates/report.md): what is in prod, the
numbers that moved, the sweep, the board in counts, the issues with
their URLs, what stays with an owner, the blueprint URL, the commits
waiting for push. Say plainly that the workstream is done and the
repos are ready for the next demand.

## Rules

| Rule | What it means |
|---|---|
| One stop | the board is the only place the stage waits for him; before it, reading and record; after "apply", nothing asks again |
| The pipeline is not edited here | what leaves for the pipeline repo is an issue, never a commit; the pipeline changes in its own session, issue by issue, with the issue closed by that commit |
| Public repo | an issue carries the pipeline file, the pattern and the edit; never a product repo, vendor, person, artifact URL, business number, parameter or key; evidence stays in the ledger |
| Every note on the board | the ledger covers 100 % of the harvest: the `[user]` entries leading, every taste note, every ruling pattern, every lens precision, every audit departure, every stop, the previous parked entries |
| Class, not incident | the ruler for every suggestion; what does not generalize is a suggested discard, one line of why, rescuable |
| Destination triage | venture- and repo-class lessons are pendencies with an owner in the closure; never an issue on the public repo |
| Recurrence before the board | no pipeline candidate reaches him without the checker's verdict; `closed #n` with the rule still in the text is a question, never a silent re-open |
| Defaults, then veto | the session's suggestion is the default ruling; he vetoes or changes in prose; questions only for a recurrence, a taste note, a class conflict |
| The user rules | no issue, no discard, no park without his ruling; "apply" is the ruling on every entry that he did not change; every ruling is a line in `rulings.md` |
| Parked returns | a `park` ruling reappears on the next workstream's board with its recurrence checked again |
| No waiting | the close does not wait on production; a regression after it is a new demand |
| Nothing unowned | a sweep line the harness blocked and he did not run, a repo in any other state, a venture or repo lesson: each a pendency with a named owner |
| Zero silent death | every step is a trace line with `date -u`; a resumed session continues from the first line missing |

## Files

- **Permanent:** everything under `05-close/`, `blueprint/close/`,
  `rulings.md`, `.state.md`; `dreaming-notes.md` and `taste-notes.md`
  (consumed, kept: the ledger's source).
- **Nothing is deleted at the close.** The next workstream's harvest
  reads this ledger for what was parked.

## Resuming

Read `.state.md` and `05-close/trace.md`; then the files and GitHub,
never memory: which `harvest/<source>.json` exist, whether
`closure.md` is written, which sweep lines are done (re-read the
origin), whether `ledger.md` and `recurrence.json` exist, which
issues exist already (`gh issue list --label dreaming --search
"<month>"` and the numbers in the ledger). Continue from the first
step without a trace line. His rulings, once given, stand: a resumed
session does not ask for them again; an entry with a ruling and no
issue number gets its issue.

## Boundaries

No new features, no fixes, no code: what production surfaces after
the close is a new demand. The dreaming edits nothing: it opens
issues on the pipeline repo and leaves pendencies with owners
everywhere else. This is the last stage: what it does not close, it
re-homes with a named owner. A workstream never ends with unowned
loose ends.
