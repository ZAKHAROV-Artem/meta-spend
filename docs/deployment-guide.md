# Deployment Guide: Hetzner VPS (Ubuntu) + Docker + GitHub Actions

This guide explains how this app gets from your laptop to a real website at your domain, and
how to make it redeploy itself automatically. It's written for an Ubuntu VPS and assumes you've
already created the VPS and pointed your domain at it.

Every section explains **why** the step exists before showing the command, so you understand
the system instead of just copy-pasting it.

This guide uses your actual domain and VPS IP throughout:

```text
metaspend.app      your domain
204.168.190.91     your Hetzner VPS public IPv4 address
```

## 1. The big picture

Six pieces work together. Once you know what each one does, every step below is just "configure
piece N":

| Piece | What it actually is | Why it exists here |
|---|---|---|
| **VPS** | A Linux computer you rent, reachable at a public IP | Somewhere for the app to run 24/7 |
| **DNS** | A lookup table mapping `metaspend.app` → `204.168.190.91` | So people type a name, not an IP |
| **SSH** | An encrypted remote terminal into the VPS | How you run commands on a computer you're not sitting at |
| **Docker** | Packages the app + its exact dependencies into isolated processes ("containers") | You don't install Node, pnpm, or Postgres on the VPS by hand — each container brings its own |
| **nginx** | A reverse proxy: the one process allowed to talk to the internet on ports 80/443 | The app's containers stay private; nginx is the single public door and routes requests to the right container |
| **Certbot** | Gets a free HTTPS certificate and wires it into nginx | Without it, browsers warn "not secure" and some browser APIs refuse to work |

Request flow once everything is running:

```text
Browser → DNS lookup → 204.168.190.91:443 → nginx → 127.0.0.1:3000 (web) or 127.0.0.1:3001 (api)
```

The `web` and `api` containers never listen on a public IP — only on `127.0.0.1` (the VPS
talking to itself). nginx is the only thing reachable from outside. This one fact is why the
firewall step later looks the way it does.

Later, a seventh piece gets added: **GitHub Actions**, which SSHes in for you after every
`git push` so you stop SSHing in and redeploying by hand.

## 2. Confirm DNS is actually pointing at your VPS

You've already set the DNS record at your registrar. Before going further, confirm it actually
resolved — a stale DNS record is the single most common cause of confusing failures later
(Certbot in particular gives a misleading error if DNS isn't ready yet).

```bash
dig +short metaspend.app
```

Expect: your VPS's IP, and only that IP. If you get nothing, an old IP, or a parking-page IP from
your registrar, fix DNS before continuing — everything past this point assumes it's correct.

## 3. SSH into the VPS

```bash
ssh root@204.168.190.91
```

Everything from here runs **inside this SSH session**, on the VPS — not on your laptop.

## 4. Update the system and install base tools

**Why:** a fresh VPS has an outdated package index. Installing Docker against a stale index
causes confusing dependency errors that have nothing to do with Docker itself — this is cheap
insurance against that.

```bash
apt update
apt upgrade -y
apt install -y git curl ca-certificates nginx
```

`ufw` (the firewall you'll configure in step 6) ships pre-installed on Ubuntu, just inactive, so
it's not in that list.

## 5. Install Docker Engine and Docker Compose

**Why:** the app's Dockerfiles already describe exactly how to build and run the API and web
app — installing Node.js, pnpm, or Postgres directly on the VPS is unnecessary. Docker reads
those Dockerfiles and does it all in isolated containers instead.

Ubuntu's default repos carry an older Docker build, so add Docker's own repository first:

```bash
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
chmod a+r /etc/apt/keyrings/docker.asc
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" > /etc/apt/sources.list.d/docker.list
apt update
apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker
```

Verify:

```bash
docker compose version
```

Expect a version string, no error. (`docker compose`, with a space, is the plugin you just
installed — that's the command this whole project's `docker-compose.yml` is built for.)

## 6. Configure the firewall

**Why:** by default, only what you explicitly allow should be reachable from the internet.
Ubuntu's firewall is `ufw`, a simpler front-end over the kernel's `iptables`.

```bash
ufw allow OpenSSH
ufw allow 80
ufw allow 443
ufw enable
ufw status
```

Expect `OpenSSH`, `80`, and `443` listed as `ALLOW`, and nothing else.

Notice you're **not** opening 3000 (web), 3001 (api), or 5433 (postgres). That's deliberate, and
it's not just the firewall doing the work: `docker-compose.yml` binds those containers to
`127.0.0.1` only, so they're physically unreachable from outside the VPS regardless of firewall
rules. The firewall is a second, independent layer on top of that — not the only thing standing
between those ports and the internet.

## 7. Get the code and configure secrets

If you haven't already:

```bash
git clone https://github.com/<you>/<repo>.git crypto-finance-tracker
cd crypto-finance-tracker
```

Run `pwd` now and note the output — you'll need this exact path again in step 14 (auto-deploy).

The app reads configuration from three `.env` files. They're gitignored on purpose (they hold
secrets), so they don't exist yet on a fresh clone — you create them from the checked-in
`.example` templates:

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.local.example apps/web/.env.local
```

Edit the **root `.env`** (`nano .env`):

```env
NEXT_PUBLIC_API_URL=https://metaspend.app
ALLOWED_ORIGINS=https://metaspend.app
POSTGRES_PASSWORD=<generate one — see below>
```

**Why these three:** `NEXT_PUBLIC_API_URL` tells the web app's frontend code where to send API
requests. `ALLOWED_ORIGINS` tells the API which origin is allowed to call it from a browser (CORS) —
if these two don't exactly match what's typed in the address bar (scheme + host, no trailing
slash), the browser blocks the request and you see a CORS error in the console. `POSTGRES_PASSWORD`
protects the database container.

Edit **`apps/api/.env`** (`nano apps/api/.env`) and set:

```env
JWT_SECRET=<generate one>
JWT_REFRESH_SECRET=<generate a different one>
NODE_ENV=production
```

**Why:** these two secrets are what the API uses to cryptographically sign login sessions. If
they're weak, default, or shared between projects, anyone who guesses or finds them can forge a
valid login for any user — this is the actual security boundary of the whole app, not a
formality. Generate proper random ones:

```bash
openssl rand -base64 48
```

Run it twice (once per secret), and once more for `POSTGRES_PASSWORD` above. Leave the
`ETHERSCAN_API_KEY` / `COINGECKO_API_KEY` / `OPENAI_API_KEY` lines blank unless you're using
those specific features.

One trap to know about: `apps/api/.env`'s `DATABASE_URL`, `PORT`, and `ALLOWED_ORIGINS` lines are
overridden by `docker-compose.yml` at container start (open the file and you'll see them under
each service's `environment:` block) — editing them in `apps/api/.env` silently does nothing for
the Docker deployment. Only the JWT secrets and `NODE_ENV` actually matter in this file. The
**root** `.env`'s `ALLOWED_ORIGINS` is the one that's actually used.

**`apps/web/.env.local`** needs no edits — leave it as copied. `NEXT_PUBLIC_API_URL` for the web
container actually comes from the root `.env`, passed in as a Docker build argument (more on why
that matters in step 11).

Save in `nano` with `Ctrl+O`, `Enter`, `Ctrl+X`.

## 8. Start the app and verify it — before touching nginx

```bash
docker compose up -d --build
```

This builds the API and web images, starts Postgres, waits for it to be healthy, runs database
migrations once via a one-shot `migrate` container, then starts `api` and `web`.

```bash
docker compose ps
```

Expect: `postgres` healthy, `migrate` exited with code `0`, `api` and `web` running.

**Why test here, before nginx exists:** by calling the containers directly, on the VPS, before
nginx or DNS or HTTPS are involved, you isolate "is the app itself working" from "is the proxy/
domain/certificate working." If this step fails, the problem is in Docker or the app config —
full stop, nothing to do with nginx yet.

```bash
curl -I http://127.0.0.1:3000
curl -i http://127.0.0.1:3001/api/v1/auth/login -X POST -H 'Content-Type: application/json' -d '{}'
```

Expect `HTTP/1.1 200` from the first, and a JSON validation error (not a connection error) from
the second — a validation error means the API is alive and rejecting your empty test request
correctly. If anything looks wrong, check logs before moving on:

```bash
docker compose logs --tail=200 api
docker compose logs --tail=200 web
docker compose logs migrate
```

## 9. Install and configure nginx

**Why:** nginx is the only thing about to be told to listen on the public internet (port 80, then
443). It forwards `/` to the web container and `/api/` to the api container, both over
`127.0.0.1`.

Ubuntu's nginx uses a `sites-available` / `sites-enabled` convention: config files live in
`sites-available`, and a symlink in `sites-enabled` is what actually turns them on.

```bash
cp deploy/nginx.conf /etc/nginx/sites-available/crypto-tracker
ln -s /etc/nginx/sites-available/crypto-tracker /etc/nginx/sites-enabled/crypto-tracker
rm -f /etc/nginx/sites-enabled/default
```

Removing the `default` symlink turns off nginx's stock placeholder site, which would otherwise
compete to handle any request that doesn't cleanly match a `server_name` — including ones you
expect your own config to be serving.

Edit your new config (`nano /etc/nginx/sites-available/crypto-tracker`) and change:

```nginx
server_name _;
```

to:

```nginx
server_name metaspend.app www.metaspend.app;
```

`server_name _;` was a catch-all placeholder; setting it to your real domain tells nginx exactly
which requests this config block handles.

Check syntax and reload:

```bash
nginx -t
systemctl enable --now nginx
systemctl reload nginx
```

Test from your own laptop:

```bash
curl -I http://metaspend.app
```

If this hangs or fails while step 8's `curl 127.0.0.1` worked fine, the usual cause is the
`sites-enabled` symlink missing, or `nginx -t` reporting an error you skipped past — re-check
both before looking anywhere else.

## 10. Add HTTPS with Certbot

**Why:** without HTTPS, traffic between the browser and your VPS is unencrypted, and browsers
mark the site "Not Secure." Certbot gets a free certificate from Let's Encrypt and edits your
nginx config to use it.

```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d metaspend.app -d www.metaspend.app
```

When asked, choose the option to redirect HTTP to HTTPS. Certbot rewrites
`/etc/nginx/sites-available/crypto-tracker` itself — open it afterward and you'll see it added a
`listen 443 ssl;` block with certificate paths, plus the redirect.

Certificates expire after 90 days; Certbot's package sets up automatic renewal via a systemd
timer (no cron job to maintain by hand). Confirm it's there:

```bash
systemctl list-timers | grep certbot
certbot renew --dry-run
```

Test:

```bash
curl -I https://metaspend.app
```

## 11. Rebuild once more, now that HTTPS is final

```bash
docker compose up -d --build
```

**Why you need to do this again:** `NEXT_PUBLIC_API_URL` is a Next.js "public" environment
variable, which means it gets baked directly into the JavaScript bundle **at build time**, not
read at runtime. You set it to `https://metaspend.app` back in step 7, but the image you built
in step 8 was built before HTTPS existed — the browser code in that build still points at
whatever it had then. Editing `.env` again doesn't change a running container; only rebuilding
the image does. This is the single most common "I changed the env file but the site still calls
the wrong URL" mistake with Next.js, worth remembering for any future config change too.

## 12. Verify everything end-to-end in a browser

Open `https://metaspend.app`, register or log in, then open DevTools → Network tab and confirm
requests go to:

```text
https://metaspend.app/api/v1/...
```

If you see a CORS error in the console, it means the `Origin` header the browser actually sent
doesn't exactly match `ALLOWED_ORIGINS` in the root `.env` (the API checks this and rejects
mismatches) — re-check for `http` vs `https`, or a missing/extra `www`.

## 13. Back up the database

Not the focus of this guide, but worth doing: Docker volumes survive container restarts and
rebuilds, but not VPS loss or your own mistakes.

```bash
docker exec cft_postgres pg_dump -U cft_user crypto_tracker > backup_$(date +%F).sql
```

Restore from a backup:

```bash
cat backup_2026-06-20.sql | docker exec -i cft_postgres psql -U cft_user crypto_tracker
```

## 14. Auto-deploy with GitHub Actions

Up to now, shipping a change means: SSH in, `git pull`, `docker compose up -d --build`, by hand,
every time. This section automates exactly that loop.

**The concept:** when you push to `main` on GitHub, GitHub runs a short script on its own
servers (a "workflow"). That script SSHes into your VPS using a key you provide, then runs the
same three commands you'd otherwise type yourself.

### Generate a dedicated SSH key for this

Use a separate key from your personal one, so it can be revoked independently without touching
your own access:

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_deploy_key -N ""
cat ~/.ssh/github_deploy_key.pub >> ~/.ssh/authorized_keys
```

(Run this on the VPS, as root — it's authorizing a new key to log in as root, the same account
you already use.)

### Store the secrets in GitHub

In your repo on GitHub: **Settings → Secrets and variables → Actions → New repository secret**.
Add three:

| Secret name | Value |
|---|---|
| `HETZNER_SSH_KEY` | the contents of `~/.ssh/github_deploy_key` (the **private** key, `cat` it and paste the whole thing) |
| `HETZNER_HOST` | `204.168.190.91` (or your domain) |
| `HETZNER_DEPLOY_PATH` | the path from step 7's `pwd` output, e.g. `/root/crypto-finance-tracker` |

### Add the workflow file

`.github/workflows/deploy.yml` (already created in this repo):

```yaml
name: Deploy to VPS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy via SSH
        uses: appleboy/ssh-action@v1.2.5
        with:
          host: ${{ secrets.HETZNER_HOST }}
          username: root
          key: ${{ secrets.HETZNER_SSH_KEY }}
          script: |
            cd ${{ secrets.HETZNER_DEPLOY_PATH }}
            git pull
            docker compose up -d --build
```

Push this to `main` and every future push will redeploy automatically. Watch it run under your
repo's **Actions** tab.

**The tradeoff, stated plainly:** `HETZNER_SSH_KEY` as configured above grants full root SSH
access to your VPS, not just "permission to deploy." If that GitHub secret ever leaks, treat it
as a full VPS compromise — rotate it immediately (delete the key from `authorized_keys`, generate
a new one, update the GitHub secret).

**Optional hardening (not required, worth knowing about):** you can restrict the key so it can
*only* run the deploy command, no matter what a workflow asks it to do, by prefixing it in
`authorized_keys`:

```text
command="cd /root/crypto-finance-tracker && git pull && docker compose up -d --build",no-port-forwarding,no-X11-forwarding,no-agent-forwarding ssh-ed25519 AAAA... github-actions-deploy
```

This makes a leaked key far less dangerous — it can run only that one fixed command, not an
arbitrary shell. A separate, non-root deploy user is the more conventional production answer, but
adds real complexity (sudo rules or Docker group membership) for a single small VPS — worth
revisiting later, not required now.

## Troubleshooting quick reference

| Symptom | Check | Likely cause |
|---|---|---|
| Container not healthy/running | `docker compose logs <service>` | App/Docker config issue — see logs |
| nginx `502 Bad Gateway` | `curl 127.0.0.1:3000` / `:3001` directly, then `nginx -t` | Either the container isn't actually up, or the nginx config has an error or wasn't reloaded |
| nginx shows the default "Welcome to nginx" page | `ls /etc/nginx/sites-enabled/` | The `default` symlink wasn't removed, or your own site symlink is missing (step 9) |
| Certbot fails to issue a cert | `dig +short metaspend.app` | DNS not pointing at the VPS yet, or port 80 blocked |
| Browser console: CORS error | root `.env` `ALLOWED_ORIGINS` | Doesn't exactly match the browser's origin |
| Web app calls `localhost` instead of your domain | — | Forgot to rebuild (step 11) after changing `NEXT_PUBLIC_API_URL` |
| GitHub Actions deploy fails | the run's log under the **Actions** tab | Missing/wrong secret, or the public key isn't in `authorized_keys` |
