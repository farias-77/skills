---
name: standards
description: Builds and keeps a project's standards book - its architecture map, engineering, testing, security, design system and operations rules, and the feature maps - in the project's own repo, so every stage follows the project's rules instead of rediscovering them. setup reads the repo and drafts the book from the kit's templates, with him deciding only where the repo is inconsistent or silent; update applies the proposals he approved at the weekly retro. Both open one pull request and refresh the two visual pages (Architecture, Design System). Use when a project has no standards folder, when its stages stop for a missing one, or when the weekly retro hands over approved proposals.
argument-hint: "setup | update <project>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Artifact, Skill, Bash
---

# Standards

The pipeline carries no taste of its own. Each project keeps its rules
in its own repo, in one book every stage reads and every reviewer cites
by id; the kit ships the starting point (the templates and the stack
packs) and the loop that keeps it alive. This skill builds the book
once, and afterwards changes it only by a pull request he approved.

## The bar

The book is done when every line holds:

1. The project's `CLAUDE.md` has `standards: <folder>`, and the folder
   has every file of [references/book.md](references/book.md) (or its
   `None: <why>` line), its `README.md` mapping each to the project's
   path.
2. Every rule that describes what the code does today was checked
   against the repo, with its `path:line`; every rule taken from a
   template that the repo contradicts was decided by him.
3. `architecture.md` names every module, golden path, cloud resource
   and integration the repo has; `design-system.md` has the project's
   tokens and components in its tables.
4. The two pages, `Architecture - <project>` and
   `Design System - <project>`, are published and linked from
   `README.md`.
5. The change is one pull request in the project, ready for its code
   owner.

## The flow

```
setup  → S0 recon (scouts) → S1 drafts (one writer per file) → S2 his questions ◄ him
       → S3 the pages → S4 one pull request
update → U1 the approved rows → one writer per touched file → S3 the pages it touches → S4
```

| Step | Who (model, effort) | Produces |
|---|---|---|
| S0 recon | `scout` (Haiku 5.5, high) × N | `<scratch>/recon/<topic>.md` |
| S1 drafts | `standards-writer` (Sonnet 5.5, high) × file | the book's files, each with its open questions |
| S2 his questions | you (Opus 5.5, medium) + him | the answers in the files |
| S3 the pages | `artifact-builder` (Sonnet 5.5, medium) × 2 | `Architecture - <project>`, `Design System - <project>` |
| S4 the pull request | you | one branch `standards/<date>`, one PR |

## What you read

| File | When |
|---|---|
| [references/book.md](references/book.md) | at the opening: the files, a rule, how the stages use it |
| `templates/` | handed to the writers, never copied by you |
| `references/stacks/` | handed to the writers of `engineering.md` and `design-system.md` when the repo's stack matches a pack |

## Files

```
<project>/<standards folder>/        the book (in the project's repo)
├── README.md · architecture.md · engineering.md · testing.md · security.md
├── design-system.md · operations.md
└── features/<domain>.md             the feature maps (kept where the project already keeps them)
<scratch>/standards-<project>/       recon/, the pages' sources (never committed)
```

## Opening

1. **The kit.** `realpath ${CLAUDE_SKILL_DIR}/../..`.
2. **The house Open.** Read `<kit>/../CLAUDE.md` and run its Open: the
   pulls, who else is working (a stage in flight on this project reads
   the book: the PR waits for no one, the merge is the owner's).
3. **The folder.** The project's `CLAUDE.md` line `standards: <path>`;
   none → propose `standards: docs/standards` in one line and, on his
   yes, write it. The book is in English. A project that keeps rules
   elsewhere (another folder, another language, a `CONTRIBUTING.md`)
   has them moved into the book, in English, by the writers of S1: the
   pull request renames the old files into the book (`git mv`), so one
   place remains, and updates every link to the old path. The
   `standards:` line in the project's `CLAUDE.md` is the only pointer.

## Setup

**S0 · Recon.** One `scout` per question, all at once, each quoting
`path:line` from the default branch:

- the layout: modules, layers, entry points, and one exemplar per kind
  of code (the golden-path candidates);
- the infrastructure as the IaC declares it (resources, environments,
  identities) and the CI's workflows;
- how the code does errors, logs (library, fields, event names),
  configuration, API errors, migrations, tests (layers, fixtures,
  actors);
- the frontend's tokens, components, e-mail templates;
- the rules already written anywhere in the repo, and where.

**S1 · Drafts.** One `standards-writer` per file of the book, at once:
the file's template, `book.md`, the recon, the project's existing rule
files, the matching stack pack. Each writer, in English, keeps every
template rule the repo agrees with, adapts the ones it contradicts only
where the repo is consistent, and returns the rest as questions.

**S2 · His questions.** Merge the writers' questions; one per decision,
four per call, through the question tool, your pick first. A question
the repo answers consistently is never his. Send each writer its
answers.

**S3 · The pages.** Two `artifact-builder`s, by the brief in book.md
"The visual pages": `Architecture - <project>` from `architecture.md`
as a mind map, every node opening its golden path; `Design System -
<project>` from `design-system.md` and the exported tokens, each
component in its states, light and dark. Each page is published once
its look check is clean, and its link goes into `README.md`.

**S4 · The pull request.** A branch `standards/<YYYY-MM-DD>` in the
project, one commit per file, the PR body listing what was observed,
what came from a template and what he decided. Its code owner merges.

## Update

**U1.** The rows he approved at the weekly retro (file · the rule as it
reads · the evidence), and the map drifts. One `standards-writer` per
touched file, in update mode: a new rule takes the next id, a changed
rule keeps its id, a dropped one is marked retired. Then S3 for a page
whose source changed, and S4 with the weekly's board linked in the PR
body.

## Resuming

`/standards setup <project>` again reads the branch `standards/*` if
one is open and continues from the first file without its writer's
return; a merged book is never set up twice: changes go through update.
