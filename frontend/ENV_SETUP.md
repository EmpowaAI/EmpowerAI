# Environment Variables Setup

## Backend API URL

The frontend needs to know where the backend API is located.

### Production (Vercel)
The backend URL is configured in `vercel.json`:
```json
"env": {
  "VITE_API_URL": "https://empowerai.onrender.com/api"
}
```

### Local Development
For local development, create a `.env` file in the `frontend` folder:
```bash
VITE_API_URL=http://localhost:5000/api
```

Or to test against production backend locally:
```bash
VITE_API_URL=https://empowerai.onrender.com/api
```

### Vercel Dashboard (Alternative Method)
You can also set environment variables directly in Vercel:
1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add: `VITE_API_URL` = `https://empowerai.onrender.com/api`

## Important Notes
- `.env` files are gitignored for security
- Changes to environment variables require a redeploy
- The `VITE_` prefix is required for Vite to expose the variable to the frontend
