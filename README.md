# Family Recipe App

A self-hosted family recipe app: React PWA frontend + PHP backend in Docker, exposed through a Cloudflare Tunnel.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Backend:** PHP 8.2 (Apache), JSON file storage, Web Push (VAPID)
- **Infra:** Docker Compose (2 services: `app` + Cloudflare Tunnel)
- **PWA:** Service worker offline cache + push notification support

## Getting started

### Prerequisites

- Docker Desktop (WSL2 backend)
- Node.js 22+ (local frontend dev only — Docker builds the app)
- A Cloudflare account (for the tunnel)

### Setup

1. Copy the env template and fill in your VAPID keys:

   ```sh
   cp .env.example .env
   npx web-push generate-vapid-keys
   ```

2. Set up a named Cloudflare Tunnel (see "Named tunnel") and add its token to `.env`.

3. Build and start:

   ```sh
   docker compose up --build -d
   ```

   The app is at `http://localhost:8080` and your tunnel hostname (e.g. `https://food.dhemeira.hu`).

### Named tunnel

The quick tunnel (`*.trycloudflare.com`) is replaced by a named tunnel on your own domain so the URL stays stable and Web Push works on a real domain.

1. Cloudflare Zero Trust — **Networks → Tunnels → Create a tunnel**.
2. Name it (e.g. `recipes`) and copy the **token** from the install command (the long string after `--token`).
3. On the tunnel's **Public Hostname** tab add:
   - Subdomain: `food`
   - Domain: `dhemeira.hu`
   - Service: `HTTP` → `http://app:80`
4. Add the token to `.env`:

   ```sh
   TUNNEL_TOKEN=<the token from step 2>
   ```

5. Restart the tunnel:

   ```sh
   docker compose up -d tunnel
   ```

The `http://app:80` service URL resolves to the `app` container because both run on the same Docker network. Adding the public hostname in the dashboard also creates the DNS record (a CNAME to the tunnel) for `food.dhemeira.hu` automatically.

### Testing push notifications

1. Open the app on a real device via your named tunnel hostname (Web Push requires HTTPS).
2. Click "Enable notifications" and allow the permission.
3. Run the test push script:

   ```sh
   docker compose exec app php api/send-push.php
   ```

A test notification should arrive on your device.

### Seeding user accounts

On first deploy, create the two accounts (admin + family) and note the printed passwords — they can be changed later from the admin panel at `/admin`:

```sh
docker compose exec -u www-data app php seed.php
```

Run it as `www-data` so the SQLite file stays writable by the web server. Re-running is a no-op. If the database file was ever created by root, the container fixes ownership automatically on startup.

## Development workflow

There is no rebuild needed for most changes — the container renders your files live via bind mounts.

**Start the dev stack:**

```sh
docker compose up -d --build     # one-time (or after infra changes)
cd frontend
npm run build:watch               # keep this running
```

**Per change:**

- **Backend (PHP):** edit a file in `backend/` → save → immediately live. No build, no restart.
- **Frontend (TS/TSX):** save → `vite build --watch` (the `npm run build:watch` job above) rebuilds `dist` in a fraction of a second → refresh the page.

**Why it works:** the compose file bind-mounts `./frontend/dist` onto the container's docroot and `./backend` sources onto its PHP root, so the running container reads your files directly instead of a baked-in copy.

**You only need a full rebuild** when changing build-time pieces:

```sh
docker compose up --build -d      # after editing Dockerfile, apache/recipe.conf, or adding a composer dependency
```

For a one-off frontend check: `cd frontend && npm run lint && npm run build`.

## Project layout

```
recipe-app/
├── frontend/         # React PWA (Vite + TypeScript + Tailwind)
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pwa/          # Service worker registration + push helpers
│   │   └── utils/        # Shared utilities
│   └── dist/             # Build output (gitignored, bind-mounted into the container)
├── backend/          # PHP API (endpoints under api/)
├── data/             # Persistent runtime data (gitignored, volume mounted)
├── apache/           # Apache config (SPA rewrite, /api alias)
├── Dockerfile        # Multi-stage build: frontend → php:8.2-apache
└── docker-compose.yml
```