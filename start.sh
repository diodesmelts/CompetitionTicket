#!/bin/bash
# Start script for the application on Render

# Log the current directory and list files for debugging
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Log the content of the dist directory
echo "Files in dist directory:"
ls -la dist/

# Set NODE_ENV to production
export NODE_ENV=production

# Check if PORT environment variable is set by Render
if [ -z "$PORT" ]; then
  echo "PORT environment variable not set, defaulting to 5000"
  export PORT=5000
else
  echo "Using PORT: $PORT"
fi

# Start the application
node dist/index.js