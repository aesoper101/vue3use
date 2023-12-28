import type { Nullable } from '@aesoper/shared';

export interface PreferenceGetOptions<T = any> {
  key: string;
  defaultValue?: T;
  module?: string;
  complete?: () => void;
  success?: (result: T) => void;
  fail?: (result: any) => void;
}

export interface PreferenceSetOptions<T = any> {
  key: string;
  value: T;
  module?: string;
  complete?: () => void;
  success?: (result: T) => void;
  fail?: (result: any) => void;
}

/**
 * @zh 全局偏好设置, 用于存储一些全局的偏好设置, 比如是否开启某个功能, 是否开启某个功能的通知等
 * @en Setting preference globally, used to store some global preference settings, such as whether to enable a certain function, whether to enable notifications for a certain function, etc.
 *
 * @group Setting
 */
export interface IPreference {
  /**
   *
   * @param options
   * @param defaultValue
   * @param module
   */
  get<T = any>(options: string, defaultValue?: T, module?: string): Nullable<T>;

  get<T = any>(options: PreferenceGetOptions<T>): Promise<T>;

  set<T = any>(key: string, value: T, module?: string): void;

  set<T = any>(options: PreferenceSetOptions<T>): Promise<any>;

  has(key: string, module?: string): boolean;

  has(options: { key: string; module?: string }): boolean;
}
