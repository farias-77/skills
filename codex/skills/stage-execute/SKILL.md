---
name: stage-execute
description: Build a workstream's waves from its approved plan — feature branch, stories, review, alpha, PR — wave after wave until the last one is proven. Use when the user names a workstream whose .state.md says stage execute.
---

# Stage 4: Execute

You are the conductor of the execution chair. The plan (`waves.md`,
one goal per wave under `02-plan/goals/`) says what to build and how
each piece is proved; the design (`01-design/`, `decisions.md` as the
law) says how it works; the repos and the house standards say how code
is written here. You run the whole demand from the wave the state
names to the last wave, on your own. The user reads the result at the
end: the wave PRs open on `main`, the reports, the improvements you
applied and the places where you left the standard on purpose.

Read `<designs-root>/<workstream>/.state.md` first. It names the wave
in flight. Then read that wave's goal whole, the wave's section of
`waves.md`, and `03-execution/<wave>/trace.md` if it exists: the trace
and the PRs on GitHub are what was done; your memory is not.

## What done means

A wave is done when every story of its goal is merged into the wave
branch with its two review rounds recorded and its "ready when" proved
in alpha; the wave branch of every repo is deployed to alpha in the
goal's order; the whole smoke suite of every repo is green against
alpha; the walk in "The wave's proof" was done and its evidence saved;
one PR per repo from the wave branch to `main` is open, never merged;
the Status column of `waves.md`, `report.md` and the blueprint's
execution entry for the wave are filled. Then the next wave starts
from this wave's branches. The stage is done when the last wave is
done and `.state.md` says `stage: release`.

Do not stop for review after the first implementation. Deploying to
alpha, running the smoke suite, fixing what fails and rerunning are
part of the work, not steps to ask about. Stop only on the conditions
in [references/wave.md](references/wave.md).

## The cycle

Per wave, in [references/wave.md](references/wave.md): cut
`feat/wNN-<repo>` from the previous wave's branch (or `main`), open the
trace, build the stories, prove the wave, open the wave PR, fill the
report, move the state, continue.

Per story, in [references/story.md](references/story.md): a builder on
a story branch, tests first; five lenses in parallel on the diff, you
rule, the builder fixes, five lenses on the delta, you rule, what is
left rides as a note; alpha deploy and the story's smoke folder green;
a PR into the wave branch with the review numbers; you merge.

The review rules, the improvement rule and what lives in
`reviews/` are in [references/review.md](references/review.md). Who
you spawn, at which effort, with what boundary, is in
[references/team.md](references/team.md).

## Files

```
<workstream>/
├── .state.md                       # stage · chair: codex · wave in flight
├── waves.md                        # Status column and Amendments are yours
├── 02-plan/goals/wNN-<slug>.md     # the brief; read-only, except an amendment
├── blueprint.html                  # waves['wNN-<slug>'].execution is yours
└── 03-execution/wNN-<slug>/
    ├── trace.md                    # one line per event, as it happens (templates/trace.md)
    ├── report.md                   # the wave's report, grown story by story (templates/report.md)
    ├── reviews/<N.k>/round-1.md    # every finding with its ruling (templates/review-round.md)
    ├── reviews/<N.k>/round-2.md
    └── proof/                      # smoke output, screenshots, resource listings
```

Trace, report, review files and PR bodies are written in the language
of the goal. Code, commit messages and branch names are English.

## Boundaries

Never deploy prod, never touch `main`, never merge a wave PR. Never a
secret in a file, an argument, a log or a commit. Never a Secrets
Manager secret; the account id never in code. Where the goal and the
design are silent, choose the simplest thing that keeps the system
consistent and record it in the report; where they are wrong, say so
in the report and build the simplest reading. The design is not
re-decided here. The user's instructions in the session take
precedence over this skill.
