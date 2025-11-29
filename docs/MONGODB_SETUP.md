# MongoDB Setup Guide

## Step 1: Get Your MongoDB Connection String

### If using MongoDB Atlas (Cloud):

1. **Log in to MongoDB Atlas**: https://cloud.mongodb.com
2. **Go to your cluster** (or create one if you don't have one)
3. **Click "Connect"** button on your cluster
4. **Choose "Connect your application"**
5. **Copy the connection string** - it looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace placeholders**:
   - Replace `<username>` with your MongoDB username
   - Replace `<password>` with your MongoDB password
   - Add database name at the end: `...mongodb.net/empowerai?retryWrites=true&w=majority`

### If using Local MongoDB:

```
mongodb://localhost:27017/empowerai
```

## Step 2: Configure Backend

1. **Open** `empowerai-backend/.env` file
2. **Add/Update** the `MONGODB_URI` line:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/empowerai?retryWrites=true&w=majority
   ```

   **Important**: 
   - Replace `your-username` and `your-password` with your actual credentials
   - Replace the cluster URL with your actual cluster URL
   - Make sure the database name is `empowerai` (or change it if you prefer)

## Step 3: Connect with MongoDB GUI (Compass)

### Using MongoDB Compass:

1. **Open MongoDB Compass**
2. **Paste your connection string** in the connection field
3. **Click "Connect"**
4. You should see your databases

### Connection String Format:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/
```

**Note**: Remove the database name and query parameters when connecting via Compass - just use the base connection string.

## Step 4: Test the Connection

1. **Start your backend**:
   ```powershell
   cd empowerai-backend
   npm run dev
   ```

2. **Look for this message**:
   ```
   ✅ MongoDB connected successfully
   ```

3. **If you see an error**, check:
   - Connection string is correct
   - Username/password are correct
   - IP address is whitelisted in MongoDB Atlas (if using Atlas)
   - Internet connection is working

## Step 5: Whitelist Your IP (MongoDB Atlas)

If using MongoDB Atlas, you need to whitelist your IP:

1. Go to MongoDB Atlas dashboard
2. Click **"Network Access"** in the left menu
3. Click **"Add IP Address"**
4. Click **"Add Current IP Address"** (or add `0.0.0.0/0` for all IPs - less secure but easier for development)
5. Click **"Confirm"**

## Step 6: Verify Database Connection

Once connected, you should see these collections in MongoDB:
- `users` - User accounts
- `economictwins` - Digital twin data
- `opportunities` - Job/opportunity listings

## Troubleshooting

### Error: "MongoServerError: bad auth"
- Check your username and password are correct
- Make sure there are no extra spaces in the connection string

### Error: "MongoNetworkError: connection timeout"
- Check your IP is whitelisted in MongoDB Atlas
- Check your internet connection
- Try using `0.0.0.0/0` for development (allows all IPs)

### Error: "MongooseError: Operation buffering timed out"
- MongoDB connection string might be wrong
- Check if MongoDB service is running (if local)
- Verify network connectivity

## Example .env File

```env
PORT=5000
MONGODB_URI=mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/empowerai?retryWrites=true&w=majority
AI_SERVICE_URL=http://localhost:8000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

## Next Steps

Once MongoDB is connected:
1. Test user registration: `POST /api/auth/register`
2. Test twin creation: `POST /api/twin/create` (requires auth)
3. Check data in MongoDB Compass to see saved records

