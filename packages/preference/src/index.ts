import type { Nullable } from '@aesoper/shared';

import type { PreferenceGetOptions, PreferenceSetOptions } from './interface';
import { Preference } from './preference';

export * from './interface';
export * from './preference';

const preference = new Preference();

export function getPreferenceInstance() {
  return preference;
}

function getPreference<T = any>(
  options: string,
  defaultValue?: T,
  module?: string,
): Nullable<T>;
function getPreference<T = any>(options: PreferenceGetOptions<T>): Promise<T>;
function getPreference<T = any>(
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

function hasPreference(key: string, module?: string): boolean;
function hasPreference(options: { key: string; module?: string }): boolean;
function hasPreference(
  key: string | { key: string; module?: string },
  module?: string,
): boolean {
  if (typeof key === 'string') {
    return preference.has(key, module);
  }
  return preference.has(key.key, key.module);
}

export { getPreference, setPreference, hasPreference };
