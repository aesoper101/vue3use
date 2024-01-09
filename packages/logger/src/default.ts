import type { ILogger } from './interface';
import { createLogger } from './utils';

let defaultLogger = createLogger({
  level: 'info',
  namespace: 'default',
});

export function setDefaultLogger(logger: ILogger) {
  defaultLogger = logger;
}

export function getDefaultLogger(): ILogger {
  return defaultLogger;
}

export function logTrace(message: string, ...args: any[]) {
  defaultLogger.trace(message, ...args);
}

export function logDebug(message: string, ...args: any[]) {
  defaultLogger.debug(message, ...args);
}

export function logInfo(message: string, ...args: any[]) {
  defaultLogger.info(message, ...args);
}

export function logWarn(message: string, ...args: any[]) {
  defaultLogger.warn(message, ...args);
}

export function logError(message: string, ...args: any[]) {
  defaultLogger.error(message, ...args);
}

export function logFatal(message: string, ...args: any[]) {
  defaultLogger.fatal(message, ...args);
}
