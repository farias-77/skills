# Permissions: what the project grants, what the guard holds

Release runs merges and deploys with nobody watching, so it rests on
three layers, outermost first:

1. **The boundary outside the session.** Branch protection on `main`
   requires the local-CI signoff (role 13). Production is deployed by
   a CI identity that trusts only `main`, or by a command the doctrine
   gives. The session's own cloud identity is read-only where the
   platform allows it (viewer roles, no secret accessor). These hold
   whatever the session runs.
2. **The settings** (`.claude/settings.json` of the project, role 12
   and role 18 of `docs/project-contract.md`):
   - **allow** rules for the commands the release plan runs: the merge
     (`gh pr merge *`), the doctrine's deploy and migration commands,
     the read-only reads;
   - **deny** rules for the irreversible classes.

   Never write a broad allow such as `Bash(gh *)`, `Bash(gcloud *)` or
   `Bash(terraform *)`. Never constrain an allow by its arguments,
   because one reordered flag escapes it. Templates:
   `/pipeline-setup` (`templates/settings.json`).
3. **The guard**: `.claude/hooks/guard-irreversible.sh`, a copy of the
   pipeline's `claude/hooks/guard-irreversible.sh`, registered on
   `PreToolUse` for `Bash|Edit|Write|MultiEdit|NotebookEdit`. Rules
   match command prefixes, so they are not a boundary on their own.
   The hook reads the whole command (`bash -c '…'`, a full path, a
   chain) and decides before the rules, in every permission mode. It
   fails closed: input it cannot read blocks.

Why the guard matters for an autonomous release: an allow rule on
`gh pr merge *` also skips the harness's own check of "merging a pull
request no human approved". The guard restores that check with the
user's play.

## What the guard decides

| Decision | Commands |
|---|---|
| **deny** | destroying infrastructure; state surgery; deleting data, databases, buckets, namespaces, persistent volumes; down or reset migrations; force-push, a `+` refspec, pushing a deletion, `--mirror`, `--all`; pushing straight to a protected branch; `--admin` merges; merging through the API; posting a commit status by hand (it would forge the signoff); deleting a repo, a release or a tag; writing the guard, its allow file or the settings |
| **ask** | writing or reading a secret's value; a merge into a protected branch whose head the play did not authorize, or that the guard cannot resolve |
| **none** | everything else, and the rules decide |

Protected branches: `main`, `master`, `production`, `prod`, the
repo's default branch, plus `protected <branch>` lines.

## The allow file and the play

`.claude/hooks/irreversible.allow` is his. The guard denies any agent
write to it, and the settings deny `Edit`/`Write` on `.claude/hooks/**`.
He writes it with a `!` command or from his own terminal. These are
the lines it can hold:

| Line | Effect |
|---|---|
| `merge-from <sha>` | a merge into a protected branch passes when the PR's head **is or descends from** this sha |
| `merge-head <sha>` | a merge passes when the PR's head **is** this sha |
| `<a command, verbatim>` | that exact command passes, whitespace collapsed |
| `protected <branch>` | one more protected branch |
| `default-branch <branch>` | the default branch, without asking GitHub |

**The play writes `merge-from <audited head>`.** It authorizes the
head stage 4 left and every head that descends from it: the release's
`R.n` fixes and a hotfix. Each of those passed the stage-4 pipeline
and the local-CI signoff before it reaches the merge. A strict project
writes `merge-head <audited head>`. Then every fix after the first
merge asks him, which costs him a stop per staging red.

The session always merges with `--match-head-commit <head>`. That way
the head the guard checked is the head GitHub merges, even if a push
lands between the check and the merge.

An environment alternative: `GUARD_AUTHORIZED_HEAD=<sha>` set when he
launches the session. The agent's shell cannot change the hook's
environment.

**Hygiene.** Verbatim lines are one-time approvals. The close's sweep
lists every line older than the workstream, with the command that
removes it. He runs it. Nobody else edits the file.

## The checks at step 0

These are all read-only, and all of them are allowed by the guard:

```
cat .claude/settings.json                         # the hook is registered on PreToolUse, the allow rules the plan needs exist
.claude/hooks/guard-irreversible.sh --self-test   # every sample decides as expected
cat .claude/hooks/irreversible.allow              # after the play: the merge-from line names the audited head
gh api repos/{owner}/{repo}/branches/main/protection --jq '.required_status_checks.contexts'   # the signoff context is required
```

What a gap costs:

| Gap | What happens |
|---|---|
| No guard, or its self-test fails | the release halts before the plan; he installs it with `/pipeline-setup` |
| A step's command is under **ask** | the step prompts him; the pre-flight message lists which steps will |
| No signoff requirement on `main` | the merge waits for the hosted required checks; the report says the signoff was not enforced |
| The session's identity can write production outside the CI | the report says so, once, as a risk for the close |

## Testing the guard

The pipeline's test is
`bash claude/hooks/tests/guard-irreversible.test.sh`. It pipes sample
calls as JSON on stdin, with a stubbed `gh` and a throwaway git repo,
and compares each decision. A project that adds its own deny lines (a
script that wipes an environment, a production database name) adds a
case there too.
