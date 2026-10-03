#!/usr/bin/env bash
# The launch film's web copy: one file under the artifact asset cap (20 MiB),
# so the close can publish it on the launch page. The master stays as it is.
#
#   web-copy.sh <in.mp4> <out.mp4> [max-MB=19]
#
# Already under the cap: copied as is. Otherwise re-encoded in two passes at
# the bitrate the cap allows: at the source's size when that bitrate is at
# least 2.5 Mbit/s, scaled to 720 px on the short side when it is at least
# 0.6 Mbit/s. Below that the film is too long for one asset: exit 3, and the
# close delivers the local files only.
set -euo pipefail
export LC_ALL=C
in=${1:?usage: web-copy.sh <in.mp4> <out.mp4> [max-MB]}
out=${2:?usage: web-copy.sh <in.mp4> <out.mp4> [max-MB]}
max=${3:-19}
mkdir -p "$(dirname "$out")"
size=$(stat -c %s "$in")
cap=$((max * 1024 * 1024))
if [ "$size" -le "$cap" ]; then
  cp "$in" "$out"
  echo "$out	$(awk "BEGIN{printf \"%.1f\", $size/1048576}") MB	copied"
  exit 0
fi
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
w=$(ffprobe -v error -select_streams v:0 -show_entries stream=width -of default=nw=1:nk=1 "$in" | head -1)
h=$(ffprobe -v error -select_streams v:0 -show_entries stream=height -of default=nw=1:nk=1 "$in" | head -1)
audio=$(ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$in" | head -1)
abr=0
[ -n "$audio" ] && abr=96
# 4% for the container; the audio's share first
vbr=$(awk "BEGIN{printf \"%d\", ($cap*8*0.96/$dur)/1000 - $abr}")
if [ "$vbr" -ge 2500 ]; then
  scale="scale=$w:$h"
elif [ "$vbr" -ge 600 ]; then
  if [ "$w" -ge "$h" ]; then scale="scale=-2:720"; else scale="scale=720:-2"; fi
else
  echo "web-copy: $in lasts ${dur%.*} s; ${vbr} kbit/s is too little for one ${max} MB asset" >&2
  exit 3
fi
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
common=(-vf "$scale,format=yuv420p" -c:v libx264 -preset slow -b:v "${vbr}k" -maxrate "$((vbr * 2))k" -bufsize "$((vbr * 4))k")
nice -n 10 ffmpeg -nostdin -y -v error -i "$in" "${common[@]}" -pass 1 -passlogfile "$tmp/pass" -an -f mp4 /dev/null
if [ -n "$audio" ]; then a=(-c:a aac -b:a "${abr}k"); else a=(-an); fi
nice -n 10 ffmpeg -nostdin -y -v error -i "$in" "${common[@]}" -pass 2 -passlogfile "$tmp/pass" "${a[@]}" -movflags +faststart "$out"
osize=$(stat -c %s "$out")
if [ "$osize" -gt "$cap" ]; then
  echo "web-copy: $out came out at $((osize / 1048576)) MB, over ${max} MB" >&2
  exit 3
fi
echo "$out	$(awk "BEGIN{printf \"%.1f\", $osize/1048576}") MB	${vbr} kbit/s ${scale#scale=}"
