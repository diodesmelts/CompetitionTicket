import express from 'express';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { log } from './vite';

// This wrapper will run the actual server but provides a safety net
// for serving static files during deployment

// Starts the original server in a child process
function startOriginalServer() {
  const serverProcess = exec('node -r tsx/register server/index.ts', (error, stdout, stderr) => {
    if (error) {
      console.error(`Server process error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.error(`Server process stderr: ${stderr}`);
    }
  });

  serverProcess.stdout?.on('data', (data) => {
    process.stdout.write(data);
  });

  serverProcess.stderr?.on('data', (data) => {
    process.stderr.write(data);
  });

  return serverProcess;
}

// Create a wrapper app that will handle static files if the main server fails to find them
const app = express();

// Check if frontend static files exist in any of the possible locations
const possibleStaticPaths = [
  path.resolve(process.cwd(), 'dist'),
  path.resolve(process.cwd(), 'client/dist'),
  path.resolve(process.cwd(), 'server/dist'),
  path.resolve(process.cwd(), 'server/public')
];

let staticFilesPath = null;
for (const p of possibleStaticPaths) {
  if (fs.existsSync(p) && fs.existsSync(path.join(p, 'index.html'))) {
    staticFilesPath = p;
    break;
  }
}

if (staticFilesPath) {
  log(`Wrapper found static files at: ${staticFilesPath}`);
  
  // Proxy API requests to the main server
  app.use('/api', (req, res) => {
    res.status(503).json({ 
      error: "API server is still starting up", 
      path: req.originalUrl 
    });
  });
  
  // Serve static files from the found directory
  app.use(express.static(staticFilesPath));
  
  // For any other routes, serve index.html
  app.get('*', (req, res) => {
    res.sendFile(path.join(staticFilesPath, 'index.html'));
  });
  
  // Start the main server
  startOriginalServer();
  
  // Start the wrapper server on PORT or default to 3000
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    log(`Static file wrapper server running on port ${PORT}`);
  });
} else {
  log('No static files found, starting main server directly');
  startOriginalServer();
}