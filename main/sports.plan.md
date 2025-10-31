<!-- eb48cf7c-3fe8-4c0c-bd8f-5d78552ef070 6dfcdadb-ac30-44bd-a0b6-54793ac0d06a -->
# План: интернет‑магазин на Fastify + React, Prisma, MariaDB, Redis

## Технологии

- Backend: Fastify + TypeScript
- ORM: Prisma (миграции, генерация типов)
- База: MariaDB
- Кэш/сессии/ratelimit: Redis (без очередей задач)
- Frontend: React + Vite + Tailwind CSS + DaisyUI (SPA)
- Прокси: NGINX (раздача SPA, прокси на /api)
- Контейнеризация: Docker, docker-compose, Docker Swarm, Kubernetes
- CI/CD: GitHub Actions + GHCR

## Соответствие целям курсового

1. Анализ контейнерной платформы — docs/analysis.md
2. Обоснование выбора технологий — docs/tech-choice.md
3. ≥5 контейнеров — api, web, nginx, db, redis (+ опц. adminer)
4. Кластерная архитектура — swarm/stack.yaml, k8s/*
5. CI/CD — .github/workflows/ci-cd.yml
6. Деплой инфраструктуры — docs/deploy.md
7. Межконтейнерные сети — Compose сети, Swarm overlay, K8s Services/Ingress
8. Презентация — docs/presentation-outline.md + diagrams

## Архитектура

- NGINX → web (SPA) и /api → api → MariaDB, Redis
- Сети: frontend (nginx↔web), backend (nginx↔api↔db/redis)

## Структура репозитория

- backend/
- src/ (routes, services, middlewares, prisma client)
- prisma/schema.prisma
- package.json, tsconfig.json
- frontend/
- src/, index.html, tailwind.config.js, postcss.config.js, package.json
- nginx/
- default.conf
- docker/
- api.Dockerfile, web.Dockerfile, nginx.Dockerfile
- compose/
- docker-compose.yaml, .env.example
- swarm/
- stack.yaml, secrets/, configs/
- k8s/
- db.yaml, redis.yaml, api.yaml, web.yaml, nginx.yaml, ingress.yaml, config.yaml, secrets.yaml
- docs/
- analysis.md, tech-choice.md, deploy.md, networking.md, presentation-outline.md, diagrams/
- .github/workflows/ci-cd.yml

## Модули API

- users (регистрация, логин, профиль)
- catalog (категории, бренды, товары, атрибуты, изображения)
- cart (корзина: Redis для временных данных, БД при оформлении)
- orders (оформление, статусы, уведомления-заглушки)
- auth (JWT, rate limit на Redis)

## Контейнеры

- db: mariadb:11 (volume db_data)
- redis: redis:7-alpine
- api: Fastify + TS (Prisma, подключение к db/redis)
- web: React+Vite сборка (serve через nginx)
- nginx: reverse proxy и статика
- опционально adminer для БД

## Ключевые конфиги

- docker/api.Dockerfile, docker/web.Dockerfile, docker/nginx.Dockerfile
- compose/docker-compose.yaml: сервисы, сети frontend/backend, volume db_data
- swarm/stack.yaml: replicas, placement, secrets/configs
- k8s/*.yaml: Deployments/StatefulSet, Services, Ingress, PVC для db и медиа (если нужны)
- .github/workflows/ci-cd.yml: buildx, push в GHCR, deploy в Swarm/K8s

## Секреты/конфигурация

- Compose: .env
- Swarm: docker secret/config
- K8s: Secrets/ConfigMaps, Ingress TLS при наличии

## Результат

- Рабочий SPA+API магазин в Compose
- Готовые Swarm и K8s манифесты
- CI/CD pipeline
- Документация и презентация

### To-dos

- [x] Инициализировать Fastify API на TypeScript
- [x] Настроить Prisma и миграции для MariaDB
- [x] Реализовать аутентификацию JWT и хранение пользователей
- [x] Реализовать каталог: категории, товары, изображения, фильтрацию
- [x] Сделать корзину: Redis для временных данных, сохранение в БД при checkout
- [x] Оформление заказа, статусы, e-mail заглушки
- [x] Добавить rate limit и кэширование на Redis
- [x] Создать React+Vite SPA с Tailwind и DaisyUI
- [x] Реализовать страницы: главная, каталог, товар, корзина, checkout, профиль
- [x] Настроить NGINX для раздачи SPA и проксирования /api
- [x] Написать Dockerfiles для api, web и nginx (multi-stage)
- [x] Собрать docker-compose с db, redis, api, web, nginx и сетями
- [x] Создать Swarm stack.yaml с репликами и overlay сетями
- [x] Написать K8s манифесты: StatefulSet/Deployments/Services/Ingress/PVC
- [x] Настроить GitHub Actions: buildx, push в GHCR, деплой в Swarm/K8s
- [x] Подготовить аналитику, выбор технологий, деплой и сети в docs
- [ ] Собрать презентацию и диаграммы (пока что не ненадо)