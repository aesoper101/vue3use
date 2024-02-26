import type { IDisposable } from './interface';
import {
  markAsDisposed,
  setParentOfDisposable,
  trackDisposable,
} from './utils';

/**
 * Manages the lifecycle of a disposable value that may be changed.
 *
 * This ensures that when the disposable value is changed, the previously held disposable is disposed of. You can
 * also register a `MutableDisposable` on a `Disposable` to ensure it is automatically cleaned up.
 */
export class MutableDisposable<T extends IDisposable> implements IDisposable {
  private _value?: T;
  private _isDisposed = false;

  constructor() {
    trackDisposable(this);
  }

  get value(): T | undefined {
    return this._isDisposed ? undefined : this._value;
  }

  set value(value: T | undefined) {
    if (this._isDisposed || value === this._value) {
      return;
    }

    this._value?.dispose();
    if (value) {
      setParentOfDisposable(value, this);
    }
    this._value = value;
  }

  /**
   * Resets the stored value and disposed of the previously stored value.
   */
  clear(): void {
    this.value = undefined;
  }

  dispose(): void {
    this._isDisposed = true;
    markAsDisposed(this);
    this._value?.dispose();
    this._value = undefined;
  }

  /**
   * Clears the value, but does not dispose it.
   * The old value is returned.
   */
  clearAndLeak(): T | undefined {
    const oldValue = this._value;
    this._value = undefined;
    if (oldValue) {
      setParentOfDisposable(oldValue, null);
    }
    return oldValue;
  }
}
