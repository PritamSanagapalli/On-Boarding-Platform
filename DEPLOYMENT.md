# 🚀 Production Deployment Guide — Employee Onboarding Portal

> **Complete end-to-end deployment instructions for Railway (backend + database) and Vercel (frontend)**

---

## Table of Contents

1. [Project Credentials (Handy Reference)](#0-project-credentials-handy-reference)
1. [Architecture Overview](#1-architecture-overview)
2. [Pre-Deployment Checklist](#2-pre-deployment-checklist)
...
---

## 0. Project Credentials (Handy Reference)

Use these exact values when setting up your **Railway Backend Service** variables:

| Variable Name | Value |
| :--- | :--- |
| `DB_URL` | `jdbc:mysql://monorail.proxy.rlwy.net:14838/railway?useSSL=true&serverTimezone=UTC` |
| `DB_USERNAME` | `root` |
| `DB_PASSWORD` | `MRPTZydRMUcVRbRTnLNrTGZnSSfEracT` |
| `SPRING_PROFILES_ACTIVE` | `prod` |
| `DDL_AUTO` | `update` |
| `FIREBASE_CONFIG` | *(Copy the Base64 string from your terminal)* |

---
3. [Step 1: Database Deployment (Railway MySQL)](#3-step-1-database-deployment-railway-mysql)
4. [Step 2: Backend Deployment (Railway)](#4-step-2-backend-deployment-railway)
5. [Step 3: Frontend Deployment (Vercel)](#5-step-3-frontend-deployment-vercel)
6. [Step 4: Firebase Production Setup](#6-step-4-firebase-production-setup)
7. [Step 5: Final Integration & Wiring](#7-step-5-final-integration--wiring)
8. [Production Hardening](#8-production-hardening)
9. [Common Errors & Fixes](#9-common-errors--fixes)
10. [Final Test Checklist](#10-final-test-checklist)
11. [Environment Variable Reference](#11-environment-variable-reference)

---

## 1. Architecture Overview

```
┌─────────────────────┐       HTTPS        ┌──────────────────────┐       JDBC        ┌─────────────────┐
│                     │  ───────────────▶   │                      │  ──────────────▶  │                 │
│   React Frontend    │                     │   Spring Boot API    │                    │   MySQL (Cloud) │
│   (Vercel)          │  ◀───────────────   │   (Railway)          │  ◀──────────────  │   (Railway)     │
│                     │    JSON responses   │                      │    query results   │                 │
└─────────┬───────────┘                     └──────────┬───────────┘                    └─────────────────┘
          │                                            │
          │  Firebase ID Token                         │  Verify Token
          │  (Authorization: Bearer <token>)           │
          ▼                                            ▼
┌─────────────────────┐                     ┌──────────────────────┐
│   Firebase Auth     │◀────────────────────│  Firebase Admin SDK  │
│   (Google Login)    │   Token verification│  (in Spring Boot)    │
└─────────────────────┘                     └──────────────────────┘
```

**Data Flow:**
1. User clicks "Sign in with Google" → Firebase handles OAuth popup
2. Firebase returns an ID token to the frontend
3. Frontend sends token to `POST /api/auth/google` → Backend verifies with Firebase Admin SDK
4. Backend returns user data → Frontend stores user context
5. All subsequent API calls include `Authorization: Bearer <firebase-token>` header
6. Backend's `FirebaseTokenFilter` verifies the token on every request

---

## 2. Pre-Deployment Checklist

Before you begin, ensure you have:

- [ ] A [GitHub](https://github.com) account with your code pushed
- [ ] A [Railway](https://railway.app) account (free tier: $5/month credit — sufficient for this project)
- [ ] A [Vercel](https://vercel.com) account (free tier — sufficient)
- [ ] Access to your [Firebase Console](https://console.firebase.google.com)
- [ ] Your `firebase-service-account.json` file (from Firebase Console)

### Push Code to GitHub

```bash
cd /Users/pritam/Documents/HCL-Assignment
git add -A
git commit -m "Production-ready: document verification + deployment config"
git push origin main
```

---

## 3. Step 1: Database Deployment (Railway MySQL)

### 3.1 Create Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click **"New Project"** → **"Empty Project"**
3. Name it: `onboarding-portal`

### 3.2 Add MySQL Database

1. Inside your project, click **"+ New"** → **"Database"** → **"MySQL"**
2. Railway will provision a MySQL 8 instance (takes ~30 seconds)
3. Click the MySQL service card to open its settings

### 3.3 Get Connection Details

1. Go to the **"Variables"** tab of the MySQL service
2. You will see these auto-generated variables:

| Variable | Example Value |
|----------|--------------|
| `MYSQL_HOST` | `roundhouse.proxy.rlwy.net` |
| `MYSQL_PORT` | `12345` |
| `MYSQL_DATABASE` | `railway` |
| `MYSQL_USER` | `root` |
| `MYSQL_PASSWORD` | `aBcDeFgHiJkLmNoP` |

3. **Construct your JDBC URL:**

```
jdbc:mysql://roundhouse.proxy.rlwy.net:12345/railway?useSSL=true&serverTimezone=UTC
```

> **⚠️ Important:** Use `useSSL=true` for cloud databases (NOT `useSSL=false` like local dev). Remove `allowPublicKeyRetrieval=true` as it's a security risk in production.

### 3.4 Save These Values

You'll need them in Step 2. Write them down:

```
DB_URL=jdbc:mysql://<MYSQL_HOST>:<MYSQL_PORT>/<MYSQL_DATABASE>?useSSL=true&serverTimezone=UTC
DB_USERNAME=<MYSQL_USER>
DB_PASSWORD=<MYSQL_PASSWORD>
```

---

## 4. Step 2: Backend Deployment (Railway)

### 4.1 Prepare Firebase Credentials

The backend needs your Firebase service account to verify login tokens. For production, we encode it as a base64 string (so the JSON file doesn't need to ship with the container).

**Run this on your Mac:**

```bash
# Encode your firebase service account as base64 (single line)
base64 -i backend/src/main/resources/firebase-service-account.json | tr -d '\n'
```

**Copy the entire output** — it will be a long string like `eyJ0eXBlIjoic2Vydm...`. You'll paste this as the `FIREBASE_CONFIG` environment variable.

### 4.2 Add Backend Service to Railway

1. In your Railway project, click **"+ New"** → **"GitHub Repo"**
2. Select your repository (`HCL-Assignment` or whatever it's named)
3. Railway will detect it and start building

### 4.3 Configure Build Settings

1. Click the new service → **"Settings"** tab
2. Set these configuration values:

| Setting | Value |
|---------|-------|
| **Root Directory** | `backend` |
| **Builder** | `Dockerfile` (Railway auto-detects it) |
| **Start Command** | *(leave empty — Dockerfile handles it)* |

> If Railway doesn't auto-detect the Dockerfile, select `Dockerfile` as the builder and set the Dockerfile path to `Dockerfile`.

### 4.4 Set Environment Variables

Go to the **"Variables"** tab and add ALL of these:

```properties
# Database (use values from Step 1)
DB_URL=jdbc:mysql://roundhouse.proxy.rlwy.net:12345/railway?useSSL=true&serverTimezone=UTC
DB_USERNAME=root
DB_PASSWORD=<your-mysql-password>

# Spring profile
SPRING_PROFILES_ACTIVE=prod

# Hibernate — use "update" for FIRST deployment (creates tables), then change to "validate"
DDL_AUTO=update

# Firebase (the base64 string from Step 4.1)
FIREBASE_CONFIG=<paste-your-base64-encoded-json-here>

# CORS — will be updated after frontend is deployed (Step 3)
CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app

# Port — Railway sets this automatically, but add it for safety
PORT=8080

# Logging (production)
LOG_LEVEL=INFO
SECURITY_LOG_LEVEL=WARN
SHOW_SQL=false
```

### 4.5 Link MySQL Variables (Optional Shorthand)

Railway allows you to reference variables from other services:

```
DB_URL=jdbc:mysql://${{MySQL.MYSQL_HOST}}:${{MySQL.MYSQL_PORT}}/${{MySQL.MYSQL_DATABASE}}?useSSL=true&serverTimezone=UTC
DB_USERNAME=${{MySQL.MYSQL_USER}}
DB_PASSWORD=${{MySQL.MYSQL_PASSWORD}}
```

This auto-syncs if the MySQL service changes.

### 4.6 Deploy

1. Click **"Deploy"** (or it auto-deploys on push)
2. Watch the build logs — it should:
   - Build the Maven project
   - Create the Docker image
   - Start the Spring Boot application
3. Build takes ~3-5 minutes on first deploy

### 4.7 Generate Public URL

1. Go to **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. You'll get a URL like: `https://onboarding-backend-production.up.railway.app`
4. **Save this URL** — needed for frontend config

### 4.8 Verify Backend is Running

Open in browser:

```
https://onboarding-backend-production.up.railway.app/api/auth/health
```

Expected response:
```json
{
  "success": true,
  "message": "Service is healthy",
  "data": "UP"
}
```

### 4.9 After First Successful Deploy

Once tables are created and data is flowing:

1. Go to Railway → Backend service → Variables
2. Change `DDL_AUTO` from `update` to `validate`
3. Redeploy — this prevents Hibernate from accidentally modifying your schema

---

## 5. Step 3: Frontend Deployment (Vercel)

### 5.1 Import Project

1. Go to [vercel.com](https://vercel.com) → **"Add New"** → **"Project"**
2. Click **"Import Git Repository"** → Select your repo
3. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` (auto-detected) |
| **Output Directory** | `dist` (auto-detected) |

### 5.2 Set Environment Variables

In the Vercel project settings → **"Environment Variables"**, add:

```properties
# Backend API URL (your Railway backend URL from Step 4.7)
VITE_API_URL=https://onboarding-backend-production.up.railway.app/api

# Firebase Config (these are PUBLIC client-side keys — safe to expose)
VITE_FIREBASE_API_KEY=AIzaSyD1Xoi0LS1g5QBh1kbPjmfTlF3Klg0JJx8
VITE_FIREBASE_AUTH_DOMAIN=onboarding-portal-95c2b.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=onboarding-portal-95c2b
VITE_FIREBASE_STORAGE_BUCKET=onboarding-portal-95c2b.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=930068310789
VITE_FIREBASE_APP_ID=1:930068310789:web:1da7e25a19baf5c710256c
```

> **⚠️ CRITICAL:** The `VITE_API_URL` must NOT have a trailing slash. 
> ✅ Correct: `https://backend.up.railway.app/api`
> ❌ Wrong: `https://backend.up.railway.app/api/`

### 5.3 Deploy

1. Click **"Deploy"**
2. Vercel will build and deploy in ~30-60 seconds
3. You'll get a URL like: `https://onboarding-portal.vercel.app`

### 5.4 Update Backend CORS

Now that you have your frontend URL, go back to Railway:

1. Railway → Backend service → **Variables**
2. Update `CORS_ALLOWED_ORIGINS`:

```
CORS_ALLOWED_ORIGINS=https://onboarding-portal.vercel.app
```

If you also have a custom domain, include both (comma-separated, no spaces):

```
CORS_ALLOWED_ORIGINS=https://onboarding-portal.vercel.app,https://yourdomain.com
```

3. Railway will auto-redeploy

### 5.5 Handle SPA Routing

Vercel handles client-side routing for Vite/React automatically. If you face 404 errors on page refresh, add this to your project:

Create `frontend/vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 6. Step 4: Firebase Production Setup

### 6.1 Add Authorized Domains

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project → **"Authentication"** → **"Settings"**
3. Scroll to **"Authorized domains"**
4. Click **"Add domain"** and add:
   - `onboarding-portal.vercel.app` (your Vercel domain)
   - Any custom domain you plan to use

> Without this step, Google login will show error: `"auth/unauthorized-domain"`

### 6.2 Verify Google Sign-In Provider

1. **"Authentication"** → **"Sign-in method"**
2. Ensure **"Google"** is **Enabled**
3. Ensure **"Project support email"** is set (required for Google login)

### 6.3 Firebase Service Account Key

If you don't already have `firebase-service-account.json`:

1. Firebase Console → **"Project Settings"** (gear icon)
2. **"Service accounts"** tab
3. Click **"Generate new private key"**
4. Save the downloaded JSON file
5. This is what you base64-encode for `FIREBASE_CONFIG`

---

## 7. Step 5: Final Integration & Wiring

### How the Components Connect

```
User Browser
    │
    ├──▶ https://onboarding-portal.vercel.app (Vercel — static React app)
    │         │
    │         ├──▶ Firebase Auth (Google OAuth popup)
    │         │         └── Returns Firebase ID token
    │         │
    │         └──▶ https://backend.up.railway.app/api/* (Railway — Spring Boot)
    │                   │     (Authorization: Bearer <firebase-token>)
    │                   │
    │                   ├──▶ FirebaseTokenFilter verifies token
    │                   ├──▶ Looks up user in MySQL (Railway)
    │                   └──▶ Returns JSON response
    │
    └──◀ Response displayed in browser
```

### Integration Verification Steps

**Step 1: Health Check**
```
GET https://your-backend.up.railway.app/api/auth/health
→ Should return: {"success":true,"data":"UP"}
```

**Step 2: Open Frontend**
```
Navigate to: https://onboarding-portal.vercel.app
→ Should show login page without console errors
```

**Step 3: Login**
```
Click "Sign in with Google"
→ Google popup should appear
→ After login, should redirect to dashboard
→ Check Network tab: POST /api/auth/google returns 200
```

**Step 4: API Calls**
```
Navigate to Tasks page
→ Check Network tab: GET /api/tasks returns 200
→ Check Authorization header is present on requests
```

---

## 8. Production Hardening

### 8.1 Environment Variables — No Hardcoding

**Already configured in our codebase:**

| What | Where | How |
|------|-------|-----|
| DB credentials | `application.properties` | `${DB_URL:default}` pattern |
| Firebase config | `FirebaseConfig.java` | `FIREBASE_CONFIG` env var (base64) |
| CORS origins | `CorsConfig.java` | `${CORS_ALLOWED_ORIGINS}` |
| API base URL | `api.js` | `import.meta.env.VITE_API_URL` |
| Firebase keys | `firebase.js` | `import.meta.env.VITE_FIREBASE_*` |

### 8.2 CORS Configuration

Our `CorsConfig.java` handles:
- ✅ Only allows specified origins (not `*`)
- ✅ Credentials support enabled
- ✅ Pre-flight cache: 3600 seconds
- ✅ Only applies to `/api/**` routes

### 8.3 Security

- ✅ Stateless sessions (no server-side session state)
- ✅ Firebase token verification on every request
- ✅ Role-based access control (`@PreAuthorize("hasRole('ADMIN')")`)
- ✅ Service-level authorization checks (defense-in-depth)
- ✅ Non-root Docker user
- ✅ Firebase service account never committed to git

### 8.4 Error Handling

Global exception handler (`GlobalExceptionHandler.java`) catches:
- `ResourceNotFoundException` → 404
- `UnauthorizedException` → 403
- `InvalidStateTransitionException` → 409
- `MethodArgumentNotValidException` → 400
- `IllegalArgumentException` → 400
- `Exception` (catch-all) → 500

All responses use consistent `ApiResponse<T>` format:
```json
{
  "success": false,
  "message": "Human-readable error message",
  "data": null
}
```

### 8.5 Logging

| Environment | Level | SQL Logging |
|-------------|-------|-------------|
| Development | DEBUG | Enabled |
| Production | INFO | Disabled |

Production profile (`application-prod.properties`) enforces:
- `spring.jpa.show-sql=false`
- `logging.level.com.onboarding=INFO`
- `spring.jpa.hibernate.ddl-auto=validate`

---

## 9. Common Errors & Fixes

### Error: CORS — "Access-Control-Allow-Origin" missing

**Cause:** Backend CORS doesn't include frontend URL.

**Fix:**
1. Railway → Backend Variables
2. Set `CORS_ALLOWED_ORIGINS=https://your-frontend.vercel.app` (exact domain, no trailing slash)
3. Redeploy

---

### Error: Firebase "auth/unauthorized-domain"

**Cause:** Frontend domain not added to Firebase authorized domains.

**Fix:**
1. Firebase Console → Authentication → Settings → Authorized domains
2. Add `your-app.vercel.app`

---

### Error: "Data truncated for column 'status'"

**Cause:** MySQL ENUM column doesn't include new values (APPROVED/REJECTED).

**Fix:** Connect to your cloud MySQL and run:
```sql
ALTER TABLE documents MODIFY COLUMN status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
```

For Railway MySQL, you can use Railway's built-in query tool or connect via a MySQL client.

---

### Error: "No static resource api/..."

**Cause:** Backend code is outdated — the endpoint doesn't exist in the running version.

**Fix:** Ensure the latest code is deployed. Check Railway build logs.

---

### Error: 401 Unauthorized on all API calls

**Cause:** Firebase Admin SDK not initialized (missing or invalid service account).

**Fix:**
1. Verify `FIREBASE_CONFIG` env var contains valid base64
2. Check Railway logs for: `"Firebase Admin SDK initialized successfully"`
3. Re-encode: `base64 -i firebase-service-account.json | tr -d '\n'`

---

### Error: "Failed to fetch" / Network errors in frontend

**Cause:** `VITE_API_URL` is wrong or missing.

**Fix:**
1. Vercel → Project Settings → Environment Variables
2. Verify `VITE_API_URL` = `https://your-backend.up.railway.app/api`
3. **Redeploy** (env vars in Vite are baked into the build — changing them requires a new deployment)

---

### Error: 502 Bad Gateway on Railway

**Cause:** App crashed on startup.

**Fix:**
1. Check Railway deployment logs
2. Most common: Wrong `DB_URL` or database not accessible
3. Verify MySQL service is running

---

### Error: File uploads don't persist after redeployment

**Cause:** Railway containers are ephemeral — files stored on disk are lost on redeploy.

**Fix:** For production, consider:
- Using Firebase Storage or AWS S3 for file uploads
- The current local file storage works but files are lost on container restart
- This is acceptable for a demo but not for long-term production use

---

## 10. Final Test Checklist

After deployment, verify each item:

### Authentication
- [ ] Login page loads at `https://your-app.vercel.app/login`
- [ ] "Sign in with Google" button opens Google popup
- [ ] After login, user is redirected to `/dashboard`
- [ ] User name and profile picture appear in navbar
- [ ] Logout works and redirects to login

### Dashboard
- [ ] Admin dashboard shows employee stats
- [ ] Employee dashboard shows task stats and document counts
- [ ] Progress ring animates
- [ ] Quick action links work

### Tasks (if applicable)
- [ ] Admin can create tasks
- [ ] Employee can view assigned tasks
- [ ] Task status updates work

### Documents
- [ ] Admin can create document requests
- [ ] Employee can upload and submit documents
- [ ] Admin sees "Review & Verify" button on submitted docs
- [ ] Admin can approve documents (status changes to APPROVED ✅)
- [ ] Admin can reject documents with feedback
- [ ] Employee sees approval/rejection status and admin feedback
- [ ] File preview/download links work

### Data Persistence
- [ ] Create a task, refresh the page — task is still there
- [ ] Submit a document, refresh — still submitted
- [ ] Approve a document, log out and back in — still approved

### Error Handling
- [ ] No console errors in browser
- [ ] API errors show user-friendly toast messages
- [ ] 404 routes redirect to dashboard

---

## 11. Environment Variable Reference

### Backend (Railway)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DB_URL` | ✅ | JDBC MySQL connection string | `jdbc:mysql://host:port/db?useSSL=true&serverTimezone=UTC` |
| `DB_USERNAME` | ✅ | MySQL username | `root` |
| `DB_PASSWORD` | ✅ | MySQL password | `aBcDeFgH` |
| `FIREBASE_CONFIG` | ✅ | Base64 Firebase service account JSON | `eyJ0eXBl...` |
| `SPRING_PROFILES_ACTIVE` | ✅ | Active Spring profile | `prod` |
| `DDL_AUTO` | ✅ | Hibernate DDL mode | `update` → then `validate` |
| `CORS_ALLOWED_ORIGINS` | ✅ | Allowed frontend URLs (comma-sep) | `https://app.vercel.app` |
| `PORT` | ✅ | Server port | `8080` |
| `LOG_LEVEL` | ⬜ | App log level | `INFO` |
| `SECURITY_LOG_LEVEL` | ⬜ | Security log level | `WARN` |
| `SHOW_SQL` | ⬜ | Show SQL queries | `false` |
| `FILE_UPLOAD_DIR` | ⬜ | Upload directory | `uploads` |

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_API_URL` | ✅ | Backend API base URL | `https://backend.up.railway.app/api` |
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase Web API key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID | `my-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase storage bucket | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | Messaging sender ID | `123456789` |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID | `1:123:web:abc` |

---

## Quick Deploy Summary

```
1. Railway: Create project → Add MySQL → Note credentials
2. Railway: Add backend from GitHub → Set root=backend → Add env vars → Deploy
3. Railway: Generate public URL → Test /api/auth/health
4. Vercel: Import frontend from GitHub → Set root=frontend → Add env vars → Deploy
5. Railway: Update CORS_ALLOWED_ORIGINS with Vercel URL
6. Firebase: Add Vercel domain to authorized domains
7. Test: Login → Dashboard → Tasks → Documents → Verify
```
