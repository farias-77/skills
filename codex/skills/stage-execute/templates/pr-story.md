<!--
  The body of a story PR (story branch → wave branch). Title outside
  the body: `<type>(<scope>): <what>`, conventional. The review section
  carries the numbers only; the detail is in
  03-execution/wNN-<slug>/reviews/<N.k>/. Every line of "Proof" comes
  from the conductor's own runs. Language: the goal's.
-->

## Delivers

<two or three sentences: the row N.k, what exists after this PR, for whom>

## Commits

<one line per commit, in order: `<sha7> <type(scope)>: <what>`>

## Review

| Round | Findings | Sustained | Deferred | Dismissed |
|---|---|---|---|---|
| 1 | <n> (fidelity <n> · code <n> · proof <n> · security <n> · operations <n>) | <n> | <n> | <n> |
| 2 | <n> (…) | <n> | <n> | <n> |

Notes: <id · lens · one line each, from round 2; "(none)">

## Proof

- tests: <n> passed · coverage <n>% (the runner's own line)
- lint · build · synth: <one line>
- alpha: `smoke/<folder>/` <n>/<n> — `03-execution/wNN-<slug>/proof/<N.k>-smoke.txt`
- screens: <list of proof/ files, front rows>
- CI: <green · run url>

## Chosen where the documents were silent

<one line each: the choice, the alternative, why; "(none)">

## Improvements and departures

<one line each, marked improvement or departure, as in report.md; "(none)">

<attribution trailer>
