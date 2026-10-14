#!/usr/bin/env bash
# run-workflow.sh <repo> <script.js> <args.json> <return.json> [log]
# Runs one workflow in a cloud session VM through a nested print-mode Claude Code, and writes
# its return to <return.json>. The cloud session itself asks the user to approve every Workflow
# launch whatever the allow rules say; print mode never asks and applies the project's
# `Workflow` allow rule. The workspace is untrusted there, so the project's settings come in
# by --settings, or print mode ignores its allow rules. Exit: 0 a return written · 1 none
# (an interrupted return is written instead) · 2 bad call.
set -uo pipefail
[ $# -ge 4 ] || { echo "usage: run-workflow.sh <repo> <script.js> <args.json> <return.json> [log]" >&2; exit 2; }
repo=$(cd "$1" && pwd) || exit 2
script=$(realpath -m "$2") args=$(realpath -m "$3") out=$(realpath -m "$4")
log=$(realpath -m "${5:-${out%.json}.log}")
mkdir -p "$(dirname "$out")" "$(dirname "$log")"
[ -f "$script" ] || { echo "run-workflow: no script at $script" >&2; exit 2; }
[ -f "$args" ] || { echo "run-workflow: no args at $args" >&2; exit 2; }
settings="$repo/.claude/settings.json"
[ -f "$settings" ] || { echo "run-workflow: no project settings at $settings" >&2; exit 2; }
rm -f "$out"

prompt="Use a workflow: run the Workflow tool with scriptPath $script and, as its args, the JSON object in $args (read the file; pass its content as the args object, unchanged). When the run finishes, write its return verbatim as JSON to $out, then stop. Do nothing else."

# Print mode kills background work 10 minutes after its last turn unless the ceiling is off;
# the prompt goes on stdin because --add-dir takes every argument after it.
(cd "$repo" && CLAUDE_CODE_PRINT_BG_WAIT_CEILING_MS=0 claude -p --settings "$settings" \
  --permission-mode acceptEdits --add-dir "$(dirname "$script")" "$(dirname "$args")" "$(dirname "$out")" \
  <<<"$prompt") >"$log" 2>&1
rc=$?

if [ -s "$out" ] && jq -e . "$out" >/dev/null 2>&1; then exit 0; fi
reason=$(grep -v '^Permission \(allow\|deny\) rule' "$log" | tail -n 3 | tr '\n' ' ' | cut -c1-300)
jq -nc --arg reason "the nested run exited $rc with no return: $reason" '{status: "interrupted", reason: $reason}' >"$out"
exit 1
