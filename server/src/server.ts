import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

const server = app.listen(config.port, () => {
  console.info(`[Server] Language Translation Server running at http://localhost:${config.port}`);
  console.info(`[Server] Environment: ${config.nodeEnv}`);
  console.info(`[Server] Active Translation Provider: ${config.translationProvider}`);
  console.info(`[Server] CORS Allowed Origin: ${config.clientOrigin}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.info('[Server] SIGTERM signal received: closing HTTP server...');
  server.close(() => {
    console.info('[Server] HTTP server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.info('[Server] SIGINT signal received: closing HTTP server...');
  server.close(() => {
    console.info('[Server] HTTP server closed.');
    process.exit(0);
  });
});
