# Model selection: tooling

## API

- `output_config: {effort: …}`; thinking is adaptive, and Opus cannot
  turn it off.
- Sonnet's lowest setting, `thinking: {type: "between_tools"}`, works
  only at high effort or below. Claude Code cannot use it.
- Beta headers:
  - Per-message effort: `mid-conversation-output-config-2026-07-01`.
  - Progress notes: `thinking.display: "updates"` with
    `thinking-display-updates-2026-08-18`. Both models return notes
    between tool calls in thinking blocks that are empty by default.
  - Refusal fallback: `fallbacks: "default"` with
    `server-side-fallback-2026-07-01`. Opus cyber turns fall back to
    Opus 4.8, Sonnet's to Sonnet 5.
- Forced `tool_choice` returns a 400 on both models: use `auto` with
  `strict: true`.

## Claude Code

- Agent frontmatter `model:` and `effort:`, plus `/effort`, `/model`
  and `/usage`.
- `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH` and
  `CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS` cap delegation.
- `/config` → "Switch models when a message is flagged" (refusal
  fallback).
- `/tasks` shows each subagent's model and effort.

## Lint

Replace `<agents>` and `<skills>` with the folders that hold the agent
and skill definitions.

```
grep -rnE "think (carefully|step by step|hard)|show your (reasoning|thinking)|minimi[sz]e tool calls|double-check|verify (twice|again)" <agents> <skills>
grep -L '^effort:' <agents>/*.md                  # agents with no explicit effort
grep -lE '^effort: *(max|xhigh)' <agents>/*.md    # every hit needs its measured gain written beside it
```

## Audit and data

- `/claude-api prompt-audit` finds stale prompting.
- Per-effort data: https://artificialanalysis.ai/models/releases/claude-opus-5-5
  and https://artificialanalysis.ai/models/releases/claude-sonnet-5-5.
