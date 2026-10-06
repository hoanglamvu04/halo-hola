import { env } from '../config/env.js';

export function notFoundHandler(req, res) {
  res.status(404).json({ error: 'Not found', path: req.originalUrl, requestId: req.requestId || undefined });
}

export function errorHandler(error, req, res, _next) {
  const statusCode = error.statusCode && error.statusCode >= 400 ? error.statusCode : 500;
  const operational = error.isOperational === true;

  if (!operational) console.error(`[${req.requestId || 'no-request-id'}]`, error);

  const body = {
    error: operational ? error.message : 'Internal server error.',
    requestId: req.requestId || undefined
  };
  if (error.details) body.details = error.details;
  if (env.nodeEnv !== 'production' && !operational) body.stack = error.stack;

  res.status(statusCode).json(body);
}
