# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN node node_modules/vite/bin/vite.js build

# Install serve for production
RUN npm install -g serve

# Expose port
EXPOSE 5173

# Start the application
ENTRYPOINT ["nginx"]
CMD ["-g", "daemon off;"]



