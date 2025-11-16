#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
K8S_DIR="$SCRIPT_DIR/../k8s"

k3d cluster create shop --api-port 6445 -p "80:80@loadbalancer" || true
kubectl config use-context k3d-shop
kubectl config set-cluster k3d-shop --server https://127.0.0.1:6445

k3d node create agent --cluster shop || true

if [ -f "$K8S_DIR/app.env" ]; then
  kubectl create secret generic app-secrets --from-env-file="$K8S_DIR/app.env" -o yaml --dry-run=client | kubectl apply -f -
fi

kubectl apply -f "$K8S_DIR"

kubectl set image deployment/api api=ghcr.io/gammasportshop/sportshop-api:latest
kubectl set image deployment/web web=ghcr.io/gammasportshop/sportshop-web:latest
kubectl set image deployment/metrics-worker metrics-worker=ghcr.io/gammasportshop/sportshop-api:latest

kubectl rollout status deployment/api
kubectl rollout status deployment/web
kubectl rollout status deployment/metrics-worker

kubectl get pods -A

echo Open http://localhost

if command -v flux >/dev/null 2>&1 && [ -n "${GITHUB_TOKEN:-}" ]; then
  "$SCRIPT_DIR/flux-bootstrap.sh"
else
  echo "Skipping Flux bootstrap: flux not found or GITHUB_TOKEN not set"
fi
