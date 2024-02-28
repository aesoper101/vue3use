import { LocalStorage, MemoryStorage, SessionStorage } from './drivers';
import type { Storage, StorageOptions } from './interface';

type StorageConstructor<T extends StorageOptions = StorageOptions> = new (
  options?: T,
) => Storage;

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

type StorageDriver =
  | 'localStorage'
  | 'sessionStorage'
  | 'memoryStorage'
  | string;

export interface CreateStorageOptions extends StorageOptions {
  drivers?: StorageDriver[];
}

export function createStorage(
  args: CreateStorageOptions = {
    drivers: ['localStorage', 'sessionStorage', 'memoryStorage'],
  },
): Storage {
  const { drivers, ...options } = args;
  let storage: Storage | null = null;

  for (const driver in drivers) {
    const storageConstructor = registry.get(driver);
    if (storageConstructor) {
      storage = new storageConstructor(options);
      if (storage.isSupported()) {
        break;
      }
    }
  }

  if (!storage) {
    throw new Error('No storage driver is supported.');
  }

  return storage;
}
