# Setting Environment Variables in Render

## ⚠️ Important: .env Files Are NOT Deployed

**`.env` files in your local project are NOT sent to Render or GitHub.**

- ✅ `.env` files are in `.gitignore` (they stay local only)
- ✅ Environment variables must be set in **Render Dashboard**
- ✅ Render loads environment variables from its own settings, not from `.env` files

## How to Set Environment Variables in Render

### Step 1: Go to Render Dashboard
1. Visit: https://dashboard.render.com
2. Select your backend service (EmpowerAI)

### Step 2: Navigate to Environment Tab
1. Click **Environment** in the left sidebar
2. You'll see a list of environment variables

### Step 3: Add/Edit MONGODB_URI
1. **If it doesn't exist:**
   - Click **Add Environment Variable** button
   - **Key**: `MONGODB_URI`
   - **Value**: Your MongoDB connection string
   - Click **Save Changes**

2. **If it exists:**
   - Find `MONGODB_URI` in the list
   - Click the **pencil icon** (Edit)
   - Update the **Value** field
   - Click **Save Changes**

### Step 4: Verify Other Required Variables

Make sure these are also set:
- ✅ `MONGODB_URI` - Your MongoDB connection string
- ✅ `JWT_SECRET` - A secret key for JWT tokens
- ✅ `AI_SERVICE_URL` - Your AI service URL (e.g., `https://empowerai-ai-service.onrender.com`)
- ✅ `FRONTEND_URL` - Your frontend URL (e.g., `https://empower-ai-gamma.vercel.app`)

### Step 5: Redeploy
After adding/updating environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

## Your MongoDB Connection String Format

```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://lungammashaba_db_user:YourPassword@cluster0.abc123.mongodb.net/empowerai?retryWrites=true&w=majority
```

## Why .env Files Don't Work for Render

- `.env` files are for **local development only**
- They're in `.gitignore`, so they're never committed to GitHub
- Render doesn't have access to your local `.env` files
- Render uses its own environment variable system

## Local Development vs Production

**Local Development:**
- Use `.env` file in `empowerai-backend/` folder
- Loaded by `dotenv` package
- Never committed to Git

**Production (Render):**
- Set in Render Dashboard → Environment tab
- Loaded when service starts
- Must redeploy after changing

## Quick Checklist

- [ ] Opened Render Dashboard
- [ ] Went to Environment tab
- [ ] Added/Updated `MONGODB_URI` with full connection string
- [ ] Verified other required variables are set
- [ ] Saved changes
- [ ] Redeployed the service
- [ ] Checked logs for connection success

---

**Remember:** Changes to `.env` files locally won't affect Render. Always set environment variables in Render Dashboard!

