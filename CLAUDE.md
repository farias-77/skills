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
