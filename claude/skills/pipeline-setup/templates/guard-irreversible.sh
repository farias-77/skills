#!/usr/bin/env bash
# guard-irreversible.sh — a PreToolUse hook on Bash that denies the
# commands no stage may run on its own: the ones that cannot be undone.
#
# Install: copy to <project>/.claude/hooks/guard-irreversible.sh, chmod +x,
# and register it in <project>/.claude/settings.json:
#
#   "hooks": {"PreToolUse": [{"matcher": "Bash", "hooks": [{"type": "command",
#     "command": "${CLAUDE_PROJECT_DIR}/.claude/hooks/guard-irreversible.sh"}]}]}
#
# Contract (Claude Code hooks): the tool call arrives as JSON on stdin; the
# command is .tool_input.command. To deny, print on stdout
#   {"hookSpecificOutput":{"hookEventName":"PreToolUse",
#     "permissionDecision":"deny","permissionDecisionReason":"..."}}
# and exit 0. To let the normal permission rules decide, print nothing and
# exit 0. A hook decision runs before the allow/ask/deny rules and holds in
# every permission mode.
#
# The escape hatch: a command the release plan names, approved by the user,
# passes when it appears verbatim (whitespace collapsed) as one line of the
# allow file — $GUARD_ALLOW_FILE, default .claude/hooks/irreversible.allow.
# The user writes that file himself (a `!` command at the pre-flight); the
# settings template denies Edit/Write on .claude/hooks/** so no agent can.
#
# Matching reads the whole command string, so `bash -c '...'`, a full
# binary path or a chained `a && b` are caught too. The price is a false
# positive on text that only mentions a command (a commit message that
# says "drop table"): the agent rewords it. A guard that misses is worse
# than a guard that asks for a reword.
#
# Patterns are generic. Add the project's own irreversible commands under
# PROJECT RULES at the bottom (a production database name, a bucket, a
# script that wipes an environment).
set -uo pipefail

input=$(cat)
if command -v jq >/dev/null 2>&1; then
  cmd=$(printf '%s' "$input" | jq -r '.tool_input.command // empty' 2>/dev/null)
else
  cmd=$(printf '%s' "$input" | python3 -c 'import json,sys
try: print(json.load(sys.stdin).get("tool_input",{}).get("command",""))
except Exception: pass' 2>/dev/null)
fi
[ -n "$cmd" ] || exit 0

deny() {
  local reason="guard-irreversible: $1. If the release plan names this exact command, the user adds it to the allow file and the session runs it again."
  if command -v jq >/dev/null 2>&1; then
    jq -cn --arg r "$reason" '{hookSpecificOutput:{hookEventName:"PreToolUse",permissionDecision:"deny",permissionDecisionReason:$r}}'
  else
    python3 -c 'import json,sys; print(json.dumps({"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"deny","permissionDecisionReason":sys.argv[1]}}))' "$reason"
  fi
  exit 0
}

# The approved exceptions, matched verbatim with whitespace collapsed.
norm() { tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//'; }
allow_file=${GUARD_ALLOW_FILE:-${CLAUDE_PROJECT_DIR:-.}/.claude/hooks/irreversible.allow}
if [ -f "$allow_file" ]; then
  want=$(printf '%s' "$cmd" | norm)
  while IFS= read -r line || [ -n "$line" ]; do
    case "$line" in ''|'#'*) continue ;; esac
    [ "$(printf '%s' "$line" | norm)" = "$want" ] && exit 0
  done < "$allow_file"
fi

c=$(printf '%s' "$cmd" | tr '\n' ' ')
lc=$(printf '%s' "$c" | tr '[:upper:]' '[:lower:]')
has()  { grep -Eq -- "$1" <<<"$c"; }
hasi() { grep -Eq -- "$1" <<<"$lc"; }
# A command word starts the string or follows a separator, a quote, sudo or xargs.
S='(^|[;&|({`"'"'"'[:space:]])'

# --- git: rewritten or deleted history on a shared remote -------------------
if has "${S}git([[:space:]]+-[^[:space:]]+([[:space:]]+[^-[:space:]][^[:space:]]*)?)*[[:space:]]+push([[:space:]]|$)"; then
  has '(--force([^-]|$)|--force-with-lease|--force-if-includes|[[:space:]]-[a-zA-Z]*f[a-zA-Z]*([[:space:]]|$))' && deny "force-push rewrites shared history"
  has '[[:space:]](--delete|-d)([[:space:]]|$)|[[:space:]]:[^[:space:]]' && deny "pushing a deletion removes a remote branch or tag"
  has '[[:space:]]--mirror([[:space:]]|$)' && deny "a mirror push overwrites every remote ref"
  has '[[:space:]](\+)?(refs/heads/)?(main|master|production|prod)([[:space:]]|:|$|["'"'"'])|:(refs/heads/)?(main|master|production|prod)([[:space:]]|$|["'"'"'])' && deny "main takes changes only through a pull request"
fi
has "${S}git[[:space:]].*filter-(branch|repo)" && deny "history rewrite"

# --- GitHub: merges that bypass protection, deletions -----------------------
has "${S}gh[[:space:]]+pr[[:space:]]+merge[^;&|]*--admin" && deny "--admin bypasses branch protection"
has "${S}gh[[:space:]]+repo[[:space:]]+(delete|archive)" && deny "deleting or archiving a repository"
has "${S}gh[[:space:]]+release[[:space:]]+delete" && deny "deleting a release"
has "${S}gh[[:space:]]+api[^;&|]*(-X|--method)[[:space:]]*DELETE" && deny "a DELETE through the GitHub API"
has "${S}gh[[:space:]]+api[^;&|]*branches/[^/[:space:]]+/protection[^;&|]*(-X|--method)[[:space:]]*(PUT|DELETE|PATCH)" && deny "changing branch protection"

# --- infrastructure as code: destroy and state surgery ----------------------
has "${S}(terraform|tofu|terragrunt)([[:space:]]+-[^[:space:]]+)*[[:space:]]+(destroy|apply[^;&|]*-destroy)" && deny "destroying infrastructure"
has "${S}(terraform|tofu|terragrunt)([[:space:]]+-[^[:space:]]+)*[[:space:]]+state[[:space:]]+(rm|mv|push|replace-provider)" && deny "editing infrastructure state by hand"
has "${S}(terraform|tofu)([[:space:]]+-[^[:space:]]+)*[[:space:]]+force-unlock" && deny "breaking another run's state lock"
has "${S}pulumi[[:space:]]+(destroy|stack[[:space:]]+rm|state[[:space:]]+delete)" && deny "destroying a stack"
has "${S}(cdk|sst)[[:space:]]+(destroy|remove)" && deny "destroying a stack"

# --- cloud: deletions of data, buckets, databases, projects -----------------
has "${S}aws[[:space:]]+s3[[:space:]]+rb" && deny "removing a bucket"
has "${S}aws[[:space:]]+s3[[:space:]]+rm[^;&|]*--recursive" && deny "deleting a bucket's objects"
has "${S}aws[[:space:]]+[a-z0-9-]+[[:space:]]+delete-(db|table|bucket|cluster|stack|user-pool|file-system|secret|log-group|repository|backup)" && deny "deleting a cloud resource that holds data"
has "${S}(gsutil|gcloud[[:space:]]+storage)[[:space:]]+(rm[^;&|]*(-r|--recursive)|rb)" && deny "deleting a bucket or its objects"
has "${S}gcloud[[:space:]]+([a-z-]+[[:space:]]+)*(projects|sql|spanner|firestore|bigtable|redis|filestore|secrets|kms|run|functions|container)[[:space:]]+([a-z-]+[[:space:]]+)*delete" && deny "deleting a cloud resource"
has "${S}gcloud[[:space:]]+sql[[:space:]]+[a-z-]+[[:space:]]+(restore|import)" && deny "overwriting a database from a backup or a dump"
has "${S}az[[:space:]]+([a-z-]+[[:space:]]+)*(delete|purge)([[:space:]]|$)" && deny "deleting a cloud resource"
has "${S}(firebase)[[:space:]]+(hosting:disable|projects:delete|firestore:delete|database:remove)" && deny "deleting a hosted resource or its data"
has "${S}(heroku[[:space:]]+(apps:destroy|pg:reset)|fly[[:space:]]+(apps|volumes)[[:space:]]+destroy|vercel[[:space:]]+(remove|rm))" && deny "destroying an app or its data"

# --- kubernetes and helm ----------------------------------------------------
has "${S}kubectl[^;&|]*[[:space:]]delete[[:space:]]+(-[^[:space:]]+[[:space:]]+)*(ns|namespace|namespaces|pv|pvc|persistentvolume|persistentvolumeclaim|statefulset|sts|crd)([[:space:]/]|$)" && deny "deleting a namespace or persistent storage"
has "${S}kubectl[^;&|]*[[:space:]]delete[^;&|]*--all([[:space:]]|$)" && deny "deleting everything of a kind"
has "${S}helm[[:space:]]+(uninstall|delete)" && deny "uninstalling a release"

# --- databases: dropped or truncated data, destructive migrations -----------
if hasi "${S}(psql|mysql|mariadb|sqlite3|mongosh|mongo|cqlsh|sqlcmd|bq|clickhouse-client|duckdb|redis-cli|cockroach|spanner|prisma|supabase|turso)([[:space:]]|$)" \
   || hasi '(-c|--command|-e|--execute|--eval|query)[[:space:]=]+["'"'"']'; then
  hasi '(^|[^a-z_])drop[[:space:]]+(table|database|schema|index|view|collection|keyspace|user|role)' && deny "dropping a database object"
  hasi '(^|[^a-z_])truncate([[:space:]]+table)?[[:space:]]+[a-z_"`]' && deny "truncating a table"
  hasi '(^|[^a-z_])delete[[:space:]]+from[[:space:]]+[^[:space:];]+[[:space:]]*(;|"|'"'"'|$)' && deny "DELETE without a WHERE clause"
  hasi '(^|[^a-z_])update[[:space:]]+[^[:space:]]+[[:space:]]+set[[:space:]][^;]*$' && ! hasi '[[:space:]]where[[:space:]]' && deny "UPDATE without a WHERE clause"
  hasi '(flushall|flushdb|dropdatabase\(\)|\.drop\(\))' && deny "wiping a data store"
fi
hasi "${S}(dropdb|dropuser)([[:space:]]|$)" && deny "dropping a database"
hasi '(prisma[[:space:]]+migrate[[:space:]]+reset|prisma[[:space:]]+db[[:space:]]+push[^;&|]*--force-reset|rails[[:space:]]+db:(drop|reset|schema:load)|rake[[:space:]]+db:(drop|reset)|manage\.py[[:space:]]+(flush|reset_db)|artisan[[:space:]]+(migrate:fresh|migrate:reset|db:wipe)|knex[[:space:]]+migrate:rollback[^;&|]*--all|sequelize[^;&|]*db:migrate:undo:all|alembic[[:space:]]+downgrade[[:space:]]+base)' && deny "a migration command that drops or resets data"
hasi "${S}(migrate|goose|dbmate|flyway|atlas|sqitch|liquibase)([[:space:]][^;&|]*)?[[:space:]](down|reset|drop|clean|revert|rollback)([[:space:]]|$)" && deny "a migration that goes down drops data a release wrote"

# --- the filesystem: wiping what cannot be rebuilt --------------------------
has "${S}(sudo[[:space:]]+)?rm[[:space:]]+(-[a-zA-Z]*[rR][a-zA-Z]*[[:space:]]+|--recursive[[:space:]]+)(-[^[:space:]]+[[:space:]]+)*(/|/\*|~|~/|~/\*|\\\$HOME|\\\$HOME/|\\\$HOME/\*|\.\.|\.\./|\*|\.)([[:space:]]|$)" && deny "recursive delete of the root, home, parent or whole working directory"
has "${S}(mkfs(\.[a-z0-9]+)?|wipefs|shred)[[:space:]]" && deny "erasing a device or file beyond recovery"
has "${S}dd[[:space:]][^;&|]*of=/dev/" && deny "writing over a device"

# --- PROJECT RULES ----------------------------------------------------------
# One line per command class the project knows is irreversible. Examples:
# has "${S}make[[:space:]]+(wipe|reset)-(staging|prod)" && deny "wipes an environment"
# hasi 'prod-db|production-db' && hasi 'restore' && deny "restores over the production database"

exit 0
