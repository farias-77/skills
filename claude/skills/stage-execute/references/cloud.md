# Entries in cloud sessions

When the project has a cloud environment for entries, every entry runs
in its own Claude Code cloud session: C, the entries, E-int, the X.n
fixes. So do the queue's gates and the whole gate (below). This machine
runs no gate: it keeps the tech lead, moves `feat` to heads a VM
already checked, posts the status from a VM's record, and brings the
stack up only for his hands-on. Local runs are the fallback, entry by
entry, with the reason on the board and in `dreaming-notes.md`.

A cloud session never merges into `feat` or `main`, never posts a
status, never opens a pull request.

```
this session (tech lead)                         cloud session (one per entry)
  push story/<slug>/<id> from feat ─────────────►  the VM clones the launch checkout's branch, checks out the entry's
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
├── run-<n>.json           the workflow's return (run-<n>.args.json the resolved args, run-<n>.log the nested run)
└── notes.md, screenshots, logs/
```

Before any push to the cloud: `gitleaks` over the inputs; a finding
stops the send.

If the project's smoke shows a session on `story/*` cannot push
`evidence/*`, the evidence goes out inside the entry branch, under
`.evidence/<id>/`, and the tech lead removes it before the merge.

## The run prompt

```
You run one stage-4 entry alone; nobody will answer a question.
Entry <id>, workstream <slug>, run <n>.
1. First `git fetch --unshallow` if the clone is shallow. Then
   git fetch origin story/<slug>/<id> feat/<slug> evidence/<slug>/<id>
   git checkout -B story/<slug>/<id> origin/story/<slug>/<id>
   git branch -f feat/<slug> origin/feat/<slug>
   git branch -f evidence/<slug>/<id> origin/evidence/<slug>/<id>
   git worktree add ../evidence-<id> evidence/<slug>/<id>
2. Write ../evidence-<id>/run-<n>.args.json: ../evidence-<id>/input/args.json with {repo} replaced by
   this repository's absolute path and {evidence} by ../evidence-<id>'s absolute path.
   Wait until the session hook's stack is up.
3. Start this in the background and wait for it to exit (up to 4 hours; never end your turn while
   it runs):
   bash ../evidence-<id>/input/pipeline/skills/stage-execute/scripts/run-workflow.sh "$PWD" \
     ../evidence-<id>/input/pipeline/workflows/exec-entry-workflow.js \
     ../evidence-<id>/run-<n>.args.json ../evidence-<id>/run-<n>.json
   It writes the workflow's return to run-<n>.json, or an interrupted return with the reason.
4. git push origin story/<slug>/<id>; then git -C ../evidence-<id> add -A, commit, and
   git -C ../evidence-<id> push origin evidence/<slug>/<id>.
Never merge, never push another branch, never open a pull request, never post a status. Then stop.
```

**Launching.** From the project's main checkout, on `main`, pulled
(the folder must be trusted, and the VM clones its branch):
`claude --cloud "$(cat <prompt file>)"`, run under `script -q -c
<launcher> <log>` because it needs a terminal. The prompt always comes
from a file: inline, a backtick runs here. The session id and url are
in the log's `View:` line.

Record its session id and url on the board, `cloud · <session id> · <url> · run <n>`,
and the url next to the entry in the PR body; every commit's
`Claude-Session` trailer carries the url too.

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

## The queue in the cloud

The queue's steps 1 to 3 (base in, restamp, the affected gate) run in a
**queue session**; this machine only merges a head a VM checked. When
an entry's head already contains `feat` and is the head of its green
gate, nothing runs: the tech lead merges it at once (queue.md, step 1).

```
this session (tech lead)                         queue session (one per step)
  claude --cloud "<queue prompt>" ──────────────►  checkout the branch, merge the base in (--no-ff)
                                                   restamp when a migration is older than feat's newest
                                                   the affected gate against feat/<slug>
  the watcher wakes on the record ◄────────────────  push the branch, then queue-<n>.json
  green, feat unchanged → git merge --no-ff <head> into feat, push   (the merged tree is the checked tree)
  feat moved meanwhile → one more queue step · red → exec-entry resume (cloud) · conflict → below
```

```
You run one merge-queue step alone; nobody will answer a question.
Workstream <slug>, branch <branch>, base <base>, step <n>.
1. First `git fetch --unshallow` if the clone is shallow. Then
   git fetch origin <branch> feat/<slug> <base>; git checkout -B <branch> origin/<branch>;
   git fetch origin evidence/<slug>/queue and git worktree add ../evidence-queue on it
   (when that branch does not exist yet: git worktree add --orphan -b evidence/<slug>/queue ../evidence-queue).
2. git merge --no-ff origin/<base>. On a conflict: git merge --abort; the status is "conflict",
   with the conflicted paths; go to step 5.
3. When one of the branch's migrations is older than the newest on origin/feat/<slug>:
   <the restamp command>, committed alone as "restamp".
4. Wait until the session hook's stack is up; run <the affected gate> base=origin/feat/<slug>.
5. git push origin <branch>. Write ../evidence-queue/queue-<n>.json:
   {"status":"green"|"red"|"conflict","head":"<HEAD sha>","base":"<origin/<base> sha>",
    "feat":"<origin/feat/<slug> sha>","files":[...],"lines":"<the gate's last 40 lines on red>"}
   git -C ../evidence-queue add -A, commit, push origin evidence/<slug>/queue.
Never merge into feat/<slug> or main, never push another branch, never post a status. Then stop.
```

- **An entry whose base moved**: `<branch>` is `story/<slug>/<id>`,
  `<base>` is `feat/<slug>`.
- **`main` moved** (another workstream, a hotfix): the tech lead
  creates `story/<slug>/main-<n>` at `feat/<slug>` and pushes it;
  `<branch>` is that branch and `<base>` is `main`. On green it
  fast-forwards `feat` to the record's head (`git merge --ff-only`) and
  pushes it. The `story/` prefix is what the project's settings already
  let a VM push.
- **On green**, the tech lead checks that `feat` is still the record's
  `feat` (`git merge-base --is-ancestor origin/feat/<slug> <head>`),
  then merges. Otherwise one more queue step runs on the new `feat`.
- **A conflict** is the queue's (queue.md, step 1): `exec-entry
  update` in a cloud session for a text conflict; the base's version
  and the generator for a generated file.
- Queue steps for different entries may run at once; merges into
  `feat` stay one at a time, the critical path first.

## The whole gate in the cloud

The whole gate on the final head runs in a **signoff session**; this
machine only posts the status from its record.

```
You run the whole gate once, alone; nobody will answer a question.
1. First `git fetch --unshallow` if the clone is shallow. Then git fetch origin <branch>;
   git checkout --detach <sha>.
2. Wait until the session hook's stack is up. mkdir -p /tmp/signoff. Start in the background and
   wait for it to exit (20 to 60 minutes):
   <the signoff command> --dry-run --record /tmp/signoff <sha> > /tmp/signoff/run.log 2>&1
   Its exit code is the result: never rerun it, never fix anything.
3. git worktree add --orphan -b evidence/<slug>/signoff-<n> ../evidence-signoff;
   cp -r /tmp/signoff/. ../evidence-signoff/; git -C ../evidence-signoff add -A, commit,
   push origin evidence/<slug>/signoff-<n>.
Never merge, never push another branch, never post a status. Then stop.
```

The watcher wakes on `evidence/<slug>/signoff-<n>`; then, here:

```
<the signoff command> --post-from evidence/<slug>/signoff-<n> <sha>
```

It runs nothing and posts `local-ci` only when the record names that
sha, the whole gate and exit 0; the status's description carries the
host and the record's `<branch>@<commit>`, where the logs are. A red
record is an `X.n` (queue.md). No record within 90 minutes relaunches
the session once; a second failure runs the gate here, with the reason
on the board and in `dreaming-notes.md`. A record is never edited: a
new run is a new `signoff-<n>`.

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
- The cloud session itself asks him to approve every Workflow launch,
  whatever the allow rules say. A nested print-mode Claude Code inside
  the VM is signed in, applies the `Workflow` allow rule and never asks:
  `scripts/run-workflow.sh` starts the workflow that way, in auto mode.
  The VM's workspace is untrusted, so print mode ignores the project's
  allow rules (in acceptEdits an agent's plain `git rev-parse` was
  denied); auto mode lets the classifier decide, and the project's
  deny rules still apply inside the nested session.
- A VM cannot post a commit status as the bot: the cloud's GitHub proxy
  signs every call as the account connected to claude.ai, whatever
  token the VM holds. Hence `--record` there and `--post-from` here.
- Foreground commands time out after 2 minutes by default (10 at most)
  and then keep running in the background for up to 30 more; the
  environment's `BASH_*_TIMEOUT_MS` variables raise both.
- An idle VM pauses and loses its background processes; the heartbeat
  is how a pause is noticed.
