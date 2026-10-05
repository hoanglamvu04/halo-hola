import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env.js';
import { resolveCorsOrigin } from './config/cors.js';
import { uploadRoot } from './middleware/upload.js';
import { generalApiRateLimiter } from './middleware/rateLimit.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import submissionsRoutes from './routes/submissions.routes.js';
import contentRoutes from './routes/content.routes.js';
import adminRoutes from './routes/admin.routes.js';
import adminPreviewRoutes from './routes/adminPreview.routes.js';
import juryRoutes from './routes/jury.routes.js';
import juryBoardRoutes from './routes/juryBoard.routes.js';
import juryResultsRoutes from './routes/juryResults.routes.js';
import tourRegistrationsRoutes from './routes/tourRegistrations.routes.js';
import siteRoutes from './routes/site.routes.js';

export function createApp() {
  const app = express();

  app.disable('x-powered-by');
  if (env.nodeEnv === 'production') app.set('trust proxy', 1);
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({ origin: resolveCorsOrigin }));
  app.use(express.json({ limit: '2mb' }));

  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.use('/uploads', express.static(uploadRoot, {
    maxAge: env.nodeEnv === 'production' ? '30d' : 0,
    etag: true
  }));

  app.use('/api', generalApiRateLimiter);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'halo-hola-api', env: env.nodeEnv });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/submissions', submissionsRoutes);
  app.use('/api/tour-registrations', tourRegistrationsRoutes);
  app.use('/api', siteRoutes);
  app.use('/api', contentRoutes);
  app.use('/api/jury', juryRoutes);
  app.use('/api/admin/jury-board', juryBoardRoutes);
  app.use('/api/admin/jury-results', juryResultsRoutes);
  app.use('/api/admin/public-preview', adminPreviewRoutes);
  app.use('/api/admin', adminRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
