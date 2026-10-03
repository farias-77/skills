# Parallel plan and local CI: tooling

Versions and documented limits as checked in October 2026.

- **Claude Code** (official docs):
  - `claude -w <name>` creates `.claude/worktrees/<name>/`;
    `isolation: worktree` does the same per subagent; `.worktreeinclude`
    copies gitignored files.
  - Workflows run 16 agents by default, up to 256
    (`CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS`).
  - `claude --cloud` starts a VM with "4 vCPUs, 16 GB of RAM" and
    Docker, cloned from the GitHub remote, so push first. `--teleport`
    pulls it back.
  - Projects (beta, Pro/Max, not in the CLI) run each thread as a cloud
    session, with at most 200 new threads a day.
  - Agent teams have no worktrees: "each teammate owns a different set
    of files".
  - Stop hooks: a documented cap of 8 blocks
    (`CLAUDE_CODE_STOP_HOOK_BLOCK_CAP`).
- **Rails 8.1 `bin/ci`.** Named `step`s, then `success?`, then an
  optional `gh signoff`. The same shape as `make -k verify`.
- **basecamp/gh-signoff v0.4.1.** Posts `signoff/<ctx>` statuses and
  installs a ruleset. It needs a clean, pushed HEAD and runs no tests.
- **Dagger v0.21.10.** Container pipelines with a content-addressed
  cache, the same locally and in CI. Adopt it only if a host cannot run
  Make and Compose (inference).
- **nektos/act v0.2.89.** For workflow YAML only.
- **lefthook v2.1.16.** A pre-push fast check; a convenience, never the
  trust anchor.
- **goose v3.28.0.** `create` without `-s`, then `fix` in the queue
  (hybrid versioning).
- **`plan-lint`** (inference). About 60 lines over the plan's JSON:
  cycles, depth, `Owns` overlap, producers; it reports the width.
