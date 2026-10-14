#!/usr/bin/env bash
# Exercises claude/scripts/local-ci.sh against a throwaway repo and a fake `gh`: nothing reaches GitHub.
set -uo pipefail
script="$(cd "$(dirname "$0")/.." && pwd)/claude/scripts/local-ci.sh"
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
bad=0

git init -q --bare "$tmp/remote.git"
git clone -q "$tmp/remote.git" "$tmp/repo" 2>/dev/null
git -C "$tmp/repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m one
git -C "$tmp/repo" push -q origin HEAD:main

mkdir -p "$tmp/bin"
cat >"$tmp/bin/gh" <<EOF
#!/usr/bin/env bash
echo "token=\$GH_TOKEN \$*" >>"$tmp/gh.calls"
EOF
chmod +x "$tmp/bin/gh"
echo "bot-token" >"$tmp/token"

ci() { PATH="$tmp/bin:$PATH" LOCAL_CI_STATE="$tmp/state-$1" LOCAL_CI_TOKEN_FILE="$tmp/${TOKEN:-token}" LOCAL_CI_DOWN=true \
  bash "$script" --repo "$tmp/repo" "${@:2}" >"$tmp/out" 2>&1; echo $?; }
expect() { # title got want [grep]
  if [ "$2" = "$3" ] && { [ -z "${4:-}" ] || grep -q -- "$4" "$tmp/out" "$tmp/gh.calls" 2>/dev/null; }; then echo "ok    $1"
  else echo "FAIL  $1 (exit $2, want $3${4:+, \"$4\"})"; sed 's/^/      /' "$tmp/out"; bad=1; fi
}

expect "a green gate posts local-ci=success with the bot token" "$(ci a --gate true)" 0 "token=bot-token api repos/{owner}/{repo}/statuses/"
grep -q "state=success" "$tmp/gh.calls" && grep -q "context=local-ci" "$tmp/gh.calls" || { echo "FAIL  the post lacks state or context"; bad=1; }
: >"$tmp/gh.calls"
expect "a red gate posts nothing" "$(ci b --gate false)" 1 "RED"
[ ! -s "$tmp/gh.calls" ] || { echo "FAIL  a red gate called gh"; bad=1; }
expect "a tree already verified is not run again, and is posted" "$(ci a --gate false)" 0 "already verified"
expect "a dry run never calls gh" "$(ci c --gate true --dry-run)" 0 "would post"
expect "no token: green, not posted" "$(TOKEN=none ci d --gate true)" 3 "no bot token"
git -C "$tmp/repo" -c user.name=t -c user.email=t@t commit -q --allow-empty -m two
expect "an unpushed sha is refused" "$(ci e --gate true)" 2 "push it first"
expect "the gate runs in a fresh worktree at the sha" "$(ci f --ref HEAD~1 --gate 'test "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)"' --dry-run)" 0 "would post"
[ -z "$(git -C "$tmp/repo" worktree list | sed 1d)" ] || { echo "FAIL  a worktree was left behind"; bad=1; }

# The cloud split: a VM records with --dry-run --record and pushes the record; this machine posts with --post-from.
expect "a recorded run writes local-ci.json for the sha" "$(ci g --ref HEAD~1 --gate 'echo vm-gate' --dry-run --record "$tmp/rec")" 0 "recorded in"
jq -e --arg sha "$(git -C "$tmp/repo" rev-parse HEAD~1)" '.sha == $sha and .rc == 0 and .gate == "echo vm-gate"' "$tmp/rec/local-ci.json" >/dev/null \
  && [ -s "$tmp/rec/gate.log" ] || { echo "FAIL  the record lacks the sha, rc, gate or log"; bad=1; }
push_record() { # branch json
  git -C "$tmp/repo" worktree add -q --orphan -b "$1" "$tmp/ev-$1" 2>/dev/null
  echo "$2" >"$tmp/ev-$1/local-ci.json"
  git -C "$tmp/ev-$1" add -A && git -C "$tmp/ev-$1" -c user.name=t -c user.email=t@t commit -q -m record
  git -C "$tmp/ev-$1" push -q origin "$1"; git -C "$tmp/repo" worktree remove --force "$tmp/ev-$1"
}
push_record ev-green "$(cat "$tmp/rec/local-ci.json")"
: >"$tmp/gh.calls"
expect "--post-from posts a green record without running the gate" "$(ci h --ref HEAD~1 --gate 'echo vm-gate' --post-from ev-green)" 0 "record ev-green@"
grep -q "statuses/" "$tmp/gh.calls" || { echo "FAIL  --post-from did not post"; bad=1; }
[ ! -d "$tmp/state-h/logs" ] || [ -z "$(ls "$tmp/state-h/logs")" ] || { echo "FAIL  --post-from ran the gate"; bad=1; }
: >"$tmp/gh.calls"
expect "a record for another sha is refused" "$(git -C "$tmp/repo" push -q origin HEAD:main; ci i --ref HEAD --gate 'echo vm-gate' --post-from ev-green)" 1 "does not hold"
push_record ev-red "$(jq -c '.rc = 1' "$tmp/rec/local-ci.json")"
expect "a red record is refused" "$(ci j --ref HEAD~1 --gate 'echo vm-gate' --post-from ev-red)" 1 "exited 1"
expect "a record of another gate is refused" "$(ci k --ref HEAD~1 --gate 'make verify' --post-from ev-green)" 1 "not make verify"
expect "a branch with no record is refused" "$(ci l --post-from main)" 2 "no local-ci.json"
[ ! -s "$tmp/gh.calls" ] || { echo "FAIL  a refused record called gh"; bad=1; }

[ $bad -eq 0 ] && echo "local-ci dry run: ok" || echo "local-ci dry run: FAILED"
exit $bad
