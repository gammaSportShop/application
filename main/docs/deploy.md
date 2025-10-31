# Deployment

## Docker Compose

Prereqs: Docker Desktop or Docker Engine

Build and run
```bash
docker compose -f compose/docker-compose.yaml up -d --build
```

Useful commands
```bash
docker compose -f compose/docker-compose.yaml logs -f api
docker compose -f compose/docker-compose.yaml ps
```

## Kubernetes

Apply manifests
```bash
kubectl apply -f k8s/
```

Verify
```bash
kubectl get pods
kubectl get svc
kubectl get ingress
```

CI deploy via GitHub Actions requires a base64-encoded kubeconfig in secret `KUBE_CONFIG_DATA`.
