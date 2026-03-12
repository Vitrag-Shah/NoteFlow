# 🚀 Deployment Guide: NoteFlow

This guide provides the exact steps to deploy your full-stack Notes Manager.

## 1. Backend Deployment (Render)

1.  **Create a New Web Service**: Connect your GitHub repository to Render.
2.  **Root Directory**: `server`
3.  **Environment**: `Node`
4.  **Build Command**: `npm install && npx prisma generate`
5.  **Start Command**: `npm start`
6.  **Environment Variables**:
    -   `DATABASE_URL`: `postgresql://neondb_owner:npg_O0sGCcRJ2rzo@ep-polished-meadow-a1miya8s-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
    -   `JWT_SECRET`: `your_secure_random_string`
    -   `PORT`: `5000`
    -   `NODE_ENV`: `production`
    -   `CLIENT_URL`: `https://your-frontend-url.vercel.app` (Add this after Vercel deployment)

---

## 2. Frontend Deployment (Vercel)

1.  **Install Vercel CLI** (Optional): `npm install -g vercel`
2.  **Deploy from Terminal**:
    ```bash
    cd client
    vercel --prod
    ```
3.  **Project Settings (Manual Upload)**:
    -   **Framework Preset**: `Vite`
    -   **Root Directory**: `client`
    -   **Build Command**: `npm run build`
    -   **Output Directory**: `dist`
4.  **Environment Variables**:
    -   `VITE_API_URL`: `https://your-backend-url.onrender.com` (Your Render URL)

---

## 3. Post-Deployment Linking

After both are deployed:
1.  Go to **Render Dashboard** → Your Service → Environment.
2.  Update `CLIENT_URL` to your actual Vercel domain.
3.  Go to **Vercel Dashboard** → Your Project → Settings → Environment Variables.
4.  Ensure `VITE_API_URL` points to your Render URL.
5.  Redeploy the Frontend.

---

## ✅ Final Production Checklist
- [ ] Database migrated (`npx prisma migrate deploy` happens in Render build command via `generate` if configured or run manually).
- [ ] JWT Secret is unique and long.
- [ ] CORS `CLIENT_URL` matches the frontend exactly.
