# --- Stage 1: Build ---
# Use a specific version of Node for reproducibility.
# Alpine is used for its small size.
FROM node:18-alpine AS build

# Set the working directory
WORKDIR /usr/src/app

# Copy package files and install dependencies
# This is done in a separate layer to leverage Docker's cache.
# It prevents re-installing dependencies every time code changes.
COPY package*.json ./
RUN npm install

# Copy the rest of the application source code
COPY . .


# --- Stage 2: Production ---
# Use a clean, small base image for the final container
FROM node:18-alpine

WORKDIR /usr/src/app

# Copy only the necessary files from the build stage
COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/package.json ./package.json
COPY --from=build /usr/src/app/src ./src

# Set environment variables
# The PORT should be set by the hosting environment (e.g., Cloud Run)
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port the app will run on
EXPOSE ${PORT}

# The command to run the application
# Using "node" directly is often better than "npm start" in containers
CMD ["node", "src/server.js"]
