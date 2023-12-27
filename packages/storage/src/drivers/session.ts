import { parse, stringify } from 'zipson';

import type {
  Storage,
  StorageGetItemPromiseOptions,
  StorageOptions,
  StorageRemoveItemPromiseOptions,
  StorageSetItemPromiseOptions,
} from '../interface';

export default class SessionStorage implements Storage {
  private readonly options: Required<StorageOptions> = {
    namespace: '__session_storage__',
    serialize: stringify,
    deserialize: parse,
  };

  constructor(options?: StorageOptions) {
    if (options) {
      if (options.deserialize && options.serialize) {
        this.options.deserialize = options.deserialize;
        this.options.serialize = options.serialize;
      }
      if (options.namespace) {
        this.options.namespace = options.namespace;
      }
    }
  }

  clear(): void;
  clear(callback: () => void): void;
  clear(callback?: () => void): void {
    const keyLength = sessionStorage.length;
    for (let i = 0; i < keyLength; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.options.namespace)) {
        sessionStorage.removeItem(key);
      }
    }

    if (callback) {
      callback();
    }
  }

  private getStorageKey(key: string): string {
    return `${this.options.namespace}${key}`;
  }

  forEach<T>(callback: (key: string, value: T) => void): void {
    const keyLength = sessionStorage.length;
    for (let i = 0; i < keyLength; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.options.namespace)) {
        const value = sessionStorage.getItem(key);
        if (value) {
          callback(key, this.options.deserialize(value));
        }
      }
    }
  }

  getItem<T>(key: string): T | null;
  getItem<T>(key: string, defaultValue: T): T;
  getItem<T>(options: StorageGetItemPromiseOptions<T>): Promise<T>;
  getItem<T>(
    key: string | StorageGetItemPromiseOptions<T>,
    defaultValue?: T,
  ): any {
    if (typeof key === 'string') {
      const value = sessionStorage.getItem(this.getStorageKey(key));
      if (value) {
        return this.options.deserialize(value);
      }
      return defaultValue ?? null;
    } else {
      return new Promise((resolve, reject) => {
        const value = sessionStorage.getItem(this.getStorageKey(key.key));
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
    return sessionStorage.getItem(key) !== null;
  }

  keys(): string[] {
    const keys = [];
    const keyLength = sessionStorage.length;
    for (let i = 0; i < keyLength; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith(this.options.namespace)) {
        keys.push(key);
      }
    }

    return keys;
  }

  length(): number {
    return this.keys().length;
  }

  removeItem(key: string): void;
  removeItem(options: StorageRemoveItemPromiseOptions): Promise<void>;
  removeItem(
    key: string | StorageRemoveItemPromiseOptions,
  ): void | Promise<void> {
    if (typeof key === 'string') {
      sessionStorage.removeItem(this.getStorageKey(key));
    } else {
      return new Promise((resolve, reject) => {
        const result = sessionStorage.getItem(this.getStorageKey(key.key));
        if (result) {
          sessionStorage.removeItem(this.getStorageKey(key.key));
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
      sessionStorage.setItem(
        this.getStorageKey(key),
        this.options.serialize(value),
      );
    } else {
      return new Promise((resolve) => {
        sessionStorage.setItem(
          this.getStorageKey(key.key),
          this.options.serialize(key.value),
        );
        resolve();
      });
    }
  }

  isSupported(): boolean {
    return window?.sessionStorage !== undefined;
  }
}
