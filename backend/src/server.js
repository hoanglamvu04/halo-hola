import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './database/pool.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`HALO HOLA API listening on port ${env.port} (${env.nodeEnv})`);
  console.log(`Server running at: http://localhost:${env.port}`);
});

server.keepAliveTimeout = 65_000;
server.headersTimeout = 70_000;
server.requestTimeout = 125_000;

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${env.port} is already in use. Stop the other process or change PORT and VITE_API_URL together.`);
    process.exit(1);
  }

  throw error;
});

let shuttingDown=false;
async function shutdown(signal){
  if(shuttingDown) return;
  shuttingDown=true;
  console.log(`${signal} received. Draining HALO HOLA API...`);

  const hardStop=setTimeout(()=>{
    console.error('Graceful shutdown timed out.');
    process.exit(1);
  },15_000);
  hardStop.unref();

  server.close(async(error)=>{
    if(error){
      console.error('HTTP server close failed:',error);
      process.exit(1);
    }
    try{
      await pool.end();
      console.log('HALO HOLA API stopped cleanly.');
      process.exit(0);
    }catch(dbError){
      console.error('Database pool close failed:',dbError);
      process.exit(1);
    }
  });
}

process.on('SIGTERM',()=>shutdown('SIGTERM'));
process.on('SIGINT',()=>shutdown('SIGINT'));
