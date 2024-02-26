import { dispose } from './dispose';
import type { IDisposable } from './interface';
import { markAsDisposed, trackDisposable } from './utils';

/**
 * A map the manages the lifecycle of the values that it stores.
 */
export class DisposableMap<K, V extends IDisposable = IDisposable>
  implements IDisposable
{
  private readonly _store = new Map<K, V>();
  private _isDisposed = false;

  constructor() {
    trackDisposable(this);
  }

  /**
   * Disposes of all stored values and mark this object as disposed.
   *
   * Trying to use this object after it has been disposed of is an error.
   */
  dispose(): void {
    markAsDisposed(this);
    this._isDisposed = true;
    this.clearAndDisposeAll();
  }

  /**
   * Disposes of all stored values and clear the map, but DO NOT mark this object as disposed.
   */
  clearAndDisposeAll(): void {
    if (!this._store.size) {
      return;
    }

    try {
      dispose(this._store.values());
    } finally {
      this._store.clear();
    }
  }

  has(key: K): boolean {
    return this._store.has(key);
  }

  get size(): number {
    return this._store.size;
  }

  get(key: K): V | undefined {
    return this._store.get(key);
  }

  set(key: K, value: V, skipDisposeOnOverwrite = false): void {
    if (this._isDisposed) {
      console.warn(
        new Error(
          'Trying to add a disposable to a DisposableMap that has already been disposed of. The added object will be leaked!',
        ).stack,
      );
    }

    if (!skipDisposeOnOverwrite) {
      this._store.get(key)?.dispose();
    }

    this._store.set(key, value);
  }

  /**
   * Delete the value stored for `key` from this map and also dispose of it.
   */
  deleteAndDispose(key: K): void {
    this._store.get(key)?.dispose();
    this._store.delete(key);
  }

  keys(): IterableIterator<K> {
    return this._store.keys();
  }

  values(): IterableIterator<V> {
    return this._store.values();
  }

  [Symbol.iterator](): IterableIterator<[K, V]> {
    return this._store[Symbol.iterator]();
  }
}
