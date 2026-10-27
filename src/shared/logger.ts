type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

interface LogBindings {
  [key: string]: unknown;
}

interface Logger {
  trace: (bindings?: LogBindings, msg?: string) => void;
  debug: (bindings?: LogBindings, msg?: string) => void;
  info: (bindings?: LogBindings, msg?: string) => void;
  warn: (bindings?: LogBindings, msg?: string) => void;
  error: (bindings?: LogBindings, msg?: string) => void;
  fatal: (bindings?: LogBindings, msg?: string) => void;
  child: (bindings: LogBindings) => Logger;
}

function formatMessage(level: LogLevel, bindings: LogBindings | undefined, msg: string): string {
  const timestamp = new Date().toISOString();
  const base = `[${timestamp}] [${level.toUpperCase()}]`;
  if (bindings && Object.keys(bindings).length > 0) {
    return `${base} ${msg} ${JSON.stringify(bindings)}`;
  }
  return `${base} ${msg}`;
}

function createConsoleLogger(): Logger {
  const log = (level: LogLevel, bindings?: LogBindings, msg?: string) => {
    if (!msg && bindings) {
      console[level === 'fatal' ? 'error' : level](
        formatMessage(level, {}, JSON.stringify(bindings))
      );
      return;
    }
    if (!msg) return;
    console[level === 'fatal' ? 'error' : level](formatMessage(level, bindings, msg));
  };

  return {
    trace: (bindings?: LogBindings, msg?: string) => log('trace', bindings, msg),
    debug: (bindings?: LogBindings, msg?: string) => log('debug', bindings, msg),
    info: (bindings?: LogBindings, msg?: string) => log('info', bindings, msg),
    warn: (bindings?: LogBindings, msg?: string) => log('warn', bindings, msg),
    error: (bindings?: LogBindings, msg?: string) => log('error', bindings, msg),
    fatal: (bindings?: LogBindings, msg?: string) => log('fatal', bindings, msg),
    child: (bindings: LogBindings) => {
      const parent = createConsoleLogger();
      const original = { ...parent };
      return {
        trace: (b?: LogBindings, msg?: string) => original.trace({ ...bindings, ...b }, msg),
        debug: (b?: LogBindings, msg?: string) => original.debug({ ...bindings, ...b }, msg),
        info: (b?: LogBindings, msg?: string) => original.info({ ...bindings, ...b }, msg),
        warn: (b?: LogBindings, msg?: string) => original.warn({ ...bindings, ...b }, msg),
        error: (b?: LogBindings, msg?: string) => original.error({ ...bindings, ...b }, msg),
        fatal: (b?: LogBindings, msg?: string) => original.fatal({ ...bindings, ...b }, msg),
        child: (b: LogBindings) => parent.child({ ...bindings, ...b }),
      };
    },
  };
}

export const logger = createConsoleLogger();

export function createChildLogger(bindings: LogBindings): Logger {
  return logger.child(bindings);
}

export default logger;
