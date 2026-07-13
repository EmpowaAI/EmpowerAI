FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer)
# --legacy-peer-deps matches the project's install convention
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy source - volume mount in docker-compose overrides src/ for hot reload
COPY . .

EXPOSE 5173

# Use vite directly (bypasses the Windows-specific run-vite.cjs shim)
CMD ["node_modules/.bin/vite", "--host", "0.0.0.0"]
