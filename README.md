# Receptek

A React 19 + TypeScript PWA for family recipes, backed by Firebase (Auth + Firestore) and built with
Vite and Tailwind CSS 4. Development runs in one Docker container; the host needs Docker and VS Code.

## Quick start

Prerequisites:

- Docker Desktop (Compose v2)
- VS Code with the Dev Containers extension
- Git (optional — you can clone with Docker)

```sh
git clone https://github.com/dhemeira/food.git && cd food
cp .env.example .env   # PowerShell: Copy-Item .env.example .env
docker compose up -d --build
```

Without host Git (PowerShell):

```powershell
docker run --rm -v "${PWD}:/repo" -w /repo alpine/git clone https://github.com/dhemeira/food.git
cd food
```

Fill in `.env`:

| Variable                          | Value                                      |
| --------------------------------- | ------------------------------------------ |
| `VITE_FIREBASE_*`                 | Firebase console → Project settings → Apps |
| `CLOUDFLARED_TUNNEL_TOKEN`        | `cloudflared tunnel token food-dev`        |
| `ANTHROPIC_*`, `CLAUDE_CODE_*`    | Optional Claude Code gateway/tuning        |
| `GIT_USER_NAME`, `GIT_USER_EMAIL` | Optional git identity                      |

- App: http://localhost:5050
- Public dev URL: https://test.dhemeira.hu (while the tunnel runs)

## Work in the container

1. Start the stack: `docker compose up -d --build`
2. In VS Code, click the remote indicator (`><`) in the bottom-left → **Attach to Running
   Container** → `food-app-1`.
3. Open `/app` if VS Code does not open it automatically.

The integrated terminal is now inside the container. Run:

```sh
claude
```

`claude --continue` and `claude --resume` work after container restarts. ESLint, Prettier, Tailwind
CSS IntelliSense and TypeScript all run in the container against the same `node_modules` Vite uses.

There is no host `node_modules` and no `.devcontainer` config. If you open the repo in a local
window, IntelliSense will not see the container's modules — attach instead.

### First-time auth

```sh
gh auth login          # add gh auth setup-git if git still asks for credentials
git config --global user.name "..."
git config --global user.email "..."
```

Or set `GIT_USER_NAME` and `GIT_USER_EMAIL` in `.env` and restart the container. If the
`ANTHROPIC_*` gateway variables are set, Claude needs no separate login; otherwise sign in once.

## How it works

- **`app`** — Node 22.22.1, Vite on 5050, Claude Code, git, gh, ripgrep, jq and VS Code Server.
  - `food_app_node_modules` — the only `node_modules`, Linux dependencies.
  - `food_app_home` — Claude history/settings, git/gh auth, VS Code Server, npm cache.
- **`tunnel`** — cloudflared for `food-dev`; `test.dhemeira.hu` → `http://app:5050`. Starts with the
  stack and waits for `app` to be healthy.
- The entrypoint reruns `npm ci` when `package.json` or `package-lock.json` changes, so a normal
  `up --build` is enough after dependency updates.
- `docker compose down` keeps all state; `docker compose down -v` deletes the volumes, including
  Claude and GitHub auth.

## Common commands

```sh
docker compose up -d --build        # app + tunnel
docker compose up -d app            # app only, no public URL
docker compose stop tunnel          # take the public URL down
docker compose logs -f app tunnel
docker compose exec app bash        # host-terminal shell
docker compose exec app claude      # host-terminal Claude fallback
docker compose down
docker compose down -v && docker compose up -d --build

docker compose build --no-cache app # update Claude Code / rebuild the image
```

`docker compose exec ...` is for host terminals. In an attached window, run `npm`, `git`, `claude`,
etc. directly.

To update Claude Code, change `CLAUDE_CODE_VERSION` in `.env` and rebuild with
`docker compose build --no-cache app`.

## Caveats

- **One connector per tunnel.** Do not run another cloudflared for `food-dev`; Cloudflare will
  balance requests across connectors and return empty 503s.
- **The Vite server is public while the tunnel is up.** Keep `server.fs.allow` in `vite.config.ts`
  scoped to the project.
- **Secrets belong in `.env`** (gitignored). `docker compose down -v` deletes Claude and GitHub auth.
- A host `node_modules` from an older setup is unused; delete it if present.

## Docs and production

- `docs/design-system.html` — standalone design reference.
- `docs/home-concept.html` — standalone home + detail design concept (open it directly or via the dev
  server at `/docs/home-concept.html`).
- `TODO.md` — project backlog.
- Firestore rules and indexes deploy via GitHub Actions.
- Production: Cloudflare Pages at https://food.dhemeira.hu.
