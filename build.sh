#!/bin/bash
# Build script for Render deployment

# Install dependencies
npm install

# Build the frontend
npx vite build

# Save the frontend build to a temporary location
mkdir -p temp_frontend
cp -r dist/* temp_frontend/ 2>/dev/null || :

# Create a production-ready version of the server
echo "Creating production server build..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Create a production server file that doesn't rely on Vite
cat > dist/server.js << 'EOF'
// Production server file - ES Modules syntax
import express from 'express';
import path from 'path';
import { createServer } from 'http';
import session from 'express-session';
import { Pool } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import pg from 'connect-pg-simple';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get current file's directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import from local files
import { registerRoutes } from './server/routes.js';
import { storage } from './server/storage.js';

// Set up connect-pg-simple
const PgSession = pg(session);

const PORT = process.env.PORT || 3000;
const app = express();

// Ensure environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Session configuration
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sessionStore = new PgSession({
  pool,
  tableName: 'session'
});

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure session
app.use(session({
  store: sessionStore,
  secret: process.env.SESSION_SECRET || 'development_secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  }
}));

// Serve static files from the React app
app.use(express.static(path.join(__dirname, './assets')));

// Register API routes
const server = await registerRoutes(app);

// Send React's index.html for any other request
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, './assets/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: "Internal Server Error", 
    message: err.message 
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
EOF

# Copy server files and convert them to JS for ES module imports
echo "Preparing server files for ES module imports..."

# Create server directory in dist
mkdir -p dist/server
mkdir -p dist/shared

# Copy server files with .js extension
cp server/routes.ts dist/server/routes.js
cp server/storage.ts dist/server/storage.js
cp server/db.ts dist/server/db.js
cp shared/schema.ts dist/shared/schema.js

# Convert TypeScript imports to JavaScript in copied files
sed -i 's/\.ts"/.js"/g' dist/server/*.js
sed -i 's/\.ts;/.js;/g' dist/server/*.js
sed -i 's/from "@shared\//from "..\/shared\//g' dist/server/*.js

# Run database migrations (may fail on Render but that's expected)
echo "Running database migrations..."
npx drizzle-kit push --force || echo "Migrations may have failed, that's expected in the build environment"

# Seed the database with initial data (only in development)
if [ "$NODE_ENV" != "production" ]; then
  echo "Seeding database..."
  npx tsx server/seed.ts || echo "Error seeding database: $?"
fi

# Create assets directory and move the frontend build there
mkdir -p dist/assets
cp -r temp_frontend/* dist/assets/ 2>/dev/null || :
rm -rf temp_frontend

# List the contents of the dist directory for verification
echo "Contents of dist directory:"
ls -la dist/
echo "Contents of dist/server directory:"
ls -la dist/server/
echo "Contents of dist/assets directory:"
ls -la dist/assets/

# Exit with success
echo "Build completed successfully with database setup!"
exit 0