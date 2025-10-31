@echo off
setlocal
set ROOT=%~dp0
where docker >nul 2>&1 && set HAS_DOCKER=1
pushd "%ROOT%"

if defined HAS_DOCKER (
  for /f "tokens=*" %%A in ('docker ps -a --format "{{.Names}}" ^| findstr /I ^shop_db$') do set DB_FOUND=1
  if not defined DB_FOUND (
    docker run -d --name shop_db -e MARIADB_ROOT_PASSWORD=root -e MARIADB_DATABASE=sportshop -e MARIADB_USER=shop -e MARIADB_PASSWORD=shop -p 3306:3306 -v shop_db_data:/var/lib/mysql mariadb:11
  ) else (
    docker start shop_db >nul
  )

  set DB_FOUND=
  for /f "tokens=*" %%A in ('docker ps -a --format "{{.Names}}" ^| findstr /I ^shop_redis$') do set REDIS_FOUND=1
  if not defined REDIS_FOUND (
    docker run -d --name shop_redis -p 6379:6379 redis:7-alpine
  ) else (
    docker start shop_redis >nul
  )
) else (
  echo Docker not found. Skipping container startup. Ensure MariaDB on 3306 and Redis on 6379 are running.
)

set tries=0
:wait_redis
powershell -Command "$s=New-Object Net.Sockets.TcpClient; try{$s.Connect('127.0.0.1',6379)}catch{}; if($s.Connected){$s.Close(); exit 0}else{Start-Sleep -Milliseconds 500; exit 1}"
if %errorlevel%==0 goto redis_ready
set /a tries=%tries%+1
if %tries% GEQ 60 goto redis_ready
goto wait_redis
:redis_ready

set tries=0
:wait_db
powershell -Command "$s=New-Object Net.Sockets.TcpClient; try{$s.Connect('127.0.0.1',3306)}catch{}; if($s.Connected){$s.Close(); exit 0}else{Start-Sleep -Milliseconds 500; exit 1}"
if %errorlevel%==0 goto db_ready
set /a tries=%tries%+1
if %tries% GEQ 60 goto db_ready
goto wait_db
:db_ready

start "backend" /D "%ROOT%backend" cmd /k "set DATABASE_URL=mysql://shop:shop@localhost:3306/sportshop & set REDIS_URL=redis://localhost:6379 & set JWT_SECRET=devsecret & npm install & npm run dev"
start "frontend" /D "%ROOT%frontend" cmd /k "npm install & npm run dev"

popd
endlocal

