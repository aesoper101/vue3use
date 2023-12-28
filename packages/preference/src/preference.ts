import type { Nullable } from '@aesoper/shared';
import { type Storage, createStorage } from '@aesoper/storage';

import type {
  IPreference,
  PreferenceGetOptions,
  PreferenceSetOptions,
} from './interface';

interface PreferenceOptions {
  namespace?: string;
  storage?: Storage;
}

export class Preference implements IPreference {
  private readonly storage: Storage;
  private readonly namespace: string;
  constructor(options: PreferenceOptions = { namespace: 'pro' }) {
    const { namespace = 'pro', storage } = options;
    this.namespace = namespace;
    this.storage = storage
      ? storage
      : createStorage({
          drivers: ['localStorage', 'memoryStorage'],
          namespace: namespace,
        });
  }

  private getStorageKey(key: string, module?: string) {
    const moduleKey = module || '__inner__';
    return `${this.namespace}_${moduleKey}.${key}`;
  }

  get<T = any>(options: string, defaultValue?: T, module?: string): Nullable<T>;
  get<T = any>(options: PreferenceGetOptions<T>): Promise<T>;
  get<T = any>(
    options: string | PreferenceGetOptions<T>,
    defaultValue?: T,
    module?: string,
  ): any {
    if (typeof options === 'string') {
      const value = this.storage.getItem<T>(
        this.getStorageKey(options, module),
      );
      return value ?? defaultValue ?? null;
    } else {
      return new Promise((resolve, reject) => {
        const value = this.storage.getItem<T>(
          this.getStorageKey(options.key, options.module),
        );

        if (value) {
          resolve(value);
        } else if (options.defaultValue) {
          resolve(options.defaultValue);
        } else {
          reject(new Error(`Key ${options.key} not found`));
        }
      });
    }
  }

  has(key: string, module?: string): boolean;
  has(options: { key: string; module?: string }): boolean;
  has(
    key: string | { key: string; module?: string },
    module?: string,
  ): boolean {
    if (typeof key === 'string') {
      return this.storage.has(this.getStorageKey(key, module));
    } else {
      return this.storage.has(this.getStorageKey(key.key, key.module));
    }
  }

  set<T = any>(key: string, value: T, module?: string): void;
  set<T = any>(options: PreferenceSetOptions<T>): Promise<any>;
  set<T = any>(
    key: string | PreferenceSetOptions<T>,
    value?: T,
    module?: string,
  ): void | Promise<any> {
    if (typeof key === 'string') {
      this.storage.setItem(this.getStorageKey(key, module), value);
    } else {
      return this.storage.setItem(
        this.getStorageKey(key.key, key.module),
        key.value,
      );
    }
  }
}
