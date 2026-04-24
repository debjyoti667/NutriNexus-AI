# Use the official Node.js 22 image as the base
FROM node:22-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install all dependencies (including devDependencies needed for build)
RUN npm install

# Copy the rest of the application code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Build the Vite frontend
RUN npm run build

# Expose port 3000 (standard for this environment)
EXPOSE 3000

# Start the application using node
# Note: Modern Node (22+) supports TS stripping, or we use our start script
CMD [ "npm", "start" ]
