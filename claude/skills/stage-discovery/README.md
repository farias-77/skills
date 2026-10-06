# stage-discovery

Stage 1 of the pipeline. The user talks; a live mock of what he
describes appears on his second screen, edit by edit; when nothing is
open the conductor locks it; the stories and their acceptance criteria
are written from the conversation and the locked mock, reviewed once,
and confirmed by him story by story. The stage ends with its report
(video, deck, explainer) and the command for stage 2.

```
interview ⇄ live mock → lock → stories → review (workflow) → playback → report → /stage-design <slug>
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
| `scout (Sonnet 5.5, low)` | recon: feature maps, tokens, other fronts, term collisions |
| `prototype-builder (Sonnet 5.5, medium)` | builds and edits the mock, walks it, publishes it |
| `story-writer (Sonnet 5.5, high)` | journeys and stories, one AC per rule or behavior |
| `disc-lens (Sonnet 5.5, medium)` × 3 | in-out · coverage and error paths · acceptance |
| `blind-reader (Sonnet 5.5, low)` × 2 per story | reads one story and walks the mock, blind |
| `blind-judge (Sonnet 5.5, medium)` per story | compares the two readings, reports ambiguity |
| `video-builder (Sonnet 5.5, high)` · `slides-builder` · `artifact-builder` (Sonnet 5.5, medium) | the report's three tabs |

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage, step by step (D0–D7) |
| `references/interview.md` | how to interview: the razor, inferring, what to cover |
| `references/mock.md` | the mock's contract: page, shell, states, look, backend flows, publishing |
| `references/stories.md` | the story and AC format, `[build]`, the four error paths |
| `references/playback.md` | ruling the review, the playback questions, amendments |
| `templates/notes.md` | the interview record |
| `templates/stories.md` · `templates/journey.yaml` | what the story writer fills |
| `templates/prototype-shell.html` | the mock's starting point: router, bar, journey panel, backstage |
| `templates/reviews.md` | the conductor's rulings |
| `scripts/proto.mjs` | walk, frames, look, shots, lock, trace, split, model |

The review workflow is `claude/workflows/discovery-review-workflow.js`;
its dry run is `node scripts/discovery-review-dry-run.mjs` from the
repo root.
