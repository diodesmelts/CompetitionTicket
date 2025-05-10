#!/usr/bin/env node

/**
 * This script handles the build process for deployment on Render.
 * It builds the frontend and copies the files to the correct location.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Log with timestamp
function log(message) {
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] ${message}`);
}

// Execute command and return output
function exec(command) {
  log(`Executing: ${command}`);
  return execSync(command, { stdio: 'inherit' });
}

// Copy directory recursively
function copyDir(src, dest) {
  log(`Copying directory: ${src} -> ${dest}`);
  
  // Create destination directory if it doesn't exist
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  // Get all files in source directory
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively copy directory
      copyDir(srcPath, destPath);
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Main build process
async function build() {
  try {
    // Install dependencies
    log('Installing root dependencies...');
    exec('npm install');
    
    // Build the frontend
    log('Building frontend...');
    exec('cd client && npm install && npm run build');
    
    // Create server/public directory if it doesn't exist
    const publicDir = path.join(__dirname, 'server', 'public');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Copy built files to server/public
    const clientDistDir = path.join(__dirname, 'client', 'dist');
    if (fs.existsSync(clientDistDir)) {
      log('Copying built files to server/public...');
      copyDir(clientDistDir, publicDir);
      
      // Verify files were copied correctly
      if (fs.existsSync(path.join(publicDir, 'index.html'))) {
        log('✅ Build successful: index.html found in server/public');
      } else {
        log('❌ ERROR: Build failed - index.html not found in server/public');
        process.exit(1);
      }
    } else {
      log('❌ ERROR: client/dist directory not found after build');
      process.exit(1);
    }
    
    log('Build completed successfully!');
  } catch (error) {
    log(`❌ ERROR: ${error.message}`);
    process.exit(1);
  }
}

// Start the build process
build();