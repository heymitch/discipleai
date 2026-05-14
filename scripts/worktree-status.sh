#!/usr/bin/env bash
# Usage: ./scripts/worktree-status.sh
#
# Prints a status table for every git worktree under .claude/worktrees/:
#   - which branch it's on
#   - which files differ from main (parent dir)
#   - which files exist only in that worktree
#   - whether the branch is ahead/behind origin
#
# Run from the parent directory.

set -e
cd "$(dirname "$0")/.."
PARENT="$(pwd)"

if [ ! -d "$PARENT/.claude/worktrees" ]; then
  echo "No worktrees found under .claude/worktrees/"
  exit 0
fi

printf "\n\033[1mWorktree inventory — parent: %s\033[0m\n" "$PARENT"
printf "Main branch HEAD: %s\n\n" "$(git rev-parse --short main)"

for wt in "$PARENT"/.claude/worktrees/*/; do
  name=$(basename "$wt")
  printf "\033[1;34m── %s ──\033[0m\n" "$name"

  # Branch and commit
  branch=$(cd "$wt" && git branch --show-current 2>/dev/null || echo "?")
  head=$(cd "$wt" && git rev-parse --short HEAD 2>/dev/null || echo "?")
  printf "  Branch:  %s @ %s\n" "$branch" "$head"

  # Ahead/behind origin
  if cd "$wt" && git rev-parse --abbrev-ref "@{u}" >/dev/null 2>&1; then
    ahead=$(git rev-list --count "@{u}"..HEAD)
    behind=$(git rev-list --count HEAD.."@{u}")
    printf "  Remote:  %d ahead, %d behind origin\n" "$ahead" "$behind"
    cd "$PARENT"
  else
    printf "  Remote:  (no upstream)\n"
  fi

  # Files unique to worktree (excluding noise)
  uniq=$(diff -rq "$wt" "$PARENT" 2>/dev/null \
    | grep "^Only in $wt" \
    | grep -vE '\.git|node_modules|\.claude|\.vercel|design.tar|disciple-ai-design-system' \
    | sed "s|Only in $wt:|  unique:|" \
    | head -15)
  [ -n "$uniq" ] && echo "$uniq"

  # Files that differ
  diffs=$(diff -rq "$wt" "$PARENT" 2>/dev/null \
    | grep "^Files " \
    | grep -vE 'node_modules|\.git|\.claude' \
    | sed -E "s|Files $wt(.*) and .* differ|  modified:\\1|" \
    | head -10)
  [ -n "$diffs" ] && echo "$diffs"

  # If nothing unique or modified
  if [ -z "$uniq" ] && [ -z "$diffs" ]; then
    printf "  \033[32m✓ no differences from parent\033[0m\n"
  fi

  printf "\n"
done

printf "\033[1;33mTip:\033[0m to promote a worktree's work to production:\n"
printf "  1. cd %s/.claude/worktrees/<name>\n" "$PARENT"
printf "  2. git push -u origin <branch>\n"
printf "  3. gh pr create --base main --head <branch>\n"
printf "  4. gh pr merge --merge --delete-branch\n\n"
