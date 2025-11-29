# Fix: "Cannot connect to server" Error

## The Problem
The frontend is trying to connect to `http://localhost:5000/api` because the `VITE_API_URL` environment variable is not set in Vercel.

## Solution: Set Environment Variable in Vercel

### Step 1: Get Your Backend URL
First, make sure your backend is deployed on Render. You should have a URL like:
- `https://empowerai-backend.onrender.com`

Test it by opening: `https://your-backend-url.onrender.com/api/health`
- Should return: `{"status":"OK","message":"EmpowerAI Backend is running"}`

### Step 2: Set Environment Variable in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in if needed

2. **Select Your Project**
   - Click on `EmpowerAI` (or your project name)

3. **Go to Settings**
   - Click **Settings** in the top menu

4. **Open Environment Variables**
   - Click **Environment Variables** in the left sidebar

5. **Add New Variable**
   - Click **Add New** button
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-url.onrender.com/api`
     - ⚠️ Replace `your-backend-url` with your actual Render backend URL
     - ⚠️ Make sure to include `/api` at the end
   - **Environment:** Select all three:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **Save**

6. **Redeploy**
   - Go to **Deployments** tab
   - Find the latest deployment
   - Click the **3 dots** (⋯) menu
   - Click **Redeploy**
   - Wait for deployment to complete (2-3 minutes)

### Step 3: Verify It Works

1. Open your Vercel frontend URL: `https://empower-ai-gamma.vercel.app`
2. Try to log in
3. Check browser console (F12) - should no longer show localhost errors

## Example

If your Render backend URL is: `https://empowerai-backend.onrender.com`

Then set:
- **Key:** `VITE_API_URL`
- **Value:** `https://empowerai-backend.onrender.com/api`

## Troubleshooting

**Still seeing localhost?**
- Make sure you selected all environments (Production, Preview, Development)
- Make sure you clicked "Redeploy" after adding the variable
- Wait 2-3 minutes for deployment to complete
- Clear browser cache (Ctrl+Shift+R)

**Backend not accessible?**
- Check if backend is deployed on Render
- Check if backend is "spinning up" (Render free tier sleeps after 15 min)
- Test backend health endpoint directly in browser

**Need help?**
- Check Render dashboard for backend status
- Check Vercel deployment logs for errors

