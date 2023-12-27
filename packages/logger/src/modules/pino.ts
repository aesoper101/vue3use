import { type LevelOrString, type Logger, pino } from 'pino';

import type { ILogger, LogLevel, LoggerOptions } from '../interface';

export class PinoLogger implements ILogger {
  private readonly logger: Logger;

  constructor(options?: LoggerOptions) {
    this.logger = pino({
      name: options?.namespace,
      browser: { asObject: true },
      level: this.getLevel(options?.level || 'info'),
    });
  }
  private getLevel(level: LogLevel): LevelOrString {
    switch (level) {
      case 'trace':
        return 'trace';
      case 'debug':
        return 'debug';
      case 'info':
        return 'info';
      case 'warn':
        return 'warn';
      case 'error':
        return 'error';
      case 'fatal':
        return 'fatal';
      default:
        return 'info';
    }
  }

  trace(message: string, ...args: any[]) {
    this.logger.trace(message, ...args);
  }

  debug(message: string, ...args: any[]): void {
    this.logger.debug(message, ...args);
  }

  error(message: string, ...args: any[]): void {
    this.logger.error(message, ...args);
  }

  fatal(message: string, ...args: any[]): void {
    this.logger.fatal(message, ...args);
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(message, ...args);
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn(message, ...args);
  }
}
