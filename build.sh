#!/bin/bash
# Build script for Render deployment

# Install dependencies in the root directory
echo "Installing root dependencies..."
npm install

# Build the frontend
echo "Building frontend..."
cd client
npm install
npm run build
cd ..

# Move the built frontend to the correct location
echo "Moving frontend build to expected location..."
mkdir -p dist
cp -r client/dist/* dist/

# Verify the frontend files were copied correctly
echo "Verifying frontend build..."
if [ -f "dist/index.html" ]; then
  echo "✅ Frontend build successful: index.html found in dist/"
else
  echo "❌ ERROR: Frontend build failed - index.html not found in dist/"
  exit 1
fi

echo "Build completed successfully!"
exit 0