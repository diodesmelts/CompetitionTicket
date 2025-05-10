#!/bin/bash
# Build script for Render deployment

# Install dependencies
npm install

# Build the frontend
npx vite build

# Build the backend - specify the output directory more explicitly
npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Check if the build was successful
if [ ! -f "dist/index.js" ]; then
  echo "Error: Build failed - dist/index.js not found"
  # List contents to debug
  ls -la dist/
  exit 1
fi

# Run database migrations
npx drizzle-kit push --force

# Seed the database with initial data
npx tsx server/seed.ts

# List the contents of the dist directory for verification
echo "Contents of dist directory:"
ls -la dist/

# Exit with success
echo "Build completed successfully with database setup!"
exit 0