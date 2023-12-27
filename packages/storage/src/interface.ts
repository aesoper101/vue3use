export interface StorageGetItemPromiseOptions<T> {
  key: string;
  defaultValue?: T;
}

export interface StorageSetItemPromiseOptions<T> {
  key: string;
  value: T;
}

export interface StorageRemoveItemPromiseOptions {
  key: string;
  errorIfNotExists?: boolean;
}

export interface StorageOptions {
  namespace?: string;
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
}

export interface Storage {
  getItem<T>(key: string): T | null;

  getItem<T>(key: string, defaultValue: T): T;

  getItem<T>(options: StorageGetItemPromiseOptions<T>): Promise<T>;

  setItem<T>(key: string, value: T): void;

  setItem<T>(options: StorageSetItemPromiseOptions<T>): Promise<void>;

  removeItem(key: string): void;

  removeItem(options: StorageRemoveItemPromiseOptions): Promise<void>;

  clear(): void;

  clear(callback: () => void): void;

  has(key: string): boolean;

  keys(): string[];

  length(): number;

  forEach<T>(callback: (key: string, value: T) => void): void;

  isSupported(): boolean;
}
