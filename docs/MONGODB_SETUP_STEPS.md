# MongoDB Connection String Setup for Render

## Your Database Users
You have these users available:
- `lungammashaba_db_user`
- `nicolettemashaba_db_user`
- `siyanda_db_user`

All have `atlasAdmin@admin` role ✅

## Step-by-Step: Get Your Connection String

### Step 1: Get Connection String from MongoDB Atlas

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com
   - Log in to your account

2. **Select Your Cluster**
   - Click on your cluster (usually named something like "Cluster0")

3. **Click "Connect"**
   - Big green button on your cluster

4. **Choose "Connect your application"**
   - Select this option (not "MongoDB Shell" or "MongoDB Compass")

5. **Copy the Connection String**
   - It will look like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 2: Replace Placeholders

Replace the placeholders in the connection string:

1. **Replace `<username>`** with one of your users:
   - Example: `lungammashaba_db_user`
   - Or: `nicolettemashaba_db_user`
   - Or: `siyanda_db_user`

2. **Replace `<password>`** with that user's password
   - ⚠️ **Important**: If password has special characters, URL-encode them:
     - `@` → `%40`
     - `#` → `%23`
     - `%` → `%25`
     - `&` → `%26`
     - `+` → `%2B`
     - `=` → `%3D`
     - `?` → `%3F`

3. **Add Database Name** before the `?`
   - Change: `mongodb.net/?retryWrites=true`
   - To: `mongodb.net/empowerai?retryWrites=true`
   - (Replace `empowerai` with your actual database name)

### Step 3: Final Connection String Format

Your final connection string should look like:
```
mongodb+srv://lungammashaba_db_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/empowerai?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://lungammashaba_db_user:MyPass123@cluster0.abc123.mongodb.net/empowerai?retryWrites=true&w=majority
```

### Step 4: Set in Render

1. **Go to Render Dashboard**
   - Visit: https://dashboard.render.com
   - Select your backend service

2. **Go to Environment Tab**
   - Click on **Environment** in the left sidebar

3. **Add/Update MONGODB_URI**
   - If it exists, click **Edit**
   - If it doesn't exist, click **Add Environment Variable**
   - **Key**: `MONGODB_URI`
   - **Value**: Paste your complete connection string
   - Click **Save Changes**

4. **Redeploy**
   - Go to **Events** or **Deployments** tab
   - Click **Manual Deploy** → **Deploy latest commit**
   - Or wait for auto-deploy

### Step 5: Verify IP Whitelist

1. **Go to MongoDB Atlas**
2. **Click "Network Access"** (left sidebar)
3. **Check IP Address List**
   - Should have `0.0.0.0/0` (allows all IPs)
   - Or specific Render IP ranges
4. **If not, add it:**
   - Click **Add IP Address**
   - Click **Allow Access from Anywhere**
   - Click **Confirm**

### Step 6: Test Connection

After redeploying, check:
1. **Render Logs** - Should show: `✅ MongoDB connected successfully`
2. **Health Endpoint** - `https://empowerai.onrender.com/api/health`
   - Should show: `"database": "connected"`

## Troubleshooting

### If Password Has Special Characters

**Example password:** `My@Pass#123`

**URL-encoded:** `My%40Pass%23123`

**Full connection string:**
```
mongodb+srv://lungammashaba_db_user:My%40Pass%23123@cluster0.xxxxx.mongodb.net/empowerai?retryWrites=true&w=majority
```

### If You Forgot Password

1. Go to MongoDB Atlas → **Database Access**
2. Find your user
3. Click **Edit** (pencil icon)
4. Click **Edit Password**
5. Set new password
6. Update connection string in Render

### Common Errors

**Error: "authentication failed"**
- Wrong username or password
- Password not URL-encoded properly

**Error: "IP not whitelisted"**
- Add `0.0.0.0/0` to Network Access

**Error: "ENOTFOUND"**
- Wrong cluster URL
- Check cluster name in Atlas

**Error: "timeout"**
- Network issue
- Check Render logs for details

---

## Quick Checklist

- [ ] Got connection string from MongoDB Atlas
- [ ] Replaced `<username>` with actual username
- [ ] Replaced `<password>` with actual password (URL-encoded if needed)
- [ ] Added database name before `?`
- [ ] Set `MONGODB_URI` in Render environment variables
- [ ] Added `0.0.0.0/0` to MongoDB Atlas IP whitelist
- [ ] Redeployed Render service
- [ ] Verified connection in health check

