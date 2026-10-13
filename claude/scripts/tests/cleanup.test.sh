#!/usr/bin/env bash
# Tests claude/scripts/cleanup.sh's checkouts step against throwaway repos:
# the main checkout ends on the default branch, level with origin, and
# nothing uncommitted, on another branch or ahead of origin is touched.
# Run: bash claude/scripts/tests/cleanup.test.sh
set -uo pipefail

here=$(cd "$(dirname "$0")" && pwd)
script=$here/../cleanup.sh
tmp=$(cd "$(mktemp -d)" && pwd -P)
trap 'rm -rf "$tmp"' EXIT
export GIT_AUTHOR_NAME=t GIT_AUTHOR_EMAIL=t@t GIT_COMMITTER_NAME=t GIT_COMMITTER_EMAIL=t@t
slug=2026-10-13-demo
bad=0

repo() { # name: a bare origin with main, a clone, and a second clone that pushes
  git init -q --bare -b main "$tmp/$1.git"
  git clone -q "$tmp/$1.git" "$tmp/$1" 2>/dev/null
  echo one >"$tmp/$1/f"; git -C "$tmp/$1" add f; git -C "$tmp/$1" commit -q -m one; git -C "$tmp/$1" push -q origin main
  git clone -q "$tmp/$1.git" "$tmp/$1-peer"
}
advance() { # name: someone else lands a commit on origin's main
  git -C "$tmp/$1-peer" pull -q --ff-only; echo "$RANDOM" >>"$tmp/$1-peer/g"
  git -C "$tmp/$1-peer" add g; git -C "$tmp/$1-peer" commit -q -m peer; git -C "$tmp/$1-peer" push -q origin main
}
run() { (cd "$tmp" && bash "$script" "$slug" "$@" >"$tmp/out" 2>&1); echo $?; }
expect() { # title got want [grep]
  if [ "$2" = "$3" ] && { [ -z "${4:-}" ] || grep -q -- "$4" "$tmp/out"; }; then echo "ok    $1"
  else echo "FAIL  $1 (exit $2, want $3${4:+, \"$4\"})"; sed 's/^/      /' "$tmp/out"; bad=1; fi
}
is() { if [ "$2" = "$3" ]; then echo "ok    $1"; else echo "FAIL  $1 (got \"$2\", want \"$3\")"; bad=1; fi; }
head_of() { git -C "$tmp/$1" symbolic-ref -q --short HEAD; }
level() { [ "$(git -C "$tmp/$1" rev-parse HEAD)" = "$(git -C "$tmp/$1" rev-parse origin/main)" ] && echo yes || echo no; }

echo "-- left on the workstream's branch, main moved: switched and fast-forwarded"
repo a; git -C "$tmp/a" switch -q -c "feat/$slug"; advance a
expect "--check lists the checkout" "$(run --repo "$tmp/a")" 1 "left      checkout .*on feat/$slug, not main, main 1 behind origin"
expect "--apply switches, pulls and removes the branch" "$(run --repo "$tmp/a" --apply)" 0 "removed   branch     feat/$slug"
expect "--check comes back empty" "$(run --repo "$tmp/a")" 0 "nothing of $slug is left"
is "on main" "$(head_of a)" main
is "level with origin/main" "$(level a)" yes

echo "-- on main, behind origin: fast-forwarded"
advance a
expect "--check lists it behind" "$(run --repo "$tmp/a")" 1 "main 1 behind origin"
run --repo "$tmp/a" --apply >/dev/null
is "level with origin/main" "$(level a)" yes

echo "-- uncommitted changes: listed as his, never touched"
advance a; echo dirty >>"$tmp/a/f"
expect "--check lists it, does not count it" "$(run --repo "$tmp/a")" 0 "his       checkout .*uncommitted changes on main"
run --repo "$tmp/a" --apply >/dev/null
is "the change is still there" "$(tail -n 1 "$tmp/a/f")" dirty
is "not pulled" "$(level a)" no
git -C "$tmp/a" checkout -q -- f; run --repo "$tmp/a" --apply >/dev/null

echo "-- another branch: listed as his, left there"
git -C "$tmp/a" switch -q -c other
expect "--check lists it, does not count it" "$(run --repo "$tmp/a")" 0 "on other, not this workstream's"
run --repo "$tmp/a" --apply >/dev/null
is "still on other" "$(head_of a)" other
git -C "$tmp/a" switch -q main

echo "-- local commits on main not on origin: listed as his"
echo mine >>"$tmp/a/f"; git -C "$tmp/a" commit -q -am mine
expect "--check lists it, does not count it" "$(run --repo "$tmp/a")" 0 "main has 1 commit(s) not on origin"
git -C "$tmp/a" reset -q --hard origin/main

echo "-- the designs root: pulled on its default branch, the workstream's own edits kept"
repo d; mkdir -p "$tmp/d/$slug"; echo t >"$tmp/d/$slug/trace.md"; git -C "$tmp/d" add .; git -C "$tmp/d" commit -q -m ws; git -C "$tmp/d" push -q origin main
advance d; echo more >>"$tmp/d/$slug/trace.md"
expect "--check lists it behind" "$(run --repo "$tmp/a" --ws "$tmp/d/$slug")" 1 "checkout .*/d (main 1 behind origin)"
expect "--apply pulls it" "$(run --repo "$tmp/a" --ws "$tmp/d/$slug" --apply)" 0
is "level with origin/main" "$(level d)" yes
is "the workstream's edit is kept" "$(tail -n 1 "$tmp/d/$slug/trace.md")" more
git -C "$tmp/d" switch -q -c elsewhere; advance d
expect "on another branch it is not looked at" "$(run --repo "$tmp/a" --ws "$tmp/d/$slug")" 0 "nothing of $slug is left"

[ "$bad" = 0 ] && echo "cleanup: all passed" || { echo "cleanup: failures above"; exit 1; }
