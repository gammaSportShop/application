@echo off
setlocal
powershell -ExecutionPolicy Bypass -File "%~dp0\docker-reset-reseed.ps1"
endlocal

