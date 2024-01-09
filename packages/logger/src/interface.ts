export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LoggerOptions {
  level?: LogLevel;
  namespace?: string;
}

export interface ILogger {
  trace(message: string, ...args: any[]): void;

  debug(message: string, ...args: any[]): void;

  info(message: string, ...args: any[]): void;

  warn(message: string, ...args: any[]): void;

  error(message: string, ...args: any[]): void;

  fatal(message: string, ...args: any[]): void;

  group(name: string): ILogger;
}
