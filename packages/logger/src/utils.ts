import type { ILogger, LoggerOptions } from './interface';
import {
  ConsolaLogger,
  ConsoleLogger,
  PinoLogger,
  RoarrLogger,
} from './modules';

export interface CreateLoggerOptions extends LoggerOptions {
  driver?: 'pino' | 'consola' | 'roarr' | 'console';
}

export function createLogger(options?: CreateLoggerOptions): ILogger {
  switch (options?.driver) {
    case 'pino':
      return new PinoLogger(options);
    case 'consola':
      return new ConsolaLogger(options);
    case 'roarr':
      return new RoarrLogger(options);
    default:
      return new ConsoleLogger(options);
  }
}
