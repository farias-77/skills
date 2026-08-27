# Pipeline house rules

Rules that cross every stage. Stage skills point here instead of
repeating them; a consuming project loads these rules alongside the
skills.

## Stage transitions: `/clear`, never `/compact`

When a stage closes and the next one begins, suggest the user runs
**`/clear`** — not `/compact`. Everything the next stage needs lives in
the files by contract (`.state.md`, the wave's stage folders, the
blueprint); a generated summary is session memory smuggled past the
source, and it can contradict the files later. If a stage suffers after
a clear, the bug is a missing file in the previous stage — fix the
file, not the context. Re-entry is always by workstream slug: the stage
skill resumes from `.state.md`.

## "Note this for the dreaming"

At any stage, when the user says to note something for the dreaming
("anote no dreaming note", or words to that effect), append it to the
workstream's `dreaming-notes.md` on the spot, marked **`[user]`** —
his words as close to verbatim as the entry allows, plus what he
already wants changed when he says it. These entries are first-class
input to stage 6: he wrote them knowing what he wants, so the
dreaming session confirms the edit instead of debating the class.
This is separate from the standing rule that every stage notes its
own frictions as they happen — both feed the same file.

## The blueprint speaks the user's language

The blueprint is written in the language the user talks to you in —
the `BLUEPRINT` data object, and the shell's own words too. The shell
ships in English; when the conversation runs in another language,
translate its visible strings (tab labels, section titles, subtitles,
ledes, kickers, empty-state lines) to that language in the workstream's
copy. That is the only edit the shell admits: translate the words,
never touch structure, keys, CSS, or render logic — the identical shell
across workstreams is what lets the reader find everything without
searching. Discovery does the translation once, when it creates the
file; every later stage writes its data in the same language. One
language on the page, the reader's.

## The blueprint is the report; the files are the record

The stage documents (`*.md` under the workstream) are written for the
machine: as complete and exact as the next stage needs — every entity,
every query, every alarm, every class of the sweep. **The blueprint is
not their projection.** It is the team reporting to a technical lead
who wants to understand how the thing works and what matters, in
twenty minutes, not three hours. Same tabs, same shell; another
altitude.

- **The test for a detail:** it enters the blueprint if the reader
  would decide something differently knowing it. Otherwise it stays in
  the file — and the file is named as the authority ("the exact numbers
  live in `data-model.md`"), so nobody reads the blueprint as source.
- **The intro of every tab is the report.** Read only the opening
  paragraph and you know what this is, how it is organized, what it
  costs. Then, up front: *what needs your eye here* — the decisions
  taken in the user's place, the tradeoffs assumed, the numbers that
  encode a business rule. The rest is there to be trusted, and says so.
- **Decisions taken in the user's place never leave.** They only
  shrink: the question, the options in one line each, the pick, why —
  three sentences.
- **Lists are curated, never complete.** The entities that explain the
  model, not all of them; the alarms that would wake someone; the
  sweep's verdict and what it found, not the class-by-class checklist;
  the resources that explain the bill. Group what is one idea ("the two
  snapshots", "the content rows"). The counts in section titles count
  what is shown, not what exists.
- **Plain technical language.** "Takes a lock so two cycles never run
  together", not "conditional put on the lock item keyed by run_id".
  Technical names only when they are the name of the thing. Per
  mechanism, three short paragraphs at most: *what happens · when it
  goes wrong · worth a look* — the last one is the review hook.
- **Machine provenance stays out:** reference lists to research files,
  line-by-line JSON comments, projection expressions, per-round
  history. Diagrams earn their place when they replace prose — the
  whole cycle in one picture, yes; one per mechanism, no.
- **Ceiling:** a wave's Design tab reads in 20–30 minutes — roughly
  6–8 thousand words across its nine subtabs; a subtab in two or three.
  Plan and Execution tabs hold the same altitude.

Discovery is the exception: the PR-FAQ and the stories are the demand
itself, and the user approves them there — shown whole.
