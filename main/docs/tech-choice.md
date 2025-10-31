# Technology Choices

## Backend
- Fastify + TypeScript: high performance, good plugin model, type-safety
- Prisma ORM: migrations, typed client, developer productivity
- MariaDB: relational store with strong SQL semantics
- Redis: rate limiting and cart/session-like ephemeral data

## Frontend
- React + Vite: fast dev server, lean prod builds
- Tailwind CSS + DaisyUI: consistent design system with low CSS overhead

## Edge/Proxy
- NGINX in the `web` image serves SPA and reverse proxies `/api` to the API service

## Containerization & Orchestration
- Dockerfiles are multi-stage for small final images
- Compose for local; Swarm for simple clustering; Kubernetes for full-featured orchestration

## CI/CD
- GitHub Actions: buildx for multi-arch, push to GHCR, optional kubectl apply
