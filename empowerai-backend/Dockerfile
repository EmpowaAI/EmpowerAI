FROM node:20-alpine

WORKDIR /app

# Install dependencies first (cached layer — only rebuilds on package.json changes)
COPY package*.json ./
RUN npm ci

# Copy source — volume mount in docker-compose overrides this for dev hot reload
COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]
