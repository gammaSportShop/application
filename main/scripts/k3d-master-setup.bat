@echo off
setlocal enabledelayedexpansion
set "K8S_DIR=%~dp0..\k8s"
k3d cluster create shop --api-port 6445 -p "80:80@loadbalancer"
kubectl config use-context k3d-shop
if exist "%K8S_DIR%\app.env" (
  kubectl create secret generic app-secrets --from-env-file="%K8S_DIR%\app.env" -o yaml --dry-run=client | kubectl apply -f -
)
kubectl apply -f "%K8S_DIR%"
kubectl set image deployment/api api=ghcr.io/gammasportshop/sportshop-api:latest
kubectl set image deployment/web web=ghcr.io/gammasportshop/sportshop-web:latest
kubectl get pods -A
endlocal
pause
