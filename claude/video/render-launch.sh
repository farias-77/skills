#!/usr/bin/env bash
# The launch profile: renders a "mode": "launch" storyboard into the film the
# company forwards, at 16:9 and 9:16, with its audio and its captions.
#   claude/video/render-launch.sh <storyboard.json> <out.mp4> [--no-vertical | --vertical-only]
# Writes <out>.mp4 (1920x1080), <out>-vertical.mp4 (1080x1920) and <out>.srt.
#
# Against render.sh (the stage-review profile): the audio is kept (AAC
# 160 kbit/s), the quality is higher (CRF 18), the budget is ~50 MB for the
# 16:9 film (LAUNCH_MAX_MB) and ~25 MB for the vertical cut
# (LAUNCH_VERTICAL_MAX_MB), and three.js renders with --gl=swangle
# (VIDEO_GL overrides). It takes the same flock as render.sh, so a launch
# render queues behind the stage videos and they queue behind it; it holds
# the lock for both cuts. Two browser tabs, under nice: the machine is shared.
set -euo pipefail
export LC_ALL=C

VERTICAL=1
HORIZONTAL=1
ARGS=()
for a in "$@"; do
  case "$a" in
    --no-vertical) VERTICAL=0 ;;
    --vertical-only) HORIZONTAL=0 ;;
    *) ARGS+=("$a") ;;
  esac
done
if [ ${#ARGS[@]} -ne 2 ]; then
  echo "usage: $0 <storyboard.json> <out.mp4> [--no-vertical | --vertical-only]" >&2
  exit 2
fi

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
STORY="$(realpath "${ARGS[0]}")"
OUT="$(realpath -m "${ARGS[1]}")"
BASE="${OUT%.mp4}"
MAX_MB="${LAUNCH_MAX_MB:-50}"
VMAX_MB="${LAUNCH_VERTICAL_MAX_MB:-25}"
GL="${VIDEO_GL:-swangle}"

for bin in node npx ffmpeg ffprobe flock; do
  command -v "$bin" >/dev/null || { echo "render-launch.sh: $bin not found" >&2; exit 1; }
done

if [ ! -d "$KIT/node_modules/@remotion/three" ]; then
  echo "render-launch.sh: installing dependencies (once)" >&2
  (cd "$KIT" && nice -n 10 npm ci --no-audit --no-fund >&2)
fi

RUN="$(mktemp -d "${TMPDIR:-/tmp}/video-launch.XXXXXX")"
trap 'rm -rf "$RUN"' EXIT

# 1. validate, stage the footage, the posters and the music, write the captions
node "$KIT/prepare.mjs" "$STORY" "$RUN" >&2
grep -q '"mode":"launch"' "$RUN/props.json" || { echo "render-launch.sh: the storyboard is not \"mode\": \"launch\"; use render.sh" >&2; exit 1; }

# 2. one render at a time on the machine
LOCK="${VIDEO_RENDER_LOCK:-${TMPDIR:-/tmp}/pipeline-video-render.lock}"
exec 9>"$LOCK"
if ! flock -n 9; then
  echo "render-launch.sh: another render is running; queued on $LOCK" >&2
  flock 9
fi

cd "$KIT"
render() { # <composition> <raw.mp4>
  nice -n 10 npx remotion render src/index.ts "$1" "$2" \
    --props="$RUN/props.json" \
    --public-dir="$RUN/public" \
    --concurrency=2 \
    --gl="$GL" \
    --timeout=180000 \
    --codec=h264 --crf=16 --audio-codec=aac --audio-bitrate=192k \
    --log=error >&2
}

# 3. encode under a budget: CRF 18 capped at the bitrate the budget allows; a
#    second pass at the average bitrate when the cap is not enough. Audio kept.
encode() { # <raw.mp4> <out.mp4> <max MB>
  local raw="$1" out="$2" mb="$3" dur kbps size limit
  dur="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$raw")"
  kbps="$(awk -v mb="$mb" -v d="$dur" 'BEGIN { k = int(mb * 8192 / d * 0.94) - 160; if (k > 8000) k = 8000; if (k < 600) k = 600; print k }')"
  local A=(-c:a aac -b:a 160k -af "loudnorm=I=-16:TP=-1.5")
  ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$raw" | grep -q . || A=(-an)
  nice -n 10 ffmpeg -y -v error -i "$raw" -c:v libx264 -preset slow -crf 18 -maxrate "${kbps}k" -bufsize "$((kbps * 2))k" \
    -pix_fmt yuv420p "${A[@]}" -movflags +faststart "$out"
  size="$(stat -c %s "$out")"
  limit="$(awk -v mb="$mb" 'BEGIN { print int(mb * 1048576) }')"
  if [ "$size" -gt "$limit" ]; then
    nice -n 10 ffmpeg -y -v error -i "$raw" -c:v libx264 -preset slow -b:v "${kbps}k" -pass 1 -passlogfile "$RUN/x264" -pix_fmt yuv420p -an -f mp4 /dev/null
    nice -n 10 ffmpeg -y -v error -i "$raw" -c:v libx264 -preset slow -b:v "${kbps}k" -pass 2 -passlogfile "$RUN/x264" -pix_fmt yuv420p "${A[@]}" -movflags +faststart "$out"
  fi
  printf '%s\t%.1f s\t%.1f MB\n' "$out" "$dur" "$(awk -v s="$(stat -c %s "$out")" 'BEGIN { print s / 1048576 }')"
}

mkdir -p "$(dirname "$OUT")"
cp "$RUN/captions.srt" "$BASE.srt"
printf '%s\tcaptions\n' "$BASE.srt"
if [ "$HORIZONTAL" = 1 ]; then
  render launch "$RUN/raw.mp4"
  encode "$RUN/raw.mp4" "$OUT" "$MAX_MB"
fi
if [ "$VERTICAL" = 1 ]; then
  # the phone cut never costs the film: a failure here is reported, the 16:9 stays
  if render launch-vertical "$RUN/raw-v.mp4"; then
    encode "$RUN/raw-v.mp4" "$BASE-vertical.mp4" "$VMAX_MB"
  else
    echo "render-launch.sh: the vertical cut failed; rerun with --vertical-only" >&2
    flock -u 9
    exit 3
  fi
fi
flock -u 9
