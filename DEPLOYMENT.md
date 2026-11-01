# StayNest — Production Deployment Guide & Checklist

This document provides complete, step-by-step instructions for deploying the full-stack **StayNest** MERN application to cloud production infrastructure.

---

## 📋 Required Cloud Provider Accounts

To deploy StayNest, you will need free accounts on the following platforms:

1. **MongoDB Atlas** ([mongodb.com](https://www.mongodb.com/cloud/atlas)) — Cloud Database (Free M0 Sandbox cluster)
2. **Render** ([render.com](https://render.com)) — Express.js REST API Backend Hosting (Free Web Service)
3. **Vercel** ([vercel.com](https://vercel.com)) — React/Vite Frontend Hosting (Free Hobby Tier)
4. **Cloudinary** ([cloudinary.com](https://cloudinary.com)) *(Optional but Recommended)* — Persistent Cloud Image Storage

---

## 🗄️ Step 1: Set Up MongoDB Atlas

1. **Create an Account & Project**:
   - Sign in to [MongoDB Atlas](https://account.mongodb.com/).
   - Create a new project named `staynest-prod`.

2. **Deploy a Free Cluster**:
   - Click **Create Deployment** → choose the **M0 Free Tier**.
   - Select your preferred cloud provider (AWS/GCP) and region (e.g., `ap-south-1` Mumbai or `us-east-1` N. Virginia).
   - Click **Create Cluster**.

3. **Configure Database Access (Credentials)**:
   - Under **Security** → **Database Access** → click **Add New Database User**.
   - Authentication Method: **Password**.
   - Username: `staynest_admin` (or your choice).
   - Password: Click **Autogenerate Secure Password** and copy it safely.
   - Database User Privileges: **Read and write to any database** (`readWriteAnyDatabase`).

4. **Configure Network Access (Firewall / IP Allowlist)**:
   - Under **Security** → **Network Access** → click **Add IP Address**.
   - Select **Allow Access from Anywhere** (`0.0.0.0/0`).
   - *(Required because Render services use dynamic IP addresses).*
   - Confirm and save.

5. **Obtain Connection String**:
   - Go to **Database Deployments** → click **Connect**.
   - Choose **Drivers** (Node.js).
   - Copy the SRV connection string:
     ```
     mongodb+srv://staynest_admin:<db_password>@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
     ```
   - Replace `<db_password>` with your database user password and specify the database name `staynest`:
     ```
     mongodb+srv://staynest_admin:YOUR_PASSWORD@cluster0.xxxx.mongodb.net/staynest?retryWrites=true&w=majority
     ```

---

## ☁️ Step 2: Set Up Cloudinary (Image Hosting)

1. Sign up or log in to [Cloudinary Console](https://console.cloudinary.com/).
2. On your **Dashboard**, find your **Product Environment Credentials**:
   - **Cloud Name** (`dxxxxxx`)
   - **API Key** (`123456789012345`)
   - **API Secret** (`abcdefghijklmnopqrstuvwxyz`)
3. Note: If you choose to omit Cloudinary credentials, StayNest will gracefully fall back to local disk storage and the 28 pre-loaded high-resolution CDN images.

---

## 🚀 Step 3: Deploy the Express Backend to Render

### Option A: Using Render Blueprint (`render.yaml`)
1. Push your code to your GitHub / GitLab repository.
2. In the [Render Dashboard](https://dashboard.render.com/), click **New** → **Blueprint**.
3. Connect your repository. Render will automatically detect the bundled `render.yaml` file.
4. Fill in the required environment variables:
   - `MONGODB_URI`: Your MongoDB Atlas connection string.
   - `CLIENT_URL`: Your Vercel frontend URL (can be set to `*` or your expected Vercel domain `https://staynest.vercel.app`).
   - `CLOUDINARY_*`: (Optional) Your Cloudinary credentials.
5. Click **Apply**.

### Option B: Manual Web Service Setup on Render
1. In Render Dashboard, click **New** → **Web Service**.
2. Connect your Git repository.
3. Configure the service settings:
   - **Name**: `staynest-api`
   - **Region**: Choose closest to your database (e.g. Frankfurt, Singapore, Oregon).
   - **Branch**: `master` or `main`.
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan Type**: `Free`
4. Add **Environment Variables** in the Environment tab:
   | Key | Value | Description |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production optimizations & error handling |
   | `PORT` | `10000` | Port automatically assigned by Render |
   | `MONGODB_URI` | `mongodb+srv://.../staynest` | MongoDB Atlas SRV URI |
   | `JWT_SECRET` | `generate-random-secret-key-at-least-32-chars` | Secure random secret string |
   | `JWT_EXPIRES_IN` | `7d` | Token lifetime |
   | `CLIENT_URL` | `https://staynest.vercel.app` | Allowed CORS origin (comma-separated for multiples) |
   | `SEED_DEMO_DATA` | `true` | Auto-populates 28 demo listings on first boot |
   | `CLOUDINARY_CLOUD_NAME` | *(optional)* | Cloudinary cloud name |
   | `CLOUDINARY_API_KEY` | *(optional)* | Cloudinary API key |
   | `CLOUDINARY_API_SECRET` | *(optional)* | Cloudinary API secret |
5. Click **Create Web Service**.
6. Wait for the build to finish. Once live, note your backend URL:
   `https://staynest-api.onrender.com`
7. Verify the health check in your browser:
   `https://staynest-api.onrender.com/api/health`

---

## ⚡ Step 4: Deploy the React Frontend to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository.
4. Configure the Project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click `Edit` and select `client` (or leave as root if using root `vercel.json`).
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Configure **Environment Variables**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://staynest-api.onrender.com/api` |
6. Click **Deploy**.
7. Vercel will compile the application and assign a production URL (e.g. `https://staynest.vercel.app`).
8. The included `vercel.json` rewrite rules ensure client-side SPA routing (`/properties/:id`, `/bookings`, `/host/dashboard`) works on page refresh.

---

## 🔄 Step 5: Connect & Finalize CORS

1. Go back to your **Render Dashboard** → `staynest-api` → **Environment**.
2. Ensure `CLIENT_URL` matches your exact Vercel production URL:
   ```
   CLIENT_URL=https://staynest.vercel.app
   ```
   *(If you also want to test preview deployments, you can add multiple comma-separated URLs: `https://staynest.vercel.app,http://localhost:5173`).*
3. Render will automatically redeploy the backend with the new CORS policy.

---

## 🌱 Step 6: Database Seeding Options

StayNest provides two flexible methods to seed the 28 demonstration properties and demo accounts:

### Method 1: Automatic Bootstrap (Recommended)
By setting `SEED_DEMO_DATA=true` or `AUTO_SEED=true` in Render environment variables, the server will automatically seed the 28 listings on initial boot if the database is empty.

### Method 2: Manual CLI Seeding from Local Terminal
You can run the safe seed script directly against your MongoDB Atlas cluster from your computer:
```bash
# Set your Atlas URI in your terminal (PowerShell example)
$env:MONGODB_URI="mongodb+srv://staynest_admin:YOUR_PASSWORD@cluster0.xxxx.mongodb.net/staynest?retryWrites=true&w=majority"
node server/scripts/seed.js
```
The script uses idempotent upserts so it never creates duplicates and preserves existing users and bookings.

---

## ✅ Step 7: Post-Deployment Verification Checklist

Verify the deployed application through its public Vercel URL:

- [ ] **API Health Check**: Visit `https://your-backend.onrender.com/api/health` and verify `{"status":"online"}`.
- [ ] **Home Page Catalog**: Open `https://your-frontend.vercel.app/` and verify the 28 properties load with photographs, pricing, and locations.
- [ ] **Category Filters**: Click through all 9 categories (Trending, Iconic Cities, Beachfront, Luxury, Cabins, Mansions, Countryside, Lakefront, Amazing Views) and verify immediate filtering.
- [ ] **Location Search**: Search for "Hyderabad" and "Goa".
- [ ] **Guest Authentication**: Click **Demo Guest** on the login page, or register a new guest account.
- [ ] **Booking Creation**: Select check-in and check-out dates on any property, click **Reserve**, and complete checkout.
- [ ] **My Bookings Dashboard**: Verify the reservation appears on `/bookings`.
- [ ] **Host Experience**: Log in as **Demo Host** (`host@staynest.com` / `password123`), visit `/host/dashboard`, create a new listing, edit price, or delete.
- [ ] **Deep Links & Refresh**: Refresh on `/bookings` or `/properties/:id` to confirm Vercel SPA routing doesn't return 404.
- [ ] **Browser Console**: Open browser DevTools (F12) and confirm 0 CORS errors or network failures.
