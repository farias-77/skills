#!/usr/bin/env bash
# Tests claude/hooks/guard-irreversible.sh and authorize.sh. Each case pipes
# a PreToolUse JSON on stdin and compares the decision (deny · ask · none)
# with the expected one. `gh` is a stub on PATH that answers from a table; a
# throwaway git repo gives the authorization real ancestry and real tags.
# Run: bash claude/hooks/tests/guard-irreversible.test.sh
set -uo pipefail

here=$(cd "$(dirname "$0")" && pwd)
guard=$here/../guard-irreversible.sh
authorize=$here/../authorize.sh
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
slug=2026-10-05-orders
future=$(date -u -d '+2 days' +%Y-%m-%dT%H:%MZ)
past=$(date -u -d '-1 hour' +%Y-%m-%dT%H:%MZ)

# --- fixture: main, the head he said ok to, a later merge of main, a stranger, tags
repo=$tmp/repo
git init -q -b main "$repo"
g() { git -C "$repo" -c user.name=t -c user.email=t@t -c commit.gpgsign=false -c tag.gpgsign=false "$@"; }
g commit -q --allow-empty -m base
g tag -a v1.3.0 -m "v1.3.0"
g switch -q -c "feat/$slug"
g commit -q --allow-empty -m "feat: orders"
okhead=$(g rev-parse HEAD)
g commit -q --allow-empty -m "merge main into feat"
later=$(g rev-parse HEAD)
g switch -q main
g switch -q -c feat/other
g commit -q --allow-empty -m "feat: other"
stranger=$(g rev-parse HEAD)
g switch -q main
g merge -q --no-ff -m "release: orders" "feat/$slug"
g tag -a v1.4.0 -m "orders"
g tag -a v1.4.1 -m "same commit, a second tag"
onmain=$repo
offmain=$tmp/repo-feat
git clone -q "$repo" "$offmain" && git -C "$offmain" switch -q -c feat/orders-2

# --- the gh stub: `gh pr view <n>` → "<base> <head branch> <head sha> <url>"
mkdir -p "$tmp/bin"
cat >"$tmp/bin/gh" <<EOF
#!/usr/bin/env bash
u=https://github.com/acme/shop/pull
case "\$1 \$2" in
  "pr view")
    case "\${3:-}" in
      12) echo "main feat/$slug $okhead \$u/12" ;;
      13) echo "main feat/$slug $later \$u/13" ;;
      14) echo "main feat/other $stranger \$u/14" ;;
      15) echo "alpha feat/other $stranger \$u/15" ;;
      16) echo "production fix/$slug/X.1 $stranger \$u/16" ;;
      17) echo "main revert/2026-10-01-b $stranger \$u/17" ;;
      18) echo "main feat/$slug $stranger \$u/18" ;;
      19) echo "main feat/$slug $later https://github.com/acme/legacy-api/pull/19" ;;
      --json) echo "main feat/other $stranger \$u/20" ;;
      *) exit 1 ;;
    esac ;;
  "repo view") echo main ;;
  *) exit 1 ;;
esac
EOF
chmod +x "$tmp/bin/gh"

allow=$tmp/irreversible.allow
fresh() { cat >"$allow"; }   # the allow file for the next cases, from stdin

pass=0 fail=0
check() { # expected, got, label
  if [ "$2" = "$1" ]; then pass=$((pass + 1)); printf 'ok    %-5s %s\n' "$1" "$3"
  else fail=$((fail + 1)); printf 'FAIL  want %s got %s  %s\n' "$1" "$2" "$3"; fi
}
last=''
run() { # expected, tool, command-or-path, [cwd]
  local want=$1 tool=$2 arg=$3 dir=${4:-$tmp} json rc got
  if [ "$tool" = Bash ]; then
    json=$(jq -cn --arg c "$arg" --arg d "$dir" '{tool_name:"Bash",tool_input:{command:$c},cwd:$d}')
  else
    json=$(jq -cn --arg t "$tool" --arg p "$arg" --arg d "$dir" '{tool_name:$t,tool_input:{file_path:$p,content:"x"},cwd:$d}')
  fi
  last=$(printf '%s' "$json" | env PATH="$tmp/bin:$PATH" GUARD_ALLOW_FILE="$allow" "$guard" 2>/dev/null); rc=$?
  case "$rc:$last" in
    2:*) got=deny ;;
    0:*'"deny"'*) got=deny ;;
    0:*'"ask"'*) got=ask ;;
    0:) got=none ;;
    *) got="error($rc)" ;;
  esac
  check "$want" "$got" "$arg"
}

fresh <<EOF
# written by the user
terraform -chdir=infra/staging destroy -target=module.scratch
EOF

echo "-- the canary"
run deny Bash 'git push origin a:b'
case "$last" in *'guard-irreversible: guard-canary'*) check yes yes "the canary's reason names it" ;; *) check yes no "the canary's reason names it" ;; esac

echo "-- destroy"
run deny Bash 'terraform destroy -auto-approve'
run deny Bash 'terraform -chdir=infra/prod apply -destroy -auto-approve'
run deny Bash "bash -c 'terraform destroy -auto-approve'"
run deny Bash '/usr/local/bin/terraform state rm module.db'
run deny Bash 'pulumi destroy --yes'
run deny Bash 'kubectl delete namespace prod'
run deny Bash 'helm uninstall api'

echo "-- data and buckets"
run deny Bash 'aws s3 rb s3://orders-archive --force'
run deny Bash 'aws s3 rm s3://orders-archive/2026 --recursive'
run deny Bash 'gsutil -m rm -r gs://orders-archive'
run deny Bash 'gcloud storage rm --recursive gs://orders-archive/**'
run deny Bash 'gcloud sql instances delete orders-prod'
run deny Bash 'psql "$DATABASE_URL" -c "DROP TABLE orders"'
run deny Bash "psql -c 'TRUNCATE orders'"
run deny Bash 'psql -c "DELETE FROM orders;"'
run deny Bash 'dropdb orders_prod'
run deny Bash 'redis-cli -h cache FLUSHALL'
run deny Bash 'goose -dir migrations postgres "$DSN" down'
run deny Bash 'make migrate-down'
run deny Bash 'rm -rf /'

echo "-- git pushes"
run deny Bash 'git push --force origin feat/orders'
run deny Bash 'git push -f'
run deny Bash 'git push --force-with-lease origin feat/orders'
run deny Bash 'git push origin +feat/orders'
run deny Bash 'git push --mirror'
run deny Bash 'git push --tags'
run deny Bash 'git push origin main --follow-tags'
run deny Bash 'git push origin main'
run deny Bash 'git push origin HEAD:main'
run deny Bash 'git -C ../app push origin feat/orders:refs/heads/main'
run deny Bash 'git push origin story/a/e-01:feat/a'
run deny Bash 'git push origin HEAD:refs/heads/story/a/e-01'
run deny Bash 'git push' "$onmain"
run deny Bash 'git push origin HEAD' "$onmain"
run deny Bash 'git tag -d v1.2.0'
run deny Bash 'git filter-repo --path secrets.txt --invert-paths'

echo "-- remote deletions: only story/* and evidence/*"
run none Bash "git push origin --delete story/$slug/e-01 evidence/$slug/e-01"
run none Bash "git push origin :story/$slug/e-02"
run deny Bash "git push origin --delete feat/$slug"
run deny Bash "git push origin --delete story/$slug/e-01 feat/$slug"
run deny Bash 'git push origin :feat/old'
run deny Bash 'git push -d origin'

echo "-- GitHub"
run deny Bash 'gh pr merge 12 --admin --merge'
run deny Bash 'gh api repos/acme/shop/pulls/12/merge -X PUT'
run deny Bash 'gh api -X POST repos/acme/shop/statuses/abc1234 -f state=success -f context=local-ci'
run deny Bash 'gh api repos/acme/shop/check-runs -f name=local-ci -f head_sha=abc1234'
run deny Bash 'gh release create v1.4.0 --notes-from-tag'
run deny Bash 'gh api -X POST repos/acme/shop/git/refs -f ref=refs/tags/v9.9.9 -f sha=abc1234'
run deny Bash 'gh api repos/acme/shop/git/tags --input tag.json'
run deny Bash 'gh repo delete acme/shop --yes'
run deny Bash 'gh release delete v1.2.0 --yes'
run deny Bash 'gh api -X PUT repos/acme/shop/branches/main/protection --input p.json'
run none Bash 'gh api repos/acme/shop/git/refs/tags/v1.4.0'
run none Bash 'gh release view v1.4.0'
run none Bash 'gh workflow run rollback.yml -f tag=v1.3.0'

echo "-- identity"
run deny Bash 'GH_CONFIG_DIR=~/.config/gh gh pr list'
run deny Bash 'export CLOUDSDK_CONFIG=$HOME/.config/gcloud'
run deny Bash 'gcloud logging read "severity>=ERROR" --account owner@example.com'
run deny Bash 'gcloud auth login'
run deny Bash 'gh auth token'
run none Bash 'gh auth status'
run deny Bash 'cat ~/.config/local-ci/token'
run deny Bash 'GH_TOKEN=$(cat $HOME/.config/local-ci/token) gh api user'
run deny Bash 'head -c 4 < ~/.config/local-ci/token'
run deny Bash 'cat ~/.config/gh/hosts.yml'
run deny Bash 'echo $SHOP_CI_TOKEN'
run deny Bash 'printenv ACME_CI_TOKEN'
run deny Bash 'LOCAL_CI_TOKEN_FILE=/tmp/t bash claude/scripts/local-ci.sh --ref feat/x'
run none Bash 'bash claude/scripts/local-ci.sh --repo . --ref feat/x'
run none Bash 'tooling/local-ci abc1234 --dry-run'

echo "-- the guard protects itself"
run deny Bash 'echo "auth release x merge=feat/x tag=1 until=2099-01-01T00:00Z" >> .claude/hooks/irreversible.allow'
run deny Bash "sed -i 's/deny/allow/' .claude/settings.json"
run deny Bash 'cp /tmp/x .claude/hooks/guard-irreversible.sh'
run deny Bash ".claude/hooks/authorize.sh release $slug feat/$slug@$okhead"
run deny Bash "GUARD_ALLOW_FILE=x bash claude/hooks/authorize.sh short a feat/a"
run deny Write '/work/shop/.claude/hooks/guard-irreversible.sh'
run deny Edit '/work/shop/.claude/settings.json'
run deny Write '/work/shop/.claude/hooks/irreversible.allow'
run none Bash 'cat .claude/hooks/irreversible.allow'
run none Bash 'cat .claude/hooks/authorize.sh'
run none Bash '.claude/hooks/guard-irreversible.sh --self-test'

echo "-- secrets ask"
run ask Bash 'gh secret set PAYMENTS_KEY < key.txt'
run ask Bash 'gcloud secrets versions add payments-key --data-file=-'
run ask Bash 'gcloud secrets versions access latest --secret=payments-key'
run ask Bash 'aws secretsmanager put-secret-value --secret-id payments --secret-string x'
run ask Bash 'kubectl create secret generic payments --from-literal=key=x'
run ask Bash 'vault kv put secret/payments key=x'
run ask Bash 'fly secrets set PAYMENTS_KEY=x'

echo "-- merges: a release authorization"
fresh <<EOF
auth release $slug merge=feat/$slug@$okhead tag=1 until=$future
EOF
run none Bash "gh pr merge 12 --merge --match-head-commit $okhead" "$onmain"
grep -q "merged=$okhead" "$allow"; check 0 $? "the guard records the head it let merge"
run none Bash 'gh pr merge 13 --merge' "$onmain"
run none Bash 'gh pr merge 16 --merge -t "fix: staging red" -b "X.1, the plan step 3"' "$onmain"
run none Bash 'gh pr merge 15 --merge' "$onmain"
run deny Bash 'gh pr merge 14 --merge' "$onmain"
run deny Bash 'gh pr merge 18 --merge' "$onmain"
run deny Bash "gh pr merge 12 --merge --match-head-commit $stranger" "$onmain"
run deny Bash 'gh pr merge 17 --merge' "$onmain"
run deny Bash 'gh pr merge --merge' "$onmain"
run ask  Bash 'gh pr merge 99 --merge' "$onmain"
run ask  Bash "bash -c 'gh pr merge 12 --merge'" "$onmain"

echo "-- tags: one per authorization, carrying its merge"
fresh <<EOF
auth release $slug merge=feat/$slug@$okhead tag=1 until=$future merged=$later
EOF
run deny Bash 'git push origin v1.3.0' "$onmain"
run none Bash 'git push origin v1.4.0' "$onmain"
grep -q 'used=v1.4.0' "$allow"; check 0 $? "the tag marks the authorization used"
run none Bash 'git push origin refs/tags/v1.4.0' "$onmain"
run deny Bash 'git push origin tag v1.4.1' "$onmain"
run deny Bash "gh pr merge 13 --merge" "$onmain"
run ask  Bash 'git push origin v7.0.0' "$onmain"
fresh <<EOF
auth release $slug merge=feat/$slug@$okhead tag=1 until=$future
EOF
run deny Bash 'git push origin v1.4.0' "$onmain"

echo "-- expired, other routes, other repos"
fresh <<EOF
auth release $slug merge=feat/$slug@$okhead tag=1 until=$past
EOF
run deny Bash 'gh pr merge 12 --merge' "$onmain"
fresh <<EOF
auth hotfix $slug merge=hotfix/$slug tag=1 until=$future
EOF
run none Bash 'gh pr merge 17 --merge' "$onmain"
fresh <<EOF
auth short $slug merge=feat/$slug tag=1 until=$future
EOF
run none Bash 'gh pr merge 18 --merge' "$onmain"
fresh <<EOF
auth legacy feat-$slug merge=feat/$slug tag=0 until=$future repo=legacy-api
EOF
run deny Bash 'gh pr merge 13 --merge' "$onmain"
run none Bash 'gh pr merge 19 --merge' "$onmain"
fresh <<EOF
protected alpha
EOF
run deny Bash 'gh pr merge 15 --merge' "$onmain"

echo "-- no decision: the rules decide"
fresh </dev/null
run none Bash 'git status'
run none Bash 'git push origin feat/orders'
run none Bash 'git push -u origin feat/main-menu'
run none Bash 'git push' "$offmain"
run none Bash 'git commit -m "docs: why we never drop table users by hand"'
run none Bash 'git push origin feat/orders && rm -rf dist'
run none Bash 'terraform -chdir=infra/prod plan -out tfplan'
run none Bash 'psql -c "DELETE FROM sessions WHERE expires_at < now()"'
run none Bash 'gcloud run services update-traffic api-prod --to-revisions api-prod-00041=100'
run none Edit '/work/shop/src/orders/handler.go'
fresh <<EOF
terraform -chdir=infra/staging destroy -target=module.scratch
EOF
run none Bash 'terraform -chdir=infra/staging destroy -target=module.scratch'

echo "-- authorize.sh"
a=$tmp/auth.allow
printf 'auth short old merge=feat/old tag=1 until=%s\nprotected alpha\n' "$past" >"$a"
GUARD_ALLOW_FILE=$a bash "$authorize" release "$slug" "feat/$slug@$okhead" >/dev/null; check 0 $? "release with branch@sha writes a line"
grep -q "^auth release $slug merge=feat/$slug@$okhead tag=1 until=" "$a"; check 0 $? "the line has the route, the branch, the sha, the tag and the expiry"
grep -q 'feat/old' "$a"; check 1 $? "an expired line is dropped"
grep -q '^protected alpha$' "$a"; check 0 $? "other lines stay"
GUARD_ALLOW_FILE=$a bash "$authorize" release "$slug" "feat/$slug" >/dev/null 2>&1; check 2 $? "release without a sha is refused"
GUARD_ALLOW_FILE=$a bash "$authorize" legacy legacy-api fix/listing >/dev/null; check 0 $? "legacy writes a line"
grep -q '^auth legacy fix-listing merge=fix/listing tag=0 repo=legacy-api until=' "$a"; check 0 $? "legacy has no tag and names the repo"
cp "$a" "$allow"
run none Bash "gh pr merge 13 --merge" "$onmain"

echo "-- fails closed"
printf 'not json' | "$guard" >/dev/null 2>&1; check 2 $? "input that is not JSON blocks"
wrapper='f="$CLAUDE_PROJECT_DIR"/.claude/hooks/guard-irreversible.sh; [ -x "$f" ] || { echo "guard-irreversible: missing; blocking" >&2; exit 2; }; exec "$f"'
printf '{}' | CLAUDE_PROJECT_DIR=$tmp/nowhere bash -c "$wrapper" 2>/dev/null; check 2 $? "the settings wrapper blocks when the guard file is missing"

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
