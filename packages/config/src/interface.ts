import type { Nullable } from '@aesoper/shared';

export interface ConfigGetOptions<T = any> {
  key: string;
  defaultValue?: T;
  wait?: boolean;
  waitOnce?: boolean;
  complete?: () => void;
  success?: (result: T) => void;
  fail?: (result: any) => void;
}

export interface ConfigSetOptions<T = any> {
  key: string;
  value: T;
  complete?: () => void;
  success?: (result: T) => void;
  fail?: (result: any) => void;
}

/**
 * @zh  配置
 * @en  config
 *
 */
export interface ConfigInterface {
  /**
   * @zh 同步获取配置
   *
   * @param key
   * @param defaultValue
   */
  get<T = any>(key: string, defaultValue?: T): Nullable<T>;

  get<T = any>(options: ConfigGetOptions<T>): Promise<T>;

  /**
   * @zh 设置配置
   * @en Set config
   *
   * @param key
   * @param value
   */
  set<T = any>(key: string, value: T): T;

  set<T = any>(option: ConfigSetOptions<T>): Promise<T>;

  /**
   * @zh 批量设置配置
   * @en Batch set config
   *
   * @param config
   */
  batchSet(config: Record<string, any>): void;

  batchSet(config: ConfigSetOptions[]): Promise<void>;

  /**
   * @zh 是否存在配置
   * @en Whether the config exists
   *
   * @param key
   * @returns
   */
  has(key: string): boolean;
}
