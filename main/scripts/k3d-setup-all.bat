@echo off
setlocal enabledelayedexpansion
set "K8S_DIR=%~dp0..\k8s"

k3d cluster create shop --api-port 6445 -p "80:80@loadbalancer"
kubectl config use-context k3d-shop
kubectl config set-cluster k3d-shop --server=https://127.0.0.1:6445

k3d node create agent --cluster shop

if exist "%K8S_DIR%\app.env" (
  kubectl create secret generic app-secrets --from-env-file="%K8S_DIR%\app.env" -o yaml --dry-run=client | kubectl apply -f -
)

kubectl apply -k "%K8S_DIR%"

kubectl set image deployment/api api=ghcr.io/gammasportshop/sportshop-api:latest
kubectl set image deployment/web web=ghcr.io/gammasportshop/sportshop-web:latest
kubectl set image deployment/metrics-worker metrics-worker=ghcr.io/gammasportshop/sportshop-api:latest

kubectl rollout status deployment/api
kubectl rollout status deployment/web
kubectl rollout status deployment/metrics-worker

kubectl get pods -A

echo Open http://localhost

where flux >nul 2>&1
if %errorlevel%==0 (
  if defined GITHUB_TOKEN (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0flux-bootstrap.ps1"
  ) else (
    echo Skipping Flux bootstrap: GITHUB_TOKEN not set
  )
) else (
  echo Skipping Flux bootstrap: flux CLI not found
)
endlocal
pause
