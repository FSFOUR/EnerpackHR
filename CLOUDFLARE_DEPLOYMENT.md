# Cloudflare Workers Deployment Guide for ENERPACK HR

ENERPACK HR is configured and optimized for **Cloudflare Workers Builds** (serving static assets with edge single-page application routing) for the production Worker project `enerpackhr`.

Production URL: `https://enerpackhr.enerpack.workers.dev/`

---

## 🚀 Cloudflare Workers Builds Configuration (Recommended)

In the [Cloudflare Dashboard](https://dash.cloudflare.com/) under **Workers & Pages** > **Workers Builds** > **enerpackhr**:

### Build & Deployment Settings:
- **Build command**: `bun run build` (or `npm run build`)
- **Deploy command**: `npx wrangler deploy`
- **Root directory**: `/`
- **Node version**: `22` (or `>=20`)
- **Package Manager**: Bun (`bun install --frozen-lockfile`) or npm

The deployment uses `wrangler.jsonc`, which instructs Cloudflare Workers to serve the built Vite output (`dist/`) directly from Cloudflare's edge network using native SPA routing:
```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "enerpackhr",
  "compatibility_date": "2026-09-03",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "single-page-application"
  },
  "observability": {
    "enabled": true
  }
}
```

---

## 🔑 Firebase Configuration on Cloudflare

To connect your live Cloudflare Workers URL with your Firebase backend:

### 1. Add Environment Variables in Cloudflare
In Cloudflare Dashboard > **Workers & Pages** > **enerpackhr** > **Settings** > **Variables**:

| Variable | Description |
|---|---|
| `VITE_FIREBASE_API_KEY` | Your Firebase Web API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | `[project-id].firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | `[project-id].firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Numeric Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Web App ID (`1:xxx:web:xxx`) |
| `VITE_FIREBASE_FIRESTORE_DATABASE_ID` | Firestore Database ID (if using custom DB) |

*Note: If `firebase-applet-config.json` is committed in your repository, ENERPACK HR automatically falls back to it if environment variables are not set.*

### 2. Authorize Domain in Firebase Console
For Google Sign-In and popup authentication to work on your Cloudflare domain:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication** > **Settings** > **Authorized domains**.
3. Click **Add domain** and add:
   - `enerpackhr.enerpack.workers.dev`
   - Any custom domain (e.g. `hr.enerpack.com`) if configured.

---

## 🛠️ Built-in Edge & SPA Optimizations

The codebase includes the following configurations pre-set:

- **Native SPA Routing (`wrangler.jsonc`)**: Configures single-page application routing (`not_found_handling: "single-page-application"`). Deep routes (`/employees`, `/attendance`, `/tasks`, `/fleet`, `/employees?action=new`) resolve cleanly on browser refresh without 404s.
- **`public/_headers`**:
  - Security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`).
  - `Cross-Origin-Opener-Policy: same-origin-allow-popups` ensuring Google OAuth popups authenticate seamlessly.
  - Immediate revalidation (`Cache-Control: no-cache, must-revalidate`) for `index.html` to guarantee instant deployment rollout.
  - 1-year immutable caching (`max-age=31536000, immutable`) for fingerprinted JS, CSS, and font assets.
- **`public/404.html`**: Dual-layer client-side route recovery for edge-level cache misses.
- **`vite.config.ts`**: Optimized `manualChunks` splitting Vendor, Firebase, Lucide, Recharts, and jsPDF into independent cacheable bundles for fast edge delivery.
