@echo off
setlocal enabledelayedexpansion
if "%~1"=="" (
  echo Usage: %~n0 NODE_NAME
  echo.
  echo Example: %~n0 k3d-shop-agent-0
  echo.
  echo Existing k3d nodes:
  k3d node list
  goto :eof
)
k3d node delete "%~1"
kubectl get nodes
endlocal
pause
