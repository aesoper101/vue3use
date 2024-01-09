import { isString } from '@aesoper/shared';

import { Config } from './config';
import type { ConfigInterface, ConfigSetOptions } from './interface';

export * from './interface';
export * from './config';

let config: ConfigInterface = new Config();

/**
 * @zh 设置配置实例, 一般不需要设置, 除非需要自定义配置,注意必须在使用配置之前设置
 * @en Set config instance , generally no need to set, unless you need to customize the config, note that you must set before using the config
 * @param instance
 */
export function setConfigInstance(instance: ConfigInterface) {
  config = instance;
}

export function getConfigInstance(): ConfigInterface {
  return config;
}

export function defineConfig<T = any>(key: string, value: T): T;
export function defineConfig<T = any>(options: ConfigSetOptions<T>): Promise<T>;
export function defineConfig<T = any>(
  key: string | ConfigSetOptions<T>,
  value?: T,
): any {
  if (isString(key)) {
    config.set(key, value);
  } else {
    return config.set(key);
  }
}

export function getConfig<T = any>(key: string, defaultValue?: T): T;
export function getConfig<T = any>(options: ConfigSetOptions<T>): Promise<T>;
export function getConfig<T = any>(
  key: string | ConfigSetOptions<T>,
  defaultValue?: T,
): any {
  if (isString(key)) {
    return config.get(key, defaultValue);
  } else {
    return config.get(key);
  }
}

export function hasConfig(key: string): boolean {
  return config.has(key);
}

export function batchSetConfig(options: Record<string, any>): void;
export function batchSetConfig(options: ConfigSetOptions[]): Promise<void>;
export function batchSetConfig(
  options: Record<string, any> | ConfigSetOptions[],
): void | Promise<void> {
  return config.batchSet(options);
}
