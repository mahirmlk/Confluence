---
name: deploy
description: Deploys Confluence to various platforms. Covers Docker Compose, Vercel + Fly.io, Railway, Render, and manual VPS deployment. Includes production hardening, security headers, and reverse proxy configuration.
---

# Deploy Confluence

Production deployment guide for all supported platforms.

## Pre-Deployment Checklist

```bash
# 1. Run all checks
make typecheck
make lint
make test-backend

# 2. Build frontend
cd frontend && npm run build

# 3. Verify Docker builds
docker compose build
```

## Platform Options

| Platform | Frontend | Backend | Cost | Difficulty |
|----------|----------|---------|------|------------|
| Docker Compose | Container | Container | VPS cost | Medium |
| Vercel + Fly.io | Vercel (free) | Fly.io (free tier) | $0-10/mo | Easy |
| Vercel + Railway | Vercel | Railway | $5-20/mo | Easy |
| Render | Static Site | Web Service | $0-15/mo | Easy |

---

## Docker Compose (Self-Hosted)

### Quick Start

```bash
# Set environment variables
export CORS_ORIGINS=https://yourdomain.com
export REDIS_URL=redis://redis:6379

# Build and start
docker compose up -d --build

# Check status
docker compose ps
docker compose logs -f backend
```

### Production Docker Compose

```yaml
services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=https://api.yourdomain.com
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: "1.0"

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379
      - CORS_ORIGINS=https://yourdomain.com
      - LOG_LEVEL=INFO
    depends_on:
      - redis
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 1G
          cpus: "2.0"

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    deploy:
      resources:
        limits:
          memory: 256M
          cpus: "0.5"
```

### Reverse Proxy (Nginx)

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'" always;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (training animation)
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400;
    }
}
```

### Caddy (Alternative)

```
yourdomain.com {
    reverse_proxy /api/* localhost:8000
    reverse_proxy /ws/* localhost:8000 {
        transport http {
            read_timeout 86400
        }
    }
    reverse_proxy localhost:3000
}
```

---

## Vercel + Fly.io (Recommended)

### Backend on Fly.io

```bash
cd backend
fly launch --name confluence-backend --no-deploy

fly secrets set \
  CORS_ORIGINS=https://your-frontend.vercel.app \
  LOG_LEVEL=INFO

# Optional: provision Redis
fly redis create --name confluence-redis
fly secrets set REDIS_URL=redis://default:<password>@confluence-redis.flycast:6379

fly deploy
```

### Frontend on Vercel

1. Import GitHub repo on vercel.com
2. Set **Root Directory** to `frontend`
3. Add env var: `NEXT_PUBLIC_API_URL=https://confluence-backend.fly.dev`
4. Deploy

### Verify

```bash
curl https://confluence-backend.fly.dev/health
# → {"status":"ok","version":"0.1.0"}
```

---

## Render (Full Stack)

1. **Redis**: New → Redis → note internal URL
2. **Backend**: New → Web Service → Root Directory: `backend` → Runtime: Docker
   - `REDIS_URL=redis://<internal-url>`
   - `CORS_ORIGINS=https://your-frontend.onrender.com`
3. **Frontend**: New → Static Site → Root Directory: `frontend`
   - Build Command: `npm ci && npm run build`
   - Publish Directory: `.next`
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

---

## Post-Deployment Verification

```bash
# Health check
curl https://your-domain.com/health

# API docs
open https://your-domain.com/docs

# WebSocket test
wscat -c wss://your-domain.com/ws/stream
# Send: {"algorithm":"gradient-boosting","dataset_name":"moons","resolution":50}
```

## Environment Variables

| Variable | Service | Required | Default |
|----------|---------|----------|---------|
| `CORS_ORIGINS` | Backend | Yes | `http://localhost:3000` |
| `REDIS_URL` | Backend | No | `redis://localhost:6379` |
| `LOG_LEVEL` | Backend | No | `INFO` |
| `NEXT_PUBLIC_API_URL` | Frontend | Yes | `http://localhost:8000` |
