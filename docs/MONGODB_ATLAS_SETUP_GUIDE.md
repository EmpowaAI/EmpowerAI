# MongoDB Atlas Setup Guide - Step by Step

This guide will walk you through setting up MongoDB Atlas and connecting it to your EmpowerAI backend.

## Step 1: Create/Login to MongoDB Atlas Account

1. **Go to MongoDB Atlas**: https://www.mongodb.com/cloud/atlas/register
2. **Sign up** (if you don't have an account) or **Log in** (if you already have one)
   - You can sign up with Google, GitHub, or email
   - Free tier (M0) is available - perfect for development

## Step 2: Create a New Project (if needed)

1. Once logged in, you'll see the **Atlas Dashboard**
2. If you don't have a project yet:
   - Click **"New Project"** button (top right)
   - Name it: `EmpowerAI` (or any name you prefer)
   - Click **"Create Project"**

## Step 3: Create a Free Cluster

1. In your project, click **"Build a Database"** button
2. Choose **"M0 FREE"** tier (Free forever)
3. **Cloud Provider & Region**:
   - Choose any provider (AWS, Google Cloud, or Azure)
   - Choose a region closest to you (e.g., `Europe (Ireland)` or `US East`)
   - Click **"Create"**
4. **Cluster Name**: Leave default or name it `Cluster0`
5. Click **"Create Cluster"**
6. ⏳ **Wait 3-5 minutes** for the cluster to be created (you'll see a progress indicator)

## Step 4: Create Database User

1. While the cluster is creating, you'll see a **"Create Database User"** screen
2. **Authentication Method**: Choose **"Password"**
3. **Username**: Enter a username (e.g., `empowerai-user` or `admin`)
   - ⚠️ **Remember this username!**
4. **Password**: 
   - Click **"Autogenerate Secure Password"** OR create your own
   - ⚠️ **COPY THE PASSWORD NOW** - you won't see it again!
   - Save it somewhere safe (or copy to clipboard)
5. Click **"Create Database User"**

## Step 5: Whitelist Your IP Address

1. You'll see **"Where would you like to connect from?"** screen
2. **Network Access**:
   - Click **"Add My Current IP Address"** button
   - This allows your computer to connect to the database
3. **Optional**: For development, you can click **"Allow Access from Anywhere"** (less secure, but easier for testing)
   - This adds `0.0.0.0/0` to the whitelist
4. Click **"Finish and Close"**

## Step 6: Get Your Connection String

1. Once your cluster is ready (green checkmark), click **"Connect"** button on your cluster
2. Choose **"Connect your application"**
3. **Driver**: Select **"Node.js"** (version 5.5 or later)
4. You'll see a connection string that looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. **Copy this connection string** (click the copy icon)

## Step 7: Customize Your Connection String

1. **Replace `<username>`** with the username you created in Step 4
   - Example: If username is `empowerai-user`, replace `<username>` with `empowerai-user`
2. **Replace `<password>`** with the password you created/copied in Step 4
   - ⚠️ **Important**: If your password has special characters (like `@`, `#`, `$`, etc.), you need to URL-encode them:
     - `@` becomes `%40`
     - `#` becomes `%23`
     - `$` becomes `%24`
     - `&` becomes `%26`
     - `%` becomes `%25`
3. **Add database name**: Before the `?`, add `/empowerai`
   - Final format: `...mongodb.net/empowerai?retryWrites=true&w=majority`

**Example:**
```
Original: mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
After:    mongodb+srv://empowerai-user:MyP@ssw0rd@cluster0.xxxxx.mongodb.net/empowerai?retryWrites=true&w=majority
```

If password has special characters:
```
Password: MyP@ss#123
Encoded:  MyP%40ss%23123
Final:    mongodb+srv://empowerai-user:MyP%40ss%23123@cluster0.xxxxx.mongodb.net/empowerai?retryWrites=true&w=majority
```

## Step 8: Update Your .env File

1. Open `empowerai-backend\.env` file in Notepad (or any text editor)
2. Find the line: `MONGODB_URI=mongodb://localhost:27017/empowerai`
3. Replace it with your MongoDB Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/empowerai?retryWrites=true&w=majority
   ```
4. **Save the file** (Ctrl+S)

## Step 9: Test the Connection

1. **Start your backend**:
   ```powershell
   cd empowerai-backend
   npm run dev
   ```
2. **Look for this message**:
   ```
   ✅ MongoDB connected successfully
   ```
3. If you see an error, check:
   - Username and password are correct
   - Password special characters are URL-encoded
   - IP address is whitelisted
   - Connection string format is correct

## Step 10: Connect with MongoDB Compass (Optional)

1. **Download MongoDB Compass**: https://www.mongodb.com/try/download/compass
2. **Open Compass**
3. **Paste your connection string** (the one you created in Step 7)
4. Click **"Connect"**
5. You should see your `empowerai` database

## Troubleshooting

### Error: "Authentication failed"
- Check username and password are correct
- Make sure password special characters are URL-encoded

### Error: "IP not whitelisted"
- Go to MongoDB Atlas → Network Access
- Click "Add IP Address" → "Add Current IP Address"
- Wait 1-2 minutes for changes to take effect

### Error: "Connection timeout"
- Check your internet connection
- Verify the cluster is running (green status in Atlas)
- Try the connection string again

### Can't find the connection string
- Click "Connect" on your cluster
- Choose "Connect your application"
- Make sure "Node.js" driver is selected

## Quick Reference

**Connection String Format:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER-URL/DATABASE-NAME?retryWrites=true&w=majority
```

**Your .env file should have:**
```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/empowerai?retryWrites=true&w=majority
```

---

**Need help?** Check the MongoDB Atlas documentation: https://docs.atlas.mongodb.com/

