# Container Platform Analysis

## Goals
- Reliable single-node dev with Docker Compose
- Simple clustering path with Docker Swarm
- Production-grade orchestration with Kubernetes

## Docker Swarm
- Simpler operational model than Kubernetes
- Overlay networks for service-to-service communication
- Declarative `stack.yaml` with replicas
- Suitable for small clusters and student lab setups

Limitations
- Smaller ecosystem than Kubernetes
- Fewer built-in primitives (no CRDs, fewer controllers)

## Kubernetes
- Strong ecosystem, standardized APIs, portability across clouds
- Workloads: Deployments, StatefulSets (MariaDB), Services, Ingress
- Config separation via Secrets/ConfigMaps
- Storage via PersistentVolumeClaim (MariaDB data)

Operational Considerations
- Requires cluster and Ingress controller (e.g., NGINX Ingress)
- CI deployment via kubectl using KUBECONFIG secret

## Networking Model
- Swarm: overlay networks `frontend` and `backend`
- K8s: ClusterIP Services for `api`, `web`, `db`, `redis`; Ingress routes `/` to `web` and `/api` to `api`

## Storage
- MariaDB uses PVC (5Gi) and a StatefulSet for stable identity

## CI/CD
- GitHub Actions builds multi-platform images with Buildx and pushes to GHCR
- Post-build step applies K8s manifests using a base64-encoded kubeconfig secret

## Security Notes
- JWT secret in K8s Secret, never in image
- DB credentials in Secret for K8s; in Compose via env
