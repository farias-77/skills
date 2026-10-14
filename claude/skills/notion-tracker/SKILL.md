---
name: notion-tracker
description: Keeps a Notion demand database in step with the pipeline, so the team sees from Notion every workstream running and its stage. Optional; it acts only when the project has `notion.json` at its root. lets-cook loads it to pull a demand (`/lets-cook REQ-12`, or `/lets-cook next` and "pull the next demand" for the most urgent one in the backlog): it reads the page as his words, sets Owner to whoever pulled it, Stage and Workstream. Every stage loads it at its Open and its Close to update Stage, Report and Last update; the release sets Released in; the close sets Stage to done. A workstream that did not come from Notion gets a page of its own at the pull. A Notion failure never stops a stage. Runs in the calling session (Opus 5.5, high); no agent.
argument-hint: "<event> <slug> [value]: pull <code|url|next> · open <stage> · close <stage> <report-url> · released <tag> · done · stopped <why>"
allowed-tools: Read, Edit, Bash
---

# Notion tracker

The pipeline knows nothing about Notion. The project opts in with one
file, `notion.json`, at the root of the repo whose `CLAUDE.md` has the
`designs-root:` line. No file: every event is a no-op, and the caller
goes on.

## The config

`notion.json` (start from [templates/notion.json](templates/notion.json)):

| Key | What |
|---|---|
| `tools` | the prefix of the Notion MCP server's tools, e.g. `mcp__notion__`; the calls below are `<tools>notion-fetch` and so on |
| `dataSource` | the database's data source, `collection://…` |
| `code` | the prefix of the auto id, e.g. `REQ-`; `/lets-cook REQ-12` is a pull |
| `fields` | the property names: `owner`, `stage`, `workstream`, `report`, `releasedIn`, `lastUpdate`, `requestedBy`, `type`, `priority`, `created` |
| `stages` | the option name for each stage: `discovery` … `close`, `build` for the short route's entry and his use, `backlog` and `done`, the board's first and last columns, and `declined` |

No secret goes in the file: each person's MCP login is the access, and
it is also who the Owner is.

## The board

One database, two views: the requesters' table, and a board grouped by
Stage whose first column is `stages.backlog` and last is `stages.done`;
`stages.declined` stays off the board. Stage is the only state field.
A new request carries Stage = `stages.backlog` from whoever creates it;
the pull moves it to the route's first stage.

## The link

The workstream's `.state.md` carries one line, written at the pull:

```
tracker: <the page's url>
```

Every event after the pull reads the page from that line. No line: the
event is a no-op.

## The events

| Event | Who calls it | Writes |
|---|---|---|
| `pull <code\|url\|next>` | lets-cook, step 1 | see "The pull" |
| `open <stage>` | every stage, at its Open | Stage · Last update |
| `close <stage> <report-url>` | every stage, after its report is published | Report (when empty) · Last update |
| `released <tag>` | stage-release, lets-cook step 7, at production green | Released in · Last update |
| `done` | stage-close, lets-cook step 8 | Stage = `stages.done` · Last update |
| `stopped <why>` | any stage that stops for him or parks the workstream | Last update |

Last update is one line, overwritten each time, never appended:
`<YYYY-MM-DD> · <stage> <opened|closed|released vX.Y.Z|stopped: why>`.
The page's body is never written after the pull: on the Free plan
every line of a body counts against the workspace's block cap.

## The pull

1. **The page.** A code (`REQ-12`): query `dataSource` for the row whose
   id property equals it. A url: fetch it. `next`: query the rows with
   Stage = `stages.backlog` and an empty Owner (an Owner means someone
   already pulled it, you included), and take the first by Priority (the
   property's option order, most urgent first); a tie goes to the
   oldest Created. Say the pick in one line (`REQ-4 · Urgent`) and the
   next two behind it, then go on; "another one" from him takes the
   next. Not found, or Stage already
   past `stages.backlog` with an Owner who is not you: stop and tell him who
   holds it.
2. **His words.** The page's body becomes the input lets-cook would
   have heard: "In their words" verbatim as the ask, "Done when" and
   "Steps to repeat" as Confirmed lines, Type as a hint for the route
   (a Bug with production broken now is a hotfix). The light interview
   still runs, and asks only what the page leaves open.
3. **The writes.** At the pull, before the interview, so other
   sessions and people see the demand is taken: Owner = you
   (`<tools>notion-get-self`), Last update = `<YYYY-MM-DD> · pulled,
   interview`. Once the slug exists: Stage = the route's first stage,
   Workstream = the slug, Last update. Then the `tracker:` line in
   `.state.md`.

**A demand that did not come from Notion** (`/lets-cook <idea>` with
`notion.json` present): create a page in `dataSource` with the title,
Requested by and Owner = you, Type from the route (hotfix → Bug), his
words under "In their words", then the same writes. Everything running
here shows there.

## When Notion fails

One retry. Then a line in the workstream's `trace.md`
(`tracker: <event> failed: <the error, one line>`) and the caller goes
on: the tracker is a view, never a gate. The next event sets Stage and
Last update again, so a missed one shows only until then.
