import { DisposableStore } from './disposable-store';
import type { IDisposable } from './interface';
import {
  markAsDisposed,
  setParentOfDisposable,
  trackDisposable,
} from './utils';

/**
 * Abstract base class for a {@link IDisposable disposable} object.
 *
 * Subclasses can {@linkcode _register} disposables that will be automatically cleaned up when this object is disposed of.
 */
export abstract class Disposable implements IDisposable {
  /**
   * A disposable that does nothing when it is disposed of.
   *
   * TODO: This should not be a static property.
   */
  static readonly None = Object.freeze<IDisposable>({ dispose() {} });

  protected readonly _store = new DisposableStore();

  constructor() {
    trackDisposable(this);
    setParentOfDisposable(this._store, this);
  }

  public dispose(): void {
    markAsDisposed(this);

    this._store.dispose();
  }

  /**
   * Adds `o` to the collection of disposables managed by this object.
   */
  protected _register<T extends IDisposable>(o: T): T {
    if ((o as unknown as Disposable) === this) {
      throw new Error('Cannot register a disposable on itself!');
    }
    return this._store.add(o);
  }
}
