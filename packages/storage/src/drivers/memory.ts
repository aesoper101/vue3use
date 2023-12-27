import { parse, stringify } from 'zipson';

import type {
  Storage,
  StorageGetItemPromiseOptions,
  StorageOptions,
  StorageRemoveItemPromiseOptions,
  StorageSetItemPromiseOptions,
} from '../interface';

export default class MemoryStorage implements Storage {
  private readonly options: Required<StorageOptions> = {
    namespace: '__memory_storage__',
    serialize: stringify,
    deserialize: parse,
  };

  private readonly configs: Map<string, any> = new Map();

  constructor(options?: StorageOptions) {
    if (options && options.namespace) {
      this.options.namespace = options.namespace;
    }
  }

  clear(): void;
  clear(callback: () => void): void;
  clear(callback?: () => void): void {
    this.configs.clear();

    if (callback) {
      callback();
    }
  }

  forEach<T>(callback: (key: string, value: T) => void): void {
    this.configs.forEach((value, key) => {
      callback(key, value);
    });
  }

  getItem<T>(key: string): T | null;
  getItem<T>(key: string, defaultValue: T): T;
  getItem<T>(options: StorageGetItemPromiseOptions<T>): Promise<T>;
  getItem<T>(
    key: string | StorageGetItemPromiseOptions<T>,
    defaultValue?: T,
  ): any {
    if (typeof key === 'string') {
      const value = this.configs.get(key);
      return value ?? defaultValue ?? null;
    } else {
      return new Promise((resolve, reject) => {
        const value = this.configs.get(key.key);

        if (value) {
          resolve(this.options.deserialize(value));
        } else if (key.defaultValue) {
          resolve(key.defaultValue);
        } else {
          reject(new Error(`Key ${key.key} not found`));
        }
      });
    }
  }

  has(key: string): boolean {
    return this.configs.has(key);
  }

  keys(): string[] {
    const keys: string[] = [];
    this.configs.forEach((value, key) => {
      keys.push(key);
    });
    return keys;
  }

  length(): number {
    return this.configs.size;
  }

  removeItem(key: string): void;
  removeItem(options: StorageRemoveItemPromiseOptions): Promise<void>;
  removeItem(
    key: string | StorageRemoveItemPromiseOptions,
  ): void | Promise<void> {
    if (typeof key === 'string') {
      this.configs.delete(key);
    } else {
      return new Promise((resolve, reject) => {
        const result = this.configs.has(key.key);
        if (result) {
          this.configs.delete(key.key);
          resolve();
        } else if (key.errorIfNotExists) {
          reject(new Error(`Key ${key.key} not found`));
        } else {
          resolve();
        }
      });
    }
  }

  setItem<T>(key: string, value: T): void;
  setItem<T>(options: StorageSetItemPromiseOptions<T>): Promise<void>;
  setItem<T>(
    key: string | StorageSetItemPromiseOptions<T>,
    value?: T,
  ): void | Promise<void> {
    if (typeof key === 'string') {
      this.configs.set(key, value);
    } else {
      return new Promise((resolve) => {
        this.configs.set(key.key, key.value);
        resolve();
      });
    }
  }

  isSupported(): boolean {
    return true;
  }
}
