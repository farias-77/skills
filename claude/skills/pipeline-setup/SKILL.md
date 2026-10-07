---
name: pipeline-setup
description: Brings a project to the pipeline's bar (docs/project-contract.md, 20 roles in three levels). Six scouts (Sonnet 5.5, low) read a detached worktree at the default branch's sha; the session rates every role, writes pipeline-readiness.md on a pipeline-setup branch (✓ present, ~ partial, ✗ missing, each with its path:line evidence), proposes the gaps cheapest first, and, on the user's word, applies the generic pieces on that branch, one commit per gap - the settings with the fail-closed guard wrapper, the guard and authorize.sh, the structure check, golden paths, the drive sections of the feature maps, the tokens export, the cloud-environment templates - closing with one run of the whole gate. Never on main, never a secret, never branch protection. The session runs on Opus 5.5, high. Use when adopting the pipeline, when a stage halted for a missing role, or to re-audit.
argument-hint: "<path-to-project>"
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, AskUserQuestion, Bash
---

# Pipeline setup

A project comes in. The pipeline runs on it only when it provides the
roles the bar names: standards and a commands table, the gates, a stack
per worktree, the signoff command, delivery, the permissions and the
guard, the agents' identities. The bar is
[`docs/project-contract.md`](../../../docs/project-contract.md). This
skill measures the project against it, says what is missing, and closes
the cheap gaps itself, on a branch.

```
/pipeline-setup <path>
  0 open      the project, its default sha, the session roots, the standards, the remote; an audit worktree
  1 audit     six scouts in parallel on the audit worktree → the session rates each role
  2 propose   the gaps cheapest first → pipeline-readiness.md committed on branch pipeline-setup
              → ONE question: apply the S and M steps, pick, or stop at the plan
  3 apply     one commit per gap, each checked by a command; never main, never pushed
  4 close     the whole gate once; no placeholder left; push and PR only on his word
```

| Who | Does |
|---|---|
| you, the session (Opus 5.5, high) | rate every role from the scouts' quotes, write the readiness file and the plan, apply the templates, run each check |
| `scout (Sonnet 5.5, low)` × 6 | one per group of `references/audit.md`; quotes with `path:line`, where it looked, what it did not find |

You never read the project to look something up: a scout does. You
open a project file only to rate an ambiguous quote or to write it.

## Step 0 · Open

1. `<path>` must be a git repository. Record the default branch and its
   sha, and create the **audit worktree**:
   `git -C <path> worktree add --detach <path>-audit <sha>`. The scouts
   read there, never the user's working tree.
2. **Session roots.** Claude Code loads `.claude/settings.json` and its
   hooks from the directory a session opens in. Find the `CLAUDE.md`
   that names the standards: in `<path>`, or in the nearest directory
   above with a `CLAUDE.md` or `.claude/skills/` (a **two-root
   layout**). In a two-root layout ask, through the question tool,
   where sessions open: the root (recommended), the product, or both.
   Role 14 is installed in each session root; a cloud entry always
   opens in the product repository.
3. **The standards' repository**, when it is not the product's, gets
   its own branch in Step 3 and its own detached worktree for the
   scouts.
4. **The remote.** GitHub gives the owner and repo for the ruleset
   probe. Anything else: never call `gh` for this project.
5. Read `references/audit.md`, `templates/README.md` and the bar's
   roles table. A `pipeline-setup` branch already there is a re-run:
   ask whether to continue it or start again; keep its "Applied".

## Step 1 · Audit

Dispatch the six scouts **in one message**, in the background, one per
group of `references/audit.md`, each with the audit worktree, the sha,
the session roots, its group's rows verbatim as the question, and the
answer's shape. While they run, run the probes of `references/audit.md`
yourself and quote their output.

**Rate every role** by the rule in `references/audit.md`. A scout that
did not look where the role would live goes again with those places.
Write the readiness file from
[templates/pipeline-readiness.md](templates/pipeline-readiness.md) in a
setup worktree, never in the user's tree:

```
git -C <path> worktree add <path>-pipeline-setup -b pipeline-setup <sha>
```

## Step 2 · Propose

Order every ✗ and ~ into one plan: **cheapest first**; within a cost,
required before recommended before full experience; a step that
consumes another's output comes after it (the structure check's
calibration before golden paths).

| Cost | What it is | Who closes it |
|---|---|---|
| **S** | a template copied and filled; under an hour | you, in Step 3 |
| **M** | a template adapted to the stack; a few hours | you, in Step 3 |
| **L** | engineering on the product (an affected selector, a stack per worktree, the delivery workflows, a sweep) | a demand of its own through `/lets-cook`; you write its brief and acceptance |

| # | Role | Usual fix | Cost | Template |
|---|---|---|---|---|
| 14 | permissions, guard, authorization | in **every session root**: `.claude/settings.json` merged (lists unioned, the stricter rule wins), with the PreToolUse **fail-closed wrapper** on `Bash\|Edit\|Write\|MultiEdit\|NotebookEdit`, timeout 60, and the PostToolUse **fail-open wrapper** of `remind-scout.sh`, timeout 5; `guard-irreversible.sh`, `authorize.sh`, `remind-scout.sh` and their tests copied to `.claude/hooks/`; credential reads denied; dead rules pruned; a no-comment rule excludes `.claude/hooks/` | S | [settings.json](templates/settings.json), [permissions.md](templates/permissions.md), the pipeline's `claude/hooks/` |
| 1 | standards and the commands table | the index, and the commands table in `CLAUDE.md` naming what exists (a role with no command is written as missing, never invented) | S | — |
| 6 | the signoff command | when the project has none: `claude/scripts/local-ci.sh` copied into its tooling, with its gate and down commands set, and named in the commands table; the bot token and the ruleset go to the user | S | the pipeline's `claude/scripts/local-ci.sh` |
| 7 | gate paths and the floor | `CODEOWNERS` narrowed to the gate paths; the floor target is L | S · L | — |
| 9 | shared files and migrations | a standards section listing the files; timestamped migrations and `restamp` are L | S · L | — |
| 10 | feature maps | a drive section per map with something built, in the maps' language | M | [verify-map.md](templates/verify-map.md) |
| 17 | structure check | the folder copied with its pinned manifests, fences from the standards, calibrated on the default branch, wired into the fast check | M | [structure-check/](templates/structure-check/) |
| 2 | golden paths | one exemplar per kind, picked by a written rule, present at the sha and under p95; after 17 | M | [golden-paths.md](templates/golden-paths.md) |
| 18 | design tokens | the export in the repo's tooling language, and the components list | M | [design-tokens-export.md](templates/design-tokens-export.md) |
| 20 | cloud environment | the four templates filled; the guard vendored at the pipeline's current version with `VERSION`; creating the environment at claude.ai/code is his | M · L | [cloud-setup.sh](templates/cloud-setup.sh), [cloud-session-start.sh](templates/cloud-session-start.sh), [cloud-settings.json](templates/cloud-settings.json), [cloud-env.md](templates/cloud-env.md) |
| 3, 4, 5, 8, 11, 12, 13, 19 | the gates, the stack and sweep, the browser, delivery, the smoke and staging actors, observability | engineering | L, or M when the pieces exist and only need a command that names them | — |
| 15, 16 | identities, the station | the user's: a bot account and token, a read-only cloud identity with a staging-only role; installs on his machine | his | — |

**What only the user can do** goes in the readiness file, each with
its ready `!` command, never run: requiring `local-ci` on `main`'s
ruleset, `CODEOWNERS` approvals, creating the bot identity and its
token, the cloud identity's roles, anything with a secret, creating the
cloud environment, installs on his machine.

Commit the readiness file as the branch's first commit:
`git -C <path>-pipeline-setup commit -m "pipeline-setup: readiness audit at <sha12>" -- pipeline-readiness.md`.
Show the counts per level, the verdict and the plan as one table, and
ask **one question**: "Apply the S and M steps on a branch"
(recommended) · "Apply only the ones I pick" · "Stop at the plan".

## Step 3 · Apply

In the setup worktree; every other repository the plan touches (the
standards' repository, the root of a two-root layout) gets its own
`pipeline-setup` branch and worktree. Per approved step, in plan order:

1. **Write** from the template, filled with what the audit quoted: the
   project's real commands, paths and standards lines. A template's
   example that does not fit is deleted, not left in.
2. **Merge, never overwrite**: an existing settings file keeps every
   rule; an existing standards document gets a section.
3. **Check**, and keep the output for the readiness file:

| Step | The check |
|---|---|
| permissions | in each session root: `jq . .claude/settings.json`; every target rule probed with `make -n` (or the runner's equivalent), the missing ones removed; `bash .claude/hooks/tests/guard-irreversible.test.sh` and `bash .claude/hooks/tests/remind-scout.test.sh` all green; `.claude/hooks/guard-irreversible.sh --self-test`; the canary `git push origin a:b` comes back denied in a session there |
| signoff | `<the signoff command> --dry-run` on the default branch: "would post"; no worktree left behind |
| structure check | `--calibrate origin/<default> --write`, then `--summary origin/<default>` shows `boundary_violations: 0`; a fence that fires on today's code goes to the team as a question |
| golden paths | each exemplar listed by `git ls-tree -r --name-only <sha> -- <path>` and under p95 by `structure-check.sh --measure` |
| feature maps, standards sections | every path and command they name exists |
| tokens | the export runs; `tokens.css` holds every token of `tokens.json` |
| cloud environment | `bash -n` on both scripts; `jq . .claude/settings.json`; `CLAUDE_CODE_REMOTE= .claude/hooks/cloud-session-start.sh` exits 0 at once; the vendored guard matches the pipeline's (`cmp`) |

4. **Commit** that step alone: `git add -- <its paths>` and
   `git commit -m "pipeline-setup: <role> (#<n>)" -- <its paths>`. A red
   check is fixed before the commit, or the step is dropped and the
   readiness file says why.

You never write a rule the team did not state, never a threshold that
did not come from the calibration, never an exemplar that is not in
the code.

## Step 4 · Close

Skipped to the report when he stopped at the plan.

**The final proof**: the whole gate once at the branch tip, in a clean
worktree, under `nice` (the signoff command with `--dry-run`). Copy its
last output line verbatim, after it ran; a gate that cannot run here is
written as that, with the reason.

Update the readiness file (the new marks, "Applied", the dead rules
removed, the final proof, what is left and who carries it). **No
placeholder survives**: `grep -nE '<[^>[:space:]=][^>]*>'` over every
file the branch added returns only real markup. Commit it last; remove
the audit worktree. Report as a table (commit · repository · gap ·
check), then ask: "Push the branches and open pull requests"
(recommended) · "Leave them local". Never merge them.

## Boundaries

- Never a force-push, never a merge.
- Never posts a commit status, changes a ruleset, creates an identity,
  writes or reads a secret: those are listed for him with their
  command.
- Never edits the pipeline repo; a gap in the bar is noted in the
  readiness file for the weekly retro.
