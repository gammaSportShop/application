@echo off
setlocal enabledelayedexpansion
k3d node create agent --cluster shop
kubectl get nodes
endlocal
pause
