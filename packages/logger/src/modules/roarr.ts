import { type Logger, ROARR, Roarr } from 'roarr';

import type { ILogger, LoggerOptions } from '../interface';

ROARR.write = (message: string) => {
  const payload = JSON.parse(message);

  //@ts-ignore
  if (payload.context.logLevel > 30) {
    console.log(payload);
  }
};

export class RoarrLogger implements ILogger {
  private readonly logger: Logger;

  constructor(options?: LoggerOptions) {
    this.logger = Roarr.child({
      namespace: options?.namespace || 'default',
    });
  }

  private stringifyMessage(message: string, ...args: any[]): string {
    if (args.length === 0) {
      return message;
    }

    return JSON.stringify({ message, args });
  }

  debug(message: string, ...args: any[]): void {
    this.logger.debug(this.stringifyMessage(message, ...args));
  }

  error(message: string, ...args: any[]): void {
    this.logger.error(this.stringifyMessage(message, ...args));
  }

  fatal(message: string, ...args: any[]): void {
    this.logger.fatal(this.stringifyMessage(message, ...args));
  }

  info(message: string, ...args: any[]): void {
    this.logger.info(this.stringifyMessage(message, ...args));
  }

  trace(message: string, ...args: any[]): void {
    this.logger.trace(this.stringifyMessage(message, ...args));
  }

  warn(message: string, ...args: any[]): void {
    this.logger.warn(this.stringifyMessage(message, ...args));
  }
}
