#!/usr/bin/env bash
# cleanup.sh: finds, and on --apply removes, what one front left on the
# machine. A route ends only when `--check` comes back empty: the full route
# at its close, the short route and the hotfix after their tag.
#
#   cleanup.sh <slug> [--check | --apply] [--repo <dir>]... [--ws <dir>]
#              [--discard <branch>]... [--keep <branch>]...
#
#   --check     (default) list what is left; exit 1 when anything is
#   --apply     remove it; then run --check again
#   --repo      a git repo the front touched (repeatable); default: the
#               current repo, or every repo one level below the current dir
#   --ws        the front's folder (default ./designs/<slug> when it exists)
#   --discard   unmerged work the user discarded: removed like merged work
#   --keep      unmerged work the user kept for later: listed, never counted
#
# What it looks for, by name (so slugs must be unique; date-prefixed slugs are):
#   worktrees    whose path or branch carries the slug
#   branches     feat/<slug>, story/<slug>/*, evidence/<slug>/*, fix/<slug>/*,
#                hotfix/<slug>[/*], revert/<slug>; local and on origin
#   docker       `make sweep front=<slug>` when the repo has it; otherwise the
#                containers, volumes, networks and images named <slug>-* or
#                <slug>_* (compose projects included)
#   scratch      _run/, _scratch/ and .remotion/ under the front's folder
#
# It never removes unmerged work by itself: a branch not in origin's default
# branch, or a worktree with uncommitted changes, is listed as "unmerged"
# (and counts) until the session passes --discard or --keep for it, from
# what the user ruled. Remote branches other than story/* and evidence/* are
# the user's (the ruleset deletes merged ones): listed as "his", never pushed
# away, and never counted, since no agent can remove them.
set -uo pipefail

usage() { sed -n '6,15p' "$0" | sed 's/^# \{0,1\}//' >&2; exit 2; }
slug='' mode=check repos=() ws='' discard=() keep=()
while [ $# -gt 0 ]; do
  case "$1" in
    --check) mode=check ;;
    --apply) mode=apply ;;
    --repo) repos+=("${2:?}"); shift ;;
    --ws) ws=${2:?}; shift ;;
    --discard) discard+=("${2:?}"); shift ;;
    --keep) keep+=("${2:?}"); shift ;;
    -h|--help) usage ;;
    -*) usage ;;
    *) [ -z "$slug" ] && slug=$1 || usage ;;
  esac
  shift
done
[ -n "$slug" ] || usage
[[ $slug =~ ^[A-Za-z0-9._-]{6,}$ ]] || { echo "cleanup: refusing a slug this short or this odd: $slug" >&2; exit 2; }

if [ ${#repos[@]} -eq 0 ]; then
  if git rev-parse --show-toplevel >/dev/null 2>&1; then repos=("$(git rev-parse --show-toplevel)")
  else for d in */; do [ -e "$d.git" ] && repos+=("$PWD/${d%/}"); done; fi
fi
[ -z "$ws" ] && [ -d "designs/$slug" ] && ws=$PWD/designs/$slug

left=0 failed=0
say() { printf '%-9s %-10s %s\n' "$1" "$2" "$3"; }
found() { # kind, name, how to remove (a command string run on --apply)
  if [ "$mode" = apply ]; then
    if bash -c "$3" >/dev/null 2>&1; then say removed "$1" "$2"; else say FAILED "$1" "$2"; failed=1; fi
  else say left "$1" "$2"; left=1; fi
}
in_list() { local x=$1; shift; for y in "$@"; do [ "$x" = "$y" ] && return 0; done; return 1; }
ours() { # a branch name of this front
  case "$1" in
    "feat/$slug"|"hotfix/$slug"|"revert/$slug"|"story/$slug/"?*|"evidence/$slug/"?*|"fix/$slug/"?*|"hotfix/$slug/"?*) return 0 ;;
  esac
  return 1
}
# unmerged work: listed and counted, unless the user ruled on it
unmerged() { # kind, name, why, [the branch the user ruled on]
  if in_list "${4:-$2}" ${keep[@]+"${keep[@]}"}; then say kept "$1" "$2 ($3; kept for later)"; return; fi
  say unmerged "$1" "$2 ($3; pass --discard or --keep)"; left=1
}
q() { printf '%q' "$1"; }

for r in ${repos[@]+"${repos[@]}"}; do
  git -C "$r" rev-parse --git-dir >/dev/null 2>&1 || { say skipped repo "$r (not a git repo)"; continue; }
  base=$(git -C "$r" symbolic-ref -q --short refs/remotes/origin/HEAD 2>/dev/null || echo origin/main)
  merged() { git -C "$r" merge-base --is-ancestor "$1" "$base" 2>/dev/null; }

  # worktrees (the first one listed is the repo itself)
  first=1 wt='' br=''
  while IFS= read -r line; do
    case "$line" in
      'worktree '*) wt=${line#worktree }; br='' ;;
      'branch '*) br=${line#branch refs/heads/} ;;
      '')
        if [ -z "$wt" ]; then :
        elif [ "$first" = 1 ]; then first=0
        elif [[ $wt == *"$slug"* ]] || { [ -n "$br" ] && ours "$br"; }; then
          case "$PWD/" in "$wt"/*) say kept worktree "$wt (the session is inside it)" ;;
            *)
              dirty=$(git -C "$wt" status --porcelain 2>/dev/null | head -n 1)
              if in_list "$br" ${discard[@]+"${discard[@]}"}; then found worktree "$wt" "git -C $(q "$r") worktree remove --force $(q "$wt")"
              elif [ -n "$dirty" ]; then unmerged worktree "$wt" "uncommitted changes" "$br"
              elif [ -n "$br" ] && ! merged "$br"; then unmerged worktree "$wt" "$br is not in $base" "$br"
              else found worktree "$wt" "git -C $(q "$r") worktree remove $(q "$wt")"; fi ;;
          esac
        fi
        wt='' ;;
    esac
  done < <(git -C "$r" worktree list --porcelain; echo)
  git -C "$r" worktree prune 2>/dev/null

  # local branches
  while IFS= read -r b; do
    ours "$b" || continue
    if in_list "$b" ${discard[@]+"${discard[@]}"} || merged "$b"; then found branch "$b" "git -C $(q "$r") branch -D $(q "$b")"
    else unmerged branch "$b" "not in $base"; fi
  done < <(git -C "$r" for-each-ref --format='%(refname:short)' refs/heads)

  # remote branches
  while read -r sha ref; do
    b=${ref#refs/heads/}
    ours "$b" || continue
    case "$b" in
      evidence/*) found remote "origin/$b" "git -C $(q "$r") push origin --delete $(q "$b")" ;;
      story/*)
        if in_list "$b" ${discard[@]+"${discard[@]}"} || merged "$sha"; then found remote "origin/$b" "git -C $(q "$r") push origin --delete $(q "$b")"
        else unmerged remote "origin/$b" "not in $base, or not fetched"; fi ;;
      *) say his remote "origin/$b (only the user or the ruleset deletes it; name it in the message)" ;;
    esac
  done < <(git -C "$r" ls-remote --heads origin 2>/dev/null)

  # docker, through the project's own sweep when it has one
  if make -C "$r" -n sweep front="$slug" check=1 >/dev/null 2>&1; then
    if [ "$mode" = apply ]; then
      make -C "$r" sweep front="$slug" >/dev/null 2>&1 && say removed docker "make sweep front=$slug ($r)" || { say FAILED docker "make sweep front=$slug ($r)"; failed=1; }
    else
      make -C "$r" sweep front="$slug" check=1 >/dev/null 2>&1 || { say left docker "make sweep front=$slug check=1 ($r) found leftovers"; left=1; }
    fi
    swept=1
  fi
done

# docker, by name, when no project sweep covered it
if [ -z "${swept:-}" ] && command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
  pat="^$slug[-_]"
  while IFS=$'\t' read -r name proj; do
    [[ $name =~ $pat || $proj == "$slug" || $proj =~ $pat ]] && found container "$name" "docker rm -f $(q "$name")"
  done < <(docker ps -a --format '{{.Names}}\t{{.Label "com.docker.compose.project"}}')
  while IFS= read -r v; do [[ $v =~ $pat ]] && found volume "$v" "docker volume rm $(q "$v")"; done < <(docker volume ls --format '{{.Name}}')
  while IFS= read -r n; do [[ $n =~ $pat ]] && found network "$n" "docker network rm $(q "$n")"; done < <(docker network ls --format '{{.Name}}')
  while read -r img id; do [[ $img =~ $pat ]] && found image "$img" "docker rmi -f $(q "$id")"; done < <(docker images --format '{{.Repository}}:{{.Tag}} {{.ID}}')
fi

# scratch under the front's folder
if [ -n "$ws" ] && [ -d "$ws" ]; then
  while IFS= read -r d; do found scratch "$d" "rm -rf $(q "$d")"; done < <(find "$ws" -type d \( -name _run -o -name _scratch -o -name .remotion \) -prune -print 2>/dev/null)
fi

if [ "$mode" = apply ]; then
  [ "$failed" = 0 ] && echo "cleanup: applied; run --check to prove it" && exit 0
  echo "cleanup: some removals failed (above)"; exit 1
fi
[ "$left" = 0 ] && echo "cleanup: nothing of $slug is left" && exit 0
echo "cleanup: $slug still has the items above"; exit 1
