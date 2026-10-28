# The standards book

The project's own rules, in its own repo, in one folder the project's
`CLAUDE.md` names (`standards: docs/standards`). The pipeline carries
no taste of its own: every stage reads this book, every reviewer cites
it, and the pipeline proposes changes to it when the work shows a gap.
The kit ships the book's templates and its stack packs as the starting
point; the project owns every line after setup.

Read by the `standards` skill, by every stage that reads the project's
rules, and by the `standards-writer`.

## The files

| File | Ids | Holds | Read by |
|---|---|---|---|
| `README.md` | — | the index: each file, what it covers, its owner, the links to the two visual pages, how a rule changes | every stage, first |
| `architecture.md` | `ARC-n` | the map: the system in context, the modules and layers, the golden path of each kind of code, the infrastructure as the IaC declares it, data stores, integrations, how the system grows | design, plan, execute |
| `engineering.md` | `ENG-n` | how code is written: structure, naming, errors, logs and observability, configuration and secrets, API design, data and migrations, concurrency, dependencies, comments, git | design, execute |
| `testing.md` | `TST-n` | what proves what: the layers, one proof per behaviour, the floor, determinism, journeys, actors and fixtures | design, plan, execute |
| `security.md` | `SEC-n` | access and scope, personal data, secrets, input, abuse, the floor cases | design, execute, release |
| `design-system.md` | `DS-n` | foundations (tokens), components, patterns, content, surfaces (the app, e-mails, reports, slides, videos), accessibility, taste | discovery, execute, every report |
| `operations.md` | `OPS-n` | environments, delivery, release, flags, migrations in production, alarms and runbooks, backups, incidents | design, release |
| `features/<domain>.md` | `<DOMAIN>-n` | the feature maps: rules, screens, routes, tables, jobs, how to drive each (the project contract, role 10) | every stage |

A file the project does not need (no screens: no design system) is one
line, `None: <why>`. The book is in English and lives in one
place: rules a project already kept elsewhere are renamed into it at
setup (`git mv`, translated), and the `standards:` line in the project's
`CLAUDE.md` is the only pointer.

## A rule

```markdown
- **ENG-14** · Every outbound call has a deadline, and the deadlines of one request add up below its own timeout. *Why:* an unbounded wait holds a worker and hides the failure.
```

One sentence that says what to do, then why. A rule a reviewer cannot
check is advice: it goes in the file's prose, without an id. Ids never
change and are never reused; a dropped rule keeps its id with
`(retired YYYY-MM-DD: <why>)`.

## How the stages use it

| Stage | Reads | Gives back |
|---|---|---|
| discovery | `design-system.md`, the feature maps | the mock follows the design system; a pattern it lacks is a `[standards]` line |
| design | `architecture.md`, `engineering.md`, `security.md`, `operations.md` | the solution follows them; a design that needs a rule changed is his question; the page's mind map starts from `architecture.md` |
| plan | the golden paths, the gate commands | a kind of code with no golden path: C builds the first, and a `[standards]` line proposes it |
| execute | `engineering.md`, `testing.md`, `security.md`, `design-system.md` | the builders update the feature map and `architecture.md` in the same diff as the change; the reviewer cites ids; a finding no rule covers is a `[standards]` line |
| release | `operations.md` | a step the runbook lacked is a `[standards]` line |
| close | — | harvests the `[standards]` lines into proposals; on his yes, the `standards` skill opens one PR |
| weekly retro | the whole book, the week's citations | rules never cited, findings that keep coming with no rule, rules worth a check |

A `[standards]` line goes in the workstream's `dreaming-notes.md`:
`[standards] <file> · <the rule as it would read> · <the evidence: finding id, path:line>`.

## From rule to check

A rule the reviewers keep enforcing by hand belongs in a machine. When
the weekly retro sees one cited three or more times in a week, it
proposes the check that would catch it (a lint rule, a structure check,
a test helper, a generator) as a demand for `/lets-cook`, on the short
route. The rule stays; the check makes it free.

## The visual pages

Two pages make the book visible, published as artifacts and linked from
`README.md`, rebuilt by the `standards` skill whenever their source file
changes:

| Page | From | Shows |
|---|---|---|
| `Architecture - <project>` | `architecture.md` | the system as a mind map: modules, patterns, infrastructure, every connection; each node opens its golden path |
| `Design System - <project>` | `design-system.md` and the exported tokens | the living style guide: the foundations rendered, each component in its states, the patterns, light and dark |

## How a rule changes

Only by a pull request in the project, with the why and the evidence,
approved by whoever the project's `CODEOWNERS` names for the folder.
The pipeline proposes; it never merges a change to the book on its own.
