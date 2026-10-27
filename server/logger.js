import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const transport = isDev
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    }
  : undefined;

/** @type {import('pino').Logger} */
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  transport,
  base: {
    service: 'store-pos-api',
  },
});

/**
 * @param {Record<string, unknown>} bindings
 * @returns {import('pino').Logger}
 */
export function createChildLogger(bindings) {
  return logger.child(bindings);
}

export default logger;
