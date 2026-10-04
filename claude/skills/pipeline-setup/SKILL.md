---
name: pipeline-setup
description: Brings a project to the pipeline's bar (docs/project-contract.md). Audits every role of the bar with six scouts (Sonnet 5.5, low) reading the default branch's sha, finds where the pipeline's sessions open (one repository or a root above the product), and writes pipeline-readiness.md on a pipeline-setup branch of the project (✓ present, ~ partial, ✗ missing, each with its evidence path:line); proposes an ordered plan to close each gap, cheapest first, with templates for the generic pieces (structure check calibrated from the codebase's p95/p99, golden paths, local CI with a GitHub commit-status signoff, permission settings, the guard-irreversible PreToolUse hook, the design-tokens export); and, on the user's word, applies the plan on that branch (and on a branch of the doctrine's repository when it is another), never on main, one commit per gap, closing with one run of the whole gate. The session runs on Opus 5.5 at medium effort. Use when adopting the pipeline in a project, when a stage halted at its pre-flight for a missing role, or to re-audit after the project changed.
disable-model-invocation: false
argument-hint: "<path-to-project>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Bash
---

# Pipeline setup

A project comes in. The pipeline runs smoothly on it only when it
provides the roles the bar names: a doctrine, golden paths, a gate that
runs locally, an isolated stack per worktree, a structure check, the
release roles, the permissions that make autonomy safe. The bar is
[`docs/project-contract.md`](../../../docs/project-contract.md); it
names 24 roles in three levels (required, recommended, for the full
experience). This skill measures the project against it, says what is
missing, and closes the cheap gaps itself.

```
/pipeline-setup <path>
  0. Open      the project, its git state, the bar; where the pipeline's sessions open;
               where the doctrine lives; the remote's kind; an audit worktree at the default sha
  1. Audit     six scouts (Sonnet 5.5, low) in parallel, reading the audit worktree
               → the session rates each role
  2. Propose   the gaps ordered cheapest first, dependencies respected; templates for the
               generic ones; the engineering gaps as demands; what only the user can do
               → pipeline-readiness.md committed on branch pipeline-setup
               → ONE question: apply, pick, or stop at the plan
  3. Apply     the setup worktree (and a doctrine branch when the doctrine is another repo)
               → one commit per gap, each checked by a command → never main, never pushed
  4. Close     the whole gate once; no placeholder left; the readiness file updated and
               committed; push and PR only on his word
```

## The team

| Who | Does |
|---|---|
| the session (Opus 5.5, medium) | rates every role from the scouts' quotes, writes the readiness file and the plan, applies the templates, runs each check |
| `scout (Sonnet 5.5, low)` ×6 | one per group of roles in `references/audit.md`; quotes the lines that answer, with `path:line`, where it looked, what it did not find |

The session never reads the project to look something up: that is the
scouts' (house rule). It opens a project file itself only when it is
about to rule on it (rate a role whose quote is ambiguous) or when it
is writing it (a template it applies).

## Step 0 — open

If the session is not on Opus 5.5, ask the user to switch (`/model`)
and wait; medium effort is enough.

- Resolve `<path>` to an absolute path. It must be a git repository
  (`git -C <path> rev-parse --show-toplevel`); otherwise stop and say so.
- Record the default branch (`git -C <path> symbolic-ref --short
  refs/remotes/origin/HEAD`, else `main`) and its sha.
- **The audit worktree.** The audit reads that sha, never the user's
  working tree (it may sit on another branch or carry uncommitted
  work, and a scout's Read and Grep see only files on disk):
  `git -C <path> worktree add --detach <path>-audit <sha>`. Every scout
  reads there; Step 4 removes it.
- **Where the pipeline's sessions will open.** Claude Code loads
  `.claude/settings.json`, and the hooks it registers, from the
  directory the session opens in. Find the `CLAUDE.md` that names the
  doctrine: in `<path>`, else in the nearest directory above it that
  has a `CLAUDE.md` or a `.claude/skills/`. When it is above, this is a
  **two-root layout**: a root (often its own repository) holds
  `CLAUDE.md`, the doctrine and `.claude/skills/`, and the product is a
  child repository; the pipeline's sessions open at the root. Ask the
  user, through the question tool, where they open: at the root
  (recommended in a two-root layout: it is where `CLAUDE.md` and the
  skills are), in the product repository, or both. The answer is the
  list of **session roots**; role 12 is installed in each one. In a
  one-repository layout there is nothing to ask: the session root is
  `<path>`.
- **Where the doctrine lives.** `git -C <doctrine folder> rev-parse
  --show-toplevel`. When it is not the product repository, its changes
  go on a branch of their own in that repository (Step 3), and the
  scouts read it at its default branch the same way (a second detached
  worktree when its working tree is not on that branch).
- **The remote's kind.** `git -C <path> remote get-url origin`. GitHub
  (`github.com[:/]<owner>/<repo>`) gives the owner and repo for the
  signoff and the protection read. Anything else (a bare path, another
  host): the session never calls `gh` or the GitHub API for this
  project, and the GitHub-only parts read `n/a: non-GitHub remote`.
- Read this skill's `references/audit.md` (the scouts' questions and
  the rating rule), `templates/README.md` (how a template is filled)
  and the roles table of the bar. These are the skill's own references.
- If the branch `pipeline-setup` exists, this is a re-run: ask whether
  to continue it or start again from the default branch. Its
  `pipeline-readiness.md` is the previous audit: keep its "Applied"
  section and compare the marks at the end.

## Step 1 — audit

Dispatch the six scouts **in one message**, in the background, one per
group of `references/audit.md` (A doctrine and layout · B commands ·
C the local stack · D release and permissions · E design and
observability · F capacity and runner). Each prompt carries:

- the audit worktree's absolute path and the sha (the doctrine's
  worktree too, when it lives in another repository), and the session
  roots;
- its group's rows, verbatim, as the question: per role, what to look
  for, what makes it present, what makes it partial;
- the answer's shape: per role, the literal lines with `path:line`;
  where it looked (folders and terms); what it did not find.

While they run, run the probes of `references/audit.md` yourself
(versions, machine size, the remote, and the branch protection read
on a GitHub remote only).
They are one-line commands; quote their output as it is.

When the scouts return, **rate every role** by the rule in
`references/audit.md`: ✓ only on evidence that the role does what the
bar says, ~ when a part is missing, ✗ only when the scout's search
covered where the role would be. A scout that did not look where the
role would live is sent again with those places; a mark is never given
on a search that did not look. A role that does not apply (no screens)
is `n/a` with the reason.

Write the readiness file from
[templates/pipeline-readiness.md](templates/pipeline-readiness.md):
the layout (session roots, doctrine, remote, the sha read), the counts
per level, the verdict in one sentence (which stages can run today;
the first gap that halts one), every role with its mark, the literal
evidence and the gap, the probes, where the scouts looked. It never
goes in the user's working tree, where his next `git add -A` would
pick it up: it goes in the setup worktree, created now from the
audited sha (on a continued re-run, the existing one):

```
git -C <path> worktree add <path>-pipeline-setup -b pipeline-setup <sha>
```

## Step 2 — propose

Order every ✗ and ~ into one plan, **cheapest first**; within a cost,
required before recommended before full experience; within a level,
the role whose absence halts the earliest stage first. **A step that
consumes another step's output comes after it, whatever the order
above says:** the structure check's calibration (#7) before golden
paths (#2), whose size line quotes the p95/p99 the calibration writes.

| Cost | What it is | Who closes it |
|---|---|---|
| **S** | a template copied and filled from what the audit found; under an hour | setup, in Step 3 |
| **M** | a template adapted to the stack (a calibration run, an export script, sections filled from existing journeys); a few hours | setup, in Step 3 |
| **L** | engineering on the product: an isolated stack, an affected-tests selector, observability as code, progressive delivery, a cloud runner | a demand of its own through the pipeline, starting at discovery; setup writes its one-paragraph brief and its acceptance |

What each gap becomes:

| # | Role | Usual fix | Cost | Template |
|---|---|---|---|---|
| 12 | permissions and guard | in **every session root** of Step 0: `.claude/settings.json` merged with the one there; the pipeline's guard copied to `.claude/hooks/` (its test to `.claude/hooks/tests/`), registered for Bash and every file tool, and tested; dead rules pruned; a doctrine no-comment rule excludes `.claude/hooks/` | S | [settings.json](templates/settings.json), the pipeline's `claude/hooks/guard-irreversible.sh` and its test `claude/hooks/tests/guard-irreversible.test.sh`, [permissions.md](templates/permissions.md) |
| 1 | doctrine index | the index of the documents that exist, and the pointer in `CLAUDE.md` | S | — |
| 8 | shared files list | a doctrine section listing the files the audit found | S | — |
| 9 | feature maps | a doctrine line naming where they live | S | — |
| 13 | local-CI signoff | the script and its document, the gate, the selector and the stack-down role as its commands; requiring it on `main` goes to the user | S | [local-ci.sh](templates/local-ci.sh), [local-ci.md](templates/local-ci.md) |
| 7 | structure check | the folder copied with its pinned manifests, fences from the doctrine, calibrated on the default branch, wired into the gate (and into hosted CI with history and a base, when CI runs the gate) | M | [structure-check/](templates/structure-check/) |
| 2 | golden paths | one exemplar per kind, picked by a written rule, present at the sha and under p95; after #7 | M | [golden-paths.md](templates/golden-paths.md) |
| 14 | verify map | a section per feature map with something built to drive, filled from its existing journeys, in the maps' language | M | [verify-map.md](templates/verify-map.md) |
| 15 | design tokens | the export, in the repo's own tooling language, and the components list; the per-state screenshots are M with a component catalogue, **L without one** (a demand) | M (export) · L (samples) | [design-tokens-export.md](templates/design-tokens-export.md) |
| 3, 4, 5, 6, 10, 11, 16, 19, 20 | gate, commands, stack, evidence, browser, release, observability, progressive delivery, runner | engineering | L, or M when the pieces exist and only need a command that names them | — |
| 24 | sized gate | per missing part: the per-entry gate passes the primary project and the width tag (`--project=desktop` plus `--grep @phone` on the phone project), evidence behind a flag (`EVIDENCE=1`), the affected step stops re-running the server suites the check ran, the selector maps non-UI files to no screen tests and the lockfile to the whole suite only on a runtime or test-runner dependency; the whole gate keeps every width, visual, the full server suites and evidence; the doctrine's testing document names the width, the tag and the flag | S per flag or mapping · M for the import-graph selector | — |
| 17 | capacity | measured by the plan stage's machine scout on its first run | — | — |
| 18 | autonomous release | after 12 and 13: the template already allows the merge and the prod deploy; the guard asks on any merge whose head the play did not authorize; the signoff required on `main` is his | S, his call | [permissions.md](templates/permissions.md) |
| 21 | video toolchain | install Node LTS and ffmpeg on the station | S, his machine | — |
| 22 | mock toolchain | install Node 18+, `playwright-core` and a Chromium on the station; set `PLAYWRIGHT_DIR` (and `PROTO_CHROME` when the browser is not on a common path) | S, his machine | — |
| 23 | the smoke | the journey command takes a base URL and a journey selection; the read-only journeys marked; the staging actors named in the doctrine | M when the journeys exist and only the URL and the marks are missing · L without journeys | — |

Some steps are the user's alone: requiring the signoff on `main`
(branch protection is a security posture), moving release to the
autonomous posture, installing on his machine, anything with a secret.
List them under "What only the user can do", each with its ready `!`
command, and never run them.

**Requiring `local-ci` on `main` is a doctrine decision first** when
the doctrine names another check as the one `main` requires (the
hosted CI's aggregate job, usually). The plan lists it as his doctrine
ruling, quoting the doctrine lines it changes, ahead of the protection
command; the protection command alone would contradict the doctrine.

Write the plan into the readiness file and commit it in the setup
worktree as the branch's first commit, so the report is on a branch
whatever he answers:

```
git -C <path>-pipeline-setup add pipeline-readiness.md
git -C <path>-pipeline-setup commit -m "pipeline-setup: readiness audit at <sha12>" -- pipeline-readiness.md
```

Then show the user, in the terminal, the counts per level, the
verdict, and the plan as one table (step, gap, fix, cost). Ask **one
question** through the question tool:

- "Apply the S and M steps on a branch" (recommended) — setup does
  them now, one commit each, nothing on main;
- "Apply only the ones I pick" — a second question lists the steps,
  four to a call;
- "Stop at the plan" — the readiness file, committed on the branch, is
  the output; Step 4 closes without applying.

## Step 3 — apply

Never on the default branch and never in the user's working tree: the
work happens in the setup worktree of Step 1.

**Every other repository the plan touches gets its own branch.** The
doctrine in another repository, and the root of a two-root layout
(role 12's settings and guard): a worktree on a `pipeline-setup` branch
from that repository's default branch (`origin/<default>` when it has
a remote, the local default branch when it has none). Each change
there is its own commit, and its message carries the why in its body:
which role it serves, what the setup branch of the product added, and
the doctrine line it extends. A step that names its command in the
doctrine is two commits, one per repository.

Then, per approved step, in plan order:

1. **Write** the files from the template, filled with what the audit
   quoted: the project's real commands in place of every placeholder,
   its real paths, its doctrine lines in `rule` fields. A template's
   example that does not fit the project is deleted, not left in. The
   templates carry no code comments, so a doctrine that forbids them
   takes the scripts as they are; their explanation is the document
   copied beside each (`templates/README.md` says which). A script the
   project would rather have in its own tooling language is a question
   for the team in the readiness file, not a rewrite.
2. **Merge, never overwrite.** An existing `.claude/settings.json` keeps
   every rule it has: lists are unioned, and where the project's rule is
   stricter it wins. An existing doctrine document gets a section, not
   a rewrite.
3. **Check** with a command and keep its output for the readiness file:

   | Step | The check |
   |---|---|
   | permissions | in each session root: `jq . .claude/settings.json`; every rule naming a target probed with the runner's dry run (`make -n <target>`, or the project's equivalent) and the rules it does not find removed; `bash .claude/hooks/tests/guard-irreversible.test.sh` all green and `.claude/hooks/guard-irreversible.sh --self-test` passes, with the project's own rules added as cases |
   | structure check | `--calibrate origin/<default> --write`, then `--summary origin/<default>` shows `boundary_violations: 0` (a fence that fires on today's code goes to the readiness file as a question for the team, and its rule is left out), then a check of `HEAD~1..HEAD` on any recent commit exits 0 or 1, never 2; when hosted CI runs the gate, its checkout fetches history and passes the base (`structure-check/README.md`) |
   | local CI | the affected command without `--post` passes in a clean worktree, and afterwards `git worktree list` shows no leftover and the stack-down role left no stack of that worktree running. The whole-gate command is not run per step: it is Step 4's final proof |
   | golden paths | every exemplar listed at the audited sha (`git ls-tree -r --name-only <sha> -- <path>`), not at a research note's or another branch's, and `structure-check.sh --measure <repo> <sha> <paths>` exits 0; an exemplar over p95 is replaced by the next one the rule picks |
   | verify map, doctrine sections | every path and command they name exists; the verify map is in the maps' language |
   | design tokens | the export command runs and `tokens.css` holds every token of `tokens.json` |

4. **Commit** that step alone: `git add <its paths>` and
   `git commit -m "pipeline-setup: <role> (#<n>)" -- <its paths>`. One
   commit per gap; a red check is fixed before the commit, or the step
   is dropped and the readiness file says why.

Setup never writes a rule the team did not state. The doctrine index
lists documents that exist; the golden paths name modules that exist,
picked by a rule it writes down; the structure check's fences come from
lines the doctrine already has. A missing doctrine topic is a gap for
the team, listed, never invented.

## Step 4 — close

When he stopped at the plan, skip to the report: there is no final
proof and nothing applied.

**The final proof.** Run the whole gate once at the branch tip, in a
clean worktree, under `nice`: the local-CI command without `--post`
(the whole-gate context). It is the slowest command the project has,
minutes to tens of minutes, more on a machine already running other
stacks; it runs here once, never per step. Copy its last output line
verbatim into the readiness file, after it ran; the line is never
written first as a stand-in to fill later. A gate that cannot run here
(a secret the station lacks, a stack that does not come up) is written
as that, with the reason.

Update the readiness file in the setup worktree: the new marks, the
"Applied" tables (each repository's commits, gap, files, the check and
its result), the rules removed as dead, the final proof, what is left
(the L demands with their briefs, the user's own steps). **No
placeholder survives**: before the commit,
`grep -nE '<[^>[:space:]=][^>]*>' pipeline-readiness.md` and the same over every
golden-paths file, verify map and settings file the branch added
return nothing but real markup; a value not known is written as what
it is. Commit it as the branch's last commit. Remove the audit
worktree (`git -C <path> worktree remove <path>-audit`).

Report to the user as a table: each commit with its repository, gap
and check, the final proof's line, then what is left and who carries
it. Ask **one question**: "Push the branches and open pull requests"
(recommended: the team reviews them like any change; on a non-GitHub
remote, "Push the branches") or "Leave them local". Never merge them.

## Boundaries

- Never on the default branch, never in the user's working tree, never
  a force-push, never a merge.
- Never posts a commit status, changes branch protection, writes a
  secret or reads one: those are the user's, listed with their command.
- Never invents doctrine, thresholds or exemplars: thresholds come from
  the calibration, exemplars from the code, rules from the doctrine.
- Never edits the pipeline repo; a gap in the bar itself is noted in
  the readiness file for the weekly retro.
- Re-running is safe: the audit reads the default branch's sha in its
  own worktree, and the apply step continues or restarts its own
  branch.
- Never queries GitHub for a remote that is not GitHub.
