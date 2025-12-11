# Quick Fix: Set VITE_API_URL in Vercel

## Your Deployment
- **Frontend URL**: https://empower-ai-gamma.vercel.app
- **Backend URL**: https://empowerai.onrender.com/api

## Problem
The frontend is trying to connect to `localhost:5000/api` instead of your deployed backend.

## Solution: Set Environment Variable

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Find and click on your project (should be named something like "empower-ai-gamma" or "EmpowerAI")

2. **Navigate to Environment Variables**
   - Click on **Settings** tab (top navigation)
   - Click on **Environment Variables** (left sidebar)

3. **Add the Variable**
   - Click the **Add New** button
   - **Key**: `VITE_API_URL`
   - **Value**: `https://empowerai.onrender.com/api`
   - **Environment**: Select **all three**:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - Click **Save**

4. **Redeploy (IMPORTANT!)**
   - Go to **Deployments** tab
   - Find the latest deployment
   - Click the **⋯** (three dots) menu
   - Click **Redeploy**
   - Confirm the redeploy

5. **Wait for Build**
   - Wait 1-2 minutes for the build to complete
   - The deployment status will show "Ready" when done

6. **Test**
   - Visit: https://empower-ai-gamma.vercel.app
   - Try logging in
   - The error should be gone!

## Verification

After redeploying, you can verify:
- ✅ No more "localhost" error messages
- ✅ Login works
- ✅ API calls succeed

## Why This Happens

Vite only exposes environment variables that start with `VITE_` to the client-side code. The environment variable is baked into the build, so you **must redeploy** after adding/changing it.

## Troubleshooting

**Still seeing the error?**
1. Make sure you selected **all environments** (Production, Preview, Development)
2. Make sure you **redeployed** after adding the variable
3. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
4. Check the deployment logs to ensure the variable was used

**Can't find your project?**
- Check: https://vercel.com/dashboard
- Look for projects with "empower" or "gamma" in the name
- If you can't find it, you may need to import the project again

---

**Quick Checklist:**
- [ ] Found project in Vercel dashboard
- [ ] Added `VITE_API_URL` = `https://empowerai.onrender.com/api`
- [ ] Selected all environments
- [ ] Redeployed the project
- [ ] Waited for build to complete
- [ ] Tested the login

