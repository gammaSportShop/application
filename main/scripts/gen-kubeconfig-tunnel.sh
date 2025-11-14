#!/usr/bin/env bash
set -e
server="$1"
if [ -z "$server" ]; then echo "Usage: gen-kubeconfig-tunnel.sh https://your-tunnel-host[:port]"; exit 1; fi
cp "$HOME/.kube/config" kubeconfig.ci
export KUBECONFIG="$(pwd)/kubeconfig.ci"
kubectl config use-context k3d-shop >/dev/null 2>&1 || true
kubectl config set-cluster k3d-shop --server "$server" --insecure-skip-tls-verify=true >/dev/null 2>&1
base64 -w0 kubeconfig.ci | tee kubeconfig.ci.b64
