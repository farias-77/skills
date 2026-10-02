#!/usr/bin/env bash
# Renders a storyboard JSON into an H.264 MP4 under ~10 MB.
#   claude/video/render.sh <storyboard.json> <out.mp4>
# Installs the kit's dependencies on first use. Renders 1920x1080 at 30 fps
# with two browser tabs under nice: the machine is shared. Renders queue: a
# flock on one lock file lets a single render run at a time on the machine,
# so ten scribes dispatched together write their storyboards in parallel and
# then render one after the other.
set -euo pipefail
export LC_ALL=C

if [ $# -ne 2 ]; then
  echo "usage: $0 <storyboard.json> <out.mp4>" >&2
  exit 2
fi

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STORY="$(realpath "$1")"
OUT="$(realpath -m "$2")"
MAX_MB="${VIDEO_MAX_MB:-9.5}"

for bin in node npx ffmpeg ffprobe; do
  command -v "$bin" >/dev/null || { echo "render.sh: $bin not found" >&2; exit 1; }
done

# 1. dependencies, once
if [ ! -d "$KIT/node_modules/@remotion/cli" ]; then
  echo "render.sh: installing dependencies (once)" >&2
  (cd "$KIT" && nice -n 10 npm ci --no-audit --no-fund >&2)
fi

RUN="$(mktemp -d "${TMPDIR:-/tmp}/video-kit.XXXXXX")"
trap 'rm -rf "$RUN"' EXIT

# 2. validate the storyboard and stage fonts and images for this run
node "$KIT/prepare.mjs" "$STORY" "$RUN" >&2

# 3. wait for the machine: one render at a time, the others queue here
LOCK="${VIDEO_RENDER_LOCK:-${TMPDIR:-/tmp}/pipeline-video-render.lock}"
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "render.sh: another render is running; queued on $LOCK" >&2
  flock 9
fi

# 4. render
cd "$KIT"
nice -n 10 npx remotion render src/index.ts story "$RUN/raw.mp4" \
  --props="$RUN/props.json" \
  --public-dir="$RUN/public" \
  --concurrency=2 \
  --codec=h264 --crf=16 \
  --log=error >&2

# 5. re-encode: H.264, yuv420p, faststart, bitrate capped so the file stays under the budget
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$RUN/raw.mp4")"
KBPS="$(awk -v mb="$MAX_MB" -v d="$DUR" 'BEGIN { k = int(mb * 8192 / d * 0.92); if (k > 6000) k = 6000; print k }')"
mkdir -p "$(dirname "$OUT")"
nice -n 10 ffmpeg -y -v error -i "$RUN/raw.mp4" \
  -c:v libx264 -preset slow -crf 20 -maxrate "${KBPS}k" -bufsize "$((KBPS * 2))k" \
  -pix_fmt yuv420p -movflags +faststart -an "$OUT"

SIZE="$(stat -c %s "$OUT")"
LIMIT="$(awk -v mb="$MAX_MB" 'BEGIN { print int(mb * 1048576) }')"
if [ "$SIZE" -gt "$LIMIT" ]; then
  # the cap is a ceiling on peaks; a second pass at the average bitrate always fits
  nice -n 10 ffmpeg -y -v error -i "$RUN/raw.mp4" -c:v libx264 -preset slow -b:v "${KBPS}k" -pass 1 -passlogfile "$RUN/x264" -pix_fmt yuv420p -an -f mp4 /dev/null
  nice -n 10 ffmpeg -y -v error -i "$RUN/raw.mp4" -c:v libx264 -preset slow -b:v "${KBPS}k" -pass 2 -passlogfile "$RUN/x264" -pix_fmt yuv420p -movflags +faststart -an "$OUT"
  SIZE="$(stat -c %s "$OUT")"
fi
flock -u 9

printf '%s\t%.1f s\t%.1f MB\n' "$OUT" "$DUR" "$(awk -v s="$SIZE" 'BEGIN { print s / 1048576 }')"
