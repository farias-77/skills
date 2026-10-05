# Entries in cloud sessions

When the project has a cloud environment for entries, every entry runs
in its own Claude Code cloud session: C, the entries, E-int, the X.n
fixes. This machine keeps the tech lead, the queue, local CI and his
hands-on. Local runs are the fallback, entry by entry.

A cloud session builds and checks one entry and pushes it. It never
merges, never posts a status, never opens a pull request.

```
this session (tech lead)                         cloud session (one per entry)
  push story/<slug>/<id> from feat ─────────────►  the VM clones the repo at that branch
  push evidence/<slug>/<id> with input/ ────────►  setup script (warm snapshot), stack up
  claude --cloud "<run prompt>" ────────────────►  fetch the base and the evidence branch
  the watcher: git ls-remote, no model turns       each agent: a beat at start (with its ceiling) and at end
  wake on a push ◄─────────────────────────────────  push story/…, run-<n>.json, notes, screenshots
  copy the evidence, read the return, the queue (here)
```

## What travels

Everything the run reads goes on the entry's **evidence branch**, an
orphan branch of the product repo; nothing of the workstream enters the
product's history.

```
evidence/<slug>/<id>
├── input/args.json        the exec-entry args; paths as {repo}/… and {evidence}/…; no loadThreshold
├── input/brief.md · design/ · discovery/ (the entry's mock frames only) · rulings.md
├── input/pipeline/        this pipeline at the session's version: workflows/, agents/, skills/stage-execute/
├── beats.jsonl            one line per agent start and end (heartbeat.sh)
├── run-<n>.json           the workflow's return
└── notes.md, screenshots, logs/
```

Before any push to the cloud: `gitleaks` over the inputs; a finding
stops the send.

## The run prompt

```
claude --cloud "$(cat <<'EOF'
You run one stage-4 entry alone; nobody will answer a question.
Entry <id>, front <slug>, run <n>.
1. git fetch origin feat/<slug>:feat/<slug> evidence/<slug>/<id>:evidence/<slug>/<id>
   (first `git fetch --unshallow` if the clone is shallow)
   git worktree add ../evidence evidence/<slug>/<id>
2. Read ../evidence/input/args.json; replace {repo} with this repository's path and
   {evidence} with ../evidence's path.
3. export HEARTBEAT_PUSH=1. Run the Workflow tool with scriptPath
   ../evidence/input/pipeline/workflows/exec-entry-workflow.js and those args.
4. Write the workflow's return, verbatim, to ../evidence/run-<n>.json
   (if it could not start: {"status":"interrupted","reason":"<one line>"}).
5. git push origin <the entry branch>; then in ../evidence commit everything and push.
Never merge, never push another branch, never open a pull request, never post a status. Then stop.
EOF
)"
```

Record on the board: `cloud · <session id> · <url> · run <n>`.

## The watcher and the heartbeat

```
bash ${CLAUDE_SKILL_DIR}/scripts/cloud-watch.sh origin 'refs/heads/evidence/<slug>/*' \
  <slug>/03-execution/cloud-refs.txt <deadline epoch>
```

One `git ls-remote` a minute for every entry in flight; it exits when a
ref moves or at the deadline. Run it in the background; its exit wakes
the session. One watcher at a time.

Each agent pushes a beat when it starts, with its ceiling (builders 120
minutes, every other agent 30), and when it ends. The deadline is the
nearest "last beat + its ceiling" over the entries in flight; an entry's
whole run has a ceiling of 240 minutes.

| The tip shows | The tech lead |
|---|---|
| a new beat | the agent is alive; move the deadline |
| `run-<n>.json` | copy the evidence into `03-execution/entries/<id>/`, fetch the entry branch, act on the return |
| nothing past the deadline | dead: relaunch |

## Relaunch

A dead or failed-to-start session is relaunched **always on a new
branch**, `story/<slug>/<id>-r2`, from the last pushed commit, with
`mode: 'resume'` and `check: 'whole'`: two sessions never write the
same branch. Once more in the cloud; a second failure runs it here,
locally, and the board and `dreaming-notes.md` say why.

## Rate limits

Cloud sessions share the account's limits with this session. An
`interrupted` with a limit in its reason: wait for the reset the
message names (or 30 minutes), then resume. No pre-set cap on how many
run at once.

## Facts to rely on

- `claude --cloud "<task>"` clones the GitHub remote at the current
  branch: push first.
- A cloud session cannot message back: git is its channel.
- Each VM: about 4 vCPUs, 16 GB, Docker; browsers come from the setup
  script.
- Committed `.claude/` (settings, hooks) loads in a one-repo session;
  user-level `~/.claude` does not.
- Foreground commands get up to 10 minutes; longer ones run in the
  background with their exit code in a file.
- An idle VM pauses and loses its background processes; the heartbeat
  is how a pause is noticed.
