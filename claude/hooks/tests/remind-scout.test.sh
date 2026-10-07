#!/usr/bin/env bash
# Tests claude/hooks/remind-scout.sh. Each case pipes a PostToolUse JSON on
# stdin and compares the outcome (remind · none) with the expected one. The
# hook must always exit 0 and print nothing but its one reminder.
# Run: bash claude/hooks/tests/remind-scout.test.sh
set -uo pipefail

here=$(cd "$(dirname "$0")" && pwd)
hook=$here/../remind-scout.sh
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
export SCOUT_REMINDER_DIR=$tmp/state SCOUT_REMINDER_AFTER=4

pass=0 fail=0
check() { # expected, got, label
  if [ "$2" = "$1" ]; then pass=$((pass + 1)); printf 'ok    %-6s %s\n' "$1" "$3"
  else fail=$((fail + 1)); printf 'FAIL  want %s got %s  %s\n' "$1" "$2" "$3"; fi
}
last=''
run() { # expected, session, tool, [path], [agent_id]
  local want=$1 session=$2 tool=$3 path=${4:-} agent=${5:-} json rc got
  json=$(jq -cn --arg s "$session" --arg t "$tool" --arg p "$path" --arg a "$agent" \
    '{session_id: $s, hook_event_name: "PostToolUse", tool_name: $t, tool_input: {file_path: $p, pattern: "x"}, tool_response: {}}
     + (if $a == "" then {} else {agent_id: $a, agent_type: "scout"} end)')
  last=$(printf '%s' "$json" | "$hook" 2>&1); rc=$?
  case "$rc:$last" in
    0:) got=none ;;
    0:*additionalContext*scout*) got=remind ;;
    *) got="error($rc)" ;;
  esac
  check "$want" "$got" "$session $tool $path${agent:+ (agent $agent)}"
}

echo "-- a streak of reads reminds once, at the 4th"
run none s1 Read /r/a.md
run none s1 Grep
run none s1 Glob
run remind s1 Read /r/d.md
printf '%s' "$last" | jq -e '.hookSpecificOutput.hookEventName == "PostToolUse"' >/dev/null; check 0 $? "the reminder is PostToolUse additionalContext JSON"
printf '%s' "$last" | jq -e '.hookSpecificOutput.additionalContext | contains("send scout (Haiku 5.5, medium)")' >/dev/null; check 0 $? "the reminder names scout (Haiku 5.5, medium)"
run none s1 Read /r/e.md
run none s1 Read /r/f.md

echo "-- a write, an edit or an agent ends the streak"
run none s1 Write /r/out.md
run none s1 Read /r/a.md
run none s1 Read /r/b.md
run none s1 Read /r/c.md
run remind s1 Read /r/d.md
run none s1 Agent
run none s1 Read /r/a.md
run none s1 Edit /r/notes.md
run none s1 Read /r/a.md
run none s1 Task
run none s1 Read /r/a.md

echo "-- a file the session wrote does not count"
run none s2 Write /r/mine.md
run none s2 Read /r/mine.md
run none s2 Read /r/mine.md
run none s2 Read /r/mine.md
run none s2 Read /r/mine.md
run none s2 Read /r/x.md
run none s2 Read /r/mine.md
run none s2 Read /r/y.md
run none s2 Grep
run remind s2 Read /r/z.md

echo "-- subagents read freely"
for i in 1 2 3 4 5 6; do run none s3 Read "/r/$i.md" agent-7; done
run none s3 Read /r/a.md
run none s3 Read /r/b.md
run none s3 Read /r/c.md
run remind s3 Read /r/d.md

echo "-- sessions are counted apart"
run none s4 Read /r/a.md
run none s5 Read /r/a.md
run none s4 Read /r/b.md
run none s4 Read /r/c.md
run none s5 Read /r/b.md
run remind s4 Read /r/d.md

echo "-- the threshold is one variable"
SCOUT_REMINDER_AFTER=2 run none s6 Read /r/a.md
SCOUT_REMINDER_AFTER=2 run remind s6 Read /r/b.md

echo "-- the state lives in the session's scratchpad when the input names one"
mkdir -p "$tmp/pad"
printf '{"session_id":"s10","tool_name":"Read","scratchpad_dir":"%s"}' "$tmp/pad" | SCOUT_REMINDER_DIR= "$hook"
[ -f "$tmp/pad/remind-scout/s10" ]; check 0 $? "state file under scratchpad_dir/remind-scout"

echo "-- fails open"
out=$(printf 'not json' | "$hook" 2>&1); check "0:" "$?:$out" "input that is not JSON: exit 0, silent"
out=$(printf '' | "$hook" 2>&1); check "0:" "$?:$out" "empty input: exit 0, silent"
out=$(printf '{"tool_name":"Read"}' | "$hook" 2>&1); check "0:" "$?:$out" "no session_id: exit 0, silent"
out=$(printf '{"session_id":"s7","tool_name":"Read"}' | SCOUT_REMINDER_DIR=/proc/nowhere "$hook" 2>&1); check "0:" "$?:$out" "unwritable state dir: exit 0, silent"
out=$(printf '{"session_id":"s8","tool_name":"Read"}' | PATH=/nonexistent /bin/bash "$hook" 2>&1); check "0:" "$?:$out" "no jq on PATH: exit 0, silent"
printf 'garbage\n' >"$SCOUT_REMINDER_DIR/s9"
out=$(printf '{"session_id":"s9","tool_name":"Read"}' | "$hook" 2>&1); check "0:" "$?:$out" "a corrupt state file: exit 0, silent"
out=$(printf '{"session_id":"../../etc/x","tool_name":"Read"}' | "$hook" 2>&1); check "0:" "$?:$out" "a session_id with a path in it stays in the state dir"
[ -f "$SCOUT_REMINDER_DIR/etcx" ]; check 0 $? "the state file is named by the sanitized id"
wrapper='f="$CLAUDE_PROJECT_DIR"/.claude/hooks/remind-scout.sh; [ -x "$f" ] && exec "$f"; exit 0'
out=$(printf '{}' | CLAUDE_PROJECT_DIR=$tmp/nowhere bash -c "$wrapper" 2>&1); check "0:" "$?:$out" "the settings wrapper passes when the hook file is missing"

echo "-- fast"
start=$(date +%s%N)
for i in $(seq 20); do printf '{"session_id":"perf","tool_name":"Read","tool_input":{"file_path":"/r/%s"}}' "$i" | "$hook" >/dev/null; done
ms=$(( ($(date +%s%N) - start) / 20000000 ))
[ "$ms" -lt 50 ]; check 0 $? "one call takes ${ms} ms (under 50)"

echo
echo "$pass passed, $fail failed"
[ "$fail" -eq 0 ]
