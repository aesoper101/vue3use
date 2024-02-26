import type { IDisposable } from './interface';
import { markAsDisposed, trackDisposable } from './utils';

/**
 * A safe disposable can be `unset` so that a leaked reference (listener)
 * can be cut-off.
 */
export class SafeDisposable implements IDisposable {
  dispose: () => void = () => {};
  unset: () => void = () => {};
  isset: () => boolean = () => false;

  constructor() {
    trackDisposable(this);
  }

  set(fn: Function) {
    let callback: Function | undefined = fn;
    this.unset = () => (callback = undefined);
    this.isset = () => callback !== undefined;
    this.dispose = () => {
      if (callback) {
        callback();
        callback = undefined;
        markAsDisposed(this);
      }
    };
    return this;
  }
}
