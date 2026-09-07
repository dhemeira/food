# Recipes App

A family recipe app: a React SPA backed by **Firebase** (free "Spark" tier) and hosted on
**Cloudflare Pages**. There is no backend server, no payment method, and no Cloudflare Worker —
data lives in Firestore, and images are stored as base64 data URIs inside Firestore.

## Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4 (`react-router-dom` for routing)
- **Auth:** Firebase Auth — Google sign-in only
- **Data:** Firestore (free tier)
- **Hosting:** Cloudflare Pages (custom domain `food.dheimeira.hu`)
- **CI:** GitHub Actions auto-deploys Firestore rules on push

## Directory layout

```
recipes-app/
├── frontend/                     # the React app (Pages build root)
│   └── src/
│       ├── backend/              # ← swappable data layer (the important part)
│       │   ├── Backend.ts        #    Backend interface (the contract)
│       │   ├── index.ts          #    factory: creates + exports the singleton `backend`
│       │   ├── types.ts          #    domain types (User, Recipe, RecipeImage, …)
│       │   └── firebase/         #    Firebase implementation (only files importing Firebase)
│       ├── context/              # AuthProvider + useAuth
│       ├── hooks/                # useRecipes, useRecipe, useRecipeImage
│       ├── lib/                  # image.ts — client-side crop/resize to base64
│       ├── components/           # Navbar, Search, RecipeList, ProtectedRoute
│       └── pages/                # Home, Login, RecipeDetail, RecipeForm, NotFound
├── firestore.rules               # security rules (source of truth, deployed by CI)
├── firestore.indexes.json        # composite indexes (empty — none needed yet)
├── firebase.json                 # Firebase CLI config (points at the two files above)
├── wrangler.jsonc                # Pages/Wrangler config (pages_build_output_dir)
└── .github/workflows/            # deploy-firestore.yml
```

## The swappable backend (key design decision)

All UI code talks to a `Backend` **interface**, never to the Firebase SDK directly. `Backend` has
four facets:

- `auth` — `signInWithGoogle` / `signOut` / `currentUser` / `onAuthChange`
- `recipes` — `list` / `watch` (realtime) / `get` / `create` / `update` / `remove`
- `users` — `watchRole`
- `images` — `set` / `get` / `remove`

`frontend/src/backend/index.ts` builds a `FirebaseBackend` and exports it as `backend`.
Components and hooks import `backend` (or the `useX` hooks), never the Firebase SDK. To swap the
backend (e.g. a REST API), implement `Backend` once and change that single factory line.

Domain types in `types.ts` are Firebase-agnostic. `firebase/converters.ts` maps Firestore
documents ↔ domain objects.

## Data model

| Collection       | Doc id     | Fields | Notes |
|------------------|------------|--------|-------|
| `recipes`        | auto       | `title`, `description`, `calorieValue`, `calorieUnit`, `hasImage`, `thumb`, `ingredients[]`, `steps[]`, `createdBy`, `createdAt`, `updatedAt` | `thumb` is a small base64 data URI, denormalized so the list query carries it with **no extra read** |
| `recipeImages`   | = recipe id | `full` (1000×400 data URI), `updatedAt` | read only on the detail view |
| `settings/config`| `config`   | `allowedEmails[]` | who may write — edit in the console |
| `users`          | = auth uid | `role: 'admin' \| 'family'` | admins may delete |

`ingredients` = `{ quantity, name }`; `steps` = `{ instruction }`. Both are embedded arrays — a
recipe is fully replaced on save.

## Image pipeline

1. `RecipeForm` picks a file → `lib/image.ts` `processRecipeImage()` center-crops it on a canvas
   (`fit=cover`) to two JPEG data URIs: `full` 1000×400 and `thumb` 400×160.
2. On save, `images.set(id, { full, thumb })` does one batched write: `full` → `recipeImages/{id}`,
   and `thumb` + `hasImage` → `recipes/{id}`.
3. The homepage renders `recipe.thumb` directly; the detail view renders `recipeImages/{id}.full`
   via `useRecipeImage`.
4. `images.remove(id)` clears `thumb`/`hasImage` and deletes the full image. `recipes.remove(id)`
   also deletes the image doc (batched).

Firestore caps a document at 1 MiB; `processRecipeImage` rejects anything over ~900 KB combined.

## Auth, roles, allowlist

- **Guests (signed out) can read** recipes and images (public read).
- Only emails in `settings/config.allowedEmails` can create/update recipes and set/remove images.
- Only `users/{uid}.role == 'admin'` can delete.

All of this is enforced in `firestore.rules`. Bootstrap = create the `settings/config` and `users`
docs manually in the console (project owners bypass rules). The allowlist doc is the single source
of truth; rules read it via `get()`.

## How the frontend flows

- `main.tsx` → `App` → `AuthProvider` wraps `BrowserRouter`.
- `AuthProvider` subscribes to auth state + the current user's role; exposes
  `{ user, isAdmin, isLoading, signIn, signOut }` through `useAuth()`.
- `useRecipes` = realtime `onSnapshot` over `recipes` ordered by `updatedAt desc`. Offline
  persistence is enabled in `backend/firebase/app.ts` via `persistentLocalCache()`.
- `useRecipe(id)` = one-shot get; `useRecipeImage(id, enabled)` = one-shot get of the full image.
- Routes: `/` home, `/login`, `/recipe/:id`, and `/recipe/new` + `/recipe/:id/edit` (behind
  `ProtectedRoute`).
- Search is client-side — `Home` filters the cached list (case-insensitive substring across
  title + description).

## Security rules + CI

- `firestore.rules` is the source of truth, stored in the repo.
- `firebase.json` maps `firestore.rules` and `firestore.indexes.json`.
- `.github/workflows/deploy-firestore.yml` runs `firebase deploy --only firestore` on pushes to
  `master` that touch those files. Requires `FIREBASE_TOKEN` + `FIREBASE_PROJECT_ID` secrets.

## Dev conventions

- Node 22 (`.nvmrc`). Install husky at the repo root, then work in `frontend/`.
- Scripts (frontend): `dev`, `build` (`tsc -b && vite build`), `lint`, `format:check`/`format:fix`.
- `~` aliases to `frontend/src` (set in `vite.config.ts` + `tsconfig.app.json`).
- Env: `frontend/.env` holds 6 `VITE_FIREBASE_*` vars (see `.env.example`). These are inlined at
  build time, so they must also be set as build environment variables in Cloudflare Pages.
- Lint/prettier run on commit via husky + lint-staged (frontend only).

## Gotchas

- Firestore is billed per **document read**, not per request — batching many docs into one query
  reduces round-trips, not reads.
- Images are public-readable; the app is write-gated by the allowlist only.
- Editing `firestore.rules` does nothing until pushed (CI) or deployed manually
  (`firebase deploy --only firestore`).
- Vite warns about a large chunk (the Firebase SDK) — expected and ignorable.
