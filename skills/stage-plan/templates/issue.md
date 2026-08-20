<!--
GitHub issue body — stage 3. This file IS the issue, verbatim: the
bootstrap pipes it via `gh issue create --body-file`. The reader is a
cold worker: no conversation context, just this text and the repo.

Must-haves this template carries (see plan-author for the full rules):
- dense core embedded; broad material referenced, never re-explained
- an implementation reference (`file:line` — "do it like this one")
  whenever a pattern to follow exists in the repo
- Produces/Consumes in natural keys; shared modules by exported SURFACE
- ACs in Given/When/Then at the OUTER boundary, traced to story AC IDs;
  at least one AC exercises a bad path
- verification map is fail-to-pass: each check fails today, passes
  after the diff; binary, observable, commandable
- smoke cases copied BY NAME from the contract's Smoke line — never
  invented at planning time
- every "Out" and every pending "Consumes" points at an issue (→ NN)
- NO estimate, NO file list, NO deps in the body (deps live in the
  graph via addBlockedBy, fed from plan.md's edge table)
- no open questions: "evaluate whether…" in a body is a planning defect
- the plan-id marker at the end is the bootstrap's idempotency anchor
-->

## Objective

<2–3 sentences: the capability this issue delivers and where it sits in
the design. The "why" a human would skip — the cold worker will not.>

## Context

<The dense core: expected behavior + the relevant contract shape
(request → response, event, schema) + the design decisions that shape
this issue. The slice, not the document.>

## Reading map

- Contract: `<designs-root>/<workstream>/wNN-<wave>/01-design/contracts.md` §<section> — exact shapes
- Flow: `<designs-root>/<workstream>/wNN-<wave>/01-design/architecture.md` §<section>
- Implementation reference: `<file>:<line>` — do it like this one
  <!-- when a pattern to follow exists in the repo; otherwise state the
       approach the architecture suggests for this slice -->

- Repo conventions: `CLAUDE.md` + `docs/`

## Produces / Consumes

- **Produces:** `<natural key>` · `<exported surface>`
- **Consumes:** `<key>` (→ NN) · `<key>` (already exists)

## Scope

- **In:** <what is hers>
- **Out:** <what looks like hers but belongs to another> (→ NN)

## Acceptance criteria

- `<SLUG>-S-NNN-AC-1` — **Given** <state> **when** <action at the outer
  boundary> **then** <observable result>
- `<SLUG>-S-NNN-AC-2` — **Given** <bad-path precondition> **when**
  <action> **then** <defined failure behavior, status + body>

## Verification map

| AC | Turns green in |
|----|----------------|
| AC-1 | unit — behavior at the use-case boundary + smoke vs the deployed env |
| AC-2 | unit — the bad path, clock/failure injected |
| AC-3 | e2e — owning integration issue (→ NN) |

## DoD

- [ ] Test suite green, coverage without regression
- [ ] `docs/` updated OR "no docs impact" stated in the PR evidence
- [ ] Smoke cases this issue owes (from the contract's `Smoke:` line, by
      name): `<method>-<behavior>.sh` · … — created/updated; removed
      endpoints delete theirs <!-- omit the item when no endpoint is touched -->
- [ ] <issue-specific executable check>
- [ ] System works after this merge alone — no waiting on sibling issues

<!-- plan-id: <workstream>/<repo>/<NN> -->
