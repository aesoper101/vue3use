import { isString } from '@aesoper/shared';

import { Config } from './config';
import type { ConfigSetOptions } from './interface';

export * from './interface';
export * from './config';

const config = new Config();

function defineConfig<T = any>(key: string, value: T): T;
function defineConfig<T = any>(options: ConfigSetOptions<T>): Promise<T>;
function defineConfig<T = any>(
  key: string | ConfigSetOptions<T>,
  value?: T,
): any {
  if (isString(key)) {
    config.set(key, value);
  } else {
    return config.set(key);
  }
}

function getConfig<T = any>(key: string, defaultValue?: T): T;
function getConfig<T = any>(options: ConfigSetOptions<T>): Promise<T>;
function getConfig<T = any>(
  key: string | ConfigSetOptions<T>,
  defaultValue?: T,
): any {
  if (isString(key)) {
    return config.get(key, defaultValue);
  } else {
    return config.get(key);
  }
}

function hasConfig(key: string): boolean {
  return config.has(key);
}

function batchSetConfig(options: Record<string, any>): void;
function batchSetConfig(options: ConfigSetOptions[]): Promise<void>;
function batchSetConfig(
  options: Record<string, any> | ConfigSetOptions[],
): void | Promise<void> {
  return config.batchSet(options);
}

export function getConfigInstance() {
  return config;
}

export { defineConfig, getConfig, hasConfig, batchSetConfig };
