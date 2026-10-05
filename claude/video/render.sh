#!/usr/bin/env bash
# Renders a film into an H.264 MP4 under a size budget, one render at a time on the machine.
#   claude/video/render.sh <film.tsx> <out.mp4> [--size 720|1080] [--max-mb N] [--first]
# 720p by default (stage videos); --size 1080 for the users' video with real screens.
# --max-mb is the file budget (default 10). --first jumps the queue: only for a video
# someone is waiting for live (the design debate's). Audio is kept when the film has it.
set -euo pipefail
export LC_ALL=C

usage() { echo "usage: $0 <film.tsx> <out.mp4> [--size 720|1080] [--max-mb N] [--first]" >&2; exit 2; }
[ $# -ge 2 ] || usage
FILM="$(realpath "$1")"; OUT="$(realpath -m "$2")"; shift 2
SIZE=720; MAX_MB=10; FIRST=""
while [ $# -gt 0 ]; do
  case "$1" in
    --size) SIZE="$2"; shift 2 ;;
    --max-mb) MAX_MB="$2"; shift 2 ;;
    --first) FIRST=1; shift ;;
    *) usage ;;
  esac
done

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
for bin in node ffmpeg ffprobe flock; do
  command -v "$bin" >/dev/null || { echo "render.sh: $bin not found" >&2; exit 1; }
done
if [ ! -d "$KIT/node_modules/@remotion/renderer" ]; then
  echo "render.sh: installing dependencies (once)" >&2
  (cd "$KIT" && nice -n 10 npm ci --no-audit --no-fund >&2)
fi

TMP="$(mktemp -d "${TMPDIR:-/tmp}/video-render.XXXXXX")"
LOCK="${VIDEO_RENDER_LOCK:-${TMPDIR:-/tmp}/pipeline-video-render.lock}"
MARK="$LOCK.first.$$"
trap 'rm -rf "$TMP" "$MARK"' EXIT

# 1. a film that does not bundle fails here, before it waits in the queue
node "$KIT/film.mjs" check "$FILM" >&2

# 2. one render at a time; a --first render goes ahead of the ones waiting
first_waiting() {
  local m pid
  for m in "$LOCK".first.*; do
    [ -e "$m" ] || continue
    pid="${m##*.}"
    if kill -0 "$pid" 2>/dev/null; then return 0; else rm -f "$m"; fi
  done
  return 1
}
exec 9>"$LOCK"
if [ -n "$FIRST" ]; then
  touch "$MARK"
  flock -n 9 || { echo "render.sh: a render is running; next in line on $LOCK" >&2; flock 9; }
else
  announced=""
  while :; do
    if ! first_waiting && flock -w 10 9; then
      if first_waiting; then flock -u 9; continue; fi
      break
    fi
    [ -n "$announced" ] || { echo "render.sh: another render is running; queued on $LOCK" >&2; announced=1; }
    sleep 5
  done
fi

# 3. render
nice -n 10 node "$KIT/film.mjs" render "$FILM" "$TMP/raw.mp4" --size "$SIZE" >&2

# 4. encode: CRF 20 capped at the bitrate the budget allows; a two-pass at the average when the cap is not enough
DUR="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$TMP/raw.mp4")"
A=(-c:a aac -b:a 128k)
ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$TMP/raw.mp4" | grep -q . || A=(-an)
KBPS="$(awk -v mb="$MAX_MB" -v d="$DUR" -v a="${#A[@]}" 'BEGIN { k = int(mb * 8192 / d * 0.92) - (a > 1 ? 128 : 0); if (k > 6000) k = 6000; if (k < 300) k = 300; print k }')"
mkdir -p "$(dirname "$OUT")"
nice -n 10 ffmpeg -y -v error -i "$TMP/raw.mp4" -c:v libx264 -preset slow -crf 20 -maxrate "${KBPS}k" -bufsize "$((KBPS * 2))k" \
  -pix_fmt yuv420p "${A[@]}" -movflags +faststart "$OUT"
LIMIT="$(awk -v mb="$MAX_MB" 'BEGIN { print int(mb * 1048576) }')"
if [ "$(stat -c %s "$OUT")" -gt "$LIMIT" ]; then
  nice -n 10 ffmpeg -y -v error -i "$TMP/raw.mp4" -c:v libx264 -preset slow -b:v "${KBPS}k" -pass 1 -passlogfile "$TMP/x264" -pix_fmt yuv420p -an -f mp4 /dev/null
  nice -n 10 ffmpeg -y -v error -i "$TMP/raw.mp4" -c:v libx264 -preset slow -b:v "${KBPS}k" -pass 2 -passlogfile "$TMP/x264" -pix_fmt yuv420p "${A[@]}" -movflags +faststart "$OUT"
fi
flock -u 9

printf '%s\t%.1f s\t%.1f MB\n' "$OUT" "$DUR" "$(awk -v s="$(stat -c %s "$OUT")" 'BEGIN { print s / 1048576 }')"
