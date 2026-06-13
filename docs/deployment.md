# VPS Deployment Guide (Docker Compose + nginx)

This guide deploys the full stack (Postgres, NestJS API, Next.js web) to a VPS
using Docker Compose, fronted by nginx on the host so it's reachable over plain
HTTP at the VPS's IP address. A note on adding TLS once you have a domain is at
the end.

## 1. Prerequisites

- A VPS running Debian/Ubuntu with Docker and the Docker Compose plugin installed
  (`docker compose version` should work).
- Port 80 open in your firewall (SSH/22 should already be open).
- Your user added to the `docker` group (`sudo usermod -aG docker $USER`, then
  log out/in) so you don't need `sudo` for `docker compose`.

## 2. Clone the repo

```bash
git clone <repo-url> crypto-finance-tracker
cd crypto-finance-tracker
```

## 3. Create environment files

These are gitignored and must be created manually on the server.

### `apps/api/.env`

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and set strong values for:

```
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

Also fill in `OPENAI_API_KEY` / `ETHERSCAN_API_KEY` / `COINGECKO_API_KEY` if you
use those features.

> Note: `PORT`, `ALLOWED_ORIGINS`, and `DATABASE_URL` in this file are overridden
> by `docker-compose.yml` and don't need to be changed - only the secrets above
> matter for the Docker deployment.

### `apps/web/.env.local`

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

No edits needed - `NEXT_PUBLIC_API_URL` is overridden by `docker-compose.yml` /
the root `.env` below.

### Root `.env`

```bash
cp .env.example .env
```

Edit `.env` and set:

```
NEXT_PUBLIC_API_URL=http://<VPS_IP>
ALLOWED_ORIGINS=http://<VPS_IP>
POSTGRES_PASSWORD=<a strong random password>
```

Replace `<VPS_IP>` with your server's public IP address.

## 4. Build and start

```bash
docker compose up -d --build
```

This builds the api and web images, starts Postgres, runs database migrations
(the `migrate` service), then starts the api and web containers.

## 5. Verify

```bash
docker compose ps                 # postgres healthy, migrate exited (0), api/web running
docker compose logs migrate       # should show migrations applied, no errors
curl -sI http://127.0.0.1:3000    # web app - expect HTTP/1.1 200
curl -s http://127.0.0.1:3001/api/v1/auth/login -X POST -H 'Content-Type: application/json' -d '{}'
                                   # api - expect a JSON validation error response, not a connection error
```

## 6. Install and configure nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo cp deploy/nginx.conf /etc/nginx/sites-available/crypto-tracker
sudo ln -s /etc/nginx/sites-available/crypto-tracker /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## 7. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable   # if not already enabled
```

## 8. Test

Open `http://<VPS_IP>` in a browser. You should see the web app, and it should
be able to talk to the API through the `/api/` proxy path.

## 9. Adding a domain + TLS later

Once a domain points at the VPS:

1. Edit `deploy/nginx.conf` (and the deployed copy in
   `/etc/nginx/sites-available/crypto-tracker`): replace `server_name _;` with
   `server_name yourdomain.com;`.
2. Install certbot and request a certificate:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com
   ```
3. Update `.env` (root): set `NEXT_PUBLIC_API_URL=https://yourdomain.com` and
   `ALLOWED_ORIGINS=https://yourdomain.com`.
4. Rebuild, since `NEXT_PUBLIC_API_URL` is baked into the web app at build time:
   ```bash
   docker compose up -d --build
   ```

## 10. Redeploying after code changes

```bash
git pull
docker compose up -d --build
```

The `migrate` service re-runs `prisma migrate deploy` on every `up`, which is a
no-op if there are no new migrations.
