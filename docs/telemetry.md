# Telemetry

Nothing is recorded by hand. One script reads what already exists and
writes the workstream's numbers:

```
node claude/scripts/telemetry.mjs <slug> [--stage <name>] [--ws <dir>]
```

It reads the Claude Code transcripts of the workstream's sessions and their
subagents, the entries' `run-*.json` and `beats.jsonl`, and writes
`<workstream>/metrics.json`: time, cost (an estimate from list prices)
and his touches per stage. What it cannot measure is `null` with a
line in `gaps`. Its header documents the sources and the shape.
