<!--
The house PR body — written by exec-pr-writer, verbatim structure.
Title (not in the body): conventional, imperative, referencing the
change — `feat(<scope>): <verb> <noun>`.

Rules this template stands on:
- Testing done is MANDATORY and VERBATIM: the pr-writer's OWN runs,
  never the implementer's claims. A summary of evidence is not
  evidence.
- Lens notes travel here so the final reviewer can judge them.
- Decisions and Risks match what the diff actually does — an honest
  body is part of the review surface.
-->

## Summary

<2–4 sentences: the capability this PR delivers and where it sits in
the wave. What a reviewer needs to orient, nothing more.>

## Changes

<The commit map — one line per commit, in order: `<sha7> <type(scope)>: <what>`.
The atomic commits ARE the story; this section is its table of contents.>

## Testing done

<VERBATIM, from the pr-writer's own runs:
- the gate totals (test suites/tests, coverage summary, lint/build lines)
- the AC → test map, each verified passing
- when the diff touches infra: the annotated infra diff snippet and
  the three written answers of the diff protocol
- any pre-existing out-of-diff failure, with the parent-commit proof>

## Lens notes (non-blocking)

<The `fix`-severity findings the lens round left as notes — one line
each, lens and rule id included. The final reviewer rules on them.
"(none)" when empty.>

## Decisions

<Decisions taken inside this issue's scope, house decision-block
format — or "(none)".>

## Risks

<What could break and where to look first — or "(none identified)".>

Closes #<issue-number>
