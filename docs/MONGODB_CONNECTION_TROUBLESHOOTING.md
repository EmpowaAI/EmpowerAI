# MongoDB Connection Troubleshooting

## Current Status
Your health check shows: `"database": "disconnected"`

This means the backend cannot connect to MongoDB Atlas.

## Common Causes & Solutions

### 1. MONGODB_URI Not Set in Render

**Check:**
1. Go to Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Check if `MONGODB_URI` exists

**Fix:**
- Add `MONGODB_URI` with your MongoDB Atlas connection string
- Format: `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
- After adding, **redeploy** the service

### 2. MongoDB Atlas IP Whitelist

**Problem:** Render's IP addresses are not whitelisted in MongoDB Atlas

**Fix:**
1. Go to MongoDB Atlas Dashboard
2. Click **Network Access** (left sidebar)
3. Click **Add IP Address**
4. Click **Allow Access from Anywhere** (adds `0.0.0.0/0`)
   - ⚠️ This allows all IPs (fine for development, consider restricting for production)
5. Or add Render's specific IP ranges (check Render docs)

### 3. Incorrect Connection String Format

**Check your connection string:**
```
mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Common issues:**
- ❌ Special characters in password not URL-encoded
- ❌ Missing database name
- ❌ Wrong cluster URL
- ❌ Missing `?retryWrites=true&w=majority`

**How to get correct connection string:**
1. Go to MongoDB Atlas
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual password (URL-encode special chars)
6. Replace `<dbname>` with your database name (e.g., `empowerai`)

### 4. Database User Not Created

**Check:**
1. MongoDB Atlas → **Database Access**
2. Verify you have a database user created
3. User must have read/write permissions

**Fix:**
1. Create a new database user if needed
2. Set username and password
3. Grant **Atlas admin** or **Read and write to any database** role
4. Update connection string with new credentials

### 5. Connection String in Render

**Steps to add in Render:**
1. Go to Render Dashboard
2. Select your backend service
3. Go to **Environment** tab
4. Click **Add Environment Variable**
5. **Key**: `MONGODB_URI`
6. **Value**: Your full MongoDB connection string
7. Click **Save Changes**
8. **Redeploy** the service (important!)

### 6. Verify Connection String

**Test your connection string locally:**
```bash
# In your backend directory
cd empowerai-backend

# Create a test file
echo "MONGODB_URI=your-connection-string-here" > .env.test

# Test connection (if you have Node.js installed)
node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected!')).catch(e => console.error('Error:', e.message))"
```

## Quick Checklist

- [ ] `MONGODB_URI` is set in Render environment variables
- [ ] Connection string includes username and password
- [ ] Password is URL-encoded (special chars like `@`, `#`, `%` encoded)
- [ ] Database name is specified in connection string
- [ ] MongoDB Atlas IP whitelist includes `0.0.0.0/0` or Render IPs
- [ ] Database user exists and has proper permissions
- [ ] Service was **redeployed** after adding environment variable
- [ ] Connection string format is correct: `mongodb+srv://...`

## Example Connection String

```
mongodb+srv://myuser:mypassword123@cluster0.abc123.mongodb.net/empowerai?retryWrites=true&w=majority
```

**Breakdown:**
- `myuser` - Your MongoDB username
- `mypassword123` - Your MongoDB password (URL-encoded if needed)
- `cluster0.abc123.mongodb.net` - Your cluster URL
- `empowerai` - Your database name
- `?retryWrites=true&w=majority` - Connection options

## After Fixing

1. **Redeploy** your Render service
2. Check logs for: `✅ MongoDB connected successfully`
3. Test health endpoint: `https://empowerai.onrender.com/api/health`
4. Should show: `"database": "connected"`

## Still Not Working?

Check Render logs:
1. Go to Render Dashboard → Your Service
2. Click **Logs** tab
3. Look for MongoDB connection errors
4. Common errors:
   - `authentication failed` → Wrong username/password
   - `IP not whitelisted` → Add IP to MongoDB Atlas
   - `ENOTFOUND` → Wrong cluster URL
   - `timeout` → Network/firewall issue

---

**Need Help?** Check MongoDB Atlas connection guide: https://www.mongodb.com/docs/atlas/connect-to-cluster/

