#!/usr/bin/env bash
set -euo pipefail

started=$(date +%s)
step() { printf 'cloud-setup: %-24s %4ss\n' "$1" "$(( $(date +%s) - started ))"; }

: '<toolchain-installs>'
step toolchains

repo=""
for candidate in "$PWD" /home/user/* /workspace/* /repo; do
  if [ -d "$candidate/.git" ] && [ -f "$candidate/<marker-file>" ]; then repo=$candidate; break; fi
done

if [ -n "$repo" ]; then
  cd "$repo"
  : '<dependency-warmup>'
  step dependencies
  : '<image-warmup>'
  step images
else
  echo "cloud-setup: repository not found; the SessionStart hook installs dependencies"
fi

: '<browser-install>'
step browsers

step done
