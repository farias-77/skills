# The cloud environment for entries — <project>

Role 20 of the pipeline's bar. Stage 4 runs each entry in its own
Claude Code cloud session from this repository; this file is what the
environment at claude.ai/code holds and where each piece lives. Kept
in the repository beside the doctrine; the values typed at claude.ai
are the ones below, never others.

## The environment at claude.ai/code

| Field | Value |
|---|---|
| Name | `<environment-name>` (the doctrine names it) |
| Repository | `<owner>/<repo>`, alone: a multi-repository session does not load `.claude/settings.json` |
| Setup script | the contents of `<path>/cloud-setup.sh`, pasted; re-pasted whenever that file changes |
| Network | Custom: the Trusted defaults plus the hosts below |
| Env vars | the list below, in `.env` format |

## Env vars (test-only: anyone who uses the environment reads them)

```
BASH_DEFAULT_TIMEOUT_MS=600000
BASH_MAX_TIMEOUT_MS=1800000
<NAME>=<test-only value>
```

| Variable | Why | Kind |
|---|---|---|
| `BASH_DEFAULT_TIMEOUT_MS` | a foreground gate command is cut at 2 minutes otherwise | limit |
| `BASH_MAX_TIMEOUT_MS` | the longest command an agent may wait on | limit |
| `<NAME>` | <what reads it> | fake · local URL · test project id |

Never here: a production secret, a real third-party key, a credential
that can reach a deployed environment. A test that needs one is not a
gate test.

## Network allowlist (Custom)

| Host | Why |
|---|---|
| <host> | <the setup or the stack step that reaches it> |

## Where the rest lives

| Piece | File |
|---|---|
| the setup script | `<path>/cloud-setup.sh`: toolchains, dependency caches, images, browsers; prints a line per step with the elapsed seconds; under about five minutes so the snapshot caches it |
| the stack up | `.claude/hooks/cloud-session-start.sh`, registered as a `SessionStart` hook (startup and resume) in `.claude/settings.json`; it does nothing unless `CLAUDE_CODE_REMOTE` is `true` |
| the permissions | `.claude/settings.json`: the gate, the stack, git fetch and push of `story/*` and `evidence/*` |
| the pipeline | `.claude/pipeline/` at tag `<tag>` of the pipeline repository |

## Checked

| Check | Result |
|---|---|
| setup script, uncached, total seconds | <the last line it printed> |
| a cloud session on `<default-branch>`: the hook brought the stack up | <its line> |
| the per-entry gate, in that session | <minutes, exit code> |
