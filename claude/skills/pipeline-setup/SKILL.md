---
name: pipeline-setup
description: Brings a project to the pipeline's bar (docs/project-contract.md). Audits every role of the bar with six scouts (Sonnet 5.5, low) and writes pipeline-readiness.md in the project (✓ present, ~ partial, ✗ missing, each with its evidence path:line); proposes an ordered plan to close each gap, cheapest first, with templates for the generic pieces (structure check calibrated from the codebase's p95/p99, golden paths, local CI with a GitHub commit-status signoff, permission settings, the guard-irreversible PreToolUse hook, the design-tokens export); and, on the user's word, applies the plan on a branch of the project, never on main, one commit per gap. The session runs on Opus 5.5 at medium effort. Use when adopting the pipeline in a project, when a stage halted at its pre-flight for a missing role, or to re-audit after the project changed.
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
names 22 roles in three levels (required, recommended, for the full
experience). This skill measures the project against it, says what is
missing, and closes the cheap gaps itself.

```
/pipeline-setup <path>
  0. Open      the project, its git state, the bar
  1. Audit     six scouts (Sonnet 5.5, low) in parallel → the session rates each role
               → <project>/pipeline-readiness.md (uncommitted)
  2. Propose   the gaps ordered cheapest first; templates for the generic ones;
               the engineering gaps as demands; what only the user can do
               → ONE question: apply, pick, or stop at the plan
  3. Apply     a worktree on branch pipeline-setup from the default branch
               → one commit per gap, each checked by a command → never main, never pushed
  4. Close     the readiness file updated and committed; push and PR only on his word
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
  refs/remotes/origin/HEAD`, else `main`) and its sha. The audit reads
  that sha, not the working tree.
- Read this skill's `references/audit.md` (the scouts' questions and
  the rating rule) and the roles table of the bar. These are the
  skill's own references.
- If `<path>/pipeline-readiness.md` exists, this is a re-audit: keep
  its "Applied" section and compare the marks at the end.

## Step 1 — audit

Dispatch the six scouts **in one message**, in the background, one per
group of `references/audit.md` (A doctrine and layout · B commands ·
C the local stack · D release and permissions · E design and
observability · F capacity and runner). Each prompt carries:

- the project's absolute path and the sha;
- its group's rows, verbatim, as the question: per role, what to look
  for, what makes it present, what makes it partial;
- the answer's shape: per role, the literal lines with `path:line`;
  where it looked (folders and terms); what it did not find.

While they run, run the probes of `references/audit.md` yourself
(versions, machine size, the remote, the branch protection read).
They are one-line commands; quote their output as it is.

When the scouts return, **rate every role** by the rule in
`references/audit.md`: ✓ only on evidence that the role does what the
bar says, ~ when a part is missing, ✗ only when the scout's search
covered where the role would be. A scout that did not look where the
role would live is sent again with those places; a mark is never given
on a search that did not look. A role that does not apply (no screens)
is `n/a` with the reason.

Write `<path>/pipeline-readiness.md` from
[templates/pipeline-readiness.md](templates/pipeline-readiness.md):
the counts per level, the verdict in one sentence (which stages can
run today; the first gap that halts one), every role with its mark,
the literal evidence and the gap, the probes, where the scouts looked.
Leave it uncommitted on the user's tree; it is a report until Step 3.

## Step 2 — propose

Order every ✗ and ~ into one plan, **cheapest first**; within a cost,
required before recommended before full experience; within a level,
the role whose absence halts the earliest stage first.

| Cost | What it is | Who closes it |
|---|---|---|
| **S** | a template copied and filled from what the audit found; under an hour | setup, in Step 3 |
| **M** | a template adapted to the stack (a calibration run, an export script, sections filled from existing journeys); a few hours | setup, in Step 3 |
| **L** | engineering on the product: an isolated stack, an affected-tests selector, observability as code, progressive delivery, a cloud runner | a demand of its own through the pipeline, starting at discovery; setup writes its one-paragraph brief and its acceptance |

What each gap becomes:

| # | Role | Usual fix | Cost | Template |
|---|---|---|---|---|
| 12 | permissions and guard | `.claude/settings.json` merged with the project's; the pipeline's guard copied to `.claude/hooks/` (its test to `.claude/hooks/tests/`), registered for Bash and every file tool, and tested | S | [settings.json](templates/settings.json), the pipeline's `claude/hooks/guard-irreversible.sh` and its test `claude/hooks/tests/guard-irreversible.test.sh`, [permissions.md](templates/permissions.md) |
| 1 | doctrine index | the index of the documents that exist, and the pointer in `CLAUDE.md` | S | — |
| 8 | shared files list | a doctrine section listing the files the audit found | S | — |
| 9 | feature maps | a doctrine line naming where they live | S | — |
| 13 | local-CI signoff | the script, the gate as its command; the protection rule goes to the user | S | [local-ci.sh](templates/local-ci.sh) |
| 7 | structure check | the folder copied, fences from the doctrine, calibrated on the default branch, wired into the gate | M | [structure-check/](templates/structure-check/) |
| 2 | golden paths | one exemplar per kind, picked by a written rule | M | [golden-paths.md](templates/golden-paths.md) |
| 14 | verify map | a section per feature map, filled from its existing journeys | M | [verify-map.md](templates/verify-map.md) |
| 15 | design tokens | the export script and its three files | M | [design-tokens-export.md](templates/design-tokens-export.md) |
| 3, 4, 5, 6, 10, 11, 16, 19, 20 | gate, commands, stack, evidence, browser, release, observability, progressive delivery, runner | engineering | L, or M when the pieces exist and only need a command that names them | — |
| 17 | capacity | measured by the plan stage's machine scout on its first run | — | — |
| 18 | autonomous release | after 12 and 13: the template already allows the merge and the prod deploy; the guard asks on any merge whose head the play did not authorize; the signoff required on `main` is his | S, his call | [permissions.md](templates/permissions.md) |
| 21 | video toolchain | install Node LTS and ffmpeg on the station | S, his machine | — |
| 22 | mock toolchain | install Node 18+, `playwright-core` and a Chromium on the station; set `PLAYWRIGHT_DIR` (and `PROTO_CHROME` when the browser is not on a common path) | S, his machine | — |

Some steps are the user's alone: requiring the signoff on `main`
(branch protection is a security posture), moving release to the
autonomous posture, installing on his machine, anything with a secret.
List them under "What only the user can do", each with its ready `!`
command, and never run them.

Write the plan into the readiness file. Then show the user, in the
terminal, the counts per level, the verdict, and the plan as one table
(step, gap, fix, cost). Ask **one question** through the question tool:

- "Apply the S and M steps on a branch" (recommended) — setup does
  them now, one commit each, nothing on main;
- "Apply only the ones I pick" — a second question lists the steps,
  four to a call;
- "Stop at the plan" — the readiness file is the output.

## Step 3 — apply

Never on the default branch and never in the user's working tree:

```
git -C <path> fetch origin
git -C <path> worktree add <path>-pipeline-setup -b pipeline-setup origin/<default>
```

If the branch exists (a re-run), ask whether to continue it or start
from the default branch again. Copy `pipeline-readiness.md` into the
worktree. Then, per approved step, in plan order:

1. **Write** the files from the template, filled with what the audit
   quoted: the project's real commands in place of every placeholder,
   its real paths, its doctrine lines in `rule` fields. A template's
   example that does not fit the project is deleted, not left in.
2. **Merge, never overwrite.** An existing `.claude/settings.json` keeps
   every rule it has: lists are unioned, and where the project's rule is
   stricter it wins. An existing doctrine document gets a section, not
   a rewrite.
3. **Check** with a command and keep its output for the readiness file:

   | Step | The check |
   |---|---|
   | permissions | `jq . .claude/settings.json`; `bash .claude/hooks/tests/guard-irreversible.test.sh` all green and `.claude/hooks/guard-irreversible.sh --self-test` passes, with the project's own rules added as cases |
   | structure check | `--calibrate origin/<default> --write`, then `--summary origin/<default>` shows `boundary_violations: 0` (a fence that fires on today's code goes to the readiness file as a question for the team, and its rule is left out), then a check of `HEAD~1..HEAD` on any recent commit exits 0 or 1, never 2 |
   | local CI | `scripts/local-ci.sh` without `--post` runs the gate in a clean worktree |
   | golden paths | every path in the file exists at the sha (`git ls-files`) |
   | verify map, doctrine sections | every path and command they name exists |
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

Update the readiness file in the worktree: the new marks, the
"Applied" table (commit, gap, files, the check and its result), what
is left (the L demands with their briefs, the user's own steps). Commit
it as the branch's last commit.

Report to the user as a table: each commit with its gap and check,
then what is left and who carries it. Ask **one question**: "Push the
branch and open a pull request" (recommended: the team reviews it like
any change) or "Leave it local". Never merge it.

## Boundaries

- Never on the default branch, never in the user's working tree, never
  a force-push, never a merge.
- Never posts a commit status, changes branch protection, writes a
  secret or reads one: those are the user's, listed with their command.
- Never invents doctrine, thresholds or exemplars: thresholds come from
  the calibration, exemplars from the code, rules from the doctrine.
- Never edits the pipeline repo; a gap in the bar itself is noted in
  the readiness file for the weekly retro.
- Re-running is safe: the audit reads the default branch's sha, and the
  apply step continues or restarts its own branch.
