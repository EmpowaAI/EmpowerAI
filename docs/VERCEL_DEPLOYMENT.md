# Vercel Deployment Guide

## Setting Environment Variables in Vercel

The frontend needs to know where your backend API is located. You must set the `VITE_API_URL` environment variable in Vercel.

### Step-by-Step Instructions

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in to your account
   - Select your EmpowerAI project

2. **Navigate to Settings**
   - Click on your project
   - Go to **Settings** tab (in the top navigation)
   - Click on **Environment Variables** in the left sidebar

3. **Add Environment Variable**
   - Click **Add New** button
   - **Key**: `VITE_API_URL`
   - **Value**: `https://empowerai.onrender.com/api`
   - **Environment**: Select all environments (Production, Preview, Development)
   - Click **Save**

4. **Redeploy Your Application**
   - After adding the environment variable, you need to redeploy
   - Go to **Deployments** tab
   - Click the **⋯** (three dots) on the latest deployment
   - Click **Redeploy**
   - Or push a new commit to trigger a new deployment

### Verification

After redeploying, your frontend should now connect to:
- **Backend**: `https://empowerai.onrender.com/api`
- **Health Check**: `https://empowerai.onrender.com/api/health`

### Troubleshooting

**If you still see the localhost error:**
1. Make sure the environment variable is set for **all environments** (Production, Preview, Development)
2. Make sure you **redeployed** after adding the variable
3. Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
4. Check the Vercel deployment logs to ensure the variable is being used

**To verify the variable is set:**
- In Vercel, go to your deployment
- Check the build logs - you should see the environment variables being loaded
- The frontend build should use `VITE_API_URL` during the build process

### Alternative: Using Vercel CLI

If you prefer using the command line:

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login to Vercel
vercel login

# Link your project (if not already linked)
vercel link

# Add environment variable
vercel env add VITE_API_URL production
# When prompted, enter: https://empowerai.onrender.com/api

# Redeploy
vercel --prod
```

### Important Notes

- ⚠️ **VITE_ prefix is required**: Vite only exposes environment variables that start with `VITE_` to the client-side code
- 🔄 **Redeploy required**: Environment variables are baked into the build, so you must redeploy after adding/changing them
- 🌍 **All environments**: Make sure to set the variable for Production, Preview, and Development if you want it to work everywhere

---

## Quick Reference

**Environment Variable:**
```
Key: VITE_API_URL
Value: https://empowerai.onrender.com/api
```

**Backend Health Check:**
```
https://empowerai.onrender.com/api/health
```

**Frontend URL:**
```
https://empower-ai-gamma.vercel.app
```

