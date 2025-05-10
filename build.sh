#!/bin/bash
# Build script for Render deployment

# Install dependencies
npm install

# Build the application
npm run build

# Run database migrations
npx drizzle-kit push --force

# Seed the database with initial data
npx tsx server/seed.ts

# Exit with success
echo "Build completed successfully with database setup!"
exit 0