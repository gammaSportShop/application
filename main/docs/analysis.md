# Container Platform Analysis

## Goals

- Reliable single-node development with Docker Compose.
- Simple GitOps-based deployment to Kubernetes using FluxCD.
- Production-like orchestration with Kubernetes primitives (Deployments, StatefulSet, PVC, Ingress).

## Current Platform Choice

The current project primarily targets:
- **Local development** with Docker Compose.
- **Kubernetes** as the main orchestration platform.
- **FluxCD** for GitOps-style synchronization of manifests from this repository.

Docker Swarm is no longer a first-class target in this codebase (no Swarm stack files are present).

## Kubernetes

- Workloads:
  - Deployments: `api`, `web`, `redis`, `metrics-worker`.
  - StatefulSet: `db` (MariaDB).
  - Services: ClusterIP for `api`, `web`, `db`, `redis`.
  - Ingress: `sportshop` Ingress routes `/` to `web` and `/api` to `api`.
- Configuration separation:
  - Secrets via `k8s/secrets.yaml` and `app-secrets` (JWT, DB credentials, etc.).
  - Config via `k8s/app.env` and env vars in manifests.
- Storage:
  - `db` uses a PersistentVolumeClaim (5Gi) and StatefulSet to maintain identity and durable data.

### Operational Considerations

- Requires:
  - A Kubernetes cluster (local or cloud).
  - An Ingress controller (Traefik is assumed via `kubernetes.io/ingress.class: traefik`).
- CI/CD:
  - Container images are published to GHCR (e.g., `ghcr.io/gammasportshop/sportshop-api` and `sportshop-web`).
  - FluxCD (`k8s/flux-system`) can be configured in the cluster to watch this repo and apply updates automatically.

## Docker Compose

- Provides a self-contained, single-node environment:
  - `db` (MariaDB) with a named volume.
  - `redis` (Redis 7).
  - `api` (Fastify + Prisma backend).
  - `metrics` worker (same image as `api` with different command).
  - `web` (NGINX + compiled SPA).
- Uses two overlay networks:
  - `frontend` for the web entrypoint.
  - `backend` for internal communication between `api`, `db`, `redis`, and `web`.

## Security Notes

- Secrets:
  - JWT secret and DB credentials are injected via environment variables.
  - In Kubernetes, these live in Secrets and are referenced via `envFrom` / `secretRef`.
  - Secrets are not baked into images.
- API:
  - JWT-based authentication; tokens are expected to be handled carefully on the client side.

