# Fixing Vercel 404: DEPLOYMENT_NOT_FOUND Error

## Problem
You're seeing a `404: NOT_FOUND` error with code `DEPLOYMENT_NOT_FOUND` when accessing your Vercel deployment.

## Quick Fix Steps

### Step 1: Check Vercel Dashboard
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Check if your project exists
3. If it doesn't exist, you need to import it

### Step 2: Import/Reconnect Project (If Needed)

Since this is a **monorepo**, Vercel needs special configuration:

1. **Go to Vercel Dashboard** → Click **Add New** → **Project**
2. **Import Git Repository** → Select your GitHub repo
3. **Configure Project Settings**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend` ⚠️ **IMPORTANT: Set this to `frontend`**
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (or leave default)
   - **Install Command**: `npm install` (or leave default)

4. **Add Environment Variable**:
   - Click **Environment Variables**
   - Add: `VITE_API_URL` = `https://empowerai.onrender.com/api`
   - Select all environments (Production, Preview, Development)

5. **Deploy**

### Step 3: If Project Already Exists

1. **Go to Project Settings**
   - Click on your project
   - Go to **Settings** → **General**
   - Scroll to **Root Directory**
   - Set it to: `frontend`
   - Save

2. **Redeploy**
   - Go to **Deployments** tab
   - Click **Redeploy** on latest deployment
   - Or push a new commit

### Step 4: Verify Build Settings

In Vercel project settings, verify:
- ✅ **Root Directory**: `frontend`
- ✅ **Build Command**: `npm run build` or `cd frontend && npm run build`
- ✅ **Output Directory**: `dist`
- ✅ **Install Command**: `npm install` or `cd frontend && npm install`

## Alternative: Deploy via CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend directory
cd frontend

# Login
vercel login

# Link project (if not linked)
vercel link

# Deploy to production
vercel --prod

# Set environment variable
vercel env add VITE_API_URL production
# Enter: https://empowerai.onrender.com/api
```

## Common Issues

### Issue: "Root Directory not found"
**Solution**: Make sure Root Directory is set to `frontend` (not `/frontend` or `./frontend`)

### Issue: "Build failed"
**Solution**: 
- Check build logs in Vercel
- Ensure all dependencies are in `package.json`
- Verify TypeScript compiles without errors

### Issue: "Environment variable not working"
**Solution**:
- Variable must start with `VITE_`
- Must redeploy after adding variable
- Check it's set for all environments

## After Successful Deployment

1. ✅ Deployment should show as "Ready"
2. ✅ Visit the deployment URL
3. ✅ Test login functionality
4. ✅ Verify API connection works

---

**Key Point**: Since this is a monorepo, the **Root Directory** must be set to `frontend` in Vercel settings!
