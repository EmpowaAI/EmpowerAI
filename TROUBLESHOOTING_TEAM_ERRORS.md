# Troubleshooting: Team Members Can't Login/Sign Up

## Common Issues & Solutions

### Issue 1: "Failed to fetch" or "Cannot connect to server"

**Cause:** `VITE_API_URL` environment variable not set in Vercel

**Solution:**
1. Go to https://vercel.com/dashboard
2. Select `EmpowerAI` project
3. **Settings** → **Environment Variables**
4. Check if `VITE_API_URL` exists:
   - If NO → Add it:
     - Key: `VITE_API_URL`
     - Value: `https://empowerai.onrender.com/api`
     - Environment: ✅ Production, ✅ Preview, ✅ Development
   - If YES → Verify the value is: `https://empowerai.onrender.com/api`
5. **Deployments** → Click "..." on latest → **Redeploy**
6. Wait 2-3 minutes for deployment

### Issue 2: "500 Internal Server Error" on Registration

**Cause:** Backend environment variables missing on Render

**Solution:**
1. Go to https://dashboard.render.com
2. Select your backend service (`empowerai-backend`)
3. **Environment** tab
4. Verify these are set:
   - `MONGODB_URI` = Your MongoDB Atlas connection string
   - `JWT_SECRET` = Any random string (e.g., `your-secret-key-123`)
   - `AI_SERVICE_URL` = Your AI service URL (if deployed)
   - `FRONTEND_URL` = `https://empower-ai-gamma.vercel.app`
5. Click **Save Changes**
6. Go to **Events** → **Manual Deploy** → **Deploy latest commit**

### Issue 3: CORS Errors

**Cause:** Backend not allowing Vercel domain

**Solution:**
Already fixed in code, but verify:
- Backend `server.js` should allow `https://empower-ai-gamma.vercel.app`
- If using different Vercel URL, add it to `allowedOrigins` array

### Issue 4: "User already exists" when trying to sign up

**Cause:** User already registered

**Solution:**
- Try logging in instead
- Or use a different email

## Quick Verification Steps

### For Frontend (Vercel):
1. Open: https://empower-ai-gamma.vercel.app
2. Open browser console (F12)
3. Try to sign up
4. Check Network tab:
   - ✅ Should see: `https://empowerai.onrender.com/api/auth/register`
   - ❌ Should NOT see: `http://localhost:5000/api/auth/register`

### For Backend (Render):
1. Test health: https://empowerai.onrender.com/api/health
2. Should return: `{"status":"OK","message":"EmpowerAI Backend is running"}`

## Debug Checklist

- [ ] `VITE_API_URL` set in Vercel (all environments)
- [ ] Vercel frontend redeployed after setting variable
- [ ] `MONGODB_URI` set in Render backend
- [ ] `JWT_SECRET` set in Render backend
- [ ] Backend health check works
- [ ] CORS allows Vercel domain
- [ ] Browser console shows correct API URL (not localhost)

## Still Having Issues?

1. **Check browser console** (F12) for exact error message
2. **Check Network tab** to see which URL is being called
3. **Share the error message** so we can diagnose further

