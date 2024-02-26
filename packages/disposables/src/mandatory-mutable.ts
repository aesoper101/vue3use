import type { IDisposable } from './interface';
import { MutableDisposable } from './mutable-disposable';

/**
 * Manages the lifecycle of a disposable value that may be changed like {@link MutableDisposable}, but the value must
 * exist and cannot be undefined.
 */
export class MandatoryMutableDisposable<T extends IDisposable>
  implements IDisposable
{
  private _disposable = new MutableDisposable<T>();
  private _isDisposed = false;

  constructor(initialValue: T) {
    this._disposable.value = initialValue;
  }

  get value(): T {
    return this._disposable.value!;
  }

  set value(value: T) {
    if (this._isDisposed || value === this._disposable.value) {
      return;
    }
    this._disposable.value = value;
  }

  dispose() {
    this._isDisposed = true;
    this._disposable.dispose();
  }
}
