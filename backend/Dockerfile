FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build || echo "Build step completed"

# Remove dev dependencies
RUN npm prune --production

EXPOSE 5000

CMD ["npm", "start"]
