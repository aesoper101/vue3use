import type { Thenable } from '../types';
import { isThenable } from './is';

export function asPromise<T>(callback: () => T | Thenable<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const item = callback();
    if (isThenable<T>(item)) {
      item.then(resolve, reject);
    } else {
      resolve(item);
    }
  });
}

export function raceTimeout<T>(
  promise: Promise<T>,
  timeout: number,
  onTimeout?: () => void,
): Promise<T | undefined> {
  let promiseResolve: ((value: T | undefined) => void) | undefined = undefined;

  const timer = setTimeout(() => {
    promiseResolve?.(undefined);
    onTimeout?.();
  }, timeout);

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    new Promise<T | undefined>((resolve) => (promiseResolve = resolve)),
  ]);
}

/**
 * @en Creates and returns a new promise, plus its `resolve` and `reject` callbacks.
 * @zh 创建并返回一个新的 Promise，以及它的 `resolve` 和 `reject` 回调。
 */
export function promiseWithResolvers<T>(): {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (err?: any) => void;
} {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve: resolve!, reject: reject! };
}

/**
 * @en A barrier that is initially closed and then becomes opened permanently.
 * @zh 一个初始状态为关闭的屏障，然后永久打开。
 */
export class Barrier {
  private _isOpen: boolean;
  private _promise: Promise<boolean>;
  private _completePromise!: (v: boolean) => void;

  constructor() {
    this._isOpen = false;
    this._promise = new Promise<boolean>((c, e) => {
      this._completePromise = c;
    });
  }

  isOpen(): boolean {
    return this._isOpen;
  }

  open(): void {
    this._isOpen = true;
    this._completePromise(true);
  }

  wait(): Promise<boolean> {
    return this._promise;
  }
}

/**
 * @en A barrier that is initially closed and then becomes opened permanently after a certain period of
 * time or when open is called explicitly.
 *
 * @zh 一个初始状态为关闭的屏障，然后在一定时间后或者在调用 open 方法后永久打开。
 */
export class AutoOpenBarrier extends Barrier {
  private readonly _timeout: any;

  constructor(autoOpenTimeMs: number) {
    super();
    this._timeout = setTimeout(() => this.open(), autoOpenTimeMs);
  }

  override open(): void {
    clearTimeout(this._timeout);
    super.open();
  }
}
