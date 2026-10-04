#!/usr/bin/env bash
# Waits for a push on the cloud entries' evidence branches, with no model turns.
# Usage: cloud-watch.sh <remote> <ref-pattern> <state-file> <deadline-epoch> [interval-seconds]
# One `git ls-remote` per interval for every entry in flight. Exits 0 when a
# ref under the pattern moved (prints "moved <ref> <sha>", one line each, and
# updates the state file) or at the deadline (prints "deadline"). Exits 2 on
# bad arguments. A failed ls-remote is retried at the next interval.
set -u

if [ "$#" -lt 4 ] || [ "${1:-}" = "--help" ]; then
  echo "usage: cloud-watch.sh <remote> <ref-pattern> <state-file> <deadline-epoch> [interval-seconds]" >&2
  exit 2
fi

remote=$1
pattern=$2
state=$3
deadline=$4
interval=${5:-60}

case "$deadline" in ''|*[!0-9]*) echo "deadline must be epoch seconds" >&2; exit 2 ;; esac
case "$interval" in ''|*[!0-9]*) echo "interval must be seconds" >&2; exit 2 ;; esac

mkdir -p "$(dirname "$state")"
touch "$state"

while :; do
  if now=$(git ls-remote "$remote" "$pattern" 2>/dev/null); then
    now=$(printf '%s\n' "$now" | awk 'NF==2 {print $2" "$1}' | sort)
    moved=$(comm -13 <(sort "$state") <(printf '%s\n' "$now" | sed '/^$/d'))
    if [ -n "$moved" ]; then
      printf '%s\n' "$now" | sed '/^$/d' > "$state"
      printf '%s\n' "$moved" | sed 's/^/moved /'
      exit 0
    fi
  fi
  if [ "$(date +%s)" -ge "$deadline" ]; then
    echo "deadline"
    exit 0
  fi
  sleep "$interval"
done
