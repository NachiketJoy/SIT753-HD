# Base Node.js image
FROM node:22-slim

# Set working directory
WORKDIR /app

# Install curl for health checks
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency files first for better caching
COPY package*.json ./

# Allow NODE_ENV to be passed as a build argument
ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

# Install dependencies based on environment
RUN if [ "$NODE_ENV" = "production" ]; then \
      npm ci --only=production; \
    else \
      npm install; \
    fi

# Copy the rest of the application
COPY . .

# Expose application port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
