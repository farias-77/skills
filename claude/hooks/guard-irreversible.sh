#!/usr/bin/env bash
# guard-irreversible.sh: a PreToolUse hook that stops the commands no
# stage may run on its own because they cannot be undone, and that holds
# the merge into a protected branch until the user's play authorized it.
#
# What it decides
#   deny   destroying infrastructure; deleting data, databases or buckets;
#          force-push, pushing a deletion, a mirror or --all; pushing
#          straight to a protected branch; merges that bypass protection
#          (--admin, the GitHub merge API); forging a commit status;
#          editing the guard itself, its allow file or the settings
#   ask    writing or reading a secret's value; a merge into a protected
#          branch whose head the play did not authorize, or that cannot
#          be resolved
#   none   everything else: the settings' allow/ask/deny rules decide
#
# Install (pipeline-setup does this): copy to <project>/.claude/hooks/,
# chmod +x, and register it in <project>/.claude/settings.json:
#   "hooks": {"PreToolUse": [{"matcher": "Bash|Edit|Write|MultiEdit|NotebookEdit",
#     "hooks": [{"type": "command", "timeout": 30,
#       "command": "\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/guard-irreversible.sh"}]}]}
#
# Contract (Claude Code hooks): the tool call arrives as JSON on stdin.
# A decision is printed on stdout as hookSpecificOutput.permissionDecision
# ("deny" or "ask") with exit 0; no output and exit 0 lets the rules
# decide. Input that cannot be read exits 2, which blocks: the guard fails
# closed. A hook decision runs before the rules and holds in every mode.
#
# The allow file: $GUARD_ALLOW_FILE, default
# $CLAUDE_PROJECT_DIR/.claude/hooks/irreversible.allow. The user writes it
# himself (a `!` command, or his own terminal); the guard denies any agent
# write to it. One entry per line, `#` starts a comment:
#   <a command, verbatim>   that exact command passes (whitespace collapsed)
#   merge-head <sha>        a merge whose PR head is exactly this sha passes
#   merge-from <sha>        a merge whose PR head descends from this sha passes
#                           (the release's own fixes, built after the play)
#   protected <branch>      one more protected branch (main, master,
#                           production and prod always are)
#   default-branch <branch> the repo's default branch, also protected
# Environment, set by the user when he launches the session (an agent's
# shell cannot change the hook's environment):
#   GUARD_AUTHORIZED_HEAD   shas a merge may carry as its head, space or comma separated
#   GUARD_PROTECTED         more protected branches, space or comma separated
#   GUARD_DEFAULT_BRANCH    the default branch, when the allow file does not say
#
# Matching reads the whole command string, so `bash -c '...'`, a full
# binary path or a chained `a && b` are caught too. The price is a rare
# false positive on text that only mentions a command; the agent rewords.
# The guard is a floor, not the boundary: branch protection, cloud roles
# that cannot delete and secrets the agent cannot read are the boundary.
#
# `guard-irreversible.sh --self-test` runs a few samples through itself.
set -uo pipefail

self=$0

if [ "${1:-}" = "--self-test" ]; then
  fails=0
  t() { # expected, command
    local got out
    out=$(printf '{"tool_name":"Bash","tool_input":{"command":"%s"}}' "$2" | GUARD_ALLOW_FILE=/dev/null "$self")
    case "$out" in *'"deny"'*) got=deny ;; *'"ask"'*) got=ask ;; '') got=none ;; *) got=bad ;; esac
    if [ "$got" = "$1" ]; then echo "ok    $1  $2"; else echo "FAIL  want $1 got $got  $2"; fails=$((fails + 1)); fi
  }
  t deny "terraform destroy -auto-approve"
  t deny "git push --force origin feat/x"
  t deny "git push origin HEAD:main"
  t deny "aws s3 rb s3://bucket --force"
  t ask  "gh secret set API_KEY"
  t none "git push origin feat/x"
  t none "terraform plan -out tfplan"
  [ "$fails" -eq 0 ] && echo "self-test: all passed" && exit 0
  echo "self-test: $fails failed"; exit 1
fi

input=$(cat)
set -f   # no globbing: words from the command and the allow file stay literal

# Fail closed: any exit other than 0 (a decision, or none) and 2 (blocked)
# means the guard broke, and a broken guard blocks.
trap 'rc=$?; if [ "$rc" -ne 0 ] && [ "$rc" -ne 2 ]; then echo "guard-irreversible: internal error ($rc); blocking" >&2; exit 2; fi' EXIT

fail_closed() { echo "guard-irreversible: $1; blocking" >&2; exit 2; }

if command -v jq >/dev/null 2>&1; then
  printf '%s' "$input" | jq -e 'type == "object"' >/dev/null 2>&1 || fail_closed "the hook input is not a JSON object"
  fields() { printf '%s' "$input" | jq -j '(.tool_name // ""), "\u0000", (.tool_input.command // ""), "\u0000", (.tool_input.file_path // .tool_input.notebook_path // ""), "\u0000", (.cwd // ""), "\u0000"'; }
elif command -v python3 >/dev/null 2>&1; then
  fields() { printf '%s' "$input" | python3 -c 'import json,sys
d=json.load(sys.stdin); i=d.get("tool_input") or {}
for v in (d.get("tool_name",""), i.get("command",""), i.get("file_path") or i.get("notebook_path") or "", d.get("cwd","")):
    sys.stdout.write((v or "") + "\0")'; }
  fields >/dev/null 2>&1 || fail_closed "the hook input is not valid JSON"
else
  fail_closed "neither jq nor python3 is installed to read the hook input"
fi
{ IFS= read -r -d '' tool; IFS= read -r -d '' cmd; IFS= read -r -d '' fpath; IFS= read -r -d '' cwd; } < <(fields)
cwd=${cwd:-$PWD}

decide() { # deny|ask, reason
  local r="guard-irreversible: $2"
  r=${r//\\/\\\\}; r=${r//\"/\\\"}
  printf '{"hookSpecificOutput":{"hookEventName":"PreToolUse","permissionDecision":"%s","permissionDecisionReason":"%s"}}\n' "$1" "$r"
  exit 0
}
deny() { decide deny "$1. If the release plan names this exact command, the user adds it to the allow file and the session runs it again."; }
ask()  { decide ask "$1"; }

# --- configuration ----------------------------------------------------------
allow_file=${GUARD_ALLOW_FILE:-${CLAUDE_PROJECT_DIR:-$cwd}/.claude/hooks/irreversible.allow}
norm() { tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//'; }
verbatim=() merge_head=() merge_from=() protected=(main master production prod)
default_branch=${GUARD_DEFAULT_BRANCH:-}
gp=${GUARD_PROTECTED:-}; for b in ${gp//,/ }; do protected+=("$b"); done
ga=${GUARD_AUTHORIZED_HEAD:-}; for s in ${ga//,/ }; do merge_head+=("$s"); done
if [ -f "$allow_file" ]; then
  while IFS= read -r line || [ -n "$line" ]; do
    line=$(printf '%s' "$line" | norm)
    case "$line" in
      ''|'#'*) ;;
      'merge-head '*)     set -- ${line#merge-head }; merge_head+=("$1") ;;
      'merge-from '*)     set -- ${line#merge-from }; merge_from+=("$1") ;;
      'protected '*)      set -- ${line#protected }; protected+=("$1") ;;
      'default-branch '*) set -- ${line#default-branch }; default_branch=$1 ;;
      *) verbatim+=("$line") ;;
    esac
  done < "$allow_file"
fi
[ -n "$default_branch" ] && protected+=("$default_branch")
is_protected() { local b; for b in "${protected[@]}"; do [ "$1" = "$b" ] && return 0; done; return 1; }

# --- file tools: the guard, its allow file and the settings are the user's ---
guarded_path='\.claude/(settings[^/[:space:]]*\.json|hooks/)|irreversible\.allow'
if [ -z "$cmd" ]; then
  [ -n "$fpath" ] && [[ $fpath =~ $guarded_path ]] && deny "the guard, its allow file and the settings are edited by the user only"
  exit 0
fi

# --- the user's exact approvals ---------------------------------------------
want=$(printf '%s' "$cmd" | norm)
for v in ${verbatim[@]+"${verbatim[@]}"}; do [ "$v" = "$want" ] && exit 0; done

c=$(printf '%s' "$cmd" | tr '\n' ' ')
lc=$(printf '%s' "$c" | tr '[:upper:]' '[:lower:]')
has()  { [[ $c =~ $1 ]]; }    # POSIX ERE, no fork: the guard runs before every command
hasi() { [[ $lc =~ $1 ]]; }
# A command word starts the string or follows a separator, a quote, a path or a space.
S='(^|[;&|({`"'"'"'[:space:]/])'

# --- the guard protects itself ----------------------------------------------
if has "$guarded_path"; then
  reads='^[[:space:]]*(cat|head|tail|less|more|grep|rg|ls|stat|wc|diff|jq|file|sha256sum|shasum|md5sum)[[:space:]]'
  gitreads='^[[:space:]]*git[[:space:]]+(diff|log|show|status|blame)([[:space:]]|$)'
  selftest='^[[:space:]]*(bash[[:space:]]+)?[^[:space:];&|]*guard-irreversible\.sh[[:space:]]+--self-test[[:space:]]*$'
  if ! { has "$reads" || has "$gitreads" || has "$selftest"; } || has '[>;&|`]|\$\('; then
    deny "the guard, its allow file and the settings are written by the user only; an agent may only read them"
  fi
fi

# --- infrastructure: destroy and state surgery ------------------------------
has "${S}(terraform|tofu|terragrunt)([[:space:]]+-[^[:space:]]+)*[[:space:]]+(destroy|apply[^;&|]*-destroy)" && deny "destroying infrastructure"
has "${S}(terraform|tofu|terragrunt)([[:space:]]+-[^[:space:]]+)*[[:space:]]+state[[:space:]]+(rm|mv|push|replace-provider)" && deny "editing infrastructure state by hand"
has "${S}(terraform|tofu)([[:space:]]+-[^[:space:]]+)*[[:space:]]+force-unlock" && deny "breaking another run's state lock"
has "${S}pulumi[[:space:]]+(destroy|stack[[:space:]]+rm|state[[:space:]]+delete)" && deny "destroying a stack"
has "${S}(cdk|sst|serverless|sls)[[:space:]]+(destroy|remove)" && deny "destroying a stack"
has "${S}helm[[:space:]]+(uninstall|delete)" && deny "uninstalling a release"
has "${S}kubectl[^;&|]*[[:space:]]delete[[:space:]]+(-[^[:space:]]+[[:space:]]+)*(ns|namespaces?|pv|pvc|persistentvolumes?|persistentvolumeclaims?|statefulsets?|sts|crds?)([[:space:]/]|$)" && deny "deleting a namespace or persistent storage"
has "${S}kubectl[^;&|]*[[:space:]]delete[^;&|]*--all([[:space:]]|$)" && deny "deleting everything of a kind"

# --- cloud: data, buckets, databases, projects ------------------------------
has "${S}aws[[:space:]]+s3[[:space:]]+rb([[:space:]]|$)" && deny "removing a bucket"
has "${S}aws[[:space:]]+s3[[:space:]]+rm[^;&|]*--recursive" && deny "deleting a bucket's objects"
has "${S}aws[[:space:]]+[a-z0-9-]+[[:space:]]+delete-(db|table|bucket|cluster|stack|user-pool|file-system|secret|log-group|repository|backup|snapshot)" && deny "deleting a cloud resource that holds data"
has "${S}(gsutil|gcloud[[:space:]]+storage)[[:space:]]+(-[^[:space:]]+[[:space:]]+)*(rm[^;&|]*(-r|-R|--recursive|\*\*)|rb)([[:space:]]|$)" && deny "deleting a bucket or its objects"
has "${S}gcloud[[:space:]]+([a-z-]+[[:space:]]+)*(projects|sql|spanner|firestore|bigtable|redis|filestore|kms|run|functions|container|compute[[:space:]]+disks)[[:space:]]+([a-z-]+[[:space:]]+)*delete([[:space:]]|$)" && deny "deleting a cloud resource"
has "${S}gcloud[[:space:]]+secrets[[:space:]]+([a-z-]+[[:space:]]+)*(delete|destroy)([[:space:]]|$)" && deny "destroying a secret"
has "${S}gcloud[[:space:]]+sql[[:space:]]+[a-z-]+[[:space:]]+(restore|import)" && deny "overwriting a database from a backup or a dump"
has "${S}az[[:space:]]+([a-z-]+[[:space:]]+)*(delete|purge)([[:space:]]|$)" && deny "deleting a cloud resource"
has "${S}firebase[[:space:]]+(hosting:disable|projects:delete|firestore:delete|database:remove)" && deny "deleting a hosted resource or its data"
has "${S}(heroku[[:space:]]+(apps:destroy|pg:reset)|fly[[:space:]]+(apps|volumes)[[:space:]]+destroy|vercel[[:space:]]+(remove|rm))" && deny "destroying an app or its data"

# --- databases: dropped, truncated or wiped data ----------------------------
if hasi "${S}(psql|mysql|mariadb|sqlite3|mongosh|mongo|cqlsh|sqlcmd|bq|clickhouse-client|duckdb|redis-cli|cockroach|spanner|prisma|supabase|turso)([[:space:]]|$)" \
   || hasi '(-c|--command|-e|--execute|--eval|query)[[:space:]=]+["'"'"']'; then
  hasi '(^|[^a-z_])drop[[:space:]]+(table|database|schema|index|view|collection|keyspace|user|role)' && deny "dropping a database object"
  hasi '(^|[^a-z_])truncate([[:space:]]+table)?[[:space:]]+[a-z_"`]' && deny "truncating a table"
  hasi '(^|[^a-z_])delete[[:space:]]+from[[:space:]]+[^[:space:];]+[[:space:]]*(;|"|'"'"'|$)' && deny "a DELETE without a WHERE clause"
  hasi '(^|[^a-z_])update[[:space:]]+[^[:space:]]+[[:space:]]+set[[:space:]]' && ! hasi '[[:space:]]where[[:space:]]' && deny "an UPDATE without a WHERE clause"
  hasi '(flushall|flushdb|dropdatabase\(\)|\.drop\(\))' && deny "wiping a data store"
fi
hasi "${S}(dropdb|dropuser)([[:space:]]|$)" && deny "dropping a database"
hasi '(prisma[[:space:]]+migrate[[:space:]]+reset|prisma[[:space:]]+db[[:space:]]+push[^;&|]*--force-reset|rails[[:space:]]+db:(drop|reset|schema:load)|rake[[:space:]]+db:(drop|reset)|manage\.py[[:space:]]+(flush|reset_db)|artisan[[:space:]]+(migrate:fresh|migrate:reset|db:wipe)|knex[[:space:]]+migrate:rollback[^;&|]*--all|sequelize[^;&|]*db:migrate:undo:all|alembic[[:space:]]+downgrade[[:space:]]+base)' && deny "a migration command that drops or resets data"
hasi "${S}make[[:space:]]+[a-z0-9_-]*(migrate|db)[-_:]?(down|reset|drop|wipe|fresh)([[:space:]]|$)" && deny "a migration target that drops or resets data"
hasi "${S}(migrate|goose|dbmate|flyway|atlas|sqitch|liquibase)([[:space:]][^;&|]*)?[[:space:]](down|down-to|reset|drop|clean|revert|rollback)([[:space:]]|$)" && deny "a down migration drops what a release wrote; roll the code back and keep the expanded schema"

# --- the filesystem: what cannot be rebuilt ---------------------------------
has "${S}(sudo[[:space:]]+)?rm[[:space:]]+(-[a-zA-Z]*[rR][a-zA-Z]*[[:space:]]+|--recursive[[:space:]]+)(-[^[:space:]]+[[:space:]]+)*(/|/\*|~|~/|~/\*|\\\$HOME|\\\$HOME/|\\\$HOME/\*|\.\.|\.\./|\*|\.)([[:space:]]|$)" && deny "a recursive delete of the root, the home, the parent or the whole working directory"
has "${S}(mkfs(\.[a-z0-9]+)?|wipefs|shred)[[:space:]]" && deny "erasing a device or a file beyond recovery"
has "${S}dd[[:space:]][^;&|]*of=/dev/" && deny "writing over a device"

# --- git: rewritten or deleted history, direct pushes to protected branches -
has "${S}git[[:space:]].*filter-(branch|repo)" && deny "rewriting history"
if has "${S}git([[:space:]]+[^;&|]*)?[[:space:]]push([[:space:]]|$)"; then
  P='[[:space:]]push([[:space:]][^;&|]*)?[[:space:]]'
  has "${P}(--force|--force-with-lease|--force-if-includes)([=[:space:]]|$)|${P}-[a-zA-Z]*f[a-zA-Z]*([[:space:]]|$)" && deny "a force-push rewrites shared history"
  has "${P}(--delete|-d)([[:space:]]|$)" && deny "pushing a deletion removes a remote branch or tag"
  has "${P}--mirror([[:space:]]|$)" && deny "a mirror push overwrites every remote ref"
  has "${P}--all([[:space:]]|$)" && deny "--all pushes every local branch, the protected ones included"
fi
# Each push, tokenized: where does it land?
current_branch() { git -C "$1" symbolic-ref --short -q HEAD 2>/dev/null; }
seg_text=$(printf '%s' "$c" | tr "\"'" '  ' | tr ';&|()`' '\n\n\n\n\n\n')
while IFS= read -r seg; do
  read -ra w <<<"$seg"
  n=${#w[@]}; i=0
  while [ "$i" -lt "$n" ]; do [ "${w[$i]##*/}" = git ] && break; i=$((i + 1)); done
  [ "$i" -lt "$n" ] || continue
  dir=$cwd; j=$((i + 1))
  while [ "$j" -lt "$n" ]; do
    case "${w[$j]}" in
      -C) d=${w[$((j + 1))]:-.}; case "$d" in /*) dir=$d ;; *) dir=$dir/$d ;; esac; j=$((j + 2)) ;;
      -c|--git-dir|--work-tree|--namespace) j=$((j + 2)) ;;
      -*) j=$((j + 1)) ;;
      *) break ;;
    esac
  done
  [ "${w[$j]:-}" = push ] || continue
  pos=(); k=$((j + 1))
  while [ "$k" -lt "$n" ]; do
    case "${w[$k]}" in
      -o|--push-option|--repo|--receive-pack|--exec) k=$((k + 2)) ;;
      -*) k=$((k + 1)) ;;
      *) pos+=("${w[$k]}"); k=$((k + 1)) ;;
    esac
  done
  if [ "${#pos[@]}" -le 1 ]; then
    b=$(current_branch "$dir")
    [ -n "$b" ] && is_protected "$b" && deny "this push sends the current branch, $b, which takes changes only through a pull request"
    continue
  fi
  for spec in "${pos[@]:1}"; do
    case "$spec" in +*) deny "a refspec with + force-pushes ${spec#+}" ;; esac
    case "$spec" in
      :*) deny "pushing an empty source deletes the remote ref ${spec#:}" ;;
      *:*) dst=${spec#*:} ;;
      HEAD) dst=$(current_branch "$dir") ;;
      *) dst=$spec ;;
    esac
    dst=${dst#refs/heads/}
    [ -n "$dst" ] && is_protected "$dst" && deny "$dst takes changes only through a pull request"
  done
done <<<"$seg_text"

# --- GitHub: merges that bypass protection, deletions, forged signoffs ------
has "${S}gh[[:space:]]+pr[[:space:]]+merge[^;&|]*--admin" && deny "--admin bypasses branch protection"
has "${S}gh[[:space:]]+repo[[:space:]]+(delete|archive)" && deny "deleting or archiving a repository"
has "${S}gh[[:space:]]+release[[:space:]]+delete" && deny "deleting a release"
has "${S}gh[[:space:]]+api[^;&|]*(/pulls/[0-9]+/merge|/merges)([[:space:]/?\"']|$)" && deny "merging through the API skips the guard's check; merge with gh pr merge"
has "${S}gh[[:space:]]+api[^;&|]*/statuses/" && has '[[:space:]](-X|--method)[[:space:]]*POST|[[:space:]](-f|-F|--field|--raw-field|--input)[[:space:]=]' && deny "posting a commit status by hand forges the local-CI signoff; run the project's local CI"
has "${S}gh[[:space:]]+api[^;&|]*(-X|--method)[[:space:]]*DELETE" && deny "a DELETE through the GitHub API"
has "${S}gh[[:space:]]+api[^;&|]*(/protection|/rulesets)" && has '(-X|--method)[[:space:]]*(PUT|POST|PATCH|DELETE)' && deny "changing branch protection or rulesets"
has "${S}git[[:space:]]+tag[[:space:]]+(-[a-zA-Z]*[df][a-zA-Z]*|--delete|--force)([[:space:]]|$)" && deny "a published tag is never deleted or moved"

# --- secrets: values are the user's -----------------------------------------
has "${S}gh[[:space:]]+secret[[:space:]]+(set|delete)" && ask "writing a repository secret: secret values are the user's"
has "${S}gcloud[[:space:]]+secrets[[:space:]]+(create|versions[[:space:]]+(add|access|disable|enable))" && ask "writing or reading a secret's value: secret values are the user's"
has "${S}aws[[:space:]]+secretsmanager[[:space:]]+(create-secret|put-secret-value|update-secret|get-secret-value|restore-secret)" && ask "writing or reading a secret's value: secret values are the user's"
has "${S}aws[[:space:]]+ssm[[:space:]]+(put-parameter|get-parameters?[^;&|]*--with-decryption)" && ask "writing or reading a parameter that may hold a secret"
has "${S}az[[:space:]]+keyvault[[:space:]]+secret[[:space:]]+(set|show|download)" && ask "writing or reading a secret's value: secret values are the user's"
has "${S}vault[[:space:]]+(kv[[:space:]]+(put|patch|get|rollback)|write|read)([[:space:]]|$)" && ask "writing or reading a secret's value: secret values are the user's"
has "${S}kubectl[^;&|]*[[:space:]](create|edit|patch)[[:space:]]+secret" && ask "writing a cluster secret: secret values are the user's"
has "${S}(firebase[[:space:]]+functions:secrets:(set|access)|fly[[:space:]]+secrets[[:space:]]+(set|import)|heroku[[:space:]]+config:set|vercel[[:space:]]+env[[:space:]]+(add|pull)|netlify[[:space:]]+env:set|doppler[[:space:]]+secrets[[:space:]]+(set|get|download)|railway[[:space:]]+variables[[:space:]]+set)" && ask "writing or reading a secret's value: secret values are the user's"

# --- PROJECT RULES ----------------------------------------------------------
# One line per command the project knows cannot be undone, with a case in
# its copy of the test. Examples:
# has "${S}make[[:space:]]+(wipe|reset)-(staging|prod)" && deny "wipes an environment"
# hasi 'orders-prod' && hasi '(restore|import)' && deny "overwrites the production database"

# --- merges into a protected branch: only the head the play authorized ------
has "${S}gh([[:space:]]+[^;&|]*)?[[:space:]]pr[[:space:]]+merge([[:space:]]|$)" || exit 0
[ "$(grep -Eo "${S}gh([[:space:]]+[^;&|]*)?[[:space:]]pr[[:space:]]+merge([[:space:]]|$)" <<<"$c" | wc -l)" -eq 1 ] || ask "more than one merge in one command; merge one pull request per command"
# Quoted text (a subject, a body) is masked so its words are not read as arguments.
masked=$(printf '%s' "$c" | sed -E "s/\"[^\"]*\"/Q/g; s/'[^']*'/Q/g")
read -ra w <<<"$(printf '%s' "$masked" | tr ';&|()`' '\n\n\n\n\n\n' | grep -E '(^|[[:space:]/])gh([[:space:]].*)?[[:space:]]pr[[:space:]]+merge([[:space:]]|$)' | head -n 1)"
n=${#w[@]}; i=0; repo=() sel='' match=''
while [ "$i" -lt "$n" ] && [ "${w[$i]##*/}" != gh ]; do i=$((i + 1)); done
[ "$i" -lt "$n" ] || ask "a merge the guard cannot read (inside a quoted script?); confirm it by hand"
i=$((i + 1))
while [ "$i" -lt "$n" ]; do
  case "${w[$i]}" in
    -R|--repo) repo=(-R "${w[$((i + 1))]:-}"); i=$((i + 2)) ;;
    --repo=*) repo=(-R "${w[$i]#--repo=}"); i=$((i + 1)) ;;
    pr|merge) i=$((i + 1)) ;;
    --match-head-commit) match=${w[$((i + 1))]:-}; i=$((i + 2)) ;;
    --match-head-commit=*) match=${w[$i]#*=}; i=$((i + 1)) ;;
    -t|--subject|-b|--body|-F|--body-file|-A|--author-email) i=$((i + 2)) ;;
    -*) i=$((i + 1)) ;;
    *) [ -z "$sel" ] && sel=${w[$i]}; i=$((i + 1)) ;;
  esac
done
[ "$sel" = Q ] && ask "a merge whose pull request the guard cannot read; name it by number"
out=$(cd "$cwd" 2>/dev/null && gh pr view ${sel:+"$sel"} ${repo[@]+"${repo[@]}"} --json baseRefName,headRefOid --jq '.baseRefName + " " + .headRefOid' 2>/dev/null) || out=''
read -r base head <<<"$out"
[ -n "${base:-}" ] && [ -n "${head:-}" ] || ask "the guard could not resolve the pull request ${sel:-of this branch} to check where it merges; confirm it by hand"
if [ -z "$default_branch" ]; then
  db=$(cd "$cwd" 2>/dev/null && gh repo view ${repo[@]+"${repo[@]:1}"} --json defaultBranchRef --jq .defaultBranchRef.name 2>/dev/null) || db=''
  [ -n "$db" ] && protected+=("$db")
fi
is_protected "$base" || exit 0
[ -n "$match" ] && head=$match
sha_ok() { [ ${#1} -ge 7 ] && case "$2" in "$1"*) return 0 ;; esac; return 1; }
for s in ${merge_head[@]+"${merge_head[@]}"}; do sha_ok "$s" "$head" && exit 0; done
for s in ${merge_from[@]+"${merge_from[@]}"}; do
  [ ${#s} -ge 7 ] || continue
  sha_ok "$s" "$head" && exit 0
  if git -C "$cwd" cat-file -e "$head^{commit}" 2>/dev/null && git -C "$cwd" cat-file -e "$s^{commit}" 2>/dev/null; then
    git -C "$cwd" merge-base --is-ancestor "$s" "$head" 2>/dev/null && exit 0
  else
    ask "the head $head of the pull request into $base is not in the local repo, so the guard cannot check it descends from the authorized $s; fetch it and merge again"
  fi
done
ask "this merges into $base, which the play did not authorize for head $head; the user approves this merge, or authorizes the head in the allow file"
