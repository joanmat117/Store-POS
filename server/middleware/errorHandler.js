import { logger } from '../logger.js';

export function errorHandler(err, _req, res, _next) {
  logger.error({ err }, 'Unhandled error');
  res.status(500).json({ error: err.message || 'Server error' });
}
