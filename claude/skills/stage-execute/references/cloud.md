# One entry in a cloud session

When the ready set is wider than the measured local cap, the entries
past the cap may run in Claude Code cloud sessions, one entry per
session. The local session stays the orchestrator and the **queue
host**: a cloud session builds and checks one entry and pushes it; it
never merges, never signs off, never posts a commit status. What comes
back goes through the same merge queue (SKILL Step 4) as a local
entry, including the merged-tree test on this machine.

Use it only when the project provides a cloud runner (the project
contract's role for it) and the entry needs nothing that lives only on
this machine. Otherwise the local cap holds and the rest waits.

```
local session                                cloud session (one per entry)
  push the entry branch ──────────────────►   clone at that branch, setup script (cached)
  claude --cloud "<the run prompt>" ──────►   SessionStart hook: the stack up
                                              exec-entry, inlineAgents, the same args
                                              push the entry branch + evidence/<ws>/<id>
  watch the remote for run-<n>.json ◄──────   (the last commit carries the run's return)
  fetch, copy the evidence, Step 3 as usual
  ready → the queue: merged-tree test + signoff, here
```

## What it needs

| Need | How |
|---|---|
| The code at the entry's base | the entry branch cut and **pushed** before the start: the cloud VM clones the GitHub remote at the current branch, not the local checkout |
| The workstream's files (brief, design, the locked mock's frames and journeys, the recon) | committed in a repository the session clones: the project repository, or a second repository in a Project; they are read-only there |
| The pipeline (`exec-entry.js`, the agents, the packs) | committed where the session can read it: vendored under the project's `.claude/`, or a second repository in a Project. Run with `inlineAgents: true`, `agentsDir` and `packsDir` pointing at that copy |
| The toolchain and the stack's images | the environment's **setup script**: installs what the base image lacks, pulls or builds the stack's images; under about five minutes so the snapshot caches it |
| The stack running | a **SessionStart hook** in the repository's `.claude/settings.json` that runs the doctrine's stack-up command when `CLAUDE_CODE_REMOTE` is `true`; the snapshot keeps files, never processes |
| Browsers for the journeys | installed by the setup script; their download hosts added to the environment's allowlist (see "Not documented") |
| Test secrets | only fakes and test-only values, as environment variables (anyone who uses the environment can read them), or API credentials on plans that have them; never a production secret |
| Permissions | the repository's `.claude/settings.json` allow list for the gate, the stack and git; a cloud session has no person to answer a prompt |
| Network | **Trusted** covers the package registries, GitHub, Docker Hub, `ghcr.io`, the Go proxy and `*.googleapis.com`; **Custom** adds the rest the stack needs; **Full** only if nothing narrower works |

## Starting it

From a checkout of the project repository on the entry branch, pushed:

```
claude --cloud "Run the exec-entry workflow (<pipeline>/claude/workflows/exec-entry.js) with these args: <the JSON of SKILL Step 2, paths rewritten to the clone, inlineAgents: true>. When it returns, write its return as <evidence dir>/run-<n>.json, commit the evidence folder to branch evidence/<workstream>/<id>, push the entry branch and that branch, and stop."
```

Record the session id and URL the command prints in `board.md`, with
the entry's state `building (cloud)`. A follow-up, if one is ever
needed: `claude -p "<message>" --cloud <session-id>`.

## How the evidence comes back

The cloud session's commits are the only channel the pipeline trusts:

1. **The entry branch**: the builder's commits (the code and its
   tests), every fix. Commits made in a cloud session carry a `Claude-Session:`
   trailer with the session's URL, so each one points at its run.
2. **`evidence/<workstream>/<id>`**: the run's return
   (`run-<n>.json`, the same shape as a local run), `notes.md` and the
   QAs' screenshots; no token is ever written to them.

The local session waits for that branch with one shell loop in the
background (`git ls-remote` every few minutes until the run file's
commit appears, under a time limit), never with model turns. Then it
fetches, copies the evidence folder into `03-execution/entries/<id>/`,
and handles the return as in Step 3. A cloud `ready` is evidence, not
a merge: the queue lists the paths outside Owns, runs the merged-tree test and the
signoff on this machine. To read the session's transcript or continue
it by hand, `claude --teleport <session-id>` pulls its branch and its
conversation into a local terminal.

## The documented facts (Claude Code docs, read 2026-10-02)

| Fact | Where |
|---|---|
| `claude --cloud "<task>"` creates a new cloud session for the current repository, one repository at a time; it clones the GitHub remote at the current branch, so push first | claude-code-on-the-web, "From terminal to cloud" |
| `claude -p "<message>" --cloud <session-id>` queues a message into a running session; `--output-format json` returns `{ok, session_id, url}` | same, "Send follow-ups from the CLI" |
| `claude --teleport <session-id>` pulls the session's branch and conversation; needs a clean tree, the same repository and the branch pushed | same, "From cloud to terminal" |
| Each session gets a fresh VM: Ubuntu 24.04, x86_64; about 4 vCPUs, 16 GB of RAM, 30 GB of disk, "approximate … may change" | cloud-environments, "Resource limits" |
| Pre-installed: Go, Node 20–22 with npm/pnpm, Python, Docker with compose, PostgreSQL 16 and Redis 7 (not running), git, gh, jq | same, "Installed tools" |
| Network levels: None, Trusted (the default allowlist), Full, Custom; GitHub goes through its own proxy at every level; the Anthropic API is always reachable | same, "Access levels" |
| The setup script runs as root before Claude Code starts, must exit 0, and is cached as a filesystem snapshot when it finishes in about five minutes; the snapshot expires after about seven days and keeps files, not processes | same, "Setup scripts", "Environment caching" |
| The repository's `CLAUDE.md`, `.claude/settings.json` hooks and permissions (one-repository sessions), and `.claude/skills`, `agents`, `commands` carry over; user-level `~/.claude` and plugins the repository enables do not | same, "What carries over" |
| Bash waits 2 minutes for a foreground command by default, up to 10; `BASH_DEFAULT_TIMEOUT_MS` and `BASH_MAX_TIMEOUT_MS` raise them; an idle VM pauses and may be reclaimed, and background work is not restored | same, "Time limits" |
| `gh` works through the proxy with `GH_TOKEN` set to `proxy-injected`; the proxy rejects branch deletions and tag pushes, serves only a pinned set of GraphQL operations, and reaches only the repositories attached to the session | same, "GitHub proxy" |
| Dynamic workflows run in cloud sessions, and their results are saved with the conversation | workflows |
| Cloud sessions share the account's rate limits; there is no separate compute charge | claude-code-on-the-web, "Limitations" |
| Projects (beta; Pro and Max; not in the CLI) run each thread as a cloud session over several repositories; at most 200 new threads a day; a thread's sandbox can resume from a fresh clone, so uncommitted work can be lost | claude-projects |

## Not documented — measure before relying on it

- **Whether the project's whole stack and a browser fit** in 4 vCPUs
  and 16 GB together. Measure it once with the plan's machine scout in
  a cloud session; the result is that runner's cap (often one entry).
- **Nested virtualization.** The docs say Docker runs; they say nothing
  about KVM or a VM inside the VM.
- **Browser downloads.** The Trusted list names the package registries
  but not the hosts Playwright downloads its browsers from; add them
  under Custom, or install the browsers through the setup script with
  a registry the list covers, and confirm once.
- **Cloning an unattached public repository** (the pipeline, when it
  is not vendored): the proxy limits API and release requests to the
  attached repositories; plain `git clone` of another public repository
  is not described. Vendor the pipeline or attach its repository.
- **A completion signal.** No documented CLI command waits for a cloud
  session to finish or returns its result; hence the run file on the
  evidence branch.
- **`claude --cloud` from a non-interactive shell.** The docs show it
  printing a setup checklist; whether it returns at once when the
  calling shell has no terminal is not stated. Run it in the
  background and read its output for the session id.
- **Seat counts.** Projects document 200 new threads a day; how many
  `--cloud` sessions may run at once is not stated beyond the shared
  rate limits.
