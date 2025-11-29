# Fix "Failed to Fetch" Error

## Problem
Frontend on Vercel is trying to connect to `localhost:5000` because `VITE_API_URL` environment variable is not set.

## Solution

### Step 1: Set Environment Variable in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your `EmpowerAI` project
3. Go to **Settings** → **Environment Variables**
4. Add a new variable:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api` (replace with your actual Render backend URL)
   - **Environment:** Production, Preview, Development (select all)
5. Click **Save**
6. Go to **Deployments** tab
7. Click the **3 dots** (⋯) on the latest deployment
8. Click **Redeploy**

### Step 2: Verify Backend is Running

Check if your backend is accessible:
- Open: `https://your-backend-url.onrender.com/api/health`
- Should return: `{"status":"OK","message":"EmpowerAI Backend is running"}`

### Step 3: Check CORS

The backend CORS has been updated to allow:
- `https://empower-ai-gamma.vercel.app`
- All `*.vercel.app` domains

If you're using a different Vercel URL, update `empowerai-backend/src/server.js` line 11.

## Quick Test

After redeploying, test the login:
1. Open your Vercel frontend URL
2. Try to log in
3. Check browser console (F12) for errors
4. Check Network tab to see if requests are going to the correct backend URL

