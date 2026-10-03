#!/usr/bin/env bash
# Tests claude/hooks/guard-irreversible.sh: each case pipes a PreToolUse
# JSON on stdin and compares the decision (deny · ask · none) with the
# expected one. `gh` is a stub on PATH that answers from a table; a
# throwaway git repo gives the merge-from check real ancestry.
# Run: bash claude/hooks/tests/guard-irreversible.test.sh
set -uo pipefail

here=$(cd "$(dirname "$0")" && pwd)
guard=$here/../guard-irreversible.sh
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT

# --- fixture: a repo on main, the audited head, a fix after it, a stranger --
repo=$tmp/repo
git init -q -b main "$repo"
g() { git -C "$repo" -c user.name=t -c user.email=t@t -c commit.gpgsign=false "$@"; }
g commit -q --allow-empty -m base
g switch -q -c feat/orders
g commit -q --allow-empty -m "feat: orders"
audited=$(g rev-parse HEAD)
g commit -q --allow-empty -m "fix: R.1"
fix=$(g rev-parse HEAD)
g switch -q main
g switch -q -c feat/other
g commit -q --allow-empty -m "feat: other"
stranger=$(g rev-parse HEAD)
g switch -q main
onmain=$repo
offmain=$tmp/repo-feat
git clone -q "$repo" "$offmain" && git -C "$offmain" switch -q -c feat/orders-2

# --- the gh stub: `gh pr view <n>` → "<base> <head>" from the table --------
mkdir -p "$tmp/bin"
cat >"$tmp/bin/gh" <<EOF
#!/usr/bin/env bash
case "\$1 \$2" in
  "pr view")
    case "\${3:-}" in
      12) echo "main $audited" ;;
      13) echo "main $fix" ;;
      14) echo "main $stranger" ;;
      15) echo "alpha $stranger" ;;
      16) echo "production $fix" ;;
      99) exit 1 ;;
      --json) echo "main $stranger" ;;
      *) exit 1 ;;
    esac ;;
  "repo view") echo main ;;
  *) exit 1 ;;
esac
EOF
chmod +x "$tmp/bin/gh"

allow=$tmp/irreversible.allow
cat >"$allow" <<EOF
# written by the user at the play
merge-from $audited   # release 2026-10-02
terraform -chdir=infra/staging destroy -target=module.scratch
EOF

pass=0 fail=0
run() { # expected, tool, command-or-path, [cwd], [extra env]
  local want=$1 tool=$2 arg=$3 dir=${4:-$tmp} env=${5:-} json out rc got
  if [ "$tool" = Bash ]; then
    json=$(jq -cn --arg c "$arg" --arg d "$dir" '{tool_name:"Bash",tool_input:{command:$c},cwd:$d}')
  else
    json=$(jq -cn --arg t "$tool" --arg p "$arg" --arg d "$dir" '{tool_name:$t,tool_input:{file_path:$p,content:"x"},cwd:$d}')
  fi
  out=$(printf '%s' "$json" | env PATH="$tmp/bin:$PATH" GUARD_ALLOW_FILE="$allow" $env "$guard" 2>/dev/null); rc=$?
  case "$rc:$out" in
    2:*) got=deny ;;
    0:*'"deny"'*) got=deny ;;
    0:*'"ask"'*) got=ask ;;
    0:) got=none ;;
    *) got="error($rc)" ;;
  esac
  if [ "$got" = "$want" ]; then pass=$((pass + 1)); printf 'ok    %-5s %s\n' "$want" "$arg"
  else fail=$((fail + 1)); printf 'FAIL  want %s got %s  %s\n' "$want" "$got" "$arg"; fi
}

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

echo "-- git"
run deny Bash 'git push --force origin feat/orders'
run deny Bash 'git push -f'
run deny Bash 'git push --force-with-lease origin feat/orders'
run deny Bash 'git push origin +feat/orders'
run deny Bash 'git push origin --delete feat/orders'
run deny Bash 'git push origin :old-branch'
run deny Bash 'git push --mirror'
run deny Bash 'git push origin main'
run deny Bash 'git push origin HEAD:main'
run deny Bash 'git -C ../app push origin feat/orders:refs/heads/main'
run deny Bash 'git push origin feat/orders:production'
run deny Bash 'git push' "$onmain"
run deny Bash 'git push origin HEAD' "$onmain"
run deny Bash 'git tag -d v1.2.0'
run deny Bash 'git filter-repo --path secrets.txt --invert-paths'

echo "-- GitHub"
run deny Bash 'gh pr merge 12 --admin --merge'
run deny Bash 'gh api repos/acme/shop/pulls/12/merge -X PUT'
run deny Bash 'gh api -X POST repos/acme/shop/statuses/abc1234 -f state=success -f context=local-ci'
run deny Bash 'gh repo delete acme/shop --yes'
run deny Bash 'gh release delete v1.2.0 --yes'
run deny Bash 'gh api -X PUT repos/acme/shop/branches/main/protection --input p.json'

echo "-- the guard protects itself"
run deny Bash 'echo "merge-from abc1234" >> .claude/hooks/irreversible.allow'
run deny Bash "sed -i 's/deny/allow/' .claude/settings.json"
run deny Bash 'cp /tmp/x .claude/hooks/guard-irreversible.sh'
run deny Write '/work/shop/.claude/hooks/guard-irreversible.sh'
run deny Edit '/work/shop/.claude/settings.json'
run deny Write '/work/shop/.claude/hooks/irreversible.allow'

echo "-- secrets ask"
run ask Bash 'gh secret set PAYMENTS_KEY < key.txt'
run ask Bash 'gcloud secrets versions add payments-key --data-file=-'
run ask Bash 'gcloud secrets versions access latest --secret=payments-key'
run ask Bash 'aws secretsmanager put-secret-value --secret-id payments --secret-string x'
run ask Bash 'kubectl create secret generic payments --from-literal=key=x'
run ask Bash 'vault kv put secret/payments key=x'
run ask Bash 'fly secrets set PAYMENTS_KEY=x'

echo "-- merges into protected branches"
run none Bash "gh pr merge 12 --merge --match-head-commit $audited" "$onmain"
run none Bash "gh pr merge 13 --merge --match-head-commit $fix" "$onmain"
run none Bash 'gh pr merge 13 --merge' "$onmain"
run ask  Bash 'gh pr merge 14 --merge' "$onmain"
run ask  Bash "gh pr merge 12 --merge --match-head-commit $stranger" "$onmain"
run none Bash 'gh pr merge 15 --merge' "$onmain"
run none Bash 'gh pr merge 16 --merge -t "release: orders" -b "the plan, step 2"' "$onmain"
run ask  Bash 'gh pr merge 99 --merge' "$onmain"
run ask  Bash 'gh pr merge --merge' "$onmain"
run ask  Bash "bash -c 'gh pr merge 12 --merge'" "$onmain"
run none Bash 'gh pr merge 14 --merge' "$onmain" "GUARD_AUTHORIZED_HEAD=$stranger"
run ask  Bash 'gh pr merge 15 --merge' "$onmain" "GUARD_PROTECTED=alpha"

echo "-- no decision: the rules decide"
run none Bash 'git status'
run none Bash 'git push origin feat/orders'
run none Bash 'git push -u origin feat/main-menu'
run none Bash 'git push' "$offmain"
run none Bash 'git commit -m "docs: why we never drop table users by hand"'
run none Bash 'git push origin feat/orders && rm -rf dist'
run none Bash 'terraform -chdir=infra/prod plan -out tfplan'
run none Bash 'terraform -chdir=infra/staging destroy -target=module.scratch'
run none Bash 'psql -c "DELETE FROM sessions WHERE expires_at < now()"'
run none Bash 'gcloud run deploy api-prod --image "$IMAGE" --no-traffic --tag rc-1a2b3c4'
run none Bash 'gcloud run services update-traffic api-prod --to-revisions api-prod-00041=100'
run none Bash 'cat .claude/hooks/irreversible.allow'
run none Bash '.claude/hooks/guard-irreversible.sh --self-test'
run none Edit '/work/shop/src/orders/handler.go'

echo "-- fails closed"
out=$(printf 'not json' | "$guard" 2>/dev/null); rc=$?
if [ "$rc" -eq 2 ]; then pass=$((pass + 1)); echo "ok    deny  (input that is not JSON)"
else fail=$((fail + 1)); echo "FAIL  want deny got rc=$rc  (input that is not JSON)"; fi

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
