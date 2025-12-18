FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

EXPOSE 5000

# Use ts-node for development or node dist/server.js for production
# But since we built it, we should probably run the built version
# The package.json says "start": "ts-node server.ts" which is not ideal for prod.
# Let's see if we can use the build.
# Backend package.json has "build": "tsc". 
# So we can run "node dist/server.js" if main points there.
# package.json "main": "dist/server.js"
CMD ["node", "dist/server.js"]
