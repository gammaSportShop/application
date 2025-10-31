$ErrorActionPreference = "Stop"
$compose = Resolve-Path (Join-Path $PSScriptRoot "..\compose\docker-compose.yaml")
docker compose -f "$compose" down -v --remove-orphans
docker compose -f "$compose" build --no-cache
docker compose -f "$compose" up -d
docker compose -f "$compose" exec -T redis redis-cli FLUSHALL

