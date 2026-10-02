import { createApp } from './app.js';
import { env } from './config/env.js';
import { listenWithFallback } from './utils/listen.js';

const app = createApp();

listenWithFallback(app, env.port, {
  onFallback: (busyPort, nextPort) => {
    console.warn(`Port ${busyPort} is busy, trying ${nextPort}...`);
  },
  onListening: (port) => {
    if (port !== env.port) {
      console.warn(`Configured PORT ${env.port} was busy. Update frontend VITE_API_URL if needed.`);
    }
    console.log(`HALO HOLA API listening on port ${port} (${env.nodeEnv})`);
    console.log(`Server running at: http://localhost:${port}`);
  }
});
