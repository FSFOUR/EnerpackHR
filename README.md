# Enerpack HR - Enterprise HR & Fleet Management System

A comprehensive Human Resource & Workforce Management System with biometric attendance simulation, live Vehicle Tracker, document vault, and Firebase Authentication.

## Cloudflare Pages Deployment Guide (via GitHub)

This application is fully optimized for **Cloudflare Pages** deployment with zero configuration errors:

### 1. Push to GitHub
Export or push this repository to your GitHub account.

### 2. Connect to Cloudflare Pages
1. Log in to your [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Navigate to **Compute (Workers & Pages)** > **Create application** > **Pages** > **Connect to Git**.
3. Select your GitHub repository (`enerpack-hr`).

### 3. Build & Deployment Settings
Configure the build settings as follows:
- **Framework preset**: `Vite`
- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Root directory**: `/` (leave blank or default)

### 4. SPA Routing & Caching (Pre-configured)
- `public/_redirects` is already configured (`/* /index.html 200`) to guarantee that all subroutes (`/attendance`, `/leave`, `/fleet`, `/users`, etc.) reload seamlessly without 404 errors.
- `public/_headers` is already configured for security headers and asset caching.
- `.node-version` and `.nvmrc` are pre-set to `20.18.0` to ensure Cloudflare Pages builds with modern Node.js 20 LTS.

### 5. Firebase Configuration
The application automatically reads Firebase credentials from `firebase-applet-config.json`.
Alternatively, you can set the following optional environment variables in the Cloudflare Pages project settings:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_FIRESTORE_DATABASE_ID`

## Local Development
```bash
npm install
npm run dev
```

Build for production:
```bash
npm run build
```
