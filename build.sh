#!/bin/bash
# Build script for Render deployment

# Install dependencies
npm install

# Build the frontend
npx vite build

# Create a production-ready version of the server
echo "Creating production server build..."

# Create dist directory if it doesn't exist
mkdir -p dist

# Create a production server file that doesn't rely on Vite
cat > dist/server.js << 'EOF'
// Production server file
const express = require('express');
const path = require('path');
const { createServer } = require('http');
const session = require('express-session');
const { Pool } = require('@neondatabase/serverless');
const { drizzle } = require('drizzle-orm/neon-serverless');
const pgSession = require('connect-pg-simple')(session);
const { storage } = require('../server/storage');

// Import routes
const { registerRoutes } = require('../server/routes');

const PORT = process.env.PORT || 3000;
const app = express();

// Ensure environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Session configuration
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const sessionStore = new pgSession({
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
app.use(express.static(path.join(__dirname, '../dist')));

// Register API routes
registerRoutes(app).then(server => {
  // Send React's index.html for any other request
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
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
});
EOF

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