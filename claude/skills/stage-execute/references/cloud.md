# Entries in cloud sessions — the default when the project has a cloud environment

When the project provides a **cloud environment for entries** (the
project contract's role 20), every entry this stage builds through
exec-entry runs in its own Claude Code cloud session: the foundation,
the slices, the integration node and the `X.<n>` fixes. Local is the
fallback, entry by entry. What stays on this machine:

| Stays local | Why |
|---|---|
| the session itself, the orchestrator | it holds the board, starts and watches the runs, and is the only one that rules |
| the merge queue (SKILL Step 4) and every signoff | the queue host is the only process that merges into `feat/<workstream>` and posts a commit status |
| the whole gate (Step 5) | it signs the top of the branch `main` requires; one run, on the station |
| his hands-on and its `A.<n>` adjustments (Step 6) | he uses the app on this machine; an adjustment is minutes and he is watching it |

A cloud session builds and checks one entry and pushes it. It never
merges, never signs off, never posts a commit status, never opens a
pull request. What comes back goes through the same queue as a local
entry, including the merged-tree test on this machine.

```
local session (orchestrator, queue host)            cloud session (one per entry, attempt a)
  cut story/<ws>/<id> from feat, push ─────────────►  the VM clones the repo at that branch
  push evidence/<ws>/<id> with input/ ─────────────►  setup script (cached snapshot)
  claude --cloud "<the run prompt>" ───────────────►  SessionStart hook: the stack up
  board: building (cloud) · session id · URL          fetch evidence/<ws>/<id> into a worktree
  the watcher: git ls-remote, no model turns          push started.json ──────────────┐
                                                      exec-entry, args from input/     │
                                                      push story/<ws>/<id>             │
  wake on the push ◄─────────────────────────────────  push run-<n>.json, notes, shots ┘
  fetch, copy the evidence, Step 3 as usual
  ready → the queue: merged-tree test + signoff, here
```

## The cap

**With a cloud environment, the cap is the plan's width**: every node
whose edges allow it starts at once, each in its own session. The only
bound is the account's rate limits, which every cloud session and this
session share. When a cloud run comes back `interrupted` with a limit
in its reason, the session starts no new cloud run until the reset the
message names (or 30 minutes), then goes on; the runs in flight are
left alone. The machine's load (SKILL Step 0) governs only what runs
here: the queue's signoffs, the whole gate, the hands-on, and any entry
that fell back to local.

**Without a cloud environment**, or for an entry that fell back, the
local cap holds as SKILL Step 0 says.

## What it needs (the project's role 20)

| Need | How |
|---|---|
| The code at the entry's base | the entry branch cut from the top of `feat/<workstream>` (or the branch it stacks on) and **pushed** before the start: the VM clones the GitHub remote at the current branch, never the local checkout |
| The pipeline | **vendored** under the project's `.claude/pipeline/` at a tagged version of the pipeline repository (`workflows/`, `agents/`, the packs it names), written by `/pipeline-setup` and refreshed by it. Preferred: one repository, so `.claude/settings.json` hooks and permissions load. The fallback is a clone of the pipeline repository **pinned to a tag** in the setup script, which needs the network to allow it (see "Not documented"). Never a symlink: the VM sees only what is committed |
| The workstream's files | sent with the run (below): the designs folder is outside the repository and invisible to the VM |
| The toolchain, the caches and the images | the environment's **setup script** (`/pipeline-setup` writes it from `templates/cloud-setup.sh`): browsers, the language toolchains, the dependency caches warmed, the stack's images pulled or built; under about five minutes so the snapshot caches it |
| The stack running | a **SessionStart hook** in the repository's `.claude/settings.json` that runs the doctrine's stack-up when `CLAUDE_CODE_REMOTE` is `true` (on startup and on resume: the snapshot and a resumed VM keep files, never processes) |
| Browsers for the QAs and the journeys | installed by the setup script at the version the project pins; their download host on the environment's network allowlist |
| Test values | environment variables in `.env` format, **test-only**: anyone who uses the environment reads them. Never a production secret, never a real third-party key |
| Time limits | the environment's env vars raise the Bash limits (below) |
| Permissions | the repository's `.claude/settings.json` allow list covers the gate, the stack, git fetch and push of `story/*` and `evidence/*`; a cloud session has no person to answer a prompt; the guard hook loads with it |
| Network | **Custom**: the Trusted defaults (package registries, GitHub, Docker Hub, `ghcr.io`, the Go proxy) plus the hosts the project's setup and stack need, the browser download host among them. **Full** only if nothing narrower works |

## Time limits: the long commands

A cloud session waits 2 minutes for a foreground command by default and
10 at most; a background command gets about 30 more minutes; an idle VM
pauses and loses its background processes. The gate and the QAs run the
project's longest commands, so:

1. **The environment's env vars set `BASH_DEFAULT_TIMEOUT_MS=600000`
   and `BASH_MAX_TIMEOUT_MS=1800000`.** This is the primary fix: the
   gate agent runs its commands as given, in the foreground, and its
   exit code is the record; with the default limit, a gate of five
   minutes would be cut at two and read as red.
2. **A command the project measured over ten minutes** (a whole
   browser suite, a slow integration suite) runs in the background,
   its output to a log under the evidence folder and its exit code to a
   file beside it, and the agent waits on that file: within the ~30
   minute window. The run prompt says so, and the gate commands in
   `plan.md` mark which ones (`(long)`).
3. **A per-entry gate that cannot fit 30 minutes** is a sizing problem
   (role 24), not a cloud one: that entry runs locally, and the board
   says why.

The whole gate never runs in the cloud.

## Sending the run

The VM sees only the repository. Everything the run reads from the
workstream travels on the entry's **evidence branch**, an orphan
branch of the project repository that carries the inputs in and the
evidence out. Nothing of the workstream enters the product's history
(the entry branch carries only code and tests), and the session stays
one-repository, so hooks and permissions load.

```
evidence/<workstream>/<id>        orphan branch, pushed by this session before the start
├── input/
│   ├── args.json                 Step 2's arguments; paths written as {repo}/… and {evidence}/…
│   ├── brief.md
│   ├── design/                   the design folder the brief cites
│   ├── discovery/                the journeys, and the locked frames of the entry's journeys only
│   ├── recon/                    the recon files the brief cites
│   ├── rulings.md
│   └── doctrine/                 only when the doctrine lives outside the project repository
├── started.json                  pushed by the cloud session when it starts
├── run-<n>.json                  pushed by the cloud session at the end: the run's return
└── notes.md, the QAs' screenshots, logs/ of the long commands
```

1. **The entry branch**: cut from the top of `feat/<workstream>` (or of
   the branch it stacks on) and pushed, as in SKILL Step 2.
2. **The evidence branch**: in a temporary worktree (`git worktree add
   --orphan -b evidence/<ws>/<id> <tmp>`), copy the inputs under
   `input/`, write `input/args.json`, commit, push, remove the worktree.
   On a restart the branch exists: its `input/` is updated in place.
3. **Start** from the entry's worktree (`claude --cloud` uses the
   current branch), in the background, and read the session id and URL
   it prints. The prompt is self-contained:

```
claude --cloud "$(cat <<'EOF'
You run one stage-4 entry of a delivery pipeline, alone: nobody will answer a question.
Entry <id>, workstream <ws>, attempt <a>, run <n>.
1. git fetch origin evidence/<ws>/<id>:evidence/<ws>/<id>
   git worktree add ../evidence-<id> evidence/<ws>/<id>
2. Write ../evidence-<id>/started.json as {"entry":"<id>","attempt":<a>,"run":<n>,"startedAt":"<now, ISO>"};
   commit it there ("started <id> a<a>") and git push origin evidence/<ws>/<id>.
3. Read ../evidence-<id>/input/args.json. Replace {repo} with the absolute path of this repository
   and {evidence} with the absolute path of ../evidence-<id>. Set inlineAgents to true,
   agentsDir to {repo}/.claude/pipeline/agents and packsDir to {repo}/.claude/pipeline/skills.
4. Run the Workflow tool with scriptPath {repo}/.claude/pipeline/workflows/exec-entry.js and those args.
   A command marked (long) in gateCommands runs in the background, its output to
   {evidence}/logs/<name>.log and its exit code to {evidence}/logs/<name>.exit; wait on that file.
5. When the workflow returns, write its return, verbatim, as ../evidence-<id>/run-<n>.json.
   If it could not start or threw, write {"status":"interrupted","reason":"<the error, one line>"} instead.
6. git push origin story/<ws>/<id>. Then, in ../evidence-<id>: commit everything
   ("run <n> of <id>: <status>") and git push origin evidence/<ws>/<id>.
Never merge, never push another branch, never open a pull request, never post a commit status.
Then stop.
EOF
)"
```

4. **Record** on the board: `building (cloud)`, the attempt, the
   session id and its URL (`cloud: <session-id> · <url> · a<a>`), the
   start time. A follow-up, if one is ever needed: `claude -p
   "<message>" --cloud <session-id>`.

## The return channel: git, watched by a loop

A cloud session cannot message this session. **Git is the channel**:
the pushed entry branch and the evidence branch. The session waits for
them with one shell loop, never with model turns:

```
bash ${CLAUDE_SKILL_DIR}/scripts/cloud-watch.sh origin 'refs/heads/evidence/<ws>/*' \
  <designs-root>/<ws>/03-execution/cloud-refs.txt <deadline, epoch seconds>
```

[`scripts/cloud-watch.sh`](../scripts/cloud-watch.sh) runs `git
ls-remote` on the evidence branches every 60 seconds (one call for all
the entries in flight, whatever the width) and exits when any of them
moved, printing each moved ref and its new sha, or at the deadline,
printing `deadline`. Run it under the **Monitor** tool or as a
**background shell** (`run_in_background`): its exit wakes the session.
One watcher at a time; after handling what moved, the session starts
it again while any cloud run is in flight.

When a ref moved, `git fetch origin <ref>` and read its tip:

| The tip carries | The session |
|---|---|
| `started.json`, no new run file | marks the board `building (cloud) · started <time>`; the start deadline is met |
| `run-<n>.json` | copies the branch's files (without `input/`) into `03-execution/entries/<id>/`, `git fetch origin story/<ws>/<id>`, and handles the return as in Step 3. A cloud `ready` is evidence, not a merge: the queue lists the paths outside Owns, runs the merged-tree test and the signoff here, in a worktree of the fetched branch |

The commits made in a cloud session carry a `Claude-Session:` trailer
with the session's URL, so each one points at its run. To read a
session's transcript or continue it by hand, `claude --teleport
<session-id>` pulls its branch and conversation into a local terminal.

## When it does not come back: once more in the cloud, then local

| Signal | Meaning |
|---|---|
| `claude --cloud` exits non-zero or prints no session id | it failed to start |
| no `started.json` 20 minutes after the start | it failed to start (the setup, the hook, the clone) |
| no `run-<n>.json` 120 minutes after `started.json` (twice the entry's 60-minute target) | it stopped: paused, reclaimed, killed |
| `run-<n>.json` with `status: interrupted` | an agent or the workflow returned nothing |

The watcher's deadline is the nearest of these over the runs in flight.
On any of them, the session:

1. **Restarts it once in the cloud**: a new session (attempt 2) from the
   entry branch as pushed, run `n+1`, `mode: 'resume'` with `check:
   'whole'` in `input/args.json` (the builder reads what is on the
   branch; work not pushed is lost and rebuilt). An `interrupted` for a
   limit waits for the reset first, as in "The cap".
2. **Then runs it locally**: the same resume through SKILL Step 2 in a
   local worktree of the fetched entry branch, under the local cap. The
   board says `building (local, cloud fell back: <signal>)`, and the
   workstream's `dreaming-notes.md` gets one line.

A cloud run's `blocked`, `parked` and `ready` are handled exactly as
local ones; a resume the session decides (a fixes file, his answer)
goes back to the cloud as a new attempt with that resume in its args.

## Resuming the stage

An entry `building (cloud)` on the board: `git ls-remote` its evidence
branch. A `run-<n>.json` there is handled as above; otherwise the
watcher starts again with the deadlines counted from the board's start
time, and the fallback applies when one passed.

## The documented facts (Claude Code docs, read 2026-10-04)

| Fact | Where |
|---|---|
| `claude --cloud "<task>"` starts an Anthropic-hosted session for the current repository; it clones the GitHub remote at the current branch, so push first. A repository without a GitHub remote can be sent as a bundle (`CCR_FORCE_BUNDLE=1`, up to 100 MB) with no push back, which this path cannot use | claude-code-on-the-web |
| `claude -p "<message>" --cloud <session-id>` sends a follow-up; `claude --teleport <session-id>` brings the result back; the result is a pushed branch | same |
| A local session can message a cloud session; a cloud session cannot message any session back yet | same |
| Each session gets a fresh isolated VM: Ubuntu 24.04, about 4 vCPUs, 16 GB of RAM, 30 GB of disk; Docker with compose, PostgreSQL 16, Node | cloud-environments |
| Playwright's browsers are not in the image | same |
| The setup script runs as root and is cached when it finishes in about five minutes; the snapshot keeps files, not processes | same |
| Environment variables are set in `.env` format at claude.ai/code and are visible to anyone using the environment; network is Trusted, Custom or Full | same |
| Committed `.claude/` content carries over (`CLAUDE.md`, hooks, skills, agents); user-level `~/.claude` does not; files outside the repository are not visible; multi-repository sessions do not load `.claude/settings.json` hooks or permissions, one-repository sessions do | same |
| Foreground commands get 2 minutes by default, up to 10; background work about 30 more minutes; `BASH_DEFAULT_TIMEOUT_MS` and `BASH_MAX_TIMEOUT_MS` are configurable; an idle session pauses, keeping files and losing background processes | same |
| Many sessions can run at once; they share the account's rate limits; there is no separate compute charge | claude-code-on-the-web |

## Not documented — measure before relying on it

- **Whether the stack and a browser fit** in 4 vCPUs and 16 GB together.
  The first cloud run of a project measures it (the stack up, the gate,
  one QA); a stack that does not fit is a role-20 gap.
- **Whether the repository is checked out when the setup script runs.**
  The template works either way: it warms the caches from the
  lockfiles when it finds the repository, and the SessionStart hook
  installs what is missing.
- **Pushing a branch other than the session's own.** The run prompt
  pushes `story/*` and `evidence/*`; confirm it on the first run.
- **Whether `BASH_MAX_TIMEOUT_MS` above ten minutes is honoured** in a
  cloud session. Until confirmed, the long commands run in the
  background as above.
- **Cloning an unattached public repository** (the pipeline pinned to a
  tag instead of vendored): not described. Vendor it.
- **`claude --cloud` from a non-interactive shell.** Whether it returns
  at once when the calling shell has no terminal is not stated. Run it
  in the background and read its output for the session id.
- **How many sessions may run at once** beyond the shared rate limits.
