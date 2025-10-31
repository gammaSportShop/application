# Networking

## NGINX
- Serves `/` from `/usr/share/nginx/html`
- Proxies `/api/` to `api:3000`

## Docker Compose / Swarm
- Networks: `frontend` for `web`, `backend` for `api`, `db`, `redis`
- Web container binds port 80 on host

## Kubernetes
- Services: ClusterIP for `web`, `api`, `db`, `redis`
- Ingress: routes `/` to `web:80` and `/api` to `api:3000`

## CORS/Headers
- Requests from SPA to `/api` are same-origin due to NGINX proxying
