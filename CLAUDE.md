# Pipeline house rules

Rules that cross every stage. Every stage skill (and `lets-cook`)
reads this file at its opening, at `<kit>/../CLAUDE.md`, instead of
repeating it; a consuming project does not import it. Paths: `claude/…`
is the kit (`realpath ${CLAUDE_SKILL_DIR}/../..`, written as `kit:` in
`.state.md`); `docs/…` sits beside it in the pipeline repo;
`<designs-root>` is the folder named by the line `designs-root: <path>`
in the project's own `CLAUDE.md`, in git, for the workstreams' folders and
`_coordination.md`. A relative path resolves from the project's main
checkout, so a worktree resolves it the same as the checkout:
`dirname "$(git rev-parse --path-format=absolute --git-common-dir)"`;
an absolute one stands as written. Never a folder named by a
`CLAUDE.md` in a parent directory. A workflow runs by `scriptPath`;
when the Workflow tool refuses the kit's path, pass the file's whole
content as `script` (same `args`).

## One door, six stages, what each asks of him

Every demand enters by **`/lets-cook <idea>`**: a light interview,
then the session picks the route (full, short, hotfix) and says why in
one line. The full route is six stages. He is asked only what is his.

| Stage | How it runs | Where he is in the loop |
|---|---|---|
| 1 discovery | a conversation, no `/goal` | he talks while a live mock is built beside the chat; he confirms the stories one by one at the playback |
| 2 design | one `/goal` | he debates the one proposal (deck first, then a ≤60 s video) until he says "closed"; rarely, a question that changes a locked AC, adds a recurring cost or cannot be undone |
| 3 plan | one `/goal` | nothing; the close lists what was decided in his place for his veto |
| 4 execute | one `/goal` | the pre-flight items only he can run; his hands-on with the running app, each answer an `A.n` round, until his "ok" |
| 5 release | his authorization line + one `/goal` | only the stop list (an irreversible step the `/goal` does not name, a new production deploy after a rollback, a second red) |
| 6 close | one `/goal` | nothing; he forwards the users' video and the "what's new" text |

## Every stage opens and closes the same way

**Open.** (1) **The canary**: `git push origin a:b`, run alone (no
`cd`, nothing chained), must come back denied by the guard with a
reason containing `guard-canary`; anything
else and the stage does not open. (2) **The designs root**: no
`designs-root:` line in the project's `CLAUDE.md` → write nothing
anywhere; stop and propose exactly `designs-root: ../designs` for the
project's `CLAUDE.md`. (3) The
stage's `/goal`, filled in, in one code block for him to paste
(discovery, a conversation, has none).

**Close.** The stage's report is finished and published first (below).
Then one message: the link, what the stage produced in one table, what
was decided in his place, and the next play:

```
/clear
/stage-<next> <slug>
```

Never `/compact`: everything the next stage needs lives in the files
(`.state.md`, the stage folders). A stage that suffers after a clear
has a missing file in the stage before it; fix the file. No stage
starts the next one: nothing runs until he types the play. Re-entry is
always by slug; the stage resumes from its files, never from memory.

## Under a `/goal`, the stage runs on its own

Inside a `/goal` nothing waits for him but what is his. These are not
reasons to stop: a finished step, a summary and the next step
announced, an offer to wait, a list of decisions he could take, a
milestone. A status note or a recommendation goes in the same message
as the next tool call; carry on with whatever does not depend on his
answer. An offer to wait that you notice in a draft is deleted, and
the next thing is done. Stop only for a question that is his (through
the question tool), a background agent you wait on (end the turn on a
status table: agent · task · state; it wakes you), or the goal's
"done". Time matters here: do not spend time that can be avoided, and
the earlier a correct result is obtained, the better. The factory runs
through the night on its own: keep the machine awake while work is in
flight. On a rate limit, wait for the reset and retry; an entry
interrupted a third time parks with the reason, and the rest goes on.
There is no fixed cap on parallel work.

## "Note this for the dreaming"

When he says to note something for the dreaming (or words to that
effect), append it to the workstream's `dreaming-notes.md` on the spot,
marked **`[user]`**: his words as close to verbatim as the entry
allows, plus what he already wants changed. A pattern in his rulings
(he keeps choosing against the recommendation on one kind of decision)
is a line there too, marked **`[taste]`**. Every stage also notes its
own frictions as they happen. The close's retro and the weekly retro
read this file, `[user]` lines first.

## Every agent is named with its model and effort

In every skill, table, README and message that names an agent, the
name carries the model and the effort in parentheses:
`story-writer (Sonnet 5.5, high)`, `the conductor (Opus 5.5, high)`.
Opus 5.5 and Sonnet 5.5 are used, and Haiku 5.5 where the table says;
every main session runs on Opus 5.5, high; subagents are mostly Sonnet
5.5, never above high. The one table, with the evidence for each pick, is
[docs/models.md](docs/models.md); `node scripts/check-models.mjs`
fails when a frontmatter, a workflow or the table disagree.

## The session never reads to look something up; it sends a scout

A stage's session is an expensive model in a long conversation: a file
it opens is paid again on every turn after. **When it needs something
it has not read** (what a document says, what a repo has, what a
standard requires, what a past workstream recorded), **it dispatches
`scout (Haiku 5.5, medium)`**, which quotes the literal lines with
`path:line`, says where it looked and what it did not find, and writes
its answer to the file the session names (`recon/<topic>.md`). The
session opens a file itself only when it is about to rule on it, when
it is writing it, or when he asked for it.

## How a question is asked

Every question goes through the question tool, in one shape. The
question text carries the context (what this is about, the quote, the
gap, why it matters) and asks one thing. Each option's label is the
answer in his words; its description is what that answer costs and
buys, checked before the question is asked (a scout when the code
holds it): an option that implies a migration, a recurring cost or an
irreversible change says so in its description. Your pick comes first
and says so. One question per decision; four questions to a call, at
most. Never a board he answers in prose.

## Every reply is built for a reader who skims

The `i-wont-read-all-this` style holds in every reply: the next action
first; a table for parallel things (agents, options, findings), a flow
in a code block for a sequence, short topics for a list; one decision
per prose message (the question tool may carry up to four); no
preamble, no recap. A paragraph only for the one
argument that is prose. He likes to see things: diagrams, flows and
animations over text.

## The rulings are the record

Every review is one round, ruled by
[`claude/references/judging.md`](claude/references/judging.md): the
scale (`blocks` · `note`), the owners per stage, and the one rule that
turns his class into a conservative decision of yours. Only a locked
AC changed, a new recurring cost, or something irreversible becomes a
question to him. Every ruling, his or yours, is one line of the
workstream's **`rulings.md`**:

```
2026-10-05 · design D6 · design-security#S-2 · conductor: conservative · ruled: conductor · "keeps the lock, reversible"
```

Date · stage and step (or the entry at execute) · the finding id ·
what the conductor proposed · what was ruled (`ruled: conductor` when
you ruled in his place) · the reason, his verbatim where he gave one.
The stage's `reviews.md` keeps the detail; `rulings.md` and
`dreaming-notes.md` are what the retros read first.

## One link per workstream, finished before the stage closes

Each workstream has **one report link**: a rail of stages, each with three
tabs, **Video · Deck · Explainer** (the short route's exceptions are in
[docs/stage-report.md](docs/stage-report.md)). The page is the fixed shell
`claude/report/shell.html` plus `report.json`; the tabs are built by
`video-builder (Sonnet 5.5, high)`, `slides-builder` and
`artifact-builder` (both Sonnet 5.5, medium), or an Explainer filled from a template where the stage's
data is a graph or a timeline. **A stage closes only when its three
tabs are published**: he validates through them. Before each publish,
`gitleaks dir <workstream>` must be clean (where gitleaks is not on
PATH, `make gitleaks dir=<workstream>`, here and in every stage). The
page stays private; anything published outside the company needs his
approval. The procedure is [docs/stage-report.md](docs/stage-report.md).

The stage files (`*.md` under the workstream) are written for the machine,
complete and exact, in his language (his words verbatim; ids, keywords
and headings as the templates have them); the `language` a writer's
brief names is that language. The report is for a person: a picture first, short
sentences, only what would change a decision, and the file named as
the authority for the rest. The report and every other artifact are in
simplified English, with the exceptions it lists, by
[`claude/references/artifact-writing.md`](claude/references/artifact-writing.md);
the chat with him stays in his language.

## Workstreams coordinate by talking

Several workstreams run at once. Each workstream's line in `_coordination.md`
names its stage, branch and session; sessions agree by `SendMessage`
(release order, a shared file, a migration, a hotfix's priority) and
write the outcome in one line. A peer silent for 15 minutes: proceed
on the conservative choice and note it. One workstream at a time holds his
attention in a discovery or a design debate; the rest runs in
parallel.

## The CI is local

The whole gate runs on our own compute (this machine or a cloud
session VM), never on a hosted queue. The project names its **signoff
command** in its `CLAUDE.md` (the bar's role 6; `claude/scripts/local-ci.sh`
is the fallback): it runs the whole gate in a clean worktree and,
only on exit 0 and under the bot identity, posts the **`local-ci`**
commit status `main` requires. No agent posts a status or reads the
bot's token; the guard denies both. Hosted CI keeps the deploys and
the environments.

## One guard for what cannot be undone

`claude/hooks/guard-irreversible.sh` is the only guard; `/pipeline-setup`
installs it with `authorize.sh` behind a fail-closed wrapper on Bash
and every file tool. It denies the irreversible (destroying
infrastructure, deleting data, force-push, a forged status, switching
identity, edits to itself or the settings) and any merge into a
protected branch or `v*` tag that no live **authorization line**
covers. Only he writes that line, as a `!` command:
`! .claude/hooks/authorize.sh <release|short|hotfix|legacy> <slug> <branch>[@<sha>]` (legacy: `<repo>` in place of `<slug>`),
or `! .claude/hooks/authorize.sh tag <slug> main@<sha>` for a release with no workstream (one tag on that commit, no merge).
It dies at its tag or in 3 days. The line lands in `irreversible.allow` beside the script, the file the guard beside it reads.

## Every stage measures itself, by script

Nothing is recorded by hand. `node claude/scripts/telemetry.mjs <slug>`
reads the transcripts and the entries' `run-*.json`, and writes the workstream's `metrics.json` (time, cost as an estimate, his
touches per stage); a value it cannot measure is `null` with a line in
`gaps`. The retro and the weekly retro use those numbers.

## Writing skills, agents and workflows

- **Prompts** follow the Opus 5.5 and Sonnet 5.5 prompting guides
  (platform.claude.com, prompt engineering): effort sets the thinking,
  so no "think carefully" lines; name the early stops you do not want;
  give Sonnet a scope line ("when the work is done and checked, stop
  and report; add nothing that was not asked") and a real check before
  it reports done.
- **Every skill folder has its own `README.md`**: what it does, how to
  install only it, its files. Knowledge lives in the skill's
  `references/`; there are no knowledge-pack skills.
- **Workflows** are plain JavaScript files named `<name>-workflow.js`
  under `claude/workflows/`: small named functions, sections that match
  the phases, comments only for why. Each has a dry run under
  `scripts/`.
- **This repo is public:** generic English, no company, product or
  person's name.
- Literal sentences, one idea each, concrete values. Prefer removing to
  adding.
