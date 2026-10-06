import crypto from 'node:crypto';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { resolveCorsOrigin } from './config/cors.js';
import { pool } from './database/pool.js';
import { uploadRoot } from './middleware/upload.js';
import { generalApiRateLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import contentRoutes from './routes/content.routes.js';
import top52Routes from './routes/top52.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminPreviewRoutes from './routes/adminPreview.routes.js';
import publicationRoutes from './routes/publication.routes.js';
import juryRoutes from './routes/jury.routes.js';
import juryBoardRoutes from './routes/juryBoard.routes.js';
import juryResultsRoutes from './routes/juryResults.routes.js';
import tourRegistrationsRoutes from './routes/tourRegistrations.routes.js';
import siteRoutes from './routes/site.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import colorAdminRoutes from './routes/colorAdmin.routes.js';
import themeAdminRoutes from './routes/themeAdmin.routes.js';

function isSensitivePath(pathname='') {
  return pathname.startsWith('/api/auth') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/jury') ||
    pathname.startsWith('/api/submissions/lookup');
}

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.nodeEnv === 'production') app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: resolveCorsOrigin }));
  app.use((req,res,next)=>{
    req.requestId=crypto.randomUUID();
    res.set('X-Request-Id',req.requestId);
    if(isSensitivePath(req.path)) res.set('Cache-Control','no-store');
    next();
  });
  app.use(express.json({ limit: '2mb', strict: true }));

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  // Local storage is a fallback for public CMS/site assets only. Submission
  // originals must never become guessable static files on production.
  app.get('/uploads/:filename', async (req,res,next)=>{
    try{
      const filename=path.basename(String(req.params.filename||''));
      if(!filename || filename!==req.params.filename) return res.status(404).end();
      const { rowCount }=await pool.query(
        `SELECT 1 FROM site_assets
         WHERE storage_provider='LOCAL' AND object_key=$1
         LIMIT 1`,
        [filename]
      );
      if(!rowCount) return res.status(404).end();
      res.set('Cache-Control',env.nodeEnv==='production'?'public, max-age=2592000':'no-cache');
      res.set('X-Content-Type-Options','nosniff');
      return res.sendFile(filename,{root:uploadRoot,dotfiles:'deny'},(error)=>{
        if(error&&!res.headersSent) next(error);
      });
    }catch(error){return next(error);}
  });

  app.use('/api', generalApiRateLimiter);

  app.get('/api/health', (_req, res) => {
    res.set('Cache-Control','no-store');
    res.json({ ok: true, service: 'halo-hola-api' });
  });

  app.get('/api/ready', async (_req,res)=>{
    res.set('Cache-Control','no-store');
    try{
      await pool.query('SELECT 1');
      res.json({ok:true,service:'halo-hola-api',database:'ready'});
    }catch(error){
      console.error('Readiness check failed:',error.message);
      res.status(503).json({ok:false,service:'halo-hola-api',database:'unavailable'});
    }
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/submissions', submissionsRoutes);
  app.use('/api/tour-registrations', tourRegistrationsRoutes);
  app.use('/api/top52', top52Routes);
  app.use('/api', siteRoutes);
  app.use('/api', contentRoutes);
  app.use('/api', analyticsRoutes);
  app.use('/api/jury', juryRoutes);
  app.use('/api/admin/jury-board', juryBoardRoutes);
  app.use('/api/admin/jury-results', juryResultsRoutes);
  app.use('/api/admin/publication', publicationRoutes);
  app.use('/api/admin/public-preview', adminPreviewRoutes);
  app.use('/api/admin/colors', colorAdminRoutes);
  app.use('/api/admin/themes', themeAdminRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
