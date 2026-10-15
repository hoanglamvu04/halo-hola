import { createApp } from './app.js';
import { env } from './config/env.js';
import { pool } from './database/pool.js';
import { recoverPendingHolaMapsSyncJobs } from './services/holaMaps.service.js';

const app = createApp();

const runHolaMapsSweep=()=>recoverPendingHolaMapsSyncJobs()
  .then((count) => {
    if (count) console.log(`Recovered ${count} pending Hola Maps sync job(s).`);
  })
  .catch((error) => console.warn('Hola Maps sync recovery skipped/failed:', error.message));

const server = app.listen(env.port, () => {
  console.log(`HALO HOLA API listening on port ${env.port} (${env.nodeEnv})`);
  console.log(`Server running at: http://localhost:${env.port}`);
  runHolaMapsSweep();
});

// Scheduled publication jobs become eligible without another admin request.
// A lightweight sweep keeps HOLA Maps within about one minute of the public site.
const holaMapsSweepTimer=setInterval(runHolaMapsSweep,60_000);
holaMapsSweepTimer.unref?.();

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
  clearInterval(holaMapsSweepTimer);
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
