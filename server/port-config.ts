/**
 * This module configures the port for the server.
 * On Render, the PORT environment variable is set automatically.
 */

// Get port from environment variable or use default
export const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Log port configuration
console.log(`Using port ${PORT} (from ${process.env.PORT ? 'environment variable' : 'default'})`);