#!/bin/bash
# Start script for Render deployment

# Set NODE_ENV to production
export NODE_ENV=production

# Check if PORT environment variable is set by Render
if [ -z "$PORT" ]; then
  echo "PORT environment variable not set, defaulting to 3000"
  export PORT=3000
else
  echo "Using PORT: $PORT"
fi

# Verify the frontend build exists
echo "Checking frontend build..."
if [ ! -f "dist/index.html" ]; then
  echo "WARNING: Frontend build not found. Creating a simple placeholder..."
  mkdir -p dist
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
      <p>The application is starting up. If you continue to see this page, please check the deployment logs.</p>
    </div>
  </body>
</html>
EOF
fi

# Check for common problems in the deployment environment
echo "Checking environment..."
if [ -z "$DATABASE_URL" ]; then
  echo "WARNING: DATABASE_URL environment variable is not set"
fi

# Try to fix the static file path issue by ensuring files are in multiple locations
echo "Ensuring static files are in the expected locations..."
if [ -d "client/dist" ]; then
  # Copy from client/dist to dist and server/dist
  echo "Found client/dist, copying to other locations"
  mkdir -p dist
  mkdir -p server/dist
  cp -r client/dist/* dist/
  cp -r client/dist/* server/dist/
elif [ -d "dist" ]; then
  # Copy from dist to server/dist
  echo "Found dist, copying to server/dist"
  mkdir -p server/dist
  cp -r dist/* server/dist/
fi

# Create symbolic links to increase chances of files being found
echo "Creating symbolic links for static files..."
if [ -d "dist" ]; then
  ln -sf "$(pwd)/dist" "$(pwd)/server/public" || true
fi

# List the directories to help with debugging
echo "Directory listing for static files:"
ls -la dist || echo "dist directory not found"
ls -la client/dist || echo "client/dist directory not found"
ls -la server/dist || echo "server/dist directory not found"
ls -la server/public || echo "server/public directory not found"

# Start the server using our wrapper
echo "Starting server with the wrapper..."
npx tsx server/server-wrapper.ts