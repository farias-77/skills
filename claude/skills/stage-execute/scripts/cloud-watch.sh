#!/usr/bin/env bash
# cloud-watch.sh <remote> <ref-pattern> <state-file> <deadline-epoch> [interval-seconds]
# Waits, with no model turns, for a push on the cloud entries' evidence branches: one `git ls-remote`
# per interval for every entry in flight. Exits 0 when a ref moved (prints "moved <ref> <sha>" per ref
# and updates the state file) or at the deadline (prints "deadline"). Exits 2 on bad arguments.
set -u
[ "$#" -ge 4 ] || { echo "usage: cloud-watch.sh <remote> <ref-pattern> <state-file> <deadline-epoch> [interval-seconds]" >&2; exit 2; }
remote=$1 pattern=$2 state=$3 deadline=$4 interval=${5:-60}
case "$deadline$interval" in *[!0-9]*) echo "deadline and interval are integers" >&2; exit 2 ;; esac
mkdir -p "$(dirname "$state")" && touch "$state"
while :; do
  if now=$(git ls-remote "$remote" "$pattern" 2>/dev/null); then
    now=$(printf '%s\n' "$now" | awk 'NF==2 {print $2" "$1}' | sort)
    moved=$(comm -13 <(sort "$state") <(printf '%s\n' "$now" | sed '/^$/d'))
    if [ -n "$moved" ]; then
      printf '%s\n' "$now" | sed '/^$/d' >"$state"
      printf '%s\n' "$moved" | sed 's/^/moved /'
      exit 0
    fi
  fi
  [ "$(date +%s)" -lt "$deadline" ] || { echo deadline; exit 0; }
  sleep "$interval"
done
