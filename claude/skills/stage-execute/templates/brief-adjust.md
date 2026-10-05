# <A.n | X.n> · <one line>

<!--
  Written by the tech lead. An A.n round holds every adjustment of one
  answer of his, each with one AC; an X.n holds one failing area of local
  CI or a flaky test. Run with exec-entry mode fix. These comments never
  reach the file.
-->

**Kind:** <adjustment round | fix> · **Sides:** <back · front | back | front> · **QA:** <none | backend (touches auth, permissions or personal data) | surface>

## What he said

> <his words, verbatim>   (X.n: the failing lines from the local-ci log, verbatim, and the log path)

## Acceptance

| AC | Criterion | Proved at |
|---|---|---|
| `A.1.1` | <GIVEN … WHEN … THEN …> | <unit · integration · journey · none: copy only> |

## Expected to touch

- `<path>` · <why>

## Done

The entry gate green; for an X.n, the failing command green on the merged tree, with no assert, baseline or gate loosened.
