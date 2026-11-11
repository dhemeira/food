# Receptek

A React 19 + TypeScript PWA for family recipes, backed by Firebase (Auth + Firestore) and built
with Vite and Tailwind CSS 4. Development runs entirely in Docker.

## Setup

```sh
git clone https://github.com/dhemeira/food.git && cd food
cp .env.example .env   # fill in the values below
```

`.env` values:

| Variable                   | Where to get it                                                           |
| -------------------------- | ------------------------------------------------------------------------- |
| `VITE_FIREBASE_*`          | Firebase console → Project settings → Your apps                           |
| `CLOUDFLARED_TUNNEL_TOKEN` | `cloudflared tunnel token food-dev`                                       |
| `ANTHROPIC_*`              | Optional Claude Code gateway settings for the dev container; may be blank |

## Run

```sh
docker compose up --build
```

- App: http://localhost:5050
- Public dev URL: https://test.dhemeira.hu — only while the stack is running

Stop with `docker compose down`.

Alternatively, open the repo in VS Code and choose **Reopen in Container**. The dev container starts
the same `web` + `tunnel` services and installs Claude Code inside `web`.

## How the dev environment works

Two Compose services:

- **`web`** — Node 22.22.1 running the Vite dev server on port 5050. The repo is bind-mounted at
  `/app` for HMR; `node_modules` lives in the `node_modules` named volume and is installed with
  `npm ci` when the image is built. File watching uses polling (`CHOKIDAR_USEPOLLING=true`) because
  bind-mount events are unreliable on Docker Desktop. A healthcheck gates the tunnel on the dev
  server responding.
- **`tunnel`** — `cloudflare/cloudflared:2026.10.7` connected to the `food-dev` tunnel. Ingress is
  in `cloudflared/config.yml`: `test.dhemeira.hu` → `http://web:5050`. It starts only after `web`
  is healthy. `CLOUDFLARED_TUNNEL_TOKEN` is required — Compose fails fast if it is missing.

The dev container (`.devcontainer/devcontainer.json`) uses the `web` service, starts `web` and
`tunnel`, persists Claude Code config in the `food-claude-config` volume mounted at `/root/.claude`,
and installs the Claude Code CLI.

### Things that bite

- **One connector per tunnel.** Never run a second cloudflared for `food-dev`: no host-side
  `cloudflared tunnel run food-dev`, no Windows `Cloudflared` service, no `npm run dev:host` while
  Compose is up. Cloudflare load-balances requests across connectors; a second connector with no
  ingress returns empty 503s, so the site works or fails depending on which connector a request
  lands on. Check for duplicates with `Get-Process cloudflared` / `Get-Service *cloudflared*`
  (Windows), `docker ps`, or Cloudflare dashboard → Zero Trust → Networks → Tunnels → `food-dev`.
- **The dev server is public while the tunnel is up.** Keep `server.fs.allow` in `vite.config.ts`
  scoped to the project; widening it exposes container files (including secrets) through
  `https://test.dhemeira.hu/@fs/...`.
- **Dependency changes need a clean volume rebuild.** The `node_modules` volume is populated from
  the image once, so `--build` alone will not pick up a changed `package-lock.json`:

  ```sh
  docker compose down -v && docker compose up --build
  ```

- **`test.dhemeira.hu` is only up while this stack runs.** Closing the dev container or Docker
  Desktop takes it down.
- **Keep secrets in `.env`** (gitignored). `.env.example` is the template.

## Common commands

```sh
docker compose logs -f web          # Vite output
docker compose logs -f tunnel       # cloudflared output
docker compose restart tunnel
docker compose down -v && docker compose up --build   # clean rebuild

npm run lint                        # ESLint
npm run format:check                # Prettier
npm run build                       # tsc -b && vite build
```

Without Docker (Node 22): `npm install && npm run dev`.

## Data and production

- Data lives in Firestore; `firestore.rules` and `firestore.indexes.json` are the source of truth
  and deploy via GitHub Actions on push.
- Production is Cloudflare Pages at https://food.dhemeira.hu.
