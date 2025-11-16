## Обзор проекта

GammaSport Shop — это демонстрационное приложение интернет‑магазина спортивной одежды и экипировки. Проект состоит из:
- **Frontend**: одностраничное приложение на React + Vite, Tailwind CSS и кастомной UI‑системе.
- **Backend**: API на Fastify + TypeScript с Prisma и MariaDB.
- **Инфраструктура**: Docker/Docker Compose для локального запуска, NGINX в качестве edge‑proxy, манифесты Kubernetes и Flux для GitOps‑деплоя.

Репозиторий рассчитан на локальную разработку (Windows и Unix), запуск через Docker Compose и деплой в кластер Kubernetes.

## Структура репозитория

Важные директории и файлы:

- `main/backend` — серверная часть
  - `src/server.ts` — точка входа Fastify‑приложения (`/api/*` роуты).
  - `src/routes/` — модульные роуты:
    - `auth.ts` — регистрация, логин, JWT‑аутентификация.
    - `catalog.ts` — каталог товаров, коллекции, метаданные.
    - `cart.ts` — корзина, работа с Redis.
    - `orders.ts` — создание и отслеживание заказов.
    - `metrics.ts` — метрики, интеграция с worker.
  - `src/lib/` — вспомогательные модули:
    - `prisma.ts` — инициализация Prisma Client.
    - `redis.ts` — подключение к Redis.
    - `catalogMeta.ts`, `tags.ts`, `notify.ts` — бизнес‑логика и метаданные каталога.
  - `src/metricsWorker.ts` — воркер для фоновой обработки метрик.
  - `src/seed.ts` — скрипт наполнения демо‑данными (используется через `SEED_DEMO=true`).
  - `prisma/schema.prisma` — схема БД (Users, Products, Orders, Reviews и др.).
  - `package.json` — скрипты сборки/запуска backend.

- `main/frontend` — клиентское SPA
  - `src/main.tsx` — точка входа React + React Router.
  - `src/App.tsx` — общий layout, Navbar/Footer, контейнеры.
  - `src/pages/` — страницы:
    - `Home.tsx` — главная, подборки и распродажа.
    - `Catalog.tsx` — каталог с фильтрами/гридом товаров.
    - `Product.tsx` — детальная страница товара, отзывы.
    - `Cart.tsx`, `Checkout.tsx` — корзина и оформление заказа.
    - `Order.tsx` — трекинг заказа с шагами доставки и телепортацией.
    - `Profile.tsx` — логин/регистрация.
    - `Account.tsx` + `Notifications.tsx`, `Settings.tsx` — кабинет пользователя.
    - `ApiTest.tsx` — тестовые вызовы API.
  - `src/components/` — UI‑компоненты (Navbar, ProductCard, BentoGrid и др.).
  - `src/lib/` — клиентские утилиты:
    - `api.ts` — HTTP‑обёртка над `/api`.
    - `CartContext.tsx` + `cart.ts` — состояние корзины.
    - `wishlist.ts` — локальный список желаний.
    - `meta.tsx`, `tags.tsx` — метаданные и отображение тегов/чипов.
  - `src/style.css` — глобальные стили, темы и утилиты поверх Tailwind.
  - `tailwind.config.js` — конфигурация Tailwind 4, цветовая тема через CSS‑переменные.

- `main/compose/docker-compose.yaml` — локальный запуск через Docker Compose (db, redis, api, metrics worker, web).
- `main/docker/api.Dockerfile` — multi‑stage сборка backend образа.
- `main/docker/web.Dockerfile` — сборка frontend и nginx‑образа.
- `main/nginx/default.conf` — конфиг NGINX: статический SPA + проксирование `/api/` на backend.
- `main/k8s/` — манифесты Kubernetes (Deployments, Services, Ingress, Secrets, Flux).
- `main/scripts/` — вспомогательные скрипты (k3d, Flux, Docker reset).
- `main/dev.bat` — удобный dev‑скрипт для Windows (поднимает локальные MariaDB/Redis и стартует фронт/бек).
- `README.md` — текущий файл с общим обзором и инструкциями.

## Стек технологий

- **Frontend**
  - React 19, React Router 7.
  - Vite 7 (dev‑сервер, сборка).
  - TypeScript.
  - Tailwind CSS 4 + кастомный дизайн‑слой (классы `btn`, `card-panel`, `glass-surface` и т.д.).
  - `lucide-react` для иконок.

- **Backend**
  - Fastify 5 + TypeScript.
  - Prisma ORM (MySQL/MariaDB).
  - MariaDB 11 как основная БД.
  - Redis 7 для кеша, rate limiting и корзины.
  - JWT для аутентификации.

- **Инфраструктура**
  - Docker / Docker Compose.
  - NGINX как edge/proxy в `web`‑образе.
  - Kubernetes (Deployments, StatefulSet, PVC, Ingress).
  - FluxCD (`main/k8s/flux-system`) для GitOps‑синхронизации манифестов.

## Быстрый старт (Setup)

### Вариант 1: простой локальный запуск (без CI/CD)

Если нужно просто поднять приложение локально с минимальными действиями:

1. Установить Docker Desktop или Docker Engine.
2. В каталоге `main` выполнить:

```bash
docker compose -f compose/docker-compose.yaml up -d --build
```

После сборки:
- Приложение будет доступно на `http://localhost`.
- NGINX внутри контейнера `web` будет обслуживать SPA и проксировать запросы к `/api/` в сервис `api`.

Подробнее см. раздел «Локальный запуск через Docker Compose».

### Вариант 2: локальный кластер уровня прод с GitOps (k3d + Flux)

Этот вариант разворачивает локальный кластер Kubernetes с k3d, применяет манифесты из `main/k8s` и (опционально) настраивает GitOps через FluxCD.

1. Установить:
   - Docker.
   - `k3d`.
   - `kubectl`.
   - `flux` CLI.
2. Создать в GitHub персональный токен доступа (PAT) с правами на репозиторий и экспортировать его в переменную окружения `GITHUB_TOKEN`.
3. В каталоге `main` запустить:
   - На Windows:

```bat
scripts\k3d-setup-all.bat
```

   - На Linux/macOS:

```bash
chmod +x scripts/k3d-setup-all.sh
scripts/k3d-setup-all.sh
```

Скрипт:
- Создаёт кластер `k3d` с пробросом порта 80.
- Применяет манифесты из `main/k8s` и обновляет образы `api`, `web` и `metrics-worker` до `:latest`.
- Если установлен `flux` и задан `GITHUB_TOKEN`, запускает `flux-bootstrap` (через `scripts/flux-bootstrap.ps1`/`flux-bootstrap.sh`) для подключения к GitHub‑репозиторию и включения GitOps.

После завершения:
- Все сервисы будут подняты в локальном k3d‑кластере.
- Приложение будет доступно по `http://localhost` через Ingress/LoadBalancer.

## Функциональность приложения

- Просмотр каталога товаров, фильтрация по категориям/коллекциям.
- Страница товара с фото, описанием, тегами, рейтингом и отзывами.
- Корзина с возможностью изменять количество, отображение сумм.
- Оформление заказа и трекинг статуса с несколькими шагами.
- Экспериментальная функция телепортации заказа (моментальная доставка в UI).
- Регистрация, вход, личный кабинет, настройки и уведомления.
- Система уведомлений (toasts) через `NotificationProvider`.

## Локальная разработка (Windows)

Самый быстрый способ запустить всё под Windows — использовать `dev.bat` в каталоге `main`:

1. Установить:
   - Docker Desktop (опционально, но желательно).
   - Node.js 20 LTS.
2. В консоли PowerShell или CMD:
   - Перейти в каталог `main`.
   - Запустить:

```bat
dev.bat
```

Скрипт:
- Проверяет наличие Docker и при необходимости поднимает локальные контейнеры `shop_db` (MariaDB) и `shop_redis` (Redis) с пробросом портов 3306 и 6379.
- Ждёт доступности Redis и БД по TCP.
- Запускает два окна:
  - backend: `npm install` + `npm run dev` в `backend`, с `DATABASE_URL`, `REDIS_URL` и `JWT_SECRET=devsecret`.
  - frontend: `npm install` + `npm run dev` в `frontend`.

После запуска:
- Frontend будет на `http://localhost:5173` (порт Vite по умолчанию).
- Backend слушает `http://localhost:3000/api/*`.
- Маршруты фронта обращаются к API через `/api`, и в dev‑режиме это одинаковый origin (через Vite proxy или прямые запросы, в зависимости от конфигурации).

### Ручной запуск без dev.bat

Если Docker не установлен или вы хотите запускать всё вручную:

1. Запустить MariaDB и Redis любым удобным способом (локально или через Docker; URL по умолчанию `mysql://shop:shop@localhost:3306/sportshop` и `redis://localhost:6379`).
2. Backend:
   - `cd main/backend`
   - `npm install`
   - Установить переменные окружения:
     - `DATABASE_URL=mysql://shop:shop@localhost:3306/sportshop`
     - `REDIS_URL=redis://localhost:6379`
     - `JWT_SECRET=devsecret` (или свой).
     - Опционально `SEED_DEMO=true` для авто‑наполнения демо‑данными.
   - Запуск разработки:

```bash
npm run dev
```

3. Frontend:
   - `cd main/frontend`
   - `npm install`
   - Запуск dev‑сервера:

```bash
npm run dev
```

## Локальный запуск через Docker Compose

Для приближённого к прод окружения:

1. Убедитесь, что Docker установлен и запущен.
2. Из каталога `main`:

```bash
docker compose -f compose/docker-compose.yaml up -d --build
```

Это поднимет:
- `db` (MariaDB 11) с volume `db_data`.
- `redis` (Redis 7).
- `api` (backend, собранный через `docker/api.Dockerfile`).
- `metrics` (metrics worker, тот же образ, но с командой `node dist/metricsWorker.js`).
- `web` (frontend + NGINX, `docker/web.Dockerfile`).

После старта:
- Web‑интерфейс доступен на `http://localhost` (порт 80).
- Запросы к `/api/` проксируются NGINX к сервису `api:3000`.

Полезные команды:

```bash
docker compose -f compose/docker-compose.yaml ps
docker compose -f compose/docker-compose.yaml logs -f api
docker compose -f compose/docker-compose.yaml logs -f web
docker compose -f compose/docker-compose.yaml down
```

## Backend: сборка и запуск в контейнере

Multi‑stage Dockerfile `main/docker/api.Dockerfile`:
- `deps` слой:
  - Копирует `backend/package*.json` и `backend/prisma`.
  - Выполняет `npm ci` и `npx prisma generate`.
- `build` слой:
  - Копирует весь `backend/`.
  - Повторно генерирует Prisma client.
  - Выполняет `npm run build` (TypeScript → JS).
- `runner` слой:
  - Копирует `node_modules`, `dist` и `prisma`.
  - При старте выполняет `npx prisma generate` и `npx prisma db push`, затем `node dist/server.js`.

Ожидаемые переменные окружения внутри контейнера:
- `DATABASE_URL`
- `REDIS_URL`
- `JWT_SECRET`
- `SEED_DEMO` (опционально).

## Frontend: сборка и статическая выдача

Dockerfile `main/docker/web.Dockerfile`:
- `build` слой:
  - Копирует `frontend/package*.json`, ставит зависимости.
  - Копирует весь `frontend/` и выполняет `npm run build` (`tsc && vite build`).
- `runner` слой:
  - Использует `nginx:1.27-alpine`.
  - Копирует `dist` в `/usr/share/nginx/html`.
  - Подключает `nginx/default.conf`.

`nginx/default.conf`:
- Все запросы к `/api/` проксируются на `http://api:3000`.
- Остальные пути (`/`) обслуживаются как SPA c `try_files $uri /index.html`.

## Kubernetes‑деплой

Каталог `main/k8s` содержит минимальный набор манифестов:

- `db.yaml`:
  - `PersistentVolumeClaim` для MariaDB (5Gi).
  - `StatefulSet` `db` с образом `mariadb:11`.
  - `Service db` на порту 3306.

- `redis.yaml`:
  - Deployment и Service для Redis 7.

- `api.yaml`:
  - Deployment `api` с образом `ghcr.io/gammasportshop/sportshop-api:v0.0.15`.
  - Init‑container `wait-for-db` (busybox), который ждёт доступности `db:3306`.
  - Service `api` (порт 3000).
  - Переменные окружения берутся из `Secret app-secrets` + `PORT=3000`.

- `metrics-worker.yaml`:
  - Deployment `metrics-worker` с тем же образом API.
  - Команда `node dist/metricsWorker.js`.
  - `envFrom` из `app-secrets`.

- `web.yaml`:
  - Deployment `web` с образом `ghcr.io/gammasportshop/sportshop-web:v0.0.15`.
  - Service `web` на порту 80.
  - Ingress `sportshop` (класс `traefik`):
    - `/` → Service `web:80`.
    - `/api` → Service `api:3000`.

- `secrets.yaml` и `app.env`:
  - Шаблон для секретов (JWT, DB credentials, и т.п.).

- `k8s/kustomization.yaml`:
  - Описывает, какие ресурсы входят в сборку манифестов.

- `k8s/flux-system/*`:
  - Конфигурация FluxCD (GitOps‑подход, автосинхронизация манифестов из репозитория).

Базовый сценарий деплоя в кластер:

```bash
kubectl apply -f k8s/
kubectl get pods
kubectl get svc
kubectl get ingress
```

## Аутентификация и безопасность

- Аутентификация реализована через JWT:
  - После успешного логина/регистрации backend выдаёт токен.
  - Токен сохраняется в `localStorage` на фронтенде и используется для защищённых запросов.
- В прод окружении секреты (JWT, доступы к БД) должны передаваться через:
  - `docker-compose` env‑переменные или `.env` с осторожностью.
  - K8s Secrets (`app-secrets`).

## Метрики и worker

- Модуль `metricsWorker.ts` в backend отвечает за асинхронную обработку событий (метрики заказов и т.п.).
- В Docker Compose:
  - Сервис `metrics` запускает тот же backend‑образ с командой `node dist/metricsWorker.js`.
- В Kubernetes:
  - Deployment `metrics-worker` делает то же самое.

## Как вносить изменения

- **Изменение схемы БД**:
  - Обновить `prisma/schema.prisma`.
  - Локально выполнить `npx prisma generate` и `npx prisma db push` (или `prisma migrate` для прод‑сценария).
  - Пересобрать backend‑образ.

- **Изменение API**:
  - Правки в `backend/src/routes/*` и `backend/src/lib/*`.
  - Обновить типы/контракты на фронтенде в `frontend/src/lib/api.ts` и соответствующих страницах.

- **Изменение фронта**:
  - Работать внутри `frontend/src`.
  - Поддерживать консистентность UI с преднастроенными классами (`btn`, `btn-primary`, `card-panel`, `glass-surface`).

## Известные ограничения и TODO

- Схема БД и API ориентированы на демо‑кейсы интернет‑магазина, а не на полноценный e‑commerce.
- Авторизация хранит токен в `localStorage`, без refresh‑токенов и ротейшена.
- Кластерная конфигурация ориентирована на учебный/демо‑кластер (один реплика сет, Traefik Ingress, простые Secrets).