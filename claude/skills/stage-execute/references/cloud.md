# Entries in cloud sessions

When the project has a cloud environment for entries, every entry runs
in its own Claude Code cloud session: C, the entries, E-int, the X.n
fixes. This machine keeps the tech lead, the queue, local CI and his
hands-on. Local runs are the fallback, entry by entry.

A cloud session builds and checks one entry and pushes it. It never
merges, never posts a status, never opens a pull request. The one
exception is the whole gate, below.

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
├── input/args.json        the exec-entry args; paths as {repo}/… and {evidence}/…; no loadThreshold;
│                          inlineAgents: true, agentsDir and referencesDir under {evidence}/input/pipeline/;
│                          heartbeat: HEARTBEAT_PUSH=1 bash {evidence}/input/pipeline/skills/stage-execute/scripts/heartbeat.sh {evidence}
├── input/brief.md · design/ · discovery/ (the entry's mock frames only) · rulings.md
├── input/pipeline/        this pipeline at the session's version: workflows/, agents/, references/, skills/stage-execute/
├── beats.jsonl            one line per agent start and end (heartbeat.sh)
├── run-<n>.json           the workflow's return
└── notes.md, screenshots, logs/
```

Before any push to the cloud: `gitleaks` over the inputs; a finding
stops the send.

If the project's smoke shows a session on `story/*` cannot push
`evidence/*`, the evidence goes out inside the entry branch, under
`.evidence/<id>/`, and the tech lead removes it before the merge.

## The run prompt

```
claude --cloud --output-format json "$(cat <<'EOF'
You run one stage-4 entry alone; nobody will answer a question.
Entry <id>, workstream <slug>, run <n>.
1. git fetch origin feat/<slug>:feat/<slug> evidence/<slug>/<id>:evidence/<slug>/<id>
   (first `git fetch --unshallow` if the clone is shallow)
   git worktree add ../evidence-<id> evidence/<slug>/<id>
2. Read ../evidence-<id>/input/args.json; replace {repo} with this repository's path and
   {evidence} with ../evidence-<id>'s path.
3. Run the Workflow tool with scriptPath
   ../evidence-<id>/input/pipeline/workflows/exec-entry-workflow.js and those args.
4. Write the workflow's return, verbatim, to ../evidence-<id>/run-<n>.json
   (if it could not start: {"status":"interrupted","reason":"<one line>"}).
5. git push origin <the entry branch>; then git -C ../evidence-<id> add -A, commit, and
   git -C ../evidence-<id> push origin evidence/<slug>/<id>.
Never merge, never push another branch, never open a pull request, never post a status. Then stop.
EOF
)"
```

Record its `session_id` and `url` on the board, `cloud · <session id> · <url> · run <n>`,
and the url next to the entry in the PR body. The JSON is documented for
follow-ups; if the launch prints text, its `Session ID:` and `View:` lines
give the same, and every commit's `Claude-Session` trailer carries the url.

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

## Follow-up, then relaunch

A stalled or dead session first gets a follow-up queued into it:
`claude -p "<what the beats show; resume the entry>" --cloud <session id> --output-format json`.
Reopening restores the conversation on a fresh VM (background work is
lost). Only if the send fails (`ok: false`) or no beat follows within
the agent's ceiling is it relaunched, **always on a new
branch**, `story/<slug>/<id>-r2`, from the last pushed commit, with
`mode: 'resume'` and `check: 'whole'`: two sessions never write the
same branch. Once more in the cloud; a second failure runs it here,
locally, and the board and `dreaming-notes.md` say why.

## The whole gate in the cloud

When the project's cloud environment holds the bot's token as `GH_TOKEN`
and its smoke showed a VM holds the whole gate, the whole gate on the final
head runs in the cloud too: a dedicated cloud session (or a follow-up
into a finished entry's session) whose prompt is only "run `<the signoff
command> <sha>` in the background, wait for it, push nothing, then
stop". The signoff command reads the token from inside and posts the
status as the bot; the guard denies any other read of the token. The
tech lead never watches that session: it reads the status posted on the
sha (the PR's checks), and a red, or no status within 90 minutes, runs
the gate here, on this machine. Without that environment, the gate
always runs here.

## Rate limits

Cloud sessions share the account's limits with this session. An
`interrupted` with a limit in its reason: wait for the reset the
message names (or 30 minutes), then resume. No pre-set cap on how many
run at once.

## Facts to rely on

- `claude --cloud "<task>"` clones the GitHub remote at the current
  branch: push first.
- This session can message a cloud session (`claude -p "…" --cloud <session id>`
  queues a follow-up); a cloud session cannot message back: git is its channel.
- A print-mode session that runs tools here (`claude -p` without
  `--cloud`) needs `--settings .claude/settings.json` (it ignores an
  untrusted workspace's allow entries), `--add-dir` for the designs root
  and the kit, and `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0` (it kills
  background work 10 minutes after the last turn: an entry's workflow
  dies mid-build).
- Each VM: about 4 vCPUs, 16 GB, Docker; browsers come from the setup
  script.
- Committed `.claude/` (settings, hooks) loads in a one-repo session;
  user-level `~/.claude` does not.
- Foreground commands time out after 2 minutes by default (10 at most)
  and then keep running in the background for up to 30 more; the
  environment's `BASH_*_TIMEOUT_MS` variables raise both.
- An idle VM pauses and loses its background processes; the heartbeat
  is how a pause is noticed.
