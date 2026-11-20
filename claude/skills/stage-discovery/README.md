# stage-discovery

Stage 1 of the pipeline. He says what he wants; scouts read the
product while he talks; one message plays back what was understood,
what will be assumed and what only he decides. A short interview asks
only that. The stories are written with one acceptance criterion per
rule, real values in each. When a screen changes he walks a guided
mock of it, built from the project's own design system, until he says
it is right. One adversarial review runs alone. He approves on one
page, the ids freeze, and the stage hands him the command for stage 2.

```
0 door → 1 he talks → 2 readback → 3 interview → 4 stories → 5 mock ──┐
            (scouts)     ◄ him        ◄ him       (alone)   ◄ him     ├→ 7 gate ◄ him → /stage-design <slug>
                                                          → 6 review ─┘
                                                             (alone)
```

He is needed at four moments: the dump, the questions, the mock, the
gate. Every other minute the stage runs alone and says so with one
status line.

## Install

This skill needs the kit: the agents it dispatches, the review
workflow and the shared references. Install the whole `claude/`
folder (see the repo's README). Copying only this folder gives the
instructions without the team that runs them.

Runtime needs: Node 20+; for `discovery.mjs shots` (the mock's
self-check) `playwright-core` and a Chromium (`npm ci --prefix
claude/video` installs both); `gitleaks` for the scan before the page
is published.

## Agents

Each agent belongs to this stage and carries its name. No other stage
dispatches them.

| Agent | Model, effort | Does |
|---|---|---|
| `discovery-scout` × N | Haiku 5.5, high | reads the product, the standards book and the other workstreams while he talks; quotes with `path:line` |
| `discovery-story-writer` | Sonnet 5.5, high | writes `stories.md` and `not-building.md` from the notes; applies fixes and amendments |
| `discovery-mock-designer` | Opus 5.5, high | when a screen changes: the guided mock, checked against its own screenshots; applies his rounds |
| `discovery-story-reader` × 2 per story | Haiku 5.5, high | reads one story blind, one as builder and one as tester; commits to a case that passes and one that fails |
| `discovery-hole-hunter` × 4 | Sonnet 5.5, medium | one hunt each: errors, access, limits, code |
| `discovery-reading-comparer` per story | Sonnet 5.5, medium | compares the two blind reports against what he decided; reports only the criteria that leave two readings or a guess |
| `discovery-finding-verifier` per hunter claim | Sonnet 5.5, medium | checks each claim against what he decided; only verified findings reach the conductor |

The conductor is the session itself.

## Files

| Path | What |
|---|---|
| `SKILL.md` | the stage: the bar, the flow, the seven stops, the close, resuming |
| `references/interview.md` | the dump, what earns a question, the question's shape, the notes, when to stop |
| `references/readback.md` | sorting every gap; the one message of stop 2 |
| `references/stories.md` | the story and criterion format; what `check` proves |
| `references/mock.md` | the mock's contract: the file's four blocks, states, the tour, the self-check, the lock |
| `references/review.md` | the panel, the ruling table, fixes and the second pass |
| `references/gate.md` | the one page, the approval, amendments, the freeze, the close |
| `references/messages.md` | the status line and the six fixed messages |
| `templates/notes.md` | the interview's record, with provenance per decision |
| `templates/stories.md` · `templates/not-building.md` | what the story writer fills |
| `templates/mock.html` | the mock's starting point |
| `templates/page.json` | what the conductor writes for the stage page |
| `templates/stage-page.html` | the stage page's shell: the reading column, the guided mock, the stage rail |
| `scripts/discovery.mjs` | `init` · `state` · `check` · `split` · `round` · `mark` · `diff` · `page` · `shots` · `lock` · `freeze` |

The review workflow is `claude/workflows/discovery-review-workflow.js`.

## What the workstream holds after the stage

```
<workstream>/
  .state.md          where it is, the status line
  notes.md           the interview's record
  stories.md         the stories, frozen ids
  not-building.md    what was decided not to build
  rulings.md         one line per ruling
  dreaming-notes.md  frictions, his notes for the retro
  mock/              mock.html, LOCK.json, shots/      (when a screen changes)
  discovery/         recon/, review/, page/, page.json, ids.json
```

