# Networking

## NGINX (web image)

The `web` Docker image includes NGINX configured as:
- Static file server for the SPA (`/usr/share/nginx/html`).
- Reverse proxy for the backend API:
  - `location /api/` → `proxy_pass http://api:3000;`

In Docker Compose:
- The `web` container talks to `api` over the `backend` network.
- The SPA is served on host port `80`.

## Docker Compose

- Networks:
  - `frontend` for the `web` service.
  - `backend` for `api`, `db`, `redis`, and `web`.
- External traffic hits `web` on port `80`, and API calls are proxied to `api:3000` via NGINX.

## Kubernetes

- Services:
  - ClusterIP `web`, `api`, `db`, `redis`.
- Ingress (`sportshop`) routes:
  - `/` → `web:80`
  - `/api` → `api:3000`

## CORS/Headers

- The SPA and API are same-origin in both Docker Compose and Kubernetes because NGINX (or Ingress) terminates HTTP and forwards `/api` internally.
