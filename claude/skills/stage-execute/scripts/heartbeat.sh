#!/usr/bin/env bash
# heartbeat.sh <evidence-dir> <start|end> <agent-label> [ceiling-minutes]
# One line per beat in <evidence-dir>/beats.jsonl: the entry's telemetry, and in a cloud run its pulse.
# With HEARTBEAT_PUSH=1 (a cloud run) each beat is committed and pushed on the evidence branch,
# so the tech lead's watcher sees a live agent and the ceiling it declared.
set -uo pipefail
[ $# -ge 3 ] || { echo "usage: heartbeat.sh <evidence-dir> <start|end> <agent-label> [ceiling-minutes]" >&2; exit 2; }
dir=$1 event=$2 label=$3 ceiling=${4:-30}
case $event in start|end) ;; *) echo "event must be start or end" >&2; exit 2 ;; esac
case $ceiling in ''|*[!0-9]*) echo "ceiling must be minutes" >&2; exit 2 ;; esac
mkdir -p "$dir"
line=$(printf '{"at":"%s","event":"%s","agent":"%s","ceiling":%s}' "$(date -u +%FT%TZ)" "$event" "$label" "$ceiling")
lock="${TMPDIR:-/tmp}/heartbeat-$(printf %s "$dir" | sha1sum | cut -c1-12).lock"
(
  flock -w 60 9 || exit 0
  printf '%s\n' "$line" >>"$dir/beats.jsonl"
  [ "${HEARTBEAT_PUSH:-0}" = 1 ] || exit 0
  git -C "$dir" add beats.jsonl && git -C "$dir" commit -qm "beat: $event $label" || exit 0
  for _ in 1 2 3; do git -C "$dir" push -q origin "$(git -C "$dir" branch --show-current)" 2>/dev/null && exit 0; sleep 5; done
  echo "heartbeat: push failed; the beat is committed and goes with the next push" >&2
) 9>"$lock"
exit 0
