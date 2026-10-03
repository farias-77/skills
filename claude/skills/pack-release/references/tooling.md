# Release: tooling

Versions as published in October 2026. The project's doctrine pins
the versions it actually uses; these are the reference point when it is
silent.

- **GitHub CLI** `gh`: `pr checks --watch`, `pr merge N --merge`,
  `run watch --exit-status`.
- **Terraform** 1.16.x (1.16.5 latest at writing); pin the version the
  project's roots declare.
- **Plan gate:** `terraform show -json tfplan | jq -e '[.resource_changes[] | select(.change.actions | index("delete"))] | length == 0'`,
  or Conftest v0.71.0 with a `deny` on `"delete" in rc.change.actions`.
- **Squawk** v2.66.0 on new PostgreSQL migrations in CI (rules
  `ban-drop-column`, `renaming-column`, `changing-column-type`,
  `adding-required-field`, `require-lock-timeout`,
  `require-statement-timeout`).
- **goose** v3.28.0 for Go projects (wraps each file in a transaction
  unless `-- +goose NO TRANSACTION`).
- **Playwright** smoke that fails on `pageerror`, aimed at an
  environment or a preview-channel URL.
- **Claude Code:** `permissions`, PreToolUse hooks,
  `autoMode.environment` for the trusted repos and projects,
  `claude auto-mode defaults` to list the classifier's rules. The
  sandbox network allowlist holds against `sh -c` forms; hooks and file
  tools run outside it.

## Testing the guard

Pipe a tool input into it with a stubbed `gh` on the `PATH`, and assert
the exit code and output:

```bash
t() { printf '{"tool_input":{"command":%s}}' "$(jq -Rn --arg c "$1" '$c')" | .claude/hooks/release-guard.sh; echo "exit=$?"; }
t 'terraform -chdir=infra apply'            # expect exit=2
t 'bash -c "git push origin main"'          # expect exit=2
t 'gh pr merge 12 --squash'                 # expect exit=2
t 'gh pr merge 12 --merge'                  # stub gh: base main, head != RELEASE_GO_SHA → expect an "ask" JSON
RELEASE_GO_SHA=<stub head> t 'gh pr merge 12 --merge'   # expect exit=0, no output
t 'gh pr view 12'                           # expect exit=0
```
