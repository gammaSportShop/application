#!/usr/bin/env bash
set -euo pipefail

OWNER="${1:-}"
REPOSITORY="${2:-}"
BRANCH="${3:-main}"
K8S_PATH="${4:-main/k8s}"
PERSONAL="${5:-}"

if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "GITHUB_TOKEN is not set" >&2
  exit 1
fi

if [ -z "$OWNER" ] || [ -z "$REPOSITORY" ]; then
  remote="$(git remote get-url origin 2>/dev/null || true)"
  if [ -z "$remote" ]; then
    echo "Cannot determine git remote origin. Provide OWNER and REPOSITORY." >&2
    exit 1
  fi
  cleaned="$(printf "%s" "$remote" | sed -E 's#(git@github.com:|https://github.com/)##; s#\.git$##')"
  OWNER="${OWNER:-$(printf "%s" "$cleaned" | cut -d/ -f1)}"
  REPOSITORY="${REPOSITORY:-$(printf "%s" "$cleaned" | cut -d/ -f2)}"
fi

args=(bootstrap github --owner "$OWNER" --repository "$REPOSITORY" --branch "$BRANCH" --path "$K8S_PATH" --token-auth)
if [ -n "$PERSONAL" ]; then args+=(--personal); fi

flux "${args[@]}"


