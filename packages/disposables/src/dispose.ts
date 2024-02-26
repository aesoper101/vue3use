import { IterableNS } from '@aesoper/shared';

import type { IDisposable } from './interface';

/**
 * Disposes of the value(s) passed in.
 */
export function dispose<T extends IDisposable>(disposable: T): T;
export function dispose<T extends IDisposable>(
  disposable: T | undefined,
): T | undefined;
export function dispose<
  T extends IDisposable,
  A extends Iterable<T> = Iterable<T>,
>(disposables: A): A;
export function dispose<T extends IDisposable>(disposables: Array<T>): Array<T>;
export function dispose<T extends IDisposable>(
  disposables: ReadonlyArray<T>,
): ReadonlyArray<T>;
export function dispose<T extends IDisposable>(
  arg: T | Iterable<T> | undefined,
): any {
  if (IterableNS.is(arg)) {
    const errors: any[] = [];

    for (const d of arg) {
      if (d) {
        try {
          d.dispose();
        } catch (e) {
          errors.push(e);
        }
      }
    }

    if (errors.length === 1) {
      throw errors[0];
    } else if (errors.length > 1) {
      throw new AggregateError(
        errors,
        'Encountered errors while disposing of store',
      );
    }

    return Array.isArray(arg) ? [] : arg;
  } else if (arg) {
    arg.dispose();
    return arg;
  }
}
