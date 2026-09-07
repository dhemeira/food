# Recipes App

A family recipe app rebuilt on **Firebase Firestore + Cloudflare**, keeping the backend swappable behind a small interface.

- **Frontend:** Vite + React 19 + TypeScript + Tailwind CSS v4
- **Data:** Firebase Auth (Google sign-in) + Firestore (no paid products)
- **Images:** Cloudflare R2 + a Cloudflare Worker (center-crop to 1000×400, served from `img.dheimeira.hu`)
- **Hosting:** Cloudflare Pages

## Layout

```
recipes-app/
├── frontend/                 # React app
│   └── src/
│       ├── backend/          # swappable data layer (see below)
│       ├── context/          # AuthProvider + useAuth
│       ├── hooks/            # useRecipes, useRecipe
│       ├── components/       # Navbar, Search, RecipeList, ProtectedRoute
│       └── pages/            # Home, Login, RecipeDetail, RecipeForm, NotFound
├── worker/                   # Cloudflare Worker (image upload/delete)
├── firestore.rules           # Firestore security rules
└── firestore.indexes.json    # Firestore index config
```

## Swappable backend layer

Everything under `frontend/src/backend` defines a `Backend` interface with four facets:
`auth`, `recipes`, `users`, and `images`. UI code imports only `backend` from `~/backend`
(the interface), never the Firebase SDK. To swap backends, implement `Backend` once and
change the factory in `frontend/src/backend/index.ts`.

## Setup

### 1. Firebase

1. Create a project at https://console.firebase.google.com.
2. **Authentication → Sign-in method → Google** → enable.
3. **Firestore** → create database (production mode, `europe-west3`).
4. **Project settings → Your apps → Web app** → register, copy the config.
5. **Authentication → Settings → Authorized domains** → add `img.dhemeira.hu` (or your pages domain).
6. Deploy `firestore.rules` (Rules tab) and `firestore.indexes.json` (Indexes tab).

### 2. Bootstrap the admin

Sign in once with your Google account, then in the Firestore console create:

```
users/<your-uid>  →  { "role": "admin" }
```

### 3. Frontend

```sh
cp frontend/.env.example frontend/.env   # fill in VITE_FIREBASE_* and VITE_IMAGE_API_URL
npm install
npm run dev
```

### 4. Worker

1. Create an R2 bucket named `recipe-images`.
2. Bind `img.dhemeira.hu` to the bucket via R2 → Settings → Custom domains (enable public access).
3. Edit `worker/wrangler.toml` (`FIREBASE_PROJECT_ID`, `IMG_BASE_URL`).
4. `cd worker && npm install && npm run deploy`.

The Worker verifies the Firebase ID token, center-crops the image to 1000×400 (5:2), and stores
it under `recipes/<recipeId>.jpg`. Deletes remove that object.
