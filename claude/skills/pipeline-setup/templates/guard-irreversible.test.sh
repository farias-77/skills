#!/usr/bin/env bash
# guard-irreversible.test.sh — feeds sample tool calls to the guard and
# checks each decision. Run after every change to PROJECT RULES:
#   .claude/hooks/guard-irreversible.test.sh
# Add the project's own commands to the table: DENY|<command> or ALLOW|<command>.
set -uo pipefail
here=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
guard=${GUARD:-$here/guard-irreversible.sh}
export GUARD_ALLOW_FILE=/dev/null
fail=0 n=0
while IFS='|' read -r want cmd; do
  case "$want" in ''|'#'*) continue ;; esac
  n=$((n + 1))
  out=$(jq -cn --arg c "$cmd" '{tool_name:"Bash",tool_input:{command:$c}}' | "$guard")
  got=ALLOW; [ -n "$out" ] && got=DENY
  if [ "$got" != "$want" ]; then fail=$((fail + 1)); echo "MISMATCH want=$want got=$got  $cmd"; fi
done <<'CASES'
DENY|git push --force origin feat/x
DENY|git push -f origin feat/x
DENY|git push --force-with-lease origin feat/x
DENY|git push origin main
DENY|git -C /repo push origin --delete feat/x
DENY|git push origin :feat/x
DENY|bash -c 'git push origin HEAD:main'
DENY|gh pr merge 12 --merge --admin
DENY|gh repo delete owner/repo --yes
DENY|terraform -chdir=infra destroy -auto-approve
DENY|terraform apply -destroy
DENY|terraform state rm aws_s3_bucket.x
DENY|aws s3 rb s3://bucket --force
DENY|aws s3 rm s3://bucket/ --recursive
DENY|gsutil rm -r gs://bucket
DENY|gcloud sql instances delete prod-db
DENY|gcloud run services delete api --region us-east1
DENY|kubectl delete namespace prod
DENY|helm uninstall api
DENY|psql "$DATABASE_URL" -c "DROP TABLE users"
DENY|psql -c 'truncate table orders'
DENY|psql -c "delete from orders;"
DENY|mysql -e "UPDATE users SET admin=1"
DENY|dropdb app_prod
DENY|npx prisma migrate reset --force
DENY|goose -dir migrations postgres "$URL" down
DENY|rm -rf /
DENY|rm -rf ~
DENY|sudo rm -rf $HOME
DENY|rm -rf *
DENY|dd if=/dev/zero of=/dev/sda
ALLOW|git push -u origin feat/checkout
ALLOW|git push origin HEAD:feat/main-menu
ALLOW|gh pr merge 12 --merge
ALLOW|gh pr view 12 --json state
ALLOW|terraform -chdir=infra plan
ALLOW|terraform apply -auto-approve
ALLOW|psql -c "delete from orders where id = 4"
ALLOW|psql -c "select count(*) from orders"
ALLOW|rm -rf node_modules dist
ALLOW|rm -rf ./build
ALLOW|kubectl delete pod api-123
ALLOW|make ci
ALLOW|git commit -m "fix the migration order"
ALLOW|goose -dir migrations postgres "$URL" up
ALLOW|gcloud run deploy api --image x
ALLOW|ls -la
DENY|git push origin +main
ALLOW|git push origin feat/x:feat/x
DENY|cd infra && tofu destroy
ALLOW|echo "terraform plan"
CASES
echo "$n cases, $fail mismatches"
[ "$fail" -eq 0 ]
