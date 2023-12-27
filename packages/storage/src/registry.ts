import { LocalStorage, MemoryStorage, SessionStorage } from './drivers';
import type { Storage, StorageOptions } from './interface';

type StorageConstructor = new (options?: StorageOptions) => Storage;

const registry = new Map<string, StorageConstructor>();
registry.set('localStorage', LocalStorage);
registry.set('sessionStorage', SessionStorage);
registry.set('memoryStorage', MemoryStorage);

export function registerStorage(name: string, storage: StorageConstructor) {
  if (registry.has(name)) {
    throw new Error(`Storage driver "${name}" already exists.`);
  }

  registry.set(name, storage);
}

export interface CreateStorageOptions extends StorageOptions {
  driver?: 'localStorage' | 'sessionStorage' | string;
}

export function createStorage(
  args: CreateStorageOptions = { driver: 'localStorage' },
): Storage {
  const { driver = 'localStorage' } = args;

  const storage = registry.get(driver);
  if (!storage) {
    throw new Error(`Storage driver "${driver}" does not exist.`);
  }

  const stg = new storage(args);
  if (!stg.isSupported()) {
    throw new Error(`Storage driver "${driver}" is not supported.`);
  }

  return stg;
}
