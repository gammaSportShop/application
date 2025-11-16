# Technology Choices

## Backend
- Fastify + TypeScript: high performance, good plugin model, type-safety.
- Prisma ORM: typed client, schema-as-source-of-truth, straightforward migrations/db push.
- MariaDB: relational store with strong SQL semantics.
- Redis: rate limiting and ephemeral data such as cart state.

## Frontend
- React + Vite: fast dev server, lean production builds.
- Tailwind CSS 4: utility-first styling with a custom design layer (buttons, cards, layout helpers).
- `lucide-react`: lightweight icon set for consistent visuals.

## Edge/Proxy
- NGINX in the `web` image serves the compiled SPA and reverse proxies `/api` to the API service.

## Containerization & Orchestration
- Dockerfiles for `api` and `web` are multi-stage, producing small final images.
- Docker Compose is used for local, single-node environments.
- Kubernetes is the primary orchestration target for cluster deployments.
- FluxCD (see `k8s/flux-system`) is used for GitOps-driven synchronization of manifests.

## CI/CD
- GitHub Actions (or similar pipelines) build and push images to GHCR.
- Clusters are expected to consume these images via Kubernetes manifests stored in this repository and synchronized with FluxCD.
