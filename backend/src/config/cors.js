import { env } from './env.js';

export function resolveCorsOrigin(origin, callback) {
  if (!origin) return callback(null, true);

  if (env.nodeEnv !== 'production') {
    if (/^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)) {
      return callback(null, true);
    }
  }

  if (env.corsOrigins.includes(origin)) return callback(null, true);
  return callback(new Error('Origin is not allowed by CORS.'));
}
