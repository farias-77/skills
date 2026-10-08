#!/usr/bin/env bash
# load-wait.sh [threshold] [max-seconds]
# Waits until the 1-min load is under the threshold (default nproc), at most max-seconds (default 590),
# then prints /proc/loadavg. One bare command, so the allow list matches it in a subagent.
set -uo pipefail
threshold=${1:-$(nproc)} max=${2:-590}
case $threshold in ''|*[!0-9.]*) echo "threshold must be a number" >&2; exit 2 ;; esac
case $max in ''|*[!0-9]*) echo "max-seconds must be seconds" >&2; exit 2 ;; esac
end=$((SECONDS + max))
until awk -v t="$threshold" '{ exit !($1 + 0 < t + 0) }' /proc/loadavg || [ "$SECONDS" -ge "$end" ]; do sleep 15; done
cat /proc/loadavg
