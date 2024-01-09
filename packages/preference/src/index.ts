import type { Nullable } from '@aesoper/shared';

import type { PreferenceGetOptions, PreferenceSetOptions } from './interface';
import { Preference } from './preference';

export * from './interface';
export * from './preference';

let preference = new Preference();

/**
 * @zh 设置偏好设置实例, 一般不需要设置, 除非需要自定义偏好设置,注意必须在使用偏好设置之前设置
 * @en Set preference instance , generally no need to set, unless you need to customize the preference settings, note that you must set before using the preference settings
 * @param instance
 */
export function setPreferenceInstance(instance: Preference) {
  preference = instance;
}

export function getPreferenceInstance() {
  return preference;
}

export function getPreference<T = any>(
  options: string,
  defaultValue?: T,
  module?: string,
): Nullable<T>;
export function getPreference<T = any>(
  options: PreferenceGetOptions<T>,
): Promise<T>;
export function getPreference<T = any>(
  options: string | PreferenceGetOptions<T>,
  defaultValue?: T,
  module?: string,
): any {
  if (typeof options === 'string') {
    return preference.get(options, defaultValue, module);
  }
  return preference.get(options);
}

function setPreference<T = any>(key: string, value: T, module?: string): void;
function setPreference<T = any>(options: PreferenceSetOptions<T>): Promise<any>;
function setPreference<T = any>(
  options: string | PreferenceSetOptions<T>,
  value?: T,
  module?: string,
): any {
  if (typeof options === 'string') {
    preference.set(options, value, module);
  } else {
    preference.set(options);
  }
}

export function hasPreference(key: string, module?: string): boolean;
export function hasPreference(options: {
  key: string;
  module?: string;
}): boolean;
export function hasPreference(
  key: string | { key: string; module?: string },
  module?: string,
): boolean {
  if (typeof key === 'string') {
    return preference.has(key, module);
  }
  return preference.has(key.key, key.module);
}
