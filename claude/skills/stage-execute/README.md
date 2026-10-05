# stage-execute

Stage 4 of the pipeline. The session becomes the tech lead of a small
team of agents and builds a closed plan into a finished feature branch,
under one `/goal`: every ready entry at once (in cloud sessions when the
project has them), a merge queue that tests each merged tree, the whole
gate as local CI, the PR to `main`, and the user's hands-on with his
adjustments. It closes on his "ok".

```
C ──► entries at once (builders → gate → reviewer ∥ QAs → one fix) ──► queue ──► PR + local-ci ──► his hands-on ──► ok
```

## Install

This skill needs the pipeline around it: the agents `builder-backend`,
`builder-frontend`, `exec-gate`, `reviewer`, `qa-frontend`,
`qa-backend`, `scout`, `video-builder` and `slides-builder` in
`claude/agents/`; the workflow `claude/workflows/exec-entry-workflow.js`;
the scripts `claude/scripts/local-ci.sh` and `claude/scripts/telemetry.mjs`;
and a product repo whose `CLAUDE.md` names its gate commands and stack.
Copy `claude/` into the project's `.claude/` (or symlink this folder into
`~/.claude/skills/stage-execute` with the rest of the pipeline beside
it), then run `/stage-execute <workstream-slug>`.

## Files

| File | What |
|---|---|
| `SKILL.md` | the stage, step by step |
| `references/tech-lead.md` | the playbook: overlaps, conflicts, parked entries, rate limits, other fronts, the night |
| `references/queue.md` | the merge queue, migrations, `main` moving, the PR and local CI |
| `references/cloud.md` | entries in cloud sessions: the evidence branch, the run prompt, heartbeat, relaunch |
| `references/builders.md` | the builders' role and the testing rule |
| `references/backend.md` · `frontend.md` | Go and React craft, and visual taste, trimmed to the standards |
| `references/review.md` | the six classes that block, the security checklist, five notes at most |
| `references/qa.md` | the try-to-break lists for screens and for the API |
| `templates/board.md` · `brief-adjust.md` | the board, and the brief of an A.n round or an X.n fix |
| `scripts/cloud-watch.sh` | waits for pushes on the evidence branches with no model turns |
| `scripts/heartbeat.sh` | one beat per agent start and end; pushed in a cloud run |
