#!/usr/bin/env bash
# remind-scout.sh: the PostToolUse hook that reminds the main session to send
# a scout instead of reading file after file to look something up.
#
# The house rule (CLAUDE.md, "The session never reads to look something up;
# it sends a scout"): a stage's session is an expensive model in a long
# conversation, and every file it reads is paid again on every later turn.
# This hook counts the main session's Read, Grep and Glob calls in a row. At
# the Nth (SCOUT_REMINDER_AFTER, default 4) it adds one line of context:
# send scout (Haiku 5.5, medium) with the question, or go on if you are about
# to rule on that text. One reminder per streak; a Write, Edit, MultiEdit,
# NotebookEdit, Agent or Task call ends the streak. A Read of a file the
# session wrote earlier does not count.
#
# Subagents read freely (scouts, builders, reviewers): Claude Code puts
# `agent_id` in the hook input only when the call comes from a subagent
# (code.claude.com/docs/en/hooks, "Common input fields"); such calls are
# ignored.
#
# It never blocks. It decides nothing: no output, or one additionalContext
# line, always exit 0. Any error (no jq, bad input, an unwritable state dir)
# is a silent exit 0. The state is one small file per session, named by its
# session_id, under $SCOUT_REMINDER_DIR, else the session's scratchpad_dir
# (from the hook input), else ${TMPDIR:-/tmp}/remind-scout-<uid>: the count on
# the first line, then the paths the session wrote.
#
# Install (pipeline-setup does this): copy to .claude/hooks/, chmod +x, and
# register it in .claude/settings.json through a fail-open wrapper:
#   "PostToolUse": [{"matcher": "Read|Grep|Glob|Write|Edit|MultiEdit|NotebookEdit|Agent|Task",
#     "hooks": [{"type": "command", "timeout": 5, "command":
#       "f=\"$CLAUDE_PROJECT_DIR\"/.claude/hooks/remind-scout.sh; [ -x \"$f\" ] && exec \"$f\"; exit 0"}]}]
trap 'exit 0' ERR
command -v jq >/dev/null 2>&1 || exit 0

after=${SCOUT_REMINDER_AFTER:-4}

IFS=$'\x1f' read -r -d '' agent session tool path scratch < <(
  jq -j '(.agent_id // ""), "\u001f", (.session_id // ""), "\u001f", (.tool_name // ""), "\u001f",
         (.tool_input.file_path // .tool_input.notebook_path // ""), "\u001f", (.scratchpad_dir // ""), "\u0000"' 2>/dev/null
) || exit 0

[ -z "$agent" ] || exit 0
session=${session//[^A-Za-z0-9_-]/}
[ -n "$session" ] || exit 0
if [ -n "${SCOUT_REMINDER_DIR:-}" ]; then dir=$SCOUT_REMINDER_DIR
elif [ -n "$scratch" ] && [ -d "$scratch" ]; then dir=$scratch/remind-scout
else dir=${TMPDIR:-/tmp}/remind-scout-$(id -u); fi
mkdir -p "$dir" 2>/dev/null || exit 0
state=$dir/$session

count=0
if [ -f "$state" ]; then read -r count <"$state" || count=0; fi
case $count in '' | *[!0-9]*) count=0 ;; esac
save() { # count, [a path the session wrote]
  {
    echo "$1"
    if [ -f "$state" ]; then tail -n +2 "$state"; fi
    if [ -n "${2:-}" ]; then echo "$2"; fi
  } >"$state.$$" && mv "$state.$$" "$state"
}

case $tool in
  Write | Edit | MultiEdit | NotebookEdit) save 0 "$path" ;;
  Agent | Task) save 0 ;;
  Read | Grep | Glob)
    if [ "$tool" = Read ] && [ -n "$path" ] && [ -f "$state" ] && tail -n +2 "$state" | grep -qxF -- "$path"; then
      exit 0
    fi
    count=$((count + 1))
    save "$count"
    if [ "$count" -eq "$after" ]; then
      jq -cn --arg n "$count" '{hookSpecificOutput: {hookEventName: "PostToolUse", additionalContext:
        ("remind-scout: " + $n + " reads in a row. If you are looking something up, send scout (Haiku 5.5, medium) with the question and work from the lines it quotes. If you are about to rule on this text, go on.")}}'
    fi
    ;;
esac
exit 0
