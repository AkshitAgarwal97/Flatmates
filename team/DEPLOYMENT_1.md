# 🚀 Deployment_1 — Infrastructure & DevOps Engineer

> **Role:** Deployment, Infrastructure & Environment Management
> **Reports To:** CEO / Architect
> **Tools:** Docker, Docker Compose, Nginx, AWS EC2, GitHub Actions
> **Last Updated:** June 2026

---

## 🎯 Role Mission

Your mission is to ensure the Flatmates application is **always deployed, always healthy, and always available**. You own all environments — from local development to production — and are responsible for zero-downtime deployments, environment configurations, and monitoring.

---

## 🌍 Environment Overview

| Environment | Purpose | URL | Branch |
|------------|---------|-----|--------|
| **Local** | Developer's machine | `http://localhost:3000` | Any |
| **Staging** | Pre-release QA testing | `https://staging.flatmates.co.in` | `develop` |
| **Production** | Live users | `https://flatmates.co.in` | `main` |

---

## 🏗️ Infrastructure Architecture

```
Internet
    │
    ▼
[Nginx Gateway] ─── Port 80/443 ─── SSL via Let's Encrypt
    │
    ├─── /api/* ──────────────► [Backend Container] ─── Port 5000
    │                               ├── Express + TypeScript
    │                               ├── Socket.IO
    │                               └── MongoDB (Atlas)
    │
    └─── /* ──────────────────► [Frontend Container]
                                    ├── Nginx serving React build
                                    └── Static files
```

---

## 🐳 Docker Setup

### Key Files
| File | Purpose |
|------|---------|
| `docker-compose.yml` | Production multi-service orchestration |
| `docker-compose.simple.yml` | Simplified deployment variant |
| `backend/Dockerfile` | Backend Docker image |
| `frontend/Dockerfile` | Frontend Docker image (Nginx-served) |
| `nginx-gateway/nginx.conf` | Nginx reverse proxy configuration |

### Service Overview

```yaml
# docker-compose.yml Services:
backend:
  - Builds from ./backend/Dockerfile
  - Exposes port 5000
  - Reads env from .env

frontend:
  - Builds from ./frontend/Dockerfile
  - Served via Nginx internally

nginx-gateway:
  - Routes traffic to frontend and backend
  - Handles SSL via /etc/letsencrypt
  - Ports: 80, 443
```

---

## 📋 Deployment Playbooks

### 🟢 Staging Deployment

```powershell
# 1. Pull latest changes
git pull origin develop

# 2. Build backend TypeScript
cd backend && npm run build && cd ..

# 3. Build and start all containers
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 4. Verify services are healthy
docker ps
docker logs flatmates-backend --tail=50
docker logs flatmates-frontend --tail=20

# 5. Health check
curl http://localhost:5000/api/properties
```

### 🔴 Production Deployment

```powershell
# NEVER deploy to production without:
# ✅ Tester_1 sign-off
# ✅ SCO_1 audit completed
# ✅ CEO/Architect approval

# 1. SSH into production server
ssh -i flatmates-key.pem ec2-user@<EC2_IP>

# 2. Pull latest main branch
git pull origin main

# 3. Build backend
cd backend && npm install --omit=dev && npm run build

# 4. Restart production containers (zero-downtime)
docker-compose pull
docker-compose up -d --no-deps --build backend
docker-compose up -d --no-deps --build frontend
docker-compose restart nginx-gateway

# 5. Verify production health
curl https://flatmates.co.in/api/properties

# 6. Monitor logs for 10 minutes post-deployment
docker logs -f flatmates-backend
```

### 🔄 Rollback Procedure

```bash
# If production deployment fails, rollback immediately:
git log --oneline -10       # find last working commit
git checkout <commit-hash>
docker-compose down
docker-compose build
docker-compose up -d
# Notify team immediately
```

---

## 🔐 Environment File Management

### Never commit these files:
- `.env` (all environments)
- `SECRETS.env`
- `flatmates-key.pem`
- `backend/.env.production`

### Environment Variables Checklist

**Backend `.env`:**
```bash
# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/flatmates

# JWT
JWT_SECRET=<strong-random-64-char-string>
JWT_EXPIRE=7d

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=

# App
CLIENT_URL=https://flatmates.co.in
NODE_ENV=production
PORT=5000

# Encryption
ENCRYPTION_KEY=<strong-random-32-char-string>
```

**Frontend `.env.local`:**
```bash
REACT_APP_API_URL=http://localhost:5000
```

**Frontend production (build time):**
```bash
REACT_APP_API_URL=https://api.flatmates.co.in
```

---

## 🔒 SSL / HTTPS Setup (Let's Encrypt)

```bash
# Install Certbot on EC2
sudo apt install certbot

# Generate certificates
sudo certbot certonly --standalone \
  -d flatmates.co.in \
  -d www.flatmates.co.in

# Auto-renew (add to crontab)
0 0 1 * * certbot renew --quiet && docker restart flatmates-gateway
```

### Nginx SSL Config Verification
```bash
# Verify SSL cert expiry
openssl s_client -connect flatmates.co.in:443 -servername flatmates.co.in \
  2>/dev/null | openssl x509 -noout -dates
```

---

## 📊 Monitoring & Health Checks

### Uptime Monitoring
Set up UptimeRobot (free) to ping:
- `https://flatmates.co.in` every 5 minutes
- `https://flatmates.co.in/api/properties` every 5 minutes
- Alert via email/SMS if down

### Container Health
```bash
# Check all container status
docker ps -a

# View backend logs (live)
docker logs -f flatmates-backend

# Check memory/CPU usage
docker stats

# Inspect failed container
docker logs flatmates-backend --tail=100
```

### Server Resource Monitoring
```bash
# EC2 disk usage
df -h

# RAM usage
free -m

# CPU load
top
```

---

## 🔧 Deployment Automation Script

Use the built-in staging deployment script:
```powershell
# Quick staging deploy
.\team\scripts\deploy-stage.ps1
```

---

## 📅 Deployment Schedule

| When | What | Who |
|------|------|-----|
| Every Wednesday | Staging deployment of sprint features | Deployment_1 |
| Every Friday | Production deployment (post sign-offs) | Deployment_1 + CEO |
| On hotfixes | Emergency production deploy | Deployment_1 (immediate) |
| Monthly | SSL cert check | Deployment_1 |
| Monthly | Dependency security audit (`npm audit`) | Deployment_1 + Developer_1 |

---

## 🤝 Collaboration Protocol

- **With Developer_1:** Notify when staging is up so they can test. Coordinate on any env variable or build config changes.
- **With Tester_1:** Provide fresh staging deploy at start of each test session. Share logs if needed for bug investigation.
- **With SCO_1:** Ensure Nginx serves correct headers (`Content-Type`, `Cache-Control`, gzip enabled) for SEO performance.
- **With CEO/Architect:** Get explicit approval before every production deployment. Report any infrastructure issues immediately.
