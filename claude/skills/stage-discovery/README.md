# stage-discovery

Stage 1 of the pipeline. An interview grills the idea until no branch
of what to build is open: the facts are the agents' job, the decisions
are his. Then the stories are written, one acceptance criterion per
rule. When a screen changes, the exact mock is built in the project's
own design system; he walks it with Ctrl+→ until he says it is ready,
and the stories anchor on it. One review round, then he confirms one
plain text of what was understood. The stage ends with its report (the
Explainer always; video and slides when he asks) and the command for
stage 2.

```
interview → stories → [a screen changes: mock → his rounds → lock → stories anchored] → review → playback → report → /stage-design <slug>
```

## Install

This skill needs the pipeline: the agents it dispatches, the review
workflow, the visual builders and the shared references. Install the
whole `claude/` folder (see the repo's README). Copying only this
folder gives the instructions without the team that runs them.

Runtime needs: Node 20+, `playwright-core` and a Chromium for
`scripts/proto.mjs` (`npm ci --prefix claude/video` installs both), and
`gitleaks` for the scan before the report is published.

## Agents it dispatches

| Agent | Does |
|---|---|
| `scout (Haiku 5.5, high)` | recon: feature maps, other workstreams, term collisions, and the design system's paths when a screen changes |
| `prototype-builder (Sonnet 5.5, high)` | only when a screen changes: builds the mock and applies his rounds, walks it, publishes it |
| `story-writer (Sonnet 5.5, high)` | the stories from the interview, one AC per rule or behavior; anchors them on the locked mock |
| `disc-lens (Sonnet 5.5, medium)` × 3 | in-out · coverage and error paths · acceptance |
| `story-reader (Haiku 5.5, high)` × 2 per story | reads one story (and walks the mock, when there is one), blind |
| `blind-judge (Sonnet 5.5, medium)` per story | compares the two readings, reports ambiguity |
| `video-builder (Sonnet 5.5, high)` · `slides-builder` · `artifact-builder` (Sonnet 5.5, medium) | the report: the Explainer always, the Video and the Deck when he asks |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage, step by step (D0–D6) |
| `references/interview.md` | how to interview: the design tree in rounds, the razor, inferring, what to cover |
| `references/mock.md` | the mock's contract: page, shell, states, the project's look, how wide to build, publishing |
| `references/stories.md` | the story and AC format, `[build]`, the four error paths |
| `references/playback.md` | ruling the review, the playback text and its one question call, amendments |
| `templates/notes.md` | the interview record |
| `templates/stories.md` · `templates/journey.yaml` | what the story writer fills |
| `templates/prototype-shell.html` | the mock's starting point: the product full screen, the review path, the top bar |
| `templates/reviews.md` | the conductor's rulings |
| `scripts/proto.mjs` | walk, frames, look, shots, lock, trace (also `trace none`), split, assemble, model |

The review workflow is `claude/workflows/discovery-review-workflow.js`;
its dry run is `node tests/discovery-review-dry-run.mjs` from the
repo root.
