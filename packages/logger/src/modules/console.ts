import type { ILogger, LoggerOptions } from '../interface';

export class ConsoleLogger implements ILogger {
  private readonly level: string = 'info';
  private readonly namespace: string = '';

  constructor(options?: LoggerOptions) {
    this.level = options?.level || 'info';
    this.namespace = options?.namespace || '';
  }
  private group(): void {
    if (this.namespace) {
      console.group(this.namespace);
    }
  }
  debug(message: string, ...args: any[]): void {
    if (this.level === 'debug' || this.level === 'trace') {
      this.group();
      console.debug(message, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.level === 'error' || this.level === 'fatal') {
      this.group();
      console.error(message, ...args);
    }
  }

  fatal(message: string, ...args: any[]): void {
    if (this.level === 'fatal') {
      this.group();
      console.error(message, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (
      this.level === 'info' ||
      this.level === 'debug' ||
      this.level === 'trace'
    ) {
      this.group();
      console.info(message, ...args);
    }
  }

  trace(message: string, ...args: any[]): void {
    if (this.level === 'trace') {
      this.group();
      console.trace(message, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (
      this.level === 'warn' ||
      this.level === 'error' ||
      this.level === 'fatal'
    ) {
      this.group();
      console.warn(message, ...args);
    }
  }
}
