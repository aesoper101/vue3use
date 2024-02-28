import { createSingleCallFunction } from '@aesoper/shared';
import { Disposable } from './disposable';
import { DisposableStore } from './disposable-store';
import { dispose } from './dispose';
import type { IDisposable, IDisposableTracker } from './interface';

/**
 * Check if `thing` is {@link IDisposable disposable}.
 */
export function isDisposable<E extends object>(
  thing: E,
): thing is E & IDisposable {
  return (
    typeof (<IDisposable>thing).dispose === 'function' &&
    (<IDisposable>thing).dispose.length === 0
  );
}

export function disposeIfDisposable<T extends IDisposable | object>(
  disposables: Array<T>,
): Array<T> {
  for (const d of disposables) {
    if (isDisposable(d)) {
      d.dispose();
    }
  }
  return [];
}

/**
 * Combine multiple disposable values into a single {@link IDisposable}.
 */
export function combinedDisposable(...disposables: IDisposable[]): IDisposable {
  const parent = toDisposable(() => dispose(disposables));
  setParentOfDisposables(disposables, parent);
  return parent;
}

/**
 * Turn a function that implements dispose into an {@link IDisposable}.
 *
 * @param fn Clean up function, guaranteed to be called only **once**.
 */
export function toDisposable(fn: () => void): IDisposable {
  const self = trackDisposable({
    dispose: createSingleCallFunction(() => {
      markAsDisposed(self);
      fn();
    }),
  });
  return self;
}

/**
 * Enables logging of potentially leaked disposables.
 *
 * A disposable is considered leaked if it is not disposed or not registered as the child of
 * another disposable. This tracking is very simple an only works for classes that either
 * extend Disposable or use a DisposableStore. This means there are a lot of false positives.
 */
const TRACK_DISPOSABLES = false;
let disposableTracker: IDisposableTracker | null = null;

export function setDisposableTracker(tracker: IDisposableTracker | null): void {
  disposableTracker = tracker;
}

if (TRACK_DISPOSABLES) {
  const __is_disposable_tracked__ = '__is_disposable_tracked__';
  setDisposableTracker(
    new (class implements IDisposableTracker {
      trackDisposable(x: IDisposable): void {
        const stack = new Error('Potentially leaked disposable').stack!;
        setTimeout(() => {
          if (!(x as any)[__is_disposable_tracked__]) {
            console.log(stack);
          }
        }, 3000);
      }

      setParent(child: IDisposable, parent: IDisposable | null): void {
        if (child && child !== Disposable.None) {
          try {
            (child as any)[__is_disposable_tracked__] = true;
          } catch {
            // noop
          }
        }
      }

      markAsDisposed(disposable: IDisposable): void {
        if (disposable && disposable !== Disposable.None) {
          try {
            (disposable as any)[__is_disposable_tracked__] = true;
          } catch {
            // noop
          }
        }
      }
      markAsSingleton(disposable: IDisposable): void {}
    })(),
  );
}

export function trackDisposable<T extends IDisposable>(x: T): T {
  disposableTracker?.trackDisposable(x);
  return x;
}

export function markAsDisposed(disposable: IDisposable): void {
  disposableTracker?.markAsDisposed(disposable);
}

export function setParentOfDisposable(
  child: IDisposable,
  parent: IDisposable | null,
): void {
  disposableTracker?.setParent(child, parent);
}

export function setParentOfDisposables(
  children: IDisposable[],
  parent: IDisposable | null,
): void {
  if (!disposableTracker) {
    return;
  }
  for (const child of children) {
    disposableTracker.setParent(child, parent);
  }
}

/**
 * Indicates that the given object is a singleton which does not need to be disposed.
 */
export function markAsSingleton<T extends IDisposable>(singleton: T): T {
  disposableTracker?.markAsSingleton(singleton);
  return singleton;
}

export function disposeOnReturn(fn: (store: DisposableStore) => void): void {
  const store = new DisposableStore();
  try {
    fn(store);
  } finally {
    store.dispose();
  }
}
