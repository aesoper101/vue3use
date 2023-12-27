import { createConsola } from 'consola';
import type { ConsolaInstance, LogLevel } from 'consola';

import type {
  ILogger,
  LogLevel as InnerLogLevel,
  LoggerOptions,
} from '../interface';

export class ConsolaLogger implements ILogger {
  private logger: ConsolaInstance;

  constructor(options?: LoggerOptions) {
    this.logger = createConsola({
      level: this.convertLogLevel(options?.level || 'info'),
    });
    if (options?.namespace) {
      this.logger = this.logger.withTag(options.namespace);
    }
  }

  convertLogLevel(level: InnerLogLevel): LogLevel {
    switch (level) {
      case 'trace':
        return 5;
      case 'debug':
        return 4;
      case 'info':
        return 3;
      case 'warn':
        return 2;
      case 'error':
        return 1;
      case 'fatal':
        return 0;
      // case 'silent':
      //   return -999;
      // case 'verbose':
      //   return 999;
      default:
        return 3;
    }
  }

  debug(message: string, ...args: any[]): void {
    this.logger.debug({ message, args });
  }

  error(message: string, ...args: any[]): void {
    this.logger.error({ message, args });
  }

  fatal(message: string, ...args: any[]): void {
    this.logger.fatal({ message, args });
  }

  info(message: string, ...args: any[]): void {
    this.logger.info({ message, args });
  }

  trace(message: string, ...args: any[]): void {
    this.logger.trace({ message, args });
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn({ message, args });
  }
}
