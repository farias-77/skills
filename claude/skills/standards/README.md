# standards

Builds and keeps a project's standards book in the project's own repo:
the architecture map, the engineering, testing, security and operations
rules, the design system, and the feature maps. Every stage of the
pipeline reads the book instead of rediscovering the project; every
reviewer cites its rule ids; the pipeline proposes changes when the
work shows a gap, and he rules them at the weekly retro.

```
setup:  scouts read the repo → one writer per file (template + repo + existing rules) → his questions → Architecture and Design System pages → one PR
update: the rules he approved at the weekly → one writer per file → the pages it touches → one PR
```

## Install

Part of the pipeline: install the whole `claude/` folder (see the
repo's README). It needs the agents `scout`, `standards-writer` and
`artifact-builder`.

## Files

| Path | What |
|---|---|
| `SKILL.md` | setup and update, step by step |
| `references/book.md` | the book's contract: the files, a rule, how each stage reads it, from rule to check, the visual pages |
| `references/stacks/go-backend.md` · `react-frontend.md` | stack packs: the defaults a project on that stack starts from, read by the builders where the book leaves a choice to the stack |
| `templates/README.md` | the book's index for a project |
| `templates/architecture.md` · `engineering.md` · `testing.md` · `security.md` · `design-system.md` · `operations.md` | the book's files, with complete defaults |
