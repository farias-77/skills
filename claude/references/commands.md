# Commands

Every agent that runs Bash carries this sentence, verbatim;
`scripts/check-models.mjs` fails an agent without it:

**Commands:** one command per Bash call, run bare: no `cd <dir> &&`, no `VAR=value` or `X=…;` in front, no `;` or `&&` chain, no pipe into `tail`, `head`, `grep` or `sed`, no `${…}`; name a folder with the tool's own flag (`git -C`, `make -C`, `go -C`, `pnpm --dir`, `npm --prefix`), write and change files with Write and Edit (never a heredoc, `sed -i` or a script), read them with Read, Grep and Glob, so the allow list matches every command you run; a file a command writes goes under the evidence or scratch folder you were given, never `/tmp` (`claude/references/commands.md`).

Why: in print mode and in every subagent nobody can answer a permission
prompt (a frontmatter `Bash(…)` grants nothing there), so a command the
allow list does not match is denied, and a compound command matches
only when every part does. The allow list
(`pipeline-setup/templates/settings.json`) carries each command the
agents run, in its bare form and its `-C <worktree>` form; the guard
hook, not the list, is the boundary.
