# Use Node.js base image
FROM node:18-alpine 

# Set working directory in container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Copy the rest of the backend code
COPY . .

# Compile TypeScript
RUN npm run build

# Expose the port
EXPOSE 5000

# Start the backend server
CMD ["npm", "start"]
