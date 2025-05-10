#!/bin/bash
# This script handles both building and starting the application on Render

# Check if we're in BUILD mode or START mode
if [ "$1" = "build" ]; then
  echo "=== RUNNING BUILD PROCESS ==="
  
  # Install dependencies in the root directory
  echo "Installing root dependencies..."
  npm install
  
  # Build the frontend
  echo "Building frontend..."
  cd client
  npm install
  npm run build
  cd ..
  
  # Create required directories
  echo "Creating necessary directories..."
  mkdir -p dist
  mkdir -p server/dist
  mkdir -p server/public
  
  # Copy the built frontend to multiple possible locations where Express might look for it
  echo "Copying frontend build to expected locations..."
  if [ -d "client/dist" ]; then
    echo "Copying from client/dist..."
    cp -r client/dist/* dist/
    cp -r client/dist/* server/dist/
    cp -r client/dist/* server/public/
    
    # Verify the frontend files were copied correctly
    echo "Verifying frontend build..."
    if [ -f "dist/index.html" ]; then
      echo "✅ Frontend build successful: index.html found in dist/"
    else
      echo "❌ ERROR: Frontend build failed - index.html not found in dist/"
      exit 1
    fi
  else
    echo "❌ ERROR: client/dist directory not found after build"
    exit 1
  fi
  
  echo "Build completed successfully!"
  exit 0
  
elif [ "$1" = "start" ]; then
  echo "=== STARTING APPLICATION ==="
  
  # Set NODE_ENV to production
  export NODE_ENV=production
  
  # Check for required environment variables
  if [ -z "$DATABASE_URL" ]; then
    echo "WARNING: DATABASE_URL environment variable is not set"
  fi
  
  # Verify static files exist
  echo "Verifying static files..."
  found_static_files=false
  
  for dir in "dist" "client/dist" "server/dist" "server/public"; do
    if [ -f "$dir/index.html" ]; then
      echo "✅ Found static files in $dir"
      found_static_files=true
    else
      echo "❌ No static files found in $dir"
    fi
  done
  
  if [ "$found_static_files" = false ]; then
    echo "WARNING: No static files found in any expected locations!"
    echo "Creating a fallback index.html..."
    
    # Create directories if they don't exist
    mkdir -p dist
    mkdir -p server/dist
    mkdir -p server/public
    
    # Create a simple fallback HTML file
    cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Competition Ticket</title>
    <style>
      body { font-family: sans-serif; margin: 0; padding: 20px; text-align: center; }
      h1 { color: #333; }
      .container { max-width: 800px; margin: 0 auto; }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Competition Ticket</h1>
      <p>Welcome to our prize competitions platform!</p>
      <p>The application is starting up, but the static files weren't found. Please check the deployment logs.</p>
    </div>
  </body>
</html>
EOF
    # Copy the fallback to all locations
    cp dist/index.html server/dist/index.html
    cp dist/index.html server/public/index.html
  fi
  
  # Start the server with our wrapper script for better static file handling
  echo "Starting server with wrapper..."
  npx tsx server/server-wrapper.ts
  
else
  echo "Usage: $0 [build|start]"
  echo "  build: Install dependencies and build the frontend"
  echo "  start: Start the application server"
  exit 1
fi