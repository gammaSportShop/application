#!/usr/bin/env bash
set -e
if [ -z "$1" ]; then
  echo "Usage: $(basename "$0") NODE_NAME"
  echo
  echo "Example: $(basename "$0") k3d-shop-agent-0"
  echo
  echo "Existing k3d nodes:"
  k3d node list
  exit 1
fi
k3d node delete "$1"
kubectl get nodes
