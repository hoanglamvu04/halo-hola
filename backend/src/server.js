import { createApp } from './app.js';
import { env } from './config/env.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`HALO HOLA API listening on port ${env.port} (${env.nodeEnv})`);
  console.log(`Server running at: http://localhost:${env.port}`);
});

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use. Stop the other process or change PORT and VITE_API_URL together.`);
    process.exit(1);
  }

  throw error;
});
