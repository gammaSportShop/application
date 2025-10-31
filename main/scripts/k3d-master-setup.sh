#!/usr/bin/env bash
set -e
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
K8S_DIR="$SCRIPT_DIR/../k8s"

k3d cluster create shop --api-port 6445 -p "80:80@loadbalancer"
kubectl config use-context k3d-shop

if [ -f "$K8S_DIR/app.env" ]; then
  kubectl create secret generic app-secrets --from-env-file="$K8S_DIR/app.env" -o yaml --dry-run=client | kubectl apply -f -
fi

kubectl apply -f "$K8S_DIR/"

kubectl set image deployment/api api=ghcr.io/gammasportshop/sportshop-api:latest
kubectl set image deployment/web web=ghcr.io/gammasportshop/sportshop-web:latest

kubectl get pods -A
