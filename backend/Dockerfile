FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies only
# Using --omit=dev instead of ci to be more resilient
RUN npm install --omit=dev --no-audit --no-fund

# Copy the pre-built dist folder from the host
COPY dist ./dist
COPY scripts ./scripts

EXPOSE 5000

# Run the pre-built server
CMD ["node", "dist/server.js"]
