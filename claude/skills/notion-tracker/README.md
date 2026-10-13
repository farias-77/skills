# notion-tracker

Keeps a Notion demand database in step with the pipeline. A demand is
pulled from Notion with `/lets-cook REQ-12`; from then on every stage
updates the page (Stage, Report, Released in, Last update), so
the team sees from Notion everything running and where. Optional: it
acts only when the project has `notion.json` at its root.

```
Notion row (Backlog) ──► /lets-cook REQ-12 ──► Owner, In progress, Stage, Workstream
                                   │
              each stage opens / closes ──► Stage, Report, Last update
                                   │
              release ──► Released in      close ──► Done
```

## Install

1. Copy this folder into the project's skills, beside the pipeline's.
2. Connect a Notion MCP server for each person who pulls demands.
3. Add the database properties the config names: Stage (select, one
   option per stage), Workstream (text), Report (url), Released in
   (text), Last update (text). Owner, Requested by and Type
   are usually there already. Stage's options: Backlog, one per stage,
   Done, Declined; Stage is the only state field. Add a board view grouped by Stage: the backlog is its first
   column. Whoever creates requests sets Stage = Backlog.
4. Copy `templates/notion.json` to the project root and fill it.
5. Allow the server's `notion-fetch`, `notion-query-data-sources`,
   `notion-update-page`, `notion-create-pages` and `notion-get-self`
   tools in the project's settings: under a `/goal` nobody answers a
   permission prompt.

## Files

| Path | What |
|---|---|
| `SKILL.md` | the config, the link in `.state.md`, the events, the pull, failures |
| `templates/notion.json` | the project config to copy and fill |
