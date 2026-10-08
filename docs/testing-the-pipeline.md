# Testing the pipeline: running a stage headless

How to run one stage end to end with no human in the room, to measure
it and log its frictions: a print-mode session (`claude -p`) conducts
the stage, and an agent plays the user. What follows is what such a
run needs that a normal session does not, and what it cannot test.

## The shape of a run

```
harness (you)
  └── CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 claude -p --settings .claude/settings.json \
        --add-dir <designs-root> --add-dir <pipeline root> \
        "/stage-<name> <slug>" + the run's context            ← the conductor, headless
        └── dispatches the persona agent wherever the skill asks the user
```

The prompt tells the conductor three things beyond the slash command:

- who plays the user (the persona agent's name) and that it is
  dispatched wherever the skill asks him anything, never waited for;
- the workstream folder and the repositories it may read;
- where to keep the friction log and the wall-clock per step.

## What the harness must set

| Setting | Why |
|---|---|
| `--settings <the project's .claude/settings.json>` | print mode ignores the `permissions.allow` entries of a workspace never trusted interactively ("Ignoring N permissions.allow entries"); passed with `--settings`, they apply, and every gate, stack and check command is not refused |
| `--add-dir <designs-root> --add-dir <the pipeline root>` | print mode denies every Read and Write outside the working directories, subagents' included: the workstreams' folders and the kit sit beside the repository, not in it |
| `CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0` in the session's environment | print mode ends background tasks 600 s after the turn ends ("Background tasks still running after 600s; terminating"). A stage dispatches long agents in the background (the prototype-builder, the report builders, the review); without this they die midway and nothing is written |
| the persona's definition and any harness agents JSON **outside** the conductor's working directories | the persona's prompt holds the answers (what he wants built, his rules, when he locks). A file the conductor can read contaminates the test: it knows the answers before it asks. Keep it where only the harness reads it (a path passed with `--agents` from outside the tree, or the user-level agents folder of a separate config dir) |
| the pipeline reachable without a symlink across directories, or `--add-dir <the pipeline root>` | the Workflow tool refuses a `scriptPath` that resolves outside the session's working directories; the skills then pass the script's content inline (`script`), which works but costs a turn |
| `PLAYWRIGHT_DIR` (optional) | `proto.mjs` finds `playwright-core` in the pipeline's `claude/video/node_modules` by default; set it only to use another install |

## What a headless run cannot test

- **The Artifact tools.** A print-mode or cloud session usually has no
  `Artifact`, `ArtifactData` or `ArtifactComments`. Discovery then runs
  in local mode (its skill, "Prerequisites and the host"): no published
  mock, pictures from `proto.mjs shots`, his step verdicts written to
  `walks/verdicts.json` from the persona's answers, the stage report
  kept local. The publish, the verdict store and the comments are not
  exercised; say so in the run's findings.
- **The question tool.** Without it the batches go as text in the house
  shape (each skill's fallback). The tool's own rendering is not tested.
- **Model and effort switches.** A non-interactive session cannot run
  `/model` or `/effort`; the stage runs on the session's settings. Start
  the session on the model the stage names, and note the effort.
- **His judgment.** A persona that knows the script answers the
  recommended option almost every time; the run measures the pipeline's
  mechanics and time, not whether the recommendations were right. Write
  the persona so it disagrees where a real user would, and record where
  it did.

## Reading the result

- The friction log: one line per place the skill was unclear, slow,
  wrong or missing something, with the minutes it cost.
- The timings: wall-clock per step, start and end in UTC.
- The workstream folder: the stage's files as the next stage reads them.
  A stage that suffers after a `/clear` has a missing file; that is the
  bug to fix, not the context.
