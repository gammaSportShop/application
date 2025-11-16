# Deployment

## Docker Compose (local)

Prerequisites:
- Docker Desktop or Docker Engine

Build and run the full stack (MariaDB, Redis, API, metrics worker, web):

```bash
docker compose -f compose/docker-compose.yaml up -d --build
```

Useful commands:

```bash
docker compose -f compose/docker-compose.yaml ps
docker compose -f compose/docker-compose.yaml logs -f api
docker compose -f compose/docker-compose.yaml logs -f web
docker compose -f compose/docker-compose.yaml down
```

The `web` service binds host port `80`, serving the SPA and proxying `/api/` to the `api` service.

## Kubernetes

Prerequisites:
- A Kubernetes cluster (local k3d/Kind or cloud)
- `kubectl` configured for the cluster

1. Create secrets and env configuration (see `k8s/secrets.yaml` and `k8s/app.env` as templates).
2. Apply manifests:

```bash
kubectl apply -f k8s/
```

3. Verify:

```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

Key components:
- `db` StatefulSet + PVC (MariaDB 11).
- `redis` Deployment and Service.
- `api` Deployment and Service, backed by `ghcr.io/gammasportshop/sportshop-api`.
- `metrics-worker` Deployment reusing the API image with `node dist/metricsWorker.js`.
- `web` Deployment and Service, backed by `ghcr.io/gammasportshop/sportshop-web`.
- `sportshop` Ingress (class `traefik`) routing `/` to `web` and `/api` to `api`.

CI/CD can be integrated via GitHub Actions and Flux; the cluster is expected to sync from the `k8s/` manifests using FluxCD configuration under `k8s/flux-system/`.
