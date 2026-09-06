# Cloudflare Pages Deployment Guide for ENERPACK HR

ENERPACK HR is fully optimized for zero-configuration, lightning-fast deployment on **Cloudflare Pages**.

---

## 🚀 Quick Deployment Options

### Option 1: Git-Connected Cloudflare Pages (Recommended)

1. Push your repository to GitHub or GitLab.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/):
   - Navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
   - Select your repository.
3. Configure the **Build settings**:
   - **Framework preset**: `Vite` (or `None`)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Root directory**: `/` (default)
4. Under **Environment variables (Advanced)**, add your Node version:
   - `NODE_VERSION`: `22` (or `20`)
5. Click **Save and Deploy**.

---

### Option 2: Direct Deployment via Wrangler CLI

Deploy directly from your terminal using Wrangler:

```bash
# 1. Build the production application
npm run build

# 2. Deploy to Cloudflare Pages
npm run deploy:pages
```

Or deploy directly via:
```bash
npx wrangler pages deploy dist --project-name=enerpack-hr
```

---

## 🔑 Firebase Configuration on Cloudflare Pages

To connect your live Cloudflare Pages URL with your Firebase backend:

### 1. Add Environment Variables in Cloudflare Pages
In Cloudflare Dashboard > **Workers & Pages** > Select your project > **Settings** > **Environment variables**:

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

### 2. Authorize Cloudflare Domain in Firebase Console
For Google Sign-In and popup authentication to work on your Cloudflare domain:
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Navigate to **Authentication** > **Settings** > **Authorized domains**.
3. Click **Add domain** and add:
   - `[your-project-name].pages.dev` (e.g. `enerpack-hr.pages.dev`)
   - Your custom domain (e.g. `hr.enerpack.com`) if configured.

---

## 🛠️ Built-in Cloudflare Optimizations

The codebase includes the following files pre-configured for Cloudflare Pages:

- **`public/_redirects`**: Configures single-page application routing (`/* /index.html 200`) so deep routes (`/employees`, `/attendance`, `/tasks`, `/fleet`) resolve properly on browser refresh without 404s.
- **`public/_headers`**:
  - Security headers (`X-Content-Type-Options: nosniff`, `Referrer-Policy`, `X-Frame-Options: SAMEORIGIN`).
  - `Cross-Origin-Opener-Policy: same-origin-allow-popups` ensuring Google OAuth popups authenticate seamlessly.
  - Immediate revalidation (`Cache-Control: no-cache, must-revalidate`) for `index.html` to guarantee instant deployment rollout.
  - 1-year immutable caching (`max-age=31536000, immutable`) for fingerprinted JS, CSS, and font assets.
- **`public/404.html`**: Dual-layer client-side route recovery for edge-level cache misses.
- **`vite.config.ts`**: Optimized `manualChunks` splitting Vendor, Firebase, Lucide, Recharts, and jsPDF into independent cacheable bundles for fast edge delivery.
