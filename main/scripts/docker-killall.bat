@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0\docker-killall.ps1"
endlocal

