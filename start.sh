#!/bin/bash
# Start script for the application on Render

# Log the current directory and list files for debugging
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Log the content of the dist directory and its subdirectories
echo "Files in dist directory:"
ls -la dist/

echo "Files in dist/assets directory:"
ls -la dist/assets/ 2>/dev/null || echo "dist/assets directory not found"

echo "Files in dist/server directory:"
ls -la dist/server/ 2>/dev/null || echo "dist/server directory not found"

# Create assets directory and add a minimal index.html if needed
if [ ! -d "dist/assets" ]; then
  echo "Creating dist/assets directory..."
  mkdir -p dist/assets
fi

if [ ! -f "dist/assets/index.html" ]; then
  echo "Creating a minimal index.html file..."
  cat > dist/assets/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>Competition Ticket</title>
  <style>
    body { font-family: sans-serif; margin: 0; padding: 20px; text-align: center; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>Competition Ticket</h1>
  <p>Welcome to our prize competitions platform!</p>
  <p>The application is starting up. Created by start.sh script.</p>
</body>
</html>
EOF
fi

echo "After fixing, files in dist/assets directory:"
ls -la dist/assets/

# Set NODE_ENV to production
export NODE_ENV=production

# Check if PORT environment variable is set by Render
if [ -z "$PORT" ]; then
  echo "PORT environment variable not set, defaulting to 5000"
  export PORT=5000
else
  echo "Using PORT: $PORT"
fi

# Set SESSION_SECRET to a secure value if not already set
if [ -z "$SESSION_SECRET" ]; then
  echo "SESSION_SECRET not set, using a default value (this is not recommended for production)"
  export SESSION_SECRET="competitions_app_secret_$(date +%s)"
fi

# Start the application with the new server file
node dist/server.js