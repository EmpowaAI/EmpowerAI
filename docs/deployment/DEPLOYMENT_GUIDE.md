# Deployment Guide - Render & Vercel

## Quick Answer: **Just Push Commits - Auto-Deploy!**

You **do NOT need to deploy from scratch**. Both Render and Vercel auto-deploy when you push commits to the `main` branch.

## How It Works

### Render (Backend & AI Service)
- ✅ **Auto-deploys** when you push to `main` branch
- ✅ Reads `render.yaml` for configuration
- ✅ Runs `buildCommand` then `startCommand`
- ⏱️ Takes 2-5 minutes to deploy

### Vercel (Frontend)
- ✅ **Auto-deploys** when you push to `main` branch
- ✅ Reads `vercel.json` for configuration
- ✅ Runs build automatically
- ⏱️ Takes 1-2 minutes to deploy

## Deployment Steps

### 1. Commit Your Changes
```bash
# Check what files changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Fix rate limiting issues in AI service and backend"

# Push to main branch
git push origin main
```

### 2. Wait for Auto-Deployment
- **Render**: Check dashboard at https://dashboard.render.com
  - Go to your service → Deployments tab
  - You'll see "Building..." then "Live" when done
- **Vercel**: Check dashboard at https://vercel.com
  - Go to your project → Deployments tab
  - You'll see build progress

### 3. Verify Deployment
- Check Render logs for any errors
- Test the live URL
- Check that fixes are working

## Manual Redeploy (If Needed)

If auto-deploy doesn't trigger:

### Render
1. Go to https://dashboard.render.com
2. Select your service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**

### Vercel
1. Go to https://vercel.com
2. Select your project
3. Click **"Redeploy"** on latest deployment

## What Gets Deployed

### Backend (`empowerai-backend/`)
- ✅ All code changes
- ✅ `package.json` dependencies (installed during build)
- ❌ `.env` files (set in Render Dashboard)
- ✅ `render.yaml` configuration

### AI Service (`ai-service/`)
- ✅ All code changes
- ✅ `requirements.txt` dependencies (installed during build)
- ❌ `.env` files (set in Render Dashboard)
- ✅ `render.yaml` configuration

### Frontend (`frontend/`)
- ✅ All code changes
- ✅ `package.json` dependencies
- ✅ Built static files deployed to CDN
- ✅ `vercel.json` configuration

## Important Notes

1. **Environment Variables**: Must be set in Render/Vercel dashboards, not in `.env` files
2. **Build Time**: First deployment takes longer (5-10 min), subsequent deployments are faster (2-5 min)
3. **Zero Downtime**: Render/Vercel handle deployments without downtime
4. **Rollback**: Can rollback to previous deployment from dashboard if needed

## Troubleshooting

### Deployment Fails
- Check build logs in Render/Vercel dashboard
- Verify all dependencies are in `package.json`/`requirements.txt`
- Check for syntax errors in code

### Changes Not Showing
- Wait 2-5 minutes for deployment to complete
- Clear browser cache
- Check deployment logs for errors
- Verify you pushed to `main` branch

### Environment Variables Not Working
- Set them in Render/Vercel dashboard (not `.env` files)
- Redeploy after setting environment variables
- Check variable names match exactly (case-sensitive)
