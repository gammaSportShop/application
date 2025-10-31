$ErrorActionPreference = "Stop"
$compose = Resolve-Path (Join-Path $PSScriptRoot "..\compose\docker-compose.yaml")
try { docker compose -f "$compose" down -v --remove-orphans } catch {}
$cids = $(docker ps -aq)
if ($cids) { docker stop $cids | Out-Null; docker rm -f $cids | Out-Null }
$iids = $(docker images -aq)
if ($iids) { docker rmi -f $iids | Out-Null }
docker system prune -af --volumes | Out-Null
docker builder prune -af | Out-Null

