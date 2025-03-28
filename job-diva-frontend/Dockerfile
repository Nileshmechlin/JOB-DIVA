# Use Node.js as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy frontend code
COPY . .

# Build React app
RUN npm install esbuild@0.25.0 --save-dev && npm run build


# Expose port for frontend
EXPOSE 3000

# Serve React build using a lightweight web server
CMD ["npx", "serve", "-s", "build", "-l", "3000"]
