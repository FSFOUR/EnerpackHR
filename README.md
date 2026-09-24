# Enerpack HR - Enterprise HR & Fleet Management System

A comprehensive Human Resource & Fleet Management System with biometric attendance simulation, live Vehicle Tracker, document vault, contract generator, and Firebase Authentication.

Production URL: `https://enerpackhr.enerpack.workers.dev/`

---

## 🚀 Cloudflare Deployment Guide (via GitHub)

Enerpack HR is pre-configured and optimized for both **Cloudflare Workers (with Static Assets)** and **Cloudflare Pages**.

### Architecture: Cloudflare Workers Builds (Recommended)

1. **Push to GitHub**:
   Push the repository to GitHub (`FSFOUR/EnerpackHR`).

2. **Connect to Cloudflare Workers Builds**:
   - In the [Cloudflare Dashboard](https://dash.cloudflare.com/), go to **Workers & Pages** > **enerpackhr** (or create a new Worker connected to your Git repository).
   - Set the build settings:
     - **Build command**: `bun run build` (or `npm run build`)
     - **Deploy command**: `npx wrangler deploy`
     - **Root directory**: `/`
   - Wrangler automatically uses `wrangler.jsonc`, which serves the `./dist` assets with native SPA routing (`assets.not_found_handling = "single-page-application"`).

3. **Alternative: Cloudflare Pages**:
   - In Cloudflare Dashboard, create a **Pages** project connected to the Git repository.
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`

---

## 🔒 Firebase Configuration & Authorized Domains

The application automatically reads Firebase credentials from `firebase-applet-config.json`.

Optionally, you can set the following environment variables in the Cloudflare Dashboard (**Settings** > **Variables**):
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FIRESTORE_DATABASE_ID`

### Firebase Authorized Domains
For Google Authentication to work seamlessly:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication** > **Settings** > **Authorized domains**.
3. Add your deployment domains:
   - `enerpackhr.enerpack.workers.dev`
   - `[your-project-name].pages.dev`
   - Any custom domain (e.g., `hr.enerpack.com`)

---

## 🛠️ GitHub Actions CI

A GitHub Actions workflow is provided at `.github/workflows/ci.yml`. On every push or pull request to `main` or `master`:
- Installs dependencies using `bun install --frozen-lockfile`
- Runs typecheck and linting (`bun run lint`)
- Executes production build (`bun run build`)
- Verifies that all production assets and `dist/index.html` are generated successfully

---

## 💻 Local Development

```bash
# Install dependencies
bun install
# or
npm install

# Start development server on port 3000
bun run dev
# or
npm run dev

# Run type checking
bun run lint

# Build for production
bun run build

# Dry-run Cloudflare Worker deployment
npx wrangler deploy --dry-run
```
