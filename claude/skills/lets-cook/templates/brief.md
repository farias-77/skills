# Brief · <slug>

<!-- One page. Written by lets-cook in his language; the entry's builders
     work from it as from a plan brief. gitleaks runs on the folder before
     anything leaves the machine. -->

- **Route:** short \| hotfix · **Repo:** <repo> \| `repo: legacy` <repo>
- **Branch:** `feat/<slug>` \| `hotfix/<slug>` from `main`

## The ask

> <his words, verbatim>

Hotfix: broken since <version or hour> · who is blocked: <who> · evidence: <log line or query, with where it came from> · staging check: his \| delegated

## ACs

- **AC-1** GIVEN <a concrete state> WHEN <one action> THEN <an observable result with concrete values>
- **AC-2** …

<!-- hotfix: AC-1 is the one that reproduces the bug -->

## Assumed

- <what you decided without asking; he sees it when he uses it>

## Contract

<only when the API changes: each field required · optional · nullable, the error codes> | no API change

## Proof

| AC | Layer that proves it |
|---|---|
| AC-1 | <unit · integration · e2e> <!-- hotfix: red before the fix --> |

## The seed shows

<what the local environment must have for him to see the change: the rows, the actors>

## Out

- <what not to do>
