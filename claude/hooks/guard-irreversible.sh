#!/usr/bin/env bash
# guard-irreversible.sh: the PreToolUse hook that stops what no agent may
# do on its own, because it cannot be undone or because it is the user's.
#
# What it decides
#   deny   destroying infrastructure; deleting data, databases or buckets;
#          force-push, a mirror, --all or --tags; a refspec push (src:dst);
#          pushing to a protected branch; deleting a remote branch other
#          than story/* and evidence/*; a merge into a protected branch, or
#          a v* tag push, that no live authorization covers; creating a
#          release or writing refs, tags, statuses or check runs through
#          the GitHub API; switching the agent's identity; reading the CI
#          token or the gh and cloud credentials; editing the
#          guard, the authorization script, the allow file or the settings
#   ask    writing or reading a secret's value; a merge or a tag the guard
#          cannot resolve (GitHub silent for 20 s, a PR it cannot read)
#   none   everything else: the settings' allow/ask/deny rules decide
#
# Install (pipeline-setup does this): copy this file and authorize.sh to
# .claude/hooks/ of every directory the sessions open in, chmod +x, and
# register it in that .claude/settings.json through a wrapper, so a missing
# file blocks instead of passing:
#   "hooks": {"PreToolUse": [{"matcher": "Bash|Edit|Write|MultiEdit|NotebookEdit",
#     "hooks": [{"type": "command", "timeout": 60, "command":
#       "f=\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/guard-irreversible.sh; [ -x \"$f\" ] || { echo 'guard-irreversible: missing; blocking' >&2; exit 2; }; exec \"$f\""}]}]}
#
# The canary: every stage opens by running
#   git push origin a:b
# A live guard denies it with a reason that starts "guard-canary". Any other
# outcome means no guard is firing, and the stage does not open. (Were it to
# run, the push fails harmlessly: no local branch has that name.)
#
# Contract (Claude Code hooks): the tool call arrives as JSON on stdin. A
# decision is printed as hookSpecificOutput.permissionDecision with exit 0;
# no output and exit 0 lets the rules decide. Anything the guard cannot read,
# and any internal error, exits 2, which blocks: it fails closed.
#
# The allow file: $GUARD_ALLOW_FILE, default
# $CLAUDE_PROJECT_DIR/.claude/hooks/irreversible.allow. Only the user writes
# it (by hand or with `! .claude/hooks/authorize.sh`); the guard denies every
# agent write. One entry per line, `#` starts a comment:
#   <a command, verbatim>    that exact command passes (whitespace collapsed)
#   protected <branch>       one more protected branch (main, master,
#                            production and prod always are)
#   default-branch <branch>  the repo's default branch, also protected
#   auth <route> <slug> merge=<branch>[@<sha>] tag=<0|1> until=<UTC> [repo=<name>]
#                            written by authorize.sh; see "Authorizations"
#
# Authorizations. A live `auth` line (before `until`, not yet used) lets:
#   - a PR merge into a protected branch whose head branch is <branch>; with
#     @<sha>, the head must be that commit or descend from it, so a merge of
#     main into the branch after the user's ok stays covered;
#   - a PR merge from fix/<slug>/*, and for the hotfix route from revert/*;
#   - with tag=1, ONE push of a v* tag whose commit carries a merge this line
#     allowed. The guard then writes used=<tag> into the line: the
#     authorization dies at its tag. Pushing the same tag again passes.
#   - with repo=<name>, only PRs of that repository.
# The guard records the head it let merge as merged=<sha> on the line.
#
# Matching reads the whole command string, so `bash -c '...'`, a full binary
# path or a chained `a && b` are caught too; a rare false positive on text
# that only mentions a command is the price (the agent rewords). The guard is
# the floor, not the boundary: rulesets, an agent identity that cannot delete
# or approve, and secrets the agent cannot read are the boundary.
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
  t deny "git push origin a:b"
  t deny "terraform destroy -auto-approve"
  t deny "git push --force origin feat/x"
  t deny "git push origin HEAD:main"
  t deny "gh release create v1.2.0"
  t ask  "gh secret set API_KEY"
  t none "git push origin feat/x"
  t none "git push origin --delete story/x/e-01"
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
deny() { decide deny "$1"; }
ask()  { decide ask "$1"; }

# GitHub may hang; a hang is never a pass. Exit 124 means it timed out.
gh_t() { if command -v timeout >/dev/null 2>&1; then timeout 20 gh "$@"; else gh "$@"; fi; }

# --- configuration ----------------------------------------------------------
allow_file=${GUARD_ALLOW_FILE:-${CLAUDE_PROJECT_DIR:-$cwd}/.claude/hooks/irreversible.allow}
norm() { tr -s '[:space:]' ' ' | sed 's/^ //; s/ $//'; }
verbatim=() protected=(main master production prod)
default_branch=${GUARD_DEFAULT_BRANCH:-}
A_LINE=() A_ROUTE=() A_SLUG=() A_BRANCH=() A_SHA=() A_TAG=() A_REPO=() A_USED=() A_MERGED=()
now=$(date -u +%s)
if [ -f "$allow_file" ]; then
  n=0
  while IFS= read -r line || [ -n "$line" ]; do
    n=$((n + 1))
    line=$(printf '%s' "$line" | norm)
    case "$line" in
      ''|'#'*) ;;
      'protected '*)      set -- ${line#protected }; protected+=("$1") ;;
      'default-branch '*) set -- ${line#default-branch }; default_branch=$1 ;;
      'auth '*)
        set -- ${line%%#*}
        route=${2:-} slug=${3:-} branch='' sha='' tag=0 until='' repo='' used='' merged=''
        shift 3 2>/dev/null || continue
        for kv in "$@"; do
          case "$kv" in
            merge=*) branch=${kv#merge=}; case "$branch" in *@*) sha=${branch#*@}; branch=${branch%@*} ;; esac ;;
            tag=*) tag=${kv#tag=} ;;
            until=*) until=${kv#until=} ;;
            repo=*) repo=${kv#repo=} ;;
            used=*) used=${kv#used=} ;;
            merged=*) merged=${kv#merged=} ;;
          esac
        done
        case "$route" in release|short|hotfix|legacy) ;; *) continue ;; esac
        [ -n "$slug" ] && [ -n "$branch" ] && [ -n "$until" ] || continue
        u=$(date -u -d "$until" +%s 2>/dev/null) || continue
        [ "$u" -gt "$now" ] || continue
        A_LINE+=("$n") A_ROUTE+=("$route") A_SLUG+=("$slug") A_BRANCH+=("$branch") A_SHA+=("$sha")
        A_TAG+=("$tag") A_REPO+=("$repo") A_USED+=("$used") A_MERGED+=("$merged")
        ;;
      *) verbatim+=("$line") ;;
    esac
  done < "$allow_file"
fi
[ -n "$default_branch" ] && protected+=("$default_branch")
is_protected() { local b; for b in "${protected[@]}"; do [ "$1" = "$b" ] && return 0; done; return 1; }

# The guard writes key=value into one line of the allow file (used=, merged=).
mark() { # line number, key, value
  local tmp
  tmp=$(mktemp "$allow_file.XXXXXX") || return 0
  awk -v n="$1" -v k="$2" -v v="$3" '
    NR == n { f = 0; for (i = 1; i <= NF; i++) if (index($i, k "=") == 1) { $i = k "=" v; f = 1 }
              if (!f) $0 = $0 " " k "=" v }
    { print }' "$allow_file" >"$tmp" && mv "$tmp" "$allow_file"
}

# --- file tools: the guard, its scripts, the allow file and the settings are the user's
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

[ "$want" = "git push origin a:b" ] && deny "guard-canary: the guard is live"

# --- the guard protects itself ----------------------------------------------
if has "$guarded_path|authorize\.sh"; then
  reads='^[[:space:]]*(cat|head|tail|less|more|grep|rg|ls|stat|wc|diff|jq|file|sha256sum|shasum|md5sum)[[:space:]]'
  gitreads='^[[:space:]]*git[[:space:]]+(diff|log|show|status|blame)([[:space:]]|$)'
  selftest='^[[:space:]]*(bash[[:space:]]+)?[^[:space:];&|]*guard-irreversible\.sh[[:space:]]+--self-test[[:space:]]*$'
  if ! { has "$reads" || has "$gitreads" || has "$selftest"; } || has '[>;&|`]|\$\('; then
    deny "the guard, the authorization script, the allow file and the settings are the user's; an agent may only read them"
  fi
fi

# --- identity: the agent keeps the identity its settings give it ------------
has "${S}(export[[:space:]]+)?(GH_CONFIG_DIR|GH_TOKEN|GITHUB_TOKEN|GH_ENTERPRISE_TOKEN|CLOUDSDK_CONFIG|CLOUDSDK_CORE_ACCOUNT|CLOUDSDK_AUTH_ACCESS_TOKEN_FILE|GOOGLE_APPLICATION_CREDENTIALS)=" && deny "switching the identity the agent runs as"
has "${S}gcloud[[:space:]][^;&|]*--(account|impersonate-service-account)([=[:space:]]|$)" && deny "switching the identity the agent runs as"
has "${S}gcloud[[:space:]]+(auth[[:space:]]+(login|activate-service-account|print-access-token)|config[[:space:]]+set[[:space:]]+(account|auth/))" && deny "switching or printing the agent's cloud credentials"
has "${S}gh[[:space:]]+auth[[:space:]]+(login|switch|token|refresh)" && deny "switching or printing the agent's GitHub credentials"
has "${S}(cat|head|tail|less|more|cp|mv|scp|base64|xxd|od|strings|grep|rg|awk|sed|jq|curl|tar|zip)[[:space:]][^;&|]*(local-ci/token|\.config/(gh|gcloud)/)|<[[:space:]]*[^;&|[:space:]]*(local-ci/token|\.config/(gh|gcloud)/)" && deny "reading a credential the agent does not hold: the CI token is the signoff command's, the gh and cloud configs are the identity's"
has "\\\$\{?[A-Z0-9_]*CI_TOKEN|${S}(printenv|env)[[:space:]]+[A-Z0-9_]*CI_TOKEN|${S}LOCAL_CI_TOKEN_FILE=" && deny "the CI token is the signoff command's alone"

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


# --- git: rewritten or deleted history; what a push may land on ------------
has "${S}git[[:space:]].*filter-(branch|repo)" && deny "rewriting history"
has "${S}git[[:space:]]+tag[[:space:]]+(-[a-zA-Z]*[df][a-zA-Z]*|--delete|--force)([[:space:]]|$)" && deny "a published tag is never deleted or moved"
if has "${S}git([[:space:]]+[^;&|]*)?[[:space:]]push([[:space:]]|$)"; then
  P='[[:space:]]push([[:space:]][^;&|]*)?[[:space:]]'
  has "${P}(--force|--force-with-lease|--force-if-includes)([=[:space:]]|$)|${P}-[a-zA-Z]*f[a-zA-Z]*([[:space:]]|$)" && deny "a force-push rewrites shared history"
  has "${P}--mirror([[:space:]]|$)" && deny "a mirror push overwrites every remote ref"
  has "${P}--all([[:space:]]|$)" && deny "--all pushes every local branch, the protected ones included"
  has "${P}--(tags|follow-tags)([[:space:]]|$)" && deny "pushing tags in bulk skips the authorization; push one tag by name"
fi

current_branch() { git -C "$1" symbolic-ref --short -q HEAD 2>/dev/null; }
deletable() { local b=${1#refs/heads/}; case "$b" in story/?*|evidence/?*) return 0 ;; esac; return 1; }
# A v* tag push needs a live authorization with tag=1 whose merge the tag carries.
tag_push() { # dir, tag
  local dir=$1 t=${2#refs/tags/} commit i
  commit=$(git -C "$dir" rev-parse -q --verify "refs/tags/$t^{commit}" 2>/dev/null) || ask "the tag $t is not in the local repo, so the guard cannot check what it carries; create it, then push"
  for i in ${A_LINE[@]+"${!A_LINE[@]}"}; do
    [ "${A_TAG[$i]}" = 1 ] || continue
    [ "${A_USED[$i]}" = "$t" ] && return 0
    [ -z "${A_USED[$i]}" ] && [ -n "${A_MERGED[$i]}" ] || continue
    git -C "$dir" merge-base --is-ancestor "${A_MERGED[$i]}" "$commit" 2>/dev/null || continue
    mark "${A_LINE[$i]}" used "$t"
    return 0
  done
  deny "no live authorization covers the tag $t: it needs the user's authorize line with tag=1 and a merge it allowed under the tag; one tag per authorization"
}

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
  del=0 pos=() k=$((j + 1))
  while [ "$k" -lt "$n" ]; do
    case "${w[$k]}" in
      --delete|-d) del=1; k=$((k + 1)) ;;
      -o|--push-option|--repo|--receive-pack|--exec) k=$((k + 2)) ;;
      -*) k=$((k + 1)) ;;
      *) pos+=("${w[$k]}"); k=$((k + 1)) ;;
    esac
  done
  if [ "${#pos[@]}" -le 1 ]; then
    [ "$del" = 1 ] && deny "a deletion must name its branch"
    b=$(current_branch "$dir")
    [ -n "$b" ] && is_protected "$b" && deny "this push sends the current branch, $b, which takes changes only through a pull request"
    continue
  fi
  specs=("${pos[@]:1}") s=0
  while [ "$s" -lt "${#specs[@]}" ]; do
    spec=${specs[$s]}; s=$((s + 1))
    if [ "$spec" = tag ]; then tag_push "$dir" "${specs[$s]:-}"; s=$((s + 1)); continue; fi
    if [ "$del" = 1 ]; then deletable "$spec" || deny "deleting the remote branch $spec: an agent deletes only story/* and evidence/*"; continue; fi
    case "$spec" in
      +*) deny "a refspec with + force-pushes ${spec#+}" ;;
      :*) deletable "${spec#:}" || deny "pushing an empty source deletes ${spec#:}: an agent deletes only story/* and evidence/*"; continue ;;
      *:*) deny "a refspec push (src:dst) writes a branch under another name; push the branch by its own name" ;;
      refs/tags/*|v[0-9]*) tag_push "$dir" "$spec"; continue ;;
      HEAD) dst=$(current_branch "$dir") ;;
      *) dst=$spec ;;
    esac
    dst=${dst#refs/heads/}
    [ -n "$dst" ] && is_protected "$dst" && deny "$dst takes changes only through a pull request"
  done
done <<<"$seg_text"

# --- GitHub: merges that bypass the check, deletions, forged signals --------
W='[[:space:]](-X|--method)[[:space:]]*(POST|PUT|PATCH|DELETE)|[[:space:]](-f|-F|--field|--raw-field|--input)[[:space:]=]'
has "${S}gh[[:space:]]+pr[[:space:]]+merge[^;&|]*--admin" && deny "--admin bypasses branch protection"
has "${S}gh[[:space:]]+repo[[:space:]]+(delete|archive)" && deny "deleting or archiving a repository"
has "${S}gh[[:space:]]+release[[:space:]]+delete" && deny "deleting a release"
has "${S}gh[[:space:]]+release[[:space:]]+create" && deny "the CI creates the release after the production watch is green"
has "${S}gh[[:space:]]+api[^;&|]*(/pulls/[0-9]+/merge|/merges)([[:space:]/?\"']|$)" && deny "merging through the API skips the guard's check; merge with gh pr merge"
has "${S}gh[[:space:]]+api[^;&|]*(/statuses/|/check-runs)" && has "$W" && deny "posting a commit status or a check by hand forges the CI's signal; only the gate script posts it"
has "${S}gh[[:space:]]+api[^;&|]*(/git/refs|/git/tags|/releases)" && has "$W" && deny "writing refs, tags or releases through the API skips the guard's check"
has "${S}gh[[:space:]]+api[^;&|]*(-X|--method)[[:space:]]*DELETE" && deny "a DELETE through the GitHub API"
has "${S}gh[[:space:]]+api[^;&|]*(/protection|/rulesets)" && has '(-X|--method)[[:space:]]*(PUT|POST|PATCH|DELETE)' && deny "changing branch protection or rulesets"

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
# its copy of the test. Example:
# has "${S}make[[:space:]]+(wipe|reset)-(staging|prod)" && deny "wipes an environment"

# --- merges into a protected branch: only what a live authorization covers --
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
out=$(cd "$cwd" 2>/dev/null && gh_t pr view ${sel:+"$sel"} ${repo[@]+"${repo[@]}"} --json baseRefName,headRefName,headRefOid,url --jq '[.baseRefName, .headRefName, .headRefOid, .url] | join(" ")' 2>/dev/null); rc=$?
[ "$rc" -eq 124 ] && ask "GitHub did not answer in 20 s, so the guard cannot check this merge; confirm it by hand or retry"
read -r base hname head url <<<"$out"
[ -n "${base:-}" ] && [ -n "${head:-}" ] || ask "the guard could not resolve the pull request ${sel:-of this branch} to check where it merges; confirm it by hand"
if [ -z "$default_branch" ]; then
  db=$(cd "$cwd" 2>/dev/null && gh_t repo view ${repo[@]+"${repo[@]:1}"} --json defaultBranchRef --jq .defaultBranchRef.name 2>/dev/null) || db=''
  [ -n "$db" ] && protected+=("$db")
fi
is_protected "$base" || exit 0
[ -n "$match" ] && head=$match
slug_repo=$(printf '%s' "${url:-}" | sed -nE 's#^https?://[^/]+/([^/]+/[^/]+)/pull/.*#\1#p')

descends() { # sha, head: the head is the sha or a descendant of it
  case "$2" in "$1"*) return 0 ;; esac
  if git -C "$cwd" cat-file -e "$2^{commit}" 2>/dev/null && git -C "$cwd" cat-file -e "$1^{commit}" 2>/dev/null; then
    git -C "$cwd" merge-base --is-ancestor "$1" "$2" 2>/dev/null; return
  fi
  [ -n "$slug_repo" ] || return 2
  local st
  st=$(gh_t api "repos/$slug_repo/compare/$1...$2" --jq .status 2>/dev/null) || return 2
  case "$st" in ahead|identical) return 0 ;; behind|diverged) return 1 ;; esac
  return 2
}

for i in ${A_LINE[@]+"${!A_LINE[@]}"}; do
  [ -z "${A_USED[$i]}" ] || continue
  if [ -n "${A_REPO[$i]}" ]; then case "/$slug_repo" in */"${A_REPO[$i]}") ;; *) continue ;; esac; fi
  ok=0
  case "$hname" in
    "${A_BRANCH[$i]}")
      if [ -z "${A_SHA[$i]}" ]; then ok=1
      else descends "${A_SHA[$i]}" "$head"; r=$?
        [ "$r" -eq 0 ] && ok=1
        [ "$r" -eq 2 ] && ask "the guard cannot tell whether $head descends from the authorized ${A_SHA[$i]} (not in the local repo, GitHub silent); fetch and merge again"
      fi ;;
    fix/"${A_SLUG[$i]}"/?*) ok=1 ;;
    revert/?*) [ "${A_ROUTE[$i]}" = hotfix ] && ok=1 ;;
  esac
  [ "$ok" = 1 ] || continue
  mark "${A_LINE[$i]}" merged "$head"
  exit 0
done
deny "nothing authorizes merging $hname @ ${head:0:12} into $base. The user's authorize line names the route, the branch and, for a release, the head it descends from; it expires at its tag or in 3 days. Record the stop and go on with what does not need it"
